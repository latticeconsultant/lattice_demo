# LATTICE Next Solutions — Website

Công ty Cổ phần Giải pháp LATTICE Next
*Kiến trúc mô hình kinh doanh mới. — Structure for what comes next.*

Website giới thiệu 10 trang, song ngữ Việt / Anh, chạy hoàn toàn tĩnh (không cần backend).

**Demo:** https://lattice.business/demo/ · bản tiếng Anh: https://lattice.business/demo/en/

---

## 1. Nội dung website

Đầu trang chủ là khung đọc **Tài liệu nền tảng** "Doanh nghiệp một người" (21 mục, có mục lục và nút lưu PDF) — xem tự do. Mười trang dưới đây nằm sau rào mật khẩu (xem mục 6).

| Trang | Nội dung |
| --- | --- |
| Trang chủ | Luận điểm, 4 bước Chẩn đoán → Kiến trúc → Triển khai → Vận hành, bốn động cơ |
| Xu hướng tương lai | Số liệu thị trường, biểu đồ, mốc pháp lý |
| Next Solutions | Bộ máy AI: quyền hạn, mức tự chủ, hạ tầng bảy lớp; bốn động cơ chi tiết (Social, Marketing, CRM, R&D) |
| Ngành & Mô hình | Tám nhóm mô hình kinh doanh và trần tự động hóa của từng nhóm |
| Cách chúng tôi làm | Phương pháp, cam kết, cách đo kết quả |
| Phương pháp triển khai | Từ khung chiến lược sang đề án triển khai; quản trị ra quyết định cho nhóm 2–3–5 người |
| Blockchain & Công nghệ tài chính | Mốc pháp lý tài sản số, vòng khép kín dòng tiền, sáu năng lực tài chính, ba tầng chuẩn bị |
| Academy | Ba lộ trình đào tạo A/B/C, chuyên đề theo ngành, hình thức |
| Branding | Bộ nhận diện LATTICE Next |
| Liên hệ | Biểu mẫu đặt lịch chẩn đoán 60 phút, FAQ |

Thanh đen trên cùng là **khung xem thử**: chuyển LAPTOP / TABLET / PHONE để soi bố cục responsive, nút IN / PDF để in bản đề xuất. Thanh này tự ẩn khi in.

Nút **EN / VI** ở header là liên kết thật giữa `index.html` và `en/index.html`, không phải nút đổi trạng thái — chia sẻ được đúng link theo ngôn ngữ.

## 2. Chạy tại máy

```bash
python3 -m http.server 8000
```

Rồi mở http://localhost:8000 (bản Việt) hoặc http://localhost:8000/en/ (bản Anh). Nên chạy qua HTTP thay vì mở thẳng file, vì bản Anh nạp tài nguyên từ thư mục cha.

## 3. Cấu trúc thư mục

```
index.html                  bản tiếng Việt — NGUỒN DUY NHẤT, mọi chỉnh sửa làm ở đây
en/index.html               bản tiếng Anh — SINH TỰ ĐỘNG, không sửa tay
docs/
  doanh-nghiep-mot-nguoi.md   tài liệu nền tảng, bản Việt
  one-person-business.en.md   tài liệu nền tảng, bản Anh (bản địa hóa, không dịch máy)
tools/
  build-doc.py              dựng khung tài liệu từ markdown vào index.html
  build-en.py               sinh en/index.html từ index.html + từ điển
  extract-strings.py        trích chuỗi tiếng Việt mới cần dịch
  i18n/strings.vi.json      từ điển VI → EN
assets/
  js/dc-runtime.js          runtime render template
  js/modernist-ds.js        design system Modernist
  vendor/                   React 18.3.1 + ReactDOM (bản local)
  fonts/                    Archivo woff2 — latin, latin-ext, vietnamese
  img/                      3 ảnh nội dung (đã in trắng đen theo brand)
brand/logo/                 chỉ các file trang đang dùng: 3 favicon + ảnh chia sẻ og:image
cloudflare/                 Worker phục vụ site ở lattice.business/demo — xem cloudflare/README.md
```

Bộ nhận diện đầy đủ (logo SVG/PNG mọi kích thước, bảng màu, hướng dẫn) nằm ngoài repo, ở thư mục `Brand-kit/` cạnh thư mục này.

## 4. Quy trình sửa nội dung

**Sửa trang web** — sửa `index.html`, rồi sinh lại bản Anh:

```bash
python3 tools/extract-strings.py    # chuỗi Việt mới hiện ra trong từ điển với "en" rỗng
                                    # → dịch các chuỗi đó trong tools/i18n/strings.vi.json
python3 tools/build-en.py           # sinh en/index.html và kiểm tra
```

`build-en.py` quét bản Anh sau khi sinh và liệt kê **mọi chữ Việt còn sót**, kể cả chuỗi mà `extract-strings.py` bỏ lỡ (chuỗi xuống nhiều dòng, chuỗi mở đầu bằng số). Chỉ đẩy lên khi dòng `chu Viet con` báo `0` và `cu phap JS` báo `hop le`.

Bản Anh là **bản địa hóa**: nội dung riêng của Việt Nam (khung pháp lý, số liệu sàn nội địa, kênh Zalo…) được thay bằng bối cảnh thế giới ngay trong trường `"en"` của từ điển. Khi thêm nội dung Việt Nam mới, viết bản Anh theo nguyên tắc đó — kể cả đường link nguồn.

**Sửa tài liệu nền tảng** — sửa file markdown tương ứng rồi chạy:

```bash
python3 tools/build-doc.py          # bản Việt → index.html
python3 tools/build-en.py           # bản Anh → en/index.html
```

Hai script ghi đè phần giữa `<!-- DOC:START -->` và `<!-- DOC:END -->`. Đừng sửa tay đoạn đó — lần chạy sau sẽ mất.

## 5. Site đang chạy ở đâu

```
push lên main
      ↓
GitHub Pages  ──  https://latticeconsultant.github.io/lattice_demo/   (nguồn)
      ↓
Cloudflare Worker "lattice-demo"  route lattice.business/demo*
      ↓
https://lattice.business/demo/                                        (địa chỉ chính)
```

**Push lên `main` là cả hai địa chỉ tự cập nhật sau 1–2 phút.** Không phải deploy lại
Worker — nó chỉ lấy nội dung từ GitHub Pages về, không giữ bản sao.

Chỉ deploy lại Worker khi sửa `cloudflare/worker.js`. Xem `cloudflare/README.md`.

File `.nojekyll` để GitHub phục vụ nguyên trạng, không qua Jekyll.

## 6. Rào mật khẩu — và giới hạn của nó

Khối **Tài liệu nền tảng** ở đầu trang chủ xem tự do. Toàn bộ phần còn lại — header,
mười trang, footer — bị ẩn cho tới khi nhập đúng mật khẩu. Trạng thái mở khóa
lưu ở `localStorage`, nên chỉ cần nhập một lần trên mỗi trình duyệt. Áp dụng cho cả hai
bản ngôn ngữ.

Nút **KHÓA LẠI KHU VỰC HẠN CHẾ** ở chân trang đưa về trạng thái khóa — dùng khi
muốn diễn lại cho khách xem.

### Đây KHÔNG phải bảo mật

Cần nói thẳng để không ai hiểu nhầm:

- Website là file tĩnh. **Toàn bộ nội dung mười trang nằm trong `index.html` và
  `en/index.html`** — bấm `Ctrl+U` xem mã nguồn, hoặc `curl` địa chỉ trang, là đọc
  được hết mà không cần mật khẩu.
- Repo `latticeconsultant/lattice_demo` đang **public**. Ai vào GitHub cũng đọc
  được mã nguồn.
- Mật khẩu lưu dạng băm SHA-256 nên không lộ ngay khi xem mã nguồn, nhưng điều đó
  chỉ ngăn người đọc lười — nội dung vẫn phơi ra.

Nói gọn: đây là **tấm rèm che, không phải ổ khóa**. Nó ngăn người vào tình cờ bấm
lung tung, không ngăn được người thật sự muốn xem.

### Muốn khóa thật thì cần

1. Chuyển repo sang **private** và bỏ GitHub Pages (Pages cho repo private cần gói
   trả phí).
2. Đưa nội dung cần bảo vệ ra khỏi nơi công khai — nhúng vào Cloudflare Worker,
   KV hoặc R2.
3. Chặn ở tầng máy chủ: **Cloudflare Access** (Zero Trust, miễn phí tới 50 người)
   hoặc Basic Auth ngay trong Worker, kiểm tra trước khi trả nội dung.
4. Tách tài liệu công khai thành trang riêng để nó vẫn xem tự do.

## 7. Việc còn phải làm trước khi công bố chính thức

Đây là **bản mô tả giao diện** — còn mấy chỗ cần xử lý trước khi đưa cho khách hàng thật:

- **Thông tin liên hệ** (trang Liên hệ, cả hai bản): email, điện thoại/Zalo, địa chỉ đang là `[chưa cấu hình]`.
- **Biểu mẫu chẩn đoán**: nút GỬI YÊU CẦU chưa nối backend — cần trỏ về Formspree, Google Form hoặc endpoint riêng.
- **Repo cũ `koalaland-workplace/LATTICE`** vẫn public — cần chủ tài khoản đó chuyển sang private.
- **Ảnh**: ba ảnh PNG nặng ~2 MB mỗi file; nên chuyển sang WebP trước khi chạy quảng cáo. Bản Anh vẫn dùng ảnh người bán hàng trên phố Việt Nam (`vn-street-seller.png`) — cân nhắc thay ảnh trung tính hơn nếu muốn bản Anh hoàn toàn mang bối cảnh quốc tế.

## 8. Thương hiệu

Đọc `Brand-kit/README.md` trước khi dùng logo hoặc màu. Ba quy tắc hay bị vi phạm nhất:

1. Nút tâm của dấu hiệu **luôn đỏ** — đó là con người.
2. Đỏ chiếm quá 5% diện tích là mất nghĩa.
3. Không bo góc bất kỳ thành phần nào.

---

Màu: đỏ tín hiệu `#EC3013` · mực `#201E1D` · nền `#F3F2F2`
Chữ: Archivo (Google Fonts)
