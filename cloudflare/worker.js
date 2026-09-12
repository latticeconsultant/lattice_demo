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

export default {
  async fetch(request) {
    const url = new URL(request.url);

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
    return res;
  },
};
