/* ABZ Corporation — dữ liệu giả lập.
   Doanh nghiệp HƯ CẤU: Công ty TNHH Thương mại ABZ, phân phối đồ gia dụng nhà bếp, 14 người,
   doanh thu ~2,4 tỷ/tháng (cùng công ty trong lattice.business/mau-ho-so/).
   Mọi tên người, khách, nhà cung cấp đều bịa. Sinh bằng số ngẫu nhiên có hạt giống cố định,
   nên mỗi lần mở trang đều ra cùng một bộ số liệu. */
(function () {
  'use strict';

  // ── Số ngẫu nhiên có hạt giống (mulberry32) ───────────────────────────────
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  var R = rng(20261103);
  var rnd = function (a, b) { return a + R() * (b - a); };
  var rint = function (a, b) { return Math.floor(rnd(a, b + 1)); };
  var pick = function (a) { return a[Math.floor(R() * a.length)]; };
  function pickW(items, w) {
    var s = w.reduce(function (x, y) { return x + y; }, 0), r = R() * s;
    for (var i = 0; i < items.length; i++) { r -= w[i]; if (r <= 0) return items[i]; }
    return items[items.length - 1];
  }

  // ── Mốc thời gian: "hôm nay" của bản demo ─────────────────────────────────
  var HOM_NAY = new Date(2026, 10, 3, 8, 0, 0);       // Thứ Ba 03/11/2026, 08:00
  var NGAY_LS = 90;                                   // 90 ngày lịch sử trước hôm nay

  var CONG_TY = {
    ten: 'ABZ Corporation', tenPhapLy: 'Công ty TNHH Thương mại ABZ',
    nganh: 'Phân phối đồ gia dụng nhà bếp', nhanSu: 14, diaChi: 'KCN Sóng Thần, Dĩ An, Bình Dương',
    khauHieu: 'Bếp Việt, chuẩn mỗi ngày'
  };

  var KHO = [
    { id: 'BD', ten: 'Kho Bình Dương', vai: 'Kho tổng' },
    { id: 'HN', ten: 'Kho Hà Nội', vai: 'Kho vệ tinh miền Bắc' }
  ];

  var NHOM = [
    { id: 'noi', ten: 'Nồi & xoong' },
    { id: 'chao', ten: 'Chảo' },
    { id: 'dao', ten: 'Dao, kéo & thớt' },
    { id: 'dien', ten: 'Đồ điện bếp nhỏ' },
    { id: 'hop', ten: 'Hộp & bình bảo quản' }
  ];

  var NCC = [
    { id: 'KL', ten: 'Gia dụng Kim Long', noi: 'Bình Dương', giaoNgay: 3, loi: 0.6 },
    { id: 'TV', ten: 'Inox Thép Việt', noi: 'Hưng Yên', giaoNgay: 5, loi: 0.4 },
    { id: 'HP', ten: 'Nhựa Hoàng Phát', noi: 'TP.HCM', giaoNgay: 2, loi: 0.8 },
    { id: 'NB', ten: 'Ningbo Homeware Co.', noi: 'Chiết Giang, TQ', giaoNgay: 21, loi: 1.9 },
    { id: 'DM', ten: 'Điện máy Đông Mai', noi: 'Bắc Ninh', giaoNgay: 4, loi: 1.1 }
  ];

  // sku, tên, nhóm, ncc, giá vốn, giá sỉ, bán/ngày (đơn vị), điểm đặt hàng
  var SP_GOC = [
    ['NOI-INOX-5', 'Bộ nồi inox 3 đáy 5 món', 'noi', 'TV', 312000, 432000, 14, 260],
    ['NOI-INOX-3', 'Bộ nồi inox 3 món', 'noi', 'TV', 198000, 276000, 18, 300],
    ['NOI-AP-6L', 'Nồi áp suất inox 6L', 'noi', 'KL', 455000, 598000, 6, 90],
    ['NOI-LAU-30', 'Nồi lẩu inox 30cm', 'noi', 'KL', 141000, 199000, 9, 140],
    ['CHAO-CD-26', 'Chảo chống dính 26cm', 'chao', 'NB', 96000, 139000, 31, 520],
    ['CHAO-CD-28', 'Chảo chống dính sâu lòng 28cm', 'chao', 'NB', 118000, 169000, 22, 380],
    ['CHAO-GANG-24', 'Chảo gang đúc 24cm', 'chao', 'KL', 172000, 239000, 7, 110],
    ['CHAO-RAN-20', 'Chảo rán trứng 20cm', 'chao', 'NB', 58000, 85000, 19, 300],
    ['DAO-BO-6', 'Bộ dao 6 món kèm giá', 'dao', 'NB', 189000, 265000, 10, 160],
    ['DAO-THAI-20', 'Dao thái thép Nhật 20cm', 'dao', 'NB', 92000, 135000, 13, 200],
    ['THOT-GO-38', 'Thớt gỗ nghiến 38cm', 'dao', 'KL', 108000, 152000, 11, 170],
    ['KEO-BEP', 'Kéo cắt gà đa năng', 'dao', 'NB', 41000, 62000, 16, 240],
    ['DIEN-AM-17', 'Ấm siêu tốc 1,7L', 'dien', 'DM', 132000, 185000, 15, 230],
    ['DIEN-XAY-1', 'Máy xay sinh tố 1,5L', 'dien', 'DM', 268000, 359000, 8, 120],
    ['DIEN-NCD-18', 'Nồi cơm điện 1,8L', 'dien', 'DM', 345000, 459000, 9, 140],
    ['DIEN-CHIEN-5', 'Nồi chiên không dầu 5L', 'dien', 'DM', 612000, 799000, 7, 100],
    ['HOP-TT-10', 'Bộ 10 hộp thủy tinh nắp khóa', 'hop', 'HP', 152000, 215000, 17, 260],
    ['HOP-NHUA-5', 'Bộ 5 hộp nhựa trữ đông', 'hop', 'HP', 46000, 69000, 26, 400],
    ['BINH-GN-1', 'Bình giữ nhiệt 1L', 'hop', 'HP', 118000, 168000, 12, 180],
    ['HU-GIA-VI', 'Bộ 6 hũ gia vị thủy tinh', 'hop', 'HP', 64000, 95000, 14, 210]
  ];
  var SP = SP_GOC.map(function (a) {
    var bd = Math.round(a[7] * rnd(1.1, 2.4)), hn = Math.round(a[7] * rnd(0.25, 0.6));
    return { sku: a[0], ten: a[1], nhom: a[2], ncc: a[3], gv: a[4], gb: a[5], banNgay: a[6], rop: a[7], ton: { BD: bd, HN: hn } };
  });

  var KENH = [
    { id: 'daily', ten: 'Đại lý sỉ' },
    { id: 'sieuthi', ten: 'Chuỗi siêu thị mini' },
    { id: 'san', ten: 'Sàn TMĐT' },
    { id: 'b2b', ten: 'Khách doanh nghiệp' },
    { id: 'le', ten: 'Bán lẻ online' }
  ];

  // mã, tên, kênh, tỉnh, hạn mức nợ (tr), hạn thanh toán (ngày)
  var KH_GOC = [
    ['BX', 'Đại lý Bếp Xanh', 'daily', 'TP.HCM', 150, 30], ['NH', 'Gia dụng Ngọc Hà', 'daily', 'Đồng Nai', 120, 30],
    ['TL', 'Đại lý Thành Lợi', 'daily', 'Cần Thơ', 100, 30], ['MP', 'Gia dụng Minh Phát', 'daily', 'Hà Nội', 140, 30],
    ['HD', 'Đại lý Hải Đăng', 'daily', 'Hải Phòng', 90, 21], ['AN', 'Gia dụng An Nhiên', 'daily', 'Đà Nẵng', 80, 21],
    ['PT', 'Đại lý Phúc Thịnh', 'daily', 'Bình Dương', 110, 30], ['KT', 'Gia dụng Kim Thoa', 'daily', 'Long An', 60, 21],
    ['SM', 'Chuỗi Mart 24h', 'sieuthi', 'TP.HCM', 300, 45], ['CB', 'Siêu thị Cô Ba', 'sieuthi', 'Vũng Tàu', 120, 30],
    ['HG', 'Chuỗi Hàng Gia Đình', 'sieuthi', 'Hà Nội', 250, 45], ['SV', 'Siêu thị Sao Việt', 'sieuthi', 'Nha Trang', 100, 30],
    ['SS', 'Gian hàng sàn Sóng Sắc', 'san', 'Toàn quốc', 0, 7], ['SL', 'Gian hàng sàn Lazada-ABZ', 'san', 'Toàn quốc', 0, 7],
    ['TK', 'Gian hàng TikTok ABZ', 'san', 'Toàn quốc', 0, 7],
    ['VP', 'Cty CP Văn phòng Việt Phát', 'b2b', 'TP.HCM', 200, 30], ['NL', 'Tập đoàn Nhà Lành', 'b2b', 'Hà Nội', 260, 45],
    ['KS', 'Khách sạn Sông Hàn', 'b2b', 'Đà Nẵng', 150, 30], ['BV', 'Bếp ăn Vạn Phúc', 'b2b', 'Bình Dương', 120, 30],
    ['WEB', 'Khách lẻ web abz.vn', 'le', 'Toàn quốc', 0, 0], ['ZL', 'Khách lẻ Zalo OA', 'le', 'Toàn quốc', 0, 0]
  ];
  var KH = KH_GOC.map(function (a) { return { ma: a[0], ten: a[1], kenh: a[2], tinh: a[3], hanMuc: a[4] * 1e6, hanTT: a[5], congNo: 0, quaHan: 0 }; });

  // ── Người: 14 nhân sự ABZ ─────────────────────────────────────────────────
  var NGUOI = [
    { id: 'ceo', ten: 'Trần Quang Vinh', vt: 'Giám đốc điều hành', khoi: 'cl', vai: 'ceo' },
    { id: 'kd', ten: 'Lê Minh Khang', vt: 'Trưởng Kinh doanh', khoi: 'kd', vai: 'kd' },
    { id: 'kd2', ten: 'Phạm Thu Trang', vt: 'NV Kinh doanh kênh đại lý', khoi: 'kd' },
    { id: 'kd3', ten: 'Đỗ Gia Bảo', vt: 'NV Kinh doanh siêu thị & B2B', khoi: 'kd' },
    { id: 'mh', ten: 'Nguyễn Thị Lan', vt: 'Trưởng Mua hàng & Ngành hàng', khoi: 'nh', vai: 'mh' },
    { id: 'hd', ten: 'Võ Hoàng Nam', vt: 'Chuyên viên Hoạch định cung ứng', khoi: 'hd' },
    { id: 'kho', ten: 'Bùi Văn Thắng', vt: 'Thủ kho Bình Dương', khoi: 'kv', vai: 'kho' },
    { id: 'kho2', ten: 'Hồ Thanh Tùng', vt: 'NV kho & giao nhận', khoi: 'kv' },
    { id: 'kho3', ten: 'Lý Văn Hải', vt: 'Thủ kho Hà Nội', khoi: 'kv' },
    { id: 'mk', ten: 'Đặng Ngọc Tú', vt: 'Trưởng Marketing', khoi: 'mk', vai: 'mk' },
    { id: 'cs', ten: 'Mai Thu Hà', vt: 'Trưởng CSKH', khoi: 'dv', vai: 'cs' },
    { id: 'tc', ten: 'Phan Thị Hoa', vt: 'Kế toán trưởng', khoi: 'ht', vai: 'tc' },
    { id: 'tc2', ten: 'Trịnh Mỹ Linh', vt: 'Kế toán công nợ', khoi: 'ht' },
    { id: 'ns', ten: 'Cao Thùy Dung', vt: 'Hành chính – Nhân sự', khoi: 'ht' }
  ];

  // ── AI agent ───────────────────────────────────────────────────────────────
  var AGENT = [
    { id: 'A-KD', ten: 'Agent Bán hàng', khoi: 'kd', chu: 'kd', viec: 'Nhận đơn mọi kênh, báo giá, kiểm hạn mức, xác nhận với khách' },
    { id: 'A-MH', ten: 'Agent Mua hàng', khoi: 'nh', chu: 'mh', viec: 'Soạn đơn mua, so giá nhà cung cấp, theo dõi giao hàng đến' },
    { id: 'A-HD', ten: 'Agent Hoạch định', khoi: 'hd', chu: 'hd', viec: 'Dự báo nhu cầu, cảnh báo tồn dưới điểm đặt hàng, đề xuất số lượng' },
    { id: 'A-KHO', ten: 'Agent Kho vận', khoi: 'kv', chu: 'kho', viec: 'Giữ hàng, lập phiếu xuất, chọn tuyến giao, đối chiếu kiểm kê' },
    { id: 'A-TC', ten: 'Agent Tài chính', khoi: 'ht', chu: 'tc', viec: 'Xuất hóa đơn, khớp tiền về, nhắc nợ, theo dõi dòng tiền' },
    { id: 'A-CS', ten: 'Agent CSKH', khoi: 'dv', chu: 'cs', viec: 'Trả lời Zalo/email theo kho câu hỏi, tiếp nhận khiếu nại, đổi trả' },
    { id: 'A-MK', ten: 'Agent Marketing', khoi: 'mk', chu: 'mk', viec: 'Soạn nội dung, chạy quảng cáo trong ngân sách, đo hiệu quả' },
    { id: 'A-GS', ten: 'AI Giám sát', khoi: 'cl', chu: 'ceo', viec: 'Theo dõi toàn hệ thống, báo cáo định kỳ, phát hiện bất cập, nhắc việc' }
  ];

  // ── 8 khối nghiệp vụ (kiến trúc Thương mại & Hàng hóa) ─────────────────────
  var KHOI = [
    { id: 'cl', ten: 'Quản trị & Điều hành', ngan: 'Điều hành', tang: 'Ban điều hành' },
    { id: 'nh', ten: 'Ngành hàng & Nguồn cung', ngan: 'Ngành hàng', tang: 'Phía cung' },
    { id: 'hd', ten: 'Hoạch định Cung–Cầu & Tồn kho', ngan: 'Hoạch định', tang: 'Phía cung' },
    { id: 'mk', ten: 'Marketing & Tăng trưởng', ngan: 'Marketing', tang: 'Phía cầu' },
    { id: 'kd', ten: 'Kinh doanh & Kênh phân phối', ngan: 'Kinh doanh', tang: 'Phía cầu' },
    { id: 'kv', ten: 'Đơn hàng, Kho vận & Giao nhận', ngan: 'Kho vận', tang: 'Phía cung' },
    { id: 'dv', ten: 'Dịch vụ khách hàng & Quan hệ', ngan: 'CSKH', tang: 'Phía cầu' },
    { id: 'ht', ten: 'Năng lực hỗ trợ (Tài chính, Nhân sự)', ngan: 'Tài chính & HT', tang: 'Hỗ trợ' }
  ];

  // ── Mức tự chủ của AI (thang Lattice) ─────────────────────────────────────
  var MUC = [
    { m: 0, ten: 'Quan sát', mo: 'AI chỉ thu thập và báo cáo. Người làm toàn bộ.' },
    { m: 1, ten: 'Đề xuất', mo: 'AI phân tích, đưa phương án. Người quyết và tự làm.' },
    { m: 2, ten: 'Chuẩn bị', mo: 'AI soạn sẵn đầu ra. Người duyệt rồi mới chạy.' },
    { m: 3, ten: 'Làm có giới hạn', mo: 'AI tự làm trong luật và ngưỡng. Vượt ngưỡng thì chờ người.' },
    { m: 4, ten: 'Tự vận hành', mo: 'AI tự lập kế hoạch, tối ưu trong trần ngân sách. Người xem lại định kỳ.' },
    { m: 5, ten: 'Tự chủ có giám sát', mo: 'AI điều hành cả nhóm tác vụ. Người kiểm tra mẫu và ngoại lệ.' }
  ];

  // ── Nghiệp vụ: mỗi nghiệp vụ một mức AI, ngưỡng và người duyệt (chỉnh ở Thiết lập) ──
  var NGHIEP_VU = [
    { id: 'nhan-don', khoi: 'kd', ten: 'Nhận đơn & xác nhận đơn', agent: 'A-KD', muc: 3, nguong: 50e6, donVi: 'giá trị đơn', duyet: 'kd' },
    { id: 'bao-gia', khoi: 'kd', ten: 'Báo giá & chiết khấu', agent: 'A-KD', muc: 2, nguong: 5, donVi: '% chiết khấu', duyet: 'kd' },
    { id: 'han-muc', khoi: 'ht', ten: 'Duyệt vượt hạn mức công nợ', agent: 'A-TC', muc: 1, nguong: 0, donVi: 'đồng vượt', duyet: 'ceo' },
    { id: 'giu-hang', khoi: 'kv', ten: 'Giữ hàng & lập phiếu xuất', agent: 'A-KHO', muc: 4, nguong: 0, donVi: '', duyet: 'kho' },
    { id: 'giao-hang', khoi: 'kv', ten: 'Điều phối giao hàng', agent: 'A-KHO', muc: 3, nguong: 30, donVi: 'km nội tỉnh', duyet: 'kho' },
    { id: 'du-bao', khoi: 'hd', ten: 'Dự báo & đề xuất bổ sung tồn', agent: 'A-HD', muc: 3, nguong: 0, donVi: '', duyet: 'hd' },
    { id: 'dat-ncc', khoi: 'nh', ten: 'Đặt hàng nhà cung cấp', agent: 'A-MH', muc: 2, nguong: 80e6, donVi: 'giá trị PO', duyet: 'mh' },
    { id: 'nhap-kho', khoi: 'kv', ten: 'Nhận hàng & kiểm đếm', agent: 'A-KHO', muc: 2, nguong: 1, donVi: '% lệch', duyet: 'kho' },
    { id: 'hoa-don', khoi: 'ht', ten: 'Xuất hóa đơn & khớp tiền về', agent: 'A-TC', muc: 4, nguong: 0, donVi: '', duyet: 'tc' },
    { id: 'nhac-no', khoi: 'ht', ten: 'Nhắc nợ khách hàng', agent: 'A-TC', muc: 3, nguong: 30, donVi: 'ngày quá hạn', duyet: 'tc' },
    { id: 'tra-loi', khoi: 'dv', ten: 'Trả lời khách (Zalo, email)', agent: 'A-CS', muc: 3, nguong: 0, donVi: '', duyet: 'cs' },
    { id: 'doi-tra', khoi: 'dv', ten: 'Đổi trả & bồi hoàn', agent: 'A-CS', muc: 2, nguong: 2e6, donVi: 'giá trị bồi hoàn', duyet: 'cs' },
    { id: 'quang-cao', khoi: 'mk', ten: 'Chạy quảng cáo', agent: 'A-MK', muc: 3, nguong: 2e6, donVi: 'ngân sách/ngày', duyet: 'mk' },
    { id: 'noi-dung', khoi: 'mk', ten: 'Đăng nội dung & khuyến mãi', agent: 'A-MK', muc: 2, nguong: 0, donVi: '', duyet: 'mk' },
    { id: 'gia-ban', khoi: 'nh', ten: 'Điều chỉnh giá bán', agent: 'A-MH', muc: 1, nguong: 0, donVi: '', duyet: 'ceo' }
  ];

  // ── Lịch sử 90 ngày ───────────────────────────────────────────────────────
  // Chuỗi ngày: doanh thu, lãi gộp, đơn, đơn trễ, tiền thu, tiền chi, việc AI tự làm / AI soạn người duyệt / người làm.
  var KENH_W = { daily: 0.38, sieuthi: 0.22, san: 0.2, b2b: 0.12, le: 0.08 };
  var GT_DON = { daily: [4e6, 14e6], sieuthi: [6e6, 22e6], san: [0.25e6, 1.2e6], b2b: [5e6, 40e6], le: [0.2e6, 1.5e6] };
  var DON_NGAY = { daily: 3.6, sieuthi: 1.4, san: 22, b2b: 0.4, le: 9 };

  function themNgay(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function khoaNgay(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }

  var NGAY = [];          // tổng hợp theo ngày
  var DON = [];           // đơn chi tiết 14 ngày gần nhất
  var soDon = 2400;
  var ngayBatDau = themNgay(HOM_NAY, -NGAY_LS);
  ngayBatDau.setHours(0, 0, 0, 0);

  for (var i = 0; i < NGAY_LS; i++) {
    var d = themNgay(ngayBatDau, i);
    var thu = d.getDay();
    var hs = (thu === 0 ? 0.55 : thu === 6 ? 0.8 : 1) * (1 + i * 0.0021) * (d.getDate() >= 26 ? 1.12 : 1);
    if (d.getMonth() === 9 && d.getDate() >= 18 && d.getDate() <= 22) hs *= 1.25; // tuần 20/10
    var ng = { ngay: khoaNgay(d), thu: thu, dt: 0, lg: 0, don: 0, tre: 0, theoKenh: {}, theoNhom: {}, aiTu: 0, aiSoan: 0, nguoi: 0, khieuNai: 0, quangCao: 0, lead: 0 };
    KENH.forEach(function (k) { ng.theoKenh[k.id] = 0; });
    NHOM.forEach(function (n) { ng.theoNhom[n.id] = 0; });

    KENH.forEach(function (k) {
      var n = Math.max(0, Math.round(DON_NGAY[k.id] * hs * rnd(0.75, 1.25)));
      for (var j = 0; j < n; j++) {
        var gt = rnd(GT_DON[k.id][0], GT_DON[k.id][1]);
        var nhom = pickW(NHOM.map(function (x) { return x.id; }), [0.3, 0.27, 0.13, 0.18, 0.12]);
        var bien = rnd(0.2, 0.3) - (k.id === 'san' ? 0.03 : 0) + (k.id === 'le' ? 0.05 : 0);
        ng.dt += gt; ng.lg += gt * bien; ng.don++;
        ng.theoKenh[k.id] += gt; ng.theoNhom[nhom] += gt;
        var tre = R() < (i > 70 ? 0.07 : 0.045);
        if (tre) ng.tre++;
        // Người hay AI xử lý: trước khi tái cấu trúc (60 ngày đầu) chủ yếu là người.
        var tyLeAi = i < 30 ? 0.08 : i < 60 ? 0.38 + (i - 30) * 0.012 : 0.74 + (i - 60) * 0.004;
        var r = R();
        if (r < tyLeAi * 0.72) ng.aiTu++; else if (r < tyLeAi) ng.aiSoan++; else ng.nguoi++;
        if (i >= NGAY_LS - 14) {
          var kh = pick(KH.filter(function (x) { return x.kenh === k.id; }));
          var gio = new Date(d); gio.setHours(rint(7, 20), rint(0, 59));
          DON.push({ ma: 'DH-' + (++soDon), luc: gio.toISOString(), kh: kh.ma, kenh: k.id, nhom: nhom, gt: Math.round(gt / 1000) * 1000,
            tt: tre && i > NGAY_LS - 3 ? 'tre' : (i > NGAY_LS - 2 && R() < 0.4 ? 'dang-giao' : 'xong'), xuLy: r < tyLeAi * 0.72 ? 'ai' : r < tyLeAi ? 'ai-duyet' : 'nguoi' });
        }
      }
    });
    ng.khieuNai = Math.round(ng.don * rnd(0.01, 0.025));
    ng.quangCao = Math.round(rnd(1.2, 2.1) * 1e6 * (thu === 0 ? 0.6 : 1));
    ng.lead = Math.round(ng.quangCao / rnd(38000, 62000));
    ng.thuTien = ng.dt * rnd(0.82, 1.12);
    // Chi: tiền hàng + chi phí cố định (lương mùng 5, thuê kho mùng 1, chi phí vận hành rải đều).
    ng.chiTien = ng.dt * rnd(0.68, 0.84) + ng.quangCao + 3.4e6 + (d.getDate() === 5 ? 168e6 : 0) + (d.getDate() === 1 ? 45e6 : 0);
    NGAY.push(ng);
  }

  // Tiền mặt cuối ngày: cộng dồn thu – chi từ số dư đầu kỳ.
  var tien = 1.18e9;
  NGAY.forEach(function (n) { tien += n.thuTien - n.chiTien; n.tienMat = tien; });

  // Công nợ phải thu: rải theo khách có hạn mức, vài khách quá hạn để có chuyện kể.
  KH.forEach(function (k) {
    if (!k.hanMuc) return;
    k.congNo = Math.round(k.hanMuc * rnd(0.25, 0.78) / 1e5) * 1e5;
    k.quaHan = R() < 0.14 ? Math.round(k.congNo * rnd(0.15, 0.45) / 1e5) * 1e5 : 0;
    k.soNgayQH = k.quaHan ? rint(5, 48) : 0;
  });
  // Khách cố định cho các tình huống
  var khBX = KH.find(function (k) { return k.ma === 'BX'; }); khBX.congNo = 118e6; khBX.quaHan = 0;
  var khHD = KH.find(function (k) { return k.ma === 'HD'; }); khHD.congNo = 84e6; khHD.quaHan = 46e6; khHD.soNgayQH = 37;

  // Đơn mua đang mở
  var PO = [
    { ma: 'PO-1187', ncc: 'NB', gt: 214e6, tao: '2026-10-14', duKien: '2026-11-06', tt: 'dang-ve', dong: 'Chảo chống dính 26/28cm, dao thái' },
    { ma: 'PO-1192', ncc: 'DM', gt: 96.5e6, tao: '2026-10-29', duKien: '2026-11-03', tt: 'dang-ve', dong: 'Nồi chiên không dầu, ấm siêu tốc' },
    { ma: 'PO-1194', ncc: 'HP', gt: 38.2e6, tao: '2026-10-31', duKien: '2026-11-02', tt: 'da-nhan', dong: 'Hộp thủy tinh, hộp nhựa' }
  ];
  var CONG_NO_NCC = { KL: 62e6, TV: 148e6, HP: 21e6, NB: 214e6, DM: 96.5e6 };

  // Chiến dịch marketing
  var CHIEN_DICH = [
    { ma: 'CD-T10', ten: 'Tuần lễ Bếp Việt 20/10', kenh: 'Facebook + TikTok', ngan: 18e6, chi: 17.4e6, lead: 412, don: 96, dt: 128e6, tt: 'xong' },
    { ma: 'CD-AO', ten: 'Quảng cáo luôn bật — sàn TMĐT', kenh: 'Sàn TMĐT', ngan: 1.6e6, chi: 1.52e6, lead: 0, don: 41, dt: 21.8e6, tt: 'chay', ngay: true }
  ];

  // Phiếu CSKH đang mở
  var PHIEU = [
    { ma: 'CS-588', kh: 'ZL', loai: 'Hỏi bảo hành', kenh: 'Zalo', tt: 'ai-xong', luc: '2026-11-03T07:12' },
    { ma: 'CS-589', kh: 'SM', loai: 'Giao thiếu 2 thùng', kenh: 'Email', tt: 'dang-xu-ly', luc: '2026-11-02T16:40', nguoi: 'cs' },
    { ma: 'CS-590', kh: 'WEB', loai: 'Đổi màu sản phẩm', kenh: 'Web', tt: 'ai-xong', luc: '2026-11-03T07:48' }
  ];

  window.ABZ = window.ABZ || {};
  window.ABZ.DATA = {
    rng: rng, HOM_NAY: HOM_NAY, CONG_TY: CONG_TY, KHO: KHO, NHOM: NHOM, NCC: NCC, SP: SP, KENH: KENH, KH: KH,
    NGUOI: NGUOI, AGENT: AGENT, KHOI: KHOI, MUC: MUC, NGHIEP_VU: NGHIEP_VU, NGAY: NGAY, DON: DON, PO: PO,
    CONG_NO_NCC: CONG_NO_NCC, CHIEN_DICH: CHIEN_DICH, PHIEU: PHIEU, soDon: soDon
  };
})();
