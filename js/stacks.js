/* ══════════════ THE STACKS — project manager ══════════════
   Each project is a name plus an ordered list of steps, plus a small
   amount of NEXUS-style metadata (category, tags, due date, status,
   hours invested) used for the card grid and the summary strip. The
   step checklist underneath is unchanged — that's still the actual
   work of the screen. */
const Stacks = (() => {

  const PALETTE = ['#8b6df0', '#5fb4e0', '#4fce8a', '#e0a83f', '#e0708a', '#7fd6e0', '#4fd18b'];
  const pick = () => PALETTE[Math.floor(Math.random() * PALETTE.length)];
  const STATUSES = ['Active', 'On hold', 'Planning', 'Completed'];

  let stacks = Store.get('stk.stacks', []);
  const save = () => Store.set('stk.stacks', stacks);
  const byId = id => stacks.find(s => s.id === id);
  let filter = 'all';

  function seed() {
    return { id: uid(), name: 'Untitled project', accent: pick(), books: [], category: '', tags: [], status: 'Active' };
  }
  function makeTask(label) {
    return { id: uid(), label: label || 'New step', note: '', done: false };
  }
  // migrate older saves that predate the new fields
  function ensureShape(p) {
    if (p.category === undefined) p.category = '';
    if (p.tags === undefined) p.tags = [];
    if (p.status === undefined) p.status = 'Active';
    delete p.due;
    delete p.hours;
    return p;
  }

  function addProject() {
    const p = seed();
    stacks.unshift(p);
    save(); render();
    const nameEl = document.querySelector(`.proj-card[data-id="${p.id}"] .proj-name`);
    if (nameEl) { nameEl.focus(); selectAllText(nameEl); }
  }
  function renameProject(id, name) {
    const p = byId(id); if (!p) return;
    p.name = (name || '').trim() || 'Untitled project';
    save();
  }
  function deleteProject(id) {
    const p = byId(id); if (!p) return;
    if (!confirm(`Delete “${p.name}” and its ${p.books.length} step${p.books.length === 1 ? '' : 's'}?`)) return;
    stacks = stacks.filter(s => s.id !== id);
    save(); render();
  }
  function addTask(projectId, label) {
    const p = byId(projectId);
    if (!p || !label || !label.trim()) return;
    p.books.push(makeTask(label.trim()));
    save(); render();
  }
  function toggleTask(projectId, taskId) {
    const p = byId(projectId); if (!p) return;
    const t = p.books.find(b => b.id === taskId); if (!t) return;
    t.done = !t.done;
    save(); render();
  }
  function renameTask(projectId, taskId, label) {
    const p = byId(projectId); if (!p) return;
    const t = p.books.find(b => b.id === taskId); if (!t) return;
    t.label = (label || '').trim() || t.label;
    save();
  }
  function deleteTask(projectId, taskId) {
    const p = byId(projectId); if (!p) return;
    p.books = p.books.filter(b => b.id !== taskId);
    save(); render();
  }

  function selectAllText(node) {
    const range = document.createRange();
    range.selectNodeContents(node);
    const sel = window.getSelection();
    sel.removeAllRanges(); sel.addRange(range);
  }
  function progressOf(p) {
    const total = p.books.length;
    const done = p.books.filter(b => b.done).length;
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  }
  function sparkline(p) {
    const steps = p.books;
    if (!steps.length) return '';
    const W = 60, H = 24;
    let cum = 0;
    const pts = steps.map((s, i) => { if (s.done) cum++; const x = (i / Math.max(1, steps.length - 1)) * W; const y = H - (cum / steps.length) * H; return `${x.toFixed(1)},${y.toFixed(1)}`; });
    return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><polyline points="${pts.join(' ')}" fill="none" stroke="${p.accent}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
  function statusForFilter(p) {
    if (p.status === 'Completed') return 'completed';
    if (p.status === 'On hold') return 'hold';
    if (p.status === 'Planning') return 'active';
    return 'active';
  }
  function passesFilter(p) {
    if (filter === 'all') return true;
    return statusForFilter(p) === filter;
  }

  function render() {
    stacks.forEach(ensureShape);
    const host = document.getElementById('stkList');
    const empty = document.getElementById('stkEmpty');
    if (!host) return;
    const shown = stacks.filter(passesFilter);
    empty.hidden = !!stacks.length;
    host.innerHTML = shown.map(p => {
      const { total, done, pct } = progressOf(p);
      const tasks = p.books.map(t => `
        <div class="proj-task${t.done ? ' done' : ''}" data-tid="${t.id}">
          <input type="checkbox" class="proj-check" ${t.done ? 'checked' : ''}>
          <span class="proj-task-label" contenteditable="true" spellcheck="false">${esc(t.label)}</span>
          <button class="proj-task-x" title="Remove step">✕</button>
        </div>`).join('');
      return `
        <div class="proj-card" data-id="${p.id}">
          <div class="proj-card-head">
            <i class="proj-dot" style="background:${p.accent}"></i>
            <span class="proj-name" contenteditable="true" spellcheck="false">${esc(p.name)}</span>
            <span class="proj-count">${done}/${total}</span>
            <button class="proj-del" title="Delete project">✕</button>
          </div>
          <div class="proj-meta-row">
            <span class="proj-category" contenteditable="true" data-ph="Category">${esc(p.category)}</span>
            <span class="proj-spark">${sparkline(p)}</span>
          </div>
          <div class="proj-bar"><i style="width:${pct}%;background:${p.accent}"></i></div>
          <div class="proj-tagrow">
            ${p.tags.map((t, i) => `<span class="tag">${esc(t)}<span class="x-inline" data-tag="${i}">✕</span></span>`).join('')}
            <input class="inp proj-tag-add" placeholder="+ tag">
          </div>
          <div class="proj-foot-row">
            <select class="proj-status-sel">${STATUSES.map(s => `<option ${s === p.status ? 'selected' : ''}>${s}</option>`).join('')}</select>
          </div>
          <div class="proj-tasks">${tasks}</div>
          <div class="proj-add">
            <input type="text" class="inp proj-add-inp" placeholder="Add a step — Enter to save" maxlength="140">
          </div>
        </div>`;
    }).join('');

    host.querySelectorAll('.proj-card').forEach(card => {
      const pid = card.dataset.id;
      const p = byId(pid);

      const nameEl = card.querySelector('.proj-name');
      nameEl.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); nameEl.blur(); } });
      nameEl.addEventListener('blur', () => renameProject(pid, nameEl.textContent));

      card.querySelector('.proj-del').onclick = () => deleteProject(pid);

      const catEl = card.querySelector('.proj-category');
      catEl.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); catEl.blur(); } });
      catEl.addEventListener('blur', () => { p.category = catEl.textContent.trim(); save(); });

      const tagAdd = card.querySelector('.proj-tag-add');
      tagAdd.onkeydown = e => { if (e.key === 'Enter' && tagAdd.value.trim()) { p.tags.push(tagAdd.value.trim()); save(); render(); } };
      card.querySelectorAll('[data-tag]').forEach(x => x.onclick = () => { p.tags.splice(+x.dataset.tag, 1); save(); render(); });

      card.querySelector('.proj-status-sel').onchange = e => { p.status = e.target.value; save(); render(); };

      const addInp = card.querySelector('.proj-add-inp');
      addInp.addEventListener('keydown', e => { if (e.key === 'Enter') { addTask(pid, addInp.value); addInp.value = ''; } });

      card.querySelectorAll('.proj-task').forEach(row => {
        const tid = row.dataset.tid;
        row.querySelector('.proj-check').onchange = () => toggleTask(pid, tid);
        row.querySelector('.proj-task-x').onclick = () => deleteTask(pid, tid);
        const lbl = row.querySelector('.proj-task-label');
        lbl.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); lbl.blur(); } });
        lbl.addEventListener('blur', () => renameTask(pid, tid, lbl.textContent));
      });
    });
    renderSummary();
  }

  function renderSummary() {
    const host = document.getElementById('stkSummary');
    if (!host) return;
    if (!stacks.length) { host.innerHTML = ''; return; }
    const active = stacks.filter(p => statusForFilter(p) === 'active').length;
    const completed = stacks.filter(p => statusForFilter(p) === 'completed').length;
    const hold = stacks.filter(p => statusForFilter(p) === 'hold').length;
    const overall = stacks.length ? Math.round(stacks.reduce((a, p) => a + progressOf(p).pct, 0) / stacks.length) : 0;
    const C = 2 * Math.PI * 22;
    host.innerHTML = `
      <div><div class="sv">${stacks.length}</div><div class="sl">Total projects</div></div>
      <div><div class="sv">${active}</div><div class="sl">Active</div></div>
      <div><div class="sv">${completed}</div><div class="sl">Completed</div></div>
      <div><div class="sv">${hold}</div><div class="sl">On hold</div></div>
      <div class="stacks-ring-wrap">
        <svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="22" fill="none" stroke="var(--panel-2)" stroke-width="6"/><circle cx="26" cy="26" r="22" fill="none" stroke="var(--amber)" stroke-width="6" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - overall / 100)}"/></svg>
        <div class="stacks-ring-num">${overall}%</div>
      </div>
      <div class="stacks-avatar" title="Overall progress">${overall}%</div>`;
  }

  function wireFilters() {
    const tabs = document.getElementById('stkTabs');
    if (!tabs) return;
    tabs.querySelectorAll('button').forEach(b => b.onclick = () => {
      filter = b.dataset.f;
      tabs.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
      render();
    });
  }

  function init() {
    const addBtn = document.getElementById('stkAdd');
    if (addBtn) addBtn.onclick = addProject;
    wireFilters();
    render();
  }
  function refresh() { render(); }

  return { init, refresh, get count() { return stacks.length; } };
})();
