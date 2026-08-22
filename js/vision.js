/* ══════════════ THE BOARD — tabbed, endless, pin-anything surface ══════════════
   • Several boards, each with its own background and mood.
   • Each board is an endless plane: pan and zoom, nothing falls off the edge.
   • Select many things at once (drag a box, or shift-click), move them as one,
     copy them and paste them — into the same board or a different tab — with
     the layout kept exactly as it was.
   ================================================================== */
const Board = (() => {

  /* ---------------- state ---------------- */
  let boards = Store.get('vb.boards', null);
  let activeId = Store.get('vb.active', null);
  let items = [];                        // items of the active board
  let view = { x: 0, y: 0, k: 1 };
  let sel = new Set();
  let spaceHeld = false;
  let lastPointerWorld = { x: 120, y: 120 };
  const imgCache = new Map();

  const GRIDS = ['graph', 'dots', 'lines', 'none'];
  const SWATCHES = [
    '#0f1720', '#141018', '#101a16', '#1a1410', '#161821', '#0c0f14',
    'linear-gradient(160deg,#1b2735,#090a0f)',
    'linear-gradient(160deg,#2a1b2e,#0f0a12)',
    'linear-gradient(160deg,#12271f,#080f0c)',
    'linear-gradient(160deg,#2b1e12,#0f0a06)',
    'linear-gradient(160deg,#1d2b3a,#101820)',
    'radial-gradient(ellipse at 30% 20%,#233046,#0a0d12)'
  ];

  const board = () => document.getElementById('board');
  const plane = () => document.getElementById('boardPlane');
  const itemsKey = id => 'vb.items:' + id;
  const viewKey = id => 'vb.view:' + id;
  const active = () => boards.find(b => b.id === activeId) || boards[0];

  /* ---------------- first run / migration from the old single board ------- */
  function ensureBoards() {
    if (boards && boards.length) { if (!active()) activeId = boards[0].id; return; }
    const legacy = Store.get('board', []);
    const main = {
      id: 'main', name: 'Universal',
      bg: { type: 'colour', value: '#0f1720', fit: 'cover', dim: 0 },
      grid: 'graph'
    };
    boards = [main];
    activeId = 'main';
    // old items keep their ids, so their pictures in IndexedDB carry straight over,
    // and their x/y are untouched, so the layout is exactly where you left it
    Store.set(itemsKey('main'), legacy || []);
    Store.set('vb.boards', boards);
    Store.set('vb.active', activeId);
  }

  const saveBoards = () => { Store.set('vb.boards', boards); Store.set('vb.active', activeId); };
  const saveItems = () => Store.set(itemsKey(activeId), items);
  const saveView = () => Store.set(viewKey(activeId), view);
  const topZ = () => items.reduce((m, i) => Math.max(m, i.z || 1), 1);

  /* ---------------- tabs ---------------- */
  function renderTabs() {
    const host = document.getElementById('vbTabList');
    host.innerHTML = '';
    boards.forEach(b => {
      const t = el('button', 'vb-tab' + (b.id === activeId ? ' on' : ''));
      t.innerHTML = `<span>${esc(b.name)}</span>`;
      t.title = 'Click to open · double-click to rename';
      t.onclick = () => switchTo(b.id);
      t.ondblclick = () => renameBoard(b);
      if (boards.length > 1) {
        const x = el('i', 'vb-tabx', '✕');
        x.title = 'Delete this board';
        x.onclick = e => { e.stopPropagation(); deleteBoard(b); };
        t.appendChild(x);
      }
      host.appendChild(t);
    });
  }
  function renameBoard(b) {
    const n = prompt('Name this board', b.name);
    if (n === null) return;
    b.name = n.trim() || b.name; saveBoards(); renderTabs(); paintChrome();
  }
  function deleteBoard(b) {
    if (!confirm(`Delete the board “${b.name}” and everything pinned to it?`)) return;
    (Store.get(itemsKey(b.id), []) || []).forEach(i => { if (i.type === 'img') Store.delImg('vb:' + i.id); });
    Store.set(itemsKey(b.id), []);
    Store.delImg('vbbg:' + b.id);
    boards = boards.filter(x => x.id !== b.id);
    if (activeId === b.id) activeId = boards[0].id;
    saveBoards(); loadBoard(); renderTabs();
    toast('Board deleted.');
  }
  function addBoard() {
    const n = prompt('New board — what is it for?', 'New board');
    if (n === null) return;
    const b = {
      id: uid(), name: (n.trim() || 'New board'),
      bg: { type: 'colour', value: SWATCHES[boards.length % SWATCHES.length], fit: 'cover', dim: 0 },
      grid: GRIDS[boards.length % 3]
    };
    boards.push(b); activeId = b.id;
    Store.set(itemsKey(b.id), []);
    saveBoards(); renderTabs(); loadBoard();
    toast('New board. Paste anything you copied straight in — it keeps its layout.');
  }
  function switchTo(id) {
    if (id === activeId) return;
    saveItems(); saveView();
    activeId = id; saveBoards();
    renderTabs(); loadBoard();
  }

  /* ---------------- load / paint ---------------- */
  function loadBoard() {
    items = Store.get(itemsKey(activeId), []);
    view = Store.get(viewKey(activeId), { x: 0, y: 0, k: 1 });
    sel.clear();
    paintChrome();
    applyView(view);
    render();
  }

  function paintChrome() {
    const b = active();
    const bd = board();
    const name = document.getElementById('vbBoardName');
    if (name) name.textContent = b.name;
    bd.dataset.grid = b.grid || 'graph';

    const bg = b.bg || { type: 'colour', value: '#0f1720' };
    if (bg.type === 'image') {
      Store.getImg('vbbg:' + b.id).then(u => {
        if (!u) return;
        bd.style.background = '#0b0f14';
        bd.style.backgroundImage = `url(${u})`;
        bd.style.backgroundSize = bg.fit === 'tile' ? 'auto' : (bg.fit || 'cover');
        bd.style.backgroundRepeat = bg.fit === 'tile' ? 'repeat' : 'no-repeat';
        bd.style.backgroundPosition = 'center';
      });
    } else {
      bd.style.backgroundImage = '';
      bd.style.background = bg.value || '#0f1720';
      bd.style.backgroundSize = ''; bd.style.backgroundRepeat = '';
    }
    bd.style.setProperty('--vb-dim', (bg.dim || 0));
  }

  function applyView(v) {
    view = v;
    const p = plane();
    if (p) p.style.transform = `translate(${v.x}px,${v.y}px) scale(${v.k})`;
    const bd = board();
    if (bd) {
      bd.style.setProperty('--gs', (28 * v.k) + 'px');
      bd.style.setProperty('--gx', (v.x % (28 * v.k)) + 'px');
      bd.style.setProperty('--gy', (v.y % (28 * v.k)) + 'px');
      bd.style.setProperty('--k', v.k);
    }
    const z = document.getElementById('vbZoom');
    if (z) z.textContent = Math.round(v.k * 100) + '%';
  }
  const toWorld = (cx, cy) => {
    const r = board().getBoundingClientRect();
    return { x: (cx - r.left - view.x) / view.k, y: (cy - r.top - view.y) / view.k };
  };

  /* ---------------- render ---------------- */
  function render() {
    const p = plane();
    p.querySelectorAll('.vb').forEach(n => n.remove());
    const empty = document.getElementById('vbEmpty');
    if (empty) empty.hidden = items.length > 0;

    items.forEach(it => {
      const n = el('div', 'vb ' + (it.type === 'note' ? 'pin' : '') + (sel.has(it.id) ? ' sel' : ''));
      n.dataset.id = it.id;
      n.style.cssText = `left:${it.x}px;top:${it.y}px;width:${it.w}px;height:${it.h}px;z-index:${it.z || 1}`;
      if (it.type === 'img') {
        const img = el('img');
        n.appendChild(img);
        const cached = imgCache.get(it.id);
        if (cached) img.src = cached;
        else Store.getImg('vb:' + it.id).then(u => { if (u) { imgCache.set(it.id, u); img.src = u; } });
        if (it.note) n.appendChild(el('div', 'vb-noteflag', '✎'));
        n.addEventListener('dblclick', ev => { ev.preventDefault(); ev.stopPropagation(); focus(it); });
      } else {
        const ta = el('textarea');
        ta.value = it.text || ''; ta.placeholder = 'Write here…';
        ta.onchange = () => { it.text = ta.value; saveItems(); };
        ta.onpointerdown = e => e.stopPropagation();
        n.appendChild(ta);
      }
      if (sel.size === 1 && sel.has(it.id)) {
        ['se', 'e', 's', 'ne'].forEach(k => { const h = el('div', 'hnd ' + k); h.dataset.k = k; n.appendChild(h); });
      }
      wire(n, it);
      p.appendChild(n);
    });
    paintSelInfo();
  }
  function paintSelInfo() {
    const s = document.getElementById('vbSelCount');
    if (s) s.textContent = sel.size ? `${sel.size} selected` : '';
  }

  /* ---------------- selection ---------------- */
  function selectOnly(id) { sel.clear(); if (id) sel.add(id); render(); }
  function toggleSel(id) { sel.has(id) ? sel.delete(id) : sel.add(id); render(); }
  const selItems = () => items.filter(i => sel.has(i.id));

  /* ---------------- adding ---------------- */
  /* A batch of pictures — even 50 or 60 at once, pasted or dropped together —
     is packed into a Pinterest-style masonry layout: a fixed number of columns
     (scaled to the batch size), each picture keeping its own aspect ratio, each
     one landing at the bottom of whichever column is currently shortest. Gaps
     stay perfectly even in both directions; only the column heights vary. */
  function addImages(files, at) {
    const list = [...files].filter(f => f.type.startsWith('image/'));
    if (!list.length) return;
    const origin = at || centreWorld();
    const GAP = 16, COLW = 220;
    const columns = Math.max(1, Math.min(9, Math.min(list.length, Math.round(Math.sqrt(list.length * 1.4)))));
    const colHeights = new Array(columns).fill(0);

    // measure every picture first (preserving original order via Promise.all),
    // so column heights are packed deterministically rather than by whichever
    // finishes shrinking first
    Promise.all(list.map(f => new Promise(resolve => shrink(f, 1400, (url, w, h) => resolve({ url, w, h }))))).then(measured => {
      const placed = measured.map(m => {
        const dispW = COLW, dispH = Math.round(m.h * (COLW / m.w));
        let ci = 0;
        for (let c = 1; c < columns; c++) if (colHeights[c] < colHeights[ci]) ci = c;
        const x = origin.x + ci * (COLW + GAP), y = origin.y + colHeights[ci];
        colHeights[ci] += dispH + GAP;
        return { url: m.url, x: Math.round(x), y: Math.round(y), w: dispW, h: dispH };
      });

      let done = 0;
      const made = [];
      const z0 = topZ();
      placed.forEach((p, i) => {
        const id = uid();
        const it = { id, type: 'img', x: p.x, y: p.y, w: p.w, h: p.h, z: z0 + 1 + i };
        imgCache.set(id, p.url);
        Store.putImg('vb:' + id, p.url).then(() => {
          if (typeof Gallery !== 'undefined') Gallery.add(p.url, { boardId: activeId, boardName: active().name, kind: 'pinned' });
          items.push(it); made.push(id); done++;
          if (done === placed.length) {
            saveItems(); sel = new Set(made); render();
            if (placed.length > 1) toast(`${placed.length} pictures arranged, Pinterest-style, into ${columns} column${columns === 1 ? '' : 's'}.`);
            if (placed.length > 8) fitAll();
          }
        });
      });
    });
  }
  function addNote() {
    const o = centreWorld();
    const it = { id: uid(), type: 'note', x: Math.round(o.x), y: Math.round(o.y), w: 210, h: 150, z: topZ() + 1, text: '' };
    items.push(it); saveItems(); selectOnly(it.id);
  }
  function centreWorld() {
    const r = board().getBoundingClientRect();
    return { x: (r.width / 2 - view.x) / view.k - 130, y: (r.height / 2 - view.y) / view.k - 100 };
  }

  /* ---------------- copy / paste, layout preserved ---------------- */
  let clip = [];   // [{type,dx,dy,w,h,text,note,img}]
  async function copySel(cut) {
    const list = selItems();
    if (!list.length) { toast('Nothing selected.'); return; }
    const minX = Math.min(...list.map(i => i.x)), minY = Math.min(...list.map(i => i.y));
    clip = [];
    for (const i of list) {
      const rec = { type: i.type, dx: i.x - minX, dy: i.y - minY, w: i.w, h: i.h, text: i.text || '', note: i.note || '' };
      if (i.type === 'img') rec.img = imgCache.get(i.id) || await Store.getImg('vb:' + i.id);
      clip.push(rec);
    }
    toast(`${list.length} item${list.length === 1 ? '' : 's'} copied — arrangement kept.`);
    if (cut) removeSel(true);
  }
  async function paste(at) {
    if (!clip.length) return;
    const o = at || { x: lastPointerWorld.x, y: lastPointerWorld.y };
    const made = [];
    let z = topZ();
    for (const rec of clip) {
      const id = uid();
      const it = {
        id, type: rec.type,
        x: Math.round(o.x + rec.dx), y: Math.round(o.y + rec.dy),
        w: rec.w, h: rec.h, z: ++z,
        text: rec.text, note: rec.note
      };
      if (rec.type === 'img' && rec.img) {
        imgCache.set(id, rec.img); await Store.putImg('vb:' + id, rec.img);
        if (typeof Gallery !== 'undefined') Gallery.add(rec.img, { boardId: activeId, boardName: active().name, kind: 'pinned' });
      }
      items.push(it); made.push(id);
    }
    saveItems(); sel = new Set(made); render();
    toast(`Pasted ${made.length} item${made.length === 1 ? '' : 's'} onto ${active().name}.`);
  }
  async function duplicate() {
    const list = selItems();
    if (!list.length) { toast('Nothing selected.'); return; }
    const x = Math.min(...list.map(i => i.x)) + 28, y = Math.min(...list.map(i => i.y)) + 28;
    await copySel(false);
    await paste({ x, y });
  }

  /* ---------------- align + tidy ---------------- */
  function align(how) {
    const list = selItems();
    if (list.length < 2) { toast('Select two or more things first.'); return; }
    const L = Math.min(...list.map(i => i.x)), R = Math.max(...list.map(i => i.x + i.w));
    const T = Math.min(...list.map(i => i.y)), B = Math.max(...list.map(i => i.y + i.h));
    if (how === 'row' || how === 'grid') {
      const per = how === 'row' ? list.length : Math.ceil(Math.sqrt(list.length));
      const w = Math.max(...list.map(i => i.w)), h = Math.max(...list.map(i => i.h));
      list.slice().sort((a, b) => (a.y - b.y) || (a.x - b.x)).forEach((i, n) => {
        i.x = Math.round(L + (n % per) * (w + 18));
        i.y = Math.round(T + Math.floor(n / per) * (h + 18));
      });
    } else {
      list.forEach(i => {
        if (how === 'left') i.x = L;
        if (how === 'right') i.x = R - i.w;
        if (how === 'cx') i.x = Math.round((L + R) / 2 - i.w / 2);
        if (how === 'top') i.y = T;
        if (how === 'bottom') i.y = B - i.h;
        if (how === 'cy') i.y = Math.round((T + B) / 2 - i.h / 2);
      });
    }
    saveItems(); render();
  }

  /* ---------------- item interaction ---------------- */
  function wire(n, it) {
    n.addEventListener('pointerdown', ev => {
      if (ev.button === 1 || ev.altKey || spaceHeld) return;   // let the pan through
      ev.stopPropagation();
      const handle = ev.target.classList.contains('hnd') ? ev.target.dataset.k : null;

      if (ev.shiftKey || ((ev.metaKey || ev.ctrlKey) && !handle)) { toggleSel(it.id); return; }
      if (!sel.has(it.id)) selectOnly(it.id);

      const moving = handle ? [it] : selItems();
      const base = topZ();
      moving.forEach((i, n2) => i.z = base + 1 + n2);
      const start = moving.map(i => ({ i, x: i.x, y: i.y, w: i.w, h: i.h }));
      const sx = ev.clientX, sy = ev.clientY;
      const node = plane().querySelector(`.vb[data-id="${it.id}"]`) || n;
      node.setPointerCapture(ev.pointerId);
      let moved = false;

      const move = e => {
        const dx = (e.clientX - sx) / view.k, dy = (e.clientY - sy) / view.k;
        if (!moved && Math.hypot(e.clientX - sx, e.clientY - sy) < 3) return;
        moved = true;
        if (handle) {
          const s = start[0];
          if (handle.includes('e')) s.i.w = Math.max(50, Math.round(s.w + dx));
          if (handle === 's' || handle === 'se') s.i.h = Math.max(40, Math.round(s.h + dy));
          if (handle === 'ne') { s.i.h = Math.max(40, Math.round(s.h - dy)); s.i.y = Math.round(s.y + (s.h - s.i.h)); }
        } else {
          start.forEach(s => { s.i.x = Math.round(s.x + dx); s.i.y = Math.round(s.y + dy); });
        }
        start.forEach(s => {
          const el2 = plane().querySelector(`.vb[data-id="${s.i.id}"]`);
          if (!el2) return;
          el2.style.left = s.i.x + 'px'; el2.style.top = s.i.y + 'px';
          el2.style.width = s.i.w + 'px'; el2.style.height = s.i.h + 'px';
        });
      };
      const up = () => {
        node.removeEventListener('pointermove', move);
        if (moved) { saveItems(); render(); }
      };
      node.addEventListener('pointermove', move);
      node.addEventListener('pointerup', up, { once: true });
      node.addEventListener('pointercancel', up, { once: true });
    });
  }

  function removeSel(silent) {
    if (!sel.size) { toast('Select something on the board first.'); return; }
    selItems().forEach(i => { if (i.type === 'img') { Store.delImg('vb:' + i.id); imgCache.delete(i.id); } });
    items = items.filter(i => !sel.has(i.id));
    sel.clear(); saveItems(); render();
    if (!silent) toast('Removed.');
  }
  function toFront() {
    let z = topZ();
    selItems().forEach(i => i.z = ++z);
    saveItems(); render();
  }

  /* ---------------- marquee selection ---------------- */
  function marquee(ev) {
    const bd = board(), mq = document.getElementById('vbMarquee');
    const r = bd.getBoundingClientRect();
    const s = { x: ev.clientX - r.left, y: ev.clientY - r.top };
    const startWorld = toWorld(ev.clientX, ev.clientY);
    const additive = ev.shiftKey;
    if (!additive) { sel.clear(); render(); }
    let moved = false;

    const move = e => {
      const c = { x: e.clientX - r.left, y: e.clientY - r.top };
      if (!moved && Math.hypot(c.x - s.x, c.y - s.y) < 4) return;
      moved = true;
      mq.hidden = false;
      mq.style.left = Math.min(s.x, c.x) + 'px';
      mq.style.top = Math.min(s.y, c.y) + 'px';
      mq.style.width = Math.abs(c.x - s.x) + 'px';
      mq.style.height = Math.abs(c.y - s.y) + 'px';
      const w = toWorld(e.clientX, e.clientY);
      const box = {
        x1: Math.min(startWorld.x, w.x), x2: Math.max(startWorld.x, w.x),
        y1: Math.min(startWorld.y, w.y), y2: Math.max(startWorld.y, w.y)
      };
      const hit = new Set(additive ? [...sel] : []);
      items.forEach(i => {
        if (i.x < box.x2 && i.x + i.w > box.x1 && i.y < box.y2 && i.y + i.h > box.y1) hit.add(i.id);
      });
      sel = hit;
      plane().querySelectorAll('.vb').forEach(n => n.classList.toggle('sel', sel.has(n.dataset.id)));
      paintSelInfo();
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      mq.hidden = true; mq.style.width = mq.style.height = '0px';
      if (moved) render();
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up, { once: true });
  }

  /* ---------------- background panel ---------------- */
  function bgPanel(show) {
    const p = document.getElementById('vbBgPanel');
    if (show === false) { p.classList.add('hidden'); return; }
    if (show === 'toggle' && !p.classList.contains('hidden')) { p.classList.add('hidden'); return; }
    const b = active();
    p.classList.remove('hidden');
    p.innerHTML = `
      <div class="bgp-head"><b>Background · ${esc(b.name)}</b><button class="bgp-x" id="bgpX">✕</button></div>
      <div class="bgp-sec">
        <h5>Colour &amp; wash</h5>
        <div class="bgp-swatches" id="bgpSw"></div>
      </div>
      <div class="bgp-sec">
        <h5>Picture</h5>
        <div class="bgp-row">
          <label class="file-btn">Upload…<input type="file" id="bgpFile" accept="image/*" hidden></label>
          <select class="inp tiny" id="bgpFit">
            <option value="cover">Fill</option>
            <option value="contain">Fit</option>
            <option value="tile">Tile</option>
          </select>
        </div>
        <label class="bgp-slider">Dim <input type="range" id="bgpDim" min="0" max="80" step="5"></label>
      </div>
      <div class="bgp-sec">
        <h5>Ruling</h5>
        <div class="seg wrap" id="bgpGrid">
          ${GRIDS.map(g => `<button data-g="${g}">${g === 'none' ? 'Plain' : g[0].toUpperCase() + g.slice(1)}</button>`).join('')}
        </div>
      </div>
      <div class="bgp-sec">
        <button class="btn ghost tiny" id="bgpAll">Use this look on every board</button>
      </div>`;

    const sw = p.querySelector('#bgpSw');
    SWATCHES.forEach(v => {
      const s = el('button', 'bgp-sw' + (b.bg.type === 'colour' && b.bg.value === v ? ' on' : ''));
      s.style.background = v;
      s.onclick = () => { b.bg = { ...b.bg, type: 'colour', value: v }; saveBoards(); paintChrome(); bgPanel(true); };
      sw.appendChild(s);
    });
    p.querySelector('#bgpX').onclick = () => bgPanel(false);
    p.querySelector('#bgpFit').value = b.bg.fit || 'cover';
    p.querySelector('#bgpFit').onchange = e => { b.bg = { ...b.bg, fit: e.target.value }; saveBoards(); paintChrome(); };
    p.querySelector('#bgpDim').value = Math.round((b.bg.dim || 0) * 100);
    p.querySelector('#bgpDim').oninput = e => { b.bg = { ...b.bg, dim: +e.target.value / 100 }; saveBoards(); paintChrome(); };
    p.querySelector('#bgpFile').onchange = e => {
      const f = e.target.files[0]; if (!f) return;
      shrink(f, 2200, url => {
        Store.putImg('vbbg:' + b.id, url).then(() => {
          if (typeof Gallery !== 'undefined') Gallery.add(url, { boardId: b.id, boardName: b.name, kind: 'background' });
          b.bg = { ...b.bg, type: 'image' }; saveBoards(); paintChrome();
          toast('Background set.');
        });
      });
      e.target.value = '';
    };
    p.querySelectorAll('#bgpGrid button').forEach(btn => {
      btn.classList.toggle('on', btn.dataset.g === (b.grid || 'graph'));
      btn.onclick = () => { b.grid = btn.dataset.g; saveBoards(); paintChrome(); bgPanel(true); };
    });
    p.querySelector('#bgpAll').onclick = () => {
      boards.forEach(o => {
        if (o.id === b.id) return;
        o.grid = b.grid;
        if (b.bg.type !== 'image') o.bg = { ...b.bg };
      });
      saveBoards(); toast('Applied everywhere (uploaded pictures stay per board).');
    };
  }

  /* ---------------- focus mode ---------------- */
  let focusEl = null;
  function focus(it) {
    if (focusEl) return;
    const b = board();
    b.classList.add('vb-blurred');
    const overlay = el('div', 'vb-focus');
    const stageImg = el('div', 'vb-focus-img');
    const im = el('img');
    const cached = imgCache.get(it.id);
    if (cached) im.src = cached; else Store.getImg('vb:' + it.id).then(u => { if (u) im.src = u; });
    im.addEventListener('pointerdown', e => e.stopPropagation());
    stageImg.appendChild(im);

    const noteBar = el('div', 'vb-focus-note');
    const ta = el('input', 'vb-focus-ta');
    ta.type = 'text'; ta.placeholder = 'Attach a note…'; ta.value = it.note || '';
    ta.onpointerdown = e => e.stopPropagation();
    ta.oninput = () => { it.note = ta.value; };
    ta.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); close(); } };
    noteBar.appendChild(ta);

    overlay.append(stageImg, noteBar);
    b.parentElement.appendChild(overlay);
    focusEl = overlay;
    requestAnimationFrame(() => overlay.classList.add('in'));

    let closing = false;
    function close() {
      if (closing) return;
      closing = true;
      it.note = ta.value; saveItems();
      overlay.classList.remove('in'); overlay.classList.add('out');
      b.classList.remove('vb-blurred');
      setTimeout(() => { overlay.remove(); focusEl = null; render(); }, 280);
      document.removeEventListener('keydown', esc, true);
    }
    function esc(e) { if (e.key === 'Escape') { e.stopPropagation(); e.stopImmediatePropagation(); close(); } }
    overlay.addEventListener('pointerdown', () => close());
    document.addEventListener('keydown', esc, true);
    setTimeout(() => ta.focus(), 220);
  }

  /* ---------------- collapsible tool bar ---------------- */
  function tools() {
    const bar = document.getElementById('boardTools');
    const btn = document.getElementById('vbToolsToggle');
    if (!bar || !btn) return;
    let open = Store.get('board.tools', false);
    const paint = () => {
      bar.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.title = open ? 'Hide tools' : 'Show tools';
    };
    btn.onclick = () => { open = !open; Store.set('board.tools', open); paint(); };
    paint();
  }

  /* ---------------- init ---------------- */
  function init() {
    ensureBoards();
    tools();
    renderTabs();
    loadBoard();

    const bd = board();

    Gestures.attachPanZoom(bd, {
      get: () => view,
      set: applyView,
      min: .15, max: 4,
      wheelPans: true,
      panOn: ev => {
        const onItem = ev.target.closest('.vb');
        if (onItem) return spaceHeld || ev.altKey || ev.button === 1;
        if (ev.pointerType !== 'mouse') return true;      // one finger drags the plane
        return spaceHeld || ev.altKey || ev.button === 1;
      },
      onIdle: saveView
    });

    // empty-area left-drag draws a selection box
    bd.addEventListener('pointerdown', ev => {
      lastPointerWorld = toWorld(ev.clientX, ev.clientY);
      if (ev.target.closest('.vb')) return;
      if (ev.pointerType !== 'mouse') { if (sel.size) { sel.clear(); render(); } return; }
      if (ev.button !== 0 || spaceHeld || ev.altKey) return;
      marquee(ev);
    });
    bd.addEventListener('pointermove', ev => { lastPointerWorld = toWorld(ev.clientX, ev.clientY); }, { passive: true });

    // toolbar
    document.getElementById('vbFile').onchange = e => { addImages(e.target.files); e.target.value = ''; };
    document.getElementById('vbNote').onclick = addNote;
    document.getElementById('vbDel').onclick = () => removeSel();
    document.getElementById('vbFront').onclick = toFront;
    document.getElementById('vbCopy').onclick = () => copySel(false);
    document.getElementById('vbPaste').onclick = () => paste(centreWorld());
    document.getElementById('vbDupe').onclick = duplicate;
    document.getElementById('vbSelAll').onclick = () => { sel = new Set(items.map(i => i.id)); render(); };
    document.getElementById('vbBgBtn').onclick = () => bgPanel('toggle');
    document.getElementById('vbTabAdd').onclick = addBoard;
    document.getElementById('vbFit').onclick = fitAll;
    document.getElementById('vbIn').onclick = () => nudge(1.25);
    document.getElementById('vbOut').onclick = () => nudge(1 / 1.25);
    document.querySelectorAll('#vbAlign button').forEach(b2 => b2.onclick = () => align(b2.dataset.a));

    // drops
    bd.addEventListener('dragover', e => e.preventDefault());
    bd.addEventListener('drop', e => {
      e.preventDefault();
      addImages(e.dataTransfer.files || [], toWorld(e.clientX, e.clientY));
    });

    // clipboard: system images first, then our own multi-item clipboard
    window.addEventListener('paste', e => {
      if (!isOn()) return;
      const files = [...(e.clipboardData?.items || [])]
        .filter(i => i.type.startsWith('image/')).map(i => i.getAsFile()).filter(Boolean);
      if (files.length) { addImages(files, lastPointerWorld); return; }
      if (clip.length && !isTyping()) paste();
    });

    // keys
    window.addEventListener('keydown', e => {
      if (!isOn()) return;
      if (e.code === 'Space' && !isTyping()) { spaceHeld = true; board().classList.add('panready'); }
      if (isTyping()) return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'c') { e.preventDefault(); copySel(false); }
      else if (mod && e.key.toLowerCase() === 'x') { e.preventDefault(); copySel(true); }
      else if (mod && e.key.toLowerCase() === 'd') { e.preventDefault(); duplicate(); }
      else if (mod && e.key.toLowerCase() === 'a') { e.preventDefault(); sel = new Set(items.map(i => i.id)); render(); }
      else if ((e.key === 'Delete' || e.key === 'Backspace') && sel.size) { e.preventDefault(); removeSel(true); }
      else if (e.key === 'Escape' && sel.size) { e.stopPropagation(); sel.clear(); render(); }
    }, true);
    window.addEventListener('keyup', e => {
      if (e.code === 'Space') { spaceHeld = false; board()?.classList.remove('panready'); }
    });
  }
  const isOn = () => document.getElementById('view-vision')?.classList.contains('on');
  const isTyping = () => /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;

  function nudge(f) {
    const r = board().getBoundingClientRect();
    const k = Math.min(4, Math.max(.15, view.k * f));
    const wx = (r.width / 2 - view.x) / view.k, wy = (r.height / 2 - view.y) / view.k;
    Gestures.glide({ ...view }, { k, x: r.width / 2 - wx * k, y: r.height / 2 - wy * k }, 180, applyView, saveView);
  }
  function fitAll() {
    const r = board().getBoundingClientRect();
    if (!items.length) { Gestures.glide({ ...view }, { x: 0, y: 0, k: 1 }, 300, applyView, saveView); return; }
    const L = Math.min(...items.map(i => i.x)) - 60, R = Math.max(...items.map(i => i.x + i.w)) + 60;
    const T = Math.min(...items.map(i => i.y)) - 60, B = Math.max(...items.map(i => i.y + i.h)) + 60;
    const k = Math.min(1.6, Math.min(r.width / (R - L), r.height / (B - T)));
    Gestures.glide({ ...view }, {
      k, x: r.width / 2 - ((L + R) / 2) * k, y: r.height / 2 - ((T + B) / 2) * k
    }, 340, applyView, saveView);
  }

  function refresh() { applyView(view); }

  return { init, render, refresh };
})();
