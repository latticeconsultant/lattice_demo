# LATTICE Next Solutions — Website

Công ty Cổ phần Giải pháp LATTICE Next
*Kiến trúc mô hình kinh doanh mới. — Structure for what comes next.*

Website giới thiệu 8 trang, chạy hoàn toàn tĩnh (không cần backend, không cần build).

**Demo:** https://koalaland-workplace.github.io/LATTICE/

---

## 1. Nội dung website

| Trang | Nội dung |
| --- | --- |
| Trang chủ | Luận điểm, 4 bước Chẩn đoán → Kiến trúc → Triển khai → Vận hành, bốn động cơ |
| Xu hướng tương lai | Số liệu thị trường, biểu đồ, mốc pháp lý |
| Next Solutions | Bộ máy AI: quyền hạn, mức tự chủ, hạ tầng bảy lớp |
| Ngành & Mô hình | Tám nhóm mô hình kinh doanh và trần tự động hóa của từng nhóm |
| Cách chúng tôi làm | Phương pháp, cam kết, cách đo kết quả |
| Phương pháp triển khai | Từ khung chiến lược sang đề án triển khai |
| Branding | Bộ nhận diện LATTICE Next |
| Liên hệ | Biểu mẫu đặt lịch chẩn đoán 60 phút, FAQ |

Thanh đen trên cùng là **khung xem thử**: chuyển LAPTOP / TABLET / PHONE để soi bố cục responsive, nút IN / PDF để in bản đề xuất. Thanh này tự ẩn khi in.

## 2. Chạy tại máy

Mở trực tiếp `index.html` bằng trình duyệt là chạy được. Nếu muốn chạy qua HTTP:

```bash
python3 -m http.server 8000
```

Rồi mở http://localhost:8000

Bản một-file để gửi qua email hoặc xem offline hoàn toàn: `offline/LATTICE-Next-Website.html` (9,4 MB, tự giải nén, không cần thư mục kèm theo).

## 3. Cấu trúc thư mục

```
index.html                  trang web (SPA 8 trang, dc-runtime + React 18)
assets/
  js/dc-runtime.js          runtime render template
  js/modernist-ds.js        design system Modernist
  vendor/                   React 18.3.1 + ReactDOM (bản local, chạy được offline)
  fonts/                    Archivo woff2 — latin, latin-ext, vietnamese
  img/                      3 ảnh nội dung (đã in trắng đen theo brand)
brand/                      bộ nhận diện đầy đủ — xem brand/README.md
  logo/svg/                 10 file vector
  logo/png/                 16 file PNG nền trong suốt
  logo/favicon/             7 kích thước icon
  color/lattice-palette.png
offline/                    bản một-file tự giải nén
```

Không có bước build, không có dependency cần cài. Mọi thứ đã nằm trong repo.

## 4. Deploy GitHub Pages

Settings → Pages → Source: **Deploy from a branch** → Branch `main`, thư mục `/ (root)` → Save.
Khoảng 1–2 phút sau site lên tại https://koalaland-workplace.github.io/LATTICE/

File `.nojekyll` đã có sẵn để GitHub phục vụ nguyên trạng, không qua Jekyll.

## 5. Việc còn phải làm trước khi công bố chính thức

Đây là **bản mô tả giao diện** — hai chỗ còn để trống, cần điền trước khi đưa cho khách hàng thật:

- **Thông tin liên hệ** (trang Liên hệ): email, điện thoại/Zalo, địa chỉ đang là `[chưa cấu hình]`.
- **Biểu mẫu chẩn đoán**: nút GỬI YÊU CẦU chưa nối backend — cần trỏ về Formspree, Google Form hoặc endpoint riêng.

Ngoài ra, ba ảnh PNG nặng ~2 MB mỗi file; nếu cần tải nhanh hơn nên chuyển sang WebP trước khi chạy quảng cáo.

## 6. Thương hiệu

Đọc `brand/README.md` trước khi dùng logo hoặc màu. Ba quy tắc hay bị vi phạm nhất:

1. Nút tâm của dấu hiệu **luôn đỏ** — đó là con người.
2. Đỏ chiếm quá 5% diện tích là mất nghĩa.
3. Không bo góc bất kỳ thành phần nào.

---

Màu: đỏ tín hiệu `#EC3013` · mực `#201E1D` · nền `#F3F2F2`
Chữ: Archivo (Google Fonts)
