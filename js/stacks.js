/* ══════════════ THE STACKS — projects as piles of books on a floor ══════════════
   Top view: a room floor you can pan and zoom around. Every project is a pile.
   Click a pile and the camera dives in and tips over to a side elevation:
   the top book is step one, everything underneath is what comes after.
   ================================================================== */
const Stacks = (() => {

  /* spines get random colours — a warm, slightly dusty library palette */
  const PALETTE = [
    '#8c3b3b', '#2f4a6d', '#3d5a3a', '#8a6220', '#4a2f5e', '#1f5f62', '#7d5320',
    '#5a3a2c', '#2b3a55', '#6e2a44', '#3f6b57', '#6b4f8a', '#a45a35', '#26506b'
  ];
  const pick = () => PALETTE[Math.floor(Math.random() * PALETTE.length)];
  const hash = s => [...String(s)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const ink = hex => {
    const n = parseInt(hex.slice(1), 16);
    return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) > 145 ? '#1a1610' : '#f4efe4';
  };

  let stacks = Store.get('stk.stacks', []);
  let view = Store.get('stk.view', { x: 0, y: 0, k: 1 });
  let openId = null, savedView = null, dragging = null;

  const save = () => { Store.set('stk.stacks', stacks); Store.set('stk.view', view); };
  const byId = id => stacks.find(s => s.id === id);

  const room = () => document.getElementById('stkRoom');
  const floor = () => document.getElementById('stkFloor');
  const side = () => document.getElementById('stkSide');

  /* ---------------- seeding ---------------- */
  function seed() {
    return {
      id: uid(), name: 'Untitled project', accent: pick(),
      x: 0, y: 0, books: []
    };
  }
  function makeBook(label) {
    return { id: uid(), label: label || 'New step', note: '', done: false, colour: pick() };
  }

  /* ---------------- view plumbing ---------------- */
  function applyView(v) {
    view = v;
    const f = floor();
    if (f) f.style.transform = `translate(${v.x}px,${v.y}px) scale(${v.k})`;
    const z = document.getElementById('stkZoom');
    if (z) z.textContent = Math.round(v.k * 100) + '%';
  }

  function fit(animate) {
    const r = room().getBoundingClientRect();
    if (!r.width) return;
    if (!stacks.length) { const v = { x: r.width / 2, y: r.height / 2, k: 1 }; animate ? glideTo(v) : applyView(v); return; }
    const xs = stacks.map(s => s.x), ys = stacks.map(s => s.y);
    const pad = 220;
    const minX = Math.min(...xs) - pad, maxX = Math.max(...xs) + pad;
    const minY = Math.min(...ys) - pad, maxY = Math.max(...ys) + pad;
    const k = Math.min(1.4, Math.min(r.width / (maxX - minX), r.height / (maxY - minY)));
    const v = {
      k,
      x: r.width / 2 - ((minX + maxX) / 2) * k,
      y: r.height / 2 - ((minY + maxY) / 2) * k
    };
    animate ? glideTo(v) : applyView(v);
  }
  function glideTo(v, ms, done) {
    Gestures.glide({ ...view }, v, ms || 420, applyView, () => { save(); done && done(); });
  }

  /* ---------------- top-down render ---------------- */
  function render() {
    const f = floor();
    if (!f) return;
    f.querySelectorAll('.stk').forEach(n => n.remove());

    const empty = document.getElementById('stkEmpty');
    if (empty) empty.hidden = stacks.length > 0;

    stacks.forEach(s => {
      const n = el('div', 'stk');
      n.style.left = s.x + 'px';
      n.style.top = s.y + 'px';
      n.dataset.id = s.id;

      const pile = el('div', 'pile');
      const total = s.books.length;
      const done = s.books.filter(b => b.done).length;

      if (!total) {
        const ghost = el('div', 'tbook ghost');
        ghost.innerHTML = '<span class="tb-empty">empty pile</span>';
        pile.appendChild(ghost);
      }

      // draw bottom → top so the first step ends up sitting on top
      [...s.books].reverse().forEach((b, idx) => {
        const depth = total - 1 - idx;                 // 0 = top book
        const h = hash(b.id);
        const rot = ((h % 1400) / 100 - 7) + depth * .6;
        const dist = depth * 2.6;
        const ang = (h % 360) * Math.PI / 180;
        const w = 132 + (h % 22), ht = 92 + ((h >> 3) % 16);
        const bk = el('div', 'tbook' + (b.done ? ' done' : ''));
        bk.style.cssText =
          `width:${w}px;height:${ht}px;background:${b.colour};color:${ink(b.colour)};` +
          `z-index:${idx + 1};` +
          `transform:translate(-50%,-50%) translate(${Math.cos(ang) * dist}px,${Math.sin(ang) * dist}px) rotate(${rot}deg);` +
          `box-shadow:0 ${2 + depth * .8}px ${6 + depth * 2}px -2px rgba(0,0,0,${.45 + depth * .02})`;
        bk.innerHTML =
          `<i class="tb-pages"></i><i class="tb-spine"></i>` +
          (depth === 0 ? `<span class="tb-top">${esc(b.label)}</span>` : '');
        pile.appendChild(bk);
      });

      const plate = el('div', 'stk-plate');
      plate.innerHTML = `<b>${esc(s.name)}</b><i style="--a:${s.accent}">${done}/${total || 0} done</i>`;

      n.append(el('div', 'stk-shadow'), pile, plate);
      wireStack(n, s);
      f.appendChild(n);
    });
  }

  function wireStack(n, s) {
    n.addEventListener('pointerdown', ev => {
      if (ev.button !== 0 && ev.pointerType === 'mouse') return;
      ev.stopPropagation();
      n.setPointerCapture(ev.pointerId);
      dragging = { id: s.id, sx: ev.clientX, sy: ev.clientY, ox: s.x, oy: s.y, moved: false };
      n.classList.add('lifted');

      const move = e => {
        if (!dragging) return;
        const dx = (e.clientX - dragging.sx) / view.k, dy = (e.clientY - dragging.sy) / view.k;
        if (!dragging.moved && Math.hypot(e.clientX - dragging.sx, e.clientY - dragging.sy) < 5) return;
        dragging.moved = true;
        s.x = Math.round(dragging.ox + dx); s.y = Math.round(dragging.oy + dy);
        n.style.left = s.x + 'px'; n.style.top = s.y + 'px';
      };
      const up = () => {
        n.removeEventListener('pointermove', move);
        n.classList.remove('lifted');
        if (dragging && !dragging.moved) dive(s.id);
        else save();
        dragging = null;
      };
      n.addEventListener('pointermove', move);
      n.addEventListener('pointerup', up, { once: true });
      n.addEventListener('pointercancel', up, { once: true });
    });
  }

  /* ---------------- the dive: top view → side elevation ---------------- */
  function dive(id) {
    const s = byId(id);
    if (!s) return;
    openId = id;
    savedView = { ...view };

    const r = room().getBoundingClientRect();
    const k = Math.min(1.9, Math.max(1.25, view.k * 1.6));
    glideTo({ k, x: r.width / 2 - s.x * k, y: r.height * .42 - s.y * k }, 380, () => {
      room().classList.add('diving');
      setTimeout(() => renderSide(s), 120);
    });
  }

  function undive() {
    const sd = side();
    sd.classList.remove('in');
    room().classList.remove('diving');
    setTimeout(() => { sd.hidden = true; sd.innerHTML = ''; }, 320);
    openId = null;
    render();
    if (savedView) glideTo(savedView, 420);
  }

  function renderSide(s) {
    const sd = side();
    sd.hidden = false;
    sd.style.setProperty('--accent', s.accent);
    sd.innerHTML = `
      <div class="stk-side-head">
        <button class="stk-back" id="stkBack" title="Back to the floor (Esc)">
          <svg viewBox="0 0 24 24" width="16" height="16"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
          <span>Floor</span>
        </button>
        <div class="stk-side-title">
          <div class="eyebrow">Stack</div>
          <h2 contenteditable="true" spellcheck="false" id="stkName">${esc(s.name)}</h2>
        </div>
        <div class="stk-side-meta">
          <span class="stk-prog" id="stkProg"></span>
          <button class="tool tiny" id="stkRecolour" title="New accent colour">Recolour</button>
          <button class="tool tiny danger" id="stkDelete">Delete stack</button>
        </div>
      </div>
      <div class="stk-side-body"><div class="stk-rows" id="stkRows"></div></div>
      <div class="stk-side-foot">
        <input class="inp" id="stkNew" placeholder="Next step in the pile… (Enter)">
        <button class="btn" id="stkAddBook">Add layer</button>
        <span class="tool-hint">Top book is step one. Everything under it is what comes next.</span>
      </div>`;

    rows(s);
    progress(s);

    requestAnimationFrame(() => sd.classList.add('in'));

    document.getElementById('stkBack').onclick = undive;
    const name = document.getElementById('stkName');
    name.addEventListener('blur', () => { s.name = name.textContent.trim() || 'Untitled project'; save(); });
    name.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); name.blur(); } });
    document.getElementById('stkRecolour').onclick = () => { s.accent = pick(); save(); sd.style.setProperty('--accent', s.accent); };
    document.getElementById('stkDelete').onclick = () => {
      if (!confirm(`Delete “${s.name}” and its ${s.books.length} layers?`)) return;
      stacks = stacks.filter(x => x.id !== s.id); save(); undive();
      toast('Stack cleared away.');
    };
    const inp = document.getElementById('stkNew');
    const add = () => {
      const v = inp.value.trim(); if (!v) return;
      s.books.push(makeBook(v)); inp.value = '';
      save(); rows(s); progress(s);
      const last = document.querySelector('#stkRows .stk-row:last-child');
      last && last.scrollIntoView && last.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    };
    document.getElementById('stkAddBook').onclick = add;
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') add(); });
  }

  function progress(s) {
    const p = document.getElementById('stkProg');
    if (!p) return;
    const d = s.books.filter(b => b.done).length, t = s.books.length;
    p.innerHTML = `<i style="width:${t ? (d / t) * 100 : 0}%"></i><em>${d}/${t}</em>`;
  }

  function rows(s) {
    const host = document.getElementById('stkRows');
    if (!host) return;
    host.innerHTML = '';
    if (!s.books.length) {
      host.innerHTML = `<p class="stk-empty-side">Nothing in this pile yet. The first book you add sits on top — that's step one.</p>`;
      return;
    }
    s.books.forEach((b, i) => {
      const w = 190 + (hash(b.id) % 70);
      const row = el('div', 'stk-row' + (b.done ? ' done' : ''));
      row.style.animationDelay = (i * 45) + 'ms';
      row.innerHTML = `
        <div class="slab-col">
          <div class="slab" style="width:${w}px;background:${b.colour};color:${ink(b.colour)}">
            <i class="slab-top"></i>
            <span class="slab-no">${i + 1}</span>
          </div>
        </div>
        <div class="leader"></div>
        <div class="step-card">
          <div class="step-line">
            <button class="tick" title="Mark done">${b.done ? '✓' : ''}</button>
            <div class="step-label" contenteditable="true" spellcheck="false">${esc(b.label)}</div>
            <div class="step-ctl">
              <button class="mv" data-d="-1" title="Move up">↑</button>
              <button class="mv" data-d="1" title="Move down">↓</button>
              <button class="rm" title="Remove layer">✕</button>
            </div>
          </div>
          <textarea class="step-note inp" placeholder="Notes on this step…">${esc(b.note)}</textarea>
        </div>`;

      row.querySelector('.tick').onclick = () => { b.done = !b.done; save(); rows(s); progress(s); };
      const lbl = row.querySelector('.step-label');
      lbl.addEventListener('blur', () => { b.label = lbl.textContent.trim() || 'Untitled step'; save(); });
      lbl.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); lbl.blur(); } });
      const ta = row.querySelector('.step-note');
      if (b.note) ta.classList.add('has');
      ta.onchange = () => { b.note = ta.value; ta.classList.toggle('has', !!ta.value); save(); };
      row.querySelectorAll('.mv').forEach(btn => btn.onclick = () => {
        const j = i + (+btn.dataset.d);
        if (j < 0 || j >= s.books.length) return;
        [s.books[i], s.books[j]] = [s.books[j], s.books[i]];
        save(); rows(s);
      });
      row.querySelector('.rm').onclick = () => {
        s.books.splice(i, 1); save(); rows(s); progress(s);
      };
      host.appendChild(row);
    });
  }

  /* ---------------- creating ---------------- */
  function newStack() {
    const name = prompt('What is this pile for?', 'Economics project');
    if (name === null) return;
    const s = seed();
    s.name = name.trim() || 'Untitled project';
    // drop it near the middle of whatever you're currently looking at
    const r = room().getBoundingClientRect();
    const cx = (r.width / 2 - view.x) / view.k, cy = (r.height / 2 - view.y) / view.k;
    s.x = Math.round(cx + (Math.random() * 160 - 80));
    s.y = Math.round(cy + (Math.random() * 120 - 60));
    stacks.push(s); save(); render();
    setTimeout(() => dive(s.id), 120);
  }

  function tidy() {
    const per = Math.max(2, Math.ceil(Math.sqrt(stacks.length)));
    stacks.forEach((s, i) => { s.x = (i % per) * 330; s.y = Math.floor(i / per) * 300; });
    save(); render(); fit(true);
    toast('Floor tidied.');
  }

  /* ---------------- init ---------------- */
  function init() {
    const rm = room();
    if (!rm) return;

    Gestures.attachPanZoom(rm, {
      get: () => view,
      set: applyView,
      min: .25, max: 2.6,
      wheelPans: true,
      panOn: ev => !ev.target.closest('.stk'),
      onIdle: save
    });

    document.getElementById('stkAdd').onclick = newStack;
    document.getElementById('stkTidy').onclick = tidy;
    document.getElementById('stkFit').onclick = () => fit(true);
    document.getElementById('stkIn').onclick = () => nudgeZoom(1.25);
    document.getElementById('stkOut').onclick = () => nudgeZoom(1 / 1.25);

    // Esc closes the side view before anything else gets to handle it
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && openId) { e.stopPropagation(); undive(); }
    }, true);

    render();
    applyView(view);
  }

  function nudgeZoom(f) {
    const r = room().getBoundingClientRect();
    const k = Math.min(2.6, Math.max(.25, view.k * f));
    const wx = (r.width / 2 - view.x) / view.k, wy = (r.height / 2 - view.y) / view.k;
    glideTo({ k, x: r.width / 2 - wx * k, y: r.height / 2 - wy * k }, 200);
  }

  /* called when the view is opened, so the plane picks up its real size */
  function refresh() {
    if (!Store.get('stk.view', null)) { fit(false); save(); }
    else applyView(view);
    render();
  }

  return { init, refresh, get count() { return stacks.length; } };
})();
