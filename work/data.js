/* Lattice Work — bản mẫu · TẦNG DỮ LIỆU
 *
 * Mọi thay đổi dữ liệu đi qua file này. Giao diện (app.js) chỉ gọi hàm ở đây,
 * không sửa DB trực tiếp. Các ràng buộc trong tài liệu mục 6 và mục 11 — người
 * chủ trì bắt buộc, việc agent phải qua duyệt, chỉ người chủ trì được duyệt,
 * bốn điều cấm — được kiểm ở đây, để lách giao diện vẫn không lách được luật.
 *
 * Ở bản chạy thật, lớp này nằm phía máy chủ (Postgres: NOT NULL, trigger, RLS).
 * Ở bản mẫu nó chạy trong trình duyệt và lưu vào localStorage.
 * File không đụng tới DOM nên chạy được cả bằng Node để kiểm thử.
 */
(function (root) {
  'use strict';

  var KEY = 'lattice-work.proto.v2';
  var ST = ['cho_giao', 'dang_lam', 'cho_duyet', 'xong'];
  var ROLES = ['owner', 'pm', 'mem', 'guest'];
  var READS = ['viec', 'kenh', 'ledger', 'drive'];
  var CANS = ['ghi_chu', 'tao_viec', 'web', 'xuat_file'];

  // 4.1 · Trục quyền hạn — làm được gì
  var PERM = {
    view: ROLES,
    create: ['owner', 'pm', 'mem'],
    assignOthers: ['owner', 'pm'],
    approve: ['owner', 'pm'],
    runAgent: ['owner', 'pm', 'mem'],
    launchFlow: ['owner', 'pm'],
    admin: ['owner'],
    editSelf: ROLES
  };

  // 5.2 · Bốn điều không cấu hình được — văn bản cố định, không phải ô tích
  var FORBIDDEN = [
    { code: 'agentNoEmail', vi: 'Gửi email ra ngoài', en: 'Send email outside', why_vi: 'đã gửi cho khách thì không rút lại được', why_en: 'a sent email cannot be recalled' },
    { code: 'agentCannotApprove', vi: 'Duyệt việc', en: 'Approve work', why_vi: 'agent tự duyệt thì mất dấu vết kiểm toán', why_en: 'self-approval destroys the audit trail' },
    { code: 'agentCannotDelete', vi: 'Xóa dữ liệu', en: 'Delete data', why_vi: 'không khôi phục được', why_en: 'cannot be restored' },
    { code: 'agentCannotEditLedger', vi: 'Sửa Scope Ledger', en: 'Edit the Scope Ledger', why_vi: 'phá chính mốc chuẩn khiến việc dò trôi phạm vi có ý nghĩa', why_en: 'it breaks the baseline that makes drift detection meaningful' }
  ];

  function LWError(code, extra) {
    this.name = 'LWError'; this.code = code; this.extra = extra || '';
    this.message = code + (extra ? ': ' + extra : '');
  }
  LWError.prototype = Object.create(Error.prototype);

  /* ---------- tiện ích ---------- */
  function uid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16);
    });
  }
  function z(n) { return String(n).padStart(2, '0'); }
  function ymd(d) { return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()); }
  function today() { return ymd(new Date()); }
  function addDays(s, n) { var p = s.split('-').map(Number); return ymd(new Date(p[0], p[1] - 1, p[2] + n)); }
  function nowIso(minAgo) { return new Date(Date.now() - (minAgo || 0) * 60000).toISOString(); }
  function vnd(x) { return Math.round(x).toLocaleString('vi-VN') + 'đ'; }
  function num(x) { return String(x).replace('.', ','); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  // SHA-256 thuần JS — để chạy được cả khi mở file trực tiếp (file://),
  // nơi một số trình duyệt không cấp crypto.subtle.
  function sha256(str) {
    var K = [], H = [], n = 2, c = 0;
    function prime(x) { for (var i = 2; i * i <= x; i++) if (x % i === 0) return false; return true; }
    function frac(x) { return ((x - Math.floor(x)) * 4294967296) | 0; }
    while (c < 64) { if (prime(n)) { if (c < 8) H[c] = frac(Math.pow(n, 1 / 2)); K[c] = frac(Math.pow(n, 1 / 3)); c++; } n++; }
    var s = unescape(encodeURIComponent(str)), bytes = [], i, l = s.length * 8;
    for (i = 0; i < s.length; i++) bytes.push(s.charCodeAt(i));
    bytes.push(0x80); while (bytes.length % 64 !== 56) bytes.push(0);
    for (i = 7; i >= 0; i--) bytes.push(i > 3 ? 0 : (l >>> (i * 8)) & 255);
    function r(x, k) { return (x >>> k) | (x << (32 - k)); }
    var h = H.slice();
    for (var o = 0; o < bytes.length; o += 64) {
      var w = new Array(64);
      for (i = 0; i < 16; i++) w[i] = (bytes[o + i * 4] << 24) | (bytes[o + i * 4 + 1] << 16) | (bytes[o + i * 4 + 2] << 8) | bytes[o + i * 4 + 3];
      for (i = 16; i < 64; i++) {
        var s0 = r(w[i - 15], 7) ^ r(w[i - 15], 18) ^ (w[i - 15] >>> 3);
        var s1 = r(w[i - 2], 17) ^ r(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      }
      var a = h[0], b = h[1], cc = h[2], d = h[3], e = h[4], f = h[5], g = h[6], hh = h[7];
      for (i = 0; i < 64; i++) {
        var t1 = (hh + (r(e, 6) ^ r(e, 11) ^ r(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + w[i]) | 0;
        var t2 = ((r(a, 2) ^ r(a, 13) ^ r(a, 22)) + ((a & b) ^ (a & cc) ^ (b & cc))) | 0;
        hh = g; g = f; f = e; e = (d + t1) | 0; d = cc; cc = b; b = a; a = (t1 + t2) | 0;
      }
      h[0] = (h[0] + a) | 0; h[1] = (h[1] + b) | 0; h[2] = (h[2] + cc) | 0; h[3] = (h[3] + d) | 0;
      h[4] = (h[4] + e) | 0; h[5] = (h[5] + f) | 0; h[6] = (h[6] + g) | 0; h[7] = (h[7] + hh) | 0;
    }
    return h.map(function (x) { return (x >>> 0).toString(16).padStart(8, '0'); }).join('');
  }
  function mkPw(pw) { var salt = uid().slice(0, 8); return { salt: salt, hash: sha256(salt + ':' + pw) }; }

  /* ---------- dữ liệu mẫu ---------- */
  var DEMO_PW = 'lattice';

  function seed() {
    var T = today();
    var D = function (n) { return addDays(T, n); };
    var people = [
      { id: 'u1', n: 'Lê Đặng Tuấn', ini: 'LT', av: null, mail: 'lattice.consultant@gmail.com', r: 'Chủ sở hữu · kiến trúc giải pháp', bio: 'Việc cần tôi duyệt để ở Chờ duyệt, không nhắn riêng. Tôi xử lý hàng "Cần tôi" hai lần mỗi ngày.', role: 'owner', cap: 8, sc: { proj: [] }, pw: mkPw(DEMO_PW) },
      { id: 'u2', n: 'Nguyễn Minh Anh', ini: 'MA', av: null, mail: 'minhanh@example.com', r: 'Quản lý dự án PKA và website', bio: 'Chủ trì phần lớn agent vận hành. Muốn đổi hạn thì ghi vào mạch trao đổi của việc.', role: 'pm', cap: 6, sc: { proj: ['PKA', 'WEB'] }, pw: mkPw(DEMO_PW) },
      { id: 'u3', n: 'Trần Quốc Hải', ini: 'QH', av: null, mail: 'hai@example.com', r: 'Thi công front-end', bio: 'Nhận việc thi công và nhập liệu. Tối đa 4 việc mở cùng lúc.', role: 'mem', cap: 4, sc: { proj: ['WEB'] }, pw: mkPw(DEMO_PW) },
      { id: 'u4', n: 'Phạm Thu Hà', ini: 'TH', av: null, mail: 'thuha@example.com', r: 'Khách mời — đầu mối phía khách hàng PKA', bio: '', role: 'guest', cap: 0, sc: { proj: ['PKA'] }, pw: mkPw(DEMO_PW) }
    ];
    var projects = [
      { id: 'NB', n: 'Nội bộ LATTICE' },
      { id: 'PKA', n: 'Website Phòng khám Minh An' },
      { id: 'WEB', n: 'lattice.business' }
    ];
    var agents = [
      { id: 'A0', n: 'Quản trị dự án', r: 'Trạng thái, mốc treo, rủi ro tiến độ', p: 'Bạn là A0, quản trị dự án. Báo trạng thái bằng số liệu: việc mở, việc quá hạn, việc chờ duyệt, tải của từng người so với công suất. Không đoán ngày hoàn thành.', sc: { own: 'u2', reads: ['viec', 'kenh'], can: ['ghi_chu', 'tao_viec'], review: false, limit: 30 } },
      { id: 'A2', n: 'Thư ký phạm vi', r: 'Mọi khẳng định bắt buộc kèm nguồn dẫn chiếu', p: 'Bạn là A2, thư ký phạm vi. Mọi khẳng định phải kèm nguồn: mục Ledger, tin nhắn gốc hoặc tài liệu. Không có nguồn thì không khẳng định.', sc: { own: 'u2', reads: ['viec', 'kenh', 'ledger'], can: ['ghi_chu'], review: true, limit: 20 } },
      { id: 'A3', n: 'Drift Guard', r: 'Dò trôi phạm vi. Bắt buộc quét ngược từ Ledger sang tài liệu', p: 'Bạn là A3 Drift Guard. Đối chiếu tài liệu khách với Scope Ledger, liệt kê điểm lệch, quy ra ngày công và tiền theo bảng hệ số. Bắt buộc quét ngược từ Ledger sang tài liệu. Không sửa Ledger.', sc: { own: 'u1', reads: ['viec', 'ledger', 'drive'], can: ['ghi_chu', 'tao_viec'], review: true, limit: 10 } },
      { id: 'A4', n: 'Định giá', r: 'Chỉ dùng bảng hệ số được cấp. Thiếu thì dừng, không tự chế', p: 'Bạn là A4, định giá. Chỉ dùng bảng hệ số được cấp. Hạng mục nào không có hệ số thì dừng và báo thiếu, không tự chế con số.', sc: { own: 'u1', reads: ['viec', 'ledger'], can: ['ghi_chu', 'xuat_file'], review: true, limit: 10 } },
      { id: 'A5', n: 'Soạn thảo', r: 'Luôn kết thúc bằng "Bản nháp, chờ duyệt trước khi gửi"', p: 'Bạn là A5, soạn thảo. Soạn thư, phiếu, đề cương. Dẫn số mục Ledger khi nói về phạm vi. Luôn kết thúc bằng dòng "Bản nháp, chờ duyệt trước khi gửi".', sc: { own: 'u2', reads: ['viec', 'kenh', 'ledger'], can: ['ghi_chu', 'xuat_file'], review: true, limit: 30 } },
      { id: 'A6', n: 'Kiến trúc và thiết kế', r: 'Sitemap, wireframe, design tokens', p: 'Bạn là A6. Dựng sitemap từ Ledger, khung wireframe theo khối, và design tokens.', sc: { own: 'u2', reads: ['viec', 'ledger', 'drive'], can: ['ghi_chu', 'xuat_file'], review: true, limit: 15 } },
      { id: 'A7', n: 'Đặc tả build', r: 'Sinh build-spec.md đúng bảy phần', p: 'Bạn là A7. Sinh build-spec.md đúng bảy phần, không thêm không bớt.', sc: { own: 'u1', reads: ['viec', 'ledger'], can: ['ghi_chu', 'xuat_file'], review: true, limit: 10 } },
      { id: 'A9', n: 'Kiểm thử', r: 'Chạy checklist nghiệm thu', p: 'Bạn là A9. Lập và chạy checklist nghiệm thu theo từng mục Ledger. Mục nào không kiểm được thì ghi rõ, không đánh dấu đạt.', sc: { own: 'u2', reads: ['viec', 'ledger'], can: ['ghi_chu'], review: true, limit: 20 } }
    ];
    var ledger = {
      PKA: {
        v: 1,
        items: [
          { id: 'L1', t: 'Trang chủ', k: ['trang chủ'] },
          { id: 'L2', t: '5 trang nội dung dịch vụ', k: ['trang dịch vụ', 'trang nội dung'] },
          { id: 'L3', t: 'Trang giới thiệu bác sĩ', k: ['giới thiệu', 'bác sĩ'] },
          { id: 'L4', t: 'Biểu mẫu liên hệ', k: ['biểu mẫu'] },
          { id: 'L5', t: 'Blog — chuyển 10 bài từ site cũ', k: ['blog'] },
          { id: 'L6', t: 'Một ngôn ngữ: tiếng Việt', k: ['tiếng việt'] }
        ],
        log: [{ at: nowIso(60 * 24 * 12), by: 'u1', t: 'Lập Ledger v1 từ biên bản họp khởi động', src: 'Drive: PKA/goc/bien-ban-khoi-dong.pdf' }]
      },
      WEB: {
        v: 3,
        items: [
          { id: 'L1', t: '10 trang song ngữ Việt / Anh', k: ['trang', 'song ngữ'] },
          { id: 'L2', t: 'Luồng đăng ký, thanh toán VietQR, đối soát', k: ['đăng ký', 'thanh toán'] },
          { id: 'L3', t: 'Trang quản trị hồ sơ', k: ['quản trị'] }
        ],
        log: [{ at: nowIso(60 * 24 * 5), by: 'u1', t: 'Ledger v3: thêm trang quản trị', src: 'Quyết định của chủ sở hữu, ghi trong kênh #website' }]
      }
    };
    var rates = {
      dayRate: 3500000,
      items: [
        { k: 'trang chủ', n: 'Trang chủ', d: 3 },
        { k: 'song ngữ', n: 'Thêm một ngôn ngữ cho toàn site', d: 4 },
        { k: 'biểu mẫu', n: 'Biểu mẫu', d: 1.5 },
        { k: 'video', n: 'Video nền / media nặng', d: 1.5 },
        { k: 'trang', n: 'Trang nội dung (mỗi trang)', d: 1 },
        { k: 'blog', n: 'Chuyển blog (mỗi 10 bài)', d: 1 }
      ]
    };

    var RFQ = 'Trích RFQ bổ sung (Drive: PKA/goc/rfq-bo-sung.pdf):\n- Video nền ở đầu trang\n- Bản tiếng Anh cho toàn site (song ngữ)\n- Đặt lịch khám online\n- Blog 10 bài chuyển từ site cũ\n- 3 trang chuyên khoa mới\n- Tối ưu SEO on-page\n- Biểu mẫu liên hệ';
    var HANGMUC = 'Hạng mục cần dự toán:\n- Trang chủ\n- 5 trang dịch vụ\n- Biểu mẫu liên hệ\n- Blog 10 bài chuyển từ site cũ\n- Bản tiếng Anh (song ngữ)\n- Tích hợp đặt lịch khám online';

    var tasks = [
      { id: 't1', ttl: 'Tiếp nhận, lập hồ sơ và Scope Ledger v1', pr: 'PKA', as: 'A0', own: 'u2', st: 'xong', due: D(-12), note: 'Bước 1 của luồng website cơ bản.', gate: false, thr: [
        { by: 'A0', at: nowIso(60 * 24 * 12), t: 'Đã lập hồ sơ dự án PKA và Ledger v1 gồm 6 mục (L1–L6).', k: 'result' },
        { by: 'u2', at: nowIso(60 * 24 * 12 - 30), t: 'Đã kiểm, khớp biên bản.', k: 'note' }] },
      { id: 't2', ttl: 'Quét trôi phạm vi — RFQ bổ sung khách gửi', pr: 'PKA', as: 'A3', own: 'u1', st: 'dang_lam', due: D(1), note: RFQ, gate: false, src: 'm5', thr: [] },
      { id: 't3', ttl: 'Soạn phiếu làm rõ yêu cầu', pr: 'PKA', as: 'A5', own: 'u2', st: 'cho_duyet', due: D(-1), note: 'Gửi chị Hà. Hỏi rõ phần đặt lịch khám và phạm vi blog.', gate: true, thr: [
        { by: 'A5', at: nowIso(180), k: 'result', t: 'Kính gửi chị Thu Hà,\n\nĐể chốt phạm vi website Phòng khám Minh An, LATTICE cần chị xác nhận hai điểm:\n\n1. Đặt lịch khám online — hiện chưa có trong Scope Ledger (L1–L6). Chị cho biết cần đặt lịch thật (có lịch bác sĩ, xác nhận) hay chỉ cần biểu mẫu gửi yêu cầu (đã có ở L4)?\n2. Blog — Ledger L5 ghi chuyển 10 bài từ site cũ. Chị có cần viết thêm bài mới không?\n\nTrân trọng,\nLATTICE Next Solutions\n\nBản nháp, chờ duyệt trước khi gửi' }] },
      { id: 't4', ttl: 'Lập dự toán theo ngày công', pr: 'PKA', as: 'A4', own: 'u1', st: 'dang_lam', due: D(2), note: HANGMUC, gate: false, thr: [] },
      { id: 't5', ttl: 'Ký hợp đồng và phụ lục phạm vi', pr: 'PKA', as: 'u1', own: 'u1', st: 'dang_lam', due: D(6), note: 'Phụ lục phạm vi lấy nguyên văn từ Ledger đã chốt.', gate: true, thr: [] },
      { id: 't6', ttl: 'Sinh lại bản tiếng Anh sau khi sửa trang Liên hệ', pr: 'WEB', as: 'u3', own: 'u2', st: 'dang_lam', due: D(-2), note: 'Chạy extract-strings.py, dịch chuỗi mới, rồi build-en.py. Chỉ đẩy khi chữ Việt còn = 0.', gate: false, src: 'm7', thr: [{ by: 'u3', at: nowIso(300), t: 'Còn 4 chuỗi chưa dịch, chiều nay xong.', k: 'note' }] },
      { id: 't7', ttl: 'Chuyển 3 ảnh PNG sang WebP', pr: 'WEB', as: null, own: 'u2', st: 'cho_giao', due: D(4), note: '> Trần Quốc Hải trong #chung: "3 ảnh PNG trên site nặng ~2MB, có nên chuyển WebP trước khi chạy quảng cáo không?"', gate: false, src: 'm3', thr: [] },
      { id: 't8', ttl: 'Kiểm thử luồng đăng ký theo tiêu chí nghiệm thu', pr: 'WEB', as: 'A9', own: 'u2', st: 'cho_duyet', due: D(0), note: '', gate: false, thr: [
        { by: 'A9', at: nowIso(90), k: 'result', t: 'CHECKLIST NGHIỆM THU — WEB (Ledger v3)\n[Đạt] L1 10 trang song ngữ Việt / Anh — build-en báo 0 chữ Việt còn sót\n[Đạt] L2 Luồng đăng ký, thanh toán, đối soát — có nhật ký tien_ve ngày 13/9\n[Chưa kiểm được] L3 Trang quản trị — cần tài khoản quản trị, agent không được cấp\n\nKết luận: 2/3 mục đạt. Mục L3 cần người kiểm.' }] },
      { id: 't9', ttl: 'Soạn bảng câu hỏi chuẩn bị cho gói Scan', pr: 'WEB', as: 'A5', own: 'u1', st: 'cho_duyet', due: D(1), note: 'Thư đăng ký đã hứa gửi bảng câu hỏi sau khi nhận thanh toán. Tối đa 12 câu.', gate: false, thr: [
        { by: 'A5', at: nowIso(45), k: 'result', t: 'BẢNG CÂU HỎI CHUẨN BỊ — LATTICE SCAN\n\n1. Doanh nghiệp đang kinh doanh mô hình nào, doanh thu năm gần nhất?\n2. Có bao nhiêu người, mỗi người giữ vai trò gì?\n3. Ba quy trình tốn thời gian nhất hiện nay?\n4. Dữ liệu khách hàng đang nằm ở đâu?\n5. Đã dùng công cụ AI nào, cho việc gì?\n6. Điều gì anh/chị tuyệt đối không muốn giao cho máy?\n7. Mục tiêu 12 tháng tới bằng con số?\n\nBản nháp, chờ duyệt trước khi gửi' }] },
      { id: 't10', ttl: 'Viết quy chế dữ liệu khách', pr: 'NB', as: 'u1', own: 'u1', st: 'dang_lam', due: D(3), note: 'Tài liệu gốc nằm ở Drive, trong ứng dụng chỉ giữ đường dẫn và trích đoạn. Phải có hiệu lực trước khi ai đó dán nguyên RFQ vào kênh.', gate: false, thr: [] },
      { id: 't11', ttl: 'Báo cáo tình trạng tuần', pr: 'NB', as: 'A0', own: 'u1', st: 'xong', due: D(-1), note: '', gate: false, thr: [{ by: 'A0', at: nowIso(60 * 20), t: 'Tuần này: 11 việc mở, 2 quá hạn, 3 chờ duyệt.', k: 'result' }] },
      { id: 't12', ttl: 'Rà chữ Việt còn sót trong en/index.html', pr: 'WEB', as: 'u3', own: 'u2', st: 'xong', due: D(-4), note: '', gate: false, thr: [] },
      { id: 't13', ttl: 'Sitemap, wireframe, hệ thống thị giác', pr: 'PKA', as: 'A6', own: 'u2', st: 'dang_lam', due: D(8), note: 'Chờ phiếu làm rõ được duyệt rồi mới chạy.', gate: false, thr: [] }
    ];
    tasks.forEach(function (t) { t.created = nowIso(60 * 24 * 3); t.by = t.own; if (!t.src) t.src = null; });

    var chans = [
      { id: 'c1', n: 'chung', d: 'Toàn đội nội bộ', mem: ['u1', 'u2', 'u3'] },
      { id: 'c2', n: 'du-an-pka', d: 'Dự án website Phòng khám Minh An, có khách mời', mem: ['u1', 'u2', 'u4'] },
      { id: 'c3', n: 'website', d: 'lattice.business', mem: ['u1', 'u2', 'u3'] }
    ];
    var msgs = [
      { id: 'm1', ch: 'c1', by: 'u1', at: nowIso(60 * 26), t: 'Tuần này ưu tiên đợt hồ sơ Scan/Blueprint. Việc nào cần tôi duyệt thì để ở Chờ duyệt, đừng nhắn riêng.', task: null },
      { id: 'm2', ch: 'c1', by: 'u2', at: nowIso(60 * 25), t: 'Đã rõ. Em chuyển hết việc PKA sang bảng.', task: null },
      { id: 'm3', ch: 'c1', by: 'u3', at: nowIso(60 * 6), t: '3 ảnh PNG trên site nặng ~2MB, có nên chuyển WebP trước khi chạy quảng cáo không?', task: 't7' },
      { id: 'm4', ch: 'c2', by: 'u2', at: nowIso(60 * 30), t: 'Chào chị Hà, kênh này dùng cho dự án website. Tài liệu gốc chị để trên Drive giúp em, đừng dán nguyên văn vào đây.', task: null },
      { id: 'm5', ch: 'c2', by: 'u4', at: nowIso(60 * 8), t: 'Bên em đã để RFQ bổ sung trên Drive, nhờ bên mình xem giúp phạm vi.', task: 't2' },
      { id: 'm6', ch: 'c2', by: 'u4', at: nowIso(60 * 2), t: 'Phần đặt lịch khám online có làm được trong gói hiện tại không ạ?', task: null },
      { id: 'm7', ch: 'c3', by: 'u2', at: nowIso(60 * 9), t: 'Trang Liên hệ đổi xong chính sách phí, cần sinh lại bản EN.', task: 't6' },
      { id: 'm8', ch: 'c3', by: 'u3', at: nowIso(60 * 5), t: 'Em làm chiều nay.', task: null }
    ];
    var flows = [
      { id: 'f1', n: 'Dự án website cơ bản', d: 'Từ tiếp nhận tới bàn giao, 12 bước, 47 ngày', steps: [
        { t: 'Tiếp nhận, lập hồ sơ và Scope Ledger v1', as: 'A0', off: 0, gate: false },
        { t: 'Soạn phiếu làm rõ yêu cầu', as: 'A5', off: 1, gate: true },
        { t: 'Quét trôi phạm vi tài liệu khách gửi', as: 'A3', off: 6, gate: false },
        { t: 'Lập dự toán theo ngày công', as: 'A4', off: 7, gate: false },
        { t: 'Soạn báo giá và đề cương', as: 'A5', off: 8, gate: true },
        { t: 'Ký hợp đồng và phụ lục phạm vi', as: 'NGUOI', off: 12, gate: true },
        { t: 'Sitemap, wireframe, hệ thống thị giác', as: 'A6', off: 14, gate: false },
        { t: 'Thiết kế trang chủ và các trang còn lại', as: 'NGUOI', off: 16, gate: true },
        { t: 'Sinh build-spec', as: 'A7', off: 30, gate: false },
        { t: 'Thi công và nhập liệu', as: 'NGUOI', off: 31, gate: false },
        { t: 'Kiểm thử theo tiêu chí nghiệm thu', as: 'A9', off: 45, gate: false },
        { t: 'Bàn giao và đào tạo', as: 'NGUOI', off: 47, gate: true }
      ] }
    ];
    var dms = {
      A3: [
        { u: 'u1', r: 'user', c: 'Dự án nào đang có việc quá hạn?', at: nowIso(60 * 3) },
        { u: 'u1', r: 'agent', c: 'Trong phạm vi anh/chị được xem, có 2 việc quá hạn:\n· [PKA] Soạn phiếu làm rõ yêu cầu — hạn ' + D(-1) + ', A5, đang Chờ duyệt\n· [WEB] Sinh lại bản tiếng Anh sau khi sửa trang Liên hệ — hạn ' + D(-2) + ', Trần Quốc Hải, đang Đang làm', at: nowIso(60 * 3 - 1) }
      ]
    };
    var cfg = {
      ai: { prov: 'Anthropic', model: 'claude-opus-5', tok: 4000, key: { setAt: addDays(T, -5) } },
      mail: { from: 'lattice.consultant@gmail.com', conn: false, n: ['lattice.consultant@gmail.com'] },
      drive: { conn: false, root: 'LATTICE/Du-an', pat: '{du_an}/goc' },
      vps: { host: '', user: 'agent', path: '/srv/work', fp: '' },
      git: { owner: 'latticeconsultant', repo: '', branch: 'main', tok: null },
      local: { dir: '~/LatticeWork', sync: false }
    };
    return {
      ver: 1, people: people, projects: projects, agents: agents, tasks: tasks, chans: chans, msgs: msgs,
      flows: flows, dms: dms, cfg: cfg, ledger: ledger, rates: rates, runs: {},
      log: [{ at: nowIso(1), by: 'system', act: 'seed', obj: '', d: 'Nạp dữ liệu mẫu' }]
    };
  }

  /* ---------- kho ---------- */
  var DB = null;
  var store = {
    get: function () { try { return root.localStorage ? root.localStorage.getItem(KEY) : null; } catch (e) { return null; } },
    set: function (v) { try { if (root.localStorage) root.localStorage.setItem(KEY, v); return true; } catch (e) { return false; } },
    del: function () { try { if (root.localStorage) root.localStorage.removeItem(KEY); } catch (e) { /* bỏ qua */ } }
  };
  function load() {
    var s = store.get();
    if (s) { try { DB = JSON.parse(s); if (DB && DB.ver === 1) return DB; } catch (e) { /* hỏng thì nạp lại mẫu */ } }
    DB = seed(); save(); return DB;
  }
  function save() { return store.set(JSON.stringify(DB)); }
  function reset() { store.del(); DB = seed(); save(); return DB; }
  function use(db) { DB = db; return DB; } // cho kiểm thử

  function log(by, act, obj, d) {
    DB.log.unshift({ at: nowIso(0), by: by, act: act, obj: obj || '', d: d || '' });
    if (DB.log.length > 500) DB.log.length = 500;
  }

  /* ---------- tra cứu ---------- */
  function isAgentId(id) { return typeof id === 'string' && /^A[0-9]+$/.test(id); }
  function person(id) { return DB.people.find(function (p) { return p.id === id; }) || null; }
  function agent(id) { return DB.agents.find(function (a) { return a.id === id; }) || null; }
  function actorName(id) { var a = isAgentId(id) ? agent(id) : person(id); return a ? (isAgentId(id) ? a.id + ' ' + a.n : a.n) : (id === 'system' ? 'Hệ thống' : '—'); }
  function task(id) { return DB.tasks.find(function (t) { return t.id === id; }) || null; }
  function project(id) { return DB.projects.find(function (p) { return p.id === id; }) || null; }
  function chan(id) { return DB.chans.find(function (c) { return c.id === id; }) || null; }
  function mustPerson(uid) { var u = person(uid); if (!u) throw new LWError('noSession'); return u; }

  /* ---------- 4 · phân quyền ---------- */
  function can(action, u) { return !!u && (PERM[action] || []).indexOf(u.role) >= 0; }
  function projsOf(u) { return u.role === 'owner' ? DB.projects.map(function (p) { return p.id; }) : (u.sc.proj || []).slice(); }
  // 4.2 · Trục phạm vi — nhìn thấy gì
  function seeTask(t, u) { return u.role === 'owner' || projsOf(u).indexOf(t.pr) >= 0 || t.as === u.id || t.own === u.id; }
  function seeChan(c, u) { return c.mem.indexOf(u.id) >= 0; }
  function seeDM(a, u) { return u.role === 'owner' || a.sc.own === u.id; }
  function seeTeam(u) { return u.role !== 'guest'; }
  function seeSettings(u) { return u.role === 'owner'; }
  function seeContacts(u) { return u.role !== 'guest'; }

  function visibleTasks(u) { return DB.tasks.filter(function (t) { return seeTask(t, u); }); }
  function visibleChans(u) { return DB.chans.filter(function (c) { return seeChan(c, u); }); }
  function visibleAgentsForDM(u) { return DB.agents.filter(function (a) { return seeDM(a, u); }); }
  function openLoad(pid) { return DB.tasks.filter(function (t) { return t.as === pid && t.st !== 'xong'; }).length; }

  /* ---------- 6 · vòng đời việc — ba ràng buộc tầng dữ liệu ---------- */
  var MOVES = {
    'cho_giao>dang_lam': 1, 'dang_lam>cho_giao': 1, 'dang_lam>cho_duyet': 1, 'dang_lam>xong': 1,
    'cho_duyet>xong': 1, 'cho_duyet>dang_lam': 1, 'xong>dang_lam': 1
  };

  function guardTask(old, nw, actorId) {
    // Ràng buộc 1 — owner_id NOT NULL, và phải là người
    if (!nw.own) throw new LWError('ownerRequired');
    if (!person(nw.own)) throw new LWError('ownerMustBeHuman');
    if (ST.indexOf(nw.st) < 0) throw new LWError('badState');
    if (nw.as && !(isAgentId(nw.as) ? agent(nw.as) : person(nw.as))) throw new LWError('badAssignee');
    if (nw.st !== 'cho_giao' && !nw.as) throw new LWError('needAssignee');
    if (!old) return;
    if (old.st === nw.st) return;
    if (!MOVES[old.st + '>' + nw.st]) throw new LWError('badTransition');

    var agentActor = isAgentId(actorId);
    // Ràng buộc 2 — kết quả agent không nhảy thẳng sang 'xong'
    if (nw.st === 'xong' && old.st !== 'cho_duyet') {
      if (isAgentId(nw.as) && agent(nw.as).sc.review) throw new LWError('agentMustReview');
      if (nw.gate) throw new LWError('gateMustReview');
    }
    // Ràng buộc 3 — chỉ người chủ trì duyệt / trả lại
    if (old.st === 'cho_duyet' && (nw.st === 'xong' || nw.st === 'dang_lam')) {
      if (agentActor) throw new LWError('agentCannotApprove');
      if (nw.own !== actorId) throw new LWError('onlyOwnerApproves', actorName(nw.own));
    }
    if (old.st === 'xong' && !agentActor) {
      var u = person(actorId);
      if (u.role !== 'owner' && nw.own !== actorId) throw new LWError('noPermission');
    }
  }

  function mayTouch(t, u) {
    if (u.role === 'guest') return false;
    return u.role === 'owner' || (u.role === 'pm' && projsOf(u).indexOf(t.pr) >= 0) || t.as === u.id || t.own === u.id;
  }

  function createTask(f, uid) {
    var u = mustPerson(uid);
    if (!can('create', u)) throw new LWError('noCreate');
    if (!f.ttl || !String(f.ttl).trim()) throw new LWError('titleRequired');
    if (projsOf(u).indexOf(f.pr) < 0) throw new LWError('projOutOfScope');
    var as = f.as || null;
    if (as && !isAgentId(as) && as !== u.id && !can('assignOthers', u)) throw new LWError('cannotAssignOthers');
    var own;
    if (as && isAgentId(as)) {
      var a = agent(as); if (!a) throw new LWError('badAssignee');
      own = (f.own && can('assignOthers', u)) ? f.own : a.sc.own; // agent tự lấy người chủ trì mặc định
    } else {
      own = (f.own && can('assignOthers', u)) ? f.own : u.id;
    }
    var t = {
      id: uid_short(), ttl: String(f.ttl).trim(), pr: f.pr, as: as, own: own,
      st: as ? 'dang_lam' : 'cho_giao', due: f.due || null, note: f.note || '',
      gate: !!f.gate, src: f.src || null, flow: f.flow || null, thr: [], created: nowIso(0), by: u.id
    };
    guardTask(null, t, uid);
    if (as && !isAgentId(as)) warnCap(as);
    DB.tasks.unshift(t);
    if (t.src) { var m = DB.msgs.find(function (x) { return x.id === t.src; }); if (m) m.task = t.id; }
    log(uid, 'task.create', t.id, t.ttl);
    save();
    return t;
  }
  function uid_short() { return 't' + uid().slice(0, 8); }
  function warnCap() { /* cảnh báo công suất do giao diện hiển thị trước khi gọi */ }

  function updateTask(id, patch, actorId) {
    var old = task(id); if (!old) throw new LWError('notFound');
    var agentActor = isAgentId(actorId);
    if (!agentActor) {
      var u = mustPerson(actorId);
      if (!seeTask(old, u)) throw new LWError('notFound'); // ngoài phạm vi = không tồn tại
      if (!mayTouch(old, u)) throw new LWError('noPermission');
      if ('as' in patch && patch.as !== old.as && patch.as && !isAgentId(patch.as) && patch.as !== u.id && !can('assignOthers', u)) throw new LWError('cannotAssignOthers');
      if ('own' in patch && patch.own !== old.own && !can('assignOthers', u)) throw new LWError('noPermission');
      if ('pr' in patch && patch.pr !== old.pr && projsOf(u).indexOf(patch.pr) < 0) throw new LWError('projOutOfScope');
    } else {
      // agent chỉ được đổi trạng thái việc giao cho chính nó
      if (old.as !== actorId) throw new LWError('noPermission');
      var allowed = { st: 1 }; Object.keys(patch).forEach(function (k) { if (!allowed[k]) throw new LWError('noPermission'); });
    }
    var nw = Object.assign(clone(old), patch);
    if ('as' in patch && patch.as !== old.as) {
      if (patch.as && isAgentId(patch.as) && !('own' in patch)) nw.own = agent(patch.as).sc.own;
      if (!patch.as) nw.st = 'cho_giao';
      else if (old.st === 'cho_giao' && !('st' in patch)) nw.st = 'dang_lam';
    }
    guardTask(old, nw, actorId);
    Object.assign(old, nw);
    log(actorId, 'task.update', id, Object.keys(patch).map(function (k) { return k + '=' + (patch[k] === null ? '∅' : String(patch[k]).slice(0, 40)); }).join(', '));
    save();
    return old;
  }

  // Duyệt và trả lại chỉ có nghĩa với việc đang Chờ duyệt — không để lại dòng "đã duyệt" giả.
  function mustBeInReview(id) {
    var t = task(id); if (!t) throw new LWError('notFound');
    if (t.st !== 'cho_duyet') throw new LWError('notInReview');
  }
  function approve(id, uid) {
    mustBeInReview(id);
    var t = updateTask(id, { st: 'xong' }, uid);
    t.thr.push({ by: uid, at: nowIso(0), t: '', k: 'approve' });
    save(); return t;
  }
  function sendBack(id, uid, reason) {
    mustBeInReview(id);
    if (!reason || !String(reason).trim()) throw new LWError('reasonRequired');
    var t = updateTask(id, { st: 'dang_lam' }, uid);
    t.thr.push({ by: uid, at: nowIso(0), t: String(reason).trim(), k: 'return' });
    save(); return t;
  }
  function comment(id, uid, text) {
    var t = task(id), u = mustPerson(uid);
    if (!t || !seeTask(t, u)) throw new LWError('notFound');
    if (!text || !String(text).trim()) return t;
    t.thr.push({ by: uid, at: nowIso(0), t: String(text).trim(), k: 'note' });
    log(uid, 'task.comment', id, '');
    save(); return t;
  }

  /* ---------- bốn điều cấm — chặn ở tầng dữ liệu ---------- */
  function deleteTask(id, actorId) {
    if (isAgentId(actorId)) throw new LWError('agentCannotDelete');
    var u = mustPerson(actorId);
    if (u.role !== 'owner') throw new LWError('noPermission');
    var i = DB.tasks.findIndex(function (t) { return t.id === id; });
    if (i < 0) throw new LWError('notFound');
    DB.msgs.forEach(function (m) { if (m.task === id) m.task = null; });
    var t = DB.tasks.splice(i, 1)[0];
    log(actorId, 'task.delete', id, t.ttl); save();
  }
  function sendEmail(actorId) {
    if (isAgentId(actorId)) throw new LWError('agentNoEmail');
    // Ứng dụng không bao giờ tự gửi: người gửi từ hộp thư của mình.
    throw new LWError('appNeverSends');
  }
  function editLedger(pr, item, src, actorId) {
    if (isAgentId(actorId)) throw new LWError('agentCannotEditLedger');
    var u = mustPerson(actorId);
    if (!can('approve', u) || projsOf(u).indexOf(pr) < 0) throw new LWError('noPermission');
    if (!item || !String(item).trim()) throw new LWError('titleRequired');
    if (!src || !String(src).trim()) throw new LWError('sourceRequired');
    var L = DB.ledger[pr] || (DB.ledger[pr] = { v: 0, items: [], log: [] });
    var text = String(item).trim();
    var k = text.toLowerCase().replace(/^[0-9]+\s+/, '');
    L.items.push({ id: 'L' + (L.items.length + 1), t: text, k: [k] });
    L.v += 1;
    L.log.unshift({ at: nowIso(0), by: actorId, t: 'Ledger v' + L.v + ': thêm "' + text + '"', src: String(src).trim() });
    log(actorId, 'ledger.edit', pr, text); save();
    return L;
  }
  function approveAsAgent(taskId, agentId) { return updateTask(taskId, { st: 'xong' }, agentId); }

  // Chạy thử bốn điều cấm dưới danh nghĩa một agent: cả bốn phải bị chặn.
  function probeForbidden(agentId) {
    var victim = DB.tasks.find(function (t) { return t.st === 'cho_duyet' && t.as === agentId; }) ||
                 DB.tasks.find(function (t) { return t.st === 'cho_duyet'; }) || DB.tasks[0];
    var before = JSON.stringify(DB);
    var tries = [
      function () { sendEmail(agentId); },
      function () { approveAsAgent(victim.id, agentId); },
      function () { deleteTask(victim.id, agentId); },
      function () { editLedger(victim.pr, 'Hạng mục do agent tự thêm', 'agent', agentId); }
    ];
    var out = tries.map(function (fn, i) {
      try { fn(); return { rule: FORBIDDEN[i], blocked: false, code: '' }; }
      catch (e) { return { rule: FORBIDDEN[i], blocked: e instanceof LWError, code: e.code || String(e) }; }
    });
    var unchanged = JSON.stringify(DB) === before;
    return { results: out, unchanged: unchanged };
  }

  /* ---------- bối cảnh gửi cho mô hình — dựng theo người gọi ---------- */
  function buildContext(agentId, uid, focus) {
    var a = agent(agentId), u = mustPerson(uid);
    var reads = a.sc.reads;
    var tasks = reads.indexOf('viec') >= 0 ? visibleTasks(u) : [];
    var chans = reads.indexOf('kenh') >= 0 ? visibleChans(u) : [];
    var chIds = chans.map(function (c) { return c.id; });
    var msgs = DB.msgs.filter(function (m) { return chIds.indexOf(m.ch) >= 0; }).slice(-30);
    var prs = projsOf(u);
    var ledger = {};
    if (reads.indexOf('ledger') >= 0) prs.forEach(function (p) { if (DB.ledger[p]) ledger[p] = DB.ledger[p]; });
    var drive = reads.indexOf('drive') >= 0 ? prs.map(function (p) { return DB.cfg.drive.root + '/' + DB.cfg.drive.pat.replace('{du_an}', p); }) : [];

    var L = [];
    L.push('[CHỈ DẪN HỆ THỐNG · ' + a.id + ']');
    L.push(a.p);
    L.push('');
    L.push('[ĐIỀU CẤM CỐ ĐỊNH]');
    FORBIDDEN.forEach(function (f) { L.push('· Không ' + f.vi.charAt(0).toLowerCase() + f.vi.slice(1) + ' — ' + f.why_vi); });
    L.push('');
    L.push('[PHẠM VI]');
    L.push('Người gọi: ' + u.n + ' (' + u.role + '). Dự án được xem: ' + prs.join(', ') + '.');
    L.push('Chỉ dùng dữ liệu bên dưới. Không suy đoán về thứ nằm ngoài phạm vi, và không tiết lộ có bao nhiêu thứ đang bị giấu.');
    if (reads.indexOf('viec') >= 0) {
      L.push(''); L.push('[VIỆC]');
      tasks.forEach(function (t) { L.push('· [' + t.pr + '] ' + t.ttl + ' | ' + t.st + ' | giao: ' + (t.as ? actorName(t.as) : '—') + ' | chủ trì: ' + actorName(t.own) + ' | hạn: ' + (t.due || '—')); });
    }
    if (reads.indexOf('kenh') >= 0) {
      L.push(''); L.push('[TIN NHẮN KÊNH]');
      msgs.forEach(function (m) { L.push('· #' + chan(m.ch).n + ' · ' + actorName(m.by) + ': ' + m.t); });
    }
    if (reads.indexOf('ledger') >= 0) {
      L.push(''); L.push('[SCOPE LEDGER]');
      Object.keys(ledger).forEach(function (p) { ledger[p].items.forEach(function (it) { L.push('· ' + p + ' v' + ledger[p].v + ' ' + it.id + ': ' + it.t); }); });
    }
    if (reads.indexOf('drive') >= 0) {
      L.push(''); L.push('[DRIVE — chỉ đường dẫn và trích đoạn, không giữ nguyên tệp]');
      drive.forEach(function (d) { L.push('· ' + d); });
    }
    if (focus) {
      L.push(''); L.push('[VIỆC ĐANG XỬ LÝ]');
      L.push(focus.ttl); if (focus.note) L.push(focus.note);
    }
    return { text: L.join('\n'), tasks: tasks, msgs: msgs, ledger: ledger, drive: drive, reads: reads, caller: u, agent: a };
  }

  function takeRun(a) {
    var T = today(), r = DB.runs[a.id];
    if (!r || r.d !== T) r = DB.runs[a.id] = { d: T, n: 0 };
    if (r.n >= a.sc.limit) throw new LWError('limitReached', a.id + ' ' + r.n + '/' + a.sc.limit);
    r.n += 1;
  }
  function runsToday(a) { var r = DB.runs[a.id]; return r && r.d === today() ? r.n : 0; }

  /* ---------- mô phỏng agent ---------- */
  function lines(note) {
    return String(note || '').split('\n').map(function (s) { return s.trim(); })
      .filter(function (s) { return /^[-•·]\s*/.test(s); }).map(function (s) { return s.replace(/^[-•·]\s*/, ''); });
  }
  function rateFor(text) {
    var s = text.toLowerCase();
    var items = DB.rates.items.slice().sort(function (a, b) { return b.k.length - a.k.length; });
    var hit = items.find(function (r) { return s.indexOf(r.k) >= 0; });
    if (!hit) return null;
    var m = s.match(/^(\d+)\s/); var q = m ? Number(m[1]) : 1;
    return { rate: hit, qty: q, days: hit.d * q };
  }
  function ledgerHit(items, text) {
    var s = text.toLowerCase();
    return items.find(function (it) { return it.k.some(function (k) { return s.indexOf(k) >= 0; }); }) || null;
  }

  var SIM = {
    A0: function (t, ctx) {
      var T = today(), ts = ctx.tasks.filter(function (x) { return x.pr === t.pr; });
      if (!ctx.reads.length || ctx.reads.indexOf('viec') < 0) return 'Không có quyền đọc Việc — không lập được báo cáo trạng thái.';
      var by = {}; ST.forEach(function (s) { by[s] = ts.filter(function (x) { return x.st === s; }).length; });
      var od = ts.filter(function (x) { return x.st !== 'xong' && x.due && x.due < T; });
      var out = ['TRẠNG THÁI DỰ ÁN ' + t.pr + ' — ' + (project(t.pr) || {}).n, '',
        'Chờ giao ' + by.cho_giao + ' · Đang làm ' + by.dang_lam + ' · Chờ duyệt ' + by.cho_duyet + ' · Xong ' + by.xong, ''];
      out.push(od.length ? 'QUÁ HẠN (' + od.length + ')' : 'Không có việc quá hạn.');
      od.forEach(function (x) { out.push('· ' + x.ttl + ' — hạn ' + x.due + ', ' + actorName(x.as)); });
      var ppl = {}; ts.forEach(function (x) { if (x.as && !isAgentId(x.as) && x.st !== 'xong') ppl[x.as] = (ppl[x.as] || 0) + 1; });
      if (Object.keys(ppl).length) {
        out.push(''); out.push('TẢI NGƯỜI SO VỚI CÔNG SUẤT');
        Object.keys(ppl).forEach(function (pid) { var p = person(pid); out.push('· ' + p.n + ': ' + openLoad(pid) + '/' + p.cap + ' việc mở' + (openLoad(pid) > p.cap ? ' — VƯỢT CÔNG SUẤT' : '')); });
      }
      var wait = ts.filter(function (x) { return x.st === 'cho_duyet'; });
      if (wait.length) { out.push(''); out.push('MỐC TREO — CHỜ NGƯỜI DUYỆT'); wait.forEach(function (x) { out.push('· ' + x.ttl + ' — chờ ' + actorName(x.own)); }); }
      return out.join('\n');
    },
    A2: function (t, ctx) {
      var L = (ctx.ledger[t.pr] || { items: [] }).items;
      var claims = String(t.note || '').split(/\n|(?<=\.)\s/).map(function (s) { return s.replace(/^[-•·>]\s*/, '').trim(); }).filter(function (s) { return s.length > 3; });
      var out = ['BIÊN BẢN PHẠM VI — ' + t.ttl, ''];
      if (!claims.length) return out.concat(['Việc không có nội dung để ghi nhận. Không khẳng định gì khi không có nguồn.']).join('\n');
      var src = t.src ? DB.msgs.find(function (m) { return m.id === t.src; }) : null;
      claims.forEach(function (c, i) {
        var hit = ctx.reads.indexOf('ledger') >= 0 ? ledgerHit(L, c) : null;
        var ref = hit ? '[Nguồn: Scope Ledger ' + t.pr + ' ' + hit.id + ']' : (src ? '[Nguồn: tin nhắn #' + chan(src.ch).n + ', ' + actorName(src.by) + ']' : '[Chưa có nguồn — không đưa vào biên bản]');
        out.push((i + 1) + '. ' + c + ' ' + ref);
      });
      return out.join('\n');
    },
    A3: function (t, ctx) {
      if (ctx.reads.indexOf('ledger') < 0) return 'DỪNG: không có quyền đọc Scope Ledger, không có mốc để đối chiếu.';
      var Ld = ctx.ledger[t.pr];
      if (!Ld) return 'DỪNG: dự án ' + t.pr + ' chưa có Scope Ledger.';
      var req = lines(t.note);
      if (!req.length) return 'DỪNG: không tìm thấy danh sách yêu cầu (dòng bắt đầu bằng "-") trong tài liệu.';
      var head = String(t.note).split('\n')[0];
      var drift = [], matched = [];
      req.forEach(function (r) { var h = ledgerHit(Ld.items, r); if (h) matched.push({ r: r, h: h }); else drift.push({ r: r, q: rateFor(r) }); });
      var out = ['DRIFT GUARD — ' + t.pr + ' · đối chiếu Scope Ledger v' + Ld.v + ' (' + Ld.items.length + ' mục) với tài liệu', 'Tài liệu: ' + head, ''];
      out.push('KHỚP LEDGER (' + matched.length + ')');
      matched.forEach(function (m) { out.push('· ' + m.r + ' → ' + m.h.id + ' ' + m.h.t); });
      out.push(''); out.push('ĐIỂM LỆCH (' + drift.length + ')');
      var sumD = 0, nq = 0;
      drift.forEach(function (d, i) {
        var s = (i + 1) + '. ' + d.r + ' — không có trong Ledger';
        if (d.q) { s += ' → ' + num(d.q.days) + ' ngày công ≈ ' + vnd(d.q.days * DB.rates.dayRate) + ' (hệ số: ' + d.q.rate.n + ')'; sumD += d.q.days; nq++; }
        else s += ' → chưa quy ra được: thiếu hệ số';
        out.push(s);
      });
      out.push('');
      out.push('Quy ra được ' + nq + '/' + drift.length + ' điểm: ' + num(sumD) + ' ngày công ≈ ' + vnd(sumD * DB.rates.dayRate));
      var back = Ld.items.filter(function (it) { return !req.some(function (r) { return it.k.some(function (k) { return r.toLowerCase().indexOf(k) >= 0; }); }); });
      out.push(''); out.push('QUÉT NGƯỢC LEDGER → TÀI LIỆU');
      if (!back.length) out.push('· Mọi mục Ledger đều được tài liệu nhắc tới.');
      back.forEach(function (it) { out.push('· ' + it.id + ' ' + it.t + ' — tài liệu không nhắc. Giữ nguyên, xác nhận lại khi gửi phiếu.'); });
      out.push(''); out.push('Đề xuất: giao A5 soạn thư làm rõ, dẫn số mục Ledger, hai phương án (giữ phạm vi / bổ sung phụ lục).');
      out.push('Agent không sửa Ledger. Cập nhật Ledger là việc của người chủ trì.');
      return out.join('\n');
    },
    A4: function (t) {
      var items = lines(t.note);
      if (!items.length) return 'DỪNG: không có danh sách hạng mục (dòng bắt đầu bằng "-").';
      var ok = [], miss = [];
      items.forEach(function (it) { var q = rateFor(it); if (q) ok.push({ it: it, q: q }); else miss.push(it); });
      var out = ['DỰ TOÁN THEO NGÀY CÔNG — ' + t.pr, 'Đơn giá ngày công: ' + vnd(DB.rates.dayRate), ''];
      ok.forEach(function (o) { out.push('· ' + o.it + ': ' + (o.q.qty > 1 ? o.q.qty + ' × ' + num(o.q.rate.d) + ' = ' : '') + num(o.q.days) + ' ngày (' + o.q.rate.n + ')'); });
      if (miss.length) {
        out.push(''); out.push('DỪNG — THIẾU HỆ SỐ');
        miss.forEach(function (m) { out.push('· ' + m + ': không có trong bảng hệ số được cấp. Không tự chế.'); });
        out.push(''); out.push('Không đưa ra tổng dự toán vì còn hạng mục thiếu hệ số. Cần người bổ sung bảng hệ số rồi chạy lại.');
      } else {
        var sum = ok.reduce(function (s, o) { return s + o.q.days; }, 0);
        out.push(''); out.push('TỔNG: ' + num(sum) + ' ngày công ≈ ' + vnd(sum * DB.rates.dayRate));
      }
      return out.join('\n');
    },
    A5: function (t, ctx) {
      var L = (ctx.ledger[t.pr] || { items: [] }).items;
      var out = ['Kính gửi Quý khách,', '', 'Về việc: ' + t.ttl.toLowerCase() + '.', ''];
      if (t.note) out.push(t.note.replace(/^>\s*/gm, ''));
      if (L.length) { out.push(''); out.push('Phạm vi hiện hành theo Scope Ledger ' + t.pr + ': ' + L.map(function (i) { return i.id; }).join(', ') + '. Mọi bổ sung ngoài các mục này sẽ được lập phụ lục riêng.'); }
      out.push(''); out.push('Trân trọng,'); out.push('LATTICE Next Solutions'); out.push(''); out.push('Bản nháp, chờ duyệt trước khi gửi');
      return out.join('\n');
    },
    A6: function (t, ctx) {
      var L = (ctx.ledger[t.pr] || { items: [] }).items;
      var out = ['SITEMAP — ' + t.pr];
      if (!L.length) out.push('· (chưa có Ledger — sitemap để trống, không tự thêm trang)');
      L.forEach(function (i) { out.push('· ' + i.t + '  [' + i.id + ']'); });
      out.push(''); out.push('WIREFRAME TRANG CHỦ (theo khối)');
      ['Header: logo, menu, nút hành động chính', 'Hero: một câu giá trị, một nút', 'Dịch vụ: lưới thẻ, mỗi thẻ trỏ tới một trang', 'Bằng chứng: người thật, số liệu có nguồn', 'Chân trang: email liên hệ'].forEach(function (s) { out.push('· ' + s); });
      out.push(''); out.push('DESIGN TOKENS'); out.push('color.ink #201E1D · color.bg #F3F2F2 · color.accent #EC3013 (≤5% diện tích)'); out.push('space 4/8/16/24/40 · radius 0 · font sans 16/24');
      return out.join('\n');
    },
    A7: function (t, ctx) {
      var L = (ctx.ledger[t.pr] || { items: [] }).items;
      return ['# build-spec.md — ' + t.pr, '',
        '## 1. Mục tiêu', t.ttl, '',
        '## 2. Phạm vi (từ Scope Ledger)', L.length ? L.map(function (i) { return '- ' + i.id + ' ' + i.t; }).join('\n') : '- (chưa có Ledger)', '',
        '## 3. Sitemap', L.map(function (i) { return '- ' + i.t; }).join('\n') || '-', '',
        '## 4. Thành phần giao diện', '- Header, Hero, Lưới thẻ, Biểu mẫu, Chân trang', '',
        '## 5. Dữ liệu và tích hợp', '- Biểu mẫu gửi về email chủ trì; không lưu dữ liệu cá nhân ngoài hệ thống', '',
        '## 6. Tiêu chí nghiệm thu', L.map(function (i) { return '- [ ] ' + i.id + ' hoạt động đúng mô tả'; }).join('\n') || '-', '',
        '## 7. Ràng buộc và ngoài phạm vi', '- Mọi hạng mục ngoài Ledger là ngoài phạm vi cho tới khi có phụ lục'].join('\n');
    },
    A9: function (t, ctx) {
      var L = (ctx.ledger[t.pr] || { items: [] }).items;
      if (!L.length) return 'DỪNG: không có Scope Ledger để lập checklist nghiệm thu.';
      var done = ctx.tasks.filter(function (x) { return x.pr === t.pr && x.st === 'xong'; });
      var out = ['CHECKLIST NGHIỆM THU — ' + t.pr, ''], pass = 0;
      L.forEach(function (it) {
        var ev = done.find(function (x) { return it.k.some(function (k) { return (x.ttl + ' ' + x.note).toLowerCase().indexOf(k) >= 0; }); });
        if (ev) { pass++; out.push('[Đạt] ' + it.id + ' ' + it.t + ' — bằng chứng: việc "' + ev.ttl + '" đã Xong'); }
        else out.push('[Chưa kiểm được] ' + it.id + ' ' + it.t + ' — không có bằng chứng, không đánh dấu đạt');
      });
      out.push(''); out.push('Kết luận: ' + pass + '/' + L.length + ' mục có bằng chứng đạt.');
      return out.join('\n');
    }
  };
  function simGeneric(t, ctx, a) {
    return a.id + ' ' + a.n + ' — đã xử lý "' + t.ttl + '" với bối cảnh ' + ctx.tasks.length + ' việc, ' + ctx.msgs.length + ' tin nhắn trong phạm vi người gọi.\n(Mô phỏng: agent mới chưa có mẫu đầu ra riêng.)';
  }

  function runAgent(taskId, uid) {
    var u = mustPerson(uid);
    if (!can('runAgent', u)) throw new LWError('noRunAgent');
    var t = task(taskId); if (!t || !seeTask(t, u)) throw new LWError('notFound');
    if (!isAgentId(t.as)) throw new LWError('notAgentTask');
    if (t.st === 'cho_duyet' || t.st === 'xong') throw new LWError('alreadyRan');
    var a = agent(t.as);
    takeRun(a);
    var ctx = buildContext(a.id, uid, t);
    var out = (SIM[a.id] || function (x, c) { return simGeneric(x, c, a); })(t, ctx);
    t.thr.push({ by: a.id, at: nowIso(0), t: out, k: 'result', ctx: ctx.text, run: uid });
    if (t.st === 'cho_giao') t.st = 'dang_lam';
    var target = (a.sc.review || t.gate) ? 'cho_duyet' : 'xong';
    updateTask(t.id, { st: target }, a.id); // agent tự chuyển trạng thái — tầng dữ liệu kiểm
    log(uid, 'agent.run', t.id, a.id + ' → ' + target);
    save();
    return t;
  }

  function agentAnswer(a, ctx, q) {
    var s = q.toLowerCase(), T = today();
    if (ctx.reads.indexOf('viec') < 0) return 'Tôi (' + a.id + ') không được cấp quyền đọc Việc nên không trả lời được câu này. Người chủ trì có thể mở rộng phạm vi đọc.';
    var ts = ctx.tasks;
    function row(x) { return '· [' + x.pr + '] ' + x.ttl + ' — hạn ' + (x.due || '—') + ', ' + (x.as ? actorName(x.as) : 'chưa giao') + ', ' + stLabel(x.st); }
    if (/trễ|quá hạn|chậm|late|overdue|behind/.test(s)) {
      var od = ts.filter(function (x) { return x.st !== 'xong' && x.due && x.due < T; });
      return od.length ? 'Trong phạm vi anh/chị được xem, có ' + od.length + ' việc quá hạn:\n' + od.map(row).join('\n') : 'Trong phạm vi anh/chị được xem, không có việc nào quá hạn.';
    }
    if (/duyệt|review|approv/.test(s)) {
      var w = ts.filter(function (x) { return x.st === 'cho_duyet'; });
      return w.length ? 'Việc đang chờ duyệt trong phạm vi của anh/chị:\n' + w.map(function (x) { return row(x) + ' — chủ trì: ' + actorName(x.own); }).join('\n') : 'Không có việc nào đang chờ duyệt trong phạm vi của anh/chị.';
    }
    if (/phạm vi|ledger|scope|lệch|drift/.test(s)) {
      var ks = Object.keys(ctx.ledger);
      if (ctx.reads.indexOf('ledger') < 0) return 'Tôi không được cấp quyền đọc Scope Ledger.';
      return ks.length ? ks.map(function (p) { return 'Scope Ledger ' + p + ' v' + ctx.ledger[p].v + ':\n' + ctx.ledger[p].items.map(function (i) { return '· ' + i.id + ' ' + i.t; }).join('\n'); }).join('\n\n') : 'Không có Scope Ledger nào trong phạm vi của anh/chị.';
    }
    if (/dự án|tình trạng|trạng thái|project|status/.test(s)) {
      var prs = {}; ts.forEach(function (x) { (prs[x.pr] = prs[x.pr] || []).push(x); });
      return Object.keys(prs).map(function (p) {
        var g = prs[p]; return '[' + p + '] ' + g.filter(function (x) { return x.st !== 'xong'; }).length + ' việc mở, ' + g.filter(function (x) { return x.st === 'cho_duyet'; }).length + ' chờ duyệt, ' + g.filter(function (x) { return x.st !== 'xong' && x.due && x.due < T; }).length + ' quá hạn';
      }).join('\n') || 'Không có dự án nào trong phạm vi của anh/chị.';
    }
    return 'Tôi là ' + a.id + ' — ' + a.n + '. ' + a.r + '.\nTôi trả lời được về: việc quá hạn, việc chờ duyệt, tình trạng dự án, Scope Ledger — trong đúng phạm vi anh/chị được xem.\n(Bản mẫu: câu trả lời mô phỏng từ dữ liệu, chưa gọi mô hình thật.)';
  }
  function stLabel(s) { return { cho_giao: 'Chờ giao', dang_lam: 'Đang làm', cho_duyet: 'Chờ duyệt', xong: 'Xong' }[s] || s; }

  function dmSend(agentId, uid, q) {
    var u = mustPerson(uid), a = agent(agentId);
    if (!a || !seeDM(a, u)) throw new LWError('notFound');
    if (!q || !String(q).trim()) return null;
    takeRun(a);
    var ctx = buildContext(a.id, uid, null);
    var list = DB.dms[a.id] || (DB.dms[a.id] = []);
    list.push({ u: uid, r: 'user', c: String(q).trim(), at: nowIso(0) });
    var ans = { u: uid, r: 'agent', c: agentAnswer(a, ctx, String(q)), at: nowIso(0), ctx: ctx.text };
    list.push(ans);
    log(uid, 'agent.dm', a.id, '');
    save();
    return ans;
  }

  /* ---------- kênh ---------- */
  function postMsg(chId, uid, text) {
    var u = mustPerson(uid), c = chan(chId);
    if (!c || !seeChan(c, u)) throw new LWError('notFound');
    if (!text || !String(text).trim()) return null;
    var m = { id: 'm' + uid_short().slice(1), ch: chId, by: uid, at: nowIso(0), t: String(text).trim(), task: null };
    DB.msgs.push(m); save(); return m;
  }
  function msgToTask(msgId, f, uid) {
    var m = DB.msgs.find(function (x) { return x.id === msgId; });
    var u = mustPerson(uid);
    if (!m || !seeChan(chan(m.ch), u)) throw new LWError('notFound');
    if (m.task) throw new LWError('alreadyTask');
    var quote = '> ' + actorName(m.by) + ' trong #' + chan(m.ch).n + ': "' + m.t + '"';
    return createTask(Object.assign({}, f, { src: m.id, note: quote + (f.note ? '\n\n' + f.note : '') }), uid);
  }
  function saveChan(c, uid) {
    var u = mustPerson(uid); if (!can('admin', u)) throw new LWError('noPermission');
    var n = String(c.n || '').trim().toLowerCase().replace(/\s+/g, '-');
    if (!n) throw new LWError('titleRequired');
    if (c.id) { var x = chan(c.id); x.n = n; x.d = c.d || ''; x.mem = c.mem.slice(); }
    else { c = { id: 'c' + uid_short().slice(1), n: n, d: c.d || '', mem: c.mem.slice() }; DB.chans.push(c); }
    if ((c.mem || []).indexOf(uid) < 0 && !c.id) { /* chủ sở hữu tự quyết có ở trong kênh hay không */ }
    log(uid, 'chan.save', n, ''); save();
  }

  /* ---------- 7 · luồng ---------- */
  function launchFlow(flowId, opt, uid) {
    var u = mustPerson(uid);
    if (!can('launchFlow', u)) throw new LWError('noLaunch');
    var f = DB.flows.find(function (x) { return x.id === flowId; }); if (!f) throw new LWError('notFound');
    if (projsOf(u).indexOf(opt.pr) < 0) throw new LWError('projOutOfScope');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(opt.start || '')) throw new LWError('startRequired');
    f.steps.forEach(function (s, i) {
      if (s.as === 'NGUOI' && !person((opt.people || {})[i])) throw new LWError('flowNeedsPerson', (i + 1) + '. ' + s.t);
      if (s.as !== 'NGUOI' && !agent(s.as)) throw new LWError('badAssignee', s.as);
    });
    var made = [];
    var snapshot = JSON.stringify(DB.tasks);
    try {
      f.steps.forEach(function (s, i) {
        var human = s.as === 'NGUOI';
        made.push(createTask({
          ttl: s.t, pr: opt.pr, as: human ? opt.people[i] : s.as,
          own: human ? uid : agent(s.as).sc.own, // bước agent tự lấy người chủ trì từ phạm vi
          due: addDays(opt.start, s.off), gate: s.gate, flow: f.id,
          note: 'Bước ' + (i + 1) + '/' + f.steps.length + ' của luồng "' + f.n + '".'
        }, uid));
      });
    } catch (e) { DB.tasks = JSON.parse(snapshot); save(); throw e; }
    log(uid, 'flow.launch', f.id, opt.pr + ' · ' + made.length + ' việc');
    save();
    return made;
  }

  /* ---------- đội, agent, cài đặt ---------- */
  function login(mail, pw) {
    var p = DB.people.find(function (x) { return x.mail.toLowerCase() === String(mail || '').trim().toLowerCase(); });
    if (!p || sha256(p.pw.salt + ':' + pw) !== p.pw.hash) throw new LWError('badLogin');
    log(p.id, 'login', '', ''); save();
    return p;
  }
  function changePw(uid, oldPw, newPw) {
    var p = mustPerson(uid);
    if (sha256(p.pw.salt + ':' + oldPw) !== p.pw.hash) throw new LWError('badOldPw');
    if (!newPw || newPw.length < 8) throw new LWError('pwTooShort');
    p.pw = mkPw(newPw); log(uid, 'pw.change', '', ''); save();
  }
  function updateSelf(uid, f) {
    var p = mustPerson(uid);
    ['n', 'ini', 'av', 'r', 'bio'].forEach(function (k) { if (k in f) p[k] = f[k]; });
    if (!String(p.n || '').trim()) throw new LWError('titleRequired');
    p.ini = String(p.ini || '').trim().slice(0, 3).toUpperCase() || initials(p.n);
    log(uid, 'profile.update', uid, ''); save();
  }
  function initials(n) { var w = String(n).trim().split(/\s+/); return ((w[0] || '')[0] + (w.length > 1 ? w[w.length - 1][0] : '')).toUpperCase(); }
  function savePerson(f, uid) {
    var u = mustPerson(uid); if (!can('admin', u)) throw new LWError('noPermission');
    if (ROLES.indexOf(f.role) < 0) throw new LWError('badRole');
    if (!String(f.n || '').trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.mail || '')) throw new LWError('personFields');
    var dup = DB.people.find(function (p) { return p.mail.toLowerCase() === f.mail.toLowerCase() && p.id !== f.id; });
    if (dup) throw new LWError('mailTaken');
    var p = f.id ? person(f.id) : null;
    if (p) {
      var owners = DB.people.filter(function (x) { return x.role === 'owner'; });
      if (p.role === 'owner' && f.role !== 'owner' && owners.length === 1) throw new LWError('lastOwner');
      if ((f.role === 'mem' || f.role === 'guest') && DB.agents.some(function (a) { return a.sc.own === p.id; })) throw new LWError('stillOwnsAgents');
      p.n = f.n; p.mail = f.mail; p.r = f.r || ''; p.role = f.role; p.cap = Math.max(0, parseInt(f.cap, 10) || 0); p.sc.proj = (f.proj || []).slice();
    } else {
      p = { id: 'u' + uid_short().slice(1), n: f.n, ini: initials(f.n), av: null, mail: f.mail, r: f.r || '', bio: '', role: f.role, cap: Math.max(0, parseInt(f.cap, 10) || 0), sc: { proj: (f.proj || []).slice() }, pw: mkPw(DEMO_PW) };
      DB.people.push(p);
    }
    log(uid, 'person.save', p.id, p.n + ' · ' + p.role); save();
    return p;
  }
  function saveAgent(f, uid, isNew) {
    var u = mustPerson(uid); if (!can('admin', u)) throw new LWError('noPermission');
    if (!/^A[0-9]+$/.test(f.id || '')) throw new LWError('agentIdFormat');
    var ex = agent(f.id);
    if (isNew && ex) throw new LWError('agentIdTaken');
    var own = person(f.sc.own);
    if (!own) throw new LWError('ownerRequired');
    if (own.role !== 'owner' && own.role !== 'pm') throw new LWError('agentOwnerRole');
    if (!String(f.n || '').trim()) throw new LWError('titleRequired');
    var sc = {
      own: f.sc.own,
      reads: f.sc.reads.filter(function (r) { return READS.indexOf(r) >= 0; }),
      can: f.sc.can.filter(function (c) { return CANS.indexOf(c) >= 0; }), // chỉ hành động hoàn tác được
      review: !!f.sc.review,
      limit: Math.max(0, parseInt(f.sc.limit, 10) || 0)
    };
    if (ex) { ex.n = f.n; ex.r = f.r || ''; ex.p = f.p || ''; ex.sc = sc; }
    else DB.agents.push({ id: f.id, n: f.n, r: f.r || '', p: f.p || '', sc: sc });
    log(uid, 'agent.save', f.id, 'chủ trì ' + own.n + ' · duyệt ' + (sc.review ? 'bắt buộc' : 'tắt')); save();
  }
  function addRate(k, n, d, uid) {
    var u = mustPerson(uid); if (!can('admin', u)) throw new LWError('noPermission');
    k = String(k || '').trim().toLowerCase(); d = Number(String(d).replace(',', '.'));
    if (!k || !String(n || '').trim() || !(d > 0)) throw new LWError('rateFields');
    if (DB.rates.items.some(function (r) { return r.k === k; })) throw new LWError('rateTaken');
    DB.rates.items.push({ k: k, n: String(n).trim(), d: d });
    log(uid, 'rate.add', k, n + ' · ' + d + ' ngày'); save();
  }
  function saveCfg(group, vals, uid) {
    var u = mustPerson(uid); if (!can('admin', u)) throw new LWError('noPermission');
    var g = DB.cfg[group]; if (!g) throw new LWError('notFound');
    Object.keys(vals).forEach(function (k) { if (k !== 'key' && k !== 'tok') g[k] = vals[k]; });
    log(uid, 'cfg.save', group, ''); save();
  }
  // Khóa bí mật chỉ ghi, không đọc lại: giá trị bị bỏ ngay, chỉ giữ ngày đặt.
  function setSecret(group, field, value, uid) {
    var u = mustPerson(uid); if (!can('admin', u)) throw new LWError('noPermission');
    if (!value || !String(value).trim()) throw new LWError('secretEmpty');
    DB.cfg[group][field] = { setAt: today() };
    log(uid, 'secret.set', group + '.' + field, 'đã đặt (giá trị không lưu)'); save();
  }

  root.LW = {
    KEY: KEY, ST: ST, ROLES: ROLES, READS: READS, CANS: CANS, PERM: PERM, FORBIDDEN: FORBIDDEN, DEMO_PW: DEMO_PW,
    LWError: LWError, sha256: sha256, today: today, addDays: addDays, vnd: vnd,
    load: load, save: save, reset: reset, seed: seed, use: use, db: function () { return DB; },
    isAgentId: isAgentId, person: person, agent: agent, actorName: actorName, task: task, project: project, chan: chan,
    can: can, projsOf: projsOf, seeTask: seeTask, seeChan: seeChan, seeDM: seeDM, seeTeam: seeTeam, seeSettings: seeSettings, seeContacts: seeContacts,
    visibleTasks: visibleTasks, visibleChans: visibleChans, visibleAgentsForDM: visibleAgentsForDM, openLoad: openLoad, mayTouch: mayTouch,
    createTask: createTask, updateTask: updateTask, approve: approve, sendBack: sendBack, comment: comment, deleteTask: deleteTask,
    sendEmail: sendEmail, editLedger: editLedger, probeForbidden: probeForbidden,
    buildContext: buildContext, runAgent: runAgent, runsToday: runsToday, dmSend: dmSend,
    postMsg: postMsg, msgToTask: msgToTask, saveChan: saveChan, launchFlow: launchFlow,
    login: login, changePw: changePw, updateSelf: updateSelf, savePerson: savePerson, saveAgent: saveAgent, saveCfg: saveCfg, addRate: addRate, setSecret: setSecret
  };
})(typeof window !== 'undefined' ? window : globalThis);
