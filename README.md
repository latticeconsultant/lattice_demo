# LATTICE Next Solutions — Website

Công ty Cổ phần Giải pháp LATTICE Next
*Kiến trúc mô hình kinh doanh mới. — Structure for what comes next.*

Website giới thiệu 10 trang song ngữ Việt / Anh, kèm luồng đăng ký gói trả phí, thanh toán VietQR, đối soát tự động qua SePay và trang quản trị. Không có máy chủ riêng: trang tĩnh trên GitHub Pages, nghiệp vụ trên Google Apps Script, dữ liệu trên Google Sheet.

**Địa chỉ:** https://lattice.business/ · bản tiếng Anh: https://lattice.business/en/

---

## 1. Nội dung website

Đầu trang chủ là khung đọc **Tài liệu nền tảng** "Doanh nghiệp một người" (21 mục, có mục lục và nút lưu PDF) — xem tự do. Mười trang dưới đây nằm sau rào mật khẩu (xem mục 9).

| Trang | Nội dung |
| --- | --- |
| Trang chủ | Luận điểm, 4 bước Chẩn đoán → Kiến trúc → Triển khai → Vận hành, bốn động cơ |
| Xu hướng tương lai | Số liệu thị trường, biểu đồ, mốc pháp lý |
| Next Solutions | Bộ máy người + AI (chủ sở hữu → ban điều hành → trưởng khối → Team AI), năm nguồn lực cốt lõi, mức tự chủ theo tác vụ, hạ tầng bảy lớp; bốn động cơ chi tiết (Social, Marketing, CRM, R&D) |
| Ngành & Mô hình | Tám nhóm mô hình và trần tự động hóa (tỷ trọng việc AI đảm nhiệm, không phải mức tự chủ); ba kiến trúc tham chiếu theo mô phỏng: thương mại & hàng hóa, dịch vụ, sản xuất |
| Cách chúng tôi làm | Phương pháp, cam kết, cách đo kết quả |
| Phương pháp triển khai | Từ khung chiến lược sang đề án triển khai; quản trị ra quyết định cho nhóm 2–3–5 người |
| Blockchain & Công nghệ tài chính | Mốc pháp lý tài sản số, vòng khép kín dòng tiền, sáu năng lực tài chính, ba tầng chuẩn bị |
| Academy | Ba lộ trình đào tạo A/B/C, chuyên đề theo ngành, hình thức |
| Branding | Bộ nhận diện LATTICE Next |
| Liên hệ | Bốn gói Scan / Blueprint / Compass / Foundry kèm link mẫu hồ sơ, chính sách phí và hoàn phí, đếm ngược đợt đăng ký, thông tin liên hệ |

Thanh đen trên cùng là **khung xem thử**: chuyển LAPTOP / TABLET / PHONE để soi bố cục responsive, nút IN / PDF để in bản đề xuất. Thanh này tự ẩn khi in.

Nút **EN / VI** ở header là liên kết thật giữa `index.html` và `en/index.html`, không phải nút đổi trạng thái — chia sẻ được đúng link theo ngôn ngữ.

## 2. Chạy tại máy

```bash
python3 -m http.server 8000
```

Rồi mở http://localhost:8000 (bản Việt) hoặc http://localhost:8000/en/ (bản Anh). Nên chạy qua HTTP thay vì mở thẳng file, vì bản Anh và các trang con nạp tài nguyên từ thư mục cha. Trang quản trị bắt buộc chạy qua http(s) vì cổng đăng nhập dùng `crypto.subtle`.

## 3. Cấu trúc thư mục

```
index.html                  bản tiếng Việt — NGUỒN DUY NHẤT của 10 trang, mọi chỉnh sửa làm ở đây
en/index.html               bản tiếng Anh — SINH TỰ ĐỘNG, không sửa tay
dang-ky/index.html          biểu mẫu đăng ký bốn bước, bản Việt — viết tay
register/index.html         biểu mẫu đăng ký bốn bước, bản Anh — viết tay
quan-tri/index.html         trang quản trị: hồ sơ, thanh toán, lịch làm việc
mophong/index.html          trang mô phỏng: kiến trúc (đơn giản / nâng cao), bộ máy và năm nguồn lực, luồng vận hành, người + AI, dashboard cho ba loại hình — NGUỒN DỮ LIỆU NGHIỆP VỤ
mau-ho-so/                  mẫu hồ sơ khách nhận của từng gói (Công ty ABZ hư cấu) + cam kết bảo mật
khao-sat/                   khảo sát nhanh; nv.js và dòng đầu day-du.js SINH TỰ ĐỘNG từ mophong, không sửa tay
tailieunoibo/                tài liệu nội bộ (kế hoạch, kịch bản video) — đang công khai theo đường dẫn, CẦN CHẶN hoặc gỡ
work/                       bản mẫu LATTICE Work (lattice.business/work) — chép từ thư mục Lattice-Works, dữ liệu mẫu hư cấu, chạy trong trình duyệt
docs/
  doanh-nghiep-mot-nguoi.md   tài liệu nền tảng, bản Việt
  one-person-business.en.md   tài liệu nền tảng, bản Anh (bản địa hóa, không dịch máy)
tools/
  build-khao-sat.mjs        sinh dữ liệu nghiệp vụ cho khảo sát từ mophong/index.html
  build-doc.py              dựng khung tài liệu từ markdown vào index.html
  build-en.py               sinh en/index.html từ index.html + từ điển, quét chữ Việt còn sót
  extract-strings.py        trích chuỗi tiếng Việt mới cần dịch
  i18n/strings.vi.json      từ điển VI → EN
  google-apps-script.gs     toàn bộ nghiệp vụ phía máy chủ: nhận đăng ký, webhook SePay, cổng dữ liệu quản trị, thư
  make-qr.py                sinh mã QR trỏ tới hai trang đăng ký
  make-favicon.py           sinh favicon nền đỏ (vẽ lại hình học, bản 16px rút gọn riêng)
  make-admin-key.mjs        sinh khoá đăng nhập trang quản trị
assets/
  js/dc-runtime.js          runtime render template
  js/modernist-ds.js        design system Modernist
  vendor/                   React 18.3.1 + ReactDOM (bản local)
  fonts/                    Archivo woff2 — latin, latin-ext, vietnamese
  img/                      3 ảnh nội dung + 2 mã QR trang đăng ký
brand/logo/                 chỉ các file trang đang dùng: 4 favicon + ảnh chia sẻ og:image
cloudflare/                 Worker phục vụ site ở lattice.business — xem cloudflare/README.md
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

Bản Anh là **bản địa hóa**: nội dung riêng của Việt Nam (khung pháp lý, số liệu sàn nội địa, kênh Zalo…) được thay bằng bối cảnh thế giới ngay trong trường `"en"` của từ điển. Khi thêm nội dung Việt Nam mới, viết bản Anh theo nguyên tắc đó — kể cả đường link nguồn. Ngày tháng trong bản Anh viết bằng chữ ("21 September 2026"), vì dạng 21/09 dễ bị đọc theo thứ tự tháng/ngày.

**Sửa tài liệu nền tảng** — sửa file markdown tương ứng rồi chạy:

```bash
python3 tools/build-doc.py          # bản Việt → index.html
python3 tools/build-en.py           # bản Anh → en/index.html
```

Hai script ghi đè phần giữa `<!-- DOC:START -->` và `<!-- DOC:END -->`. Đừng sửa tay đoạn đó — lần chạy sau sẽ mất.

**Sửa nghiệp vụ trong mô phỏng** — sửa bộ dữ liệu `DS` trong `mophong/index.html` (Thương mại, Dịch vụ, Sản xuất), rồi chạy:

```bash
node tools/build-khao-sat.mjs       # khao-sat/nv.js + dòng đầu khao-sat/day-du.js
```

Khảo sát không giữ bản chép tay danh sách nghiệp vụ; bỏ bước này là khảo sát lệch với mô phỏng.

**Sửa hai trang đăng ký** — `dang-ky/` và `register/` viết tay, không qua `build-en.py`. Sửa bản Việt thì sửa bản Anh tương ứng bằng tay. Đổi địa chỉ hai trang này thì chạy lại `python3 tools/make-qr.py`, nếu không mã QR cũ trỏ vào trang không còn tồn tại.

## 5. Gói dịch vụ và đợt đăng ký

Trao đổi ban đầu qua email **miễn phí**. Khoản thu là **phí tạo lập hồ sơ và quản lý**, không phải phí tư vấn — nhờ vậy chữ "miễn phí" vẫn đúng, và mốc không hoàn phí gắn được vào một việc bàn giao cụ thể.

| | LATTICE Scan | LATTICE Compass | LATTICE Blueprint | LATTICE Foundry |
| --- | --- | --- | --- | --- |
| Cho ai | Đang vận hành | Đang khởi sự | Đang vận hành, đã chắc | Khởi sự, đã chắc |
| Phí (đã gồm VAT 10%) | 895.000đ | 1.950.000đ | 2.950.000đ | 4.950.000đ |
| Gặp người | Không, qua email | Không, qua email | Zoom 60 phút | 2 buổi Zoom |
| Nhận được | 5–10 câu bổ sung + tài liệu · báo cáo 5–7 trang · trang mô phỏng riêng · hỏi đáp email 1 lần, 3 câu, 14 ngày | Báo cáo kiểm chứng 6–8 trang · hỏi đáp email 1 lần, 3 câu, 14 ngày | Toàn bộ Scan · hồ sơ thiết kế 12–16 trang · 2 SOP · rà lại sau 3 tuần | Toàn bộ Compass · bản thiết kế 15–20 trang · 3 SOP |
| Khấu trừ | 100% vào Blueprint trong 30 ngày | 100% vào Foundry trong 30 ngày | 100% vào hợp đồng trong 60 ngày | 100% vào Kit hoặc hợp đồng trong 60 ngày |
| Số suất | Không giới hạn | Không giới hạn | 10 hồ sơ mỗi đợt | 5 hồ sơ mỗi đợt |

Bậc miễn phí đứng trước là **Khảo sát nhanh** (20 câu, báo cáo ban đầu). Sắp mở: **LATTICE Kit** 8.950.000đ. Sản phẩm kèm: Academy 2,5 triệu/học viên · LATTICE Work gói cơ bản 2,5 triệu/tháng · media trọn gói 25–45 triệu/tháng. Quy định đầy đủ chốt ngày 10/10/2026.

**Mẫu hồ sơ khách nhận** nằm ở `mau-ho-so/` (trang tĩnh, `noindex`): bộ đầy đủ cho một doanh nghiệp thương mại hư cấu, Công ty ABZ — Khảo sát nhanh, Scan, Compass, Blueprint, Foundry, Kit (xem trước) và **Cam kết bảo mật thông tin** gửi kèm email xác nhận thanh toán của gói đầu tiên. Trang chủ (vi/en), hai trang đăng ký và báo cáo Khảo sát nhanh có link tới đây. Đổi nội dung gói thì sửa cả mẫu. Ở mọi chỗ có chữ SOP trong khu vực gói có một dòng giải thích SOP.

Bảng so sánh đầy đủ và chính sách hoàn phí có sẵn trên trang Liên hệ và trong popup của trang đăng ký. Giá phải khớp ở **ba** chỗ: biến `GOI` trong hai trang đăng ký và `GIA` trong `google-apps-script.gs`. Máy chủ luôn tính lại số tiền theo `GIA`, không tin con số trình duyệt gửi lên. Giá còn được ghi bằng chữ ở trang chủ (Liên hệ), `khao-sat/index.html` (khối mời đăng ký Scan) và `tailieunoibo/`; đổi giá thì rà cả ba.

Từ Khảo sát nhanh, nút đăng ký dẫn sang `dang-ky/?ma=<mã khảo sát>&goi=scan|compass|blueprint|foundry`: trang đăng ký chọn sẵn đúng gói và ghi mã vào ô mô tả, nên mã về Sheet cùng hồ sơ mà không cần đổi Apps Script.

**Đợt 1** đóng đăng ký lúc 24:00 ngày 30/9/2026, hồ sơ bắt đầu xử lý từ 21/09/2026. Hạn nằm ở biến `HAN` (`2026-10-01T00:00:00+07:00`) trong `index.html`, `dang-ky/index.html`, `register/index.html`. Tới hạn, trang đăng ký **tự ẩn biểu mẫu** chứ không chỉ đổi chữ. Mở đợt mới thì đổi hạn và câu thông báo ở cả ba file, rồi chạy `build-en.py`.

## 6. Luồng đăng ký, thanh toán, đối soát

```
Nút ĐẶT LỊCH CHẨN ĐOÁN → hộp thoại (cam kết bảo mật, các bước) → trang đăng ký
  1 Thông tin → 2 Xác nhận → 3 Chuyển khoản → 4 Hoàn tất
                    │               │
                    │               └─ "Tôi đã chuyển khoản": chỉ ghi nhật ký, KHÔNG tự đổi sang đã thu
                    └─ gửi lên Apps Script → ghi Sheet → thư đăng ký kèm QR
Khách quét QR, chuyển khoản → SePay báo webhook → khớp mã hồ sơ + đủ tiền
  → trạng thái "đã thu" → tự gửi phiếu thu
```

**Mã hồ sơ** dạng `LTC` + ngày tháng + 4 số ngẫu nhiên, sinh ở trình duyệt. **Nội dung chuyển khoản** là mã hồ sơ + tên gói, ví dụ `LTC13094682 SCAN` — dưới 25 ký tự theo chuẩn EMV, nhúng sẵn vào QR để khách không phải gõ. Nội dung gõ tay là chỗ hỏng đối soát nhiều nhất.

**Đối soát tự động** chỉ xác nhận khi đúng mã và đủ tiền. Các trường hợp khác không tự xác nhận, chỉ ghi vào tab Nhật ký để người trực xử lý tay:

| Nhật ký | Nghĩa | Việc cần làm |
| --- | --- | --- |
| `tien_ve` | Đúng mã, đủ tiền, đã tự xác nhận và gửi phiếu thu | Không |
| `tien_thieu` | Đúng mã nhưng chuyển thiếu | Liên hệ khách bù tiền |
| `tien_khong_khop` | Có chữ LTC nhưng không khớp mã nào | Dò tay theo số tiền và thời điểm |
| `khach_bao_da_ck` | Khách bấm "Tôi đã chuyển khoản" | Nếu sau một lúc chưa có `tien_ve`, kiểm tra sao kê |
| `thu_tay` | Người trực bấm ĐÃ NHẬN TIỀN | Không |

Giao dịch không chứa chữ "LTC" bị bỏ qua im lặng — tài khoản còn dùng việc khác.

**Phiếu thu** bóc tách VAT 10% và ghi rõ không thay thế hoá đơn GTGT. Hoá đơn hợp lệ phải xuất từ phần mềm hoá đơn điện tử của công ty.

Đã thử bằng tiền thật ngày 13/9/2026: đăng ký lúc 00:18, SePay báo và hệ thống tự xác nhận lúc 00:20:22.

## 7. Trang quản trị

https://lattice.business/quan-tri/ — danh sách hồ sơ, lọc theo trạng thái, tìm kiếm, đổi trạng thái, ghi lịch làm việc, xác nhận đã nhận tiền bằng tay (tự gửi phiếu thu), gửi lại thư. Tự tải lại mỗi 45 giây.

Cổng đăng nhập: mã truy cập Apps Script được **mã hoá AES-GCM bằng khoá dẫn xuất từ chính mật khẩu**, nên trang công khai không lộ mã. Tên đăng nhập, mật khẩu và `ADMIN_TOKEN` **không** nằm trong repo.

**Đổi mật khẩu:** nút **ĐỔI MẬT KHẨU** trên thanh trên cùng (cần Apps Script bản 8 trở lên). Trình duyệt kiểm mật khẩu hiện tại, băm mật khẩu mới và mã hoá lại mã truy cập, tự mở thử, rồi mới gửi lên lưu ở thuộc tính `ADMIN_LOGIN`. Máy chủ không bao giờ thấy mật khẩu; `ADMIN_TOKEN` giữ nguyên nên trang đăng ký và SePay không bị ảnh hưởng. Đổi xong trang tự đăng xuất. Phiên đang mở ở máy khác vẫn dùng được tới hết hạn 8 giờ.

- Khi đăng nhập, trang hỏi máy chủ khoá hiện hành. Mất kết nối thì **không** cho vào, thay vì lùi về khoá gốc — nếu lùi, mật khẩu cũ sẽ vào được mỗi lần mạng chập chờn.
- **Quên mật khẩu:** Apps Script → Thuộc tính tập lệnh → xoá `ADMIN_LOGIN`. Trang quay về khoá gốc trong `quan-tri/index.html` (mật khẩu ban đầu).
- Thay khoá gốc: `node tools/make-admin-key.mjs <tên đăng nhập> <mật khẩu> <muối> <ADMIN_TOKEN>` rồi dán ba dòng in ra vào `quan-tri/index.html`.
- Đổi mật khẩu **không** thu hồi được mã truy cập ai đó đã mở ra trước đó. Nghi lộ thì phải đổi `ADMIN_TOKEN`, rồi sinh lại khoá gốc và xoá `ADMIN_LOGIN`.

Đây vẫn là rào phía trình duyệt: lớp bảo vệ thật là `ADMIN_TOKEN` phía Apps Script. Mật khẩu yếu thì lớp này cũng yếu.

## 8. Apps Script, bí mật và cách triển khai lại

Toàn bộ nghiệp vụ phía máy chủ nằm trong `tools/google-apps-script.gs`, dán vào Apps Script gắn với Google Sheet. Sheet có hai tab: **Đăng ký** (mỗi hồ sơ một dòng) và **Nhật ký** (mọi thư đã gửi, mọi lần tiền về).

**Các bí mật** nằm ở Apps Script → ⚙️ Cài đặt dự án → Thuộc tính tập lệnh, không nằm trong repo công khai:

| Tên | Dùng cho |
| --- | --- |
| `ADMIN_TOKEN` | Trang quản trị gọi cổng dữ liệu |
| `SEPAY_SECRET` | Webhook SePay — đi kèm trong địa chỉ `…/exec?sepay=<mật mã>`, vì Apps Script không đọc được header |
| `ADMIN_LOGIN` | Khoá đăng nhập sau khi đổi mật khẩu — trang **tự ghi**, không tạo tay. Xoá là về mật khẩu gốc |

**Triển khai lại sau khi sửa mã — luôn tạo triển khai MỚI:**

1. Dán file, Lưu.
2. Triển khai → **Tùy chọn triển khai mới** → Ứng dụng web · Thực thi: Tôi · Truy cập: Bất kỳ ai.
3. Copy URL mới, thay ở **bốn chỗ**: `dang-ky/index.html`, `register/index.html`, `quan-tri/index.html`, và địa chỉ webhook trong SePay.
4. Đổi `PHIEN_BAN` trong file mỗi lần sửa, rồi kiểm: `<URL>?viec=phienBanCongKhai` phải ra đúng phiên bản đó.

Đừng "sửa bản đang có": Apps Script phục vụ bản đã triển khai chứ không phải mã vừa lưu; ô "Phiên bản" để nguyên số cũ là bấm Triển khai vẫn báo thành công mà mã mới không chạy. Đã dính ba lần liền.

**Thư** gửi qua `MailApp` từ `lattice.consultant@gmail.com`, hạn mức 100 thư/ngày. Nếu thư hay vào hộp thư rác của khách doanh nghiệp, chuyển sang dịch vụ gửi thư có xác thực tên miền `lattice.business`.

## 9. Site đang chạy ở đâu

```
push lên main
      ↓
GitHub Pages  ──  https://latticeconsultant.github.io/lattice_demo/   (nguồn)
      ↓
Cloudflare Worker "lattice-demo"  route lattice.business/*
      ↓
https://lattice.business/                                        (địa chỉ chính)
```

**Push lên `main` là site tự cập nhật sau 1–2 phút.** Không phải deploy lại Worker — nó chỉ lấy nội dung từ GitHub Pages về, không giữ bản sao. Worker còn chuyển hướng mọi link `/demo/…` cũ về gốc, và xử lý thư mục con thiếu gạch chéo cuối.

Chỉ deploy lại Worker khi sửa `cloudflare/worker.js`. Xem `cloudflare/README.md`.

File `.nojekyll` để GitHub phục vụ nguyên trạng, không qua Jekyll.

## 10. Rào mật khẩu — và giới hạn của nó

Khối **Tài liệu nền tảng** ở đầu trang chủ xem tự do. Toàn bộ phần còn lại — header, mười trang, footer — bị ẩn cho tới khi nhập đúng mật khẩu. Trạng thái mở khóa lưu ở `localStorage`, nên chỉ cần nhập một lần trên mỗi trình duyệt. Áp dụng cho cả hai bản ngôn ngữ. Hai trang đăng ký nằm **ngoài** rào này, để khách quét QR là vào thẳng.

Nút **KHÓA LẠI KHU VỰC HẠN CHẾ** ở chân trang đưa về trạng thái khóa — dùng khi muốn diễn lại cho khách xem.

### Đây KHÔNG phải bảo mật

- Website là file tĩnh. **Toàn bộ nội dung mười trang nằm trong `index.html` và `en/index.html`** — xem mã nguồn hoặc `curl` địa chỉ trang là đọc được hết mà không cần mật khẩu.
- Repo `latticeconsultant/lattice_demo` đang **public**. Ai vào GitHub cũng đọc được mã nguồn — vì vậy mọi bí mật phải nằm ở Thuộc tính tập lệnh, không bao giờ nằm trong file.
- Mật khẩu lưu dạng băm SHA-256 nên không lộ ngay khi xem mã nguồn, nhưng chỉ ngăn người đọc lười.

Nói gọn: đây là **tấm rèm che, không phải ổ khóa**.

### Muốn khóa thật thì cần

1. Chuyển repo sang **private** và bỏ GitHub Pages (Pages cho repo private cần gói trả phí).
2. Đưa nội dung cần bảo vệ ra khỏi nơi công khai — nhúng vào Cloudflare Worker, KV hoặc R2.
3. Chặn ở tầng máy chủ: **Cloudflare Access** (Zero Trust, miễn phí tới 50 người) hoặc Basic Auth ngay trong Worker.
4. Tách tài liệu công khai thành trang riêng để nó vẫn xem tự do.

## 11. Việc còn mở

- **Ảnh**: sáu ảnh chụp đã phóng to bằng AI (Real-ESRGAN x4plus, chạy trên máy) rồi xuất JPEG 1920 và 3840 px; trình duyệt tự chọn cỡ qua srcset. Ảnh mới cần đạt tối thiểu 2560 px chi tiết thật để nét trên laptop Retina; sơ đồ có chữ nên dựng bằng HTML/SVG (như Sơ đồ 07).
- **Bảng câu hỏi chuẩn bị**: thư và trang đăng ký hứa gửi sau khi nhận thanh toán, file chưa soạn.
- **File nội bộ đang đọc được từ tên miền**: `README.md`, `tools/`, `docs/*.md`, `cloudflare/` trả về 200 tại lattice.business. Không có bí mật nào trong đó (repo vốn public), nhưng có thể chặn bằng Worker để chỉ phục vụ phần công khai.

## 12. Thương hiệu

Đọc `Brand-kit/README.md` trước khi dùng logo hoặc màu. Ba quy tắc hay bị vi phạm nhất:

1. Nút tâm của dấu hiệu **luôn đỏ** — đó là con người.
2. Đỏ chiếm quá 5% diện tích là mất nghĩa.
3. Không bo góc bất kỳ thành phần nào.

---

Màu: đỏ tín hiệu `#EC3013` · mực `#33302E` · nền giấy `#FFF1E5` (theo tinh thần ft.com) · có chế độ đêm
Chữ: Archivo (Google Fonts)
