/* LATTICE Work — bản mẫu · GIAO DIỆN v3
 * Kiểu ứng dụng nhắn tin (Zalo) + thẻ có menu ngữ cảnh (tham khảo app.anwell.group).
 * Mọi đối tượng — việc, tin nhắn, agent, người, luồng — có nút "···", nhấn giữ (điện thoại)
 * hoặc chuột phải (laptop) để mở menu hành động. Hành động bị luật chặn vẫn hiện, nhưng mờ
 * và ghi lý do. Chỉ hiển thị và gọi LW.* (data.js); luật thật nằm ở data.js.
 */
(function () {
  'use strict';

  var DB = LW.load();
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function put(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { /* bỏ qua */ } }

  var S = {
    uid: get('lw.session'), lang: get('lw.lang') || 'vi',
    tab: 'home', sub: null, task: null, anim: false,
    conv: null, chatOpen: false, chatF: 'all', q: '',
    col: 'cho_duyet', f: { pr: '', kind: '', mine: false },
    flow: 'f1', ledgerPr: null, hl: null, menu: null, help: null, hlog: {}
  };
  if (S.uid && !LW.person(S.uid)) S.uid = null;

  /* ---------- tiện ích ---------- */
  function me() { return S.uid ? LW.person(S.uid) : null; }
  function t(k) {
    var e = window.I18N[k], s = e ? (S.lang === 'en' ? e[1] : e[0]) : k;
    for (var i = 1; i < arguments.length; i++) s = s.split('{' + (i - 1) + '}').join(arguments[i]);
    return s;
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function z(n) { return String(n).padStart(2, '0'); }
  function fmtAt(iso) { var d = new Date(iso); return z(d.getDate()) + '/' + z(d.getMonth() + 1) + ' ' + z(d.getHours()) + ':' + z(d.getMinutes()); }
  function fmtShort(iso) {
    if (!iso) return '';
    var d = new Date(iso), n = new Date();
    return d.toDateString() === n.toDateString() ? z(d.getHours()) + ':' + z(d.getMinutes()) : z(d.getDate()) + '/' + z(d.getMonth() + 1);
  }
  function fmtDate(s) { if (!s) return '—'; var p = s.split('-'); return p[2] + '/' + p[1]; }
  function overdue(x) { return x.st !== 'xong' && x.due && x.due < LW.today(); }
  function opt(v, label, cur) { return '<option value="' + esc(v) + '"' + (String(cur) === String(v) ? ' selected' : '') + '>' + esc(label) + '</option>'; }
  function shortName(id) { if (LW.isAgentId(id)) return id; var p = LW.person(id); return p ? p.n.split(' ').slice(-1)[0] : '—'; }
  function name(id) { return LW.actorName(id); }
  function stName(s) { return t('st.' + s); }
  function roleName(r) { return t('role.' + r); }
  function narrow() { return window.innerWidth < 760; }
  function clip(s, n) { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s; }
  function lastResult(x) { for (var i = x.thr.length - 1; i >= 0; i--) if (x.thr[i].k === 'result') return x.thr[i]; return null; }

  var MARK = '<svg class="mk" viewBox="0 0 100 100" aria-hidden="true"><path d="M50 8 L92 50 L50 92 L8 50 Z M50 8 L50 92 M8 50 L92 50" fill="none" stroke="currentColor" stroke-width="5" opacity=".35"/><circle cx="50" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="5"/><circle cx="92" cy="50" r="6" fill="none" stroke="currentColor" stroke-width="5"/><circle cx="50" cy="92" r="6" fill="none" stroke="currentColor" stroke-width="5"/><circle cx="8" cy="50" r="6" fill="none" stroke="currentColor" stroke-width="5"/><circle cx="50" cy="50" r="10" fill="#EC3013"/></svg>';

  var ICON = {
    home: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    tasks: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 7.5v7M12 7.5v4M16 7.5v9"/>',
    chat: '<path d="M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3.5 20.5l1.4-4.6A8.5 8.5 0 1 1 21 11.5Z"/>',
    apps: '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    more: '<circle cx="5" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="19" cy="12" r="1.3" fill="currentColor"/>',
    back: '<path d="m15 18-6-6 6-6"/>',
    chev: '<path d="m9 18 6-6-6-6"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    approve: '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 3 3 5-6"/>',
    undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
    play: '<path d="M7 4.5v15l12-7.5Z"/>',
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    users: '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M16 3.5a4 4 0 0 1 0 8M22 21a7 7 0 0 0-4-6.3"/>',
    bot: '<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 8V4.5M9 14h.01M15 14h.01"/><circle cx="12" cy="3.5" r="1"/>',
    flow: '<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="12" r="2.5"/><path d="M6 8.5v7M8.3 7.2l7.5 3.8M8.3 16.8l7.5-3.8"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5Z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/>',
    log: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-2.6-6.4L21 8"/><path d="M21 3v5h-5"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    pin: '<path d="M12 17v5M9 10.8V3h6v7.8l3 3.2H6Z"/>',
    reply: '<path d="m9 17-5-5 5-5"/><path d="M4 12h11a5 5 0 0 1 5 5v2"/>',
    hash: '<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
    flag: '<path d="M4 22V4M4 4h13l-2 4 2 4H4"/>',
    coin: '<circle cx="12" cy="12" r="9"/><path d="M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .9-3 2s1.3 1.8 3 2 3 .9 3 2-1.3 2-3 2c-1.4 0-2.5-.5-3-1.5M12 6v2M12 16v2"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>',
    note: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    help: '<path d="M20.5 11.5a8.5 8.5 0 0 1-12.3 7.6L3.5 20.5l1.4-4.6A8.5 8.5 0 1 1 20.5 11.5Z"/><path d="M12 7.2l1.05 2.75L15.8 11l-2.75 1.05L12 14.8l-1.05-2.75L8.2 11l2.75-1.05Z" fill="currentColor" stroke="none"/>',
    spark: '<path d="M12 3.5 13.9 9l5.6 1.9-5.6 1.9L12 18.5l-1.9-5.7L4.5 11l5.6-2Z"/><path d="M19 3v3M17.5 4.5h3"/>'
  };
  function helpBtn(ctx, obj, cls) {
    return '<button class="ib help-ic ' + (cls || '') + '" data-act="help" data-h="' + ctx + '"' + (obj ? ' data-o="' + esc(obj) + '"' : '') + ' aria-label="' + t('h.help') + '" title="' + t('h.helpTip') + '">' + ic('help') + '</button>';
  }
  function ic(n, cls) { return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + (ICON[n] || '') + '</svg>'; }
  function ib(icon, act, attrs, label, badge, cls) {
    return '<button class="ib ' + (cls || '') + '" data-act="' + act + '" ' + (attrs || '') + ' aria-label="' + esc(label) + '" title="' + esc(label) + '">' + ic(icon) + (badge ? '<i class="bdg">' + badge + '</i>' : '') + '</button>';
  }
  function moreBtn(key, cls) { return '<button class="ib more ' + (cls || '') + '" data-act="ctx" data-ctx="' + key + '" aria-label="' + t('actions') + '" title="' + t('actions') + '">' + ic('more') + '</button>'; }

  function avatar(id, cls) {
    cls = cls || '';
    if (LW.isAgentId(id)) { var a = LW.agent(id); return '<span class="av ag ' + cls + '" title="' + esc(a ? a.id + ' ' + a.n : id) + '">' + esc(id) + '</span>'; }
    var p = LW.person(id);
    if (!p) return '<span class="av none ' + cls + '"></span>';
    return p.av ? '<img class="av ' + cls + '" src="' + p.av + '" alt="" title="' + esc(p.n) + '">' : '<span class="av ' + cls + '" title="' + esc(p.n) + '">' + esc(p.ini) + '</span>';
  }
  function chanAvatar(cls) { return '<span class="av ch ' + (cls || '') + '">' + ic('hash') + '</span>'; }

  function toast(msg, bad) {
    var el = document.getElementById('toast');
    el.textContent = msg; el.className = 'toast show' + (bad ? ' bad' : '');
    clearTimeout(toast.h); toast.h = setTimeout(function () { el.className = 'toast'; }, bad ? 5000 : 2300);
  }
  function fail(e) {
    if (e && e.code) toast(t('err.' + e.code) + (e.extra ? ' — ' + e.extra : ''), true);
    else { toast(String(e && e.message || e), true); if (window.console) console.error(e); }
  }
  function guard(fn) { try { fn(); return true; } catch (e) { fail(e); return false; } }

  function modal(title, body, wide, help, helpObj) {
    closeMenu();
    var m = document.getElementById('modal');
    m.innerHTML = '<div class="scrim" data-act="modal-x"></div><div class="dlg' + (wide ? ' wide' : '') + '" role="dialog" aria-modal="true" aria-label="' + esc(title) + '"><div class="grab"></div><div class="dlg-h"><h3>' + esc(title) + '</h3><span class="sp"></span>' + (help ? helpBtn(help, helpObj) : '') + ib('close', 'modal-x', '', t('close')) + '</div><div class="dlg-b">' + body + '</div></div>';
    m.hidden = false;
    document.body.classList.add('locked');
    var f = m.querySelector('.dlg-b input:not([type=hidden]):not([readonly]):not([type=checkbox]),.dlg-b textarea'); if (f && !narrow()) f.focus();
  }
  function closeModal() { var m = document.getElementById('modal'); m.hidden = true; m.innerHTML = ''; syncLock(); }
  function syncLock() { document.body.classList.toggle('locked', !!S.task || !document.getElementById('modal').hidden || !!S.menu || (narrow() && (!!S.help || (S.tab === 'chat' && S.chatOpen)))); }

  function formData(fm) {
    var o = {};
    Array.prototype.forEach.call(fm.elements, function (el) {
      if (!el.name || el.matches(':disabled')) return;
      if (el.type === 'checkbox') {
        if (el.value && el.value !== 'on') { (o[el.name] = o[el.name] || []); if (el.checked) o[el.name].push(el.value); }
        else o[el.name] = el.checked;
      } else o[el.name] = el.value;
    });
    return o;
  }

  /* ============================================================
     MENU NGỮ CẢNH — tấm trượt trên điện thoại, bảng nổi trên laptop
     ============================================================ */
  function openMenu(spec, anchor, point) {
    S.menu = spec;
    var root = document.getElementById('ctx'), sheet = narrow();
    var head = spec.title ? '<div class="m-head">' + (spec.lead || '') + '<div class="m-ht">' + (spec.eyebrow ? '<small>' + esc(spec.eyebrow) + '</small>' : '') + '<b>' + esc(spec.title) + '</b>' + (spec.sub ? '<span>' + esc(spec.sub) + '</span>' : '') + '</div></div>' : '';
    var list = spec.items.map(function (it, i) {
      if (it.sep) return '<div class="m-sep">' + (it.label ? esc(it.label) : '') + '</div>';
      var sub = it.disabled ? it.reason : it.sub;
      return '<button class="m-i' + (it.danger ? ' danger' : '') + (it.primary ? ' primary' : '') + (it.disabled ? ' off' : '') + '" ' + (it.disabled ? 'aria-disabled="true" data-mi-off="' + i + '"' : 'data-mi="' + i + '"') + '>' +
        '<span class="m-ic">' + ic(it.disabled ? (it.lockIcon === false ? it.icon : 'lock') : it.icon) + '</span>' +
        '<span class="m-t"><b>' + esc(it.label) + '</b>' + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</span>' +
        (it.check ? ic('check', 'm-ck') : (it.chev ? ic('chev', 'm-ch') : '')) + '</button>';
    }).join('');
    root.innerHTML = '<div class="m-scrim" data-close="1"></div><div class="menu ' + (sheet ? 'sheet' : 'pop') + '" role="menu">' +
      (sheet ? '<div class="grab"></div>' : '') + head + '<div class="m-list">' + list + '</div>' +
      (sheet ? '<button class="m-close" data-close="1">' + t('close') + '</button>' : '') + '</div>';
    root.hidden = false;
    syncLock();
    if (!sheet) {
      var m = root.querySelector('.menu'), w = m.offsetWidth, h = m.offsetHeight, vw = window.innerWidth, vh = window.innerHeight, x, y;
      if (point) { x = point.x; y = point.y; }
      else { var r = anchor.getBoundingClientRect(); x = r.right - w; y = r.bottom + 6; if (x < 8) x = r.left; }
      if (x + w > vw - 10) x = vw - w - 10;
      if (x < 10) x = 10;
      if (y + h > vh - 10) y = Math.max(10, (point ? point.y : anchor.getBoundingClientRect().top) - h - 6);
      m.style.left = x + 'px'; m.style.top = y + 'px';
    }
    var first = root.querySelector('[data-mi]'); if (first && !sheet) first.focus({ preventScroll: true });
  }
  function closeMenu() { var root = document.getElementById('ctx'); if (!root) return; root.hidden = true; root.innerHTML = ''; S.menu = null; syncLock(); }

  // Hành động bị chặn: vẫn hiện, ghi lý do lấy từ đúng luật trong data.js
  function item(icon, label, sub, run, o) { o = o || {}; return { icon: icon, label: label, sub: sub, run: run, disabled: !!o.off, reason: o.off || '', danger: o.danger, primary: o.primary, check: o.check, chev: o.chev }; }

  function taskMenu(x, u) {
    var touch = LW.mayTouch(x, u), agentTask = LW.isAgentId(x.as), guest = u.role === 'guest', items = [];
    var guestWhy = t('why.guest');
    items.push(item('eye', t('m.openTask'), t('m.openTaskS'), function () { openTask(x.id); render(); }, { chev: true }));
    if (x.st === 'cho_duyet') {
      var notOwner = x.own !== u.id ? t('why.onlyOwner', name(x.own)) : '';
      items.push(item('approve', t('approve'), t('m.approveS'), function () { doApprove(x.id); }, { off: notOwner, primary: true }));
      items.push(item('undo', t('ret.go'), t('m.returnS'), function () { returnForm(x.id); }, { off: notOwner }));
    }
    if (agentTask && x.st === 'dang_lam') {
      var a = LW.agent(x.as);
      items.push(item('play', t('run', a.id), t('runs', LW.runsToday(a), a.sc.limit) + ' · ' + ((a.sc.review || x.gate) ? t('willReview') : t('noReview')), function () { doRun(x.id); },
        { off: !LW.can('runAgent', u) ? (guest ? guestWhy : t('why.noRun')) : (LW.runsToday(a) >= a.sc.limit ? t('err.limitReached') : ''), primary: true }));
    }
    if (!agentTask && x.st === 'dang_lam' && x.as) {
      var why = !touch ? (guest ? guestWhy : t('why.notYours')) : '';
      items.push(item('check', t('markDone'), x.gate ? '' : t('m.doneS'), function () { doSt(x.id, 'xong'); }, { off: why || (x.gate ? t('why.gate') : ''), primary: !x.gate }));
      items.push(item('send', t('sendReview'), t('m.reviewS', name(x.own)), function () { doSt(x.id, 'cho_duyet'); }, { off: why, primary: !!x.gate }));
    }
    if (x.st === 'xong') items.push(item('refresh', t('reopen'), t('m.reopenS'), function () { doSt(x.id, 'dang_lam'); }, { off: (x.own === u.id || u.role === 'owner') ? '' : t('why.reopen', name(x.own)) }));
    items.push({ sep: true });
    items.push(item('user', x.st === 'cho_giao' ? t('assign') : t('m.reassign'), t('m.reassignS'), function () { openTask(x.id); render(); }, { off: touch ? '' : (guest ? guestWhy : t('why.notYours')), chev: true }));
    var r = lastResult(x);
    if (r) items.push(item('copy', t('m.copyResult'), t('m.copyResultS', name(r.by)), function () { copyText(r.t); }));
    if (x.src) items.push(item('link', t('m.gotoMsg'), t('m.gotoMsgS'), function () { gotoMsg(x.src); }, { chev: true }));
    items.push({ sep: true });
    items.push(item('help', t('h.aboutThis'), t('h.aboutThisS'), function () { openHelp('task', x.id); }, { chev: true }));
    items.push(item('trash', t('m.delete'), t('m.deleteS'), function () { doDelete(x.id); }, { off: u.role === 'owner' ? '' : t('why.onlyOwnerRole'), danger: true }));
    return {
      eyebrow: x.pr + ' · ' + stName(x.st) + (overdue(x) ? ' · ' + t('late') : ''), title: x.ttl,
      sub: (x.as ? t('m.byAs', name(x.as)) : t('unassigned')) + ' · ' + t('ownShort') + ' ' + name(x.own),
      lead: x.as ? avatar(x.as, 'md') : '<span class="av none md"></span>', items: items
    };
  }
  function msgMenu(m, u) {
    var c = LW.chan(m.ch), tk = m.task ? LW.task(m.task) : null, items = [];
    if (tk && LW.seeTask(tk, u)) items.push(item('eye', t('m.openLinked'), clip(tk.ttl, 60) + ' · ' + stName(tk.st), function () { openTask(tk.id); render(); }, { chev: true, primary: true }));
    else items.push(item('tasks', t('toTask'), t('m.toTaskS'), function () { newTaskFromMsg(m.id); },
      { off: m.task ? t('why.alreadyTask') : (!LW.can('create', u) ? t('why.guest') : ''), primary: true }));
    items.push(item('copy', t('copy'), t('m.copyMsgS'), function () { copyText(m.t); }));
    items.push(item('reply', t('m.reply'), '', null, { off: t('why.notBuilt') }));
    items.push(item('pin', t('m.pin'), '', null, { off: t('why.notBuilt') }));
    items.push(item('help', t('h.aboutThis'), t('h.aboutThisS'), function () { openHelp('conv', m.ch); }, { chev: true }));
    return { eyebrow: '#' + c.n + ' · ' + fmtAt(m.at), title: name(m.by), sub: clip(m.t, 120), lead: avatar(m.by, 'md'), items: items };
  }
  function dmMenu(agentId, idx, u) {
    var a = LW.agent(agentId), list = (DB.dms[a.id] || []).filter(function (x) { return x.u === u.id; }), msg = list[idx];
    if (!msg) return null;
    var items = [item('copy', t('copy'), t('m.copyMsgS'), function () { copyText(msg.c); })];
    if (msg.ctx) items.push(item('eye', t('th.ctx'), t('m.ctxS'), function () { modal(t('th.ctx'), '<pre class="ctxpre">' + esc(msg.ctx) + '</pre>', true); }, { chev: true }));
    if (msg.r === 'agent') items.push(item('tasks', t('m.answerToTask'), t('m.answerToTaskS'), function () { newTask({ ttl: t('m.followUp', a.id), note: msg.c }); }, { off: LW.can('create', u) ? '' : t('why.guest') }));
    return { eyebrow: a.id + ' · ' + fmtAt(msg.at), title: msg.r === 'agent' ? a.n : u.n, sub: clip(msg.c, 120), lead: avatar(msg.r === 'agent' ? a.id : u.id, 'md'), items: items };
  }
  function agentMenu(a, u) {
    var items = [];
    items.push(item('chat', t('m.askAgent'), t('m.askAgentS'), function () { openConv(a.id); }, { off: LW.seeDM(a, u) ? '' : t('why.dm', name(a.sc.own)), primary: true, chev: true }));
    items.push(item('tasks', t('m.assignAgent'), t('m.assignAgentS', name(a.sc.own)), function () { newTask({ as: a.id }); }, { off: LW.can('create', u) ? '' : t('why.guest') }));
    items.push(item('shield', t('m.scope'), t('m.scopeS'), function () { modal(a.id + ' · ' + a.n, agentForm(u, a), true, 'agentScope', a.id); }, { chev: true }));
    items.push(item('lock', t('probe.go'), t('m.probeS'), function () { modal(a.id + ' · ' + a.n, agentForm(u, a), true, 'agentScope', a.id); setTimeout(function () { var b = document.querySelector('[data-act=probe]'); if (b) b.click(); var o = document.getElementById('probe-out'); if (o) o.scrollIntoView({ block: 'nearest' }); }, 60); }, { lockIcon: false }));
    items.push(item('help', t('h.aboutThis'), t('h.aboutThisS'), function () { openHelp('agentScope', a.id); }, { chev: true }));
    return { eyebrow: t('m.agentEyebrow', a.id), title: a.n, sub: a.r + ' · ' + t('ownShort') + ' ' + name(a.sc.own), lead: avatar(a.id, 'md'), items: items };
  }
  function personMenu(p, u) {
    var items = [];
    if (p.id === u.id) items.push(item('user', t('team.myProfile'), t('m.profileS'), function () { modal(t('team.myProfile'), profileForm(u), true, 'people'); }, { chev: true, primary: true }));
    items.push(item('mail', t('m.email'), p.mail, function () { location.href = 'mailto:' + p.mail; }, { off: LW.seeContacts(u) ? '' : t('why.guestContacts') }));
    items.push(item('tasks', t('m.personTasks'), t('m.personTasksS', LW.openLoad(p.id), p.cap), function () { S.tab = 'tasks'; S.sub = null; S.f = { pr: '', kind: '', mine: false, who: p.id }; render(); scrollTop(); }, { chev: true }));
    items.push(item('edit', t('team.editRole'), t('m.roleS'), function () { modal(p.n, personForm(p), false, 'people'); }, { off: LW.can('admin', u) ? '' : t('why.onlyOwnerRole') }));
    items.push(item('help', t('h.aboutThis'), t('h.aboutThisS'), function () { openHelp('people'); }, { chev: true }));
    return { eyebrow: roleName(p.role), title: p.n, sub: p.r, lead: avatar(p.id, 'md'), items: items };
  }
  function convMenu(id, u) {
    if (LW.isAgentId(id)) return agentMenu(LW.agent(id), u);
    var c = LW.chan(id), items = [];
    items.push(item('users', t('members'), c.mem.map(function (x) { return shortName(x); }).join(', '), function () { modal('#' + c.n, chanForm(u, c), false, 'conv', c.id); }, { off: LW.can('admin', u) ? '' : t('why.onlyOwnerMembers'), chev: true }));
    items.push(item('tasks', t('m.chanTask'), t('m.chanTaskS'), function () { newTask({ pr: projOfChan(c.id) }); }, { off: LW.can('create', u) ? '' : t('why.guest') }));
    items.push(item('bell', t('m.mute'), '', null, { off: t('why.notBuilt') }));
    items.push(item('help', t('h.aboutThis'), t('h.aboutThisS'), function () { openHelp('conv', c.id); }, { chev: true }));
    return { eyebrow: t('m.chanEyebrow', c.mem.length), title: '#' + c.n, sub: c.d, lead: chanAvatar('md'), items: items };
  }
  function flowMenu(f, u) {
    return {
      eyebrow: t('m.flowEyebrow', f.steps.length), title: f.n, sub: f.d, lead: '<span class="av tile md">' + ic('flow') + '</span>',
      items: [
        item('play', t('flow.launch'), t('m.launchS'), function () { modal(t('flow.launch') + ' · ' + f.n, launchForm(u, f), true, 'flows'); }, { off: LW.can('launchFlow', u) ? '' : t('flow.noLaunch'), primary: true }),
        item('eye', t('m.viewSteps'), '', function () { S.tab = 'apps'; S.sub = 'flows'; S.flow = f.id; render(); scrollTop(); }, { chev: true }),
        item('edit', t('m.editFlow'), '', null, { off: t('flow.noEditor') }),
        item('help', t('h.aboutThis'), t('h.aboutThisS'), function () { openHelp('flows'); }, { chev: true })
      ]
    };
  }
  function createMenu(u) {
    var items = [
      item('tasks', t('newTask'), t('m.newTaskS'), function () { newTask({}); }, { off: LW.can('create', u) ? '' : t('why.guest'), primary: true }),
      item('chat', t('m.newMsg'), t('m.newMsgS'), function () { S.tab = 'chat'; S.sub = null; S.chatF = 'chan'; render(); }, { chev: true }),
      item('bot', t('m.askAgent'), t('m.askAgentS'), function () { S.tab = 'chat'; S.sub = null; S.chatF = 'agent'; render(); }, { off: LW.visibleAgentsForDM(u).length ? '' : t('why.noAgents'), chev: true }),
      item('flow', t('flow.launch'), t('m.launchS'), function () { var f = DB.flows[0]; modal(t('flow.launch') + ' · ' + f.n, launchForm(u, f), true, 'flows'); }, { off: LW.can('launchFlow', u) ? '' : t('flow.noLaunch') }),
      { sep: true },
      item('book', t('ledger.add'), t('m.ledgerS'), function () { openSub('ledger'); }, { off: LW.can('approve', u) ? '' : t('ledger.ro'), chev: true }),
      item('user', t('team.addPerson'), '', function () { modal(t('team.addPerson'), personForm(null), false, 'people'); }, { off: LW.can('admin', u) ? '' : t('why.onlyOwnerRole') }),
      item('bot', t('team.addAgent'), '', function () { modal(t('team.addAgent'), agentForm(u, null), true, 'agentScope'); }, { off: LW.can('admin', u) ? '' : t('why.onlyOwnerRole') })
    ];
    return { eyebrow: t('m.createEyebrow'), title: t('m.createTitle'), sub: '', lead: '<span class="av tile red md">' + ic('plus') + '</span>', items: items };
  }
  function accountMenu(u) {
    return {
      eyebrow: roleName(u.role), title: u.n, sub: u.mail, lead: avatar(u.id, 'md'),
      items: [
        item('user', t('team.myProfile'), t('m.profileS'), function () { modal(t('team.myProfile'), profileForm(u), true, 'people'); }, { chev: true }),
        item('globe', S.lang === 'vi' ? 'English' : 'Tiếng Việt', t('m.langS'), function () { setLang(); }),
        item('help', t('h.center'), t('h.centerS'), function () { openHelp('overview'); }, { chev: true, primary: true }),
        item('info', t('about.title'), '', function () { modal(t('about.title'), '<div class="about">' + t('about.body') + '</div>', true, 'overview'); }, { chev: true }),
        item('refresh', t('reset'), t('m.resetS'), function () { doReset(); }),
        { sep: true },
        item('logout', t('logout'), '', function () { doLogout(); }, { danger: true })
      ]
    };
  }
  function filterMenu(u) {
    var items = [{ sep: true, label: t('project') }, item('folder', t('allProjects'), '', function () { S.f.pr = ''; render(); }, { check: !S.f.pr })];
    LW.projsOf(u).forEach(function (p) { items.push(item('folder', p + ' · ' + LW.project(p).n, '', function () { S.f.pr = p; render(); }, { check: S.f.pr === p })); });
    items.push({ sep: true, label: t('assignee') });
    [['', 'kind.all', 'users'], ['nguoi', 'kind.people', 'user'], ['agent', 'kind.agents', 'bot']].forEach(function (k) { items.push(item(k[2], t(k[1]), '', function () { S.f.kind = k[0]; render(); }, { check: S.f.kind === k[0] })); });
    items.push({ sep: true });
    items.push(item('user', t('mineOnly'), t('m.mineS'), function () { S.f.mine = !S.f.mine; S.f.who = ''; render(); }, { check: S.f.mine }));
    return { eyebrow: t('tab.tasks'), title: t('m.filterTitle'), sub: '', lead: '<span class="av tile md">' + ic('filter') + '</span>', items: items };
  }

  function ctxFor(key, u) {
    var p = key.split(':'), x;
    if (p[0] === 'task') { x = LW.task(p[1]); return x && LW.seeTask(x, u) ? taskMenu(x, u) : null; }
    if (p[0] === 'msg') { x = DB.msgs.find(function (m) { return m.id === p[1]; }); return x ? msgMenu(x, u) : null; }
    if (p[0] === 'dm') return dmMenu(p[1], +p[2], u);
    if (p[0] === 'agent') return agentMenu(LW.agent(p[1]), u);
    if (p[0] === 'person') return personMenu(LW.person(p[1]), u);
    if (p[0] === 'conv') return convMenu(p[1], u);
    if (p[0] === 'flow') return flowMenu(DB.flows.find(function (f) { return f.id === p[1]; }), u);
    if (p[0] === 'create') return createMenu(u);
    if (p[0] === 'account') return accountMenu(u);
    if (p[0] === 'filter') return filterMenu(u);
    return null;
  }

  /* ============================================================
     KHUNG
     ============================================================ */
  var TABS = ['home', 'tasks', 'chat', 'apps'];
  function needCount(u) { return LW.visibleTasks(u).filter(function (x) { return x.st === 'cho_duyet' && x.own === u.id; }).length; }
  function scrollTop() { window.scrollTo(0, 0); var s = document.querySelector('.stage'); if (s) s.scrollTop = 0; }

  function render() {
    var u = me(), app = document.getElementById('app');
    document.documentElement.lang = S.lang;
    if (!u) { closeMenu(); app.innerHTML = viewLogin(); syncLock(); return; }
    var n = needCount(u);
    var y = window.scrollY, pg = document.querySelector('.page-b'), py = pg ? pg.scrollTop : 0, pid = pg ? pg.dataset.id : null;

    var rail = '<nav class="rail" aria-label="' + t('nav') + '"><div class="r-logo">' + MARK + '</div>' +
      (LW.can('create', u) ? '<button class="r-new" data-act="ctx" data-ctx="create" aria-label="' + t('m.createTitle') + '" title="' + t('m.createTitle') + ' (N)">' + ic('plus') + '</button>' : '') +
      TABS.map(function (k) {
        return '<button class="r-i' + (S.tab === k ? ' on' : '') + '" data-act="tab" data-id="' + k + '" title="' + t('tab.' + k) + '">' + ic(k) + '<span>' + t('tabShort.' + k) + '</span>' + (k === 'home' && n ? '<i class="bdg">' + n + '</i>' : '') + '</button>';
      }).join('') +
      '<span class="sp"></span><button class="r-lang" data-act="lang" title="VI / EN">' + (S.lang === 'vi' ? 'EN' : 'VI') + '</button>' +
      '<button class="r-me" data-act="ctx" data-ctx="account" aria-label="' + t('menu') + '">' + avatar(u.id, 'sm') + '</button></nav>';

    var tabbar = '<nav class="tabbar" aria-label="' + t('nav') + '">' +
      tabBtn('home', n) + tabBtn('tasks') +
      '<button class="tb-new" data-act="ctx" data-ctx="create" aria-label="' + t('m.createTitle') + '">' + ic('plus') + '</button>' +
      tabBtn('chat') + tabBtn('apps') + '</nav>';

    app.innerHTML = '<div class="app' + (S.tab === 'chat' ? ' is-chat' : '') + (S.tab === 'chat' && S.chatOpen ? ' conv-open' : '') + '">' + rail +
      '<main class="stage">' + VIEWS[S.tab](u) + '</main>' + tabbar + '</div>' + (S.task ? viewTask(u) : '');

    syncLock();
    window.scrollTo(0, y);
    var np = document.querySelector('.page-b'); if (np && np.dataset.id === pid) np.scrollTop = py;
    Array.prototype.forEach.call(app.querySelectorAll('.msgs'), function (m) { m.scrollTop = m.scrollHeight; });
    S.anim = false;
    if (S.help) renderHelp();
  }
  function tabBtn(k, n) {
    return '<button class="tbb' + (S.tab === k ? ' on' : '') + '" data-act="tab" data-id="' + k + '">' + ic(k) + '<span>' + t('tabShort.' + k) + '</span>' + (n ? '<i class="bdg">' + n + '</i>' : '') + '</button>';
  }
  function topbar(o) {
    return '<header class="topbar' + (o.cls ? ' ' + o.cls : '') + '">' +
      (o.back ? ib('back', o.back, o.backAttrs || '', t('back'), '', 'back') : '') +
      '<div class="tt">' + (o.eyebrow ? '<small>' + o.eyebrow + '</small>' : '') + '<h1>' + o.title + '</h1>' + (o.sub ? '<p>' + o.sub + '</p>' : '') + '</div>' +
      '<div class="ta">' + (o.help ? helpBtn(o.help, o.helpObj) : '') + (o.actions || '') + '</div></header>';
  }
  function accountBtn(u) { return '<button class="ib acct" data-act="ctx" data-ctx="account" aria-label="' + t('menu') + '">' + avatar(u.id, 'sm') + '</button>'; }
  function section(title, count, body, extra) {
    return '<section class="sec"><div class="sec-h"><h2>' + title + (count != null ? '<span class="cnt">' + count + '</span>' : '') + '</h2>' + (extra || '') + '</div>' + body + '</section>';
  }

  /* ---------- đăng nhập ---------- */
  function viewLogin() {
    return '<div class="auth"><section class="auth-art">' +
      '<div class="aa-brand">' + MARK + '<b>LATTICE</b><span>WORK</span><em>' + t('proto') + '</em></div>' +
      '<div class="aa-copy"><h1>' + t('auth.h') + '</h1><p>' + t('auth.p') + '</p>' +
      '<div class="aa-rules"><div><span class="av tile inv sm">' + ic('user') + '</span>' + t('auth.r1') + '</div><div><span class="av tile inv sm">' + ic('approve') + '</span>' + t('auth.r2') + '</div><div><span class="av tile red sm">' + ic('lock') + '</span>' + t('auth.r3') + '</div></div></div></section>' +
      '<section class="auth-form"><div class="af">' +
      '<div class="af-h"><small class="eyebrow">' + t('login.title') + '</small>' + helpBtn('login', '', 'sm') + '</div><h2>' + t('login.sub') + '</h2>' +
      '<form data-form="login" class="stack"><label class="fld">Email<input name="mail" type="email" autocomplete="username" required></label>' +
      '<label class="fld">' + t('login.pw') + '<input name="pw" type="password" autocomplete="current-password" required></label>' +
      '<button class="btn pri big">' + t('login.go') + '</button></form>' +
      '<div class="demo"><small class="eyebrow">' + t('login.demo') + '</small><div class="demo-g">' +
      DB.people.map(function (p) { return '<button class="demo-u" data-act="fill-login" data-mail="' + esc(p.mail) + '">' + avatar(p.id, 'sm') + '<span><b>' + esc(p.n) + '</b><small>' + roleName(p.role) + '</small></span></button>'; }).join('') +
      '</div></div><p class="fine">' + t('login.note', LW.DEMO_PW) + '</p>' +
      '<button class="link" data-act="lang">' + (S.lang === 'vi' ? 'English' : 'Tiếng Việt') + '</button></div></section></div>';
  }

  /* ============================================================
     01 · CẦN TÔI
     ============================================================ */
  function quickTile(icon, label, act, attrs, cls, badge) {
    return '<button class="qt" data-act="' + act + '" ' + (attrs || '') + '><span class="av tile ' + (cls || '') + '">' + ic(icon) + (badge ? '<i class="bdg">' + badge + '</i>' : '') + '</span><span>' + label + '</span></button>';
  }
  function taskRow(x, u, trailing) {
    return '<article class="row-i" data-ctx="task:' + x.id + '"><button class="ri-main" data-act="open-task" data-id="' + x.id + '">' +
      (x.as ? avatar(x.as, 'md') : '<span class="av none md"></span>') +
      '<span class="ri-t"><b>' + esc(x.ttl) + '</b><small><span class="code">' + esc(x.pr) + '</span> · ' + (x.as ? esc(name(x.as)) : t('unassigned')) + ' · <span class="' + (overdue(x) ? 'late' : '') + '">' + ic('clock', 'xs') + fmtDate(x.due) + '</span></small></span></button>' +
      '<div class="ri-a">' + (trailing || '') + moreBtn('task:' + x.id) + '</div></article>';
  }
  function viewHome(u) {
    var vis = LW.visibleTasks(u);
    var ap = vis.filter(function (x) { return x.st === 'cho_duyet' && x.own === u.id; });
    var mine = vis.filter(function (x) { return x.as === u.id && x.st === 'dang_lam'; });
    var run = LW.can('runAgent', u) ? vis.filter(function (x) { return LW.isAgentId(x.as) && x.own === u.id && x.st === 'dang_lam'; }) : [];
    var un = LW.can('assignOthers', u) ? vis.filter(function (x) { return x.st === 'cho_giao'; }) : [];
    var waiting = vis.filter(function (x) { return x.st === 'cho_duyet' && x.own !== u.id && (x.as === u.id || x.by === u.id); });
    var late = vis.filter(overdue);
    var myAgents = DB.agents.filter(function (a) { return a.sc.own === u.id; });
    var runs = myAgents.reduce(function (s, a) { return s + LW.runsToday(a); }, 0);
    var day = new Date().toLocaleDateString(S.lang === 'en' ? 'en-GB' : 'vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' });

    var h = topbar({ eyebrow: esc(day), title: t('need.hello', esc(u.n.split(' ').slice(-1)[0])), sub: ap.length ? t('home.subHot', ap.length) : t('home.subCalm'), help: 'home', actions: ib('bell', 'goto-review', '', t('kpi.approve'), ap.length || '', 'hide-d') + accountBtn(u), cls: 'hero' });

    var quick = '<div class="quick">' +
      (LW.can('create', u) ? quickTile('plus', t('newTask'), 'new-task', '', 'ink') : '') +
      quickTile('approve', t('q.review'), 'goto-review', '', 'red', ap.length || '') +
      (LW.visibleAgentsForDM(u).length ? quickTile('bot', t('q.ask'), 'goto-chat', 'data-f="agent"') : '') +
      quickTile('chat', t('tab.chat'), 'goto-chat', 'data-f="all"') +
      (u.role !== 'guest' ? quickTile('flow', t('q.flows'), 'open-sub', 'data-id="flows"') : '') +
      quickTile('book', 'Ledger', 'open-sub', 'data-id="ledger"') +
      (u.role !== 'guest' ? quickTile('users', t('q.team'), 'open-sub', 'data-id="people"') : '') +
      quickTile('apps', t('tab.apps'), 'tab', 'data-id="apps"') + '</div>';

    var stats = '<div class="stats">' +
      stat('approve', t('kpi.approve'), ap.length, '', ap.length ? 'hot' : '', 'goto-review') +
      stat('user', t('kpi.mine'), LW.openLoad(u.id), '/' + u.cap, '', 'goto-mine') +
      stat('clock', t('kpi.late'), late.length, '', late.length ? 'warn' : '', 'goto-late') +
      stat('bot', t('kpi.runs'), runs, '', '', 'open-sub', 'data-id="agents"') + '</div>';

    var main = '';
    main += ap.length ? section(t('need.approve'), ap.length, '<div class="acards">' + ap.map(function (x) { return approvalCard(x); }).join('') + '</div>', helpBtn('approve', '', 'sm')) : '';
    main += mine.length ? section(t('need.mine'), mine.length, '<div class="list">' + mine.map(function (x) {
      return taskRow(x, u, x.gate ? '<button class="chipbtn" data-act="st" data-st="cho_duyet" data-id="' + x.id + '">' + ic('send') + t('sendReview') + '</button>' : '<button class="chipbtn" data-act="st" data-st="xong" data-id="' + x.id + '">' + ic('check') + t('markDone') + '</button>');
    }).join('') + '</div>') : '';
    main += run.length ? section(t('need.run'), run.length, '<div class="list">' + run.map(function (x) {
      return taskRow(x, u, '<button class="chipbtn dark" data-act="run" data-id="' + x.id + '">' + ic('play') + t('run', x.as) + '</button>');
    }).join('') + '</div>') : '';
    main += un.length ? section(t('need.assign'), un.length, '<div class="list">' + un.map(function (x) { return taskRow(x, u, '<button class="chipbtn" data-act="open-task" data-id="' + x.id + '">' + ic('user') + t('assign') + '</button>'); }).join('') + '</div>') : '';
    main += waiting.length ? section(t('need.waiting'), waiting.length, '<div class="list">' + waiting.map(function (x) { return taskRow(x, u, '<span class="pill soft">' + t('waitFor', esc(shortName(x.own))) + '</span>'); }).join('') + '</div>') : '';
    if (!main) main = '<div class="empty">' + MARK + '<b>' + t('need.empty') + '</b><span>' + t('need.emptyS') + '</span></div>';

    var aside = '<aside class="aside">' +
      section(t('rail.late'), late.length, late.length ? '<div class="list">' + late.map(function (x) { return taskRow(x, u, ''); }).join('') + '</div>' : '<p class="fine pad">' + t('rail.noLate') + '</p>') +
      (myAgents.length ? section(t('rail.agents'), myAgents.length, '<div class="list">' + myAgents.map(function (a) {
        var pct = a.sc.limit ? Math.min(100, Math.round(LW.runsToday(a) / a.sc.limit * 100)) : 0;
        return '<article class="row-i" data-ctx="agent:' + a.id + '"><button class="ri-main" data-act="agent-open" data-id="' + a.id + '">' + avatar(a.id, 'md') + '<span class="ri-t"><b>' + esc(a.n) + '</b><small><span class="meter"><i style="width:' + pct + '%"></i></span>' + LW.runsToday(a) + '/' + a.sc.limit + '</small></span></button><div class="ri-a">' + moreBtn('agent:' + a.id) + '</div></article>';
      }).join('') + '</div>') : '') +
      '<div class="rule-card"><span class="av tile red sm">' + ic('shield') + '</span><b>' + t('rail.rule') + '</b><p>' + t('rail.ruleP') + '</p></div></aside>';

    var tip = get('lw.tipHelp') ? '' : '<div class="tipcard"><span class="av tile red md">' + ic('help') + '</span><div class="tc-b"><b>' + t('h.tipT') + '</b><p>' + t('h.tipB') + '</p><div class="row"><button class="btn pri sm" data-act="help" data-h="overview">' + ic('book') + t('h.tipGo') + '</button><button class="btn sm" data-act="tip-x">' + t('h.tipX') + '</button></div></div></div>';
    return '<div class="view home">' + h + tip + quick + stats + '<div class="home-g"><div>' + main + '</div>' + aside + '</div></div>';
  }
  function stat(icon, label, num, small, cls, act, attrs) {
    return '<button class="stat ' + (cls || '') + '" data-act="' + act + '" ' + (attrs || '') + '><span class="st-ic">' + ic(icon) + '</span><b>' + num + (small ? '<small>' + small + '</small>' : '') + '</b><span>' + label + '</span></button>';
  }
  function approvalCard(x) {
    var r = lastResult(x);
    return '<article class="acard" data-ctx="task:' + x.id + '">' +
      '<div class="ac-h">' + (x.as ? avatar(x.as, 'md') : '') + '<div class="ac-w"><b>' + esc(x.as ? name(x.as) : '') + '</b><small>' + (r ? fmtAt(r.at) : '') + ' · <span class="code">' + esc(x.pr) + '</span></small></div>' + moreBtn('task:' + x.id) + '</div>' +
      '<button class="ac-t" data-act="open-task" data-id="' + x.id + '">' + esc(x.ttl) + '</button>' +
      '<div class="chips">' + '<span class="pill red">' + ic('approve', 'xs') + t('st.cho_duyet') + '</span>' + (x.gate ? '<span class="pill">' + ic('flag', 'xs') + t('gate') + '</span>' : '') + '<span class="pill' + (overdue(x) ? ' warn' : '') + '">' + ic('clock', 'xs') + fmtDate(x.due) + '</span></div>' +
      (r ? '<button class="ac-prev" data-act="open-task" data-id="' + x.id + '">' + esc(clip(r.t, 220)) + '<span>' + t('seeAll') + '</span></button>' : '') +
      '<div class="ac-a"><button class="btn pri" data-act="approve" data-id="' + x.id + '">' + ic('check') + t('approve') + '</button><button class="btn" data-act="return" data-id="' + x.id + '">' + ic('undo') + t('ret.go') + '</button></div></article>';
  }

  /* ============================================================
     02 · VIỆC
     ============================================================ */
  function tcard(x, u) {
    var drag = LW.mayTouch(x, u) && !narrow();
    return '<article class="tcard' + (x.st === 'cho_duyet' ? ' hot' : '') + (x.id === S.task ? ' sel' : '') + '" data-ctx="task:' + x.id + '" ' + (drag ? 'draggable="true" data-drag="' + x.id + '"' : '') + '>' +
      '<div class="tc-top"><span class="code">' + esc(x.pr) + '</span>' + (x.gate ? '<span class="pill xs">' + ic('flag', 'xs') + t('gate') + '</span>' : '') + (overdue(x) ? '<span class="pill xs warn">' + t('late') + '</span>' : '') + moreBtn('task:' + x.id, 'sm') + '</div>' +
      '<button class="tc-t" data-act="open-task" data-id="' + x.id + '">' + esc(x.ttl) + '</button>' +
      '<div class="tc-f">' + (x.as ? avatar(x.as, 'xs') : '<span class="av none xs"></span>') + '<span class="tc-who">' + esc(x.as ? shortName(x.as) : t('unassigned')) + '</span>' +
      (x.thr.length ? '<span class="tc-n">' + ic('chat', 'xs') + x.thr.length + '</span>' : '') +
      '<span class="tc-d' + (overdue(x) ? ' late' : '') + '">' + ic('clock', 'xs') + fmtDate(x.due) + '</span></div></article>';
  }
  function viewTasks(u) {
    var who = S.f.who ? LW.person(S.f.who) : null;
    var list = LW.visibleTasks(u).filter(function (x) {
      if (S.f.pr && x.pr !== S.f.pr) return false;
      if (S.f.kind === 'nguoi' && (!x.as || LW.isAgentId(x.as))) return false;
      if (S.f.kind === 'agent' && !LW.isAgentId(x.as)) return false;
      if (S.f.mine && x.as !== u.id && x.own !== u.id) return false;
      if (who && x.as !== who.id) return false;
      return true;
    });
    var nf = (S.f.pr ? 1 : 0) + (S.f.kind ? 1 : 0) + (S.f.mine ? 1 : 0) + (who ? 1 : 0);
    var h = topbar({ eyebrow: t('tasks.eyebrow', list.length), title: t('tab.tasks'), help: 'tasks',
      actions: ib('filter', 'ctx', 'data-ctx="filter"', t('m.filterTitle'), nf || '') + ib('book', 'open-sub', 'data-id="ledger"', 'Scope Ledger') + (LW.can('create', u) ? ib('plus', 'new-task', '', t('newTask'), '', 'hide-m solid') : '') + accountBtn(u) });
    var chips = '';
    if (nf) {
      chips = '<div class="fchips">' +
        (S.f.pr ? '<button class="pill act" data-act="clear-f" data-k="pr">' + ic('folder', 'xs') + esc(S.f.pr) + ic('close', 'xs') + '</button>' : '') +
        (S.f.kind ? '<button class="pill act" data-act="clear-f" data-k="kind">' + t(S.f.kind === 'agent' ? 'kind.agents' : 'kind.people') + ic('close', 'xs') + '</button>' : '') +
        (S.f.mine ? '<button class="pill act" data-act="clear-f" data-k="mine">' + t('mineOnly') + ic('close', 'xs') + '</button>' : '') +
        (who ? '<button class="pill act" data-act="clear-f" data-k="who">' + avatar(who.id, 'xxs') + esc(who.n) + ic('close', 'xs') + '</button>' : '') + '</div>';
    }
    var seg = '<div class="seg">' + LW.ST.map(function (st) {
      var c = list.filter(function (x) { return x.st === st; }).length;
      return '<button class="' + (S.col === st ? 'on' : '') + '" data-act="col" data-id="' + st + '">' + (st === 'cho_duyet' && c ? '<i class="dot red"></i>' : '') + stName(st) + '<b>' + c + '</b></button>';
    }).join('') + '</div>';
    var cols = LW.ST.map(function (st) {
      var cs = list.filter(function (x) { return x.st === st; });
      return '<section class="col' + (S.col === st ? ' cur' : '') + '" data-col="' + st + '"><header class="col-h">' + (st === 'cho_duyet' ? '<i class="dot red"></i>' : '<i class="dot"></i>') + '<b>' + stName(st) + '</b><span class="cnt">' + cs.length + '</span></header>' +
        '<div class="col-b">' + (cs.map(function (x) { return tcard(x, u); }).join('') || '<div class="col-e">' + t('col.empty') + '</div>') + '</div></section>';
    }).join('');
    return '<div class="view tasks">' + h + chips + seg + '<div class="board">' + cols + '</div><p class="fine hide-m board-hint">' + t('board.hint2') + '</p></div>';
  }

  /* ---------- trang chi tiết việc ---------- */
  function assigneeOptions(u, cur) {
    var ppl = DB.people.filter(function (p) { return p.role !== 'guest'; });
    if (!LW.can('assignOthers', u)) ppl = ppl.filter(function (p) { return p.id === u.id || p.id === cur; });
    return opt('', t('unassigned'), cur || '') +
      '<optgroup label="' + t('people') + '">' + ppl.map(function (p) { return opt(p.id, p.n + ' · ' + LW.openLoad(p.id) + '/' + p.cap, cur); }).join('') + '</optgroup>' +
      '<optgroup label="Agent">' + DB.agents.map(function (a) { return opt(a.id, a.id + ' ' + a.n, cur); }).join('') + '</optgroup>';
  }
  function ownerOptions(cur) { return DB.people.filter(function (p) { return p.role !== 'guest'; }).map(function (p) { return opt(p.id, p.n, cur); }).join(''); }

  function thrItem(e, x, u) {
    var mine = e.by === u.id;
    if (e.k === 'approve') return '<div class="ev ok">' + ic('approve', 'xs') + '<b>' + esc(name(e.by)) + '</b> ' + t('th.approved') + '<time>' + fmtAt(e.at) + '</time></div>';
    if (e.k === 'return') return '<div class="ev back">' + ic('undo', 'xs') + '<b>' + esc(name(e.by)) + '</b> ' + t('th.returned') + '<time>' + fmtAt(e.at) + '</time><p>' + esc(e.t) + '</p></div>';
    if (e.k === 'result') {
      return '<div class="result"><div class="res-h">' + avatar(e.by, 'sm') + '<div><b>' + esc(name(e.by)) + '</b><small>' + t('th.result') + ' · ' + fmtAt(e.at) + '</small></div>' + ib('copy', 'copy', 'data-id="' + x.id + '" data-at="' + esc(e.at) + '"', t('copy')) + '</div>' +
        '<pre class="res">' + esc(e.t) + '</pre>' + (e.ctx ? '<details class="ctx"><summary>' + ic('eye', 'xs') + t('th.ctx') + '</summary><pre>' + esc(e.ctx) + '</pre></details>' : '') + '</div>';
    }
    return '<div class="bub-row' + (mine ? ' mine' : '') + '">' + (mine ? '' : avatar(e.by, 'sm')) + '<div class="bub-w"><small>' + esc(mine ? t('you') : name(e.by)) + ' · ' + fmtAt(e.at) + '</small><div class="bub">' + esc(e.t) + '</div></div></div>';
  }
  function viewTask(u) {
    var x = LW.task(S.task);
    if (!x || !LW.seeTask(x, u)) { S.task = null; return ''; }
    var touch = LW.mayTouch(x, u), boss = LW.can('assignOthers', u), agentTask = LW.isAgentId(x.as);
    var src = x.src ? DB.msgs.find(function (m) { return m.id === x.src; }) : null;
    var dis = touch ? '' : ' disabled';

    var acts = '';
    if (agentTask && x.st === 'dang_lam' && LW.can('runAgent', u)) acts += '<button class="btn pri grow" data-act="run" data-id="' + x.id + '">' + ic('play') + t('run', x.as) + '</button>';
    if (x.st === 'dang_lam' && touch && !agentTask && x.as) acts += x.gate ? '<button class="btn pri grow" data-act="st" data-st="cho_duyet" data-id="' + x.id + '">' + ic('send') + t('sendReview') + '</button>' : '<button class="btn pri grow" data-act="st" data-st="xong" data-id="' + x.id + '">' + ic('check') + t('markDone') + '</button>';
    if (x.st === 'cho_duyet') acts += x.own === u.id ? '<button class="btn pri grow" data-act="approve" data-id="' + x.id + '">' + ic('check') + t('approve') + '</button><button class="btn grow" data-act="return" data-id="' + x.id + '">' + ic('undo') + t('ret.go') + '</button>'
      : '<p class="lockline">' + ic('lock', 'xs') + t('onlyOwner', esc(name(x.own))) + '</p>';
    if (x.st === 'xong' && (x.own === u.id || u.role === 'owner')) acts += '<button class="btn grow" data-act="st" data-st="dang_lam" data-id="' + x.id + '">' + ic('refresh') + t('reopen') + '</button>';

    var r = '<div class="scrim task-scrim' + (S.anim ? ' enter' : '') + '" data-act="close-task"></div><section class="page' + (S.anim ? ' enter' : '') + '" aria-label="' + t('detail') + '">' +
      topbar({ back: 'close-task', eyebrow: esc(x.pr) + ' · ' + stName(x.st), title: t('detail'), help: 'task', helpObj: x.id, actions: moreBtn('task:' + x.id), cls: 'bar' }) +
      '<div class="page-b" data-id="' + x.id + '">' +
      '<div class="tk-status"><span class="pill ' + (x.st === 'cho_duyet' ? 'red' : x.st === 'xong' ? 'dark' : '') + '">' + stName(x.st) + '</span>' + (x.gate ? '<span class="pill">' + ic('flag', 'xs') + t('gate') + '</span>' : '') + (overdue(x) ? '<span class="pill warn">' + ic('clock', 'xs') + t('late') + '</span>' : '') + '</div>' +
      '<form data-form="task-save" data-id="' + x.id + '" class="tk-f">' +
      '<textarea name="ttl" class="ttl" rows="2" required' + dis + '>' + esc(x.ttl) + '</textarea>' +
      '<div class="irows">' +
        '<label class="irow">' + ic('user') + '<span>' + t('assignee') + '</span><select name="as"' + dis + '>' + assigneeOptions(u, x.as) + '</select></label>' +
        '<label class="irow">' + ic('shield') + '<span>' + t('owner') + '</span>' + (boss && touch ? '<select name="own">' + ownerOptions(x.own) + '</select>' : '<input value="' + esc(name(x.own)) + '" readonly>') + '</label>' +
        '<label class="irow">' + ic('clock') + '<span>' + t('due') + '</span><input type="date" name="due" value="' + esc(x.due || '') + '"' + dis + '></label>' +
        '<label class="irow">' + ic('folder') + '<span>' + t('project') + '</span><select name="pr"' + dis + '>' + LW.projsOf(u).concat(LW.projsOf(u).indexOf(x.pr) < 0 ? [x.pr] : []).map(function (p) { return opt(p, p + ' · ' + (LW.project(p) || {}).n, x.pr); }).join('') + '</select></label>' +
        '<label class="irow">' + ic('flag') + '<span>' + t('gate') + '</span><input type="checkbox" class="sw" name="gate"' + (x.gate ? ' checked' : '') + (boss && touch ? '' : ' disabled') + '></label>' +
        (src ? '<button type="button" class="irow link" data-act="goto-msg" data-id="' + src.id + '">' + ic('link') + '<span>' + t('source') + '</span><em>#' + esc(LW.chan(src.ch).n) + ' · ' + esc(shortName(src.by)) + '</em>' + ic('chev', 'xs') + '</button>' : '') +
      '</div>' +
      (agentTask ? '<p class="note-rule">' + ic('shield', 'xs') + t('ownerRule') + '</p>' : '') +
      '<label class="fld">' + t('note') + '<textarea name="note" rows="4"' + dis + '>' + esc(x.note) + '</textarea></label>' +
      (touch ? '<div class="row end"><button class="btn sm">' + ic('check') + t('saveChanges') + '</button></div>' : '') +
      '</form>' +
      '<div class="sec-h"><h2>' + t('thread') + '<span class="cnt">' + x.thr.length + '</span></h2></div>' +
      '<div class="thread">' + (x.thr.map(function (e) { return thrItem(e, x, u); }).join('') || '<p class="fine">' + t('th.empty') + '</p>') + '</div>' +
      '</div>' +
      '<footer class="page-f">' + (acts ? '<div class="acts">' + acts + '</div>' : '') +
      '<form data-form="comment" data-id="' + x.id + '" class="composer"><textarea name="t" rows="1" placeholder="' + t('th.ph') + '" required></textarea><button class="send" aria-label="' + t('send') + '">' + ic('send') + '</button></form></footer></section>';
    return r;
  }

  /* ============================================================
     03 · TIN NHẮN — kênh và agent chung một danh sách
     ============================================================ */
  function convList(u) {
    var list = [];
    LW.visibleChans(u).forEach(function (c) {
      var ms = DB.msgs.filter(function (m) { return m.ch === c.id; }), last = ms[ms.length - 1];
      list.push({ id: c.id, kind: 'chan', name: '#' + c.n, last: last ? shortName(last.by) + ': ' + last.t : c.d, at: last ? last.at : '' });
    });
    LW.visibleAgentsForDM(u).forEach(function (a) {
      var ms = (DB.dms[a.id] || []).filter(function (m) { return m.u === u.id; }), last = ms[ms.length - 1];
      list.push({ id: a.id, kind: 'agent', name: a.n, code: a.id, last: last ? (last.r === 'agent' ? a.id : t('you')) + ': ' + last.c.split('\n')[0] : a.r, at: last ? last.at : '' });
    });
    list.sort(function (a, b) { return (b.at || '').localeCompare(a.at || ''); });
    return list;
  }
  function viewChat(u) {
    var all = convList(u);
    var q = S.q.trim().toLowerCase();
    var list = all.filter(function (c) {
      if (S.chatF === 'chan' && c.kind !== 'chan') return false;
      if (S.chatF === 'agent' && c.kind !== 'agent') return false;
      return !q || (c.name + ' ' + (c.code || '') + ' ' + c.last).toLowerCase().indexOf(q) >= 0;
    });
    if (!S.conv || !all.some(function (c) { return c.id === S.conv; })) S.conv = all.length ? all[0].id : null;
    var hasAgents = all.some(function (c) { return c.kind === 'agent'; });
    var side = '<div class="c-list">' + topbar({ title: t('tab.chat'), help: 'chat', actions: (LW.can('admin', u) ? ib('plus', 'chan-new', '', t('chan.new')) : '') + accountBtn(u) }) +
      '<label class="search">' + ic('search') + '<input type="search" data-input="chat-q" value="' + esc(S.q) + '" placeholder="' + t('chat.search') + '"></label>' +
      '<div class="fchips">' + [['all', 'chat.all'], ['chan', 'chat.chans']].concat(hasAgents ? [['agent', 'chat.agents']] : []).map(function (f) { return '<button class="pill act' + (S.chatF === f[0] ? ' on' : '') + '" data-act="chat-f" data-id="' + f[0] + '">' + t(f[1]) + '</button>'; }).join('') + '</div>' +
      '<div class="convs">' + (list.map(function (c) {
        return '<article class="conv' + (c.id === S.conv ? ' on' : '') + '" data-ctx="conv:' + c.id + '"><button class="cv-main" data-act="open-conv" data-id="' + c.id + '">' + (c.kind === 'chan' ? chanAvatar('lg') : avatar(c.id, 'lg')) +
          '<span class="cv-t"><span class="cv-n"><b>' + esc(c.name) + '</b>' + (c.kind === 'agent' ? '<span class="pill xs">Agent</span>' : '') + '<time>' + fmtShort(c.at) + '</time></span><small>' + esc(clip(c.last, 80)) + '</small></span></button>' + moreBtn('conv:' + c.id, 'sm hover') + '</article>';
      }).join('') || '<p class="fine pad">' + t('chan.none') + '</p>') + '</div></div>';
    return '<div class="view chat">' + side + '<div class="c-pane">' + (S.conv ? (LW.isAgentId(S.conv) ? agentConv(u) : chanConv(u)) : '') + '</div></div>';
  }
  function convHead(u, avatarHtml, title, sub, key, help, helpObj) {
    return '<header class="topbar bar conv-h">' + ib('back', 'close-conv', '', t('back'), '', 'back only-m') + avatarHtml + '<div class="tt"><h1>' + title + '</h1><p>' + sub + '</p></div><div class="ta">' + helpBtn(help, helpObj) + moreBtn(key) + '</div></header>';
  }
  function chanConv(u) {
    var c = LW.chan(S.conv), ms = DB.msgs.filter(function (m) { return m.ch === c.id; });
    return convHead(u, chanAvatar('md'), '#' + esc(c.n), t('chat.members', c.mem.length) + ' · ' + esc(c.d), 'conv:' + c.id, 'conv', c.id) +
      '<div class="msgs">' + '<div class="hint-b">' + ic('tasks', 'xs') + t('chat.hint') + '</div>' + ms.map(function (m) {
        var mine = m.by === u.id, tk = m.task ? LW.task(m.task) : null, chip = '';
        if (tk && LW.seeTask(tk, u)) chip = '<button class="taskchip" data-act="open-task" data-id="' + tk.id + '">' + ic('tasks', 'xs') + '<span>' + esc(tk.ttl) + '</span><em>' + stName(tk.st) + '</em></button>';
        else if (m.task) chip = '<span class="taskchip off">' + ic('tasks', 'xs') + t('becameTask') + '</span>';
        return '<div class="bub-row' + (mine ? ' mine' : '') + (m.id === S.hl ? ' hl' : '') + '" id="msg-' + m.id + '" data-ctx="msg:' + m.id + '">' + (mine ? '' : avatar(m.by, 'sm')) +
          '<div class="bub-w"><small>' + esc(mine ? t('you') : name(m.by)) + ' · ' + fmtShort(m.at) + '</small><div class="bub">' + esc(m.t) + '</div>' + chip + '</div>' + moreBtn('msg:' + m.id, 'sm hover') + '</div>';
      }).join('') + '</div>' +
      '<form data-form="msg" class="composer in-conv"><textarea name="t" rows="1" required placeholder="' + t('msg.ph', esc(c.n)) + '"></textarea><button class="send" aria-label="' + t('send') + '">' + ic('send') + '</button></form>';
  }
  function agentConv(u) {
    var a = LW.agent(S.conv), conv = (DB.dms[a.id] || []).filter(function (m) { return m.u === u.id; });
    var sugg = [t('dm.q1'), t('dm.q2'), t('dm.q3'), t('dm.q4')];
    return convHead(u, avatar(a.id, 'md'), esc(a.n), esc(a.id) + ' · ' + t('ownShort') + ' ' + esc(name(a.sc.own)) + ' · ' + t('runs', LW.runsToday(a), a.sc.limit), 'agent:' + a.id, 'agentchat', a.id) +
      '<div class="msgs">' + '<div class="hint-b">' + ic('shield', 'xs') + t('dm.hint2') + '</div>' + (conv.map(function (m, i) {
        var ag = m.r === 'agent';
        return '<div class="bub-row' + (ag ? ' agent' : ' mine') + '" data-ctx="dm:' + a.id + ':' + i + '">' + (ag ? avatar(a.id, 'sm') : '') + '<div class="bub-w"><small>' + esc(ag ? a.id + ' · ' + a.n : t('you')) + ' · ' + fmtShort(m.at) + '</small><div class="bub">' + esc(m.c) + '</div>' +
          (m.ctx ? '<details class="ctx mini"><summary>' + ic('eye', 'xs') + t('th.ctx') + '</summary><pre>' + esc(m.ctx) + '</pre></details>' : '') + '</div>' + moreBtn('dm:' + a.id + ':' + i, 'sm hover') + '</div>';
      }).join('') || '<div class="dm-empty">' + avatar(a.id, 'xl') + '<b>' + esc(a.n) + '</b><p>' + esc(a.r) + '</p></div>') + '</div>' +
      '<div class="sugg">' + sugg.map(function (q) { return '<button class="pill act" data-act="dm-q" data-q="' + esc(q) + '">' + esc(q) + '</button>'; }).join('') + '</div>' +
      '<form data-form="dm" class="composer in-conv"><textarea name="q" rows="1" required placeholder="' + t('dm.ph', a.id) + '"></textarea><button class="send" aria-label="' + t('send') + '">' + ic('send') + '</button></form>';
  }

  /* ============================================================
     04 · TIỆN ÍCH — lưới biểu tượng, mỗi ô mở một trang con
     ============================================================ */
  function appTile(icon, label, sub, act, attrs, cls, badge) {
    return '<button class="app-t" data-act="' + act + '" ' + (attrs || '') + '><span class="av tile lg ' + (cls || '') + '">' + ic(icon) + (badge ? '<i class="bdg">' + badge + '</i>' : '') + '</span><b>' + label + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</button>';
  }
  function viewApps(u) {
    if (S.sub && SUBS[S.sub]) return '<div class="view sub">' + SUBS[S.sub](u) + '</div>';
    var guest = u.role === 'guest', owner = u.role === 'owner';
    var h = topbar({ eyebrow: t('apps.eyebrow'), title: t('tab.apps'), help: 'apps', actions: accountBtn(u) });
    var prof = '<article class="profile" data-ctx="person:' + u.id + '">' + avatar(u.id, 'xl') + '<div class="pf-t"><b>' + esc(u.n) + '</b><small>' + roleName(u.role) + ' · ' + esc(u.mail) + '</small><span class="meter"><i style="width:' + (u.cap ? Math.min(100, Math.round(LW.openLoad(u.id) / u.cap * 100)) : 0) + '%"></i></span><em>' + t('team.load', LW.openLoad(u.id), u.cap) + '</em></div>' + moreBtn('person:' + u.id) + '</article>';
    function grid(title, tiles) { tiles = tiles.filter(Boolean); return tiles.length ? section(title, null, '<div class="apps">' + tiles.join('') + '</div>') : ''; }
    return '<div class="view v-apps">' + h + prof +
      grid(t('apps.team'), [
        !guest && appTile('users', t('q.team'), t('apps.peopleS', DB.people.length), 'open-sub', 'data-id="people"'),
        !guest && appTile('bot', 'Agent', t('apps.agentsS', DB.agents.length), 'open-sub', 'data-id="agents"', 'ink'),
        appTile('chat', t('tab.chat'), t('apps.chatS'), 'goto-chat', 'data-f="all"')
      ]) +
      grid(t('apps.ops'), [
        !guest && appTile('flow', t('q.flows'), t('apps.flowsS', DB.flows.length), 'open-sub', 'data-id="flows"'),
        appTile('book', 'Scope Ledger', t('apps.ledgerS'), 'open-sub', 'data-id="ledger"'),
        owner && appTile('coin', t('rates.title'), t('apps.ratesS'), 'open-sub', 'data-id="rates"'),
        appTile('approve', t('q.review'), t('apps.reviewS'), 'goto-review', '', 'red', needCount(u) || '')
      ]) +
      grid(t('apps.system'), [
        owner && appTile('gear', t('settings.h'), t('apps.settingsS'), 'open-sub', 'data-id="settings"', 'ink'),
        owner && appTile('log', t('log.title'), t('apps.logS'), 'open-sub', 'data-id="log"'),
        !guest && appTile('lock', t('team.matrix'), t('apps.matrixS'), 'open-sub', 'data-id="matrix"')
      ]) +
      grid(t('apps.other'), [
        appTile('globe', S.lang === 'vi' ? 'English' : 'Tiếng Việt', t('m.langS'), 'lang'),
        appTile('help', t('h.center'), t('h.centerS'), 'help', 'data-h="overview"', 'ink'),
        appTile('info', t('about.title'), '', 'about'),
        appTile('refresh', t('reset'), '', 'reset'),
        appTile('logout', t('logout'), '', 'logout', '', 'red')
      ]) + '</div>';
  }
  function subHead(title, sub, actions) { return topbar({ back: 'close-sub', eyebrow: t('tab.apps'), title: title, sub: sub, help: S.sub, actions: actions || '' }); }

  var SUBS = {
    people: function (u) {
      var admin = LW.can('admin', u);
      return subHead(t('q.team'), t('team.sub'), admin ? ib('plus', 'person-new', '', t('team.addPerson'), '', 'solid') : '') +
        '<div class="cards">' + DB.people.map(function (p) {
          var load = LW.openLoad(p.id), pct = p.cap ? Math.min(100, Math.round(load / p.cap * 100)) : 0;
          return '<article class="card pcard" data-ctx="person:' + p.id + '"><div class="card-h">' + avatar(p.id, 'lg') + '<div class="ch-t"><b>' + esc(p.n) + '</b><small>' + esc(p.r) + '</small></div>' + moreBtn('person:' + p.id) + '</div>' +
            '<div class="chips"><span class="pill ' + (p.role === 'owner' ? 'dark' : '') + '">' + roleName(p.role) + '</span>' + (p.role === 'owner' ? '<span class="pill soft">' + t('team.allProj') + '</span>' : p.sc.proj.map(function (x) { return '<span class="pill soft">' + x + '</span>'; }).join('')) + '</div>' +
            (p.bio ? '<p class="card-p">' + esc(p.bio) + '</p>' : '') +
            (p.role !== 'guest' ? '<div class="loadrow"><span>' + t('team.loadL') + '</span><span class="meter' + (load > p.cap ? ' over' : '') + '"><i style="width:' + pct + '%"></i></span><b>' + load + '/' + p.cap + '</b></div>' : '') + '</article>';
        }).join('') + '</div>';
    },
    agents: function (u) {
      return subHead('Agent', t('team.agentHint'), LW.can('admin', u) ? ib('plus', 'agent-new', '', t('team.addAgent'), '', 'solid') : '') +
        '<div class="cards">' + DB.agents.map(function (a) {
          var r = LW.runsToday(a), pct = a.sc.limit ? Math.min(100, Math.round(r / a.sc.limit * 100)) : 0;
          return '<article class="card agcard" data-ctx="agent:' + a.id + '"><div class="card-h">' + avatar(a.id, 'lg') + '<div class="ch-t"><b>' + esc(a.n) + '</b><small>' + t('ownShort') + ' ' + esc(name(a.sc.own)) + '</small></div>' + moreBtn('agent:' + a.id) + '</div>' +
            '<p class="card-p">' + esc(a.r) + '</p>' +
            '<div class="chips">' + (a.sc.review ? '<span class="pill red">' + ic('approve', 'xs') + t('ag.required') + '</span>' : '<span class="pill dark">' + t('ag.direct') + '</span>') + a.sc.reads.map(function (x) { return '<span class="pill soft">' + t('read.' + x) + '</span>'; }).join('') + '</div>' +
            '<div class="loadrow"><span>' + t('ag.limit') + '</span><span class="meter"><i style="width:' + pct + '%"></i></span><b>' + r + '/' + a.sc.limit + '</b></div>' +
            '<div class="card-a"><button class="btn sm" data-act="agent-open" data-id="' + a.id + '">' + ic('shield') + t('m.scope') + '</button>' + (LW.seeDM(a, u) ? '<button class="btn sm" data-act="open-conv" data-id="' + a.id + '">' + ic('chat') + t('m.askAgent') + '</button>' : '') + '</div></article>';
        }).join('') + '</div>' + forbidBox();
    },
    flows: function (u) {
      var f = DB.flows.find(function (x) { return x.id === S.flow; }) || DB.flows[0];
      var agentSteps = f.steps.filter(function (s) { return s.as !== 'NGUOI'; }).length;
      return subHead(t('q.flows'), t('flows.sub'), '') +
        '<div class="cards one">' + DB.flows.map(function (x) {
          return '<article class="card' + (x.id === f.id ? ' on' : '') + '" data-ctx="flow:' + x.id + '"><div class="card-h"><span class="av tile lg">' + ic('flow') + '</span><div class="ch-t"><b>' + esc(x.n) + '</b><small>' + esc(x.d) + '</small></div>' + moreBtn('flow:' + x.id) + '</div>' +
            '<div class="fstats"><div><b>' + x.steps.length + '</b><span>' + t('steps') + '</span></div><div><b>' + agentSteps + '</b><span>' + t('flow.byAgent') + '</span></div><div><b>' + (x.steps.length - agentSteps) + '</b><span>' + t('flow.byPerson') + '</span></div><div class="hot"><b>' + x.steps.filter(function (s) { return s.gate; }).length + '</b><span>' + t('flow.gates') + '</span></div></div>' +
            '<div class="card-a">' + (LW.can('launchFlow', u) ? '<button class="btn pri sm" data-act="flow-launch" data-id="' + x.id + '">' + ic('play') + t('flow.launch') + '</button>' : '<span class="fine">' + t('flow.noLaunch') + '</span>') + '</div></article>';
        }).join('') + '</div>' +
        section(t('m.viewSteps'), f.steps.length, '<ol class="timeline">' + f.steps.map(function (s) {
          var human = s.as === 'NGUOI', ag = human ? null : LW.agent(s.as);
          return '<li class="' + (s.gate ? 'gate' : '') + '"><span class="tl-d">+' + s.off + '</span><span class="tl-n">' + (human ? '<span class="av xs">' + t('flow.personShort') + '</span>' : avatar(s.as, 'xs')) + '</span><span class="tl-b"><b>' + esc(s.t) + '</b><small>' + (human ? t('flow.person') : esc(s.as + ' · ' + (ag ? ag.n : ''))) + '</small></span>' + (s.gate ? '<span class="pill xs red">' + ic('flag', 'xs') + t('gate') + '</span>' : '') + '</li>';
        }).join('') + '</ol><p class="fine">' + t('flow.hint') + '</p>');
    },
    ledger: function (u) {
      var prs = LW.projsOf(u).filter(function (p) { return DB.ledger[p]; });
      if (!prs.length) return subHead('Scope Ledger', '') + '<p class="fine pad">' + t('ledger.none') + '</p>';
      if (prs.indexOf(S.ledgerPr) < 0) S.ledgerPr = prs[0];
      var L = DB.ledger[S.ledgerPr], canEdit = LW.can('approve', u);
      return subHead('Scope Ledger', t('ledger.sub'), '') +
        '<div class="fchips">' + prs.map(function (p) { return '<button class="pill act' + (p === S.ledgerPr ? ' on' : '') + '" data-act="ledger-pr" data-id="' + p + '">' + p + ' · ' + esc(LW.project(p).n) + '</button>'; }).join('') + '</div>' +
        section(t('ledger.items') + ' · v' + L.v, L.items.length, '<div class="list">' + L.items.map(function (i) { return '<div class="row-i static"><span class="av tile sm">' + i.id + '</span><span class="ri-t"><b>' + esc(i.t) + '</b></span></div>'; }).join('') + '</div>') +
        section(t('ledger.log'), L.log.length, '<div class="list">' + L.log.map(function (l) { return '<div class="row-i static">' + avatar(l.by, 'md') + '<span class="ri-t"><b>' + esc(l.t) + '</b><small>' + esc(name(l.by)) + ' · ' + fmtAt(l.at) + ' · ' + t('ledger.src') + ': ' + esc(l.src) + '</small></span></div>'; }).join('') + '</div>') +
        (canEdit ? '<form data-form="ledger-add" class="card stack"><b class="card-title">' + ic('plus', 'xs') + t('ledger.add') + '</b><label class="fld">' + t('ledger.content') + '<input name="item" required></label><label class="fld">' + t('ledger.src') + '<input name="src" required placeholder="' + t('ledger.srcPh') + '"></label><button class="btn pri">' + t('ledger.addGo') + '</button></form>' : '<p class="fine pad">' + t('ledger.ro') + '</p>') +
        '<div class="forbid slim">' + ic('lock', 'xs') + '<span>' + t('ledger.agentNo') + '</span></div>';
    },
    rates: function (u) {
      return subHead(t('rates.title'), t('rates.hint', LW.vnd(DB.rates.dayRate))) +
        '<div class="list">' + DB.rates.items.map(function (r) { return '<div class="row-i static"><span class="av tile sm">' + ic('coin') + '</span><span class="ri-t"><b>' + esc(r.n) + '</b><small>' + t('rates.k') + ': ' + esc(r.k) + '</small></span><span class="pill dark">' + String(r.d).replace('.', ',') + ' ' + t('rates.dShort') + '</span></div>'; }).join('') + '</div>' +
        (LW.can('admin', u) ? '<form data-form="rate" class="card stack"><b class="card-title">' + ic('plus', 'xs') + t('rates.add') + '</b><div class="grid3"><input name="k" required placeholder="' + t('rates.k') + '"><input name="n" required placeholder="' + t('rates.n') + '"><input name="d" required inputmode="decimal" placeholder="' + t('rates.d') + '"></div><button class="btn pri">' + t('rates.add') + '</button></form>' : '');
    },
    settings: function (u) {
      function secretRow(g, f, label) {
        var v = DB.cfg[g][f];
        return '<div class="irow">' + ic('lock') + '<span>' + label + '</span><em>' + (v && v.setAt ? t('secret.setOn', fmtDate(v.setAt) + '/' + v.setAt.slice(0, 4)) : t('secret.unset')) + '</em><button type="button" class="btn xs" data-act="secret-reset" data-g="' + g + '" data-f="' + f + '">' + (v && v.setAt ? t('secret.reset') : t('secret.set')) + '</button></div>';
      }
      function inp(g, k, label, icon, type) {
        var v = DB.cfg[g][k];
        if (type === 'bool') return '<label class="irow">' + ic(icon) + '<span>' + label + '</span><input type="checkbox" class="sw" name="' + k + '"' + (v ? ' checked' : '') + '></label>';
        return '<label class="irow">' + ic(icon) + '<span>' + label + '</span><input name="' + k + '" type="' + (type || 'text') + '" value="' + esc(Array.isArray(v) ? v.join(', ') : v) + '"></label>';
      }
      function card(g, icon, title, body, note) {
        return '<form class="card stack" data-form="cfg" data-g="' + g + '"><div class="card-h"><span class="av tile md">' + ic(icon) + '</span><div class="ch-t"><b>' + title + '</b>' + (note ? '<small>' + note + '</small>' : '') + '</div></div><div class="irows">' + body + '</div><div class="row end"><button class="btn sm">' + t('save') + '</button></div></form>';
      }
      return subHead(t('settings.h'), t('set.ownerOnly')) + '<div class="cards">' +
        card('ai', 'bot', t('set.ai'), '<label class="irow">' + ic('globe') + '<span>' + t('set.prov') + '</span><select name="prov">' + opt('Anthropic', 'Anthropic', DB.cfg.ai.prov) + opt('OpenAI', 'OpenAI', DB.cfg.ai.prov) + '</select></label>' + inp('ai', 'model', t('set.model'), 'bot') + inp('ai', 'tok', t('set.tok'), 'coin', 'number') + secretRow('ai', 'key', t('set.key')), t('set.keyNote')) +
        card('mail', 'mail', 'Email', inp('mail', 'from', t('set.from'), 'mail') + inp('mail', 'conn', t('set.conn'), 'link', 'bool') + inp('mail', 'n', t('set.notify'), 'bell'), t('set.mailNote')) +
        card('drive', 'folder', 'Google Drive', inp('drive', 'conn', t('set.conn'), 'link', 'bool') + inp('drive', 'root', t('set.root'), 'folder') + inp('drive', 'pat', t('set.pat'), 'note'), t('set.driveNote')) +
        card('vps', 'gear', 'VPS', inp('vps', 'host', 'Host', 'globe') + inp('vps', 'user', 'User', 'user') + inp('vps', 'path', t('set.path'), 'folder') + inp('vps', 'fp', t('set.fp'), 'shield'), t('set.vpsNote')) +
        card('git', 'flow', 'GitHub', inp('git', 'owner', 'Owner', 'user') + inp('git', 'repo', 'Repo', 'folder') + inp('git', 'branch', 'Branch', 'flow') + secretRow('git', 'tok', 'Token'), t('set.gitNote')) +
        card('local', 'folder', t('set.local'), inp('local', 'dir', t('set.dir'), 'folder') + inp('local', 'sync', t('set.sync'), 'refresh', 'bool'), t('set.localNote')) + '</div>';
    },
    log: function () {
      return subHead(t('log.title'), t('log.hint')) + '<div class="list">' + DB.log.slice(0, 80).map(function (l) {
        return '<div class="row-i static">' + (l.by === 'system' ? '<span class="av tile md">' + ic('gear') + '</span>' : avatar(l.by, 'md')) + '<span class="ri-t"><b>' + esc(name(l.by)) + ' <span class="code">' + esc(l.act) + '</span></b><small>' + esc([l.obj, l.d].filter(Boolean).join(' · ') || '—') + '</small></span><time class="fine">' + fmtAt(l.at) + '</time></div>';
      }).join('') + '</div>';
    },
    matrix: function () {
      var roles = ['owner', 'pm', 'mem', 'guest'], rows = ['view', 'create', 'assignOthers', 'approve', 'runAgent', 'launchFlow', 'admin', 'editSelf'];
      return subHead(t('team.matrix'), t('team.scopeNote')) + '<div class="card tw"><table class="tbl"><thead><tr><th></th>' + roles.map(function (r) { return '<th>' + roleName(r) + '</th>'; }).join('') + '</tr></thead><tbody>' +
        rows.map(function (r) { return '<tr><td>' + t('perm.' + r) + '</td>' + roles.map(function (ro) { return '<td class="c">' + (LW.PERM[r].indexOf(ro) >= 0 ? '<span class="yes">' + ic('check', 'xs') + '</span>' : '<span class="nope"></span>') + '</td>'; }).join('') + '</tr>'; }).join('') +
        '</tbody></table></div>' + forbidBox();
    }
  };

  function forbidBox() {
    return '<div class="forbid"><div class="fh"><span class="av tile red sm">' + ic('lock') + '</span><b>' + t('forbid.head') + '</b><span class="sp"></span>' + helpBtn('forbid', '', 'sm') + '</div><div class="fl">' + LW.FORBIDDEN.map(function (f) { return '<div><b>' + esc(S.lang === 'en' ? f.en : f.vi) + '</b><small>' + esc(S.lang === 'en' ? f.why_en : f.why_vi) + '</small></div>'; }).join('') + '</div><p>' + t('forbid.foot') + '</p></div>';
  }

  /* ---------- biểu mẫu ---------- */
  function newTaskForm(u, pre) {
    pre = pre || {};
    var prs = LW.projsOf(u);
    return '<form data-form="' + (pre.msg ? 'msg-task' : 'new-task') + '"' + (pre.msg ? ' data-id="' + pre.msg.id + '"' : '') + ' class="stack">' +
      (pre.msg ? '<blockquote class="quote">' + avatar(pre.msg.by, 'sm') + '<div><small>' + esc(name(pre.msg.by)) + ' · #' + esc(LW.chan(pre.msg.ch).n) + '</small><p>' + esc(pre.msg.t) + '</p></div></blockquote><p class="fine">' + t('msgTask.keep') + '</p>' : '') +
      '<label class="fld">' + t('title') + '<textarea name="ttl" rows="2" required>' + esc(pre.ttl || '') + '</textarea></label>' +
      '<div class="grid2"><label class="fld">' + t('project') + '<select name="pr" required>' + prs.map(function (p) { return opt(p, p + ' · ' + LW.project(p).n, pre.pr || S.f.pr); }).join('') + '</select></label>' +
      '<label class="fld">' + t('due') + '<input type="date" name="due" value="' + LW.addDays(LW.today(), 3) + '"></label></div>' +
      '<label class="fld">' + t('assignee') + '<select name="as">' + assigneeOptions(u, pre.as || '') + '</select></label>' +
      '<p class="fine">' + t('assignRule') + '</p>' +
      (LW.can('assignOthers', u) ? '<label class="swrow"><span>' + ic('flag', 'xs') + t('gateLabel') + '</span><input type="checkbox" class="sw" name="gate"></label>' : '') +
      '<label class="fld">' + t('note') + '<textarea name="note" rows="3" placeholder="' + t('note.ph') + '">' + esc(pre.note || '') + '</textarea></label>' +
      '<div class="dlg-f"><button type="button" class="btn" data-act="modal-x">' + t('cancel') + '</button><button class="btn pri">' + t('create') + '</button></div></form>';
  }
  function returnFormHtml(id) {
    var x = LW.task(id);
    return '<form data-form="return" data-id="' + id + '" class="stack"><div class="quote">' + (x.as ? avatar(x.as, 'sm') : '') + '<div><small>' + esc(x.pr) + ' · ' + stName(x.st) + '</small><p>' + esc(x.ttl) + '</p></div></div>' +
      '<label class="fld">' + t('ret.reason') + '<textarea name="reason" rows="4" required placeholder="' + t('ret.ph') + '"></textarea></label>' +
      '<div class="dlg-f"><button type="button" class="btn" data-act="modal-x">' + t('cancel') + '</button><button class="btn red">' + ic('undo') + t('ret.go') + '</button></div></form>';
  }
  function chanForm(u, c) {
    c = c || { n: '', d: '', mem: [u.id] };
    return '<form data-form="chan" class="stack"' + (c.id ? ' data-id="' + c.id + '"' : '') + '><label class="fld">' + t('chan.name') + '<input name="n" required value="' + esc(c.n) + '"></label><label class="fld">' + t('chan.desc') + '<input name="d" value="' + esc(c.d) + '"></label>' +
      '<div class="picks">' + DB.people.map(function (p) { return '<label class="pick">' + avatar(p.id, 'sm') + '<span><b>' + esc(p.n) + '</b><small>' + roleName(p.role) + '</small></span><input type="checkbox" name="mem" value="' + p.id + '"' + (c.mem.indexOf(p.id) >= 0 ? ' checked' : '') + '></label>'; }).join('') + '</div>' +
      '<p class="fine">' + t('chan.rule') + '</p><div class="dlg-f"><button type="button" class="btn" data-act="modal-x">' + t('cancel') + '</button><button class="btn pri">' + t('save') + '</button></div></form>';
  }
  function launchForm(u, f) {
    var ppl = DB.people.filter(function (p) { return p.role !== 'guest'; });
    return '<form data-form="flow-launch" data-id="' + f.id + '" class="stack"><div class="grid2"><label class="fld">' + t('project') + '<select name="pr" required>' + LW.projsOf(u).map(function (p) { return opt(p, p + ' · ' + LW.project(p).n, ''); }).join('') + '</select></label>' +
      '<label class="fld">' + t('flow.start') + '<input type="date" name="start" required value="' + LW.today() + '"></label></div>' +
      '<b class="card-title">' + t('flow.pick') + '</b>' + f.steps.map(function (s, i) {
        if (s.as !== 'NGUOI') return '';
        return '<label class="fld">' + (i + 1) + '. ' + esc(s.t) + ' · +' + s.off + '<select name="step' + i + '" required>' + opt('', '—', '') + ppl.map(function (p) { return opt(p.id, p.n + ' · ' + LW.openLoad(p.id) + '/' + p.cap, ''); }).join('') + '</select></label>';
      }).join('') +
      '<p class="fine">' + t('flow.agentOwn') + '</p><div class="dlg-f"><button type="button" class="btn" data-act="modal-x">' + t('cancel') + '</button><button class="btn pri">' + ic('play') + t('flow.launchGo', f.steps.length) + '</button></div></form>';
  }
  function personForm(p) {
    p = p || { n: '', mail: '', r: '', role: 'mem', cap: 4, sc: { proj: [] } };
    return '<form data-form="person" class="stack"' + (p.id ? ' data-id="' + p.id + '"' : '') + '><div class="grid2"><label class="fld">' + t('pf.name') + '<input name="n" required value="' + esc(p.n) + '"></label><label class="fld">Email<input name="mail" type="email" required value="' + esc(p.mail) + '"></label></div>' +
      '<label class="fld">' + t('pf.r') + '<input name="r" value="' + esc(p.r) + '"></label>' +
      '<div class="grid2"><label class="fld">' + t('pf.role') + '<select name="role" data-change="role">' + LW.ROLES.map(function (r) { return opt(r, roleName(r), p.role); }).join('') + '</select></label><label class="fld">' + t('pf.cap') + '<input name="cap" type="number" min="0" inputmode="numeric" value="' + p.cap + '"></label></div>' +
      '<fieldset class="projs picks"' + (p.role === 'owner' ? ' disabled' : '') + '><legend>' + t('pf.scope') + '</legend>' + DB.projects.map(function (x) { return '<label class="pick"><span class="av tile sm">' + ic('folder') + '</span><span><b>' + x.id + '</b><small>' + esc(x.n) + '</small></span><input type="checkbox" name="proj" value="' + x.id + '"' + (p.sc.proj.indexOf(x.id) >= 0 ? ' checked' : '') + '></label>'; }).join('') + '</fieldset>' +
      '<p class="fine">' + t('pf.scopeNote') + (p.id ? '' : ' ' + t('pf.newPw', LW.DEMO_PW)) + '</p>' +
      '<div class="dlg-f"><button type="button" class="btn" data-act="modal-x">' + t('cancel') + '</button><button class="btn pri">' + t('save') + '</button></div></form>';
  }
  function profileForm(u) {
    return '<form data-form="profile" class="stack"><div class="avrow">' + avatar(u.id, 'xl') + '<div class="stack tight"><label class="btn sm file">' + ic('user') + t('pf.avatar') + '<input type="file" accept="image/*" data-change="avatar" hidden></label><input type="hidden" name="av" value=""><span class="fine">' + t('pf.avNote') + '</span></div></div>' +
      '<div class="grid2"><label class="fld">' + t('pf.name') + '<input name="n" required value="' + esc(u.n) + '"></label><label class="fld">' + t('pf.ini') + '<input name="ini" maxlength="3" value="' + esc(u.ini) + '"></label></div>' +
      '<label class="fld">' + t('pf.r') + '<input name="r" value="' + esc(u.r) + '"></label><label class="fld">' + t('pf.bio') + '<textarea name="bio" rows="3">' + esc(u.bio) + '</textarea></label>' +
      '<p class="fine">' + t('pf.contactNote') + '</p><div class="dlg-f"><button class="btn pri">' + t('save') + '</button></div></form>' +
      '<form data-form="pw" class="card stack"><b class="card-title">' + ic('lock', 'xs') + t('pw.title') + '</b><div class="grid2"><label class="fld">' + t('pw.old') + '<input type="password" name="old" required autocomplete="current-password"></label><label class="fld">' + t('pw.new') + '<input type="password" name="nw" required minlength="8" autocomplete="new-password"></label></div><p class="fine">' + t('pw.note') + '</p><button class="btn">' + t('pw.go') + '</button></form>';
  }
  function agentForm(u, a) {
    var isNew = !a, admin = LW.can('admin', u);
    a = a || { id: 'A' + (Math.max.apply(null, DB.agents.map(function (x) { return +x.id.slice(1); })) + 1), n: '', r: '', p: '', sc: { own: u.id, reads: ['viec'], can: ['ghi_chu'], review: true, limit: 10 } };
    var ro = admin ? '' : ' disabled';
    var owners = DB.people.filter(function (p) { return p.role === 'owner' || p.role === 'pm'; });
    function picks(name2, all, cur, label) { return all.map(function (r) { return '<label class="pick">' + '<span><b>' + t(label + r) + '</b></span><input type="checkbox" name="' + name2 + '" value="' + r + '"' + (cur.indexOf(r) >= 0 ? ' checked' : '') + ro + '></label>'; }).join(''); }
    return '<form data-form="agent" class="stack"' + (isNew ? ' data-new="1"' : '') + '>' +
      (isNew ? '' : '<div class="quote">' + avatar(a.id, 'lg') + '<div><small>' + t('ownShort') + ' ' + esc(name(a.sc.own)) + '</small><p>' + esc(a.r) + '</p></div></div>') +
      '<div class="grid2"><label class="fld">' + t('ag.id') + '<input name="id" required pattern="A[0-9]+" value="' + esc(a.id) + '"' + (isNew ? '' : ' readonly') + ro + '></label><label class="fld">' + t('pf.name') + '<input name="n" required value="' + esc(a.n) + '"' + ro + '></label></div>' +
      '<label class="fld">' + t('ag.role') + '<input name="r" value="' + esc(a.r) + '"' + ro + '></label>' +
      '<label class="fld">' + t('ag.prompt') + '<textarea name="p" rows="4"' + ro + '>' + esc(a.p) + '</textarea></label>' +
      '<div class="grid2"><label class="fld">' + t('owner') + '<select name="own"' + ro + '>' + owners.map(function (p) { return opt(p.id, p.n + ' · ' + roleName(p.role), a.sc.own); }).join('') + '</select></label><label class="fld">' + t('ag.limitLong') + '<input type="number" inputmode="numeric" name="limit" min="0" value="' + a.sc.limit + '"' + ro + '></label></div>' +
      '<p class="fine">' + t('ag.ownNote') + '</p>' +
      '<div class="grid2"><fieldset class="picks"><legend>' + t('ag.reads') + '</legend>' + picks('reads', LW.READS, a.sc.reads, 'read.') + '<p class="fine">' + t('ag.readsWhy') + '</p></fieldset>' +
      '<fieldset class="picks"><legend>' + t('ag.can') + '</legend>' + picks('can', LW.CANS, a.sc.can, 'can.') + '<p class="fine">' + t('ag.canWhy') + '</p></fieldset></div>' +
      '<label class="swrow"><span>' + ic('approve', 'xs') + t('ag.reviewLong') + '</span><input type="checkbox" class="sw" name="review"' + (a.sc.review ? ' checked' : '') + ro + '></label><p class="fine">' + t('ag.reviewWhy') + '</p>' +
      forbidBox() +
      (isNew ? '' : '<div class="probe"><button type="button" class="btn" data-act="probe" data-id="' + a.id + '">' + ic('shield') + t('probe.go') + '</button><div id="probe-out"></div></div>') +
      (admin ? '<div class="dlg-f"><button type="button" class="btn" data-act="modal-x">' + t('cancel') + '</button><button class="btn pri">' + t('save') + '</button></div>' : '<p class="fine">' + t('ag.roNote') + '</p>') + '</form>';
  }

  /* ============================================================
     TRỢ GIÚP THEO NGỮ CẢNH + TRỢ LÝ
     Nội dung ở help.js. Trợ lý tìm trong câu hỏi thường gặp của đúng ngữ cảnh,
     rồi trả lời từ luật (data.js) và dữ liệu người hỏi được xem — không đoán ngoài phạm vi.
     ============================================================ */
  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd'); }
  function helpDoc(ctx) { var H = window.HELP[ctx] || window.HELP.overview; return { H: H, L: H[S.lang] || H.vi }; }
  function helpCtxNow() {
    if (!me()) return { ctx: 'login' };
    if (S.task) return { ctx: 'task', obj: S.task };
    if (S.tab === 'apps' && S.sub) return { ctx: window.HELP[S.sub] ? S.sub : 'apps' };
    if (S.tab === 'chat' && S.conv && (S.chatOpen || !narrow())) return LW.isAgentId(S.conv) ? { ctx: 'agentchat', obj: S.conv } : { ctx: 'conv', obj: S.conv };
    return { ctx: S.tab };
  }
  function openHelp(ctx, obj) {
    closeMenu();
    var same = S.help && S.help.ctx === ctx && S.help.obj === (obj || null);
    S.help = { ctx: ctx, obj: obj || null, tab: same ? S.help.tab : 'guide', anim: !S.help };
    renderHelp();
  }
  function closeHelp() { S.help = null; var r = document.getElementById('help'); r.hidden = true; r.innerHTML = ''; syncLock(); }
  function closeHelpIfNarrow() { if (narrow()) closeHelp(); }
  function helpKey() { return S.help.ctx + ':' + (S.help.obj || ''); }
  function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }
  function objLabel(ctx, obj) {
    if (!obj) return '';
    if (ctx === 'task' || ctx === 'return') { var x = LW.task(obj); return x ? x.ttl : ''; }
    if (ctx === 'conv') { var c = LW.chan(obj); return c ? '#' + c.n : ''; }
    if (ctx === 'agentchat' || ctx === 'agentScope') { var a = LW.agent(obj); return a ? a.id + ' · ' + a.n : ''; }
    return '';
  }
  function helpLog() {
    var k = helpKey(), u = me(), L = helpDoc(S.help.ctx).L, ol = objLabel(S.help.ctx, S.help.obj);
    if (!S.hlog[k]) S.hlog[k] = [{ r: 'a', t: (u ? t('h.hello', u.n.split(' ').slice(-1)[0], L.title) : t('h.helloAnon', L.title)) + (ol ? '\n' + t('h.about', ol) : ''), acts: [] }];
    return S.hlog[k];
  }
  function renderHelp() {
    var h = S.help, root = document.getElementById('help');
    if (!h) { root.hidden = true; root.innerHTML = ''; return; }
    var d = helpDoc(h.ctx), L = d.L, ol = objLabel(h.ctx, h.obj), body;
    if (h.tab === 'guide') {
      var qs = uniq((L.faq || []).map(function (f) { return f[0]; }).concat(L.suggest || []));
      body = '<div class="h-body">' + (ol ? '<div class="h-obj">' + ic(d.H.icon || 'info', 'xs') + '<span>' + esc(t('h.about', ol)) + '</span></div>' : '') +
        '<p class="h-intro">' + esc(L.intro) + '</p>' +
        (L.steps && L.steps.length ? '<div class="h-sec"><h4>' + t('h.steps') + '</h4><ol class="h-steps">' + L.steps.map(function (s, i) { return '<li><span>' + (i + 1) + '</span><p>' + esc(s) + '</p></li>'; }).join('') + '</ol></div>' : '') +
        (L.tips && L.tips.length ? '<div class="h-sec"><h4>' + t('h.tips') + '</h4>' + L.tips.map(function (s) { return '<div class="h-tip">' + ic('spark', 'xs') + '<p>' + esc(s) + '</p></div>'; }).join('') + '</div>' : '') +
        (L.rules && L.rules.length ? '<div class="h-sec"><h4>' + t('h.rules') + '</h4><div class="h-rules">' + L.rules.map(function (s) { return '<div>' + ic('lock', 'xs') + '<p>' + esc(s) + '</p></div>'; }).join('') + '</div></div>' : '') +
        (qs.length ? '<div class="h-sec"><h4>' + t('h.faq') + '</h4><div class="h-faq">' + qs.map(function (q) { return '<button class="h-q" data-act="help-q" data-q="' + esc(q) + '">' + ic('chat', 'xs') + '<span>' + esc(q) + '</span>' + ic('chev', 'xs') + '</button>'; }).join('') + '</div></div>' : '') +
        (d.H.related && d.H.related.length ? '<div class="h-sec"><h4>' + t('h.related') + '</h4><div class="chips">' + d.H.related.map(function (r) { var R = window.HELP[r]; return R ? '<button class="pill act" data-act="help" data-h="' + r + '">' + ic(R.icon || 'info', 'xs') + esc((R[S.lang] || R.vi).title) + '</button>' : ''; }).join('') + '</div></div>' : '') +
        '</div><div class="h-foot"><button class="btn pri big" data-act="help-tab" data-id="chat">' + ic('spark') + t('h.askThis') + '</button></div>';
    } else {
      var log = helpLog();
      body = '<div class="h-body chat"><p class="h-sim">' + ic('info', 'xs') + '<span>' + t('h.sim') + '</span></p>' + log.map(function (m, i) {
        if (m.r === 'typing') return '<div class="h-msg a"><span class="av tile ink sm">' + ic('spark') + '</span><div class="h-bub typing" aria-label="' + t('h.typing') + '"><i></i><i></i><i></i></div></div>';
        if (m.r === 'u') return '<div class="h-msg u"><div class="h-bub">' + esc(m.t) + '</div></div>';
        return '<div class="h-msg a"><span class="av tile ink sm">' + ic('spark') + '</span><div class="h-w"><div class="h-bub">' + esc(m.t) + '</div>' +
          (m.acts && m.acts.length ? '<div class="h-acts">' + m.acts.map(function (a, j) { return '<button class="chipbtn' + (a.primary ? ' dark' : '') + '" data-act="help-run" data-m="' + i + '" data-a="' + j + '">' + ic(a.icon || 'chev', 'xs') + esc(a.label) + '</button>'; }).join('') + '</div>' : '') + '</div></div>';
      }).join('') + '</div>' +
        '<div class="h-foot"><div class="sugg">' + (L.suggest || []).map(function (q) { return '<button class="pill act" data-act="help-q" data-q="' + esc(q) + '">' + esc(q) + '</button>'; }).join('') + '</div>' +
        '<form data-form="help-ask" class="composer"><textarea name="q" rows="1" required placeholder="' + esc(t('h.ph', L.title)) + '"></textarea><button class="send" aria-label="' + t('send') + '">' + ic('send') + '</button></form></div>';
    }
    root.innerHTML = '<div class="h-scrim' + (h.anim ? ' enter' : '') + '" data-act="help-x"></div><aside class="help' + (h.anim ? ' enter' : '') + '" role="dialog" aria-label="' + esc(t('h.help')) + '">' +
      '<div class="grab"></div><header class="h-top"><span class="av tile ink md">' + ic('help') + '</span><div class="tt"><small>' + t('h.assistant') + '</small><h1>' + esc(L.title) + '</h1></div>' +
      (h.tab === 'chat' ? ib('refresh', 'help-clear', '', t('h.clear')) : '') + ib('close', 'help-x', '', t('close')) + '</header>' +
      '<div class="h-seg"><button class="' + (h.tab === 'guide' ? 'on' : '') + '" data-act="help-tab" data-id="guide">' + ic('book', 'xs') + t('h.guide') + '</button><button class="' + (h.tab === 'chat' ? 'on' : '') + '" data-act="help-tab" data-id="chat">' + ic('spark', 'xs') + t('h.ask') + '</button></div>' +
      body + '</aside>';
    h.anim = false;
    root.hidden = false;
    var b = root.querySelector('.h-body.chat'); if (b) b.scrollTop = b.scrollHeight;
    syncLock();
  }
  function helpAsk(q) {
    q = String(q || '').trim(); if (!q || !S.help) return;
    S.help.tab = 'chat';
    var log = helpLog(); log.push({ r: 'u', t: q }); log.push({ r: 'typing' });
    renderHelp();
    var key = helpKey(), ctx = S.help.ctx, obj = S.help.obj;
    setTimeout(function () {
      var L2 = S.hlog[key]; if (!L2) return;
      var ans; try { ans = assist(ctx, obj, q); } catch (e) { ans = { t: t('a.fallback') }; if (window.console) console.error(e); }
      var i = L2.findIndex(function (m) { return m.r === 'typing'; }), msg = { r: 'a', t: ans.t, acts: ans.acts || [] };
      if (i >= 0) L2.splice(i, 1, msg); else L2.push(msg);
      if (S.help && helpKey() === key) { renderHelp(); var ta = document.querySelector('#help textarea'); if (ta && !narrow()) ta.focus(); }
    }, 420 + Math.min(700, q.length * 12));
  }

  function bl(list) { return list.map(function (x) { return '· ' + x; }).join('\n'); }
  function taskLine(x) { return '[' + x.pr + '] ' + x.ttl + ' — ' + stName(x.st) + ', ' + (x.as ? name(x.as) : t('unassigned')) + ', ' + fmtDate(x.due); }
  function goTask(x) { return { label: t('a.go.open', clip(x.ttl, 34)), icon: 'eye', run: function () { closeHelpIfNarrow(); openTask(x.id); render(); } }; }
  function assist(ctx, obj, q) {
    var u = me(), s = norm(q), L = helpDoc(ctx).L;
    // 1 · câu hỏi thường gặp của đúng ngữ cảnh
    var best = null, bestScore = 0;
    (L.faq || []).forEach(function (f) {
      var sc = norm(f[0]) === s ? 5 : 0;
      f[1].split('|').forEach(function (k) { if (k && s.indexOf(k) >= 0) sc += k.length > 6 ? 2 : 1; });
      if (sc > bestScore) { bestScore = sc; best = f; }
    });
    if (best && bestScore >= 2) return { t: best[2] };
    if (!u) return { t: best ? best[2] : t('a.fallback') };
    var vis = LW.visibleTasks(u);

    // 2 · quyền trên đúng đối tượng đang xem — dùng lại đúng menu hành động, nên lý do khớp luật
    var aboutPerm = /(tai sao|vi sao|sao khong|khong duoc|khong the|bi khoa|bi chan|lam duoc gi|duoc lam gi|why|cannot|can.?t|not allowed|what can i)/.test(s);
    if (aboutPerm && obj) {
      var spec = null;
      if ((ctx === 'task' || ctx === 'return') && LW.task(obj)) spec = taskMenu(LW.task(obj), u);
      else if ((ctx === 'agentchat' || ctx === 'agentScope') && LW.agent(obj)) spec = agentMenu(LW.agent(obj), u);
      else if (ctx === 'conv' && LW.chan(obj)) spec = convMenu(obj, u);
      if (spec) {
        var okL = [], noL = [];
        spec.items.forEach(function (it) { if (it.sep || it.icon === 'help') return; if (it.disabled) noL.push(it.label + ' — ' + it.reason); else okL.push(it.label); });
        var txt = t('a.can', spec.title) + '\n' + bl(okL) + (noL.length ? '\n\n' + t('a.cannot') + '\n' + bl(noL) : '');
        if ((ctx === 'task' || ctx === 'return') && /(duyet|approv)/.test(s) && LW.task(obj).own !== u.id) txt += '\n\n' + t('a.whyOwner');
        return { t: txt, acts: (ctx === 'task' || ctx === 'return') ? [goTask(LW.task(obj))] : [] };
      }
    }
    // 3 · duyệt
    if (/(duyet|review|approv)/.test(s)) {
      if (obj && (ctx === 'task' || ctx === 'return') && LW.task(obj)) {
        var x = LW.task(obj);
        return { t: t('a.review.task', name(x.own)) + ' ' + (x.own === u.id ? t('a.review.you', x.st === 'cho_duyet' ? t('a.review.youNow') : t('a.review.youLater')) : t('a.review.notYou')) + '\n\n' + t('a.whyOwner'), acts: [goTask(x)] };
      }
      var ap = vis.filter(function (y) { return y.st === 'cho_duyet' && y.own === u.id; });
      if (!ap.length) return { t: t('a.review.none') + '\n\n' + t('a.whyOwner') };
      return { t: t('a.review.list', ap.length) + '\n' + bl(ap.map(taskLine)), acts: ap.slice(0, 3).map(goTask).concat([{ label: t('a.go.review'), icon: 'approve', primary: true, run: function () { closeHelpIfNarrow(); ACT['goto-review'](); } }]) };
    }
    // 4 · quá hạn
    if (/(qua han|tre han|bi tre|overdue|late)/.test(s)) {
      var od = vis.filter(overdue);
      return od.length ? { t: t('a.late.list', od.length) + '\n' + bl(od.map(taskLine)), acts: od.slice(0, 3).map(goTask) } : { t: t('a.late.none') };
    }
    // 5 · bốn điều cấm
    if (/(dieu cam|bon dieu|cam tuyet doi|forbid|prohibit|gui email ra ngoai|xoa du lieu)/.test(s)) {
      return { t: t('a.forbid') + '\n' + bl(LW.FORBIDDEN.map(function (f) { return (S.lang === 'en' ? f.en : f.vi) + ' — ' + (S.lang === 'en' ? f.why_en : f.why_vi); })) };
    }
    // 6 · phạm vi agent
    if (/(pham vi|scope|thay duoc gi|doc duoc|nhin thay gi|can see|agent nao|agents do i own|toi chu tri)/.test(s)) {
      var aa = obj && LW.agent(obj) ? [LW.agent(obj)] : DB.agents.filter(function (a) { return a.sc.own === u.id; });
      if (!aa.length) return { t: t('a.scope.noneMine') };
      var lines = aa.map(function (a) { return t('a.scope.one', a.id + ' ' + a.n, a.sc.reads.map(function (r) { return t('read.' + r); }).join(', '), a.sc.can.map(function (c) { return t('can.' + c); }).join(', '), name(a.sc.own), a.sc.review ? t('a.scope.rv') : t('a.scope.direct'), LW.runsToday(a), a.sc.limit); });
      return { t: (obj && LW.agent(obj) ? '' : t('a.scope.mine') + '\n\n') + lines.join('\n\n'), acts: u.role !== 'guest' ? [{ label: t('a.go.agents'), icon: 'bot', run: function () { closeHelpIfNarrow(); openSub('agents'); } }] : [] };
    }
    // 7 · vai trò và quyền
    if (/(vai tro|quyen|role|permission|lam duoc gi|duoc lam gi)/.test(s)) {
      var rows = Object.keys(LW.PERM).map(function (k) { return (LW.PERM[k].indexOf(u.role) >= 0 ? '✓ ' : '✗ ') + t('perm.' + k); });
      return { t: t('a.role', roleName(u.role)) + '\n' + rows.join('\n') + '\n\n' + t('a.role.proj', LW.projsOf(u).join(', ')), acts: u.role !== 'guest' ? [{ label: t('a.go.matrix'), icon: 'lock', run: function () { closeHelpIfNarrow(); openSub('matrix'); } }] : [] };
    }
    // 8 · tạo và giao việc
    if (/(tao viec|giao viec|them viec|viec moi|create|assign|new task)/.test(s)) {
      if (!LW.can('create', u)) return { t: t('a.create.no') };
      return { t: t('a.create') + (LW.can('assignOthers', u) ? '' : '\n\n' + t('a.create.mem')), acts: [{ label: t('a.go.new'), icon: 'plus', primary: true, run: function () { closeHelp(); newTask({}); } }] };
    }
    // 9 · tin nhắn thành việc
    if (/(tin nhan.*viec|chuyen thanh viec|message.*task|turn .*task)/.test(s)) return { t: t('a.msgTask'), acts: [{ label: t('a.go.chat'), icon: 'chat', run: function () { closeHelpIfNarrow(); S.tab = 'chat'; S.sub = null; S.task = null; render(); } }] };
    // 10 · luồng
    if (/(luong|flow|khoi chay|launch)/.test(s)) return { t: t('a.flows') + ' ' + (LW.can('launchFlow', u) ? t('a.flows.can') : t('a.flows.cannot')), acts: u.role !== 'guest' ? [{ label: t('a.go.flows'), icon: 'flow', run: function () { closeHelpIfNarrow(); openSub('flows'); } }] : [] };
    // 11 · Ledger
    if (/(ledger|troi pham vi|drift)/.test(s)) return { t: t('a.ledger') + ' ' + (LW.can('approve', u) ? t('a.ledger.can') : t('a.ledger.cannot')), acts: [{ label: t('a.go.ledger'), icon: 'book', run: function () { closeHelpIfNarrow(); openSub('ledger'); } }] };
    // 12 · phím tắt, menu
    if (/(phim tat|shortcut|ban phim|keyboard)/.test(s)) return { t: t('a.keys') };
    if (/(menu|nhan giu|chuot phai|···|long press|right.?click|bi mo|greyed|grey)/.test(s)) return { t: t('a.menu'), acts: [{ label: t('a.go.menu'), icon: 'more', run: function () { openHelp('menu'); } }] };
    // 13 · tải việc
    if (/(tai viec|cong suat|workload|capacity|qua tai)/.test(s)) {
      var team = DB.people.filter(function (p) { return p.role !== 'guest'; }).map(function (p) { return p.n + ': ' + LW.openLoad(p.id) + '/' + p.cap + (LW.openLoad(p.id) > p.cap ? ' ⚠' : ''); });
      return { t: t('a.load', LW.openLoad(u.id), u.cap) + (LW.seeTeam(u) ? '\n\n' + t('a.load.team') + '\n' + bl(team) : '') };
    }
    if (best && bestScore >= 1) return { t: best[2] };
    if (/^(xin chao|chao|hello|hi|hey)\b/.test(s)) return { t: t('a.greet', L.title) };
    return { t: t('a.fallback') };
  }

  /* ============================================================
     HÀNH ĐỘNG
     ============================================================ */
  function openTask(id) { if (S.task !== id) S.anim = true; S.task = id; closeMenu(); closeModal(); }
  function doApprove(id) { if (guard(function () { LW.approve(id, S.uid); })) { toast(t('approved')); render(); } }
  function returnForm(id) { modal(t('ret.title'), returnFormHtml(id), false, 'return', id); }
  function doSt(id, st) { if (guard(function () { LW.updateTask(id, { st: st }, S.uid); })) { toast(t('moved', stName(st))); render(); } }
  function doRun(id, btn) {
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="spin"></i>' + t('running'); }
    setTimeout(function () { var x; if (guard(function () { x = LW.runAgent(id, S.uid); })) toast(t('ran', x.as, stName(x.st))); render(); }, btn ? 650 : 0);
  }
  function doDelete(id) { if (!confirm(t('del.confirm'))) return; if (guard(function () { LW.deleteTask(id, S.uid); })) { S.task = null; toast(t('deleted')); render(); } }
  function copyText(s) { try { navigator.clipboard.writeText(s).then(function () { toast(t('copied')); }, function () { toast(t('copyFail'), true); }); } catch (e) { toast(t('copyFail'), true); } }
  function newTask(pre) { modal(t('newTask'), newTaskForm(me(), pre), false, 'newtask'); }
  function newTaskFromMsg(id) { var m = DB.msgs.find(function (x) { return x.id === id; }); modal(t('toTask'), newTaskForm(me(), { msg: m, ttl: clip(m.t, 90), pr: projOfChan(m.ch) })); }
  function gotoMsg(id) {
    var m = DB.msgs.find(function (x) { return x.id === id; }), u = me();
    if (!m || !LW.seeChan(LW.chan(m.ch), u)) { toast(t('err.notFound'), true); return; }
    S.tab = 'chat'; S.sub = null; S.conv = m.ch; S.chatOpen = true; S.task = null; S.hl = m.id; S.chatF = 'all'; render();
    var n = document.getElementById('msg-' + m.id); if (n) n.scrollIntoView({ block: 'center' });
  }
  function openConv(id) { S.tab = 'chat'; S.sub = null; S.conv = id; S.chatOpen = true; S.hl = null; S.task = null; closeModal(); render(); }
  function openSub(id) { S.tab = 'apps'; S.sub = id; S.task = null; closeModal(); render(); scrollTop(); }
  function setLang() { S.lang = S.lang === 'vi' ? 'en' : 'vi'; put('lw.lang', S.lang); closeMenu(); render(); }
  function doLogout() { closeHelp(); S.hlog = {}; S.uid = null; put('lw.session', null); S.task = null; S.tab = 'home'; S.sub = null; closeMenu(); closeModal(); render(); scrollTop(); }
  function doReset() { if (!confirm(t('reset.confirm'))) return; DB = LW.reset(); doLogout(); toast(t('reset.done')); }
  function projOfChan(ch) { var c = LW.chan(ch); if (!c) return ''; if (/pka/.test(c.n)) return 'PKA'; if (/web/.test(c.n)) return 'WEB'; return ''; }

  var ACT = {
    'tab': function (el) { S.tab = el.dataset.id; S.sub = null; S.task = null; if (S.tab === 'chat') S.chatOpen = false; closeMenu(); render(); scrollTop(); },
    'help': function (el) { openHelp(el.dataset.h, el.dataset.o); },
    'help-x': function () { closeHelp(); },
    'help-tab': function (el) { if (S.help) { S.help.tab = el.dataset.id; renderHelp(); } },
    'help-q': function (el) { helpAsk(el.dataset.q); },
    'help-run': function (el) { var m = helpLog()[+el.dataset.m], a = m && m.acts && m.acts[+el.dataset.a]; if (a) a.run(); },
    'help-clear': function () { if (S.help) { delete S.hlog[helpKey()]; renderHelp(); } },
    'tip-x': function () { put('lw.tipHelp', '1'); render(); },
    'ctx': function (el) { var spec = ctxFor(el.dataset.ctx, me()); if (spec) openMenu(spec, el); },
    'lang': setLang,
    'about': function () { modal(t('about.title'), '<div class="about">' + t('about.body') + '</div>', true, 'overview'); },
    'reset': doReset,
    'logout': doLogout,
    'fill-login': function (el) { var f = document.querySelector('[data-form=login]'); f.mail.value = el.dataset.mail; f.pw.value = LW.DEMO_PW; Array.prototype.forEach.call(document.querySelectorAll('.demo-u'), function (b) { b.classList.toggle('on', b === el); }); f.querySelector('button').focus(); },
    'modal-x': closeModal,
    'open-task': function (el) { openTask(el.dataset.id); render(); },
    'close-task': function () { S.task = null; render(); },
    'approve': function (el) { doApprove(el.dataset.id); },
    'return': function (el) { returnForm(el.dataset.id); },
    'st': function (el) { doSt(el.dataset.id, el.dataset.st); },
    'run': function (el) { doRun(el.dataset.id, el); },
    'copy': function (el) { var x = LW.task(el.dataset.id), e = x && x.thr.find(function (y) { return y.at === el.dataset.at; }); if (e) copyText(e.t); },
    'new-task': function () { newTask({}); },
    'goto-review': function () { S.tab = 'tasks'; S.sub = null; S.col = 'cho_duyet'; S.f = { pr: '', kind: '', mine: false }; render(); scrollTop(); },
    'goto-mine': function () { S.tab = 'tasks'; S.col = 'dang_lam'; S.f = { pr: '', kind: '', mine: true }; render(); scrollTop(); },
    'goto-late': function () { S.tab = 'tasks'; S.col = 'dang_lam'; S.f = { pr: '', kind: '', mine: false }; render(); scrollTop(); },
    'goto-chat': function (el) { S.tab = 'chat'; S.sub = null; S.chatF = el.dataset.f || 'all'; S.chatOpen = false; render(); scrollTop(); },
    'open-sub': function (el) { openSub(el.dataset.id); },
    'close-sub': function () { S.sub = null; render(); scrollTop(); },
    'col': function (el) { S.col = el.dataset.id; render(); },
    'clear-f': function (el) { var k = el.dataset.k; S.f[k] = k === 'mine' ? false : ''; render(); },
    'open-conv': function (el) { openConv(el.dataset.id); },
    'close-conv': function () { S.chatOpen = false; render(); },
    'chat-f': function (el) { S.chatF = el.dataset.id; render(); },
    'chan-new': function () { modal(t('chan.new'), chanForm(me()), false, 'conv'); },
    'dm-q': function (el) { if (guard(function () { LW.dmSend(S.conv, S.uid, el.dataset.q); })) render(); },
    'goto-msg': function (el) { gotoMsg(el.dataset.id); },
    'agent-open': function (el) { var a = LW.agent(el.dataset.id); modal(a.id + ' · ' + a.n, agentForm(me(), a), true, 'agentScope', a.id); },
    'person-new': function () { modal(t('team.addPerson'), personForm(null), false, 'people'); },
    'agent-new': function () { modal(t('team.addAgent'), agentForm(me(), null), true, 'agentScope'); },
    'flow-launch': function (el) { var f = DB.flows.find(function (x) { return x.id === el.dataset.id; }); modal(t('flow.launch') + ' · ' + f.n, launchForm(me(), f), true, 'flows'); },
    'ledger-pr': function (el) { S.ledgerPr = el.dataset.id; render(); },
    'probe': function (el) {
      var r = LW.probeForbidden(el.dataset.id);
      document.getElementById('probe-out').innerHTML = '<div class="probe-l">' + r.results.map(function (x) { return '<div class="' + (x.blocked ? 'ok' : 'bad') + '"><span class="pill ' + (x.blocked ? 'dark' : 'red') + '">' + ic(x.blocked ? 'lock' : 'close', 'xs') + (x.blocked ? t('probe.blocked') : t('probe.passed')) + '</span><b>' + esc(S.lang === 'en' ? x.rule.en : x.rule.vi) + '</b><code>' + esc(x.code) + '</code></div>'; }).join('') + '</div><p class="fine">' + (r.unchanged ? t('probe.unchanged') : t('probe.changed')) + '</p>';
    },
    'secret-reset': function (el) {
      modal(t('secret.set'), '<form data-form="secret" data-g="' + el.dataset.g + '" data-f="' + el.dataset.f + '" class="stack"><label class="fld">' + t('secret.value') + '<input type="password" name="v" required autocomplete="off"></label><p class="fine">' + t('secret.note') + '</p><div class="dlg-f"><button type="button" class="btn" data-act="modal-x">' + t('cancel') + '</button><button class="btn pri">' + t('secret.set') + '</button></div></form>', false, 'settings');
    }
  };

  var FORM = {
    'help-ask': function (fm) { var q = fm.q.value; fm.q.value = ''; helpAsk(q); },
    'login': function (fm) { var p; if (guard(function () { p = LW.login(fm.mail.value, fm.pw.value); })) { S.uid = p.id; put('lw.session', p.id); S.tab = 'home'; render(); scrollTop(); } },
    'return': function (fm) { if (guard(function () { LW.sendBack(fm.dataset.id, S.uid, fm.reason.value); })) { closeModal(); toast(t('returned')); render(); } },
    'task-save': function (fm) {
      var u = me(), x = LW.task(fm.dataset.id), d = formData(fm), patch = {};
      if (d.ttl !== undefined && d.ttl.trim() !== x.ttl) patch.ttl = d.ttl.trim();
      if (d.note !== undefined && d.note !== x.note) patch.note = d.note;
      if (d.due !== undefined && (d.due || null) !== (x.due || null)) patch.due = d.due || null;
      if (d.pr !== undefined && d.pr !== x.pr) patch.pr = d.pr;
      if (d.as !== undefined && (d.as || null) !== (x.as || null)) patch.as = d.as || null;
      if (d.own !== undefined && d.own !== x.own && !(patch.as && LW.isAgentId(patch.as))) patch.own = d.own;
      if (fm.gate && !fm.gate.disabled && fm.gate.checked !== !!x.gate) patch.gate = fm.gate.checked;
      if (!Object.keys(patch).length) { toast(t('noChange')); return; }
      if (patch.as && !LW.isAgentId(patch.as)) { var p = LW.person(patch.as); if (LW.openLoad(p.id) >= p.cap && !confirm(t('capWarn', p.n, LW.openLoad(p.id), p.cap))) return; }
      if (guard(function () { LW.updateTask(x.id, patch, u.id); })) { toast(t('saved')); render(); }
    },
    'comment': function (fm) { if (guard(function () { LW.comment(fm.dataset.id, S.uid, fm.t.value); })) { render(); var d = document.querySelector('.page-b'); if (d) d.scrollTop = d.scrollHeight; } },
    'new-task': function (fm) { createFrom(fm, null); },
    'msg-task': function (fm) { createFrom(fm, fm.dataset.id); },
    'msg': function (fm) { if (guard(function () { LW.postMsg(S.conv, S.uid, fm.t.value); })) render(); },
    'dm': function (fm) { var q = fm.q.value; if (guard(function () { LW.dmSend(S.conv, S.uid, q); })) render(); },
    'chan': function (fm) { var d = formData(fm); if (guard(function () { LW.saveChan({ id: fm.dataset.id, n: d.n, d: d.d, mem: d.mem || [] }, S.uid); })) { closeModal(); render(); toast(t('saved')); } },
    'flow-launch': function (fm) {
      var d = formData(fm), people = {}, made;
      Object.keys(d).forEach(function (k) { if (/^step\d+$/.test(k)) people[k.slice(4)] = d[k]; });
      if (guard(function () { made = LW.launchFlow(fm.dataset.id, { pr: d.pr, start: d.start, people: people }, S.uid); })) { closeModal(); S.tab = 'tasks'; S.sub = null; S.f = { pr: d.pr, kind: '', mine: false }; S.col = 'dang_lam'; render(); scrollTop(); toast(t('flow.made', made.length)); }
    },
    'person': function (fm) { var d = formData(fm); if (guard(function () { LW.savePerson({ id: fm.dataset.id, n: d.n, mail: d.mail, r: d.r, role: d.role, cap: d.cap, proj: d.proj || [] }, S.uid); })) { closeModal(); render(); toast(t('saved')); } },
    'profile': function (fm) { var d = formData(fm), f = { n: d.n, ini: d.ini, r: d.r, bio: d.bio }; if (d.av) f.av = d.av; if (guard(function () { LW.updateSelf(S.uid, f); })) { closeModal(); render(); toast(t('saved')); } },
    'pw': function (fm) { if (guard(function () { LW.changePw(S.uid, fm.old.value, fm.nw.value); })) { fm.reset(); toast(t('pw.done')); } },
    'agent': function (fm) { var d = formData(fm); if (guard(function () { LW.saveAgent({ id: d.id, n: d.n, r: d.r, p: d.p, sc: { own: d.own, reads: d.reads || [], can: d.can || [], review: !!d.review, limit: d.limit } }, S.uid, !!fm.dataset.new); })) { closeModal(); render(); toast(t('saved')); } },
    'cfg': function (fm) {
      var g = fm.dataset.g, d = formData(fm);
      if (g === 'mail' && typeof d.n === 'string') d.n = d.n.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
      if (g === 'ai') d.tok = parseInt(d.tok, 10) || 0;
      if (guard(function () { LW.saveCfg(g, d, S.uid); })) { render(); toast(t('saved')); }
    },
    'secret': function (fm) { if (guard(function () { LW.setSecret(fm.dataset.g, fm.dataset.f, fm.v.value, S.uid); })) { closeModal(); render(); toast(t('secret.done')); } },
    'ledger-add': function (fm) { if (guard(function () { LW.editLedger(S.ledgerPr, fm.item.value, fm.src.value, S.uid); })) { render(); toast(t('saved')); } },
    'rate': function (fm) { if (guard(function () { LW.addRate(fm.k.value, fm.n.value, fm.d.value, S.uid); })) { render(); toast(t('saved')); } }
  };
  function createFrom(fm, msgId) {
    var d = formData(fm), u = me(), x;
    var f = { ttl: d.ttl, pr: d.pr, as: d.as || null, due: d.due || null, note: d.note || '', gate: !!d.gate };
    if (f.as && !LW.isAgentId(f.as)) { var p = LW.person(f.as); if (LW.openLoad(p.id) >= p.cap && !confirm(t('capWarn', p.n, LW.openLoad(p.id), p.cap))) return; }
    if (guard(function () { x = msgId ? LW.msgToTask(msgId, f, u.id) : LW.createTask(f, u.id); })) { closeModal(); openTask(x.id); S.col = x.st; render(); toast(t('created')); }
  }

  /* ============================================================
     SỰ KIỆN — chạm, nhấn giữ, chuột phải, bàn phím
     ============================================================ */
  var press = { timer: null, fired: false, x: 0, y: 0 };
  document.addEventListener('click', function (e) {
    if (press.fired) { press.fired = false; e.preventDefault(); e.stopPropagation(); return; }
    var mroot = document.getElementById('ctx');
    if (!mroot.hidden && mroot.contains(e.target)) {
      var mi = e.target.closest('[data-mi]');
      if (mi) { var it = S.menu.items[+mi.dataset.mi]; closeMenu(); if (it && it.run) it.run(); return; }
      if (e.target.closest('[data-close]')) { closeMenu(); return; }
      var off = e.target.closest('[data-mi-off]');
      if (off) { off.classList.remove('shake'); void off.offsetWidth; off.classList.add('shake'); }
      return;
    }
    var el = e.target.closest('[data-act]');
    if (!el) return;
    var fn = ACT[el.dataset.act];
    if (fn) { e.preventDefault(); fn(el, e); }
  }, true);
  document.addEventListener('contextmenu', function (e) {
    var host = e.target.closest('[data-ctx]'); if (!host || !me()) return;
    if (e.target.closest('input,textarea,select')) return;
    var spec = ctxFor(host.dataset.ctx, me()); if (!spec) return;
    e.preventDefault(); openMenu(spec, host, narrow() ? null : { x: e.clientX, y: e.clientY });
  });
  document.addEventListener('touchstart', function (e) {
    var host = e.target.closest('[data-ctx]'); if (!host || e.target.closest('input,textarea,select,.more')) return;
    press.fired = false; press.x = e.touches[0].clientX; press.y = e.touches[0].clientY;
    clearTimeout(press.timer);
    press.timer = setTimeout(function () {
      var spec = ctxFor(host.dataset.ctx, me()); if (!spec) return;
      press.fired = true; host.classList.add('pressed'); setTimeout(function () { host.classList.remove('pressed'); }, 200);
      if (navigator.vibrate) navigator.vibrate(12);
      openMenu(spec, host);
    }, 460);
  }, { passive: true });
  document.addEventListener('touchmove', function (e) { if (Math.abs(e.touches[0].clientX - press.x) > 8 || Math.abs(e.touches[0].clientY - press.y) > 8) clearTimeout(press.timer); }, { passive: true });
  document.addEventListener('touchend', function () { clearTimeout(press.timer); setTimeout(function () { press.fired = false; }, 400); });

  document.addEventListener('keydown', function (e) {
    var typing = /INPUT|TEXTAREA|SELECT/.test(e.target.tagName);
    var modalOpen = !document.getElementById('modal').hidden;
    if (e.key === 'Escape') { if (S.menu) closeMenu(); else if (S.help) closeHelp(); else if (modalOpen) closeModal(); else if (S.task) { S.task = null; render(); } else if (S.sub) { S.sub = null; render(); } return; }
    if (S.menu && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      var btns = Array.prototype.slice.call(document.querySelectorAll('#ctx [data-mi]')), i = btns.indexOf(document.activeElement);
      e.preventDefault(); (btns[(i + (e.key === 'ArrowDown' ? 1 : btns.length - 1)) % btns.length] || btns[0]).focus(); return;
    }
    if (e.key === 'Enter' && e.target.tagName === 'TEXTAREA' && e.target.closest('.composer') && !e.shiftKey && !e.isComposing && !narrow()) { e.preventDefault(); e.target.form.requestSubmit(); return; }
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && e.target.tagName === 'TEXTAREA' && e.target.form) { e.preventDefault(); e.target.form.requestSubmit(); return; }
    if ((e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) && e.target.closest && e.target.closest('[data-ctx]')) { e.preventDefault(); var h = e.target.closest('[data-ctx]'); var sp = ctxFor(h.dataset.ctx, me()); if (sp) openMenu(sp, h); return; }
    if (!typing && !e.metaKey && !e.ctrlKey && !e.altKey && (e.key === 'h' || e.key === 'H' || e.key === '?') && !S.menu) { e.preventDefault(); if (S.help) closeHelp(); else { var hc = helpCtxNow(); openHelp(hc.ctx, hc.obj); } return; }
    if (!typing && !e.metaKey && !e.ctrlKey && !e.altKey && me() && !modalOpen && !S.menu && !S.help) {
      if ((e.key === 'n' || e.key === 'N') && LW.can('create', me())) { e.preventDefault(); newTask({}); }
      var k = { '1': 'home', '2': 'tasks', '3': 'chat', '4': 'apps' }[e.key];
      if (k) { S.tab = k; S.sub = null; S.task = null; render(); scrollTop(); }
    }
  });
  document.addEventListener('input', function (e) {
    var ta = e.target;
    if (ta.tagName === 'TEXTAREA' && ta.closest('.composer')) { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 140) + 'px'; }
    if (ta.dataset && ta.dataset.input === 'chat-q') {
      S.q = ta.value; var pos = ta.selectionStart; render();
      var n = document.querySelector('[data-input=chat-q]'); if (n) { n.focus(); n.setSelectionRange(pos, pos); }
    }
  });
  document.addEventListener('submit', function (e) { var fm = e.target, fn = FORM[fm.dataset.form]; if (fn) { e.preventDefault(); fn(fm); } });
  document.addEventListener('change', function (e) {
    var el = e.target, k = el.dataset && el.dataset.change;
    if (k === 'role') { var fs = el.form.querySelector('.projs'); if (fs) fs.disabled = el.value === 'owner'; }
    if (k === 'avatar' && el.files && el.files[0]) {
      var rd = new FileReader();
      rd.onload = function () {
        var img = new Image();
        img.onload = function () {
          var s = Math.min(img.width, img.height), c = document.createElement('canvas');
          c.width = c.height = 160;
          c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 160, 160);
          var url = c.toDataURL('image/jpeg', 0.82);
          el.form.av.value = url;
          var old = el.form.querySelector('.avrow .av'), im = document.createElement('img'); im.className = 'av xl'; im.src = url; old.replaceWith(im);
        };
        img.src = rd.result;
      };
      rd.readAsDataURL(el.files[0]);
    }
  });

  // kéo thả thẻ trên bảng (laptop)
  document.addEventListener('dragstart', function (e) { var c = e.target.closest && e.target.closest('[data-drag]'); if (c) { e.dataTransfer.setData('text/plain', c.dataset.drag); e.dataTransfer.effectAllowed = 'move'; c.classList.add('dragging'); } });
  document.addEventListener('dragend', function (e) { var c = e.target.closest && e.target.closest('[data-drag]'); if (c) c.classList.remove('dragging'); Array.prototype.forEach.call(document.querySelectorAll('.col.over'), function (x) { x.classList.remove('over'); }); });
  document.addEventListener('dragover', function (e) { var col = e.target.closest && e.target.closest('[data-col]'); if (col) { e.preventDefault(); col.classList.add('over'); } });
  document.addEventListener('dragleave', function (e) { var col = e.target.closest && e.target.closest('[data-col]'); if (col && !col.contains(e.relatedTarget)) col.classList.remove('over'); });
  document.addEventListener('drop', function (e) {
    var col = e.target.closest && e.target.closest('[data-col]'); if (!col) return;
    e.preventDefault();
    var id = e.dataTransfer.getData('text/plain'), st = col.dataset.col, x = LW.task(id);
    if (!x || x.st === st) { render(); return; }
    if (x.st === 'cho_duyet' && st === 'dang_lam') { render(); returnForm(id); return; }
    if (x.st === 'cho_duyet' && st === 'xong') doApprove(id); else doSt(id, st);
  });

  window.addEventListener('storage', function (e) { if (e.key === LW.KEY) { DB = LW.load(); render(); } });
  var lastNarrow = narrow(), rz;
  window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { if (S.menu) closeMenu(); if (narrow() !== lastNarrow) { lastNarrow = narrow(); render(); } }, 120); });

  var VIEWS = { home: viewHome, tasks: viewTasks, chat: viewChat, apps: viewApps };
  render();
})();
