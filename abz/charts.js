/* ABZ — biểu đồ SVG tự vẽ (không thư viện ngoài).
   Theo quy ước dataviz: nét mảnh, đường 2px, cột ≤ 24px bo 4px đầu dữ liệu, khe 2px giữa các mảng,
   lưới mảnh một màu, chú giải khi ≥ 2 chuỗi, chữ dùng màu chữ (không dùng màu dữ liệu),
   rê chuột có tooltip. Màu chuỗi lấy từ biến CSS --s1…--s5 (bảng màu đã kiểm định mù màu). */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var C = {};

  function el(tag, attrs, cha) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (cha) cha.appendChild(e);
    return e;
  }
  function h(tag, cls, cha, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    if (cha) cha.appendChild(e);
    return e;
  }

  // Tooltip dùng chung
  var tip = null;
  function moTip(x, y, tieuDe, dong) {
    if (!tip) { tip = h('div', 'cv-tip', document.body); tip.setAttribute('role', 'status'); }
    tip.textContent = '';
    if (tieuDe) h('div', 'cv-tip-h', tip, tieuDe);
    dong.forEach(function (d) {
      var r = h('div', 'cv-tip-r', tip);
      if (d.mau) { var k = h('i', 'cv-key' + (d.dang === 'o' ? ' o' : ''), r); k.style.background = d.mau; }
      h('b', '', r, d.gt);
      h('span', '', r, d.ten);
    });
    tip.style.display = 'block';
    var w = tip.offsetWidth, hh = tip.offsetHeight;
    var X = x + 14, Y = y - hh - 10;
    if (X + w > window.innerWidth - 8) X = x - w - 14;
    if (Y < 8) Y = y + 16;
    tip.style.left = X + 'px'; tip.style.top = Y + 'px';
  }
  function dongTip() { if (tip) tip.style.display = 'none'; }
  C.dongTip = dongTip;

  // Số trục gọn
  function soGon(v) {
    var a = Math.abs(v);
    if (a >= 1e9) return (v / 1e9).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + ' tỷ';
    if (a >= 1e6) return (v / 1e6).toLocaleString('vi-VN', { maximumFractionDigits: 0 }) + ' tr';
    if (a >= 1e3) return (v / 1e3).toLocaleString('vi-VN', { maximumFractionDigits: 0 }) + 'K';
    return v.toLocaleString('vi-VN', { maximumFractionDigits: 1 });
  }
  C.soGon = soGon;
  function tronTren(v) {
    if (v <= 0) return 1;
    var mu = Math.pow(10, Math.floor(Math.log10(v))), n = v / mu;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * mu;
  }

  function chuGiai(cha, ds, dang) {
    if (ds.length < 2) return;
    var lg = h('div', 'cv-legend', cha);
    ds.forEach(function (s) {
      var i = h('span', '', lg);
      var k = h('i', 'cv-key' + (dang === 'line' ? ' line' : ''), i);
      k.style.background = s.mau;
      i.appendChild(document.createTextNode(s.ten));
    });
  }

  // ── Đường theo thời gian (một trục) ───────────────────────────────────────
  // o: {nhan:[...], chuoi:[{ten, mau, gt:[...]}], dinhDang, cao, vung (tô nhạt nếu 1 chuỗi)}
  C.duong = function (cha, o) {
    cha.textContent = '';
    chuGiai(cha, o.chuoi, 'line');
    var W = Math.max(280, cha.clientWidth || 600), H = o.cao || 220, L = 52, Rr = 14, T = 12, B = 26;
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, width: '100%', height: H, role: 'img', 'aria-label': o.moTa || '' }, cha);
    var n = o.nhan.length, max = 0, min = o.tuKhong === false ? Infinity : 0;
    o.chuoi.forEach(function (s) { s.gt.forEach(function (v) { if (v > max) max = v; if (v < min) min = v; }); });
    if (o.tuKhong === false) { var pad = (max - min) * 0.15; min = Math.max(0, min - pad); }
    var top = tronTren(max * 1.05), x = function (i) { return L + (W - L - Rr) * (n === 1 ? 0.5 : i / (n - 1)); };
    var y = function (v) { return T + (H - T - B) * (1 - (v - min) / (top - min)); };
    for (var g = 0; g <= 4; g++) {
      var v = min + (top - min) * g / 4, yy = y(v);
      el('line', { x1: L, x2: W - Rr, y1: yy, y2: yy, class: g ? 'cv-grid' : 'cv-base' }, svg);
      var t = el('text', { x: L - 8, y: yy + 4, 'text-anchor': 'end', class: 'cv-ax' }, svg); t.textContent = (o.dinhDangTruc || soGon)(v);
    }
    var buoc = Math.ceil(n / Math.max(2, Math.floor((W - L) / 70)));
    o.nhan.forEach(function (lb, i) {
      if (i % buoc && i !== n - 1) return;
      var t = el('text', { x: x(i), y: H - 6, 'text-anchor': i === n - 1 ? 'end' : i === 0 ? 'start' : 'middle', class: 'cv-ax' }, svg); t.textContent = lb;
    });
    o.chuoi.forEach(function (s) {
      var d = s.gt.map(function (v, i) { return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1); }).join(' ');
      if (o.chuoi.length === 1 && o.vung !== false) {
        var a = el('path', { d: d + ' L' + x(n - 1) + ' ' + y(min) + ' L' + x(0) + ' ' + y(min) + ' Z', class: 'cv-area' }, svg); a.style.fill = s.mau;
      }
      var p = el('path', { d: d, class: 'cv-line' }, svg); p.style.stroke = s.mau;
      var dot = el('circle', { cx: x(n - 1), cy: y(s.gt[n - 1]), r: 4.5, class: 'cv-dot' }, svg); dot.style.fill = s.mau;
    });
    // Nhãn cuối chuỗi (chọn lọc: chỉ giá trị cuối)
    if (o.nhanCuoi !== false && o.chuoi.length === 1) {
      var s0 = o.chuoi[0], lt = el('text', { x: x(n - 1) - 8, y: y(s0.gt[n - 1]) - 10, 'text-anchor': 'end', class: 'cv-lbl' }, svg);
      lt.textContent = (o.dinhDang || soGon)(s0.gt[n - 1]);
    }
    // Lớp rê chuột: thước dọc bám điểm gần nhất
    var vach = el('line', { y1: T, y2: H - B, class: 'cv-cross', visibility: 'hidden' }, svg);
    var phu = el('rect', { x: L, y: T, width: W - L - Rr, height: H - T - B, fill: 'transparent', tabindex: 0 }, svg);
    function den(ev) {
      var r = svg.getBoundingClientRect(), px = (ev.clientX - r.left) * W / r.width;
      var i = Math.max(0, Math.min(n - 1, Math.round((px - L) / ((W - L - Rr) / Math.max(1, n - 1)))));
      vach.setAttribute('x1', x(i)); vach.setAttribute('x2', x(i)); vach.setAttribute('visibility', 'visible');
      moTip(ev.clientX, ev.clientY, (o.nhanDai || o.nhan)[i], o.chuoi.map(function (s) { return { mau: s.mau, ten: s.ten, gt: (o.dinhDang || soGon)(s.gt[i]) }; }));
    }
    phu.addEventListener('pointermove', den);
    phu.addEventListener('pointerleave', function () { vach.setAttribute('visibility', 'hidden'); dongTip(); });
  };

  // ── Thanh ngang (so sánh hạng mục) ────────────────────────────────────────
  // o: {muc:[{ten, gt, phu}], mau, dinhDang}
  C.thanh = function (cha, o) {
    cha.textContent = '';
    var max = Math.max.apply(null, o.muc.map(function (m) { return m.gt; })) || 1;
    var wrap = h('div', 'cv-bars', cha);
    o.muc.forEach(function (m) {
      var r = h('div', 'cv-bar-r', wrap);
      r.tabIndex = 0;
      h('span', 'cv-bar-l', r, m.ten);
      var tr = h('span', 'cv-bar-t', r);
      var b = h('i', '', tr); b.style.width = Math.max(1.5, m.gt / max * 100) + '%'; b.style.background = m.mau || o.mau || 'var(--s1)';
      h('b', 'cv-bar-v', r, (o.dinhDang || soGon)(m.gt));
      function len(ev) { moTip(ev.clientX, ev.clientY, m.ten, [{ mau: m.mau || o.mau || 'var(--s1)', ten: m.phu || '', gt: (o.dinhDang || soGon)(m.gt) }]); }
      r.addEventListener('pointermove', len);
      r.addEventListener('pointerleave', dongTip);
    });
  };

  // ── Cột chồng theo ngày (cơ cấu) ──────────────────────────────────────────
  // o: {nhan, nhanDai, chuoi:[{ten, mau, gt}], cao, dinhDang}
  C.cotChong = function (cha, o) {
    cha.textContent = '';
    chuGiai(cha, o.chuoi, 'rect');
    var W = Math.max(280, cha.clientWidth || 600), H = o.cao || 220, L = 40, Rr = 8, T = 10, B = 26;
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, width: '100%', height: H, role: 'img', 'aria-label': o.moTa || '' }, cha);
    var n = o.nhan.length, tong = o.nhan.map(function (_, i) { return o.chuoi.reduce(function (s, c) { return s + c.gt[i]; }, 0); });
    var top = tronTren(Math.max.apply(null, tong) * 1.05);
    var y = function (v) { return T + (H - T - B) * (1 - v / top); };
    for (var g = 0; g <= 4; g++) {
      var yy = y(top * g / 4);
      el('line', { x1: L, x2: W - Rr, y1: yy, y2: yy, class: g ? 'cv-grid' : 'cv-base' }, svg);
      var t = el('text', { x: L - 6, y: yy + 4, 'text-anchor': 'end', class: 'cv-ax' }, svg); t.textContent = soGon(top * g / 4);
    }
    var o_ = (W - L - Rr) / n, bw = Math.min(24, o_ - 2);
    var buoc = Math.ceil(n / Math.max(2, Math.floor((W - L) / 56)));
    o.nhan.forEach(function (lb, i) {
      var cx = L + o_ * i + o_ / 2, acc = 0;
      var nhom = el('g', { tabindex: 0, class: 'cv-col' }, svg);
      o.chuoi.forEach(function (c, ci) {
        var v = c.gt[i]; if (!v) return;
        var y1 = y(acc + v), y0 = y(acc), hgt = Math.max(0, y0 - y1 - (ci ? 2 : 0));
        var laDinh = o.chuoi.slice(ci + 1).every(function (cc) { return !cc.gt[i]; });
        var r = el('path', { d: hcn(cx - bw / 2, y1, bw, hgt, laDinh ? Math.min(4, hgt / 2) : 0) }, nhom); r.style.fill = c.mau;
        acc += v;
      });
      el('rect', { x: L + o_ * i, y: T, width: o_, height: H - T - B, fill: 'transparent' }, nhom);
      if (!(i % buoc) || i === n - 1) { var t = el('text', { x: cx, y: H - 6, 'text-anchor': 'middle', class: 'cv-ax' }, svg); t.textContent = lb; }
      function len(ev) { moTip(ev.clientX, ev.clientY, (o.nhanDai || o.nhan)[i], o.chuoi.slice().reverse().map(function (c) { return { mau: c.mau, ten: c.ten, gt: (o.dinhDang || soGon)(c.gt[i]) }; })); }
      nhom.addEventListener('pointermove', len);
      nhom.addEventListener('pointerleave', dongTip);
    });
  };
  // hình chữ nhật bo góc trên (đầu dữ liệu), vuông ở chân
  function hcn(x, y, w, hh, r) {
    if (!r) return 'M' + x + ' ' + (y + hh) + 'V' + y + 'H' + (x + w) + 'V' + (y + hh) + 'Z';
    return 'M' + x + ' ' + (y + hh) + 'V' + (y + r) + 'Q' + x + ' ' + y + ' ' + (x + r) + ' ' + y + 'H' + (x + w - r) + 'Q' + (x + w) + ' ' + y + ' ' + (x + w) + ' ' + (y + r) + 'V' + (y + hh) + 'Z';
  }

  // ── Thanh 100% (tỉ trọng, ≤ 5 phần) ───────────────────────────────────────
  C.tiTrong = function (cha, o) {
    cha.textContent = '';
    var tong = o.phan.reduce(function (s, p) { return s + p.gt; }, 0) || 1;
    var thanh = h('div', 'cv-share', cha);
    o.phan.forEach(function (p) {
      var w = p.gt / tong * 100;
      var s = h('i', '', thanh); s.style.width = w + '%'; s.style.background = p.mau; s.tabIndex = 0;
      if (w > 9) { var t = h('span', '', s, Math.round(w) + '%'); t.style.color = p.chuToi ? '#0b0b0b' : '#fff'; }
      s.addEventListener('pointermove', function (ev) { moTip(ev.clientX, ev.clientY, p.ten, [{ mau: p.mau, ten: Math.round(w) + '% tổng', gt: (o.dinhDang || soGon)(p.gt) }]); });
      s.addEventListener('pointerleave', dongTip);
    });
    var lg = h('div', 'cv-legend', cha);
    o.phan.forEach(function (p) { var i = h('span', '', lg); var k = h('i', 'cv-key', i); k.style.background = p.mau; i.appendChild(document.createTextNode(p.ten + ' · ' + Math.round(p.gt / tong * 100) + '%')); });
  };

  // ── Đường nhỏ trong ô số liệu ─────────────────────────────────────────────
  C.spark = function (gt, mau) {
    var W = 120, H = 32, n = gt.length, mx = Math.max.apply(null, gt), mn = Math.min.apply(null, gt), rg = mx - mn || 1;
    var pts = gt.map(function (v, i) { return (i / (n - 1) * (W - 6) + 3).toFixed(1) + ',' + (H - 4 - (v - mn) / rg * (H - 8)).toFixed(1); });
    var last = pts[n - 1].split(',');
    return '<svg class="cv-spark" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" aria-hidden="true"><polyline points="' + pts.join(' ') + '" fill="none" stroke="var(--muted)" stroke-width="1.5" stroke-linejoin="round"/><circle cx="' + last[0] + '" cy="' + last[1] + '" r="3.5" fill="' + (mau || 'var(--s1)') + '"/></svg>';
  };

  window.ABZ.C = C;
})();
