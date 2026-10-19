// Đưa website lên lattice.business
//
// Vì sao cần Worker: GitHub Pages gắn custom domain thì phục vụ nội dung của
// repo ở gốc tên miền, nhưng tên miền này đang dùng DNS của Cloudflare và trước
// đó trỏ về trang parked của Hostinger. Worker đứng trước, nhận yêu cầu rồi lấy
// nội dung từ GitHub Pages về trả lại — không phải đổi DNS, không giữ bản sao.
//
// Route cần gắn khi deploy: lattice.business/*

const UPSTREAM = 'https://latticeconsultant.github.io/lattice_demo';
const UPSTREAM_PATH = '/lattice_demo';

// Site từng chạy ở lattice.business/demo. Mã QR đã in, link đã gửi cho khách và
// kết quả tìm kiếm vẫn còn trỏ vào đó, nên phải chuyển hướng chứ không bỏ mặc.
const CU = '/demo';

// ── Công tắc tính năng (trang /admin/) ─────────────────────────────────────────
// Danh sách tính năng đang TẮT lưu ở KV (binding SITE, khóa 'tat'). Worker gắn
// data-tat="<tên> <tên>…" lên thẻ <html> của mọi trang HTML; CSS trong trang chủ ẩn
// phần tử có lớp tn-<tên>. Gắn ngay ở biên nên không có lúc phần tử hiện rồi mới ẩn.
// Thêm tính năng mới: thêm một dòng ở đây + lớp tn-<tên> và luật CSS trong index.html.
const TINH_NANG = [
  { ten: 'nut-dat-lich', nhan: 'Nút "Đặt lịch chẩn đoán" trên thanh đầu trang và trong menu' },
  { ten: 'ngon-ngu', nhan: 'Nút chọn ngôn ngữ EN · VN · LO' },
  { ten: 'tieng-lao', nhan: 'Lựa chọn tiếng Lào (LO) trong nút ngôn ngữ' },
  { ten: 'ngay-dem', nhan: 'Nút đổi ngày / đêm' },
  { ten: 'cau-truc', nhan: 'Biểu tượng "Cấu trúc & Dashboard CEO"' },
  { ten: 'tu-soi', nhan: 'Biểu tượng "Tự soi · sáu câu hỏi"' },
  { ten: 'khao-sat', nhan: 'Biểu tượng "Khảo sát nhanh · 20 câu"' },
];
const TEN_HOP_LE = new Set(TINH_NANG.map((t) => t.ten));

// Đọc KV tối đa mỗi 30 giây mỗi isolate (KV là nhất quán dần, chậm vài giây cũng được).
let boNho = { het: 0, tat: [] };
async function docTat(env) {
  if (!env.SITE) return [];
  if (Date.now() < boNho.het) return boNho.tat;
  let tat = [];
  try {
    const v = await env.SITE.get('tat', 'json');
    if (Array.isArray(v)) tat = v.filter((x) => TEN_HOP_LE.has(x));
  } catch (e) { /* KV lỗi: coi như không tắt gì */ }
  boNho = { het: Date.now() + 30000, tat };
  return tat;
}

// ── Xác thực Cloudflare Access cho /admin/api/* ─────────────────────────────────
// Access đứng trước /admin, nhưng Worker vẫn tự kiểm JWT (chữ ký RS256, aud, iss, hạn).
let boNhoKhoa = { het: 0, khoa: new Map() };
const b64url = (x) => Uint8Array.from(atob(x.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
const docJson = (x) => JSON.parse(new TextDecoder().decode(b64url(x)));

async function emailAccess(request, env) {
  const jwt = request.headers.get('cf-access-jwt-assertion');
  if (!jwt || !env.ACCESS_TEAM || !env.ACCESS_AUD) return null;
  try {
    const [dau, than, chuKy] = jwt.split('.');
    const h = docJson(dau);
    if (h.alg !== 'RS256') return null;
    if (Date.now() > boNhoKhoa.het || !boNhoKhoa.khoa.has(h.kid)) {
      const tl = await fetch(`https://${env.ACCESS_TEAM}.cloudflareaccess.com/cdn-cgi/access/certs`);
      const { keys } = await tl.json();
      const khoa = new Map();
      for (const k of keys) {
        khoa.set(k.kid, await crypto.subtle.importKey('jwk', k, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']));
      }
      boNhoKhoa = { het: Date.now() + 3600000, khoa };
    }
    const k = boNhoKhoa.khoa.get(h.kid);
    if (!k) return null;
    const dung = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', k, b64url(chuKy), new TextEncoder().encode(`${dau}.${than}`));
    if (!dung) return null;
    const p = docJson(than);
    const aud = Array.isArray(p.aud) ? p.aud : [p.aud];
    const giay = Date.now() / 1000;
    if (!aud.includes(env.ACCESS_AUD) || p.iss !== `https://${env.ACCESS_TEAM}.cloudflareaccess.com`) return null;
    if (typeof p.exp !== 'number' || p.exp < giay || !p.email) return null;
    return String(p.email).toLowerCase();
  } catch (e) {
    return null;
  }
}

const traJson = (than, status = 200) => new Response(JSON.stringify(than), {
  status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});

// ── Đăng nhập bằng email + mật khẩu (thay cho Access nếu chưa cấu hình) ─────────
// Secret ADMIN_DANG_NHAP = JSON {email, muoi, bam, vong} — chỉ có bản băm PBKDF2-SHA256,
// đặt bằng `node dat-mat-khau-admin.mjs` (anh tự gõ mật khẩu; không nằm trong repo).
// Secret ADMIN_BI_MAT = chuỗi ngẫu nhiên ký cookie phiên. Phiên 8 giờ, cookie HttpOnly, Path=/admin.
const PHIEN_GIAY = 8 * 3600;
const hex = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
const tuHex = (h) => Uint8Array.from(h.match(/../g) || [], (x) => parseInt(x, 16));
const b64 = (x) => btoa(String.fromCharCode(...new TextEncoder().encode(x))).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
const tuB64 = (x) => new TextDecoder().decode(b64url(x));

async function hmac(env, du) {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.ADMIN_BI_MAT), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(du)));
}

function soSanh(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

async function emailPhien(request, env) {
  if (!env.ADMIN_BI_MAT) return null;
  const m = (request.headers.get('cookie') || '').match(/(?:^|;\s*)lnx_admin=([^;]+)/);
  if (!m) return null;
  const [than, ky] = m[1].split('.');
  if (!than || !ky || !soSanh(await hmac(env, than), ky)) return null;
  try {
    const p = JSON.parse(tuB64(than));
    return p.het > Date.now() / 1000 ? p.email : null;
  } catch (e) { return null; }
}

async function apiDangNhap(request, env, url) {
  if (request.method !== 'POST') return traJson({ loi: 'khong_ho_tro' }, 405);
  if (request.headers.get('origin') !== url.origin) return traJson({ loi: 'sai_nguon_goc' }, 403);
  if (!env.ADMIN_DANG_NHAP || !env.ADMIN_BI_MAT || !env.SITE) return traJson({ loi: 'chua_cau_hinh' }, 503);
  // Chặn đoán mật khẩu: tối đa 5 lần sai mỗi IP trong 15 phút.
  const ip = request.headers.get('cf-connecting-ip') || 'x';
  const khoaSai = 'sai:' + ip;
  const soSai = Number(await env.SITE.get(khoaSai)) || 0;
  if (soSai >= 5) return traJson({ loi: 'tam_khoa', phu: 'Sai quá 5 lần. Thử lại sau 15 phút.' }, 429);
  let than;
  try { than = await request.json(); } catch (e) { return traJson({ loi: 'du_lieu_sai' }, 422); }
  let cfg;
  try { cfg = JSON.parse(env.ADMIN_DANG_NHAP); } catch (e) { return traJson({ loi: 'chua_cau_hinh' }, 503); }
  const email = String(than.email || '').trim().toLowerCase();
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(String(than.mat_khau || '')), 'PBKDF2', false, ['deriveBits']);
  const bam = hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: tuHex(cfg.muoi), iterations: cfg.vong }, k, 256));
  if (!(soSanh(email, cfg.email) & soSanh(bam, cfg.bam))) {
    await env.SITE.put(khoaSai, String(soSai + 1), { expirationTtl: 900 });
    return traJson({ loi: 'sai_dang_nhap', phu: 'Email hoặc mật khẩu không đúng.' }, 401);
  }
  const p = b64(JSON.stringify({ email, het: Math.floor(Date.now() / 1000) + PHIEN_GIAY }));
  const res = traJson({ ok: true, email });
  res.headers.append('set-cookie', `lnx_admin=${p}.${await hmac(env, p)}; Path=/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=${PHIEN_GIAY}`);
  return res;
}

function apiDangXuat() {
  const res = traJson({ ok: true });
  res.headers.append('set-cookie', 'lnx_admin=; Path=/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=0');
  return res;
}

async function apiCauHinh(request, env, url) {
  const email = (await emailPhien(request, env)) || (await emailAccess(request, env));
  if (!email) return traJson({ loi: 'chua_dang_nhap' }, 401);
  if (!env.SITE) return traJson({ loi: 'thieu_kv' }, 500);
  if (request.method === 'GET') {
    const tat = await env.SITE.get('tat', 'json');
    const lich = (await env.SITE.get('lich_su', 'json')) || [];
    return traJson({ email, tinh_nang: TINH_NANG, tat: Array.isArray(tat) ? tat : [], lich_su: lich.slice(0, 20) });
  }
  if (request.method === 'POST') {
    if (request.headers.get('origin') !== url.origin) return traJson({ loi: 'sai_nguon_goc' }, 403);
    let than;
    try { than = await request.json(); } catch (e) { return traJson({ loi: 'du_lieu_sai' }, 422); }
    if (!than || !Array.isArray(than.tat) || than.tat.some((x) => !TEN_HOP_LE.has(x))) return traJson({ loi: 'du_lieu_sai' }, 422);
    const tat = [...new Set(than.tat)];
    const lich = (await env.SITE.get('lich_su', 'json')) || [];
    lich.unshift({ luc: new Date().toISOString(), email, tat });
    await env.SITE.put('tat', JSON.stringify(tat));
    await env.SITE.put('lich_su', JSON.stringify(lich.slice(0, 50)));
    boNho = { het: 0, tat: [] };
    return traJson({ ok: true, tat });
  }
  return traJson({ loi: 'khong_ho_tro' }, 405);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/admin/api/cau-hinh') return apiCauHinh(request, env, url);
    if (url.pathname === '/admin/api/dang-nhap') return apiDangNhap(request, env, url);
    if (url.pathname === '/admin/api/dang-xuat') return apiDangXuat();

    // /demo, /demo/, /demo/dang-ky/ … → bỏ tiền tố, giữ nguyên phần còn lại.
    if (url.pathname === CU || url.pathname.startsWith(CU + '/')) {
      url.pathname = url.pathname.slice(CU.length) || '/';
      return Response.redirect(url.toString(), 301);
    }

    const target = UPSTREAM + url.pathname + url.search;

    // 'manual', không phải 'follow'. Thư mục con thiếu gạch chéo (/dang-ky) thì
    // GitHub trả 301 sang /dang-ky/. Nếu Worker tự đi theo, nội dung được trả
    // ngay tại /dang-ky và "../assets/…" bị giải sai thư mục — hỏng toàn bộ ảnh,
    // font và React. Phải chuyển tiếp chuyển hướng cho trình duyệt, đổi địa chỉ
    // GitHub về lại tên miền của mình.
    const upstream = await fetch(target, {
      method: request.method,
      headers: request.headers,
      redirect: 'manual',
    });

    const location = upstream.headers.get('location');
    if (upstream.status >= 300 && upstream.status < 400 && location) {
      const to = new URL(location, target);
      if (to.origin + to.pathname.slice(0, UPSTREAM_PATH.length) === UPSTREAM) {
        url.pathname = to.pathname.slice(UPSTREAM_PATH.length) || '/';
        url.search = to.search;
        return Response.redirect(url.toString(), upstream.status);
      }
      return Response.redirect(to.toString(), upstream.status);
    }

    // Sao chép response để sửa được header.
    const res = new Response(upstream.body, upstream);

    // GitHub Pages đặt cache 600s. Ảnh và font ở đây có tên cố định, để lâu hơn
    // cho nhẹ; riêng HTML giữ ngắn để anh push là thấy đổi.
    const type = res.headers.get('content-type') || '';
    if (/^(image|font)\/|javascript|css/.test(type)) {
      res.headers.set('cache-control', 'public, max-age=86400');
    } else if (type.includes('text/html')) {
      res.headers.set('cache-control', 'public, max-age=300');
    }

    res.headers.delete('x-github-request-id');

    // Gắn công tắc lên <html> của trang HTML (trừ trang admin — admin luôn thấy đủ).
    if (type.includes('text/html') && !url.pathname.startsWith('/admin')) {
      const tat = await docTat(env);
      if (tat.length) {
        res.headers.set('cache-control', 'public, max-age=60');
        return new HTMLRewriter()
          .on('html', { element(el) { el.setAttribute('data-tat', tat.join(' ')); } })
          .transform(res);
      }
    }
    return res;
  },
};
