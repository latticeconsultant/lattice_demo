/* ABZ Corporation — giao diện: điều hướng, vai trò, các màn hình, thanh giả lập.
   Mọi màn đọc cùng một trạng thái E.S(); bộ máy giả lập báo đổi → vẽ lại màn đang mở. */
(function () {
  'use strict';
  var D = window.ABZ.DATA, E = window.ABZ.E, C = window.ABZ.C;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var tr = E.tr;
  var ty = function (v) { return (v / 1e9).toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' tỷ'; };
  var tien = function (v) { return Math.abs(v) >= 1e9 ? ty(v) : tr(v); };
  var pct = function (v, d) { return (v * 100).toLocaleString('vi-VN', { maximumFractionDigits: d == null ? 1 : d }) + '%'; };
  var sum = function (a, f) { return a.reduce(function (s, x) { return s + (typeof f === 'function' ? f(x) : x[f]); }, 0); };
  var ngayVN = function (k) { var p = k.split('-'); return +p[2] + '/' + +p[1]; };
  var THU = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  var tenNhom = function (id) { return D.NHOM.find(function (n) { return n.id === id; }).ten; };
  var tenKenh = function (id) { return D.KENH.find(function (n) { return n.id === id; }).ten; };
  var tenKhoi = function (id) { return D.KHOI.find(function (n) { return n.id === id; }); };
  var viTat = function (ten) { var p = ten.split(' '); return (p[0][0] + p[p.length - 1][0]).toUpperCase(); };
  var MAU_KENH = { daily: 'var(--s1)', sieuthi: 'var(--s2)', san: 'var(--s3)', b2b: 'var(--s4)', le: 'var(--s5)' };

  // ── Biểu tượng ───────────────────────────────────────────────────────────
  var IC = {
    dash: '<path d="M4 13h6V4H4zM14 20h6v-9h-6zM4 20h6v-4H4zM14 4v4h6V4z"/>',
    pulse: '<path d="M3 12h4l3-7 4 14 3-7h4"/>',
    inbox: '<path d="M4 13l2.5-8h11L20 13v6H4zM4 13h5l1 2h4l1-2h5"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    org: '<rect x="9" y="3" width="6" height="5" rx="1"/><rect x="3" y="16" width="6" height="5" rx="1"/><rect x="15" y="16" width="6" height="5" rx="1"/><path d="M12 8v4M6 16v-2h12v2"/>',
    play: '<path d="M7 5l12 7-12 7z" fill="currentColor" stroke="none"/>',
    pause: '<path d="M7 5h3v14H7zM14 5h3v14h-3z" fill="currentColor" stroke="none"/>',
    next: '<path d="M6 5l9 7-9 7zM17 5h2v14h-2z" fill="currentColor" stroke="none"/>',
    reset: '<path d="M4 12a8 8 0 1 0 2.5-5.8M4 4v5h5"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="1.5" fill="currentColor" stroke="none"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
    k: { cl: '<path d="M4 20V10l8-6 8 6v10M9 20v-6h6v6"/>', nh: '<path d="M3 7l9-4 9 4-9 4zM3 7v10l9 4 9-4V7"/>', hd: '<path d="M4 19V5M4 19h16M8 15l4-4 3 3 5-6"/>',
      mk: '<path d="M4 10v4l11 5V5zM15 9a3 3 0 0 1 0 6M4 14l1 5h3l-1-4"/>', kd: '<path d="M4 7h16l-1.5 9h-13zM9 20a1 1 0 1 0 0-.1M16 20a1 1 0 1 0 0-.1M2 4h3l1 3"/>',
      kv: '<path d="M2 7h11v9H2zM13 10h4l3 3v3h-7M6 19a2 2 0 1 0 0-.1M17 19a2 2 0 1 0 0-.1"/>', dv: '<path d="M4 5h16v11H9l-5 4z"/>', ht: '<path d="M12 3v18M17 7H9.5a3 3 0 0 0 0 6h5a3 3 0 0 1 0 6H6"/>' }
  };
  var ic = function (p, w) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="' + (w || 18) + '" height="' + (w || 18) + '" aria-hidden="true">' + p + '</svg>'; };
  var LOGO = '<svg width="38" height="38" viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="10" fill="#fff" fill-opacity=".1"/><path d="M9 19h22a11 11 0 0 1-22 0z" fill="#C2652A"/><path d="M7 15.5h26" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/><path d="M17 11.5h6" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/></svg>';

  // ── Vai trò ──────────────────────────────────────────────────────────────
  var VAI = [
    { id: 'ceo', nha: 'tong-quan' }, { id: 'kd', nha: 'khoi/kd' }, { id: 'mh', nha: 'khoi/nh' }, { id: 'hd', nha: 'khoi/hd' },
    { id: 'kho', nha: 'khoi/kv' }, { id: 'tc', nha: 'khoi/ht' }, { id: 'mk', nha: 'khoi/mk' }, { id: 'cs', nha: 'khoi/dv' }
  ];
  var vai = 'ceo';
  try { vai = localStorage.getItem('abz-vai') || 'ceo'; } catch (e) {}
  if (!VAI.some(function (v) { return v.id === vai; })) vai = 'ceo';
  var moVai = false, khoang = 30, locFeed = 'tat', hoiDap = null, nkCu = 0;

  // ── Điều hướng ───────────────────────────────────────────────────────────
  function trang() { var h = location.hash.replace(/^#\/?/, ''); return h || (VAI.find(function (v) { return v.id === vai; }).nha); }
  addEventListener('hashchange', function () { veTat(true); scrollTo(0, 0); });

  function veSide(S) {
    var t = trang(), cho = S.viec.filter(function (v) { return v.tt === 'cho'; }), choToi = cho.filter(function (v) { return v.nguoiDuyet === vai; }).length;
    var cb = S.canhBao.filter(function (c) { return !c.xong; }), nang = cb.some(function (c) { return c.muc === 'critical'; });
    var nav = function (href, nhan, icon, them) { return '<a class="nav" href="#' + href + '"' + (t === href ? ' aria-current="page"' : '') + '>' + ic(icon) + '<span>' + nhan + '</span>' + (them || '') + '</a>'; };
    var h = '<a class="logo" href="#tong-quan" aria-label="ABZ Corporation">' + LOGO + '<span><b>ABZ</b><small>CORPORATION</small></span></a>';
    h += nav('tong-quan', 'Tổng quan', IC.dash);
    h += nav('van-hanh', 'Trung tâm vận hành', IC.pulse, S.chay ? '<span class="song" title="Đang chạy giả lập"></span>' : '');
    h += nav('viec', 'Việc của tôi', IC.inbox, choToi ? '<span class="bdg">' + choToi + '</span>' : '');
    h += nav('giam-sat', 'AI Giám sát', IC.eye, cb.length ? '<span class="bdg' + (nang ? ' crit' : '') + '">' + cb.length + '</span>' : '');
    h += '<div class="sec">Khối nghiệp vụ</div>';
    D.KHOI.forEach(function (k) {
      var song = S.chay && S.noiBat === k.id;
      h += nav('khoi/' + k.id, k.ngan, IC.k[k.id], song ? '<span class="song"></span>' : '');
    });
    h += '<div class="sec">Cấu hình</div>';
    h += nav('thiet-lap', 'Thiết lập mức AI', IC.sliders);
    h += nav('so-do', 'Người & AI', IC.org);
    h += '<p class="demo-note">Mô hình demo. ABZ Corporation và mọi số liệu đều giả lập.</p>';
    $('#side').innerHTML = h;
  }

  var TIEU_DE = { 'tong-quan': 'Tổng quan điều hành', 'van-hanh': 'Trung tâm vận hành', viec: 'Việc của tôi', 'giam-sat': 'AI Giám sát', 'thiet-lap': 'Thiết lập mức AI', 'so-do': 'Người & AI theo khối' };
  function veTop(S) {
    var t = trang(), td = TIEU_DE[t] || (t.indexOf('khoi/') === 0 ? tenKhoi(t.slice(5)).ten : '');
    var n = E.nguoi(vai), g = S.gio;
    var h = '<div><div class="crumb">ABZ Corporation · ' + esc(D.CONG_TY.nganh) + '</div><h1>' + esc(td) + '</h1></div><span class="sp"></span>';
    h += '<div class="clock" title="Đồng hồ giả lập"><span class="live' + (S.chay ? ' on' : '') + '"></span>' + THU[g.getDay()] + ' ' + g.getDate() + '/' + (g.getMonth() + 1) + ' <b>' + E.gioChu(g) + '</b></div>';
    h += '<div class="vai"><button type="button" id="nutVai" aria-haspopup="true" aria-expanded="' + moVai + '"><span class="av">' + viTat(n.ten) + '</span><span><small>Đang xem với vai</small><b>' + esc(n.vt) + '</b></span></button>';
    if (moVai) {
      h += '<div class="ds" role="menu"><div class="h">Chuyển vai — mỗi vai thấy màn và việc của mình</div>';
      VAI.forEach(function (v) {
        var p = E.nguoi(v.id), so = S.viec.filter(function (x) { return x.tt === 'cho' && x.nguoiDuyet === v.id; }).length;
        h += '<button type="button" role="menuitem" data-vai="' + v.id + '"' + (v.id === vai ? ' aria-current="true"' : '') + '><span class="av sm">' + viTat(p.ten) + '</span><span style="flex:1"><b>' + esc(p.ten) + '</b><small>' + esc(p.vt) + '</small></span>' + (so ? '<span class="chip ai">' + so + ' việc</span>' : '') + '</button>';
      });
      h += '</div>';
    }
    h += '</div><button type="button" class="icon-btn" id="nutNen" aria-label="Chuyển sáng / tối" title="Chuyển sáng / tối">' + ic(IC.moon) + '</button>';
    $('#topIn').innerHTML = h;
  }

  // ── Thanh giả lập ────────────────────────────────────────────────────────
  var chonKB = 'don-lon', dockMo = false;
  function veDock(S) {
    var kb = E.KICH_BAN.find(function (k) { return k.id === (S.kichBan || chonKB); });
    var h = '<div class="dock-in' + (dockMo ? ' mo' : '') + '"><div class="dock-row"><span class="lbl">Giả lập</span><select id="chonKB" aria-label="Chọn tình huống">';
    E.KICH_BAN.forEach(function (k, i) { h += '<option value="' + k.id + '"' + (k.id === (S.kichBan || chonKB) ? ' selected' : '') + '>' + (i + 1) + '. ' + esc(k.ten) + '</option>'; });
    h += '</select>';
    if (!S.kichBan || (S.buoc && S.buoc.xong)) h += '<button class="db go" id="dChay">' + ic(IC.play, 15) + 'Chạy tình huống</button>';
    else if (S.chay) h += '<button class="db" id="dDung">' + ic(IC.pause, 15) + 'Tạm dừng</button>';
    else h += '<button class="db go" id="dTiepTuc">' + ic(IC.play, 15) + 'Tiếp tục</button>';
    if (S.kichBan && S.cheDo === 'trinh' && S.chay && !(S.buoc && S.buoc.xong) && !S.dangCho) h += '<button class="db go" id="dTiep">' + ic(IC.next, 15) + 'Bước tiếp</button>';
    if (S.kichBan && !(S.buoc && S.buoc.xong)) h += '<button class="db" id="dStop" title="Dừng tình huống">' + ic(IC.stop, 15) + '</button>';
    h += '<button class="db chi-dt" id="dMo" aria-expanded="' + dockMo + '" title="Tùy chọn giả lập">' + (dockMo ? 'Thu gọn' : 'Tùy chọn') + '</button>';
    h += '<span class="sp"></span><div class="seg tuy" role="group" aria-label="Chế độ"><button aria-pressed="' + (S.cheDo === 'tu') + '" data-che="tu">Tự chạy có lời dẫn</button><button aria-pressed="' + (S.cheDo === 'trinh') + '" data-che="trinh">Trình bày</button></div>';
    h += '<div class="seg tuy" role="group" aria-label="Tốc độ">' + [1, 2, 4].map(function (x) { return '<button aria-pressed="' + (S.tocDo === x) + '" data-toc="' + x + '">' + x + '×</button>'; }).join('') + '</div>';
    h += '<button class="db tuy" id="dReset" title="Đặt lại toàn bộ dữ liệu demo">' + ic(IC.reset, 15) + 'Đặt lại</button></div>';
    var b = S.buoc;
    var loi = b ? b.loiDan : (kb ? kb.moDau : '');
    var so = b ? (b.xong ? 'Xong' : 'Bước ' + b.so) : 'Sẵn sàng';
    h += '<div class="tien-do"><i style="width:' + (b ? Math.min(100, b.so / Math.max(1, b.tong) * 100) : 0) + '%"></i></div>';
    h += '<div class="loidan"><span class="so">' + so + '</span><div style="flex:1"><p>' + esc(loi) + '</p>';
    if (S.dangCho) {
      var v = S.viec.find(function (x) { return x.id === S.dangCho.viec; }), p = E.nguoi(S.dangCho.nguoi);
      if (v && S.cheDo === 'trinh') {
        h += '<div class="cho"><span class="chip ai">Chờ ' + esc(p.ten) + ' · ' + esc(p.vt) + '</span><button class="db go" data-duyet="' + v.id + '">' + (v.nguoiLam ? 'Đã xử lý xong' : 'Duyệt') + '</button>' + (v.nguoiLam ? '' : '<button class="db" data-tuchoi="' + v.id + '">Từ chối</button>') + (vai !== p.id ? '<button class="db" data-vai="' + p.id + '">Chuyển sang vai ' + esc(E.ten1(p.id)) + '</button>' : '') + '</div>';
      } else if (v) h += '<div class="cho"><span class="chip ai">Đang chờ ' + esc(p.ten) + ' duyệt…</span></div>';
    }
    h += '</div></div></div>';
    $('#dock').innerHTML = h;
  }

  // ── Mẩu dùng chung ───────────────────────────────────────────────────────
  function tacNhan(ev) {
    if (ev.ai) { var a = E.agent(ev.ai); return { av: '<span class="av ai sm" title="' + esc(a.ten) + '">AI</span>', ten: a.ten, loai: 'ai' }; }
    var n = E.nguoi(ev.nguoi); return { av: '<span class="av sm">' + viTat(n.ten) + '</span>', ten: n.ten + ' · ' + n.vt, loai: 'ng' };
  }
  function suKien(ev, S, moi) {
    var t = tacNhan(ev), k = tenKhoi(ev.khoi);
    var cho = ev.cho && S.viec.some(function (v) { return v.tt === 'cho' && v.agent === ev.ai && v.khoi === ev.khoi; });
    var h = '<div class="ev' + (cho ? ' cho' : '') + (ev.loai === 'giam-sat' ? ' gs' : '') + (moi ? ' moi' : '') + '">' + t.av + '<div><div class="m"><b>' + esc(t.ten) + '</b>';
    if (ev.muc != null) h += '<span class="chip lv ai" title="' + esc(D.MUC[ev.muc].mo) + '">L' + ev.muc + ' · ' + esc(D.MUC[ev.muc].ten) + '</span>';
    else if (t.loai === 'ng') h += '<span class="chip ng">Người</span>';
    h += '<span>' + esc(k ? k.ngan : '') + ' · ' + E.gioChu(new Date(ev.luc)) + '</span></div><div class="t">' + esc(ev.text) + '</div></div></div>';
    return h;
  }
  function trangThaiChu(tt) {
    var m = { moi: ['info', 'Mới'], xong: ['ok', 'Đã giao'], 'dang-giao': ['info', 'Đang giao'], tre: ['serious', 'Trễ hẹn'], 'giao-mot-phan': ['warn', 'Giao 1 phần'],
      'da-dat': ['info', 'Đã đặt'], 'dang-ve': ['info', 'Đang về'], 'da-nhan': ['ok', 'Đã nhận'], 'dang-xu-ly': ['warn', 'Đang xử lý'], 'ai-xong': ['ok', 'AI đã xử lý'], chay: ['ok', 'Đang chạy'] }[tt] || ['info', tt];
    return '<span class="tt ' + m[0] + '"><i></i>' + m[1] + '</span>';
  }
  function xuLyChu(x) { return x === 'ai' ? '<span class="chip ai">AI tự làm</span>' : x === 'ai-duyet' ? '<span class="chip ai">AI soạn · người duyệt</span>' : '<span class="chip ng">Người</span>'; }
  function the(tieuDe, phu, than, id, them) { return '<section class="card ' + (them || '') + '"' + (id ? ' id="' + id + '"' : '') + '><div class="card-h"><div><h3>' + tieuDe + '</h3>' + (phu ? '<div class="sub">' + phu + '</div>' : '') + '</div></div>' + than + '</section>'; }
  function oSo(nhan, gt, dong, spark, mau) { return '<div class="kpi"><div class="l">' + nhan + '</div><div class="v">' + gt + '</div><div class="d">' + (dong || '') + '</div>' + (spark ? C.spark(spark, mau) : '') + '</div>'; }
  function delta(moi, cu, tot) {
    if (!cu) return '';
    var d = moi / cu - 1, len = d >= 0, ok = tot === false ? !len : len;
    return '<span class="' + (ok ? 'up' : 'dn') + '">' + (len ? '▲ ' : '▼ ') + pct(Math.abs(d)) + '</span>';
  }

  // Chuỗi số liệu theo khoảng ngày + điểm "hôm nay" (đến giờ giả lập)
  function chuoi(S, n) {
    var a = S.ngay.slice(-n);
    return { ngay: a, nhan: a.map(function (x) { return ngayVN(x.ngay); }), nhanDai: a.map(function (x) { return THU[x.thu] + ' ' + ngayVN(x.ngay); }) };
  }

  // ── Màn: Tổng quan ───────────────────────────────────────────────────────
  function mTongQuan(S, p) {
    var c = chuoi(S, khoang), a = c.ngay, truoc = S.ngay.slice(-khoang * 2, -khoang);
    var dt = sum(a, 'dt'), dtTruoc = sum(truoc, 'dt'), lg = sum(a, 'lg');
    var phaiThu = sum(S.kh, 'congNo'), quaHan = sum(S.kh, 'quaHan');
    var tongViec = sum(a, function (x) { return x.aiTu + x.aiSoan + x.nguoi; }), aiTG = sum(a, function (x) { return x.aiTu + x.aiSoan; }) / tongViec;
    var dungHan = 1 - sum(a, 'tre') / sum(a, 'don'), dungHanTruoc = 1 - sum(truoc, 'tre') / sum(truoc, 'don');
    var hn = S.homNay;
    var h = '<div class="filters"><span class="lbl">Khoảng thời gian</span><div class="seg" role="group" aria-label="Khoảng thời gian">' + [7, 30, 90].map(function (x) { return '<button aria-pressed="' + (khoang === x) + '" data-khoang="' + x + '">' + x + ' ngày</button>'; }).join('') + '</div><span class="lbl">· số liệu đến hết hôm qua; ô "Hôm nay" chạy theo giả lập</span></div>';
    h += '<div class="hero"><section class="card"><div class="sub" style="margin:0">Doanh thu ' + khoang + ' ngày</div><div class="hero-v">' + ty(dt) + '</div><div class="d" style="font-size:13px;color:var(--muted)">' + delta(dt, dtTruoc) + ' so với ' + khoang + ' ngày trước đó</div>';
    h += '<div class="tach"><div><b>' + pct(lg / dt) + '</b><small>Biên lãi gộp</small></div><div><b>' + sum(a, 'don').toLocaleString('vi-VN') + '</b><small>Đơn hàng</small></div><div><b>' + tr(dt / sum(a, 'don')) + '</b><small>Giá trị TB/đơn</small></div><div><b>' + pct(aiTG, 0) + '</b><small>Đơn có AI xử lý</small></div></div></section>';
    h += the('Doanh thu và lãi gộp theo ngày', 'Rê chuột để xem từng ngày', '<div id="cDoanhThu"></div>') + '</div>';
    h += '<div class="kpis">';
    h += oSo('Hôm nay (đến ' + E.gioChu(S.gio) + ')', tr(hn.dt), hn.don + ' đơn · thu ' + tr(hn.thu));
    h += oSo('Tiền mặt', ty(S.tienMat), 'cuối ngày hôm qua ' + ty(S.ngay[S.ngay.length - 1].tienMat), S.ngay.slice(-30).map(function (x) { return x.tienMat; }));
    h += oSo('Phải thu khách hàng', tr(phaiThu), '<span class="tt crit"><i></i>Quá hạn ' + tr(quaHan) + '</span>');
    h += oSo('Giao đúng hẹn', pct(dungHan), delta(dungHan, dungHanTruoc) + ' · mục tiêu ≥ 95%', a.map(function (x) { return 1 - x.tre / x.don; }), dungHan < 0.95 ? 'var(--serious)' : 'var(--s1)');
    h += oSo('Việc chờ người duyệt', S.viec.filter(function (v) { return v.tt === 'cho'; }).length, '<a href="#viec">Xem việc →</a>');
    h += '</div>';
    h += '<div class="grid g-21 mb">' + the('Ai xử lý đơn hàng: người hay AI', 'Câu chuyện tái cấu trúc — theo tuần. Trước tháng 9: gần như toàn bộ là người làm.', '<div id="cAiNguoi"></div>') +
      the('Doanh thu theo kênh', khoang + ' ngày', '<div id="cKenh"></div>') + '</div>';
    h += '<div class="grid g3 mb">' + the('Doanh thu theo ngành hàng', khoang + ' ngày', '<div id="cNhom"></div>') +
      the('Tồn kho: số ngày bán còn lại', '8 mã thấp nhất · điểm đặt hàng là ngưỡng an toàn', '<div id="cTon"></div>') +
      the('Công nợ phải thu theo tuổi nợ', 'Toàn bộ khách có hạn mức', '<div id="cTuoiNo"></div>') + '</div>';
    var cb = xepCanh(S.canhBao.filter(function (x) { return !x.xong; })).slice(0, 4);
    h += '<div class="grid g2">' + the('AI Giám sát · điểm cần chú ý', '<a href="#giam-sat">Xem tất cả →</a>', cb.length ? cb.map(canhBaoHtml).join('') : '<div class="empty">Không có gì bất thường.</div>') +
      the('Hoạt động mới nhất', '<a href="#van-hanh">Trung tâm vận hành →</a>', '<div class="feed">' + S.nhatKy.slice(0, 5).map(function (e) { return suKien(e, S); }).join('') + '</div>') + '</div>';
    p.innerHTML = h;

    C.duong($('#cDoanhThu'), { nhan: c.nhan, nhanDai: c.nhanDai, cao: 230, moTa: 'Doanh thu và lãi gộp theo ngày',
      chuoi: [{ ten: 'Doanh thu', mau: 'var(--s1)', gt: a.map(function (x) { return x.dt; }) }, { ten: 'Lãi gộp', mau: 'var(--s2)', gt: a.map(function (x) { return x.lg; }) }], dinhDang: tr });
    // Người & AI theo tuần (luôn 13 tuần để thấy câu chuyện)
    var tuan = [], nt = [];
    for (var i = 0; i < S.ngay.length; i += 7) { var w = S.ngay.slice(i, i + 7); tuan.push(w); nt.push(ngayVN(w[0].ngay)); }
    C.cotChong($('#cAiNguoi'), { nhan: nt, nhanDai: tuan.map(function (w) { return 'Tuần ' + ngayVN(w[0].ngay) + '–' + ngayVN(w[w.length - 1].ngay); }), cao: 230, dinhDang: function (v) { return v.toLocaleString('vi-VN') + ' đơn'; },
      chuoi: [{ ten: 'Người làm', mau: 'var(--s2)', gt: tuan.map(function (w) { return sum(w, 'nguoi'); }) }, { ten: 'AI soạn · người duyệt', mau: 'var(--s4)', gt: tuan.map(function (w) { return sum(w, 'aiSoan'); }) }, { ten: 'AI tự làm', mau: 'var(--s3)', gt: tuan.map(function (w) { return sum(w, 'aiTu'); }) }] });
    C.tiTrong($('#cKenh'), { phan: D.KENH.map(function (k) { return { ten: k.ten, mau: MAU_KENH[k.id], gt: sum(a, function (x) { return x.theoKenh[k.id]; }), chuToi: k.id === 'le' }; }), dinhDang: tien });
    C.thanh($('#cNhom'), { muc: D.NHOM.map(function (n) { return { ten: n.ten, gt: sum(a, function (x) { return x.theoNhom[n.id]; }) }; }).sort(function (x, y) { return y.gt - x.gt; }), dinhDang: tien });
    veTon($('#cTon'), S, 8);
    var tuoi = [['Trong hạn', 0], ['1–15 ngày', 0], ['16–30 ngày', 0], ['Trên 30 ngày', 0]];
    S.kh.forEach(function (k) { tuoi[0][1] += k.congNo - k.quaHan; if (k.quaHan) tuoi[k.soNgayQH > 30 ? 3 : k.soNgayQH > 15 ? 2 : 1][1] += k.quaHan; });
    C.thanh($('#cTuoiNo'), { muc: tuoi.map(function (t, i) { return { ten: t[0], gt: t[1], mau: ['var(--seq1)', 'var(--seq2)', 'var(--seq3)', 'var(--seq4)'][i] }; }), dinhDang: tr });
  }
  function veTon(el, S, n) {
    var ds = S.sp.map(function (p) { var t = p.ton.BD + p.ton.HN; return { p: p, ngay: t / p.banNgay, duoi: t < p.rop, nua: t < p.rop * 0.5 }; }).sort(function (a, b) { return a.ngay - b.ngay; }).slice(0, n);
    C.thanh(el, { muc: ds.map(function (x) { return { ten: x.p.ten, gt: x.ngay, mau: x.nua ? 'var(--crit)' : x.duoi ? 'var(--serious)' : 'var(--s1)', phu: (x.nua ? '⚠ Nguy cấp' : x.duoi ? '⚠ Dưới điểm đặt hàng' : 'Bình thường') + ' · tồn ' + (x.p.ton.BD + x.p.ton.HN) }; }), dinhDang: function (v) { return Math.floor(v) + ' ngày'; } });
    var chu = document.createElement('div'); chu.className = 'cv-legend'; chu.style.marginTop = '10px';
    chu.innerHTML = '<span><i class="cv-key" style="background:var(--crit)"></i>⚠ Dưới 50% điểm đặt hàng</span><span><i class="cv-key" style="background:var(--serious)"></i>⚠ Dưới điểm đặt hàng</span><span><i class="cv-key" style="background:var(--s1)"></i>Đủ hàng</span>';
    el.appendChild(chu);
  }
  var THU_TU = { critical: 0, serious: 1, warning: 2, nhac: 3, info: 4 };
  function xepCanh(ds) { return ds.slice().sort(function (a, b) { return (THU_TU[a.muc] - THU_TU[b.muc]) || (new Date(b.luc) - new Date(a.luc)); }); }
  function canhBaoHtml(c) {
    var M = { critical: ['crit', '!', 'Nghiêm trọng'], serious: ['serious', '!', 'Cần xử lý'], warning: ['warning', '!', 'Lưu ý'], nhac: ['nhac', '⏰', 'Nhắc việc'], info: ['info', 'i', 'Theo dõi'] }[c.muc] || ['info', 'i', ''];
    var k = tenKhoi(c.khoi);
    return '<div class="al' + (c.xong ? ' xong' : '') + '"><span class="ic ' + M[0] + '" aria-hidden="true">' + M[1] + '</span><div><div class="lb">' + M[2] + ' · ' + esc(k ? k.ngan : '') + ' · ' + E.gioChu(new Date(c.luc)) + (c.xong ? ' · đã xử lý' : '') + '</div><div class="t">' + esc(c.text) + '</div>' + (c.goiY ? '<div class="g">' + esc(c.goiY) + '</div>' : '') + '</div></div>';
  }

  // ── Màn: Trung tâm vận hành ──────────────────────────────────────────────
  function mVanHanh(S, p) {
    var h = '<div class="grid" style="grid-template-columns:minmax(0,.9fr) minmax(0,2fr) minmax(0,1.15fr)">';
    var k = '<div class="feed">';
    D.KHOI.forEach(function (x) {
      var hd = S.nhatKy.filter(function (e) { return e.khoi === x.id; }).length, cho = S.viec.filter(function (v) { return v.tt === 'cho' && v.khoi === x.id; }).length;
      var song = S.noiBat === x.id && S.chay;
      k += '<a href="#khoi/' + x.id + '" class="ev" style="text-decoration:none' + (song ? ';background:var(--copper-soft);border-radius:10px;padding-left:8px' : '') + '"><span class="av sm" style="background:var(--brand)">' + ic(IC.k[x.id], 14) + '</span><div><div class="t" style="font-weight:600">' + esc(x.ngan) + '</div><div class="m">' + hd + ' hoạt động' + (cho ? ' · <span class="tt warn"><i></i>' + cho + ' chờ duyệt</span>' : '') + '</div></div></a>';
    });
    k += '</div>';
    h += the('8 khối nghiệp vụ', 'Khối đang có hoạt động sáng lên khi chạy giả lập', k);
    var ds = S.nhatKy.filter(function (e) { return locFeed === 'tat' || (locFeed === 'ai' && e.ai) || (locFeed === 'ng' && e.nguoi) || (locFeed === 'cho' && e.cho); });
    var f = '<div class="filters" style="margin:0 0 6px"><div class="seg">' + [['tat', 'Tất cả'], ['ai', 'AI làm'], ['ng', 'Người làm'], ['cho', 'Chờ duyệt']].map(function (x) { return '<button aria-pressed="' + (locFeed === x[0]) + '" data-loc="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div></div>';
    f += '<div class="feed">' + (ds.slice(0, 40).map(function (e, i) { return suKien(e, S, e.id > nkCu && i < 3); }).join('') || '<div class="empty">Chưa có hoạt động.</div>') + '</div>';
    h += the('Dòng hoạt động trực tiếp', 'Ai làm, ở mức AI nào, việc nào đang chờ người', f);
    var cb = S.canhBao.filter(function (c) { return !c.xong; });
    var g = '<div class="kpis" style="grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">' +
      '<div class="kpi" style="padding:12px"><div class="l">AI tự làm hôm nay</div><div class="v">' + S.homNay.aiTu + '</div></div>' +
      '<div class="kpi" style="padding:12px"><div class="l">Người duyệt / làm</div><div class="v">' + (S.homNay.aiSoan + S.homNay.nguoi) + '</div></div></div>';
    g += '<div class="sub" style="margin:0 0 4px">Tiết kiệm ước tính hôm nay: <b style="color:var(--ink)">' + Math.round(S.homNay.phutTietKiem) + ' phút công</b></div>';
    g += xepCanh(cb).slice(0, 5).map(canhBaoHtml).join('') || '<div class="empty">Không có gì bất thường.</div>';
    g += '<a class="btn sm" href="#giam-sat" style="margin-top:8px">Mở AI Giám sát</a>';
    h += the(ic(IC.eye, 16) + ' AI Giám sát', 'Theo dõi toàn hệ thống', g);
    h += '</div>';
    p.innerHTML = h;
  }

  // ── Màn: Việc của tôi ────────────────────────────────────────────────────
  function mViec(S, p) {
    var n = E.nguoi(vai), cua = S.viec.filter(function (v) { return v.nguoiDuyet === vai; }), cho = cua.filter(function (v) { return v.tt === 'cho'; }), xong = cua.filter(function (v) { return v.tt !== 'cho'; });
    var khac = S.viec.filter(function (v) { return v.tt === 'cho' && v.nguoiDuyet !== vai; });
    var h = '<div class="grid g-21"><div>';
    h += the('Chờ ' + esc(n.ten) + ' xử lý', esc(n.vt) + ' · AI đã chuẩn bị sẵn, anh/chị chỉ cần quyết', cho.length ? cho.map(function (v) { return viecHtml(v, true); }).join('') : '<div class="empty">Không có việc nào chờ. Chạy một tình huống ở thanh dưới để thấy việc đổ về.</div>', '', 'mb');
    h += the('Đã xử lý', '', xong.length ? xong.slice(0, 10).map(function (v) { return viecHtml(v, false); }).join('') : '<div class="empty">Chưa có.</div>');
    h += '</div><div>';
    h += the('Việc đang chờ người khác', 'Chuyển vai để xử lý thay', khac.length ? khac.map(function (v) { var q = E.nguoi(v.nguoiDuyet); return '<div class="task"><div><h4>' + esc(v.tieuDe) + '</h4><div class="m"><span class="av sm">' + viTat(q.ten) + '</span>' + esc(q.ten) + ' · ' + esc(q.vt) + '</div></div><button class="btn sm" data-vai="' + q.id + '">Xem với vai này</button></div>'; }).join('') : '<div class="empty">Không có.</div>');
    h += '</div></div>';
    p.innerHTML = h;
  }
  function viecHtml(v, conCho) {
    var k = tenKhoi(v.khoi), gio = Math.max(0, Math.round((E.S().gio - new Date(v.tao)) / 3600e3));
    var h = '<div class="task"><div><h4>' + esc(v.tieuDe) + '</h4>' + (v.chiTiet ? '<p>' + esc(v.chiTiet) + '</p>' : '') + '<div class="m">';
    h += v.agent ? '<span class="chip ai">Soạn bởi ' + esc(E.agent(v.agent).ten) + '</span>' : v.nguoiLam ? '<span class="chip ng">Người làm</span>' : '';
    h += '<span>' + esc(k ? k.ngan : '') + '</span>' + (v.giaTri ? '<span class="num">' + tr(v.giaTri) + '</span>' : '') + '<span>' + (conCho ? 'chờ ' + (gio ? gio + ' giờ' : 'vừa xong') : (v.tt === 'duyet' ? '✓ Đã duyệt' : '✕ Từ chối')) + '</span></div></div>';
    if (conCho) h += '<div class="acts"><button class="btn sm pri" data-duyet="' + v.id + '">' + (v.nguoiLam ? 'Đã xử lý xong' : 'Duyệt') + '</button>' + (v.nguoiLam ? '' : '<button class="btn sm" data-tuchoi="' + v.id + '">Từ chối</button>') + '</div>';
    return h + '</div>';
  }

  // ── Màn: AI Giám sát ─────────────────────────────────────────────────────
  function mGiamSat(S, p) {
    var mo = S.canhBao.filter(function (c) { return !c.xong; }), xong = S.canhBao.filter(function (c) { return c.xong; });
    var dem = function (m) { return mo.filter(function (c) { return c.muc === m; }).length; };
    var h = '<div class="kpis">' + oSo('<span class="tt crit"><i></i>Nghiêm trọng</span>', dem('critical'), 'cần quyết trong ngày') + oSo('<span class="tt serious"><i></i>Cần xử lý</span>', dem('serious') + dem('warning'), 'bất cập vận hành') +
      oSo('<span class="tt info"><i></i>Nhắc việc</span>', dem('nhac'), 'việc chờ người quá lâu') + oSo('Báo cáo đã gửi', S.baoCao.length, 'định kỳ 07:30 và theo yêu cầu') + '</div>';
    h += '<div class="grid g-21"><div>';
    h += the('Bất cập & nhắc việc đang mở', 'AI Giám sát quét sau mỗi hoạt động: tồn kho, công nợ, giao hàng, việc tồn, dòng tiền', mo.length ? xepCanh(mo).map(canhBaoHtml).join('') : '<div class="empty">Không có gì bất thường.</div>', '', 'mb');
    if (xong.length) h += the('Đã xử lý', '', xong.slice(0, 8).map(canhBaoHtml).join(''));
    h += '</div><div>';
    var hoi = '<div class="qa">' + E.HOI.map(function (q, i) { return '<button data-hoi="' + i + '">' + esc(q) + '</button>'; }).join('') + '</div>';
    if (hoiDap) hoi += '<div class="tl"><div class="q">' + esc(hoiDap.q) + '</div>' + esc(hoiDap.a) + '</div>';
    h += the('Hỏi AI Giám sát', 'Trả lời từ số liệu đang chạy', hoi, '', 'mb');
    h += the('Báo cáo', '<button class="btn sm" id="taoBC">Tạo báo cáo ngay</button>', S.baoCao.slice(0, 5).map(function (b) { return '<div class="bc"><h4>' + esc(b.tieuDe) + '</h4><small>' + E.gioChu(new Date(b.luc)) + ' · gửi Giám đốc và trưởng bộ phận</small><ul>' + b.dong.map(function (d) { return '<li>' + esc(d) + '</li>'; }).join('') + '</ul></div>'; }).join(''));
    h += '</div></div>';
    p.innerHTML = h;
  }

  // ── Màn: Khối nghiệp vụ ──────────────────────────────────────────────────
  function mKhoi(S, p, id) {
    var k = tenKhoi(id); if (!k) { p.innerHTML = '<div class="empty">Không có khối này.</div>'; return; }
    var ng = D.NGUOI.filter(function (n) { return n.khoi === id; }), ag = D.AGENT.filter(function (a) { return a.khoi === id; }), nv = D.NGHIEP_VU.filter(function (v) { return v.khoi === id; });
    var h = '<div class="grid g-12 mb">';
    var to = '<div class="nhom-ng">' + ng.map(function (n) { return '<div class="p"><span class="av sm">' + viTat(n.ten) + '</span><span>' + esc(n.ten) + '<small>' + esc(n.vt) + '</small></span></div>'; }).join('') +
      ag.map(function (a) { return '<div class="p"><span class="av ai sm">AI</span><span>' + esc(a.ten) + '<small>' + esc(a.viec) + '</small></span></div>'; }).join('') + '</div>';
    h += the('Người & AI trong khối', esc(k.tang), to);
    var nvH = nv.length ? '<div class="feed">' + nv.map(function (v) { var c = E.nv(v.id), dd = E.nguoi(c.duyet); return '<div class="ev" style="grid-template-columns:1fr auto"><div><div class="t" style="font-weight:600">' + esc(v.ten) + '</div><div class="m">' + esc(E.agent(v.agent).ten) + ' · ngưỡng ' + esc(E.nguongChu(c)) + ' · người duyệt ' + esc(dd.ten) + '</div></div><span class="chip lv ai" title="' + esc(D.MUC[c.muc].mo) + '">L' + c.muc + ' · ' + esc(D.MUC[c.muc].ten) + '</span></div>'; }).join('') + '</div><a class="btn sm" href="#thiet-lap" style="margin-top:10px">Đổi mức AI</a>' : '<div class="empty">Khối điều hành dùng số liệu tổng hợp từ mọi khối — xem Tổng quan và AI Giám sát.</div>';
    h += the('Nghiệp vụ & mức AI hiện hành', 'Đổi mức ở Thiết lập rồi chạy lại tình huống', nvH) + '</div>';
    h += (KHOI_V[id] || function () { return ''; })(S);
    var nk = S.nhatKy.filter(function (e) { return e.khoi === id; });
    h += the('Hoạt động của khối', '', '<div class="feed">' + (nk.slice(0, 15).map(function (e) { return suKien(e, S); }).join('') || '<div class="empty">Chưa có hoạt động trong khối này hôm nay. Chạy tình huống có khối ' + esc(k.ngan) + '.</div>') + '</div>');
    p.innerHTML = h;
    if (KHOI_SAU[id]) KHOI_SAU[id](S);
  }

  var KHOI_V = {
    kd: function (S) {
      var hn = S.homNay, don = S.don.slice(0, 14), b7 = S.ngay.slice(-7);
      var h = '<div class="kpis">' + oSo('Doanh thu hôm nay', tr(hn.dt), hn.don + ' đơn mới') + oSo('7 ngày', tr(sum(b7, 'dt')), sum(b7, 'don') + ' đơn', b7.map(function (x) { return x.dt; })) +
        oSo('Khách đang mua', S.kh.length, D.KENH.length + ' kênh') + oSo('Đơn AI tự xác nhận', pct(sum(b7, 'aiTu') / sum(b7, 'don'), 0), 'trong 7 ngày') + '</div>';
      h += '<div class="grid g-21 mb">' + the('Đơn hàng mới nhất', '', '<div class="tbl-w"><table class="tbl"><thead><tr><th>Mã</th><th>Lúc</th><th>Khách</th><th>Kênh</th><th class="r">Giá trị</th><th>Xử lý</th><th>Trạng thái</th></tr></thead><tbody>' +
        don.map(function (d, i) { var k = E.kh(d.kh); return '<tr' + (i < 2 && d.tt === 'moi' ? ' class="moi"' : '') + '><td class="ma">' + d.ma + '</td><td class="num">' + new Date(d.luc).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) + '</td><td>' + esc(k ? k.ten : d.kh) + '</td><td>' + esc(tenKenh(d.kenh)) + '</td><td class="r">' + tr(d.gt) + '</td><td>' + xuLyChu(d.xuLy) + '</td><td>' + trangThaiChu(d.tt) + '</td></tr>'; }).join('') + '</tbody></table></div>') +
        the('Doanh thu 7 ngày theo kênh', '', '<div id="kKenh"></div>') + '</div>';
      return h;
    },
    kv: function (S) {
      var tonGT = sum(S.sp, function (p) { return (p.ton.BD + p.ton.HN) * p.gv; }), duoi = S.sp.filter(function (p) { return p.ton.BD + p.ton.HN < p.rop; }).length, b7 = S.ngay.slice(-7);
      var h = '<div class="kpis">' + oSo('Giá trị tồn kho', ty(tonGT), S.sp.length + ' mã · 2 kho') + oSo('Mã dưới điểm đặt hàng', duoi, duoi ? '<span class="tt serious"><i></i>Cần bổ sung</span>' : 'Ổn') +
        oSo('Giao đúng hẹn 7 ngày', pct(1 - sum(b7, 'tre') / sum(b7, 'don')), 'mục tiêu ≥ 95%', b7.map(function (x) { return 1 - x.tre / x.don; })) + oSo('Đơn đang giao', S.don.filter(function (d) { return d.tt === 'dang-giao' || d.tt === 'giao-mot-phan'; }).length, 'cập nhật theo giả lập') + '</div>';
      h += '<div class="grid g-21 mb">' + the('Tồn kho theo mã', 'Bình Dương + Hà Nội', bangTon(S)) + the('Số ngày bán còn lại', '8 mã thấp nhất', '<div id="kTon"></div>') + '</div>';
      return h;
    },
    hd: function (S) {
      var ds = S.sp.map(function (p) { var t = p.ton.BD + p.ton.HN; return { p: p, t: t, ngay: t / p.banNgay, de: Math.max(0, Math.round(p.banNgay * 42 - t)) }; }).sort(function (a, b) { return a.ngay - b.ngay; });
      var h = '<div class="kpis">' + oSo('Mã cần bổ sung', ds.filter(function (x) { return x.t < x.p.rop; }).length, 'dưới điểm đặt hàng') + oSo('Đề xuất đặt thêm', tr(sum(ds.filter(function (x) { return x.t < x.p.rop; }), function (x) { return x.de * x.p.gv; })), 'đủ 35 ngày + 7 ngày an toàn') +
        oSo('Dự báo nhu cầu 30 ngày', tr(sum(S.sp, function (p) { return p.banNgay * 30 * p.gb; })), 'theo giá sỉ') + '</div>';
      h += '<div class="grid g-21 mb">' + the('Dự báo & đề xuất bổ sung', 'Agent Hoạch định cập nhật mỗi sáng 06:00', '<div class="tbl-w"><table class="tbl"><thead><tr><th>Mặt hàng</th><th class="r">Tồn</th><th class="r">Bán/ngày</th><th class="r">Còn (ngày)</th><th class="r">Điểm đặt hàng</th><th class="r">Đề xuất</th><th>Trạng thái</th></tr></thead><tbody>' +
        ds.slice(0, 12).map(function (x) { return '<tr><td>' + esc(x.p.ten) + '</td><td class="r">' + x.t + '</td><td class="r">' + x.p.banNgay + '</td><td class="r">' + Math.floor(x.ngay) + '</td><td class="r">' + x.p.rop + '</td><td class="r">' + (x.t < x.p.rop ? x.de : '—') + '</td><td>' + (x.t < x.p.rop * 0.5 ? '<span class="tt crit"><i></i>Nguy cấp</span>' : x.t < x.p.rop ? '<span class="tt serious"><i></i>Đặt thêm</span>' : '<span class="tt ok"><i></i>Đủ</span>') + '</td></tr>'; }).join('') + '</tbody></table></div>') +
        the('Số ngày bán còn lại', '', '<div id="kTon"></div>') + '</div>';
      return h;
    },
    nh: function (S) {
      var mo = S.po.filter(function (p) { return p.tt !== 'da-nhan'; });
      var h = '<div class="kpis">' + oSo('Đơn mua đang mở', mo.length, tr(sum(mo, 'gt'))) + oSo('Phải trả nhà cung cấp', tr(sum(Object.keys(S.congNoNcc), function (k) { return S.congNoNcc[k]; })), D.NCC.length + ' nhà cung cấp') +
        oSo('Biên lãi gộp 30 ngày', pct(sum(S.ngay.slice(-30), 'lg') / sum(S.ngay.slice(-30), 'dt')), 'mục tiêu ≥ 24%', S.ngay.slice(-30).map(function (x) { return x.lg / x.dt; })) + '</div>';
      h += '<div class="grid g2 mb">' + the('Đơn mua hàng (PO)', '', '<div class="tbl-w"><table class="tbl"><thead><tr><th>Mã</th><th>Nhà cung cấp</th><th>Hàng</th><th class="r">Giá trị</th><th>Dự kiến</th><th>Trạng thái</th></tr></thead><tbody>' +
        S.po.map(function (o) { return '<tr><td class="ma">' + o.ma + '</td><td>' + esc(D.NCC.find(function (n) { return n.id === o.ncc; }).ten) + '</td><td>' + esc(o.dong) + '</td><td class="r">' + tr(o.gt) + '</td><td class="num">' + ngayVN(o.duKien) + '</td><td>' + trangThaiChu(o.tt) + '</td></tr>'; }).join('') + '</tbody></table></div>') +
        the('Nhà cung cấp', 'Thời gian giao, tỉ lệ lỗi 90 ngày, công nợ', '<div class="tbl-w"><table class="tbl"><thead><tr><th>Nhà cung cấp</th><th class="r">Giao (ngày)</th><th class="r">Lỗi</th><th class="r">Phải trả</th></tr></thead><tbody>' +
        D.NCC.map(function (n) { return '<tr><td>' + esc(n.ten) + '<br><small style="color:var(--muted)">' + esc(n.noi) + '</small></td><td class="r">' + n.giaoNgay + '</td><td class="r">' + (n.loi > 1.5 ? '<span class="tt serious"><i></i>' : '') + n.loi.toLocaleString('vi-VN') + '%' + (n.loi > 1.5 ? '</span>' : '') + '</td><td class="r">' + tr(S.congNoNcc[n.id]) + '</td></tr>'; }).join('') + '</tbody></table></div>') + '</div>';
      return h;
    },
    ht: function (S) {
      var phaiThu = sum(S.kh, 'congNo'), qh = S.kh.filter(function (k) { return k.quaHan > 0; }).sort(function (a, b) { return b.soNgayQH - a.soNgayQH; });
      var h = '<div class="kpis">' + oSo('Tiền mặt', ty(S.tienMat), 'thu hôm nay ' + tr(S.homNay.thu), S.ngay.slice(-30).map(function (x) { return x.tienMat; })) + oSo('Phải thu', tr(phaiThu), '<span class="tt crit"><i></i>Quá hạn ' + tr(sum(qh, 'quaHan')) + '</span>') +
        oSo('Phải trả NCC', tr(sum(Object.keys(S.congNoNcc), function (k) { return S.congNoNcc[k]; })), 'trong hạn') + oSo('Hóa đơn tự xuất', '100%', 'Agent Tài chính · mức 4') + '</div>';
      h += '<div class="grid g2 mb">' + the('Tiền mặt 90 ngày', 'Số dư cuối ngày', '<div id="kTien"></div>') +
        the('Khách nợ quá hạn', 'Agent Tài chính nhắc tự động theo lịch', qh.length ? '<div class="tbl-w"><table class="tbl"><thead><tr><th>Khách</th><th class="r">Quá hạn</th><th class="r">Ngày</th><th class="r">Tổng nợ</th></tr></thead><tbody>' +
          qh.map(function (k) { return '<tr><td>' + esc(k.ten) + '</td><td class="r">' + tr(k.quaHan) + '</td><td class="r">' + (k.soNgayQH > 30 ? '<span class="tt crit"><i></i>' + k.soNgayQH + '</span>' : k.soNgayQH) + '</td><td class="r">' + tr(k.congNo) + '</td></tr>'; }).join('') + '</tbody></table></div>' : '<div class="empty">Không có.</div>') + '</div>';
      return h;
    },
    dv: function (S) {
      var b30 = S.ngay.slice(-30);
      var h = '<div class="kpis">' + oSo('Phiếu đang mở', S.phieu.filter(function (x) { return x.tt === 'dang-xu-ly'; }).length, 'cần người') + oSo('Khiếu nại 30 ngày', sum(b30, 'khieuNai'), pct(sum(b30, 'khieuNai') / sum(b30, 'don')) + ' số đơn', b30.map(function (x) { return x.khieuNai; })) +
        oSo('AI trả lời ngay', '87%', 'tin nhắn trong kho câu hỏi') + oSo('Thời gian phản hồi', '2 phút', 'trước tái cấu trúc: 3,5 giờ') + '</div>';
      h += '<div class="grid g2 mb">' + the('Phiếu chăm sóc khách hàng', '', '<div class="tbl-w"><table class="tbl"><thead><tr><th>Mã</th><th>Khách</th><th>Nội dung</th><th>Kênh</th><th>Trạng thái</th></tr></thead><tbody>' +
        S.phieu.map(function (x) { var k = E.kh(x.kh); return '<tr><td class="ma">' + x.ma + '</td><td>' + esc(k ? k.ten : x.kh) + '</td><td>' + esc(x.loai) + '</td><td>' + esc(x.kenh) + '</td><td>' + trangThaiChu(x.tt) + '</td></tr>'; }).join('') + '</tbody></table></div>') +
        the('Khiếu nại theo ngày', '30 ngày', '<div id="kKN"></div>') + '</div>';
      return h;
    },
    mk: function (S) {
      var b30 = S.ngay.slice(-30);
      var h = '<div class="kpis">' + oSo('Chi quảng cáo 30 ngày', tr(sum(b30, 'quangCao')), 'trần 2 tr/ngày') + oSo('Khách tiềm năng', sum(b30, 'lead').toLocaleString('vi-VN'), tr(sum(b30, 'quangCao') / sum(b30, 'lead') * 1e3 / 1e3) + ' / khách', b30.map(function (x) { return x.lead; })) +
        oSo('Chiến dịch đang chạy', S.chienDich.filter(function (c) { return c.tt === 'chay'; }).length, '') + '</div>';
      h += '<div class="grid g2 mb">' + the('Chiến dịch', '', '<div class="tbl-w"><table class="tbl"><thead><tr><th>Chiến dịch</th><th>Kênh</th><th class="r">Ngân sách</th><th class="r">Đơn</th><th class="r">Doanh thu</th><th>Trạng thái</th></tr></thead><tbody>' +
        S.chienDich.map(function (c) { return '<tr><td>' + esc(c.ten) + '</td><td>' + esc(c.kenh) + '</td><td class="r">' + tr(c.ngan) + (c.ngay ? '/ngày' : '') + '</td><td class="r">' + c.don + '</td><td class="r">' + tr(c.dt) + '</td><td>' + trangThaiChu(c.tt) + '</td></tr>'; }).join('') + '</tbody></table></div>') +
        the('Khách tiềm năng mỗi ngày', '30 ngày', '<div id="kLead"></div>') + '</div>';
      return h;
    },
    cl: function (S) {
      return '<div class="grid g2 mb">' + the('Bảng điều hành', 'Khối điều hành nhìn toàn công ty', '<p style="margin:0 0 12px;color:var(--ink-2)">Giám đốc không cần vào từng khối: Tổng quan gom số liệu của cả 8 khối, AI Giám sát chỉ ra chỗ lệch và việc tồn.</p><a class="btn pri" href="#tong-quan">Mở Tổng quan</a> <a class="btn" href="#giam-sat">AI Giám sát</a>') +
        the('Báo cáo gần nhất', '', S.baoCao.slice(0, 1).map(function (b) { return '<div class="bc"><h4>' + esc(b.tieuDe) + '</h4><small>' + E.gioChu(new Date(b.luc)) + '</small><ul>' + b.dong.map(function (d) { return '<li>' + esc(d) + '</li>'; }).join('') + '</ul></div>'; }).join('')) + '</div>';
    }
  };
  var KHOI_SAU = {
    kd: function (S) { var b7 = S.ngay.slice(-7); C.thanh($('#kKenh'), { muc: D.KENH.map(function (k) { return { ten: k.ten, gt: sum(b7, function (x) { return x.theoKenh[k.id]; }), mau: MAU_KENH[k.id] }; }), dinhDang: tr }); },
    kv: function (S) { veTon($('#kTon'), S, 8); },
    hd: function (S) { veTon($('#kTon'), S, 8); },
    ht: function (S) { var a = S.ngay; C.duong($('#kTien'), { nhan: a.map(function (x) { return ngayVN(x.ngay); }), nhanDai: a.map(function (x) { return THU[x.thu] + ' ' + ngayVN(x.ngay); }), chuoi: [{ ten: 'Tiền mặt', mau: 'var(--s1)', gt: a.map(function (x) { return x.tienMat; }) }], tuKhong: false, dinhDang: tien }); },
    dv: function (S) { var a = S.ngay.slice(-30); C.duong($('#kKN'), { nhan: a.map(function (x) { return ngayVN(x.ngay); }), chuoi: [{ ten: 'Khiếu nại', mau: 'var(--s2)', gt: a.map(function (x) { return x.khieuNai; }) }], dinhDang: function (v) { return Math.round(v) + ' phiếu'; }, dinhDangTruc: function (v) { return Math.round(v); }, cao: 200 }); },
    mk: function (S) { var a = S.ngay.slice(-30); C.duong($('#kLead'), { nhan: a.map(function (x) { return ngayVN(x.ngay); }), chuoi: [{ ten: 'Khách tiềm năng', mau: 'var(--s3)', gt: a.map(function (x) { return x.lead; }) }], dinhDang: function (v) { return Math.round(v) + ' khách'; }, dinhDangTruc: function (v) { return Math.round(v); }, cao: 200 }); }
  };
  function bangTon(S) {
    return '<div class="tbl-w"><table class="tbl"><thead><tr><th>Mã</th><th>Mặt hàng</th><th class="r">Bình Dương</th><th class="r">Hà Nội</th><th class="r">Điểm đặt hàng</th><th>Trạng thái</th></tr></thead><tbody>' +
      S.sp.map(function (p) { var t = p.ton.BD + p.ton.HN; return '<tr><td class="ma">' + p.sku + '</td><td>' + esc(p.ten) + '</td><td class="r">' + p.ton.BD + '</td><td class="r">' + p.ton.HN + '</td><td class="r">' + p.rop + '</td><td>' + (t < p.rop * 0.5 ? '<span class="tt crit"><i></i>Nguy cấp</span>' : t < p.rop ? '<span class="tt serious"><i></i>Dưới ĐĐH</span>' : '<span class="tt ok"><i></i>Đủ</span>') + '</td></tr>'; }).join('') + '</tbody></table></div>';
  }

  // ── Màn: Thiết lập mức AI ───────────────────────────────────────────────
  function mThietLap(S, p) {
    var h = the('Thang mức tự chủ của AI', 'Mỗi nghiệp vụ chọn một mức. Mức càng cao, AI tự làm càng nhiều; vượt ngưỡng luôn dừng chờ người.', '<div class="thang">' + D.MUC.map(function (m) { return '<div><b><span>L' + m.m + '</span> · ' + esc(m.ten) + '</b>' + esc(m.mo) + '</div>'; }).join('') + '</div>', '', 'mb');
    var bang = '<div class="lv-row h"><span>Nghiệp vụ</span><span>Mức AI</span><span>Ngưỡng tự làm</span><span>Người duyệt</span><span>Khi chạy sẽ ra sao</span></div>';
    D.KHOI.forEach(function (k) {
      var ds = D.NGHIEP_VU.filter(function (v) { return v.khoi === k.id; }); if (!ds.length) return;
      bang += '<div style="padding:16px 0 4px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--brand)">' + esc(k.ten) + '</div>';
      ds.forEach(function (v) {
        var c = E.nv(v.id);
        bang += '<div class="lv-row"><div><b>' + esc(v.ten) + '</b><small>' + esc(E.agent(v.agent).ten) + '</small></div>';
        bang += '<div class="lv" role="group" aria-label="Mức AI cho ' + esc(v.ten) + '">' + D.MUC.map(function (m) { return '<button type="button" aria-pressed="' + (c.muc === m.m) + '" data-nv="' + v.id + '" data-muc="' + m.m + '" title="L' + m.m + ' · ' + esc(m.ten) + '">L' + m.m + '</button>'; }).join('') + '</div>';
        bang += '<div>' + (v.donVi ? '<input type="number" min="0" step="any" data-nguong="' + v.id + '" value="' + (/%|ngày|km/.test(v.donVi) ? c.nguong : c.nguong / 1e6) + '" aria-label="Ngưỡng"><small>' + esc(/%|ngày|km/.test(v.donVi) ? v.donVi : 'triệu đồng · ' + v.donVi) + '</small>' : '<small>Không áp ngưỡng</small>') + '</div>';
        bang += '<div><select data-duyet-nv="' + v.id + '" aria-label="Người duyệt">' + D.NGUOI.map(function (n) { return '<option value="' + n.id + '"' + (n.id === c.duyet ? ' selected' : '') + '>' + esc(n.ten) + ' · ' + esc(n.vt) + '</option>'; }).join('') + '</select></div>';
        bang += '<div class="vd">' + viDu(v, c) + '</div></div>';
      });
    });
    bang += '<div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap"><button class="btn" id="macDinh">Về mặc định</button><span class="lbl" style="color:var(--muted);font-size:12.5px;align-self:center">Thay đổi lưu ngay trên trình duyệt này. Chạy lại một tình huống để thấy khác biệt.</span></div>';
    p.innerHTML = h + the('Mức AI theo từng nghiệp vụ', '15 nghiệp vụ trên 7 khối', bang);
  }
  function viDu(v, c) {
    var n = E.nguoi(c.duyet), t = E.ten1(c.duyet);
    if (c.muc >= 4) return '<span class="chip ai">AI tự làm</span> mọi trường hợp; ' + esc(t) + ' xem lại định kỳ.';
    if (c.muc === 3 && !c.nguong) return '<span class="chip ai">AI tự làm</span> theo luật của nghiệp vụ; ngoại lệ chuyển ' + esc(t) + '.';
    if (c.muc === 3) return '<span class="chip ai">AI tự làm</span> trong ngưỡng ' + esc(E.nguongChu(c)) + '; vượt ngưỡng thì chờ ' + esc(t) + '.';
    if (c.muc === 2) return '<span class="chip ai">AI soạn</span> → ' + esc(t) + ' duyệt mọi lần.';
    if (c.muc === 1) return '<span class="chip ng">Người làm</span>, AI chỉ đề xuất phương án cho ' + esc(t) + '.';
    return '<span class="chip ng">Người làm</span> toàn bộ; AI chỉ ghi nhận số liệu.';
  }

  // ── Màn: Người & AI ──────────────────────────────────────────────────────
  function mSoDo(S, p) {
    var h = '<div class="kpis">' + oSo('Nhân sự', D.NGUOI.length, 'người') + oSo('AI agent', D.AGENT.length, '7 agent nghiệp vụ + 1 giám sát') + oSo('Nghiệp vụ được giao AI', D.NGHIEP_VU.length, 'mỗi nghiệp vụ có một người chịu trách nhiệm') + '</div>';
    h += '<div class="org">' + D.KHOI.map(function (k) {
      var ng = D.NGUOI.filter(function (n) { return n.khoi === k.id; }), ag = D.AGENT.filter(function (a) { return a.khoi === k.id; });
      return '<a class="card" href="#khoi/' + k.id + '" style="text-decoration:none"><div class="tang">' + esc(k.tang) + '</div><h4>' + esc(k.ten) + '</h4><div class="ppl">' +
        ng.map(function (n) { return '<div class="p"><span class="av sm">' + viTat(n.ten) + '</span><span>' + esc(n.ten) + '<small>' + esc(n.vt) + '</small></span></div>'; }).join('') +
        ag.map(function (a) { return '<div class="p"><span class="av ai sm">AI</span><span>' + esc(a.ten) + '<small>chịu trách nhiệm: ' + esc(E.nguoi(a.chu).ten) + '</small></span></div>'; }).join('') + '</div></a>';
    }).join('') + '</div>';
    p.innerHTML = h;
  }

  // ── Vẽ ───────────────────────────────────────────────────────────────────
  var lanCuoi = 0, henVe = 0;
  function veTat(ngay) {
    var S = E.S();
    veSide(S); veTop(S); veDock(S);
    var t = trang(), p = $('#page');
    if (t === 'thiet-lap' && !ngay && p.dataset.t === 'thiet-lap') { nkCu = S.nhatKy.length ? S.nhatKy[0].id : 0; return; }
    p.dataset.t = t;
    C.dongTip();
    if (t === 'tong-quan') mTongQuan(S, p);
    else if (t === 'van-hanh') mVanHanh(S, p);
    else if (t === 'viec') mViec(S, p);
    else if (t === 'giam-sat') mGiamSat(S, p);
    else if (t === 'thiet-lap') mThietLap(S, p);
    else if (t === 'so-do') mSoDo(S, p);
    else if (t.indexOf('khoi/') === 0) mKhoi(S, p, t.slice(5));
    else mTongQuan(S, p);
    nkCu = S.nhatKy.length ? S.nhatKy[0].id : 0;
    lanCuoi = Date.now();
  }
  // Giới hạn vẽ lại ~3 lần/giây để biểu đồ không giật khi giả lập chạy nhanh.
  E.nghe(function () {
    if (henVe) return;
    var cho = Math.max(0, 320 - (Date.now() - lanCuoi));
    henVe = setTimeout(function () { henVe = 0; veTat(); }, cho);
  });
  var rs = 0;
  addEventListener('resize', function () { clearTimeout(rs); rs = setTimeout(function () { veTat(true); }, 200); });

  // ── Sự kiện ──────────────────────────────────────────────────────────────
  function doiVai(id) {
    vai = id; moVai = false;
    try { localStorage.setItem('abz-vai', id); } catch (e) {}
    var v = VAI.find(function (x) { return x.id === id; });
    var t = trang();
    if (t !== 'viec' && t !== 'van-hanh') location.hash = '#' + v.nha; else veTat(true);
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('button, [data-vai]');
    if (!b) { if (moVai && !e.target.closest('.vai')) { moVai = false; veTat(); } return; }
    var d = b.dataset;
    if (b.id === 'nutVai') { moVai = !moVai; veTat(); return; }
    if (d.vai) { doiVai(d.vai); return; }
    if (b.id === 'nutNen') {
      var r = document.documentElement, toi = r.getAttribute('data-theme') === 'dark' || (!r.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
      r.setAttribute('data-theme', toi ? 'light' : 'dark'); try { localStorage.setItem('abz-theme', toi ? 'light' : 'dark'); } catch (er) {}
      veTat(true); return;
    }
    if (d.khoang) { khoang = +d.khoang; veTat(true); return; }
    if (d.loc) { locFeed = d.loc; veTat(true); return; }
    if (d.duyet) { E.duyet(d.duyet, true); return; }
    if (d.tuchoi) { E.duyet(d.tuchoi, false, 'cần xem lại'); return; }
    if (d.hoi) { var q = E.HOI[+d.hoi]; hoiDap = { q: q, a: E.hoi(q) }; veTat(true); return; }
    if (b.id === 'taoBC') { E.taoBaoCao(); return; }
    if (d.nv && d.muc) { E.S().cfg[d.nv].muc = +d.muc; E.luuCfg(); veTat(true); return; }
    if (b.id === 'macDinh') { E.macDinhCfg(); veTat(true); return; }
    if (b.id === 'dChay') { chonKB = $('#chonKB').value; E.chayKichBan(chonKB); var kb = E.KICH_BAN.find(function (k) { return k.id === chonKB; }); if (trang() !== 'van-hanh' && kb) location.hash = '#van-hanh'; return; }
    if (b.id === 'dMo') { dockMo = !dockMo; veTat(); return; }
    if (b.id === 'dDung') { E.tamDung(); return; }
    if (b.id === 'dTiepTuc') { E.tiepTuc(); return; }
    if (b.id === 'dTiep') { E.tiep(); return; }
    if (b.id === 'dStop') { E.dungKichBan(); return; }
    if (b.id === 'dReset') { if (confirm('Đặt lại toàn bộ dữ liệu demo về sáng 03/11? (Mức AI đã chỉnh vẫn giữ.)')) E.datLai(); return; }
    if (d.che) { E.cheDo(d.che); return; }
    if (d.toc) { E.tocDo(+d.toc); return; }
  });
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t.id === 'chonKB') { chonKB = t.value; if (!E.S().chay) { E.dungKichBan(); } veTat(); return; }
    if (t.dataset.nguong) { var v = D.NGHIEP_VU.find(function (x) { return x.id === t.dataset.nguong; }); E.S().cfg[v.id].nguong = /%|ngày|km/.test(v.donVi) ? +t.value : +t.value * 1e6; E.luuCfg(); veTat(true); return; }
    if (t.dataset.duyetNv) { E.S().cfg[t.dataset.duyetNv].duyet = t.value; E.luuCfg(); veTat(true); return; }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && moVai) { moVai = false; veTat(); }
    if (e.target.closest('input, select, textarea')) return;
    if (e.key === ' ' && E.S().cheDo === 'trinh' && E.S().kichBan) { e.preventDefault(); E.tiep(); }
  });

  // Thanh đầu: giữ nguyên thẻ <header> (nút ← ✕ chung của site gắn vào đây), chỉ vẽ lại phần trong.
  var top = $('#top'), trong = document.createElement('div');
  trong.id = 'topIn'; trong.style.cssText = 'display:flex;align-items:center;gap:14px;flex:1;min-width:0;flex-wrap:wrap';
  top.appendChild(trong);
  veTat(true);
})();
