/* ══════════════ THE MARGIN — thoughts and quotes ══════════════
   Each note can carry one picture — pasted straight from the clipboard while
   composing, or attached via the paperclip. Pictures live under their own
   'mg:' key (separate from the Board's 'vb:' images) so nothing collides,
   and — same as the Board — every picture attached here is also copied into
   the Gallery the moment it's added, so it's kept even if the note is
   later edited or deleted. */
const Margin = (() => {
  let list = Store.get('thoughts', []);
  let kind = 'thought', q = '';
  let pendingImg = null; // data URL staged for the note currently being composed
  const save = () => Store.set('thoughts', list);

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  function shrinkImage(dataUrl, maxDim = 1600) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        let { width: w, height: h } = img;
        if (w <= maxDim && h <= maxDim) { resolve(dataUrl); return; }
        const scale = maxDim / Math.max(w, h);
        w = Math.round(w * scale); h = Math.round(h * scale);
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(c.toDataURL('image/jpeg', 0.86));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  }

  async function stageFile(file) {
    if (!file || !file.type || !file.type.startsWith('image/')) return;
    const raw = await readFileAsDataUrl(file);
    pendingImg = await shrinkImage(raw);
    paintAttachPreview();
  }

  function paintAttachPreview() {
    const wrap = document.getElementById('thAttachPreview');
    const thumb = document.getElementById('thAttachThumb');
    if (!wrap || !thumb) return;
    if (pendingImg) {
      thumb.style.backgroundImage = `url(${pendingImg})`;
      wrap.hidden = false;
    } else {
      thumb.style.backgroundImage = '';
      wrap.hidden = true;
    }
  }

  function add() {
    const ta = document.getElementById('thInput');
    const text = ta.value.trim();
    if (!text && !pendingImg) return;
    const who = document.getElementById('thWho').value.trim();
    const entry = { id: uid(), text, kind, who, at: Date.now() };
    if (pendingImg) {
      entry.img = uid();
      Store.putImg('mg:' + entry.img, pendingImg);
      if (typeof Gallery !== 'undefined') Gallery.add(pendingImg, { boardId: null, boardName: 'The Margin', kind: 'margin' });
    }
    list.unshift(entry);
    ta.value = ''; document.getElementById('thWho').value = '';
    pendingImg = null; paintAttachPreview();
    save(); render(); Profile.render();
  }

  function openLightbox(dataUrl, caption) {
    const lb = document.getElementById('galleryLightbox');
    if (!lb) return;
    document.getElementById('galleryLbImg').src = dataUrl;
    document.getElementById('galleryLbMeta').textContent = caption || '';
    lb.classList.remove('hidden');
  }

  function render() {
    const host = document.getElementById('thList'); host.innerHTML = '';
    const needle = q.toLowerCase();
    const shown = list.filter(i => !needle || (i.text + ' ' + (i.who || '')).toLowerCase().includes(needle));
    if (!shown.length) {
      host.innerHTML = `<p class="shelf-empty">${list.length ? 'Nothing matches that.' : 'Empty. Type something above and press ⌘/Ctrl+Enter.'}</p>`;
      return;
    }
    shown.forEach(i => {
      const c = el('div', 'note-card' + (i.kind === 'quote' ? ' quote' : '') + (i.img ? ' has-img' : ''));
      const body = esc(i.text).replace(/#([\w-]+)/g, '<span class="tag">#$1</span>');
      c.innerHTML = `${i.img ? '<div class="note-img"></div>' : ''}
        ${i.text ? `<p>${body}</p>` : ''}${i.who ? `<div class="who">— ${esc(i.who)}</div>` : ''}
        <div class="when">${new Date(i.at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
        <button class="x">✕</button>`;
      if (i.img) {
        const imgEl = c.querySelector('.note-img');
        Store.getImg('mg:' + i.img).then(u => {
          if (u) { imgEl.style.backgroundImage = `url(${u})`; imgEl.onclick = () => openLightbox(u, i.who ? `— ${i.who}` : ''); }
        });
      }
      c.querySelectorAll('.tag').forEach(t => t.onclick = () => { q = t.textContent; document.getElementById('thSearch').value = q; render(); });
      c.querySelector('.x').onclick = () => {
        if (i.img) Store.delImg('mg:' + i.img);
        list = list.filter(x => x !== i); save(); render(); Profile.render();
      };
      const p = c.querySelector('p');
      if (p) p.ondblclick = () => {
        const v = prompt('Edit', i.text); if (v != null) { i.text = v; save(); render(); }
      };
      host.appendChild(c);
    });
  }

  function init() {
    const ta = document.getElementById('thInput');
    ta.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); add(); } });
    ta.addEventListener('paste', e => {
      const items = [...(e.clipboardData?.items || [])];
      const imgItem = items.find(it => it.type && it.type.startsWith('image/'));
      if (!imgItem) return;
      e.preventDefault();
      stageFile(imgItem.getAsFile());
    });
    document.getElementById('thAttachBtn').onclick = () => document.getElementById('thAttachFile').click();
    document.getElementById('thAttachFile').onchange = e => {
      const f = e.target.files && e.target.files[0];
      if (f) stageFile(f);
      e.target.value = '';
    };
    document.getElementById('thAttachRemove').onclick = () => { pendingImg = null; paintAttachPreview(); };

    document.querySelectorAll('#thKind button').forEach(b => b.onclick = () => {
      kind = b.dataset.k;
      document.querySelectorAll('#thKind button').forEach(x => x.classList.toggle('on', x === b));
      document.getElementById('thWho').hidden = kind !== 'quote';
      ta.placeholder = kind === 'quote' ? 'The quote, as written. ⌘/Ctrl+Enter to keep it.' : 'A thought, half-formed. ⌘/Ctrl+Enter to keep it, or paste/attach a picture.';
    });
    document.getElementById('thSearch').oninput = e => { q = e.target.value.trim(); render(); };
    render();
  }
  return { init, render };
})();
