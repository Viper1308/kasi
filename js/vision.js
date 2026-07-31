/* ══════════════ THE BOARD — pictures and notes, moved by hand ══════════════ */
const Board = (() => {
  let items = Store.get('board', []);
  let sel = null;
  const save = () => Store.set('board', items);
  const host = () => document.getElementById('board');
  const topZ = () => items.reduce((m, i) => Math.max(m, i.z || 1), 1);

  function addImage(file) {
    shrink(file, 1200, (url, w, h) => {
      const id = uid();
      const scale = Math.min(1, 340 / Math.max(w, h));
      const it = { id, type: 'img', x: 40 + Math.random() * 160, y: 40 + Math.random() * 120, w: Math.round(w * scale), h: Math.round(h * scale), z: topZ() + 1 };
      Store.putImg('vb:' + id, url).then(() => { items.push(it); save(); render(); });
    });
  }
  function addNote() {
    items.push({ id: uid(), type: 'note', x: 60 + Math.random() * 200, y: 60 + Math.random() * 140, w: 210, h: 150, z: topZ() + 1, text: '' });
    save(); render();
  }

  function render() {
    const b = host();
    b.querySelectorAll('.vb, .board-empty').forEach(n => n.remove());
    if (!items.length) b.appendChild(el('div', 'board-empty', 'Nothing pinned yet. Add a picture, or paste one straight in.'));
    items.forEach(it => {
      const n = el('div', 'vb ' + (it.type === 'note' ? 'pin' : '') + (sel === it.id ? ' sel' : ''));
      n.style.cssText = `left:${it.x}px;top:${it.y}px;width:${it.w}px;height:${it.h}px;z-index:${it.z || 1}`;
      if (it.type === 'img') {
        const img = el('img'); n.appendChild(img);
        Store.getImg('vb:' + it.id).then(u => { if (u) img.src = u; });
        if (it.note) n.appendChild(el('div', 'vb-noteflag', '✎'));
        n.addEventListener('dblclick', ev => { ev.preventDefault(); ev.stopPropagation(); focus(it); });
      } else {
        const ta = el('textarea'); ta.value = it.text || ''; ta.placeholder = 'Write here…';
        ta.onchange = () => { it.text = ta.value; save(); };
        ta.onpointerdown = e => e.stopPropagation();
        n.appendChild(ta);
      }
      ['se', 'e', 's', 'ne'].forEach(k => { const h = el('div', 'hnd ' + k); h.dataset.k = k; n.appendChild(h); });
      wire(n, it);
      b.appendChild(n);
    });
  }

  /* ---- focus mode: double-click an image to enlarge + annotate ---- */
  let focusEl = null;
  function focus(it) {
    if (focusEl) return;
    const b = host();

    // blur the entire board as one unit
    b.classList.add('vb-blurred');

    // overlay sits ABOVE the blurred board, as a child of the board's parent
    const overlay = el('div', 'vb-focus');
    const stageImg = el('div', 'vb-focus-img');
    const im = el('img');
    Store.getImg('vb:' + it.id).then(u => { if (u) im.src = u; });
    // the photo is the only thing that swallows a click — everything else closes
    im.addEventListener('pointerdown', e => e.stopPropagation());
    stageImg.appendChild(im);

    // one-line note bar, pinned near the bottom of the focused image
    const noteBar = el('div', 'vb-focus-note');
    const ta = el('input', 'vb-focus-ta');
    ta.type = 'text';
    ta.placeholder = 'Attach a note…';
    ta.value = it.note || '';
    ta.onpointerdown = e => e.stopPropagation();
    ta.oninput = () => { it.note = ta.value; };
    ta.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); close(); } };
    noteBar.appendChild(ta);

    overlay.append(stageImg, noteBar);
    // append to the board's parent so it's not affected by the board's blur
    b.parentElement.appendChild(overlay);
    focusEl = overlay;

    requestAnimationFrame(() => overlay.classList.add('in'));

    let closing = false;
    function close() {
      if (closing) return;
      closing = true;
      it.note = ta.value;
      save();
      overlay.classList.remove('in');
      overlay.classList.add('out');
      b.classList.remove('vb-blurred');
      setTimeout(() => { overlay.remove(); focusEl = null; render(); }, 280);
      document.removeEventListener('keydown', esc, true);
    }
    function esc(e) { if (e.key === 'Escape') { e.stopPropagation(); e.stopImmediatePropagation(); close(); } }
    overlay.addEventListener('pointerdown', () => close());
    document.addEventListener('keydown', esc, true);
    setTimeout(() => ta.focus(), 220);
  }

  function wire(n, it) {
    n.addEventListener('pointerdown', ev => {
      const handle = ev.target.classList.contains('hnd') ? ev.target.dataset.k : null;
      sel = it.id; it.z = topZ() + 1;
      document.querySelectorAll('.vb').forEach(x => x.classList.remove('sel'));
      n.classList.add('sel'); n.style.zIndex = it.z;
      n.setPointerCapture(ev.pointerId);
      const s = { mx: ev.clientX, my: ev.clientY, x: it.x, y: it.y, w: it.w, h: it.h };
      const move = e => {
        const dx = e.clientX - s.mx, dy = e.clientY - s.my;
        if (!handle) { it.x = s.x + dx; it.y = s.y + dy; }
        else {
          if (handle.includes('e')) it.w = Math.max(60, s.w + dx);
          if (handle === 's' || handle === 'se') it.h = Math.max(50, s.h + dy);
          if (handle === 'ne') { it.h = Math.max(50, s.h - dy); it.y = s.y + (s.h - it.h); }
        }
        n.style.left = it.x + 'px'; n.style.top = it.y + 'px';
        n.style.width = it.w + 'px'; n.style.height = it.h + 'px';
      };
      const up = () => { n.removeEventListener('pointermove', move); save(); };
      n.addEventListener('pointermove', move);
      n.addEventListener('pointerup', up, { once: true });
      ev.stopPropagation();
    });
  }

  function remove() {
    if (!sel) return toast('Select something on the board first.');
    const it = items.find(i => i.id === sel);
    if (it && it.type === 'img') Store.delImg('vb:' + it.id);
    items = items.filter(i => i.id !== sel); sel = null; save(); render();
  }

  /* ---- collapsible tool bar (floats over the board, never moves it) ---- */
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

  function init() {
    tools();
    document.getElementById('vbFile').onchange = e => { [...e.target.files].forEach(addImage); e.target.value = ''; };
    document.getElementById('vbNote').onclick = addNote;
    document.getElementById('vbDel').onclick = remove;
    document.getElementById('vbFront').onclick = () => {
      const it = items.find(i => i.id === sel); if (!it) return toast('Select something first.');
      it.z = topZ() + 1; save(); render();
    };
    host().addEventListener('pointerdown', e => { if (e.target === host() || e.target.classList.contains('board-empty')) { sel = null; document.querySelectorAll('.vb').forEach(x => x.classList.remove('sel')); } });
    host().addEventListener('keydown', e => { if ((e.key === 'Delete' || e.key === 'Backspace') && sel) remove(); });
    host().addEventListener('dragover', e => e.preventDefault());
    host().addEventListener('drop', e => {
      e.preventDefault();
      [...(e.dataTransfer.files || [])].filter(f => f.type.startsWith('image/')).forEach(addImage);
    });
    window.addEventListener('paste', e => {
      if (!document.getElementById('view-vision').classList.contains('on')) return;
      [...(e.clipboardData?.items || [])].forEach(i => { if (i.type.startsWith('image/')) addImage(i.getAsFile()); });
    });
    render();
  }
  return { init, render };
})();
