/* ══════════════ THE CALENDAR — square grid, strips either side ══════════════ */
const Cal = (() => {
  const COLORS = ['#5fd3c4', '#e9a13b', '#e0708a', '#9b8cf0', '#7ec86b', '#63a8e6'];
  let cals = Store.get('cal.cals', [
    { id: 'life', name: 'Life', color: COLORS[0], on: true },
    { id: 'work', name: 'Work', color: COLORS[1], on: true },
    { id: 'study', name: 'Study', color: COLORS[3], on: true }
  ]);
  let items = Store.get('cal.items', []);
  let mode = Store.get('cal.mode', 'month');
  let cursor = new Date();

  const save = () => { Store.set('cal.cals', cals); Store.set('cal.items', items); Store.set('cal.mode', mode); };
  const colorOf = id => (cals.find(c => c.id === id) || { color: '#5fd3c4' }).color;
  const visible = i => { const c = cals.find(c => c.id === i.cal); return !c || c.on; };
  const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  /* ---------- left strip ---------- */
  function renderCals() {
    const ul = document.getElementById('calList'); ul.innerHTML = '';
    cals.forEach(c => {
      const li = el('li', c.on ? '' : 'off');
      li.innerHTML = `<i class="dot" style="background:${c.color}"></i><span>${esc(c.name)}</span>`;
      li.onclick = () => { c.on = !c.on; save(); renderCals(); grid(); };
      if (c.id !== 'life') {
        const x = el('button', 'x', '✕'); x.style.opacity = .6; x.style.marginLeft = 'auto';
        x.onclick = e => { e.stopPropagation(); cals = cals.filter(k => k !== c); items = items.filter(i => i.cal !== c.id); save(); renderCals(); fillSelect(); grid(); };
        li.appendChild(x);
      }
      ul.appendChild(li);
    });
  }
  function fillSelect() {
    const s = document.getElementById('wsCal');
    s.innerHTML = cals.filter(c => !c.ro).map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('');
  }

  /* ---------- right strip ---------- */
  function renderWs() {
    const ul = document.getElementById('wsList'); ul.innerHTML = '';
    const open = items.filter(i => !i.date && visible(i));
    document.getElementById('wsCount').textContent = open.length;
    open.forEach(i => ul.appendChild(chip(i, true)));
    ul.ondragover = e => { e.preventDefault(); ul.classList.add('drop'); };
    ul.ondragleave = () => ul.classList.remove('drop');
    ul.ondrop = e => {
      e.preventDefault(); ul.classList.remove('drop');
      const it = items.find(x => x.id === e.dataTransfer.getData('text/plain'));
      if (it && !it.ro) { it.date = null; save(); renderWs(); grid(); }
    };
  }
  function tint(hex, a) {
    if (!hex || hex[0] !== '#') return 'transparent';
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
  }
  function chip(i, full) {
    const li = el('li', 'ws-item' + (i.kind === 'note' ? ' note' : ''));
    const c = colorOf(i.cal);
    li.style.borderLeftColor = c;
    li.style.background = tint(c, .14);
    li.draggable = true;
    li.innerHTML = `<div>${esc(i.text)}</div>${full ? `<div class="meta">${i.kind.toUpperCase()} · ${(cals.find(c => c.id === i.cal) || {}).name || ''}</div>` : ''}<button class="x">✕</button>`;
    li.ondragstart = e => e.dataTransfer.setData('text/plain', i.id);
    li.querySelector('.x').onclick = () => { items = items.filter(x => x !== i); save(); renderWs(); grid(); };
    return li;
  }

  /* ---------- the square ---------- */
  function grid() {
    const box = document.getElementById('calSquare'); box.innerHTML = '';
    const title = document.getElementById('calTitle');
    const today = iso(new Date());

    if (mode === 'month' || mode === 'week') {
      const dow = el('div', 'dow');
      ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(d => dow.appendChild(el('span', '', d)));
      box.appendChild(dow);
    }

    if (mode === 'month') {
      title.textContent = `${MON[cursor.getMonth()]} ${cursor.getFullYear()}`;
      const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
      // JavaScript numbers Sunday as 0, which is exactly the first column
      // for this calendar.
      const shift = first.getDay();
      const g = el('div', 'grid-m');
      for (let n = 0; n < 42; n++) {
        const d = new Date(first); d.setDate(1 - shift + n);
        g.appendChild(cell(d, d.getMonth() !== cursor.getMonth(), today, 3));
      }
      box.appendChild(g);
    }
    else if (mode === 'week') {
      const s = new Date(cursor); s.setDate(s.getDate() - s.getDay());
      const e = new Date(s); e.setDate(e.getDate() + 6);
      title.textContent = `${s.getDate()} ${MON[s.getMonth()].slice(0, 3)} – ${e.getDate()} ${MON[e.getMonth()].slice(0, 3)} ${e.getFullYear()}`;
      const g = el('div', 'grid-w');
      for (let n = 0; n < 7; n++) { const d = new Date(s); d.setDate(s.getDate() + n); g.appendChild(cell(d, false, today, 20)); }
      box.appendChild(g);
    }
    else if (mode === 'day') {
      title.textContent = cursor.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      const g = el('div', 'grid-d');
      const k = iso(cursor);
      const list = items.filter(i => i.date === k && visible(i));
      if (!list.length) g.appendChild(el('div', 'shelf-empty', 'Nothing on this day. Drag something over from the workspace.'));
      const ul = el('ul', 'ws-list'); list.forEach(i => ul.appendChild(chip(i, true)));
      g.appendChild(ul);
      g.ondragover = e => e.preventDefault();
      g.ondrop = e => drop(e, k);
      box.appendChild(g);
    }
    else {
      title.textContent = String(cursor.getFullYear());
      const g = el('div', 'grid-y');
      for (let m = 0; m < 12; m++) {
        const mini = el('div', 'mini');
        mini.innerHTML = `<b>${MON[m].slice(0, 3)}</b>`;
        const mg = el('div', 'mg');
        const days = new Date(cursor.getFullYear(), m + 1, 0).getDate();
        for (let d = 1; d <= days; d++) {
          const k = iso(new Date(cursor.getFullYear(), m, d));
          const i = el('i'); if (items.some(x => x.date === k && visible(x))) i.className = 'has';
          mg.appendChild(i);
        }
        mini.appendChild(mg);
        mini.onclick = () => { cursor = new Date(cursor.getFullYear(), m, 1); mode = 'month'; segs(); save(); grid(); };
        g.appendChild(mini);
      }
      box.appendChild(g);
    }
  }
  function cell(d, out, today, cap) {
    const k = iso(d);
    const c = el('div', 'cell' + (out ? ' out' : '') + (k === today ? ' today' : ''));
    c.appendChild(el('div', 'dnum', String(d.getDate())));
    items.filter(i => i.date === k && visible(i)).slice(0, cap).forEach(i => {
      const e = el('div', 'ev' + (i.done ? ' done' : ''), i.text);
      e.style.borderLeftColor = colorOf(i.cal);
      e.draggable = !i.ro;
      e.ondragstart = ev => ev.dataTransfer.setData('text/plain', i.id);
      e.onclick = () => { if (i.kind === 'task' && !i.ro) { i.done = !i.done; save(); grid(); } };
      e.title = i.text + (i.ro ? ' (imported)' : ' — click to tick off, drag to move');
      c.appendChild(e);
    });
    c.ondragover = ev => { ev.preventDefault(); c.classList.add('drop'); };
    c.ondragleave = () => c.classList.remove('drop');
    c.ondrop = ev => { c.classList.remove('drop'); drop(ev, k); };
    c.ondblclick = () => {
      const t = prompt('Add to ' + fmtDate(d));
      if (t && t.trim()) { items.push({ id: uid(), text: t.trim(), kind: 'task', cal: cals[0].id, date: k, done: false }); save(); grid(); }
    };
    return c;
  }
  function drop(e, k) {
    e.preventDefault();
    const it = items.find(x => x.id === e.dataTransfer.getData('text/plain'));
    if (!it || it.ro) return;
    it.date = k; save(); renderWs(); grid();
  }

  /* ---------- .ics import (read-only overlay from Google) ---------- */
  function ics(text) {
    const lines = text.replace(/\r\n[ \t]/g, '').split(/\r?\n/);
    let cur = null, n = 0;
    if (!cals.some(c => c.id === 'gcal')) cals.push({ id: 'gcal', name: 'Imported', color: COLORS[5], on: true, ro: true });
    items = items.filter(i => i.cal !== 'gcal');
    lines.forEach(l => {
      if (l.startsWith('BEGIN:VEVENT')) cur = {};
      else if (l.startsWith('END:VEVENT')) {
        if (cur && cur.d) { items.push({ id: uid(), text: cur.s || '(untitled)', kind: 'task', cal: 'gcal', date: cur.d, ro: true }); n++; }
        cur = null;
      } else if (cur) {
        if (l.startsWith('SUMMARY')) cur.s = l.slice(l.indexOf(':') + 1).replace(/\\,/g, ',').replace(/\\n/g, ' ');
        if (l.startsWith('DTSTART')) {
          const v = l.slice(l.indexOf(':') + 1).trim();
          if (/^\d{8}/.test(v)) cur.d = `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}`;
        }
      }
    });
    save(); renderCals(); grid();
    toast(`${n} events imported. They sit read-only alongside your own.`);
  }

  function segs() { document.querySelectorAll('#calViews button').forEach(b => b.classList.toggle('on', b.dataset.v === mode)); }

  function init() {
    document.querySelectorAll('#calViews button').forEach(b => b.onclick = () => { mode = b.dataset.v; segs(); save(); grid(); });
    document.getElementById('calPrev').onclick = () => { step(-1); };
    document.getElementById('calNext').onclick = () => { step(1); };
    document.getElementById('calToday').onclick = () => { cursor = new Date(); grid(); };
    document.getElementById('calAdd').onclick = () => {
      const n = document.getElementById('calNewName').value.trim(); if (!n) return;
      cals.push({ id: uid(), name: n, color: COLORS[cals.length % COLORS.length], on: true });
      document.getElementById('calNewName').value = ''; save(); renderCals(); fillSelect();
    };
    const inp = document.getElementById('wsInput');
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const t = inp.value.trim(); if (!t) return;
        items.unshift({ id: uid(), text: t, kind: document.getElementById('wsKind').value, cal: document.getElementById('wsCal').value, date: null, done: false });
        inp.value = ''; save(); renderWs();
      }
    });
    document.getElementById('icsFile').onchange = e => {
      const f = e.target.files[0]; if (!f) return;
      const fr = new FileReader(); fr.onload = () => ics(fr.result); fr.readAsText(f);
    };
    segs(); renderCals(); fillSelect(); renderWs(); grid();
  }
  function step(dir) {
    if (mode === 'month') cursor = new Date(cursor.getFullYear(), cursor.getMonth() + dir, 1);
    else if (mode === 'week') cursor.setDate(cursor.getDate() + 7 * dir);
    else if (mode === 'day') cursor.setDate(cursor.getDate() + dir);
    else cursor = new Date(cursor.getFullYear() + dir, 0, 1);
    grid();
  }
  /* ---------- small read/write surface used by the Dashboard's To-do widget ----------
     Works on the exact same `items` this module already renders, so anything added,
     ticked, or dated here shows up on The Calendar too, and vice versa. Purely additive —
     nothing above this is touched. */
  function dashTasks() { return items.filter(i => i.kind === 'task'); }
  function dashAddTask(text, date) {
    const t = (text || '').trim(); if (!t) return null;
    const it = { id: uid(), text: t, kind: 'task', cal: (cals[0] && cals[0].id) || 'life', date: date || null, done: false };
    items.unshift(it); save();
    return it;
  }
  function dashToggleTask(id) {
    const it = items.find(x => x.id === id);
    if (it) { it.done = !it.done; save(); }
    return it;
  }
  function dashRemoveTask(id) { items = items.filter(x => x.id !== id); save(); }
  function dashColor(calId) { return colorOf(calId); }

  return { init, grid, dashTasks, dashAddTask, dashToggleTask, dashRemoveTask, dashColor };
})();
