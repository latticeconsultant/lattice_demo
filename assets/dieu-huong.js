/* Nút điều hướng chung cho mọi trang con của lattice.business (anh chốt 29/10/2026):
     ←  quay lại trang vừa xem; mở thẳng (không có trang trước trong site) thì về trang chủ
     ✕  đóng trang: trang mở ở tab mới thì đóng tab, còn lại về trang chủ
   Gắn bằng một dòng trong <head>:  <script src="../assets/dieu-huong.js" defer></script>
   Nút ← đặt đầu thanh đầu trang, nút ✕ đặt cuối. Thanh đầu trang tìm theo thứ tự:
   [data-dh] → header.top .khung → header.top → header .head → header → nav.ve;
   không có (hoặc <html data-dh-noi>) thì hai nút nổi ở góc trên bên phải. Trang chủ theo ngôn ngữ của <html lang>. */
(function () {
  if (window.__lnxDieuHuong) return;
  window.__lnxDieuHuong = true;

  var lang = (document.documentElement.lang || 'vi').slice(0, 2);
  var CHU = {
    vi: { lai: 'Quay lại trang trước', dong: 'Đóng trang, về trang chủ', nhom: 'Điều hướng' },
    en: { lai: 'Back to previous page', dong: 'Close page, go to home', nhom: 'Navigation' },
    lo: { lai: 'ກັບຄືນໜ້າກ່ອນ', dong: 'ປິດໜ້າ, ກັບໜ້າຫຼັກ', nhom: 'ການນຳທາງ' }
  }[lang] || null;
  if (!CHU) { lang = 'vi'; CHU = { lai: 'Quay lại trang trước', dong: 'Đóng trang, về trang chủ', nhom: 'Điều hướng' }; }
  var TRANG_CHU = lang === 'en' ? '/en/' : lang === 'lo' ? '/lo/' : '/';

  var css = '.lnx-dh{flex:none;width:34px;height:34px;padding:0;margin:0;border-radius:50%;display:inline-grid;place-items:center;' +
    'background:transparent;color:inherit;border:1.5px solid currentColor;cursor:pointer;opacity:.78;font:inherit;line-height:0}' +
    '.lnx-dh:hover,.lnx-dh:focus-visible{opacity:1}' +
    '.lnx-dh svg{display:block;width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}' +
    '.lnx-dh-an{display:none!important}.lnx-dh-lai{margin-right:10px}.lnx-dh-dong{margin-left:10px}' +
    '.lnx-dh-noi{position:fixed;top:12px;right:12px;z-index:9999;display:flex;gap:8px}' +
    '.lnx-dh-noi .lnx-dh{background:var(--bg,#fff);margin:0}' +
    '@media (max-width:520px){.lnx-dh{width:30px;height:30px}.lnx-dh svg{width:14px;height:14px}.lnx-dh-lai{margin-right:4px}.lnx-dh-dong{margin-left:4px}}' +
    '@media print{.lnx-dh,.lnx-dh-noi{display:none!important}}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  function nut(lop, nhan, duong, lam) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'lnx-dh ' + lop;
    b.setAttribute('aria-label', nhan);
    b.title = nhan;
    b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + duong + '"/></svg>';
    b.addEventListener('click', lam);
    return b;
  }

  // Có trang trước trong cùng site thì lùi lại; còn không (mở thẳng, đến từ Google…) thì về trang chủ.
  function quayLai() {
    var cungSite = document.referrer && document.referrer.indexOf(location.origin) === 0;
    if (cungSite && history.length > 1) history.back();
    else location.href = TRANG_CHU;
  }

  // Tab do trang khác mở ra (target=_blank) thì đóng được; trình duyệt chặn đóng thì về trang chủ.
  function dong() {
    if (window.opener) {
      window.close();
      setTimeout(function () { location.href = TRANG_CHU; }, 150);
    } else {
      location.href = TRANG_CHU;
    }
  }

  function gan() {
    var lai = nut('lnx-dh-lai', CHU.lai, 'M15 5l-7 7 7 7', quayLai);
    var dg = nut('lnx-dh-dong', CHU.dong, 'M6 6l12 12M18 6L6 18', dong);
    // <html data-dh-noi>: trang ứng dụng tự vẽ lại thanh đầu (LATTICE Work) → luôn dùng nút nổi.
    var cho = document.documentElement.hasAttribute('data-dh-noi') ? null : document.querySelector('[data-dh]') || document.querySelector('header.top .khung') ||
      document.querySelector('header.top') || document.querySelector('header .head') ||
      document.querySelector('header') || document.querySelector('nav.ve');
    if (cho) {
      cho.insertBefore(lai, cho.firstChild);
      cho.appendChild(dg);
      // Thanh đầu xuống dòng (màn hẹp) làm ✕ rơi xuống hàng dưới: chuyển ✕ lên cuối hàng của ←;
      // hàng đó vẫn chật thì đặt ✕ nổi sát lề phải, ngang hàng với ←.
      var canh = function () {
        cho.appendChild(dg);
        dg.style.position = dg.style.top = dg.style.right = '';
        var an = cho.querySelectorAll('.lnx-dh-an');
        for (var n = 0; n < an.length; n++) an[n].classList.remove('lnx-dh-an');
        var ngang = function () {
          var a = lai.getBoundingClientRect(), b = dg.getBoundingClientRect();
          return Math.abs(a.top - b.top) < 8 && b.right <= document.documentElement.clientWidth;
        };
        if (ngang()) return;
        var top = lai.getBoundingClientRect().top, cuoi = null;
        for (var k = 0; k < cho.children.length; k++) {
          var c = cho.children[k];
          if (c !== dg && c.getBoundingClientRect().height && Math.abs(c.getBoundingClientRect().top - top) < 24) cuoi = c;
        }
        if (cuoi && cuoi !== lai) {
          cho.insertBefore(dg, cuoi.nextSibling);
          if (ngang()) return;
          // Còn chật: ẩn dòng phụ đề nhỏ cạnh logo (<small>) để nhường chỗ cho ✕.
          var phu = cho.querySelectorAll('small');
          for (var m = 0; m < phu.length; m++) phu[m].classList.add('lnx-dh-an');
          if (ngang()) return;
          for (m = 0; m < phu.length; m++) phu[m].classList.remove('lnx-dh-an');
        }
        cho.appendChild(dg);
        var a = lai.getBoundingClientRect(), h = cho.getBoundingClientRect();
        if (getComputedStyle(cho).position === 'static') cho.style.position = 'relative';
        dg.style.position = 'absolute';
        dg.style.top = (a.top - h.top) + 'px';
        dg.style.right = Math.max(0, h.right - document.documentElement.clientWidth + 12) + 'px';
      };
      canh();
      addEventListener('resize', canh);
    } else {
      var noi = document.createElement('div');
      noi.className = 'lnx-dh-noi';
      noi.setAttribute('role', 'group');
      noi.setAttribute('aria-label', CHU.nhom);
      noi.appendChild(lai);
      noi.appendChild(dg);
      document.body.appendChild(noi);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', gan);
  else gan();
})();
