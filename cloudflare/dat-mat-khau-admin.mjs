#!/usr/bin/env node
// Đặt (hoặc đổi) email + mật khẩu đăng nhập trang lattice.business/admin.
// Cũng là cách cứu khi quên mật khẩu đã đổi trên trang.
//
//   cd cloudflare && node dat-mat-khau-admin.mjs
//
// Mật khẩu gõ ẩn trong Terminal, chỉ bản băm PBKDF2-SHA256 (muối ngẫu nhiên, 100.000 vòng)
// được lưu lên Cloudflare làm secret ADMIN_DANG_NHAP của Worker lattice-demo.
// Lần đầu chạy còn tạo ADMIN_BI_MAT (khóa ký cookie phiên). Đổi mật khẩu = chạy lại;
// thêm cờ --dang-xuat-het để đổi cả ADMIN_BI_MAT, mọi phiên đang mở bị đăng xuất.
import { pbkdf2Sync, randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import readline from 'node:readline';

function hoi(cauHoi, an = false) {
  return new Promise((ok) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (an) rl._writeToOutput = (s) => { if (s.includes(cauHoi)) process.stdout.write(s); };
    rl.question(cauHoi, (tl) => { rl.close(); if (an) process.stdout.write('\n'); ok(tl); });
  });
}

function datSecret(ten, giaTri) {
  const r = spawnSync('npx', ['wrangler', 'secret', 'put', ten], { input: giaTri, stdio: ['pipe', 'inherit', 'inherit'] });
  if (r.status !== 0) { console.error(`Không đặt được ${ten}.`); process.exit(1); }
}

const email = (await hoi('Email đăng nhập: ')).trim().toLowerCase();
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { console.error('Email không hợp lệ.'); process.exit(1); }
const mk = await hoi('Mật khẩu (gõ ẩn): ', true);
if (mk.length < 10) { console.error('Mật khẩu cần ít nhất 10 ký tự.'); process.exit(1); }
if ((await hoi('Gõ lại mật khẩu: ', true)) !== mk) { console.error('Hai lần gõ không khớp.'); process.exit(1); }

const muoi = randomBytes(16).toString('hex');
const vong = 100000; // trần PBKDF2 của Cloudflare Workers
const bam = pbkdf2Sync(mk, Buffer.from(muoi, 'hex'), vong, 32, 'sha256').toString('hex');

datSecret('ADMIN_DANG_NHAP', JSON.stringify({ email, muoi, bam, vong }));
const coSan = spawnSync('npx', ['wrangler', 'secret', 'list'], { encoding: 'utf8' }).stdout || '';
if (process.argv.includes('--dang-xuat-het') || !coSan.includes('ADMIN_BI_MAT')) {
  datSecret('ADMIN_BI_MAT', randomBytes(32).toString('hex'));
}
// Mật khẩu đổi trên trang (KV 'dang_nhap') được ưu tiên hơn secret — xoá để secret vừa đặt có hiệu lực.
spawnSync('npx', ['wrangler', 'kv', 'key', 'delete', 'dang_nhap', '--binding', 'SITE', '--remote'], { stdio: 'ignore' });
console.log(`\nXong. Đăng nhập tại https://lattice.business/admin/ bằng ${email}.`);
