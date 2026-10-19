#!/usr/bin/env node
// Nối thẻ "Hồ sơ đăng ký" của lattice.business/admin với Apps Script (Google Sheet đăng ký).
//
//   cd cloudflare && node dat-token-ho-so.mjs
//
// Hỏi tên đăng nhập + mật khẩu của trang /quan-tri/ CŨ (gõ ẩn), tự mở khoá mã truy cập ADMIN_TOKEN
// ngay trên máy này — đúng cách trang cũ vẫn làm trong trình duyệt — rồi lưu mã đó thành secret
// APPS_SCRIPT_TOKEN của Worker lattice-demo. Mật khẩu không gửi đi đâu.
//
//   node dat-token-ho-so.mjs --dan-tay     dán thẳng ADMIN_TOKEN (Apps Script → Cài đặt dự án →
//                                           Thuộc tính tập lệnh) nếu không nhớ mật khẩu cũ.
import { createHash, pbkdf2Sync, createDecipheriv } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import readline from 'node:readline';

const URL_AS = (readFileSync(new URL('./wrangler.toml', import.meta.url), 'utf8').match(/APPS_SCRIPT_URL\s*=\s*"([^"]+)"/) || [])[1];
if (!URL_AS) { console.error('Thiếu APPS_SCRIPT_URL trong wrangler.toml.'); process.exit(1); }

// Khoá gốc của trang /quan-tri/ cũ (bản băm + khối mã hoá, không có mật khẩu) — dùng khi
// mật khẩu chưa từng đổi trên trang cũ (Apps Script trả khoa: null).
const KHOA_GOC = {
  bam: 'f76cc2182ad5fa1b075f605b0b5019063d60974e6765c62531c9818c8d2314a1',
  muoi: ':LATTICE-QT-2026',
  kho: { muoi: 'HhuOW6T++1p9kpQOzd7aKg==', iv: 'BeFX3nI3jzTK59WB', ma: 'JhEtbnDQUDJ7TuIv6TX4dO4EJdp+lBobl22qw6z+ZNJxxZ126zpzj5PycnVjUgl3' },
};

function hoi(cauHoi, an = false) {
  return new Promise((ok) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (an) rl._writeToOutput = (s) => { if (s.includes(cauHoi)) process.stdout.write(s); };
    rl.question(cauHoi, (tl) => { rl.close(); if (an) process.stdout.write('\n'); ok(tl); });
  });
}

const goi = async (q) => JSON.parse(await (await fetch(URL_AS + '?' + new URLSearchParams(q))).text());

function moKhoa(matKhau, kho) {
  try {
    const khoa = pbkdf2Sync(matKhau, Buffer.from(kho.muoi, 'base64'), 210000, 32, 'sha256');
    const goc = Buffer.from(kho.ma, 'base64');
    const d = createDecipheriv('aes-256-gcm', khoa, Buffer.from(kho.iv, 'base64'));
    d.setAuthTag(goc.subarray(goc.length - 16));
    return Buffer.concat([d.update(goc.subarray(0, goc.length - 16)), d.final()]).toString('utf8');
  } catch (e) { return ''; }
}

let token = '';
if (process.argv.includes('--dan-tay')) {
  token = (await hoi('Dán ADMIN_TOKEN (gõ ẩn): ', true)).trim();
} else {
  const u = (await hoi('Tên đăng nhập trang quản trị cũ: ')).trim();
  const mk = await hoi('Mật khẩu (gõ ẩn): ', true);
  const kq = await goi({ viec: 'layKhoaDangNhap' });
  const k = (kq && kq.ok && kq.khoa) || KHOA_GOC;
  if (createHash('sha256').update(u + ':' + mk + k.muoi).digest('hex') !== k.bam) {
    console.error('Sai tên đăng nhập hoặc mật khẩu. Có thể dùng --dan-tay.'); process.exit(1);
  }
  token = moKhoa(mk, k.kho);
}
if (!token) { console.error('Không mở được mã truy cập.'); process.exit(1); }

const thu = await goi({ token, viec: 'phienBan' });
if (!thu.ok) { console.error('Apps Script từ chối mã này: ' + (thu.loi || 'không rõ')); process.exit(1); }
console.log('Apps Script nhận mã · phiên bản ' + thu.phienBan);

const r = spawnSync('npx', ['wrangler', 'secret', 'put', 'APPS_SCRIPT_TOKEN'], { input: token, stdio: ['pipe', 'inherit', 'inherit'] });
if (r.status !== 0) { console.error('Không đặt được secret APPS_SCRIPT_TOKEN.'); process.exit(1); }
console.log('\nXong. Mở https://lattice.business/admin/#ho-so');
