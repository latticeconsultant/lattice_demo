/* ABZ Corporation — bộ máy giả lập.
   Một trạng thái chung (S) cho mọi màn hình: đơn, tồn kho, công nợ, tiền, việc chờ duyệt, cảnh báo.
   Tình huống là các hàm async chạy từng bước; mỗi bước đổi số liệu thật trong S, nên dashboard,
   bảng khối nghiệp vụ và AI Giám sát luôn khớp nhau.
   Mức AI của từng nghiệp vụ (Thiết lập) quyết định bước đó do AI tự làm, AI soạn chờ người duyệt,
   hay người làm. */
(function () {
  'use strict';
  var D = window.ABZ.DATA;
  var E = {};
  var S = null;
  var nghe = [];
  var KHOA_CFG = 'abz-cfg-v1';

  var sao = function (o) { return JSON.parse(JSON.stringify(o)); };
  var tr = function (v) { return (v / 1e6).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + ' tr'; };
  E.tr = tr;
  var nguoi = function (id) { return D.NGUOI.find(function (n) { return n.id === id; }); };
  var agent = function (id) { return D.AGENT.find(function (a) { return a.id === id; }); };
  var ten1 = function (id) { var n = nguoi(id); if (!n) return id; var p = n.ten.split(' '); return p[p.length - 1]; };
  E.nguoi = nguoi; E.agent = agent; E.ten1 = ten1;

  // ── Cấu hình mức AI (lưu trên trình duyệt người xem) ──────────────────────
  function napCfg() {
    var goc = {};
    D.NGHIEP_VU.forEach(function (v) { goc[v.id] = { muc: v.muc, nguong: v.nguong, duyet: v.duyet }; });
    try {
      var luu = JSON.parse(localStorage.getItem(KHOA_CFG) || 'null');
      if (luu) Object.keys(luu).forEach(function (k) { if (goc[k]) Object.assign(goc[k], luu[k]); });
    } catch (e) { /* không có localStorage: dùng mặc định */ }
    return goc;
  }
  E.luuCfg = function () { try { localStorage.setItem(KHOA_CFG, JSON.stringify(S.cfg)); } catch (e) {} bao(); };
  E.macDinhCfg = function () { try { localStorage.removeItem(KHOA_CFG); } catch (e) {} S.cfg = napCfg(); bao(); };
  E.nv = function (id) { var v = D.NGHIEP_VU.find(function (x) { return x.id === id; }); return Object.assign({}, v, S.cfg[id]); };

  // ── Trạng thái ─────────────────────────────────────────────────────────────
  function moi() {
    var gio = new Date(D.HOM_NAY);
    S = {
      gio: gio, sp: sao(D.SP), kh: sao(D.KH), po: sao(D.PO), don: sao(D.DON), phieu: sao(D.PHIEU),
      chienDich: sao(D.CHIEN_DICH), congNoNcc: sao(D.CONG_NO_NCC), ngay: D.NGAY,
      homNay: { dt: 0, lg: 0, don: 0, tre: 0, thu: 0, chi: 0, aiTu: 0, aiSoan: 0, nguoi: 0, phutTietKiem: 0, khieuNai: 0 },
      tienMat: D.NGAY[D.NGAY.length - 1].tienMat,
      nhatKy: [], viec: [], canhBao: [], baoCao: [], soDon: D.soDon + 40, soPO: 1195, soViec: 0, soPhieu: 590,
      cfg: napCfg(), kichBan: null, buoc: null, chay: false, cheDo: 'tu', tocDo: 1, dangCho: null,
      noiBat: null
    };
    // Việc tồn đọng từ hôm qua — để màn Việc của tôi và AI Giám sát có cái để nhắc.
    taoViec({ nv: 'bao-gia', tieuDe: 'Chiết khấu 7% cho Chuỗi Hàng Gia Đình (đơn 64 tr)', chiTiet: 'Agent Bán hàng soạn báo giá; chiết khấu vượt ngưỡng 5% nên cần Trưởng KD duyệt.',
      giaTri: 64e6, nguoiDuyet: 'kd', tao: new Date(gio.getTime() - 26 * 3600e3), khoi: 'kd' });
    taoViec({ nv: 'doi-tra', tieuDe: 'Bồi hoàn 2 thùng giao thiếu cho Chuỗi Mart 24h', chiTiet: 'Phiếu CS-589. Kho xác nhận xuất thiếu do nhầm mã thùng.',
      giaTri: 3.2e6, nguoiDuyet: 'cs', tao: new Date(gio.getTime() - 15 * 3600e3), khoi: 'dv' });
    ghi({ ai: 'A-GS', khoi: 'cl', text: 'Đã gửi Báo cáo sáng cho Giám đốc (07:30): doanh thu hôm qua, tiền, công nợ, 3 việc cần chú ý.', luc: new Date(gio.getTime() - 30 * 60e3), loai: 'bao-cao' });
    ghi({ ai: 'A-TC', khoi: 'ht', text: 'Khớp 14 khoản tiền về qua đêm với hóa đơn (212,4 tr). Không có khoản lệch.', luc: new Date(gio.getTime() - 52 * 60e3), muc: 4 });
    ghi({ ai: 'A-CS', khoi: 'dv', text: 'Trả lời 9 tin Zalo ngoài giờ theo kho câu hỏi; 1 tin chuyển chị Hà (đổi hàng).', luc: new Date(gio.getTime() - 70 * 60e3), muc: 3 });
    giamSat(true);
    taoBaoCao('sang', new Date(gio.getTime() - 30 * 60e3));
  }

  // ── Đăng ký vẽ lại ────────────────────────────────────────────────────────
  var hen = 0;
  function bao() { if (hen) return; hen = requestAnimationFrame(function () { hen = 0; nghe.forEach(function (f) { f(S); }); }); }
  E.nghe = function (f) { nghe.push(f); };
  E.S = function () { return S; };

  // ── Nhật ký hoạt động ─────────────────────────────────────────────────────
  // {ai | nguoi, khoi, text, muc, cho (đang chờ duyệt), loai}
  function ghi(o) {
    var x = Object.assign({ id: S.nhatKy.length + 1, luc: new Date(S.gio) }, o);
    S.nhatKy.unshift(x);
    if (S.nhatKy.length > 400) S.nhatKy.pop();
    S.noiBat = x.khoi;
    bao();
    return x;
  }
  E.ghi = ghi;

  // ── Việc chờ người duyệt ───────────────────────────────────────────────────
  var choDuyet = {};   // id → resolve
  function taoViec(o) {
    var v = Object.assign({ id: 'V' + (++S.soViec), tao: new Date(S.gio), tt: 'cho' }, o);
    S.viec.unshift(v);
    bao();
    return v;
  }
  E.duyet = function (id, dongY, ghiChu) {
    var v = S.viec.find(function (x) { return x.id === id; });
    if (!v || v.tt !== 'cho') return;
    v.tt = dongY ? 'duyet' : 'tu-choi';
    v.xong = new Date(S.gio);
    ghi({ nguoi: v.nguoiDuyet, khoi: v.khoi, text: (dongY ? 'Duyệt: ' : 'Từ chối: ') + v.tieuDe + (ghiChu ? ' — ' + ghiChu : ''), loai: dongY ? 'duyet' : 'tu-choi' });
    if (v.hanhDong) v.hanhDong(dongY);
    if (choDuyet[id]) { choDuyet[id](dongY); delete choDuyet[id]; }
    if (S.dangCho && S.dangCho.viec === id) S.dangCho = null;
    giamSat();
    bao();
  };

  // ── Bộ chạy tình huống ─────────────────────────────────────────────────────
  var luot = 0;            // đổi mỗi lần đặt lại → tình huống cũ tự dừng
  var moTiep = null;       // chế độ trình bày: bấm Tiếp để đi bước sau
  var moChay = null;       // tạm dừng
  function Dung() { this.dung = true; }

  function ngu(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  async function choChay(l) {
    while (!S.chay) { await new Promise(function (r) { moChay = r; }); if (l !== luot) throw new Dung(); }
    if (l !== luot) throw new Dung();
  }

  // Một bước: đặt lời dẫn, tua đồng hồ, chờ (tự chạy) hoặc chờ bấm Tiếp (trình bày).
  function taoNguCanh(l, kb) {
    var c = {};
    c.buoc = async function (loiDan, phut, khoi) {
      await choChay(l);
      S.buoc = { loiDan: loiDan, so: (S.buoc ? S.buoc.so : 0) + 1, tong: Math.max(kb.buoc, (S.buoc ? S.buoc.so : 0) + 1), khoi: khoi || null };
      if (khoi) S.noiBat = khoi;
      bao();
      if (S.cheDo === 'trinh') {
        await new Promise(function (r) { moTiep = r; });
        moTiep = null;
      } else {
        var doc = Math.min(5200, 1400 + loiDan.length * 22);
        var den = Date.now() + doc / S.tocDo;
        while (Date.now() < den) { await ngu(120); await choChay(l); }
      }
      if (l !== luot) throw new Dung();
      tuaGio(phut || 1);
    };
    // Chờ người duyệt. Tự chạy: người được mô phỏng duyệt sau ít phút. Trình bày: chờ bấm Duyệt.
    c.choDuyet = async function (v, phutNguoi) {
      S.dangCho = { viec: v.id, nguoi: v.nguoiDuyet };
      bao();
      var p = new Promise(function (r) { choDuyet[v.id] = r; });
      if (S.cheDo === 'tu') {
        var den = Date.now() + 2600 / S.tocDo;
        while (Date.now() < den && v.tt === 'cho') { await ngu(120); await choChay(l); }
        if (v.tt === 'cho') { tuaGio(phutNguoi || 6); E.duyet(v.id, true, 'trên điện thoại'); }
      }
      var kq = await p;
      if (l !== luot) throw new Dung();
      return kq;
    };
    // Xử lý một nghiệp vụ theo mức AI hiện hành. Trả về true nếu việc được làm.
    c.xuLy = async function (nvId, giaTri, o) {
      var nv = E.nv(nvId), a = agent(nv.agent), cd = cheDoXuLy(nv, giaTri);
      if (cd === 'ai') {
        S.homNay.aiTu++; S.homNay.phutTietKiem += o.phutNguoi || 15;
        ghi({ ai: nv.agent, khoi: nv.khoi, muc: nv.muc, text: o.viec, nv: nvId });
        if (o.lam) o.lam();
        giamSat();
        await c.buoc('Mức ' + nv.muc + ' · ' + D.MUC[nv.muc].ten + ': ' + a.ten + ' tự làm trong vòng 1 phút, không ai phải chạm vào (người làm mất khoảng ' + (o.phutNguoi || 15) + ' phút). ' + o.viec + '.', 1, nv.khoi);
        return true;
      }
      if (cd === 'ai-duyet') {
        S.homNay.aiSoan++; S.homNay.phutTietKiem += Math.round((o.phutNguoi || 15) * 0.7);
        var ly = nv.muc >= 3 ? ' (vượt ngưỡng ' + nguongChu(nv) + ')' : '';
        ghi({ ai: nv.agent, khoi: nv.khoi, muc: nv.muc, text: 'Đã soạn: ' + o.viec + ly + ' — chờ ' + nguoi(nv.duyet).vt + ' duyệt.', cho: true, nv: nvId });
        var v = taoViec({ nv: nvId, tieuDe: o.tieuDe || o.viec, chiTiet: o.chiTiet || '', giaTri: giaTri, nguoiDuyet: nv.duyet, khoi: nv.khoi, agent: nv.agent });
        await c.buoc('Mức ' + nv.muc + ' · ' + D.MUC[nv.muc].ten + ': ' + a.ten + ' đã chuẩn bị xong, nhưng ' + nguoi(nv.duyet).vt + ' (' + ten1(nv.duyet) + ') phải duyệt mới chạy.', 1, nv.khoi);
        var ok = await c.choDuyet(v, o.phutDuyet || 8);
        if (ok && o.lam) o.lam();
        return ok;
      }
      // Người làm (mức 1: AI gợi ý; mức 0: AI chỉ quan sát)
      S.homNay.nguoi++;
      if (nv.muc === 1) ghi({ ai: nv.agent, khoi: nv.khoi, muc: 1, text: 'Đề xuất: ' + o.viec + (o.deXuat ? ' — ' + o.deXuat : ''), nv: nvId });
      var v2 = taoViec({ nv: nvId, tieuDe: (nv.muc === 1 ? 'Quyết theo đề xuất: ' : 'Tự làm: ') + (o.tieuDe || o.viec), chiTiet: o.chiTiet || '', giaTri: giaTri, nguoiDuyet: nv.duyet, khoi: nv.khoi, nguoiLam: true });
      await c.buoc('Mức ' + nv.muc + ' · ' + D.MUC[nv.muc].ten + ': việc này do người làm. ' + (nv.muc === 1 ? a.ten + ' chỉ đưa đề xuất; ' : 'AI chỉ ghi nhận; ') + nguoi(nv.duyet).vt + ' tự xử lý, mất khoảng ' + (o.phutNguoi || 15) + ' phút.', 1, nv.khoi);
      var ok2 = await c.choDuyet(v2, o.phutNguoi || 15);
      if (ok2 && o.lam) o.lam();
      return ok2;
    };
    return c;
  }

  function cheDoXuLy(nv, giaTri) {
    if (nv.muc >= 4) return 'ai';
    if (nv.muc === 3) return !nv.nguong || giaTri == null || giaTri <= nv.nguong ? 'ai' : 'ai-duyet';
    if (nv.muc === 2) return 'ai-duyet';
    return 'nguoi';
  }
  E.cheDoXuLy = function (nvId, g) { return cheDoXuLy(E.nv(nvId), g); };
  function nguongChu(nv) {
    if (!nv.nguong) return '—';
    if (nv.donVi.indexOf('%') >= 0) return nv.nguong + '%';
    if (/ngày|km/.test(nv.donVi)) return nv.nguong + ' ' + nv.donVi.split(' ')[0];
    return tr(nv.nguong);
  }
  E.nguongChu = nguongChu;

  function tuaGio(phut) { S.gio = new Date(S.gio.getTime() + phut * 60e3); }

  E.chayKichBan = function (id) {
    var kb = KICH_BAN.find(function (k) { return k.id === id; });
    if (!kb) return;
    var l = ++luot;
    S.kichBan = kb.id; S.buoc = { loiDan: kb.moDau, so: 0, tong: kb.buoc }; S.chay = true; S.dangCho = null;
    if (moChay) { moChay(); moChay = null; }
    bao();
    var c = taoNguCanh(l, kb);
    kb.chay(c).then(function () {
      if (l !== luot) return;
      S.buoc = { loiDan: kb.ketThuc, so: kb.buoc, tong: kb.buoc, xong: true };
      S.chay = false; giamSat(); bao();
    }).catch(function (e) { if (!(e instanceof Dung)) console.error(e); });
  };
  E.tamDung = function () { S.chay = false; bao(); };
  E.tiepTuc = function () { S.chay = true; if (moChay) { moChay(); moChay = null; } bao(); };
  E.tiep = function () { if (moTiep) moTiep(); };
  E.dungKichBan = function () { luot++; S.chay = false; S.kichBan = null; S.buoc = null; S.dangCho = null; if (moTiep) moTiep(); if (moChay) moChay(); bao(); };
  E.datLai = function () { luot++; if (moTiep) moTiep(); if (moChay) moChay(); moi(); bao(); };
  E.cheDo = function (m) { S.cheDo = m; if (m === 'tu' && moTiep) moTiep(); bao(); };
  E.tocDo = function (x) { S.tocDo = x; bao(); };

  // ── Thao tác số liệu (dùng chung cho mọi tình huống) ──────────────────────
  var sp = function (sku) { return S.sp.find(function (p) { return p.sku === sku; }); };
  var kh = function (ma) { return S.kh.find(function (k) { return k.ma === ma; }); };
  E.sp = sp; E.kh = kh;
  function taoDon(khMa, dong, o) {
    var k = kh(khMa), gt = 0, gv = 0;
    dong.forEach(function (d) { var p = sp(d.sku); gt += p.gb * d.sl * (1 - (o && o.ck || 0) / 100); gv += p.gv * d.sl; });
    var don = { ma: 'DH-' + (++S.soDon), luc: new Date(S.gio).toISOString(), kh: khMa, kenh: k.kenh, nhom: sp(dong[0].sku).nhom,
      gt: Math.round(gt / 1000) * 1000, gv: gv, dong: dong, tt: 'moi', xuLy: (o && o.xuLy) || 'ai' };
    S.don.unshift(don);
    return don;
  }
  function ghiDoanhThu(don) {
    S.homNay.dt += don.gt; S.homNay.lg += don.gt - (don.gv || don.gt * 0.76); S.homNay.don++;
    var k = kh(don.kh);
    if (k.hanMuc) k.congNo += don.gt; else { S.homNay.thu += don.gt; S.tienMat += don.gt; }
  }
  function xuatKho(dong, kho) {
    dong.forEach(function (d) { var p = sp(d.sku); p.ton[kho || 'BD'] = Math.max(0, p.ton[kho || 'BD'] - d.sl); });
  }
  function thuTien(khMa, so) {
    var k = kh(khMa); k.congNo = Math.max(0, k.congNo - so); k.quaHan = Math.max(0, k.quaHan - so);
    if (!k.quaHan) k.soNgayQH = 0;
    S.homNay.thu += so; S.tienMat += so;
  }
  E.taoDon = taoDon;

  // ── AI Giám sát: quét toàn hệ thống, phát hiện bất cập, nhắc việc ─────────
  function canh(key, o) {
    var cu = S.canhBao.find(function (c) { return c.key === key; });
    if (cu) { if (!cu.xong) Object.assign(cu, o); return; }
    S.canhBao.unshift(Object.assign({ key: key, luc: new Date(S.gio), xong: false }, o));
    if (!o.im) ghi({ ai: 'A-GS', khoi: o.khoi, text: (o.muc === 'critical' ? 'Cảnh báo nghiêm trọng: ' : o.muc === 'nhac' ? 'Nhắc việc: ' : 'Phát hiện: ') + o.text, loai: 'giam-sat' });
  }
  function het(key) { var c = S.canhBao.find(function (x) { return x.key === key; }); if (c && !c.xong) { c.xong = true; c.xongLuc = new Date(S.gio); } }

  function giamSat(im) {
    if (!S) return;
    // 1. Tồn dưới điểm đặt hàng, chưa có đơn mua đang về
    S.sp.forEach(function (p) {
      var ton = p.ton.BD + p.ton.HN, key = 'ton-' + p.sku;
      var poVe = S.po.some(function (o) { return o.tt !== 'da-nhan' && o.skus && o.skus.indexOf(p.sku) >= 0; });
      if (ton < p.rop && !poVe) canh(key, { muc: ton < p.rop * 0.5 ? 'critical' : 'serious', khoi: 'hd', im: im,
        text: p.ten + ' còn ' + ton + ' (điểm đặt hàng ' + p.rop + '), đủ bán khoảng ' + Math.max(0, Math.floor(ton / p.banNgay)) + ' ngày.', goiY: 'Agent Hoạch định đề xuất bổ sung — xem tình huống "Tồn kho xuống dưới điểm đặt hàng".' });
      else het(key);
    });
    // 2. Khách nợ quá hạn
    S.kh.forEach(function (k) {
      var key = 'no-' + k.ma;
      if (k.quaHan > 0 && k.soNgayQH > 30) canh(key, { muc: 'critical', khoi: 'ht', im: im, text: k.ten + ' nợ quá hạn ' + tr(k.quaHan) + ' đã ' + k.soNgayQH + ' ngày.', goiY: 'Khóa đơn mới trả chậm cho đến khi khách thanh toán; CEO quyết.' });
      else if (k.quaHan > 0 && k.soNgayQH > 14) canh(key, { muc: 'warning', khoi: 'ht', im: im, text: k.ten + ' nợ quá hạn ' + tr(k.quaHan) + ' (' + k.soNgayQH + ' ngày).', goiY: 'Agent Tài chính đã nhắc tự động; theo dõi.' });
      else het(key);
    });
    // 3. Giao trễ tăng
    var bay = S.ngay.slice(-7), tre = bay.reduce(function (s, n) { return s + n.tre; }, 0) + S.homNay.tre, don = bay.reduce(function (s, n) { return s + n.don; }, 0) + S.homNay.don;
    if (tre / don > 0.05) canh('giao-tre', { muc: 'serious', khoi: 'kv', im: im, text: 'Tỉ lệ giao trễ 7 ngày ' + (tre / don * 100).toFixed(1) + '% (mục tiêu ≤ 5%). Trễ dồn vào tuyến Hà Nội — kho HN thiếu 1 xe chiều thứ Sáu.', goiY: 'Đề xuất thuê thêm 1 chuyến giao chiều thứ Sáu tại Hà Nội (~1,2 tr/tuần).' });
    // 4. Việc chờ duyệt quá lâu → nhắc người duyệt
    S.viec.forEach(function (v) {
      var key = 'nhac-' + v.id, gio = (S.gio - new Date(v.tao)) / 3600e3;
      if (v.tt === 'cho' && gio > 12) canh(key, { muc: 'nhac', khoi: v.khoi, im: im, text: ten1(v.nguoiDuyet) + ' (' + nguoi(v.nguoiDuyet).vt + ') chưa xử lý "' + v.tieuDe + '" sau ' + Math.round(gio) + ' giờ.', goiY: 'Đã nhắc qua Zalo nội bộ.' });
      else if (v.tt !== 'cho') het(key);
    });
    // 5. Dòng tiền
    var noNcc = Object.keys(S.congNoNcc).reduce(function (s, k) { return s + S.congNoNcc[k]; }, 0);
    if (S.tienMat - noNcc < 1.2e9) canh('tien', { muc: 'warning', khoi: 'ht', im: im, text: 'Tiền mặt sau khi trả hết nợ nhà cung cấp còn ' + tr(S.tienMat - noNcc) + ' — dưới mức an toàn 1.200 tr.', goiY: 'Giãn PO nhập khẩu sang tuần sau hoặc đẩy thu nợ quá hạn.' });
    else het('tien');
    bao();
  }
  E.giamSat = giamSat;

  // Báo cáo định kỳ / theo yêu cầu
  function taoBaoCao(loai, luc) {
    var hq = S.ngay[S.ngay.length - 1], bay = S.ngay.slice(-7), truoc = S.ngay.slice(-14, -7);
    var sum = function (a, k) { return a.reduce(function (s, n) { return s + n[k]; }, 0); };
    var noQH = S.kh.filter(function (k) { return k.quaHan > 0; }).sort(function (a, b) { return b.quaHan - a.quaHan; });
    var viecCho = S.viec.filter(function (v) { return v.tt === 'cho'; });
    var mo = S.canhBao.filter(function (c) { return !c.xong; });
    var dong = [];
    if (loai === 'sang') {
      dong.push('Doanh thu hôm qua ' + tr(hq.dt) + ' (' + hq.don + ' đơn), lãi gộp ' + (hq.lg / hq.dt * 100).toFixed(1) + '%.');
      dong.push('7 ngày qua ' + tr(sum(bay, 'dt')) + ', ' + (sum(bay, 'dt') >= sum(truoc, 'dt') ? 'tăng ' : 'giảm ') + Math.abs((sum(bay, 'dt') / sum(truoc, 'dt') - 1) * 100).toFixed(1) + '% so với tuần trước.');
      dong.push('Tiền mặt ' + tr(S.tienMat) + '. Công nợ phải thu ' + tr(S.kh.reduce(function (s, k) { return s + k.congNo; }, 0)) + ', quá hạn ' + tr(noQH.reduce(function (s, k) { return s + k.quaHan; }, 0)) + ' ở ' + noQH.length + ' khách.');
      dong.push(viecCho.length + ' việc chờ người duyệt; ' + mo.length + ' điểm cần chú ý (xem mục Cảnh báo).');
    } else {
      dong.push('Hôm nay đến ' + gioChu(S.gio) + ': ' + S.homNay.don + ' đơn mới, doanh thu ' + tr(S.homNay.dt) + ', thu tiền ' + tr(S.homNay.thu) + '.');
      var tong = S.homNay.aiTu + S.homNay.aiSoan + S.homNay.nguoi;
      dong.push('Việc trong ngày: AI tự làm ' + S.homNay.aiTu + ', AI soạn – người duyệt ' + S.homNay.aiSoan + ', người làm ' + S.homNay.nguoi + (tong ? ' (AI tham gia ' + Math.round((S.homNay.aiTu + S.homNay.aiSoan) / tong * 100) + '%)' : '') + '. Ước tiết kiệm ' + Math.round(S.homNay.phutTietKiem) + ' phút công.');
      dong.push('Tồn kho: ' + S.sp.filter(function (p) { return p.ton.BD + p.ton.HN < p.rop; }).length + ' mã dưới điểm đặt hàng. Đơn mua đang về: ' + S.po.filter(function (p) { return p.tt !== 'da-nhan'; }).length + '.');
      dong.push(viecCho.length + ' việc chờ duyệt, ' + mo.length + ' cảnh báo đang mở.');
    }
    var bc = { id: 'BC' + (S.baoCao.length + 1), loai: loai, luc: luc || new Date(S.gio), tieuDe: loai === 'sang' ? 'Báo cáo sáng gửi Giám đốc' : 'Báo cáo nhanh theo yêu cầu', dong: dong };
    S.baoCao.unshift(bc);
    bao();
    return bc;
  }
  E.taoBaoCao = function () { var b = taoBaoCao('nhanh'); ghi({ ai: 'A-GS', khoi: 'cl', text: 'Tạo báo cáo nhanh theo yêu cầu.', loai: 'bao-cao' }); return b; };

  // Hỏi AI Giám sát — câu trả lời tính từ số liệu hiện tại
  E.HOI = [
    'Hôm nay bán được bao nhiêu?', 'Khách nào đang nợ quá hạn?', 'Mặt hàng nào sắp hết?',
    'Việc nào đang tắc?', 'AI đã làm được bao nhiêu việc?', 'Tuần này so với tuần trước thế nào?'
  ];
  E.hoi = function (q) {
    var sum = function (a, k) { return a.reduce(function (s, n) { return s + n[k]; }, 0); };
    switch (E.HOI.indexOf(q)) {
      case 0: return 'Từ 08:00 đến ' + gioChu(S.gio) + ': ' + S.homNay.don + ' đơn, ' + tr(S.homNay.dt) + ' doanh thu, lãi gộp ' + (S.homNay.dt ? (S.homNay.lg / S.homNay.dt * 100).toFixed(1) : '0') + '%. Hôm qua cả ngày: ' + tr(S.ngay[S.ngay.length - 1].dt) + '.';
      case 1: var q1 = S.kh.filter(function (k) { return k.quaHan > 0; }).sort(function (a, b) { return b.quaHan - a.quaHan; });
        return q1.length ? q1.map(function (k) { return k.ten + ': ' + tr(k.quaHan) + ' (' + k.soNgayQH + ' ngày)'; }).join('; ') + '.' : 'Không có khách nào nợ quá hạn.';
      case 2: var q2 = S.sp.map(function (p) { return { p: p, ngay: (p.ton.BD + p.ton.HN) / p.banNgay }; }).sort(function (a, b) { return a.ngay - b.ngay; }).slice(0, 4);
        return q2.map(function (x) { return x.p.ten + ' — còn ' + (x.p.ton.BD + x.p.ton.HN) + ', đủ ~' + Math.floor(x.ngay) + ' ngày'; }).join('; ') + '.';
      case 3: var q3 = S.viec.filter(function (v) { return v.tt === 'cho'; });
        return q3.length ? q3.map(function (v) { return '"' + v.tieuDe + '" chờ ' + ten1(v.nguoiDuyet) + ' ' + Math.max(1, Math.round((S.gio - new Date(v.tao)) / 3600e3)) + ' giờ'; }).join('; ') + '.' : 'Không có việc nào đang chờ duyệt.';
      case 4: var b = S.ngay.slice(-30), t = sum(b, 'aiTu') + sum(b, 'aiSoan') + sum(b, 'nguoi');
        return '30 ngày qua: AI tự làm ' + sum(b, 'aiTu') + ' việc, soạn để người duyệt ' + sum(b, 'aiSoan') + ', người làm ' + sum(b, 'nguoi') + ' — AI tham gia ' + Math.round((sum(b, 'aiTu') + sum(b, 'aiSoan')) / t * 100) + '% khối việc đơn hàng. Hôm nay đến giờ: ' + S.homNay.aiTu + ' / ' + S.homNay.aiSoan + ' / ' + S.homNay.nguoi + '.';
      case 5: var n = S.ngay.slice(-7), p = S.ngay.slice(-14, -7);
        return 'Doanh thu ' + tr(sum(n, 'dt')) + ' so với ' + tr(sum(p, 'dt')) + ' (' + ((sum(n, 'dt') / sum(p, 'dt') - 1) * 100).toFixed(1) + '%). Đơn ' + sum(n, 'don') + ' so với ' + sum(p, 'don') + '. Giao trễ ' + sum(n, 'tre') + ' đơn so với ' + sum(p, 'tre') + '.';
    }
    return 'Bản demo trả lời các câu gợi ý bên dưới.';
  };

  function gioChu(d) { return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
  E.gioChu = gioChu;

  // ── Các tình huống ─────────────────────────────────────────────────────────
  var KICH_BAN = [
    {
      id: 'don-lon', ten: 'Đơn sỉ lớn, kho thiếu hàng', khoi: ['kd', 'ht', 'kv', 'nh'], buoc: 11,
      moDau: 'Đại lý Bếp Xanh đặt 200 bộ nồi inox 5 món qua Zalo. Xem đơn chạy qua Kinh doanh → Tài chính → Kho → Mua hàng → Giao hàng.',
      ketThuc: 'Xong: đơn 86 tr đi từ tin nhắn Zalo đến xe giao trong vài chục phút. Người chỉ chạm vào những chỗ vượt ngưỡng: đơn lớn, vượt hạn mức nợ, đơn mua — mỗi lần vài phút trên điện thoại.',
      chay: async function (c) {
        var p = sp('NOI-INOX-5'), k = kh('BX');
        p.ton.BD = 140; p.ton.HN = 26;
        await c.buoc('08:05 — Tin Zalo của Đại lý Bếp Xanh: "Lấy 200 bộ nồi inox 5 món, giao trong tuần." Agent Bán hàng đọc tin, nhận ra khách và mặt hàng.', 2, 'kd');
        var don;
        await c.xuLy('nhan-don', 200 * p.gb, { viec: 'Tạo đơn cho Đại lý Bếp Xanh: 200 × Bộ nồi inox 5 món, ' + tr(200 * p.gb), tieuDe: 'Xác nhận đơn 200 bộ nồi — Bếp Xanh', phutNguoi: 20,
          lam: function () { don = taoDon('BX', [{ sku: 'NOI-INOX-5', sl: 200 }], { xuLy: 'ai' }); } });
        if (!don) return;
        await c.buoc('Đơn đã xác nhận. Ngưỡng tự xác nhận hiện là ' + E.nguongChu(E.nv('nhan-don')) + ' ở mức ' + E.nv('nhan-don').muc + ' — đổi ở Thiết lập rồi chạy lại để thấy khác biệt. Tiếp theo: kiểm công nợ khách.', 1, 'ht');
        var vuot = k.congNo + don.gt - k.hanMuc;
        if (vuot > 0) {
          await c.xuLy('han-muc', vuot, { viec: 'Bếp Xanh sẽ vượt hạn mức ' + tr(vuot) + ' (nợ ' + tr(k.congNo) + ' / hạn mức ' + tr(k.hanMuc) + ')', deXuat: 'khách trả đúng hạn 11/11 tháng gần nhất — đề xuất nâng hạn mức tạm thời lên 220 tr trong 30 ngày.',
            tieuDe: 'Cho Bếp Xanh vượt hạn mức ' + tr(vuot), chiTiet: 'Lịch sử thanh toán tốt. Agent Tài chính đề xuất nâng tạm.', phutNguoi: 10, lam: function () { k.hanMuc = 220e6; } });
        }
        await c.buoc('Agent Kho vận kiểm tồn: Bình Dương còn 140 bộ, Hà Nội 26. Thiếu 60 bộ. Gom 26 bộ từ Hà Nội thì miền Bắc hết hàng mà vẫn thiếu 34 — nên phải đặt thêm.', 2, 'kv');
        await c.xuLy('giu-hang', null, { viec: 'Giữ 140 bộ tại Bình Dương cho DH-' + S.soDon + '; lập phiếu xuất đợt 1 (140 bộ), đợt 2 chờ hàng về.', phutNguoi: 25,
          lam: function () { xuatKho([{ sku: 'NOI-INOX-5', sl: 140 }], 'BD'); don.tt = 'giao-mot-phan'; } });
        await c.buoc('Agent Hoạch định tính thêm nhu cầu 14 ngày tới (14 bộ/ngày) và đề xuất đặt 260 bộ thay vì chỉ 60 — đủ đơn này và đưa tồn về trên điểm đặt hàng.', 3, 'hd');
        var gtPO = 260 * p.gv, po;
        await c.xuLy('dat-ncc', gtPO, { viec: 'Đơn mua PO-' + (S.soPO + 1) + ': 260 × Bộ nồi inox 5 món từ Inox Thép Việt, ' + tr(gtPO) + ', giao 5 ngày', tieuDe: 'Duyệt PO 260 bộ nồi — Inox Thép Việt ' + tr(gtPO),
          chiTiet: 'So giá 3 nhà cung cấp: Thép Việt rẻ nhất 312.000đ, giao 5 ngày. Kim Long 326.000đ, giao 3 ngày.', phutNguoi: 40, phutDuyet: 5,
          lam: function () { po = { ma: 'PO-' + (++S.soPO), ncc: 'TV', gt: gtPO, tao: '2026-11-03', duKien: '2026-11-08', tt: 'da-dat', dong: 'Bộ nồi inox 5 món', skus: ['NOI-INOX-5'] }; S.po.unshift(po); S.congNoNcc.TV += gtPO; } });
        await c.xuLy('giao-hang', 18, { viec: 'Xếp 140 bộ lên chuyến giao 10:30, tuyến Thủ Đức – Q.9 (18 km), báo khách giờ nhận.', phutNguoi: 15, lam: function () { ghiDoanhThu({ gt: Math.round(don.gt * 0.7), gv: 140 * p.gv, kh: 'BX' }); } });
        await c.xuLy('hoa-don', null, { viec: 'Xuất hóa đơn điện tử đợt 1 cho Bếp Xanh: ' + tr(Math.round(don.gt * 0.7)) + ', gửi email kèm phiếu giao.', phutNguoi: 10 });
        await c.xuLy('tra-loi', null, { viec: 'Nhắn Zalo cho Bếp Xanh: "Đơn đã xác nhận. 140 bộ giao chiều nay, 60 bộ còn lại giao ngày 08/11."', phutNguoi: 5 });
        await c.buoc('AI Giám sát ghi nhận: đơn chia 2 đợt, hẹn 08/11. Nó sẽ tự nhắc Kho và Mua hàng nếu PO trễ — không ai phải nhớ.', 1, 'cl');
        canh('po-bx', { muc: 'info', khoi: 'nh', text: 'Theo dõi PO nồi inox cho đơn Bếp Xanh: hàng phải về trước 08/11 để giao đợt 2.', goiY: 'Tự nhắc Agent Mua hàng nếu nhà cung cấp chưa xác nhận ngày giao trước 05/11.' });
        giamSat();
      }
    },
    {
      id: 'khieu-nai', ten: 'Khách khiếu nại hàng lỗi', khoi: ['dv', 'kv', 'nh', 'cl'], buoc: 8,
      moDau: 'Một khách lẻ gửi ảnh chảo chống dính bị bong lớp phủ sau 3 tuần. Xem CSKH xử lý, và AI Giám sát nhận ra đây không phải ca lẻ.',
      ketThuc: 'Xong: khách được đổi trong ngày; quan trọng hơn, AI Giám sát nối 6 ca lẻ thành một lô lỗi và chặn lô đó trước khi bán tiếp.',
      chay: async function (c) {
        await c.buoc('09:20 — Zalo OA nhận ảnh và tin: "Chảo mua 3 tuần đã bong chống dính." Agent CSKH tra số điện thoại, tìm được đơn DH-2961 (Chảo chống dính 26cm).', 2, 'dv');
        var ma = 'CS-' + (++S.soPhieu);
        S.phieu.unshift({ ma: ma, kh: 'ZL', loai: 'Chảo bong chống dính', kenh: 'Zalo', tt: 'dang-xu-ly', luc: new Date(S.gio).toISOString() });
        S.homNay.khieuNai++;
        await c.xuLy('tra-loi', null, { viec: 'Trả lời khách: xin lỗi, xác nhận còn bảo hành 12 tháng, hẹn đổi chảo mới trong ngày (phiếu ' + ma + ').', phutNguoi: 8 });
        await c.xuLy('doi-tra', 139000, { viec: 'Đổi 1 Chảo chống dính 26cm cho khách lẻ, phí ship hai chiều 30.000đ', tieuDe: 'Đổi chảo lỗi cho khách lẻ (' + ma + ')', phutNguoi: 12,
          lam: function () { xuatKho([{ sku: 'CHAO-CD-26', sl: 1 }], 'BD'); S.phieu[0].tt = 'xong'; } });
        await c.buoc('Agent Kho vận tạo lệnh lấy chảo lỗi về, ghi mã lô trên đáy chảo: NB-2609. Agent CSKH gắn mã lô vào phiếu.', 4, 'kv');
        await c.buoc('AI Giám sát quét các phiếu 30 ngày: đây là ca thứ 6 cùng lỗi bong chống dính, cả 6 đều thuộc lô NB-2609 của Ningbo Homeware. Tỉ lệ lỗi lô này 2,1% — gấp 5 lần bình thường.', 2, 'cl');
        canh('lo-nb2609', { muc: 'critical', khoi: 'nh', text: 'Lô NB-2609 (chảo chống dính, Ningbo Homeware): 6 khiếu nại bong lớp phủ trong 30 ngày, tỉ lệ lỗi 2,1%.', goiY: 'Tạm ngừng bán lô NB-2609 (còn 312 chiếc trong kho), yêu cầu NCC đổi lô, xem xét PO-1187 đang về.' });
        await c.xuLy('gia-ban', null, { viec: 'Tạm ngừng bán 312 chảo lô NB-2609 trên mọi kênh và gửi yêu cầu đổi lô cho Ningbo Homeware', deXuat: 'giữ lại để NCC kiểm định; bán lô khác còn 410 chiếc, đủ 13 ngày.', tieuDe: 'Ngừng bán lô chảo NB-2609', phutNguoi: 20,
          lam: function () { var p = sp('CHAO-CD-26'); p.ton.BD = Math.max(0, p.ton.BD - 312); } });
        await c.buoc('Agent Mua hàng gửi thư khiếu nại kèm 6 ảnh và số liệu cho Ningbo Homeware, đề nghị đổi lô và kiểm tra PO-1187 đang trên đường về.', 6, 'nh');
        ghi({ ai: 'A-MH', khoi: 'nh', muc: 2, text: 'Gửi khiếu nại chất lượng lô NB-2609 cho Ningbo Homeware; đề nghị kiểm định PO-1187 trước khi xuất.' });
        het('lo-nb2609');
        giamSat();
      }
    },
    {
      id: 'ton-thap', ten: 'Tồn kho xuống dưới điểm đặt hàng', khoi: ['hd', 'nh', 'kv', 'ht'], buoc: 9,
      moDau: 'Sáng thứ Ba, Agent Hoạch định chạy dự báo hằng ngày. Ba mã điện gia dụng sắp hết trước mùa cao điểm cuối năm.',
      ketThuc: 'Xong: từ dự báo đến hàng nằm trên kệ, kèm kiểm đếm phát hiện lệch. Người chỉ duyệt PO và quyết phần lệch.',
      chay: async function (c) {
        ['DIEN-CHIEN-5', 'DIEN-AM-17', 'DIEN-NCD-18'].forEach(function (s, i) { var p = sp(s); p.ton.BD = [58, 112, 66][i]; p.ton.HN = [9, 20, 12][i]; });
        giamSat();
        await c.buoc('Dự báo 30 ngày: nồi chiên không dầu bán tăng 35% từ giữa tháng 11 (mùa quà Tết sớm, khách B2B). Tồn hiện chỉ đủ 9 ngày.', 3, 'hd');
        await c.xuLy('du-bao', null, { viec: 'Đề xuất bổ sung: 240 Nồi chiên không dầu 5L, 300 Ấm siêu tốc 1,7L, 160 Nồi cơm điện 1,8L — đủ 35 ngày bán + 7 ngày an toàn.', phutNguoi: 90 });
        var gt = 240 * 612000 + 300 * 132000 + 160 * 345000;
        await c.buoc('Agent Mua hàng so 2 nhà cung cấp điện gia dụng. Đông Mai giao 4 ngày, công nợ 30 ngày. Tổng ' + tr(gt) + '.', 2, 'nh');
        var po;
        await c.xuLy('dat-ncc', gt, { viec: 'Đơn mua PO-' + (S.soPO + 1) + ' cho Điện máy Đông Mai: 3 mã điện gia dụng, ' + tr(gt), tieuDe: 'Duyệt PO điện gia dụng ' + tr(gt) + ' — Đông Mai',
          chiTiet: 'Vượt ngưỡng 80 tr. Dòng tiền sau PO vẫn trên mức an toàn.', phutNguoi: 45,
          lam: function () { po = { ma: 'PO-' + (++S.soPO), ncc: 'DM', gt: gt, tao: '2026-11-03', duKien: '2026-11-07', tt: 'da-dat', dong: 'Nồi chiên, ấm siêu tốc, nồi cơm điện', skus: ['DIEN-CHIEN-5', 'DIEN-AM-17', 'DIEN-NCD-18'] }; S.po.unshift(po); S.congNoNcc.DM += gt; } });
        if (!po) return;
        giamSat();
        await c.buoc('Tua nhanh đến 07/11: xe Đông Mai đến kho Bình Dương. Agent Kho vận đối chiếu phiếu giao với PO.', 90, 'kv');
        await c.xuLy('nhap-kho', 1.3, { viec: 'Kiểm đếm PO: nồi chiên 240/240, ấm 296/300 (thiếu 4), nồi cơm 160/160 — lệch 1,3%', tieuDe: 'Nhận hàng thiếu 4 ấm siêu tốc — PO ' + po.ma, phutNguoi: 60,
          lam: function () { sp('DIEN-CHIEN-5').ton.BD += 240; sp('DIEN-AM-17').ton.BD += 296; sp('DIEN-NCD-18').ton.BD += 160; po.tt = 'da-nhan'; } });
        await c.xuLy('hoa-don', null, { viec: 'Ghi nhận công nợ Đông Mai theo số thực nhận, trừ 4 ấm (528.000đ), gửi biên bản lệch cho NCC.', phutNguoi: 15, lam: function () { S.congNoNcc.DM -= 528000; } });
        await c.buoc('AI Giám sát xóa 3 cảnh báo tồn thấp và ghi chú: Đông Mai giao thiếu lần 2 trong quý — đưa vào đánh giá nhà cung cấp cuối tháng.', 1, 'cl');
        giamSat();
      }
    },
    {
      id: 'cong-no', ten: 'Khách nợ quá hạn', khoi: ['ht', 'kd', 'cl'], buoc: 7,
      moDau: 'Đại lý Hải Đăng (Hải Phòng) nợ quá hạn 46 tr đã 37 ngày, sáng nay lại gửi đơn mới 32 tr. Xem hệ thống giữ tiền cho công ty mà không làm mất khách.',
      ketThuc: 'Xong: không ai phải "khó nói" với khách — luật hạn mức chạy tự động, người chỉ ra quyết định ngoại lệ có đủ số liệu.',
      chay: async function (c) {
        var k = kh('HD'); k.quaHan = 46e6; k.soNgayQH = 37; k.congNo = 84e6;
        giamSat();
        await c.buoc('Agent Bán hàng nhận đơn 32 tr từ Hải Đăng. Trước khi xác nhận, nó luôn hỏi Agent Tài chính về công nợ khách.', 2, 'kd');
        await c.buoc('Agent Tài chính: Hải Đăng nợ quá hạn 46 tr, 37 ngày — quá ngưỡng 30 ngày. Theo luật, đơn trả chậm mới bị giữ lại.', 1, 'ht');
        ghi({ ai: 'A-KD', khoi: 'kd', muc: 3, text: 'Giữ đơn 32 tr của Đại lý Hải Đăng — khách nợ quá hạn > 30 ngày. Đề nghị khách thanh toán trước hoặc trả tiền mặt.' });
        await c.xuLy('nhac-no', 37, { viec: 'Gửi thư nhắc nợ lần 3 kèm sao kê cho Hải Đăng, đề xuất trả 46 tr để mở lại đơn', tieuDe: 'Gửi nhắc nợ lần 3 — Hải Đăng', phutNguoi: 20 });
        await c.buoc('Hải Đăng trả lời: xin trả 20 tr hôm nay, 26 tr ngày 15/11, và vẫn muốn nhận hàng. Đây là ngoại lệ — luật không tự quyết được.', 30, 'ht');
        var ok = await c.xuLy('han-muc', 32e6, { viec: 'Hải Đăng xin giao đơn 32 tr khi còn nợ quá hạn 26 tr sau đợt trả', deXuat: 'chấp nhận nếu 20 tr về trước 16:00 hôm nay; giao 50% đơn, 50% còn lại sau 15/11. Rủi ro thấp: khách 4 năm, chưa từng bỏ nợ.',
          tieuDe: 'Ngoại lệ công nợ — giao đơn 32 tr cho Hải Đăng', chiTiet: 'Phương án của Agent Tài chính: giao 50% sau khi nhận 20 tr.', phutNguoi: 10 });
        if (ok) {
          await c.buoc('14:10 — Ngân hàng báo có 20 tr từ Hải Đăng. Agent Tài chính khớp tiền với hóa đơn quá hạn cũ nhất và mở khóa đơn.', 240, 'ht');
          thuTien('HD', 20e6); k.soNgayQH = 37;
          ghi({ ai: 'A-TC', khoi: 'ht', muc: 4, text: 'Khớp 20 tr từ Đại lý Hải Đăng vào hóa đơn HD-0912; còn quá hạn 26 tr, hẹn 15/11.' });
          var don = taoDon('HD', [{ sku: 'CHAO-CD-28', sl: 60 }, { sku: 'HOP-TT-10', sl: 40 }, { sku: 'DIEN-AM-17', sl: 20 }], { xuLy: 'ai-duyet' });
          ghiDoanhThu({ gt: Math.round(don.gt / 2), gv: don.gv / 2, kh: 'HD' });
          await c.xuLy('giao-hang', 120, { viec: 'Giao 50% đơn ' + don.ma + ' từ kho Hà Nội (120 km Hải Phòng — vượt ngưỡng tự điều 30 km)', tieuDe: 'Điều xe Hà Nội → Hải Phòng cho ' + don.ma, phutNguoi: 15 });
        }
        await c.buoc('AI Giám sát đặt lịch: 15/11 nếu chưa có 26 tr thì tự khóa lại và báo CEO. Khoản nợ chuyển sang mức theo dõi.', 1, 'cl');
        giamSat();
      }
    },
    {
      id: 'chien-dich', ten: 'Chiến dịch khuyến mãi 11.11', khoi: ['mk', 'kd', 'hd', 'cl'], buoc: 8,
      moDau: 'Còn 8 ngày tới 11.11. Agent Marketing đề xuất chiến dịch "Bếp đủ đầy 11.11" cho sàn TMĐT và khách lẻ.',
      ketThuc: 'Xong: chiến dịch từ ý tưởng đến đơn hàng đầu tiên trong một buổi sáng, ngân sách luôn nằm trong trần người đã duyệt.',
      chay: async function (c) {
        await c.buoc('Agent Marketing đọc dữ liệu 11.11 năm ngoái và tồn kho hiện tại: đẩy bộ nồi 3 món và hộp thủy tinh (tồn dồi dào, biên tốt), tránh nồi chiên (đang thiếu).', 3, 'mk');
        await c.xuLy('noi-dung', null, { viec: 'Bộ nội dung chiến dịch: 12 bài, 4 video ngắn, banner sàn, combo "Nồi 3 món + 10 hộp thủy tinh" giảm 11%', tieuDe: 'Duyệt nội dung & combo 11.11', phutNguoi: 240 });
        await c.xuLy('quang-cao', 2.4e6, { viec: 'Ngân sách quảng cáo 2,4 tr/ngày × 8 ngày trên Facebook, TikTok và sàn', tieuDe: 'Duyệt ngân sách quảng cáo 11.11 (19,2 tr)', chiTiet: 'Trên ngưỡng 2 tr/ngày.', phutNguoi: 30,
          lam: function () { S.chienDich.unshift({ ma: 'CD-1111', ten: 'Bếp đủ đầy 11.11', kenh: 'Facebook + TikTok + sàn', ngan: 19.2e6, chi: 0, lead: 0, don: 0, dt: 0, tt: 'chay' }); } });
        await c.buoc('Agent Hoạch định kiểm: combo cần thêm 180 bộ nồi 3 món — tồn đủ, không cần đặt thêm. Agent Kho vận đóng sẵn 120 combo.', 4, 'hd');
        await c.buoc('Quảng cáo chạy 3 giờ: 2.140 lượt xem, 64 khách nhắn tin, 21 đơn. Agent CSKH trả lời 58/64 tin; 6 tin hỏi giao tỉnh xa chuyển người.', 180, 'mk');
        var cd = S.chienDich.find(function (x) { return x.ma === 'CD-1111'; });
        for (var i = 0; i < 21; i++) {
          var khMa = i % 3 ? 'WEB' : 'TK';
          var d = taoDon(khMa, [{ sku: 'NOI-INOX-3', sl: 1 }, { sku: 'HOP-TT-10', sl: 1 }], { ck: 11, xuLy: 'ai' });
          ghiDoanhThu(d); S.homNay.aiTu++;
          if (cd) { cd.don++; cd.dt += d.gt; cd.lead = 64; cd.chi = 0.9e6; }
        }
        ghi({ ai: 'A-KD', khoi: 'kd', muc: 3, text: 'Tự xác nhận 21 đơn combo 11.11 từ web và TikTok (' + tr(cd ? cd.dt : 0) + ').' });
        await c.buoc('Agent Marketing so kết quả với mục tiêu: chi phí mỗi đơn 43.000đ (mục tiêu ≤ 60.000đ). Nó tự dồn ngân sách sang TikTok — hiệu quả gấp 1,8 lần Facebook.', 2, 'mk');
        await c.xuLy('quang-cao', 1.4e6, { viec: 'Chuyển 0,6 tr/ngày từ Facebook sang TikTok, tổng ngân sách giữ nguyên', phutNguoi: 20 });
        await c.buoc('AI Giám sát thêm chiến dịch vào báo cáo sáng mỗi ngày đến 12/11: chi tiêu, đơn, doanh thu, tồn combo.', 1, 'cl');
      }
    },
    {
      id: 'mot-ngay', ten: 'Một ngày làm việc bình thường', khoi: ['kd', 'kv', 'ht', 'dv'], buoc: 14,
      moDau: 'Tua nhanh một ngày: đơn đến từ mọi kênh, giao hàng, tiền về, khách hỏi. Xem phần lớn việc chạy mà không ai phải chạm vào.',
      ketThuc: 'Hết ngày: so cột "AI tự làm" với "người làm" trên dashboard. Con người dành thời gian cho khách lớn, nhà cung cấp và quyết định.',
      chay: async function (c) {
        var R = D.rng(Date.now() % 100000);
        var dsKh = S.kh.filter(function (k) { return k.kenh !== 'le'; });
        for (var gio = 0; gio < 12; gio++) {
          var n = 3 + Math.floor(R() * 5), tong = 0;
          for (var i = 0; i < n; i++) {
            var k = dsKh[Math.floor(R() * dsKh.length)], p = S.sp[Math.floor(R() * S.sp.length)];
            var sl = k.kenh === 'san' ? 1 + Math.floor(R() * 2) : 10 + Math.floor(R() * 40);
            var d = taoDon(k.ma, [{ sku: p.sku, sl: sl }], {});
            var cd = cheDoXuLy(E.nv('nhan-don'), d.gt);
            d.xuLy = cd; d.tt = 'dang-giao';
            if (cd === 'ai') S.homNay.aiTu++; else if (cd === 'ai-duyet') S.homNay.aiSoan++; else S.homNay.nguoi++;
            xuatKho([{ sku: p.sku, sl: sl }], k.tinh === 'Hà Nội' || k.tinh === 'Hải Phòng' ? 'HN' : 'BD');
            ghiDoanhThu(d); tong += d.gt;
          }
          var thu = 8e6 + R() * 22e6, khThu = S.kh.filter(function (x) { return x.congNo > thu; });
          if (khThu.length) thuTien(khThu[Math.floor(R() * khThu.length)].ma, thu);
          if (R() < 0.3) S.homNay.tre++;
          ghi({ ai: 'A-KD', khoi: 'kd', muc: E.nv('nhan-don').muc, text: n + ' đơn mới (' + tr(tong) + ') — tự xác nhận các đơn trong ngưỡng, đơn lớn chuyển Trưởng KD.' });
          if (gio % 3 === 1) ghi({ ai: 'A-CS', khoi: 'dv', muc: E.nv('tra-loi').muc, text: 'Trả lời ' + (6 + Math.floor(R() * 10)) + ' tin khách trên Zalo, sàn, email.' });
          if (gio % 4 === 2) ghi({ ai: 'A-TC', khoi: 'ht', muc: 4, text: 'Khớp tiền về ' + tr(thu) + ' với hóa đơn.' });
          if (gio === 1 || gio === 7) ghi({ ai: 'A-KHO', khoi: 'kv', muc: E.nv('giao-hang').muc, text: 'Gom ' + (8 + Math.floor(R() * 8)) + ' đơn thành ' + (2 + Math.floor(R() * 2)) + ' chuyến giao, tối ưu tuyến.' });
          giamSat();
          await c.buoc(['08:00 — Đơn sàn và Zalo đổ về đầu giờ', '09:00 — Đại lý đặt hàng bổ sung', '10:00 — Chuyến giao sáng xuất kho', '11:00 — Siêu thị mini chốt đơn tuần', '12:00 — Giờ nghỉ trưa, AI vẫn trả lời khách', '13:00 — Tiền về từ đại lý', '14:00 — Khách doanh nghiệp hỏi báo giá quà Tết', '15:00 — Chuyến giao chiều', '16:00 — Đơn sàn cuối ngày', '17:00 — Đối soát tiền và kho', '18:00 — Đơn online buổi tối', '19:00 — AI Giám sát tổng kết ngày'][gio] + ': ' + n + ' đơn, ' + tr(tong) + '.', 60, 'kd');
        }
        taoBaoCao('nhanh');
        ghi({ ai: 'A-GS', khoi: 'cl', text: 'Tổng kết ngày đã gửi Giám đốc và các trưởng bộ phận.', loai: 'bao-cao' });
      }
    }
  ];
  E.KICH_BAN = KICH_BAN;

  moi();
  window.ABZ.E = E;
})();
