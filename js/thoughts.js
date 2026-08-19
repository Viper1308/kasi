/* ══════════════ THE MARGIN — thoughts and quotes ══════════════ */
const Margin = (() => {
  let list = Store.get('thoughts', []);
  let kind = 'thought', q = '';
  const save = () => Store.set('thoughts', list);

  function add() {
    const ta = document.getElementById('thInput');
    const text = ta.value.trim(); if (!text) return;
    const who = document.getElementById('thWho').value.trim();
    list.unshift({ id: uid(), text, kind, who, at: Date.now() });
    ta.value = ''; document.getElementById('thWho').value = '';
    save(); render(); Profile.render();
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
      const c = el('div', 'note-card' + (i.kind === 'quote' ? ' quote' : ''));
      const body = esc(i.text).replace(/#([\w-]+)/g, '<span class="tag">#$1</span>');
      c.innerHTML = `<p>${body}</p>${i.who ? `<div class="who">— ${esc(i.who)}</div>` : ''}
        <div class="when">${new Date(i.at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
        <button class="x">✕</button>`;
      c.querySelectorAll('.tag').forEach(t => t.onclick = () => { q = t.textContent; document.getElementById('thSearch').value = q; render(); });
      c.querySelector('.x').onclick = () => { list = list.filter(x => x !== i); save(); render(); Profile.render(); };
      c.querySelector('p').ondblclick = () => {
        const v = prompt('Edit', i.text); if (v != null) { i.text = v; save(); render(); }
      };
      host.appendChild(c);
    });
  }

  function init() {
    const ta = document.getElementById('thInput');
    ta.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); add(); } });
    document.querySelectorAll('#thKind button').forEach(b => b.onclick = () => {
      kind = b.dataset.k;
      document.querySelectorAll('#thKind button').forEach(x => x.classList.toggle('on', x === b));
      document.getElementById('thWho').hidden = kind !== 'quote';
      ta.placeholder = kind === 'quote' ? 'The quote, as written. ⌘/Ctrl+Enter to keep it.' : 'A thought, half-formed. ⌘/Ctrl+Enter to keep it.';
    });
    document.getElementById('thSearch').oninput = e => { q = e.target.value.trim(); render(); };
    render();
  }
  // lets other screens (the Atlas) file a note without reaching into Store
  function push(text, who, k) {
    list.unshift({ id: uid(), text, kind: k || 'thought', who: who || '', at: Date.now() });
    save(); render();
    if (typeof Profile !== 'undefined' && Profile.render) Profile.render();
  }

  return { init, render, push };
})();
