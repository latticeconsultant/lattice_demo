/**
 * Nhận đăng ký chẩn đoán từ lattice.business/dang-ky/ và ghi vào Google Sheet.
 *
 * CÁCH TRIỂN KHAI — làm một lần, khoảng 5 phút:
 *
 *  1. Vào https://sheets.new tạo bảng tính mới, đặt tên "LATTICE — Đăng ký chẩn đoán".
 *     Bảng này nằm trong Google Drive của tài khoản đang đăng nhập.
 *  2. Trong bảng tính: menu Tiện ích mở rộng (Extensions) → Apps Script.
 *  3. Xóa hết nội dung mẫu, dán toàn bộ file này vào.
 *  4. EMAIL_BAO đã điền sẵn lattice.consultant@gmail.com. Đổi ở dưới nếu muốn
 *     địa chỉ khác; để trống thì không gửi thông báo.
 *  5. Bấm Triển khai (Deploy) → Tùy chọn triển khai mới (New deployment)
 *       Loại (Type)            : Ứng dụng web (Web app)
 *       Thực thi với tư cách   : Tôi (Me)
 *       Ai có quyền truy cập   : Bất kỳ ai (Anyone)   ← bắt buộc, không phải "Anyone with Google account"
 *  6. Google hỏi cấp quyền lần đầu → Nâng cao (Advanced) → Đi tới … (không an toàn) → Cho phép.
 *  7. Copy URL web app (dạng https://script.google.com/macros/s/AKfy…/exec).
 *  8. Dán URL đó vào biến ENDPOINT trong CẢ HAI file:
 *         dang-ky/index.html
 *         register/index.html
 *     rồi commit và push.
 *
 * LƯU Ý: mỗi lần sửa file này phải Triển khai → Quản lý triển khai → sửa bản
 * hiện có → Phiên bản: Mới. Nếu tạo triển khai mới thì URL đổi, phải dán lại.
 */

var EMAIL_BAO = 'lattice.consultant@gmail.com';   // nhận thông báo mỗi khi có đăng ký mới
var TEN_TRANG_TINH = 'Đăng ký';

// Thứ tự cột trong bảng. Khóa phải khớp thuộc tính name= của ô trên form.
var COT = [
  ['thoi_gian',       'Thời gian'],
  ['ngon_ngu',        'Ngôn ngữ'],
  ['ten_doanh_nghiep','Tên doanh nghiệp'],
  ['nguoi_dai_dien',  'Người đại diện'],
  ['chuc_danh',       'Chức danh'],
  ['email',           'Email'],
  ['dien_thoai',      'Điện thoại / Zalo'],
  ['website',         'Website / kênh bán'],
  ['loai_hinh',       'Loại hình'],
  ['loai_hinh_khac',  'Loại hình — ghi rõ'],
  ['linh_vuc',        'Lĩnh vực'],
  ['linh_vuc_khac',   'Lĩnh vực — ghi rõ'],
  ['quy_mo_nhan_su',  'Quy mô nhân sự'],
  ['so_nam',          'Số năm hoạt động'],
  ['doanh_so_2024',   'Doanh số 2024'],
  ['doanh_so_2025',   'Doanh số 2025'],
  ['doanh_so_2026',   'Doanh số 2026'],
  ['quan_tam',        'Quan tâm nhất'],
  ['mo_ta',           'Vấn đề cần cải thiện'],
  ['dong_y',          'Đồng ý liên hệ']
];

function doPost(e) {
  var khoa = LockService.getScriptLock();
  // Hai người gửi cùng lúc mà không khóa thì hai dòng ghi đè lên nhau.
  khoa.waitLock(30000);
  try {
    var p = (e && e.parameter) || {};
    var nhieu = (e && e.parameters) || {};

    var sh = layTrangTinh_();
    var dong = COT.map(function (c) {
      var k = c[0];
      // quan_tam là ô tích chọn nhiều — gộp lại một ô cho dễ đọc
      if (nhieu[k] && nhieu[k].length > 1) return nhieu[k].join(' · ');
      return p[k] || '';
    });
    if (!dong[0]) dong[0] = new Date().toISOString();
    sh.appendRow(dong);

    if (EMAIL_BAO) baoEmail_(p, nhieu);
    thuXacNhan_(p);
    return ket_('OK');
  } catch (err) {
    // Vẫn trả 200 để trình duyệt người đăng ký không thấy trang lỗi của Google.
    // Lỗi xem ở Apps Script → Nhật ký thực thi (Executions).
    console.error(err);
    return ket_('ERROR');
  } finally {
    khoa.releaseLock();
  }
}

function doGet() {
  return ket_('LATTICE dang ky endpoint. Gui bang POST.');
}

function layTrangTinh_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(TEN_TRANG_TINH);
  if (!sh) {
    sh = ss.insertSheet(TEN_TRANG_TINH);
    sh.appendRow(COT.map(function (c) { return c[1]; }));
    sh.getRange(1, 1, 1, COT.length).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function baoEmail_(p, nhieu) {
  var than = COT.map(function (c) {
    var v = (nhieu[c[0]] && nhieu[c[0]].length > 1) ? nhieu[c[0]].join(' · ') : (p[c[0]] || '—');
    return c[1] + ': ' + v;
  }).join('\n');
  MailApp.sendEmail({
    to: EMAIL_BAO,
    subject: 'Đăng ký chẩn đoán — ' + (p.ten_doanh_nghiep || 'không rõ tên'),
    body: than + '\n\n— Gửi tự động từ lattice.business'
  });
}

/**
 * Thư xác nhận gửi cho người vừa đăng ký. Gửi theo đúng ngôn ngữ họ dùng.
 * Bọc trong try riêng: email hỏng thì dòng dữ liệu vẫn phải được giữ.
 */
function thuXacNhan_(p) {
  var toi = (p.email || '').trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(toi)) return;
  try {
    var en = (p.ngon_ngu === 'en');
    var ten = (p.nguoi_dai_dien || '').trim();
    var tieude, than;

    if (en) {
      tieude = 'LATTICE Next — we have your registration';
      than =
        (ten ? 'Dear ' + ten + ',' : 'Hello,') + '\n\n' +
        'Thank you for registering for a diagnostic session with LATTICE Next Solutions. ' +
        'This email confirms that we have received your form' +
        (p.ten_doanh_nghiep ? ' for ' + p.ten_doanh_nghiep : '') + '.\n\n' +
        'What happens next\n' +
        '  1. We review what you sent and come back to you with the next steps.\n' +
        '  2. We agree a time that suits you.\n' +
        '  3. Before the session we send a short preparation questionnaire. ' +
        'Completing it beforehand means the session goes to analysis rather than basic questions.\n\n' +
        'Your information is kept confidential. We use it only to prepare and run the session, ' +
        'never for any other purpose, and we do not pass it to any third party.\n\n' +
        'If you need to reach us sooner: ' + EMAIL_BAO + ' · +84 853 999 566\n\n' +
        'LATTICE Next Solutions Joint Stock Company\n' +
        'https://lattice.business/en/';
    } else {
      tieude = 'LATTICE Next — đã nhận phiếu đăng ký của anh chị';
      than =
        (ten ? 'Kính gửi ' + ten + ',' : 'Kính gửi anh chị,') + '\n\n' +
        'Cảm ơn anh chị đã đăng ký buổi chẩn đoán cùng LATTICE Next Solutions. ' +
        'Thư này xác nhận chúng tôi đã nhận được phiếu đăng ký' +
        (p.ten_doanh_nghiep ? ' của ' + p.ten_doanh_nghiep : '') + '.\n\n' +
        'Các bước tiếp theo\n' +
        '  1. Chúng tôi xem lại thông tin anh chị gửi và phản hồi về các bước tiếp theo.\n' +
        '  2. Hai bên thống nhất lịch làm việc phù hợp với anh chị.\n' +
        '  3. Trước buổi làm việc, chúng tôi gửi bảng câu hỏi chuẩn bị. ' +
        'Anh chị hoàn thiện trước để buổi làm việc dùng vào phân tích thay vì hỏi đáp thông tin cơ bản.\n\n' +
        'Thông tin anh chị cung cấp được giữ kín, chỉ dùng để chuẩn bị và thực hiện buổi làm việc, ' +
        'không dùng cho bất kỳ mục đích nào khác và không cung cấp cho bất kỳ bên thứ ba nào.\n\n' +
        'Cần trao đổi sớm, anh chị liên hệ: ' + EMAIL_BAO + ' · 0853 999 566\n\n' +
        'Công ty Cổ phần Giải pháp LATTICE Next\n' +
        'https://lattice.business/';
    }

    MailApp.sendEmail({ to: toi, subject: tieude, body: than, name: 'LATTICE Next Solutions',
                        replyTo: EMAIL_BAO || undefined });
  } catch (err) {
    console.error('Không gửi được thư xác nhận: ' + err);
  }
}

function ket_(s) {
  return ContentService.createTextOutput(s).setMimeType(ContentService.MimeType.TEXT);
}
