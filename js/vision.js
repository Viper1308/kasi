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
    const src = Store.getImg('vb:' + it.id);

    const overlay = el('div', 'vb-focus');
    const stageImg = el('div', 'vb-focus-img');
    const noteWrap = el('div', 'vb-focus-note');
    const ta = el('textarea', 'vb-focus-ta');
    ta.placeholder = 'Attach a note to this image…';
    ta.value = it.note || '';
    ta.onpointerdown = e => e.stopPropagation();
    ta.oninput = () => { it.note = ta.value; };
    const label = el('div', 'vb-focus-label', 'NOTE');
    const hint = el('div', 'vb-focus-hint', 'Click anywhere outside to close');
    noteWrap.append(label, ta, hint);
    stageImg.onpointerdown = e => e.stopPropagation();
    overlay.append(stageImg, noteWrap);
    b.appendChild(overlay);
    focusEl = overlay;

    // put the image in
    const im = el('img');
    src.then(u => { if (u) im.src = u; });
    stageImg.appendChild(im);

    // animate: dim the board, grow the image to centre
    requestAnimationFrame(() => {
      overlay.classList.add('in');
    });

    function close() {
      it.note = ta.value;
      save();               // persists + syncs the note
      overlay.classList.remove('in');
      overlay.classList.add('out');
      setTimeout(() => { overlay.remove(); focusEl = null; render(); }, 320);
      document.removeEventListener('keydown', esc);
    }
    function esc(e) { if (e.key === 'Escape') { e.stopPropagation(); close(); } }
    overlay.addEventListener('pointerdown', e => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', esc);
    // focus the textarea shortly after the animation begins
    setTimeout(() => ta.focus(), 260);
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

  function init() {
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
