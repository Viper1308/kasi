/* ══════════════ THE GALLERY — every picture ever saved from elsewhere in NEXUS ══════════════
   Entries are a separate, append-only record: pictures are copied here under their
   own id ('gal:'+id) so they survive independently of wherever they first came from.
   ================================================================== */
const Gallery = (() => {
  const KEY = 'kasi.gallery';
  let list = Store.get(KEY, []);
  const save = () => Store.set(KEY, list);

  function add(dataUrl, meta) {
    if (!dataUrl) return;
    const id = uid();
    const rec = { id, sourceId: meta?.sourceId || null, sourceName: meta?.sourceName || '', kind: meta?.kind || 'pinned', at: Date.now() };
    list.unshift(rec);
    save();
    Store.putImg('gal:' + id, dataUrl);
    if (typeof Dashboard !== 'undefined') Dashboard.refreshGalleryBits();
    return rec;
  }

  function count() { return list.length; }
  function recent(n) { return list.slice(0, n); }
  function all() { return list; }

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
        <div class="gal-meta"><span>${esc(rec.sourceName || (rec.kind === 'background' ? 'Background' : 'Picture'))}</span><b>${new Date(rec.at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</b></div>
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
      `${rec.sourceName || (rec.kind === 'background' ? 'Background' : 'Picture')} · ${rec.kind === 'background' ? 'background' : 'pinned picture'} · ${new Date(rec.at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
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
  }

  return { init, add, count, recent, all, openModal };
})();
