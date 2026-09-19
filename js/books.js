/* ══════════════ THE SHELF — books as objects on a receding bookcase ══════════════ */
const Books = (() => {
  let books = Store.get('books', []);
  let filter = 'all';
  const save = () => Store.set('books', books);

  function applyFilter() {
    document.querySelectorAll('#shelves .shelf').forEach(sh => {
      sh.hidden = filter !== 'all' && sh.dataset.status !== filter;
    });
  }
  function wireShelfTabs() {
    const tabs = document.getElementById('shelfTabs');
    if (!tabs) return;
    tabs.querySelectorAll('button').forEach(b => b.onclick = () => {
      filter = b.dataset.f;
      tabs.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
      applyFilter();
    });
  }
  const SHELVES = [['reading', 'Currently reading'], ['read', 'Finished'], ['want', 'Want to read']];

  const PALETTE = ['#7a2e2e', '#2f4a6d', '#3d5a3a', '#6b4a1f', '#4a2f5e', '#1f4f52', '#7d5320', '#503a2c', '#2b3a55', '#5e2a44'];
  const hash = s => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const fallback = t => PALETTE[hash(t) % PALETTE.length];
  const readable = hex => {
    const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    return (0.299 * r + 0.587 * g + 0.114 * b) > 150 ? '#1a1610' : '#f3efe6';
  };

  function makeBook(title, author, status, opts = {}) {
    const b = {
      id: uid(), title, author: author || '', status: status || 'want',
      spine: fallback(title + (author || '')), cover: null,
      rating: opts.rating || 0, notes: opts.notes || '', added: Date.now(), year: opts.year || null
    };
    b.text = readable(b.spine);
    return b;
  }

  function add() {
    const title = document.getElementById('bkTitle').value.trim();
    const author = document.getElementById('bkAuthor').value.trim();
    if (!title) return toast('A title, at minimum.');
    const b = makeBook(title, author, document.getElementById('bkStatus').value);
    books.unshift(b); save(); render();
    document.getElementById('bkTitle').value = ''; document.getElementById('bkAuthor').value = '';
    lookup(b);
  }

  /* ---- Open Library: cover art + real dominant colour ---- */
  async function lookup(b) {
    try {
      const q = new URLSearchParams({ title: b.title, limit: '1', fields: 'title,author_name,cover_i,first_publish_year' });
      if (b.author) q.set('author', b.author);
      const r = await fetch('https://openlibrary.org/search.json?' + q);
      const j = await r.json();
      const d = j.docs && j.docs[0];
      if (!d) return;
      if (!b.author && d.author_name) b.author = d.author_name[0];
      b.year = b.year || d.first_publish_year || null;
      if (d.cover_i) {
        b.cover = `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg`;
        const c = await dominant(b.cover);
        if (c) { b.spine = c; b.text = readable(c); }
      }
      save(); render();
    } catch (e) { }
  }
  function dominant(url) {
    return new Promise(res => {
      const img = new Image(); img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const c = document.createElement('canvas'); c.width = 40; c.height = 60;
          const x = c.getContext('2d'); x.drawImage(img, 0, 0, 40, 60);
          const d = x.getImageData(0, 0, 40, 60).data;
          const bins = {};
          for (let i = 0; i < d.length; i += 4) {
            const r = d[i], g = d[i + 1], bl = d[i + 2];
            const mx = Math.max(r, g, bl), mn = Math.min(r, g, bl);
            if (mx > 245 && mn > 235) continue;
            if (mx < 18) continue;
            const k = `${r >> 5},${g >> 5},${bl >> 5}`;
            (bins[k] = bins[k] || { n: 0, r: 0, g: 0, b: 0 });
            bins[k].n++; bins[k].r += r; bins[k].g += g; bins[k].b += bl;
          }
          const top = Object.values(bins).sort((a, b2) => b2.n - a.n)[0];
          if (!top) return res(null);
          const to = v => Math.round(v / top.n).toString(16).padStart(2, '0');
          res('#' + to(top.r) + to(top.g) + to(top.b));
        } catch (e) { res(null); }
      };
      img.onerror = () => res(null);
      img.src = url;
    });
  }

  /* ---- CSV / Excel import ---- */
  const STATUS_MAP = {
    'reading': 'reading', 'currently reading': 'reading', 'current': 'reading', 'in progress': 'reading',
    'read': 'read', 'finished': 'read', 'done': 'read', 'completed': 'read', 'complete': 'read',
    'want': 'want', 'want to read': 'want', 'to read': 'want', 'tbr': 'want', 'wishlist': 'want'
  };
  function parseCSV(text) {
    // handles quoted fields, commas inside quotes, \r\n
    const rows = [];
    let row = [], field = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i], n = text[i + 1];
      if (q) {
        if (c === '"' && n === '"') { field += '"'; i++; }
        else if (c === '"') q = false;
        else field += c;
      } else {
        if (c === '"') q = true;
        else if (c === ',') { row.push(field); field = ''; }
        else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
        else if (c === '\r') { }
        else field += c;
      }
    }
    if (field.length || row.length) { row.push(field); rows.push(row); }
    return rows.filter(r => r.some(c => c.trim()));
  }
  function importRows(rows) {
    if (!rows.length) return toast('That file looks empty.');
    const header = rows[0].map(h => h.trim().toLowerCase());
    const findCol = (...names) => header.findIndex(h => names.some(n => h === n || h.includes(n)));
    const ti = findCol('title', 'book', 'name');
    const ai = findCol('author', 'writer', 'by');
    const si = findCol('status', 'shelf', 'state');
    const ri = findCol('rating', 'stars', 'score');
    const yi = findCol('year', 'published', 'date');
    const ni = findCol('notes', 'review', 'comment');

    // If no title header found, assume first column is title, second is author (headerless file)
    const hasHeader = ti !== -1;
    const start = hasHeader ? 1 : 0;
    const T = hasHeader ? ti : 0, A = hasHeader ? ai : 1;

    let added = 0;
    const fresh = [];
    for (let i = start; i < rows.length; i++) {
      const r = rows[i];
      const title = (r[T] || '').trim();
      if (!title) continue;
      const author = A !== -1 ? (r[A] || '').trim() : '';
      let status = si !== -1 ? STATUS_MAP[(r[si] || '').trim().toLowerCase()] || 'want' : 'want';
      const rating = ri !== -1 ? Math.min(5, Math.max(0, parseInt(r[ri]) || 0)) : 0;
      const year = yi !== -1 ? (parseInt(r[yi]) || null) : null;
      const notes = ni !== -1 ? (r[ni] || '').trim() : '';
      // skip dupes by title+author
      if (books.some(b => b.title.toLowerCase() === title.toLowerCase() && b.author.toLowerCase() === author.toLowerCase())) continue;
      const b = makeBook(title, author, status, { rating, year, notes });
      fresh.push(b); added++;
    }
    books = fresh.concat(books);
    save(); render();
    toast(`Imported ${added} book${added === 1 ? '' : 's'}. Fetching covers…`);
    // fetch covers gently, spaced out to avoid hammering Open Library
    fresh.forEach((b, i) => setTimeout(() => lookup(b), i * 350));
  }

  async function handleFile(file) {
    const name = file.name.toLowerCase();
    if (name.endsWith('.csv') || name.endsWith('.txt') || name.endsWith('.tsv')) {
      const text = await file.text();
      let t = text;
      if (name.endsWith('.tsv')) t = text.replace(/\t/g, ',');
      importRows(parseCSV(t));
    } else if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
      await ensureXLSX();
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const arr = XLSX.utils.sheet_to_csv(ws);
      importRows(parseCSV(arr));
    } else {
      toast('Use a .xlsx, .xls or .csv file.');
    }
  }
  let xlsxLoaded = null;
  function ensureXLSX() {
    if (window.XLSX) return Promise.resolve();
    if (xlsxLoaded) return xlsxLoaded;
    xlsxLoaded = new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      s.onload = res; s.onerror = () => { toast('Could not load the Excel reader (need internet). Try CSV instead.'); rej(); };
      document.head.appendChild(s);
    });
    return xlsxLoaded;
  }

  function downloadTemplate() {
    const csv = 'Title,Author,Status,Rating,Year,Notes\n' +
      'The Selfish Gene,Richard Dawkins,Read,5,1976,Reread of the year\n' +
      'Sapiens,Yuval Noah Harari,Reading,,2011,\n' +
      'Gödel Escher Bach,Douglas Hofstadter,Want to read,,1979,On the list forever\n';
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'nexus-books-template.csv'; a.click(); URL.revokeObjectURL(a.href);
    toast('Template downloaded. Fill it in, save as CSV or Excel, then import.');
  }

  /* ---- render the receding bookcase ---- */
  function render() {
    const host = document.getElementById('shelves');
    if (!host) return;
    host.innerHTML = '';
    const bookcase = el('div', 'bookcase');
    SHELVES.forEach(([k, name]) => {
      const list = books.filter(b => b.status === k);
      const sh = el('div', 'shelf');
      sh.dataset.status = k;
      sh.innerHTML = `<div class="shelf-label">${name} · ${list.length}</div>`;
      const back = el('div', 'shelf-back');
      const row = el('div', 'shelf-books');
      if (!list.length) row.appendChild(el('div', 'shelf-empty', k === 'reading' ? 'Nothing open right now.' : 'Empty.'));
      list.forEach(b => {
        const h = 128 + (hash(b.title) % 44);
        const w = 28 + (hash(b.title + 'w') % 16);
        const s = el('div', 'spine');
        s.style.cssText = `height:${h}px;width:${w}px;background:${b.spine};color:${b.text}`;
        s.innerHTML = `<span>${esc(b.title)}</span>`;
        s.title = `${b.title}${b.author ? ' — ' + b.author : ''}`;
        s.onclick = () => open(b, s);
        row.appendChild(s);
      });
      back.appendChild(row);
      sh.appendChild(back);
      sh.appendChild(el('div', 'shelf-plank'));
      bookcase.appendChild(sh);
    });
    host.appendChild(bookcase);
    applyFilter();
    const hint = document.getElementById('bkHint');
    if (hint) hint.textContent = books.length ? `${books.length} on the shelf` : 'Covers and spine colours come from Open Library.';
  }

  /* ---- pull book off shelf, turn to face you ---- */
  function open(b, spineEl) {
    const stage = document.getElementById('bookStage');
    stage.hidden = false; stage.innerHTML = '';
    const close = el('button', 'stage-close', '✕');
    close.onclick = shut; stage.appendChild(close);

    const flyer = el('div', 'flyer');
    const face = el('div', 'face');
    face.style.background = b.cover
      ? `linear-gradient(180deg,rgba(0,0,0,0) 45%,rgba(0,0,0,.78)), url(${b.cover}) center/cover`
      : `linear-gradient(155deg,${b.spine},#00000055)`;
    face.style.color = '#fff';
    face.innerHTML = `<div class="ttl">${esc(b.title)}</div><div class="aut">${esc(b.author || '')}${b.year ? ' · ' + b.year : ''}</div>`;
    flyer.appendChild(face);

    const wrap = el('div');
    wrap.style.cssText = 'display:flex;align-items:center;justify-content:center;flex-wrap:wrap';
    const detail = el('div', 'book-detail');
    detail.innerHTML = `
      <h3>${esc(b.title)}</h3><div class="aut">${esc(b.author || 'Unknown')}</div>
      <div class="stars">${[1, 2, 3, 4, 5].map(i => `<button data-s="${i}" class="${i <= b.rating ? 'on' : ''}">★</button>`).join('')}</div>
      <div class="add-line" style="margin:0 0 12px">
        <select class="inp tiny" id="bdStatus">${SHELVES.map(([k, n]) => `<option value="${k}" ${b.status === k ? 'selected' : ''}>${n}</option>`).join('')}</select>
        <button class="btn tiny ghost danger" id="bdDel">Remove</button>
      </div>
      <textarea class="inp area" id="bdNotes" placeholder="What you took from it…">${esc(b.notes)}</textarea>`;
    wrap.append(flyer, detail);
    stage.appendChild(wrap);

    const r = spineEl.getBoundingClientRect(), f = flyer.getBoundingClientRect();
    const dx = r.left + r.width / 2 - (f.left + f.width / 2);
    const dy = r.top + r.height / 2 - (f.top + f.height / 2);
    flyer.style.transform = `translate(${dx}px,${dy}px) rotateY(-84deg) scale(.32)`;
    requestAnimationFrame(() => { flyer.style.transform = 'translate(0,0) rotateY(0deg) scale(1)'; flyer.classList.add('in'); });

    detail.querySelectorAll('.stars button').forEach(btn => btn.onclick = () => {
      b.rating = +btn.dataset.s === b.rating ? 0 : +btn.dataset.s; save();
      detail.querySelectorAll('.stars button').forEach(x => x.classList.toggle('on', +x.dataset.s <= b.rating));
    });
    detail.querySelector('#bdNotes').onchange = e => { b.notes = e.target.value; save(); toast('Noted.'); };
    detail.querySelector('#bdStatus').onchange = e => { b.status = e.target.value; save(); render(); };
    detail.querySelector('#bdDel').onclick = () => { books = books.filter(x => x.id !== b.id); save(); render(); shut(); };
    stage.onclick = e => { if (e.target === stage) shut(); };
  }
  function shut() { const s = document.getElementById('bookStage'); if (s) { s.hidden = true; s.innerHTML = ''; } }

  function init() {
    wireShelfTabs();
    document.getElementById('bkAdd').onclick = add;
    ['bkTitle', 'bkAuthor'].forEach(id => document.getElementById(id).addEventListener('keydown', e => { if (e.key === 'Enter') add(); }));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') shut(); });
    const imp = document.getElementById('bkImport');
    if (imp) imp.onchange = e => { const f = e.target.files[0]; if (f) handleFile(f); e.target.value = ''; };
    const tpl = document.getElementById('bkTemplate');
    if (tpl) tpl.onclick = downloadTemplate;
    render();
  }
  return { init, render };
})();
