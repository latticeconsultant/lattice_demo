/**
 * Sinh khoá đăng nhập cho trang quản trị.
 *
 *   node tools/make-admin-key.mjs <tên đăng nhập> <mật khẩu> <muối> <ADMIN_TOKEN>
 *
 * In ra bốn dòng để dán vào quan-tri/index.html.
 *
 * Vì sao phải mã hoá: trang quản trị cần ADMIN_TOKEN để gọi Apps Script. Dán
 * thẳng token vào mã nguồn thì ai mở trang cũng đọc được, cổng đăng nhập thành
 * vô nghĩa và toàn bộ dữ liệu khách nằm ngoài trời. Ở đây token được mã hoá
 * AES-GCM bằng khoá dẫn xuất từ chính mật khẩu đăng nhập: nhập đúng mật khẩu
 * thì tự mở khoá, không có mật khẩu thì đoạn đó chỉ là ký tự vô nghĩa.
 *
 * Giới hạn cần biết: 210.000 vòng PBKDF2 làm việc dò mật khẩu tốn kém chứ không
 * làm nó bất khả thi. Mật khẩu yếu thì lớp này cũng yếu.
 */

import { webcrypto as crypto } from 'node:crypto';

const [nguoi, matKhau, muoi, token] = process.argv.slice(2);
if (!nguoi || !matKhau || !muoi || !token) {
  console.error('Dùng: node tools/make-admin-key.mjs <user> <pass> <muoi> <token>');
  process.exit(1);
}

const b64 = (u8) => Buffer.from(u8).toString('base64');
const enc = new TextEncoder();

const bam = await crypto.subtle.digest('SHA-256', enc.encode(nguoi + ':' + matKhau + muoi));
const BAM = [...new Uint8Array(bam)].map((b) => b.toString(16).padStart(2, '0')).join('');

const muoiKhoa = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const goc = await crypto.subtle.importKey('raw', enc.encode(matKhau), 'PBKDF2', false, ['deriveKey']);
const khoa = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', salt: muoiKhoa, iterations: 210000, hash: 'SHA-256' },
  goc, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
const ma = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, khoa, enc.encode(token));

console.log('Dán bốn dòng này vào quan-tri/index.html:\n');
console.log(`var BAM    = '${BAM}';`);
console.log(`var MUOI   = '${muoi}';`);
console.log(`var KHO_MA = { muoi: '${b64(muoiKhoa)}', iv: '${b64(iv)}', ma: '${b64(new Uint8Array(ma))}' };`);
console.log(`\nTên đăng nhập: ${nguoi}`);
console.log('Mật khẩu và token KHÔNG nằm trong bốn dòng trên.');
