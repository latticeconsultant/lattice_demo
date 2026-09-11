# Đưa site lên lattice.business/demo

## Vì sao phải dùng Worker

GitHub Pages gắn tên miền riêng thì phục vụ ở **gốc** tên miền — `lattice.business/`.
Nó không phục vụ được ở đường dẫn con `/demo`. Đây là giới hạn của GitHub Pages,
không phải cấu hình sai.

Ba cách đạt được `lattice.business/demo`:

| Cách | Đánh giá |
| --- | --- |
| **Worker proxy** (thư mục này) | Giữ GitHub Pages làm nguồn. Push lên `main` là site tự cập nhật, không cần deploy lại Worker. Miễn phí trong hạn mức 100k request/ngày. |
| Cloudflare Pages + rewrite rule | Phải chuyển toàn bộ hosting sang Cloudflare Pages. Nhiều bước hơn, lợi ích không rõ với một site tĩnh nhỏ. |
| Dùng `demo.lattice.business` thay vì `/demo` | Đơn giản nhất — chỉ cần một bản ghi CNAME, GitHub Pages hỗ trợ sẵn, không cần Worker. Nhưng địa chỉ khác yêu cầu. |

## Trạng thái

**Đang chạy.** Worker `lattice-demo` đã deploy, route `lattice.business/demo*`, tên
miền đã dùng nameserver Cloudflare. Thẻ `og:image` trong `index.html` đã trỏ về
`lattice.business/demo/`. Push lên `main` là đủ — không cần làm lại các bước dưới.

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
curl -sI https://lattice.business/demo | head -1          # mong đợi: 301
curl -sI https://lattice.business/demo/ | head -1         # mong đợi: 200
curl -sI https://lattice.business/demo/en/ | head -1      # mong đợi: 200
curl -s https://lattice.business/demo/ | grep -o '<title>[^<]*</title>'
```

## Điểm dễ sai nhất

Trang dùng **đường dẫn tương đối** (`assets/…`, `brand/…`; bản Anh dùng `../assets/…`).
Nếu vào `lattice.business/demo` hoặc `/demo/en` mà thiếu gạch chéo cuối, trình duyệt
sẽ giải đường dẫn sai thư mục và toàn bộ ảnh, font, React hỏng hết. Worker đã xử lý
bằng cách chuyển hướng 301 sang bản có gạch chéo — đừng bỏ đoạn đó.
