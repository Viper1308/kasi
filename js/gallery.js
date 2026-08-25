/* ══════════════ THE GALLERY — every picture ever pinned to the Board ══════════════
   Board images live and die with the Board (delete an item there and it's gone).
   The Gallery is a separate, append-only record: the moment a picture is added to
   the Board — pinned, or set as a board's background — a copy is written here under
   its own id ('gal:'+id), so it survives even after it's removed from the Board.
   ================================================================== */
const Gallery = (() => {
  const KEY = 'kasi.gallery';
  let list = Store.get(KEY, []);
  const save = () => Store.set(KEY, list);

  /* dataUrl is already in hand wherever this is called from (vision.js), so no
     re-encoding — just fan it out into its own permanent slot. */
  function add(dataUrl, meta) {
    if (!dataUrl) return;
    const id = uid();
    const rec = { id, boardId: meta?.boardId || null, boardName: meta?.boardName || '', kind: meta?.kind || 'pinned', at: Date.now() };
    list.unshift(rec);
    save();
    Store.putImg('gal:' + id, dataUrl);
    if (typeof Dashboard !== 'undefined') Dashboard.refreshGalleryBits();
    return rec;
  }

  function count() { return list.length; }
  function recent(n) { return list.slice(0, n); }
  function all() { return list; }

  /* ---------------- backfill ----------------
     Pictures pinned or pasted before the Gallery existed never went through add(),
     so on first run we sweep every board's items (and background) once and copy
     anything found into the Gallery. A flag stops it from running again. */
  async function backfillFromBoards() {
    if (Store.get('kasi.gallery.backfilled', false)) return;
    const boards = Store.get('vb.boards', []) || [];
    let added = 0;
    for (const b of boards) {
      const items = Store.get('vb.items:' + b.id, []) || [];
      for (const it of items) {
        if (it.type !== 'img') continue;
        const dataUrl = await Store.getImg('vb:' + it.id);
        if (dataUrl) { add(dataUrl, { boardId: b.id, boardName: b.name, kind: 'pinned' }); added++; }
      }
      if (b.bg && b.bg.type === 'image') {
        const bgUrl = await Store.getImg('vbbg:' + b.id);
        if (bgUrl) { add(bgUrl, { boardId: b.id, boardName: b.name, kind: 'background' }); added++; }
      }
    }
    Store.set('kasi.gallery.backfilled', true);
    if (added && typeof Dashboard !== 'undefined') Dashboard.refreshGalleryBits();
    if (added) toast(`Gallery caught up on ${added} existing picture${added === 1 ? '' : 's'} from the Board.`);
  }

  function remove(id) {
    list = list.filter(r => r.id !== id);
    save();
    Store.delImg('gal:' + id);
    renderGrid();
    if (typeof Dashboard !== 'undefined') Dashboard.refreshGalleryBits();
  }

  /* ---------------- modal ---------------- */
  function openModal() {
    document.getElementById('galleryModal').classList.remove('hidden');
    document.getElementById('gallerySub').textContent =
      list.length ? `${list.length} picture${list.length === 1 ? '' : 's'} saved.`
        : 'Nothing here yet.';
    renderGrid();
  }
  function closeModal() { document.getElementById('galleryModal').classList.add('hidden'); }

  function renderGrid() {
    const g = document.getElementById('galleryGrid');
    if (!g) return;
    g.innerHTML = '';
    if (!list.length) {
      g.innerHTML = `<p class="shelf-empty">Nothing here yet.</p>`;
      return;
    }
    list.forEach(rec => {
      const cell = el('div', 'gal-cell');
      cell.innerHTML = `<div class="gal-thumb"></div>
        <div class="gal-meta"><span>${esc(rec.boardName || 'Board')}</span><b>${new Date(rec.at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</b></div>
        <button class="gal-x" title="Remove from gallery">✕</button>`;
      const thumb = cell.querySelector('.gal-thumb');
      Store.getImg('gal:' + rec.id).then(u => { if (u) thumb.style.backgroundImage = `url(${u})`; });
      cell.querySelector('.gal-x').onclick = e => { e.stopPropagation(); remove(rec.id); };
      cell.onclick = () => openLightbox(rec);
      g.appendChild(cell);
    });
  }

  function openLightbox(rec) {
    const lb = document.getElementById('galleryLightbox');
    const img = document.getElementById('galleryLbImg');
    img.src = '';
    Store.getImg('gal:' + rec.id).then(u => { if (u) img.src = u; });
    document.getElementById('galleryLbMeta').textContent =
      `${rec.boardName || 'Board'} · ${rec.kind === 'background' ? 'background' : 'pinned picture'} · ${new Date(rec.at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
    lb.classList.remove('hidden');
  }
  function closeLightbox() { document.getElementById('galleryLightbox').classList.add('hidden'); document.getElementById('galleryLbImg').src = ''; }

  function init() {
    document.getElementById('dashGalleryBtn').onclick = openModal;
    document.getElementById('galleryClose').onclick = closeModal;
    document.getElementById('galleryBackdrop').onclick = closeModal;
    document.getElementById('galleryLbClose').onclick = closeLightbox;
    document.getElementById('galleryLightbox').addEventListener('click', e => { if (e.target.id === 'galleryLightbox') closeLightbox(); });
    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      if (!document.getElementById('galleryLightbox').classList.contains('hidden')) { closeLightbox(); return; }
      if (!document.getElementById('galleryModal').classList.contains('hidden')) closeModal();
    });
    backfillFromBoards();
  }

  return { init, add, count, recent, all, openModal };
})();
