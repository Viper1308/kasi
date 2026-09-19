/* ══════════════ THE STACKS — a regular project manager ══════════════
   Each project is a name plus an ordered list of steps. Check steps off
   as you go; the progress bar (and the dashboard's "Projects" widget)
   is just done/total on that list. Nothing fancier than that on purpose.
   ================================================================== */
const Stacks = (() => {

  /* accent colours — used as a small identity dot per project */
  const PALETTE = [
    '#3fe0ff', '#5b8cff', '#7fd6e0', '#ffb454', '#ff6b8b', '#8f7bff', '#4fd18b'
  ];
  const pick = () => PALETTE[Math.floor(Math.random() * PALETTE.length)];

  let stacks = Store.get('stk.stacks', []);
  const save = () => Store.set('stk.stacks', stacks);
  const byId = id => stacks.find(s => s.id === id);

  function seed() {
    return { id: uid(), name: 'Untitled project', accent: pick(), books: [] };
  }
  function makeTask(label) {
    return { id: uid(), label: label || 'New step', note: '', done: false };
  }

  /* ---------------- project-level actions ---------------- */
  function addProject() {
    const p = seed();
    stacks.unshift(p);
    save(); render();
    const nameEl = document.querySelector(`.proj-card[data-id="${p.id}"] .proj-name`);
    if (nameEl) { nameEl.focus(); selectAllText(nameEl); }
  }

  function renameProject(id, name) {
    const p = byId(id);
    if (!p) return;
    p.name = (name || '').trim() || 'Untitled project';
    save();
  }

  function deleteProject(id) {
    const p = byId(id);
    if (!p) return;
    if (!confirm(`Delete “${p.name}” and its ${p.books.length} step${p.books.length === 1 ? '' : 's'}?`)) return;
    stacks = stacks.filter(s => s.id !== id);
    save(); render();
  }

  /* ---------------- task-level actions ---------------- */
  function addTask(projectId, label) {
    const p = byId(projectId);
    if (!p || !label || !label.trim()) return;
    p.books.push(makeTask(label.trim()));
    save(); render();
  }

  function toggleTask(projectId, taskId) {
    const p = byId(projectId);
    if (!p) return;
    const t = p.books.find(b => b.id === taskId);
    if (!t) return;
    t.done = !t.done;
    save(); render();
  }

  function renameTask(projectId, taskId, label) {
    const p = byId(projectId);
    if (!p) return;
    const t = p.books.find(b => b.id === taskId);
    if (!t) return;
    t.label = (label || '').trim() || t.label;
    save();
  }

  function deleteTask(projectId, taskId) {
    const p = byId(projectId);
    if (!p) return;
    p.books = p.books.filter(b => b.id !== taskId);
    save(); render();
  }

  /* ---------------- rendering ---------------- */
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

  function render() {
    const host = document.getElementById('stkList');
    const empty = document.getElementById('stkEmpty');
    if (!host) return;
    empty.hidden = !!stacks.length;
    host.innerHTML = stacks.map(p => {
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
          <div class="proj-bar"><i style="width:${pct}%;background:${p.accent}"></i></div>
          <div class="proj-tasks">${tasks}</div>
          <div class="proj-add">
            <input type="text" class="inp proj-add-inp" placeholder="Add a step — Enter to save" maxlength="140">
          </div>
        </div>`;
    }).join('');

    /* ── wire up the freshly rendered cards ── */
    host.querySelectorAll('.proj-card').forEach(card => {
      const pid = card.dataset.id;

      const nameEl = card.querySelector('.proj-name');
      nameEl.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); nameEl.blur(); } });
      nameEl.addEventListener('blur', () => renameProject(pid, nameEl.textContent));

      card.querySelector('.proj-del').onclick = () => deleteProject(pid);

      const addInp = card.querySelector('.proj-add-inp');
      addInp.addEventListener('keydown', e => {
        if (e.key !== 'Enter') return;
        addTask(pid, addInp.value);
        addInp.value = '';
      });

      card.querySelectorAll('.proj-task').forEach(row => {
        const tid = row.dataset.tid;
        row.querySelector('.proj-check').onchange = () => toggleTask(pid, tid);
        row.querySelector('.proj-task-x').onclick = () => deleteTask(pid, tid);
        const lbl = row.querySelector('.proj-task-label');
        lbl.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); lbl.blur(); } });
        lbl.addEventListener('blur', () => renameTask(pid, tid, lbl.textContent));
      });
    });
  }

  function init() {
    const addBtn = document.getElementById('stkAdd');
    if (addBtn) addBtn.onclick = addProject;
    render();
  }

  /* called whenever the view is opened */
  function refresh() { render(); }

  return { init, refresh, get count() { return stacks.length; } };
})();
