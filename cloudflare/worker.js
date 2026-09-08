// Đưa website lên lattice.business/demo
//
// Vì sao cần Worker: GitHub Pages gắn custom domain thì phục vụ ở GỐC tên miền
// (lattice.business/), không phục vụ được ở đường dẫn con /demo. Worker này đứng
// trước, nhận /demo/* rồi lấy nội dung từ GitHub Pages về trả lại — địa chỉ trên
// thanh URL vẫn là lattice.business/demo.
//
// Route cần gắn khi deploy: lattice.business/demo*

const UPSTREAM = 'https://latticeconsultant.github.io/lattice_demo';
const PREFIX = '/demo';

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // /demo (không có gạch chéo cuối) phải chuyển hướng sang /demo/.
    // Bắt buộc: trang dùng đường dẫn tương đối (assets/…, brand/…). Thiếu gạch
    // chéo thì trình duyệt giải ra lattice.business/assets/… — hỏng toàn bộ ảnh,
    // font và React.
    if (url.pathname === PREFIX) {
      url.pathname = PREFIX + '/';
      return Response.redirect(url.toString(), 301);
    }

    if (!url.pathname.startsWith(PREFIX + '/')) {
      return new Response('Not found', { status: 404 });
    }

    // /demo/assets/x.png  ->  <UPSTREAM>/assets/x.png
    const rest = url.pathname.slice(PREFIX.length);
    const target = UPSTREAM + rest + url.search;

    const upstream = await fetch(target, {
      method: request.method,
      headers: request.headers,
      redirect: 'follow',
    });

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
    return res;
  },
};
