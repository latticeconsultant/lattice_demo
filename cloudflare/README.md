# Đưa site lên lattice.business

## Vì sao phải dùng Worker

Worker đứng trước tên miền, nhận yêu cầu rồi lấy nội dung từ GitHub Pages về trả
lại. Cách này giữ GitHub Pages làm nguồn: push lên `main` là site tự cập nhật,
không phải deploy lại Worker. Miễn phí trong hạn mức 100k request/ngày.

Site ban đầu chạy ở `lattice.business/demo` — GitHub Pages không phục vụ được ở
đường dẫn con, nên bắt buộc phải có Worker. Nay site đã chuyển về gốc tên miền,
Worker vẫn giữ vì nó đang đảm nhiệm thêm hai việc: chuyển hướng các link `/demo`
cũ, và xử lý thư mục con thiếu gạch chéo cuối.

| Cách khác | Đánh giá |
| --- | --- |
| Gắn custom domain thẳng vào GitHub Pages | Bỏ được Worker: thêm file `CNAME`, khai báo tên miền trong Pages, trỏ DNS. Nhưng mất phần chuyển hướng `/demo` cũ, phải làm lại bằng Redirect Rule của Cloudflare. |
| Cloudflare Pages | Phải chuyển toàn bộ hosting sang Cloudflare Pages. Nhiều bước hơn, lợi ích không rõ với một site tĩnh nhỏ. |

## Trạng thái

**Đang chạy.** Worker `lattice-demo` đã deploy, route `lattice.business/*`, tên
miền đã dùng nameserver Cloudflare. Thẻ `og:image` trong `index.html` đã trỏ về
`lattice.business/`. Push lên `main` là đủ — không cần làm lại các bước dưới.

Chỉ cần đọc tiếp khi sửa `worker.js`, hoặc khi dựng lại từ đầu trên tài khoản khác.

## Điều kiện trước khi deploy (đã làm)

1. **Trỏ nameserver về Cloudflare.** Thêm `lattice.business` vào tài khoản
   Cloudflare, rồi đổi nameserver ở nhà đăng ký tên miền sang cặp Cloudflare cấp.
   Thường mất vài giờ đến 24 giờ để có hiệu lực.

2. **Đăng nhập wrangler** (mở trình duyệt, không cần dán token):

   ```bash
   npm install -g wrangler && wrangler login
   ```

## Deploy

```bash
cd cloudflare && wrangler deploy
```

## Kiểm tra sau khi deploy

```bash
curl -sI https://lattice.business/ | head -1          # mong đợi: 200
curl -sI https://lattice.business/en/ | head -1       # mong đợi: 200
curl -sI https://lattice.business/dang-ky | head -1   # mong đợi: 301 (thiếu gạch chéo)
curl -sI https://lattice.business/demo/ | head -1     # mong đợi: 301 (link cũ)
curl -s https://lattice.business/ | grep -o '<title>[^<]*</title>'
```

## Điểm dễ sai nhất

Trang dùng **đường dẫn tương đối** (`assets/…`, `brand/…`; bản Anh dùng `../assets/…`).
Vào thư mục con mà thiếu gạch chéo cuối (`/dang-ky`, `/en`) thì trình duyệt giải
đường dẫn sai thư mục và toàn bộ ảnh, font, React hỏng hết. Worker đã xử lý bằng
cách chuyển tiếp chuyển hướng 301 của GitHub — đừng bỏ đoạn đó.

Tương tự, đừng bỏ đoạn chuyển hướng `/demo`: mã QR đã in và link đã gửi cho khách
vẫn trỏ vào địa chỉ cũ.
