# LATTICE Next — Bộ nhận diện

Công ty Cổ phần Giải pháp LATTICE Next
LATTICE Next Solutions Joint Stock Company

Tagline (VI): **Kiến trúc mô hình kinh doanh mới.**
Tagline (EN): **Structure for what comes next.**

---

## 1. Ý nghĩa dấu hiệu

Ô lưới hình thoi: bốn nút rỗng ở bốn đỉnh là các agent, nút đặc màu đỏ ở tâm là con người — người giữ quyền quyết định. Cấu trúc đọc được ở mọi kích thước và là nguồn gốc của toàn bộ hoa văn nền.

## 2. Danh mục file

### SVG (vector — dùng cho in ấn, biển hiệu, mọi kích thước)
| File | Dùng khi |
| --- | --- |
| lattice-mark.svg | Dấu hiệu trên nền sáng |
| lattice-mark-white.svg | Dấu hiệu trên nền tối (nút tâm vẫn đỏ) |
| lattice-mark-mono-ink.svg | Một màu mực — in đen trắng, khắc, dập nổi |
| lattice-mark-mono-white.svg | Một màu trắng — trên nền ảnh tối, nền đỏ |
| lattice-mark-on-ink.svg | Dấu hiệu kèm nền mực (ô vuông) |
| lattice-mark-on-red.svg | Dấu hiệu kèm nền đỏ (ô vuông) |
| lattice-lockup.svg | Khóa ngang đầy đủ, nền sáng |
| lattice-lockup-white.svg | Khóa ngang, nền tối |
| lattice-lockup-on-ink.svg | Khóa ngang kèm nền mực |
| lattice-lockup-on-red.svg | Khóa ngang kèm nền đỏ |

Lưu ý: phần chữ trong file lockup dùng font Archivo. Máy nào chưa cài Archivo sẽ hiển thị font thay thế — cài Archivo (miễn phí, Google Fonts) trước khi mở, hoặc dùng bản PNG.

### PNG (nền trong suốt)
- Dấu hiệu: 64 / 128 / 256 / 512 / 1024 / 2048 px — bản mực và bản trắng
- Bản đặc biệt 1024 px: trên nền mực, trên nền đỏ, một màu mực, một màu trắng

### Favicon & app icon
16 / 32 / 48 / 64 / 180 / 192 / 512 px — nền giấy #F3F2F2, dấu hiệu chiếm 82% khung.
- 16–48: favicon trình duyệt
- 180: apple-touch-icon
- 192 & 512: PWA / Android

## 3. Vùng an toàn và kích thước tối thiểu

- Vùng an toàn quanh logo bằng đường kính một nút (12% cạnh dấu hiệu).
- Kích thước nhỏ nhất: dấu hiệu 20 px; khóa ngang 120 px chiều rộng.
- Dưới 20 px chỉ dùng bản favicon (đã bù nét).

## 4. Màu

| Vai trò | HEX | RGB | Dùng cho |
| --- | --- | --- | --- |
| Đỏ tín hiệu | #EC3013 | 236 48 19 | Con người, hành động chính, ngưỡng cần chú ý, ranh giới quyền quyết định |
| Mực | #201E1D | 32 30 29 | Chữ, đường kẻ, khối cấu trúc |
| Trung tính 700 | #605D5D | 96 93 93 | Chữ phụ, chú thích |
| Trung tính 400 | #BAB6B6 | 186 182 182 | Đường kẻ, viền |
| Nền phụ | #EAE9E9 | 234 233 233 | Khối nội dung xen kẽ |
| Nền chủ đạo | #F3F2F2 | 243 242 242 | Nền trang |

Quy tắc: mực và trung tính mang toàn bộ cấu trúc và dữ liệu. Đỏ là màu hiếm — nếu đỏ chiếm hơn 5% diện tích, nó không còn nghĩa. Chữ cỡ thân bài màu đỏ phải dùng bậc đậm #AE1800 để đủ tương phản.

Xem file: color/lattice-palette.png

## 5. Chữ

Một bộ chữ duy nhất: **Archivo** (Google Fonts, miễn phí thương mại).
- Hiển thị / tiêu đề: Archivo 800, letter-spacing −0.025em
- Thân bài: Archivo 400, line-height 1.6–1.7
- Số liệu, nhãn kỹ thuật: Archivo 600, letter-spacing 0.04–0.2em, viết hoa

## 6. Nguyên tắc bố cục

- Lưới mô-đun: các ô bằng nhau, chia bằng đường kẻ 2px, không bo góc (bán kính 0).
- Mọi thứ căn trái — tiêu đề, thân bài, cả nhãn bên trong nút rộng.
- Không đổ bóng trang trí, không gradient.
- Ảnh luôn in trắng đen.

## 7. Không được làm

1. Đổi màu nút tâm sang màu khác đỏ — nút tâm luôn là con người.
2. Kéo giãn, nghiêng, thêm đổ bóng hoặc gradient lên dấu hiệu.
3. Đặt logo lên ảnh nhiều chi tiết mà không có lớp phủ mực.
4. Viết tên là "Lattice" chữ thường trong văn bản chính thức — luôn là LATTICE.
5. Bo góc bất kỳ thành phần nào.

## 8. Giọng nói thương hiệu

Điềm tĩnh, có số liệu, nói thẳng cả điều bất lợi. Không hô khẩu hiệu, không hứa "tự động hóa 100%".

## 9. Định hướng nhiếp ảnh

Bốn quy tắc: có cấu trúc nhìn thấy được (giàn, lưới, nhịp cột, mặt đứng); ít người, không diễn; ánh sáng tự nhiên, tương phản vừa; luôn in trắng đen.

## 10. Nội dung thư mục

```
brand/
  README.md               ← tài liệu này
  logo/svg/               10 file vector
  logo/png/               16 file PNG nền trong suốt
  logo/favicon/           7 kích thước icon
  color/lattice-palette.png
website/
  LATTICE-Next-Website.html   website đầy đủ, 1 file, chạy offline
  hero-lattice.png            ảnh hero gốc
```
