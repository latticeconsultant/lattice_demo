# Quản trị nội bộ và ra quyết định theo quy mô đội

Ngày 05/08/2026 · website LATTICE Next Solutions

## Vấn đề

Khối "Bốn động cơ, một bộ máy" ở trang chủ chỉ trình bày bốn động cơ hướng ra
ngoài — Social, Marketing/GEO, CRM, R&D. Người đọc dừng ở trang chủ sẽ hiểu
LATTICE bán bốn cỗ máy marketing.

Rà toàn site cho thấy hai lỗ hổng khác nhau:

1. **Trang chủ không dẫn tới lớp quản trị.** Nội dung quản trị có sẵn và khá
   dày, nhưng nằm rải ở hai trang khác: ma trận quyền quyết định (Next
   Solutions); bốn vòng Decide/Execute/Control/Learn, nhịp điều hành, dashboard
   sáu khối, chỉ báo nút thắt cổ chai, vành đai người bên ngoài (Phương pháp
   triển khai). Trang chủ không nhắc một chữ.

2. **Mô hình người dừng ở 3.** `humanRoles` chỉ có Người 1 (Owner/CEO), Người 2
   (Operations), Người 3 (Product/Tech). Từ khóa "5 người" xuất hiện 0 lần trong
   toàn site. Mốc 4–5 người chưa có — mà đây mới là chỗ phát sinh tranh chấp
   quyền: từ hai người cùng được duyệt một việc trở đi mới có deadlock và
   chuyện ai override ai.

## Phạm vi

Sửa cả hai. Không đụng tới nội dung bốn động cơ hiện có.

## Phần A — Trang chủ: dải "Lớp thứ năm"

Section mới chèn ngay sau lưới bốn card, trước section "Nguyên tắc làm việc".

Nền mực (`background:var(--color-text); color:var(--color-bg)`) để mắt đọc nhận
ra đây là tầng khác, không phải động cơ thứ năm. Đây là lý do chọn dải riêng
thay vì thêm card thứ 5 vào lưới: lớp quản trị không ngang hàng với bốn động cơ,
nó là khung giữ bốn cái kia.

Nội dung: kicker `LỚP QUẢN TRỊ`, tiêu đề "Bốn động cơ chạy được là nhờ lớp thứ
năm", một đoạn dẫn nối về con số 88% pilot chết đã có sẵn trên site, bốn nhãn
trỏ tới nội dung đã có (ma trận quyền quyết định · nhịp điều hành · bốn vòng
kiểm soát · ngưỡng thêm người), và nút `XEM LỚP QUẢN TRỊ →`.

Nút dùng handler mới `goGovernance: () => this.go('method', 'm1')` — sang trang
Phương pháp triển khai, tab Mô hình vận hành, đúng chỗ chứa Tầng con người.

Dải này chỉ dẫn đường, không viết nội dung mới.

## Phần B — Ma trận quyền theo quy mô

Nối vào section "Tầng con người" trên trang Phương pháp triển khai. Thứ tự đọc
sau khi chèn:

1. `humanRoles` — Người 1/2/3 (đã có)
2. **Ma trận quyền theo quy mô** (mới)
3. `bottleneck` — CEO thành nút thắt cổ chai (đã có)
4. **Ngưỡng thêm người thứ 4, thứ 5** (mới)
5. Vành đai người bên ngoài (đã có)

### Bảng `rightsMatrix`

Bốn cột: loại quyết định · 1 người · 2–3 người · 4–5 người.

| Loại quyết định | 1 người | 2–3 người | 4–5 người |
| --- | --- | --- | --- |
| Đăng nội dung ra ngoài | CEO duyệt theo lô, một lần mỗi ngày | Người 3 duyệt; CEO xem mẫu ngẫu nhiên | Chủ động cơ Social tự duyệt trong khung đã chốt |
| Nâng mức tự chủ agent L1 → L3 | CEO, sau hai tuần eval sạch | Người 3 đề xuất, CEO duyệt | Người 3 duyệt; chạm vùng đỏ mới lên CEO |
| Hạ mức tự chủ hoặc dừng agent | Ai phát hiện cũng được hạ | Ai phát hiện cũng được hạ | Ai phát hiện cũng được hạ |
| Phân quyền và truy cập dữ liệu | CEO | Người 3 | Người 3 — CEO không override |
| Cam kết hợp đồng, nghĩa vụ pháp lý | CEO | CEO | CEO — không ủy quyền ở mọi quy mô |
| Chi ngoài ngân sách đã duyệt | CEO | CEO | CEO — không ủy quyền ở mọi quy mô |
| Thay đổi knowledge base và chính sách | CEO | Người 3 | Chủ sở hữu vòng Learn |
| Dừng khẩn cấp khi khủng hoảng | CEO | Bất kỳ ai | Bất kỳ ai |

### Hai quy tắc in dưới bảng

Đây là phần trả lời deadlock — hỏi "hai người cùng được duyệt thì ai thắng".

1. **Quyền hạ mức luôn rộng hơn quyền nâng mức.** Ai cũng được kéo phanh; chỉ
   một người được nhả phanh. Đó là lý do dòng hạ mức giống hệt nhau ở cả ba
   quy mô.
2. **Từ bốn người trở lên, mỗi loại quyết định phải có đúng một chủ sở hữu.**
   Hai người cùng được duyệt nghĩa là không ai chịu trách nhiệm. Ma trận tồn tại
   để không ô nào ghi hai tên.

### Khối `addPerson` — ngưỡng thêm người

Dùng lại đúng các chỉ báo đã có trên site, không đẻ con số mới:

| Mốc | Chỉ báo | Người mới nhận gì |
| --- | --- | --- |
| Người thứ 4 | Hàng chờ phê duyệt của Người 3 vượt 48 giờ hai tuần liên tiếp, hoặc eval hàng tuần bị bỏ hai kỳ liên tiếp | Trọn quyền duyệt một động cơ, kèm ngân sách và ngưỡng rủi ro của động cơ đó |
| Người thứ 5 | Tỷ lệ ngoại lệ vượt 15% khối lượng ở hai động cơ khác nhau cùng lúc | Vòng Control: eval, audit log, hạn mức — tách khỏi người đang vận hành |
| Chưa thêm người | CEO còn làm việc mức L0–L2 quá 30% quỹ thời gian | Đây là sai phân bổ vai trò, không phải thiếu người. Sửa ma trận trước khi tuyển |

Hàng thứ ba là chủ ý: giọng thương hiệu yêu cầu nói thẳng cả điều bất lợi cho
mình — trường hợp này khuyên khách đừng tuyển thêm.

## Ràng buộc

- Không bịa số liệu ngoài. Mọi ngưỡng lấy lại từ con số đã có trên site
  (48 giờ, 15% khối lượng, 30% quỹ thời gian, thang L0–L5) hoặc là quy tắc cấu
  trúc không cần số.
- Theo đúng quy ước dựng hình sẵn có: inline style, bán kính 0, đường kẻ 2px,
  căn trái, `this.rows([...], [keys])` cho dữ liệu bảng, `sc-for` để lặp.
- Đỏ tín hiệu giữ dưới 5% diện tích.
- Nội dung kinh doanh do Claude soạn, suy ra từ logic sẵn có của site. Chủ sở
  hữu chuyên môn phải duyệt trước khi công bố.

## Kiểm chứng

- Render đủ trên trang chủ và trang Phương pháp triển khai, console sạch.
- Nút `XEM LỚP QUẢN TRỊ →` sang đúng trang/tab.
- Chạy lại script quét chữ mồ côi trên nội dung mới ở ba khổ 1280 / 834 / 390px.
