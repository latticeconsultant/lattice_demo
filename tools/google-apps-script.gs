/**
 * LATTICE Next — nhận đăng ký, đối soát thanh toán, cấp dữ liệu cho trang quản trị.
 *
 * CÁCH TRIỂN KHAI:
 *  1. Mở Google Sheet đang dùng → Tiện ích mở rộng (Extensions) → Apps Script.
 *  2. Xoá hết, dán toàn bộ file này vào, Lưu.
 *  3. Triển khai → Quản lý triển khai → sửa bản đang có → Phiên bản: Mới → Triển khai.
 *     Nếu tạo triển khai MỚI thì URL đổi và phải dán lại vào hai trang biểu mẫu.
 *     Loại: Ứng dụng web · Thực thi với tư cách: Tôi · Ai truy cập: Bất kỳ ai.
 *
 * BA CỬA VÀO:
 *  - POST không kèm tham số sepay : biểu mẫu đăng ký gửi lên
 *  - POST kèm ?sepay=<mật mã>     : webhook SePay báo tiền về
 *  - GET kèm ?token=<mã>          : trang quản trị đọc và ghi
 *
 * HAI BÍ MẬT nằm ở ⚙️ Cài đặt dự án → Thuộc tính tập lệnh, KHÔNG viết vào file này
 * vì mã nguồn đi lên GitHub công khai:
 *      ADMIN_TOKEN   mã truy cập cho trang quản trị
 *      SEPAY_SECRET  mật mã webhook SePay
 */

// Dấu phiên bản: đổi mỗi lần sửa file này. Gọi ?token=...&viec=phienBan để biết
// chắc bản nào đang chạy — Apps Script phục vụ bản ĐÃ TRIỂN KHAI, không phải mã
// vừa lưu, nên dán xong mà quên chọn "Phiên bản: Mới" là vẫn chạy mã cũ.
var PHIEN_BAN = '2026-09-13 · 7';

var CH = {
  emailBao: 'lattice.consultant@gmail.com',     // nhận thông báo mỗi đăng ký mới
  thueSuat: 0.10,                               // VAT trên giá đã niêm yết
  taiKhoan: { nganHang: 'ACB — Ngân hàng Á Châu', bin: '970416',
              so: '50359267', chu: 'DANG QUOC TUAN' }
};

var TEN_DANG_KY = 'Đăng ký';
var TEN_NHAT_KY = 'Nhật ký';

var GIA = { 'LATTICE Scan': 499000, 'LATTICE Blueprint': 1499000 };

// Thứ tự cột trong sheet. Khoá phải khớp thuộc tính name= của ô trên biểu mẫu.
var COT = [
  ['thoi_gian',        'Thời gian'],
  ['ma_ho_so',         'Mã hồ sơ'],
  ['goi',              'Gói'],
  ['so_tien',          'Số tiền'],
  ['noi_dung_ck',      'Nội dung CK'],
  ['trang_thai',       'Trạng thái'],
  ['ngon_ngu',         'Ngôn ngữ'],
  ['ten_doanh_nghiep', 'Tên doanh nghiệp'],
  ['nguoi_dai_dien',   'Người đại diện'],
  ['chuc_danh',        'Chức danh'],
  ['email',            'Email'],
  ['dien_thoai',       'Điện thoại / Zalo'],
  ['website',          'Website / kênh bán'],
  ['loai_hinh',        'Loại hình'],
  ['loai_hinh_khac',   'Loại hình — ghi rõ'],
  ['linh_vuc',         'Lĩnh vực'],
  ['linh_vuc_khac',    'Lĩnh vực — ghi rõ'],
  ['quy_mo_nhan_su',   'Quy mô nhân sự'],
  ['so_nam',           'Số năm hoạt động'],
  ['doanh_so_2024',    'Doanh số 2024'],
  ['doanh_so_2025',    'Doanh số 2025'],
  ['doanh_so_2026',    'Doanh số 2026'],
  ['quan_tam',         'Quan tâm nhất'],
  ['mo_ta',            'Vấn đề cần cải thiện'],
  ['dong_y',           'Đồng ý liên hệ'],
  ['dong_y_chinh_sach','Đồng ý chính sách phí'],
  ['tien_thuc',        'Tiền thực nhận'],
  ['luc_thu',          'Lúc nhận tiền'],
  ['lich_hen',         'Lịch làm việc'],
  ['ghi_chu_noi_bo',   'Ghi chú nội bộ']
];

// Sheet nuốt số 0 đầu: 0853999566 thành 853999566, gọi theo đó là gọi nhầm người.
var COT_VAN_BAN = ['dien_thoai', 'ma_ho_so', 'noi_dung_ck', 'so_tien', 'tien_thuc'];

var TRANG_THAI = ['cho_thanh_toan', 'da_thu', 'da_gui_bch', 'da_hen', 'xong', 'huy'];


/* ═══ CỬA 1 · biểu mẫu đăng ký ═══════════════════════════════════════════ */

function doPost(e) {
  // Webhook SePay cũng POST vào đúng địa chỉ này — phân luồng trước khi làm gì khác.
  if (e && e.parameter && e.parameter.sepay) return nhanTienVe_(e);

  var khoa = LockService.getScriptLock();
  khoa.waitLock(30000);
  try {
    var p = (e && e.parameter) || {};
    var nhieu = (e && e.parameters) || {};

    // Khách bấm "Tôi đã chuyển khoản" ở bước 3. Ghi lại để đối chiếu tay khi
    // đối soát tự động không khớp — khách gõ sai nội dung, hoặc chuyển từ tài
    // khoản mang tên người khác. KHÔNG tự đổi trạng thái sang đã thu: lời khách
    // nói không phải bằng chứng tiền về.
    if (p.da_chuyen && p.ma_ho_so && timDong_(p.ma_ho_so)) {
      if (!daGhiNhatKy_(p.ma_ho_so, 'khach_bao_da_ck')) {
        ghiNhatKy_(p.ma_ho_so, 'khach_bao_da_ck', 'Khách bấm "Tôi đã chuyển khoản"');
        capNhatDong_(p.ma_ho_so, { ghi_chu_noi_bo: 'Khách báo đã chuyển lúc ' + new Date().toISOString() });
      }
      return ket_('OK');
    }

    // Gửi hai lần thì đừng ghi hai dòng, nhưng phải gửi bù thư nếu lần đầu hụt.
    if (p.ma_ho_so && timDong_(p.ma_ho_so)) {
      if (!daGhiNhatKy_(p.ma_ho_so, 'thu_dang_ky')) thuXacNhan_(p);
      return ket_('OK');
    }

    var sh = sheet_(TEN_DANG_KY);
    var dong = COT.map(function (c) {
      var k = c[0];
      if (nhieu[k] && nhieu[k].length > 1) return nhieu[k].join(' · ');
      return p[k] || '';
    });
    if (!dong[0]) dong[0] = new Date().toISOString();
    dong[iCot_('trang_thai')] = 'cho_thanh_toan';
    // Không tin số tiền trình duyệt gửi lên — tính lại từ tên gói.
    dong[iCot_('so_tien')] = String(GIA[p.goi] || 0);

    sh.appendRow(dong);
    dinhDangVanBan_(sh, sh.getLastRow());

    if (CH.emailBao) baoDangKyMoi_(p, nhieu);
    thuXacNhan_(p);
    return ket_('OK');
  } catch (err) {
    console.error(err);
    return ket_('ERROR');
  } finally {
    khoa.releaseLock();
  }
}


/* ═══ CỬA 2 · webhook SePay ══════════════════════════════════════════════ */

function nhanTienVe_(e) {
  var matMa = biMat_('SEPAY_SECRET');
  if (!matMa || e.parameter.sepay !== matMa) return ket_('SAI MAT MA');

  var khoa = LockService.getScriptLock();
  khoa.waitLock(30000);
  try {
    var gd = {};
    try { gd = JSON.parse(e.postData.contents); } catch (x) { gd = e.parameter || {}; }

    // ① Chỉ quan tâm tiền VÀO. Tiền ra cũng gọi webhook.
    var vao = Number(gd.transferAmount || 0);
    if (String(gd.transferType || '').toLowerCase() !== 'in' || vao <= 0) return ket_('BO QUA');

    // ② Không mang dấu vết hồ sơ thì im lặng bỏ qua. Tài khoản còn dùng việc khác;
    //    ghi hết thì nhật ký ngập dòng vô nghĩa, người trực quen mắt bỏ qua luôn
    //    cả dòng thật sự cần xem.
    var noi = chuanHoa_(gd.content || '');
    if (noi.indexOf('LTC') < 0) return ket_('BO QUA');

    // ③ Khớp theo mã hồ sơ. KHÔNG lọc theo trạng thái ở đây: SePay gọi lại cùng
    //    một giao dịch là chuyện thường, lọc ở bước này sẽ báo "không khớp" nhầm.
    var ds = docTatCa_();
    var don = null;
    for (var i = 0; i < ds.length; i++) {
      if (ds[i].ma_ho_so && noi.indexOf(chuanHoa_(ds[i].ma_ho_so)) >= 0) { don = ds[i]; break; }
    }
    if (!don) {
      ghiNhatKy_('', 'tien_khong_khop', 'Có chữ LTC nhưng không khớp mã hồ sơ: ' + (gd.content || ''));
      return ket_('KHONG KHOP');
    }

    // ④ Xét trạng thái trước khi xét tiền.
    if (don.trang_thai && don.trang_thai !== 'cho_thanh_toan') {
      if (don.trang_thai === 'huy') ghiNhatKy_(don.ma_ho_so, 'tien_don_da_huy', 'Tiền về cho hồ sơ đã huỷ');
      return ket_('DA XU LY');
    }

    // ⑤ Thiếu tiền thì không xác nhận. Thừa thì cho qua. Biên 1.000đ bỏ phí vặt.
    var can = Number(don.so_tien || 0);
    if (can && vao + 1000 < can) {
      capNhatDong_(don.ma_ho_so, { ghi_chu_noi_bo: 'Nhận thiếu ' + tienChu_(vao) + ' / cần ' + tienChu_(can) });
      ghiNhatKy_(don.ma_ho_so, 'tien_thieu', 'Đúng hồ sơ nhưng thiếu tiền');
      return ket_('THIEU TIEN');
    }

    // ⑥ Xác nhận.
    // Xoá ghi chú "nhận thiếu" của lần chuyển trước, nếu có — để lại thì người
    // trực đọc nhầm là hồ sơ đang thiếu tiền trong khi đã thu đủ.
    capNhatDong_(don.ma_ho_so, { trang_thai: 'da_thu', tien_thuc: String(vao),
                                 luc_thu: new Date().toISOString(), ghi_chu_noi_bo: '' });
    ghiNhatKy_(don.ma_ho_so, 'tien_ve', 'Tự xác nhận ' + tienChu_(vao));
    don.tien_thuc = String(vao);
    thuDaThu_(don);
    if (CH.emailBao) {
      MailApp.sendEmail({ to: CH.emailBao,
        subject: 'Da nhan ' + tienChu_(vao) + ' — ' + (don.ten_doanh_nghiep || don.ma_ho_so),
        body: 'Mã hồ sơ: ' + don.ma_ho_so + '\nGói: ' + don.goi + '\nSố tiền: ' + tienChu_(vao) +
              '\n\nĐã gửi phiếu thu cho khách. Bước tiếp theo: soạn và gửi bảng câu hỏi.' });
    }
    return ket_('OK');
  } catch (err) {
    console.error(err);
    return ket_('ERROR');
  } finally {
    khoa.releaseLock();
  }
}


/* ═══ CỬA 3 · trang quản trị ═════════════════════════════════════════════ */

function doGet(e) {
  var p = (e && e.parameter) || {};
  // Cho xem dấu phiên bản mà không cần mã truy cập: chỉ là một chuỗi ngày tháng,
  // không lộ gì, mà lại giúp kiểm tra xem đã triển khai đúng bản chưa.
  if (p.viec === 'phienBanCongKhai') return ket_('LATTICE ' + PHIEN_BAN);

  var token = biMat_('ADMIN_TOKEN');
  if (!token || p.token !== token) return json_({ ok: false, loi: 'Sai mã truy cập' }, p.callback);

  try {
    if (p.viec === 'phienBan') {
      return json_({ ok: true, phienBan: PHIEN_BAN }, p.callback);
    }

    if (p.viec === 'danhSach') {
      return json_({ ok: true, don: docTatCa_(), trangThai: TRANG_THAI }, p.callback);
    }

    if (p.viec === 'capNhat') {
      var sua = {};
      ['trang_thai', 'lich_hen', 'ghi_chu_noi_bo', 'tien_thuc'].forEach(function (k) {
        if (typeof p[k] !== 'undefined') sua[k] = p[k];
      });
      if (sua.trang_thai === 'da_thu') sua.luc_thu = new Date().toISOString();
      capNhatDong_(p.ma, sua);
      ghiNhatKy_(p.ma, 'sua_tay', JSON.stringify(sua));
      return json_({ ok: true }, p.callback);
    }

    // Đánh dấu đã thu bằng tay, đồng thời gửi phiếu thu — dùng khi webhook chưa
    // nối, hoặc khách ghi sai nội dung chuyển khoản nên không tự khớp được.
    if (p.viec === 'xacNhanThu') {
      var don = timDong_(p.ma);
      if (!don) return json_({ ok: false, loi: 'Không thấy mã hồ sơ' }, p.callback);
      var tien = Number(p.tien_thuc || don.so_tien || 0);
      capNhatDong_(p.ma, { trang_thai: 'da_thu', tien_thuc: String(tien),
                           luc_thu: new Date().toISOString(), ghi_chu_noi_bo: '' });
      don.tien_thuc = String(tien);
      var daGui = thuDaThu_(don);
      ghiNhatKy_(p.ma, 'thu_tay', 'Xác nhận tay ' + tienChu_(tien) + (daGui ? '' : ' · KHÔNG gửi được phiếu thu'));
      return json_({ ok: true, daGuiThu: daGui,
        loi: daGui ? '' : 'Đã ghi nhận đã thu, nhưng hồ sơ này không có email hợp lệ nên chưa gửi được phiếu thu.'
      }, p.callback);
    }

    if (p.viec === 'guiLaiThu') {
      var d = timDong_(p.ma);
      if (!d) return json_({ ok: false, loi: 'Không thấy mã hồ sơ' }, p.callback);
      if (p.loai === 'phieu_thu') thuDaThu_(d); else thuXacNhan_(d);
      return json_({ ok: true }, p.callback);
    }

    if (p.viec === 'nhatKy') {
      var sh = sheet_(TEN_NHAT_KY);
      var v = sh.getDataRange().getValues();
      var ra = [];
      for (var i = Math.max(1, v.length - 200); i < v.length; i++) {
        ra.push({ luc: String(v[i][0]), ma: String(v[i][1]), loai: String(v[i][2]), chi_tiet: String(v[i][3]) });
      }
      return json_({ ok: true, nhatKy: ra.reverse() }, p.callback);
    }

    return json_({ ok: false, loi: 'Không rõ việc cần làm' }, p.callback);
  } catch (err) {
    console.error(err);
    return json_({ ok: false, loi: String(err) }, p.callback);
  }
}


/* ═══ Thư ════════════════════════════════════════════════════════════════ */

function thuXacNhan_(p) {
  var toi = String(p.email || '').trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(toi)) return;
  try {
    var en = (p.ngon_ngu === 'en');
    var ten = String(p.nguoi_dai_dien || '').trim();
    var tt = thongTinCK_(p, en);
    var tieude, than;

    if (en) {
      tieude = 'LATTICE Next — we have your registration';
      than = (ten ? 'Dear ' + ten + ',' : 'Hello,') + '\n\n' +
        'Thank you for registering with LATTICE Next Solutions. We have your file' +
        (p.ten_doanh_nghiep ? ' for ' + p.ten_doanh_nghiep : '') +
        '. To complete it, please transfer using the details below.\n\n' + tt +
        'What happens next\n' +
        '  1. Once your payment arrives we send a receipt straight away.\n' +
        '  2. We create your file and send the preparation questionnaire.\n' +
        '  3. When you return it, we agree a time for the session.\n\n' +
        'Your information is kept confidential, used only to prepare and run the session, ' +
        'never for any other purpose, and never passed to a third party.\n\n' +
        'Questions: ' + CH.emailBao + ' · +84 853 999 566\n\n' +
        'LATTICE Next Solutions Joint Stock Company\nhttps://lattice.business/en/';
    } else {
      tieude = 'LATTICE Next — đã nhận phiếu đăng ký của anh chị';
      than = (ten ? 'Kính gửi ' + ten + ',' : 'Kính gửi anh chị,') + '\n\n' +
        'Cảm ơn anh chị đã đăng ký cùng LATTICE Next Solutions. Chúng tôi đã nhận được hồ sơ' +
        (p.ten_doanh_nghiep ? ' của ' + p.ten_doanh_nghiep : '') +
        '. Để hoàn tất, anh chị chuyển khoản theo thông tin dưới đây.\n\n' + tt +
        'Các bước tiếp theo\n' +
        '  1. Tiền về là chúng tôi gửi phiếu thu ngay.\n' +
        '  2. Chúng tôi tạo lập hồ sơ và gửi bảng câu hỏi chuẩn bị.\n' +
        '  3. Anh chị gửi lại, hai bên thống nhất lịch làm việc.\n\n' +
        'Thông tin anh chị cung cấp được giữ kín, chỉ dùng để chuẩn bị và thực hiện buổi làm việc, ' +
        'không dùng cho mục đích nào khác và không cung cấp cho bất kỳ bên thứ ba nào.\n\n' +
        'Cần trao đổi: ' + CH.emailBao + ' · 0853 999 566\n\n' +
        'Công ty Cổ phần Giải pháp LATTICE Next\nhttps://lattice.business/';
    }
    MailApp.sendEmail({ to: toi, subject: tieude, body: than,
                        htmlBody: thanHtml_(p, en, than),
                        name: 'LATTICE Next Solutions', replyTo: CH.emailBao });
    ghiNhatKy_(p.ma_ho_so || '', 'thu_dang_ky', 'Gửi tới ' + toi);
  } catch (err) {
    console.error('Không gửi được thư xác nhận: ' + err);
  }
}

/**
 * Bản HTML của thư xác nhận, có nhúng mã QR chuyển khoản.
 * Ảnh QR lấy từ img.vietqr.io theo địa chỉ động, số tiền và nội dung điền sẵn —
 * khách mở thư trên điện thoại là quét được ngay, không phải gõ gì.
 * Vẫn gửi kèm bản chữ thuần (body) cho trình đọc thư không hiện ảnh.
 */
function thanHtml_(p, en, banChu) {
  var t = CH.taiKhoan;
  var tien = GIA[p.goi] || Number(p.so_tien) || 0;
  var noiDung = p.noi_dung_ck || p.ma_ho_so || '';
  var ten = String(p.nguoi_dai_dien || '').trim();
  var qr = 'https://img.vietqr.io/image/' + t.bin + '-' + t.so + '-compact2.png'
    + '?amount=' + tien
    + '&addInfo=' + encodeURIComponent(noiDung)
    + '&accountName=' + encodeURIComponent(t.chu);

  var v = en
    ? { chao: 'Dear ', tag: 'Structure for what comes next',
        d1: 'LATTICE Next Solutions has received your registration <b>' + p.ma_ho_so + '</b> for the <b>' +
            (p.goi || '') + '</b> package.',
        d2: 'Your place is held. Please complete the transfer so we can open your file and start work:',
        tieu: 'PAYMENT DETAILS', nh: 'Bank', stk: 'Account number', chu: 'Account name',
        tien: 'Amount', nd: 'Reference',
        quet: 'Scan the QR with your banking app — the amount and reference are already filled in.',
        alt: 'Open the payment QR code',
        d3: 'As soon as the money arrives, the system sends you a receipt automatically and we send the preparation questionnaire.',
        tt: 'Kind regards,' }
    : { chao: 'Kính gửi anh/chị ', tag: 'Kiến trúc mô hình kinh doanh mới',
        d1: 'LATTICE Next Solutions đã nhận phiếu đăng ký <b>' + p.ma_ho_so + '</b> cho gói <b>' +
            (p.goi || '') + '</b>.',
        d2: 'Hồ sơ của anh chị đang được giữ. Xin hoàn tất chuyển khoản để chúng tôi mở hồ sơ và bắt đầu làm việc:',
        tieu: 'THÔNG TIN CHUYỂN KHOẢN', nh: 'Ngân hàng', stk: 'Số tài khoản', chu: 'Chủ tài khoản',
        tien: 'Số tiền', nd: 'Nội dung',
        quet: 'Quét mã QR bằng ứng dụng ngân hàng — số tiền và nội dung đã điền sẵn.',
        alt: 'Bấm để mở mã QR chuyển khoản',
        d3: 'Ngay khi tiền về, hệ thống tự gửi phiếu thu cho anh chị, và chúng tôi gửi bảng câu hỏi chuẩn bị.',
        tt: 'Trân trọng,' };

  var dong = function (nhan, giaTri, do_) {
    return '<p style="margin:0 0 7px;font-size:14.5px;color:#201E1D">' + nhan + ': <b' +
      (do_ ? ' style="color:#AE1800"' : '') + '>' + giaTri + '</b></p>';
  };

  return '' +
  '<div style="background:#F3F2F2;padding:24px 12px;font-family:Arial,Helvetica,sans-serif">' +
    '<div style="max-width:600px;margin:0 auto;background:#FFFFFF">' +

      '<div style="background:#201E1D;padding:22px 26px">' +
        '<div style="font-size:16px;font-weight:bold;letter-spacing:2px;color:#FFFFFF">LATTICE NEXT SOLUTIONS</div>' +
        '<div style="font-size:13px;color:#BAB6B6;margin-top:5px">' + v.tag + '</div>' +
      '</div>' +

      '<div style="padding:26px">' +
        '<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#201E1D">' +
          v.chao + '<b>' + (ten || '') + '</b>,</p>' +
        '<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#201E1D">' + v.d1 + '</p>' +
        '<p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#201E1D">' + v.d2 + '</p>' +

        '<div style="background:#FAF7F2;border:1px solid #E5DFD3;padding:20px">' +
          '<div style="font-size:12px;letter-spacing:1.5px;font-weight:bold;color:#605D5D;margin-bottom:14px">' +
            v.tieu + '</div>' +
          dong(v.nh, t.nganHang) + dong(v.stk, t.so) + dong(v.chu, t.chu) +
          dong(v.tien, tienChu_(tien), true) + dong(v.nd, noiDung, true) +
          // Bọc ảnh trong liên kết: nhiều trình đọc thư chặn ảnh từ xa, lúc đó
          // người nhận vẫn bấm vào chữ thay thế để mở mã QR ra xem.
          '<a href="' + qr + '" style="text-decoration:none">' +
            '<img src="' + qr + '" width="200" alt="' + v.alt + '" ' +
              'style="display:block;margin:16px 0 10px;border:1px solid #D7D3D3;background:#fff">' +
          '</a>' +
          '<div style="font-size:12.5px;line-height:1.5;color:#807C7C">' + v.quet + '</div>' +
        '</div>' +

        '<p style="margin:20px 0 20px;font-size:15px;line-height:1.6;color:#201E1D">' + v.d3 + '</p>' +
        '<p style="margin:0;font-size:15px;line-height:1.6;color:#201E1D">' + v.tt + '<br>' +
          '<b>LATTICE Next Solutions</b></p>' +
      '</div>' +

      '<div style="background:#F3F2F2;padding:16px 26px;font-size:12.5px;line-height:1.6;color:#807C7C">' +
        'Công ty Cổ phần Giải pháp LATTICE Next · ' + CH.emailBao + ' · 0853 999 566<br>' +
        '<a href="https://lattice.business/" style="color:#605D5D">lattice.business</a>' +
      '</div>' +

    '</div>' +
  '</div>';
}

function thuDaThu_(d) {
  var toi = String(d.email || '').trim();
  // Hồ sơ thiếu email thì không gửi được. Trả về false để nơi gọi báo cho người
  // trực biết, thay vì lặng lẽ bỏ qua rồi tưởng khách đã nhận phiếu thu.
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(toi)) return false;
  try {
    var en = (d.ngon_ngu === 'en');
    var ten = String(d.nguoi_dai_dien || '').trim();
    var tong = Number(d.tien_thuc || d.so_tien || 0);
    var truoc = Math.round(tong / (1 + CH.thueSuat));
    var thue = tong - truoc;
    var pc = Math.round(CH.thueSuat * 100);
    var tieude, than;

    if (en) {
      tieude = 'LATTICE Next — payment received, ' + (d.goi || '') + ' (' + d.ma_ho_so + ')';
      than = (ten ? 'Dear ' + ten + ',' : 'Hello,') + '\n\n' +
        'We have received your payment. Your file is now open and we are starting work on it.\n\n' +
        'RECEIPT\n' +
        '  Receipt no.    : ' + d.ma_ho_so + '\n' +
        '  Date           : ' + homNay_() + '\n' +
        '  Payer          : ' + (d.ten_doanh_nghiep || ten) + '\n' +
        '  For            : File-creation and administration fee — ' + (d.goi || '') + '\n' +
        '  Net            : ' + tienChu_(truoc) + '\n' +
        '  VAT ' + pc + '%       : ' + tienChu_(thue) + '\n' +
        '  Total received : ' + tienChu_(tong) + '\n' +
        '  Method         : bank transfer, ' + CH.taiKhoan.nganHang + '\n\n' +
        'This receipt confirms payment. It is not a VAT invoice — if you need one, reply to this email and we will issue it.\n\n' +
        'Next: we send the preparation questionnaire, then agree a time with you.\n\n' +
        'LATTICE Next Solutions Joint Stock Company\nhttps://lattice.business/en/';
    } else {
      tieude = 'LATTICE Next — đã nhận thanh toán, ' + (d.goi || '') + ' (' + d.ma_ho_so + ')';
      than = (ten ? 'Kính gửi ' + ten + ',' : 'Kính gửi anh chị,') + '\n\n' +
        'Chúng tôi đã nhận được thanh toán. Hồ sơ của anh chị đã mở và chúng tôi bắt đầu làm việc.\n\n' +
        'PHIẾU THU\n' +
        '  Số phiếu       : ' + d.ma_ho_so + '\n' +
        '  Ngày           : ' + homNay_() + '\n' +
        '  Người nộp      : ' + (d.ten_doanh_nghiep || ten) + '\n' +
        '  Nội dung       : Phí tạo lập hồ sơ và quản lý — ' + (d.goi || '') + '\n' +
        '  Trước thuế     : ' + tienChu_(truoc) + '\n' +
        '  Thuế GTGT ' + pc + '% : ' + tienChu_(thue) + '\n' +
        '  Tổng đã nhận   : ' + tienChu_(tong) + '\n' +
        '  Hình thức      : chuyển khoản, ' + CH.taiKhoan.nganHang + '\n\n' +
        'Phiếu thu này xác nhận đã nhận tiền, KHÔNG thay thế hoá đơn giá trị gia tăng. ' +
        'Anh chị cần hoá đơn GTGT thì trả lời thư này, chúng tôi xuất riêng.\n\n' +
        'Tiếp theo: chúng tôi gửi bảng câu hỏi chuẩn bị, sau đó thống nhất lịch làm việc.\n\n' +
        'Công ty Cổ phần Giải pháp LATTICE Next\nhttps://lattice.business/';
    }
    MailApp.sendEmail({ to: toi, subject: tieude, body: than,
                        name: 'LATTICE Next Solutions', replyTo: CH.emailBao });
    ghiNhatKy_(d.ma_ho_so, 'thu_phieu_thu', 'Gửi tới ' + toi);
    return true;
  } catch (err) {
    console.error('Không gửi được phiếu thu: ' + err);
    ghiNhatKy_(d.ma_ho_so, 'loi_gui_phieu_thu', String(err).slice(0, 120));
    return false;
  }
}

function baoDangKyMoi_(p, nhieu) {
  var than = COT.map(function (c) {
    var v = (nhieu[c[0]] && nhieu[c[0]].length > 1) ? nhieu[c[0]].join(' · ') : (p[c[0]] || '—');
    return c[1] + ': ' + v;
  }).join('\n');
  MailApp.sendEmail({ to: CH.emailBao,
    subject: 'Dang ky moi — ' + (p.goi || '') + ' — ' + (p.ten_doanh_nghiep || 'không rõ tên'),
    body: than + '\n\n— Gửi tự động từ lattice.business' });
}

function thongTinCK_(p, en) {
  if (!p.ma_ho_so) return '';
  var t = CH.taiKhoan;
  if (en) {
    return 'Payment details\n' +
      '  Package      : ' + (p.goi || '—') + '\n' +
      '  Amount       : ' + tienChu_(GIA[p.goi] || p.so_tien) + '\n' +
      '  Bank         : ' + t.nganHang + '\n' +
      '  Account      : ' + t.so + '\n' +
      '  Account name : ' + t.chu + '\n' +
      '  Reference    : ' + (p.noi_dung_ck || p.ma_ho_so) + '\n\n';
  }
  return 'Thông tin thanh toán\n' +
    '  Gói           : ' + (p.goi || '—') + '\n' +
    '  Số tiền       : ' + tienChu_(GIA[p.goi] || p.so_tien) + '\n' +
    '  Ngân hàng     : ' + t.nganHang + '\n' +
    '  Số tài khoản  : ' + t.so + '\n' +
    '  Chủ tài khoản : ' + t.chu + '\n' +
    '  Nội dung      : ' + (p.noi_dung_ck || p.ma_ho_so) + '\n\n';
}


/* ═══ Sheet ══════════════════════════════════════════════════════════════ */

function sheet_(ten) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(ten);
  if (!sh) {
    sh = ss.insertSheet(ten);
    var tieu = (ten === TEN_NHAT_KY)
      ? ['Lúc', 'Mã hồ sơ', 'Loại', 'Chi tiết']
      : COT.map(function (c) { return c[1]; });
    sh.appendRow(tieu);
    sh.getRange(1, 1, 1, tieu.length).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function iCot_(khoa) {
  for (var i = 0; i < COT.length; i++) if (COT[i][0] === khoa) return i;
  return -1;
}

function dinhDangVanBan_(sh, dong) {
  COT_VAN_BAN.forEach(function (k) {
    var c = iCot_(k);
    if (c >= 0) sh.getRange(dong, c + 1).setNumberFormat('@');
  });
}

function docTatCa_() {
  var v = sheet_(TEN_DANG_KY).getDataRange().getValues();
  var ra = [];
  for (var i = 1; i < v.length; i++) {
    var o = {};
    for (var j = 0; j < COT.length; j++) {
      // getDataRange() chỉ trả về vùng đã dùng. Mấy cột cuối còn trống ở MỌI dòng
      // thì nằm ngoài vùng đó, v[i][j] là undefined, String() biến thành chữ
      // "undefined" hiện lên trang quản trị.
      var c = v[i][j];
      o[COT[j][0]] = (c === null || typeof c === 'undefined') ? '' : String(c);
    }
    if (o.thoi_gian || o.ma_ho_so) ra.push(o);
  }
  return ra;
}

function timDong_(ma) {
  if (!ma) return null;
  var ds = docTatCa_();
  for (var i = 0; i < ds.length; i++) if (ds[i].ma_ho_so === ma) return ds[i];
  return null;
}

function capNhatDong_(ma, sua) {
  var sh = sheet_(TEN_DANG_KY);
  var v = sh.getDataRange().getValues();
  var c = iCot_('ma_ho_so');
  for (var i = 1; i < v.length; i++) {
    if (String(v[i][c]) !== String(ma)) continue;
    Object.keys(sua).forEach(function (k) {
      var j = iCot_(k);
      if (j >= 0) sh.getRange(i + 1, j + 1).setValue(sua[k]);
    });
    dinhDangVanBan_(sh, i + 1);
    return true;
  }
  return false;
}

function ghiNhatKy_(ma, loai, chiTiet) {
  try { sheet_(TEN_NHAT_KY).appendRow([new Date().toISOString(), ma || '', loai, chiTiet || '']); }
  catch (e) { console.error(e); }
}

function daGhiNhatKy_(ma, loai) {
  var v = sheet_(TEN_NHAT_KY).getDataRange().getValues();
  for (var i = 1; i < v.length; i++) if (String(v[i][1]) === ma && String(v[i][2]) === loai) return true;
  return false;
}


/* ═══ Vặt ════════════════════════════════════════════════════════════════ */

function biMat_(ten) {
  return PropertiesService.getScriptProperties().getProperty(ten) || '';
}

function chuanHoa_(s) { return String(s).toUpperCase().replace(/[^A-Z0-9]/g, ''); }

function tienChu_(v) {
  var n = Number(v) || 0;
  return n ? n.toLocaleString('vi-VN') + 'đ' : '0đ';
}

function homNay_() {
  return Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy');
}

function ket_(s) {
  return ContentService.createTextOutput(s).setMimeType(ContentService.MimeType.TEXT);
}

// Apps Script không đặt được header CORS, nên trang quản trị ở tên miền khác
// phải gọi bằng JSONP qua thẻ <script>.
function json_(o, callback) {
  var s = JSON.stringify(o);
  return callback
    ? ContentService.createTextOutput(callback + '(' + s + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT)
    : ContentService.createTextOutput(s).setMimeType(ContentService.MimeType.JSON);
}
