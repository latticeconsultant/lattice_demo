#!/usr/bin/env node
// Nối thẻ "Hồ sơ đăng ký" của lattice.business/admin với Apps Script (Google Sheet đăng ký).
//
//   cd cloudflare && node dat-token-ho-so.mjs
//
// Sinh một mã truy cập MỚI, lưu thành secret APPS_SCRIPT_TOKEN của Worker lattice-demo và
// chép vào clipboard (không in ra màn hình). Sau đó dán mã vào Apps Script → ⚙️ Cài đặt dự án →
// Thuộc tính tập lệnh → ADMIN_TOKEN (thay giá trị cũ) → Lưu. Không cần triển khai lại Apps Script:
// thuộc tính có hiệu lực ngay. Mã cũ hết dùng được từ lúc đó.
//
//   node dat-token-ho-so.mjs --kiem    kiểm mã đang nằm trong clipboard có được Apps Script nhận chưa.
//
// Trang đăng ký và webhook SePay không dùng ADMIN_TOKEN nên không bị ảnh hưởng.
import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const URL_AS = (readFileSync(new URL('./wrangler.toml', import.meta.url), 'utf8').match(/APPS_SCRIPT_URL\s*=\s*"([^"]+)"/) || [])[1];
if (!URL_AS) { console.error('Thiếu APPS_SCRIPT_URL trong wrangler.toml.'); process.exit(1); }

async function kiem(token) {
  const tl = await fetch(URL_AS + '?' + new URLSearchParams({ token, viec: 'phienBan' }));
  try { return JSON.parse(await tl.text()); } catch (e) { return { ok: false, loi: 'Apps Script trả dữ liệu lạ' }; }
}

if (process.argv.includes('--kiem')) {
  const token = spawnSync('pbpaste', { encoding: 'utf8' }).stdout.trim();
  const kq = await kiem(token);
  console.log(kq.ok ? `Apps Script đã nhận mã mới · phiên bản ${kq.phienBan}` : `Chưa nhận: ${kq.loi || 'không rõ'}`);
  process.exit(kq.ok ? 0 : 1);
}

const token = randomBytes(32).toString('hex');
const r = spawnSync('npx', ['wrangler', 'secret', 'put', 'APPS_SCRIPT_TOKEN'], { input: token, stdio: ['pipe', 'inherit', 'inherit'] });
if (r.status !== 0) { console.error('Không đặt được secret APPS_SCRIPT_TOKEN.'); process.exit(1); }
spawnSync('pbcopy', { input: token });
console.log(`
Đã lưu mã mới cho Worker và chép vào clipboard.
Giờ dán vào Apps Script → ⚙️ Cài đặt dự án → Thuộc tính tập lệnh → ADMIN_TOKEN → Lưu.
Kiểm tra: node dat-token-ho-so.mjs --kiem`);
