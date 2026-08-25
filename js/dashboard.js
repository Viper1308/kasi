/* ══════════════ THE DASHBOARD — the desk's new home screen ══════════════
   A life-planner front page: greeting + clock, quick nav into the seven
   screens, a to-do list, a couple of charts, upcoming events, what's being
   read, the latest margin notes, project progress, and a peek at the gallery.

   Reads straight from Store for anything display-only (always fresh — the
   view is rebuilt every time you land back on the desk). The one thing it
   *writes* — tasks — goes through Cal's small dashTasks/dashAddTask API so
   The Calendar and this widget never disagree about what's done.
   ================================================================== */
const Dashboard = (() => {

  const todayIso = () => iso(new Date());
  const startOfWeekIso = (d = new Date()) => { const x = new Date(d); const shift = (x.getDay() + 6) % 7; x.setDate(x.getDate() - shift); return iso(x); };
  const endOfWeekIso = (d = new Date()) => { const x = new Date(startOfWeekIso(d)); x.setDate(x.getDate() + 6); return iso(x); };

  function greetingWord() {
    const h = new Date().getHours();
    if (h < 5) return 'Still up';
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    if (h < 21) return 'Good evening';
    return 'Good night';
  }

  /* ---------------- header ---------------- */
  function renderHeader() {
    const name = (Store.get('profile', null) || {}).name;
    const hello = document.getElementById('dashHello');
    if (hello) hello.textContent = `${greetingWord()}${name && name !== 'Your name' ? ', ' + name.split(' ')[0] : ''}`;
    const dateEl = document.getElementById('dashDate');
    if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  /* ---------------- to-do (backed by cal.items, kind:'task') ---------------- */
  function renderTodo() {
    const host = document.getElementById('dashTodoList');
    if (!host) return;
    const today = todayIso();
    const tasks = Cal.dashTasks()
      .filter(t => !t.done ? true : (t.date === today || !t.date))   // keep done items only while they're "today's", so the list doesn't grow forever
      .filter(t => !t.date || t.date <= addDays(today, 6));           // due within the next week, or unscheduled
    tasks.sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      const ad = a.date || '9999', bd = b.date || '9999';
      return ad < bd ? -1 : ad > bd ? 1 : 0;
    });
    const shown = tasks.slice(0, 8);
    const openCount = Cal.dashTasks().filter(t => !t.done).length;
    const countEl = document.getElementById('dashTodoCount');
    if (countEl) countEl.textContent = openCount ? `${openCount} open` : 'all clear';

    host.innerHTML = '';
    if (!shown.length) {
      host.innerHTML = `<p class="dash-empty">Nothing on your plate. Add something below.</p>`;
    }
    shown.forEach(t => {
      const row = el('div', 'dash-todo-row' + (t.done ? ' done' : ''));
      const overdue = !t.done && t.date && t.date < today;
      let pillCls = 'pill-open', pillText = 'Open';
      if (t.done) { pillCls = 'pill-good'; pillText = 'Completed'; }
      else if (overdue) { pillCls = 'pill-bad'; pillText = 'Overdue'; }
      else if (t.date === today) { pillCls = 'pill-warn'; pillText = 'Today'; }
      row.innerHTML = `
        <button class="dash-check" aria-label="Toggle done">${t.done ? '✓' : ''}</button>
        <span class="dash-todo-text">${esc(t.text)}</span>
        <span class="pill ${pillCls}">${pillText}</span>
        ${t.date ? `<span class="dash-todo-when${overdue ? ' late' : ''}">${t.date === today ? 'Today' : fmtShort(t.date)}</span>` : ''}
        <button class="dash-todo-x" aria-label="Remove">✕</button>`;
      row.querySelector('.dash-check').onclick = () => { Cal.dashToggleTask(t.id); renderTodo(); renderStats(); renderRadar(); };
      row.querySelector('.dash-todo-x').onclick = () => { Cal.dashRemoveTask(t.id); renderTodo(); renderStats(); renderUpcoming(); };
      host.appendChild(row);
    });
  }
  function fmtShort(dateStr) { const d = new Date(dateStr); return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }); }
  function addDays(dateStr, n) { const d = new Date(dateStr); d.setDate(d.getDate() + n); return iso(d); }

  function wireTodoInput() {
    const inp = document.getElementById('dashTodoInput');
    if (!inp || inp._wired) return;
    inp._wired = true;
    inp.addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      const t = inp.value.trim(); if (!t) return;
      Cal.dashAddTask(t, null);
      inp.value = '';
      renderTodo(); renderStats(); renderRadar();
    });
  }

  /* ---------------- stats: donut of this week's tasks ---------------- */
  function renderStats() {
    const svg = document.getElementById('dashPie');
    const legend = document.getElementById('dashPieLegend');
    if (!svg) return;
    const ws = startOfWeekIso(), we = endOfWeekIso();
    let tasks = Cal.dashTasks().filter(t => t.date && t.date >= ws && t.date <= we);
    if (!tasks.length) tasks = Cal.dashTasks(); // fall back to everything if the week's quiet
    const done = tasks.filter(t => t.done).length;
    const total = tasks.length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    const r = 50, C = 2 * Math.PI * r;
    const doneLen = total ? (done / total) * C : 0;
    svg.innerHTML = `
      <circle cx="60" cy="60" r="${r}" fill="none" stroke="var(--line)" stroke-width="16"/>
      ${total ? `<circle cx="60" cy="60" r="${r}" fill="none" stroke="var(--cyan)" stroke-width="16"
        stroke-dasharray="${doneLen} ${C - doneLen}" stroke-linecap="round" transform="rotate(-90 60 60)"/>` : ''}
      <text x="60" y="56" text-anchor="middle" class="dash-pie-num">${pct}%</text>
      <text x="60" y="74" text-anchor="middle" class="dash-pie-lbl">done</text>`;
    if (legend) legend.innerHTML = `
      <div><i style="background:var(--cyan)"></i> ${done} done</div>
      <div><i style="background:var(--line)"></i> ${total - done} open</div>
      <div class="dash-pie-total">${total} task${total === 1 ? '' : 's'} this week</div>`;
  }

  /* ---------------- bars: last 7 days of task activity ---------------- */
  function renderBars() {
    const svg = document.getElementById('dashBars');
    if (!svg) return;
    const tasks = Cal.dashTasks();
    const days = [];
    for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push(iso(d)); }
    const byDay = days.map(d => {
      const list = tasks.filter(t => t.date === d);
      return { d, done: list.filter(t => t.done).length, open: list.filter(t => !t.done).length };
    });
    const max = Math.max(1, ...byDay.map(x => x.done + x.open));
    const W = 300, H = 130, padB = 20, padT = 6, bw = W / days.length, gap = 10;
    let bars = '';
    byDay.forEach((x, i) => {
      const cx = i * bw + bw / 2;
      const usable = H - padB - padT;
      const doneH = (x.done / max) * usable, openH = (x.open / max) * usable;
      const bw2 = bw - gap;
      let y = H - padB;
      if (x.open) { bars += `<rect x="${cx - bw2 / 2}" y="${y - openH}" width="${bw2}" height="${openH}" rx="2" fill="var(--amber)" opacity=".85"/>`; y -= openH; }
      if (x.done) { bars += `<rect x="${cx - bw2 / 2}" y="${y - doneH}" width="${bw2}" height="${doneH}" rx="2" fill="var(--cyan)"/>`; y -= doneH; }
      if (!x.open && !x.done) bars += `<rect x="${cx - bw2 / 2}" y="${H - padB - 2}" width="${bw2}" height="2" rx="1" fill="var(--line)"/>`;
      const dow = new Date(x.d).toLocaleDateString('en-IN', { weekday: 'narrow' });
      bars += `<text x="${cx}" y="${H - 4}" text-anchor="middle" class="dash-bar-lbl">${dow}</text>`;
    });
    svg.innerHTML = bars;
  }

  /* ---------------- exam progress — the 13 sectionals across The Docket ---------------- */
  const EXAM_PROGRESS_GROUPS = [
    { label: 'CLAT 2027', rows: [
      { label: 'Quantitative Techniques', exam: 'clat', sections: 'quant' },
      { label: 'Logical Reasoning', exam: 'clat', sections: 'logical' },
      { label: 'English', exam: 'clat', sections: 'english' },
      { label: 'Legal Reasoning', exam: 'clat', sections: 'legal' },
      { label: 'General Knowledge', exam: 'clat', sections: 'gk' }
    ]},
    { label: 'IIM Bangalore UGAT', rows: [
      { label: 'Quant + Data Interpretation', exam: 'iimb', sections: 'quant' },
      { label: 'English', exam: 'iimb', sections: 'english' },
      { label: 'Logical Reasoning', exam: 'iimb', sections: 'logical' }
    ]},
    { label: 'Grade 12 Commerce', rows: [
      { label: 'English', exam: 'grade12', sections: 'english' },
      { label: 'Applied Mathematics', exam: 'grade12', sections: 'appmath' },
      { label: 'Economics', exam: 'grade12', sections: ['macro', 'ied'] },
      { label: 'Accountancy', exam: 'grade12', sections: 'acc' },
      { label: 'Business Studies', exam: 'grade12', sections: 'bst' }
    ]}
  ];

  function renderExamProgress() {
    const host = document.getElementById('dashExamProg');
    if (!host) return;
    if (typeof Docket === 'undefined' || !Docket.sectionProgress) {
      host.innerHTML = `<p class="dash-empty">The Docket hasn't loaded yet.</p>`;
      return;
    }
    let grandTotal = 0, grandChecked = 0;
    host.innerHTML = EXAM_PROGRESS_GROUPS.map(group => {
      const rows = group.rows.map(r => {
        const p = Docket.sectionProgress(r.exam, r.sections);
        grandTotal += p.total; grandChecked += p.checked;
        return `<div class="examprog-row">
          <span class="examprog-label">${esc(r.label)}</span>
          <div class="examprog-bar"><i style="width:${p.pct}%"></i></div>
          <span class="examprog-pct mono">${p.pct}%</span>
        </div>`;
      }).join('');
      return `<div class="examprog-group">
        <div class="examprog-group-name">${esc(group.label)}</div>
        <div class="examprog-rows">${rows}</div>
      </div>`;
    }).join('');
    const totalEl = document.getElementById('dashExamProgTotal');
    if (totalEl) totalEl.textContent = grandTotal ? `${Math.round((grandChecked / grandTotal) * 100)}% overall` : '';
  }

  /* ---------------- upcoming ---------------- */
  function renderUpcoming() {
    const host = document.getElementById('dashUpcoming');
    if (!host) return;
    const today = todayIso();
    const cals = Store.get('cal.cals', []);
    const colorOf = id => (cals.find(c => c.id === id) || {}).color || 'var(--faint)';
    const items = Store.get('cal.items', [])
      .filter(i => i.date && i.date >= today)
      .sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0)
      .slice(0, 5);
    if (!items.length) { host.innerHTML = `<p class="dash-empty">Nothing scheduled ahead.</p>`; return; }
    host.innerHTML = items.map(i => `
      <div class="dash-up-row">
        <i class="dash-dot" style="background:${colorOf(i.cal)}"></i>
        <span class="dash-up-text">${esc(i.text)}</span>
        <span class="dash-up-when">${i.date === today ? 'Today' : fmtShort(i.date)}</span>
      </div>`).join('');
  }

  /* ---------------- reading now ---------------- */
  function renderReading() {
    const host = document.getElementById('dashReading');
    if (!host) return;
    const reading = Store.get('books', []).filter(b => b.status === 'reading').slice(0, 5);
    if (!reading.length) { host.innerHTML = `<p class="dash-empty">Nothing on the go — pick something up on The Shelf.</p>`; return; }
    host.innerHTML = reading.map(b => `
      <div class="dash-book-row">
        <i class="dash-spine" style="background:${b.spine || 'var(--faint)'}"></i>
        <div><b>${esc(b.title)}</b>${b.author ? `<span>${esc(b.author)}</span>` : ''}</div>
      </div>`).join('');
  }

  /* ---------------- from the margin ---------------- */
  function renderThoughts() {
    const host = document.getElementById('dashThoughts');
    if (!host) return;
    const list = Store.get('thoughts', []).slice(0, 3);
    if (!list.length) { host.innerHTML = `<p class="dash-empty">Nothing jotted down yet.</p>`; return; }
    host.innerHTML = list.map(t => `
      <div class="dash-thought${t.kind === 'quote' ? ' quote' : ''}">
        <p>${t.img ? '📎 ' : ''}${esc(t.text ? (t.text.length > 120 ? t.text.slice(0, 118) + '…' : t.text) : '(picture only)')}</p>
        ${t.who ? `<span>— ${esc(t.who)}</span>` : ''}
      </div>`).join('');
  }

  /* ---------------- stacks progress ---------------- */
  function renderStacksWidget() {
    const host = document.getElementById('dashStacks');
    if (!host) return;
    const stacks = Store.get('stk.stacks', []);
    if (!stacks.length) { host.innerHTML = `<p class="dash-empty">No projects yet — start one on The Stacks.</p>`; return; }
    host.innerHTML = stacks.slice(0, 5).map(s => {
      const total = (s.books || []).length;
      const done = (s.books || []).filter(b => b.done).length;
      const pct = total ? Math.round((done / total) * 100) : 0;
      return `<div class="dash-stack-row">
        <div class="dash-stack-top"><b>${esc(s.name || 'Untitled project')}</b><span>${pct}%</span></div>
        <div class="dash-stack-bar"><i style="width:${pct}%;background:${s.accent || 'var(--amber)'}"></i></div>
      </div>`;
    }).join('');
  }

  /* ---------------- gallery bits (header pill + strip) ---------------- */
  function refreshGalleryBits() {
    const n = Gallery.count();
    ['dashGalleryCount', 'dashGalleryStripCount'].forEach(id => { const e = document.getElementById(id); if (e) e.textContent = n ? String(n) : (id === 'dashGalleryCount' ? '0' : ''); });
    const strip = document.getElementById('dashGalleryStrip');
    if (!strip) return;
    const recent = Gallery.recent(8);
    if (!recent.length) { strip.innerHTML = `<p class="dash-empty">No pictures yet.</p>`; return; }
    strip.innerHTML = '';
    recent.forEach(rec => {
      const cell = el('div', 'dash-gal-cell');
      strip.appendChild(cell);
      Store.getImg('gal:' + rec.id).then(u => { if (u) cell.style.backgroundImage = `url(${u})`; });
      cell.onclick = () => Gallery.openModal();
    });
  }

  /* ---------------- life-balance radar ---------------- */
  function renderRadar() {
    const svg = document.getElementById('dashRadar');
    if (!svg) return;
    if (typeof Docket === 'undefined' || !Docket.sectionProgress) return;
    const axes = [
      { l: 'ENG', v: Docket.sectionProgress('clat', 'english').pct },
      { l: 'QA', v: Docket.sectionProgress('clat', 'quant').pct },
      { l: 'LR', v: Docket.sectionProgress('clat', 'logical').pct },
      { l: 'LGL', v: Docket.sectionProgress('clat', 'legal').pct },
      { l: 'GK', v: Docket.sectionProgress('clat', 'gk').pct }
    ];
    const max = 100;
    const cx = 110, cy = 96, R = 72, n = axes.length;
    const pt = (i, frac) => {
      const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
      return [cx + Math.cos(a) * R * frac, cy + Math.sin(a) * R * frac];
    };
    let rings = '';
    [.33, .66, 1].forEach(f => {
      const p = axes.map((_, i) => pt(i, f).join(',')).join(' ');
      rings += `<polygon points="${p}" fill="none" stroke="var(--line)" stroke-width="1"/>`;
    });
    let spokes = '', labels = '';
    axes.forEach((a, i) => {
      const [x, y] = pt(i, 1);
      spokes += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="var(--line)" stroke-width="1"/>`;
      const [lx, ly] = pt(i, 1.22);
      labels += `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" class="dash-radar-lbl">${a.l}</text>`;
    });
    const shape = axes.map((a, i) => pt(i, Math.max(.08, a.v / max)).join(',')).join(' ');
    svg.innerHTML = `${rings}${spokes}
      <polygon points="${shape}" fill="var(--amber)" fill-opacity=".22" stroke="var(--amber)" stroke-width="1.6"/>
      ${labels}`;
  }

  /* ---------------- pomodoro / focus timer ----------------
     Timestamp-based, not tick-decremented: the displayed number is always
     computed from (endAt - now), so a throttled/backgrounded tab can't make
     it drift or "pause" — the moment a tick does fire (or the tab regains
     focus) it snaps back to the correct value. State lives in Store, so the
     popout window (a real separate browser window, same origin) reads and
     writes the exact same key and both stay in sync via the 'storage' event. */
  const POMO_KEY = 'pomo.state';
  const POMO_DURATIONS = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };
  let pomoTickHandle = null;
  let pomoLastCompletedAt = 0;

  function pomoDefaultState() { return { mode: 'focus', running: false, endAt: null, remaining: POMO_DURATIONS.focus, completedAt: null }; }
  function pomoLoad() { return Store.get(POMO_KEY, pomoDefaultState()); }
  function pomoSave(st) { Store.set(POMO_KEY, st); }
  function pomoRemaining(st) {
    if (!st.running) return st.remaining;
    return Math.max(0, Math.round((st.endAt - Date.now()) / 1000));
  }
  function pomoFmt(s) { const m = Math.floor(s / 60), r = s % 60; return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`; }

  function pomoPaint() {
    const st = pomoLoad();
    const remaining = pomoRemaining(st);
    const t = document.getElementById('pomoTime');
    if (t) t.textContent = pomoFmt(remaining);
    const btn = document.getElementById('pomoStart');
    if (btn) btn.textContent = st.running ? 'Pause' : (remaining === POMO_DURATIONS[st.mode] ? 'Start' : 'Resume');
    document.querySelectorAll('.pomo-tab').forEach(b => b.classList.toggle('on', b.dataset.mode === st.mode));

    if (st.running && remaining <= 0 && st.completedAt !== pomoLastCompletedAt) {
      pomoLastCompletedAt = st.completedAt || Date.now();
      const finished = { ...st, running: false, remaining: 0, endAt: null, completedAt: pomoLastCompletedAt };
      pomoSave(finished);
      toast(st.mode === 'focus' ? 'Focus block done — take a break.' : 'Break over — back to it.');
      pomoPaint();
    }
  }
  function pomoStart() {
    const st = pomoLoad();
    if (st.running) return;
    const remaining = pomoRemaining(st);
    pomoSave({ ...st, running: true, endAt: Date.now() + remaining * 1000 });
    pomoPaint();
  }
  function pomoPause() {
    const st = pomoLoad();
    if (!st.running) return;
    pomoSave({ ...st, running: false, remaining: pomoRemaining(st), endAt: null });
    pomoPaint();
  }
  function pomoReset() {
    const st = pomoLoad();
    pomoSave({ ...st, running: false, remaining: POMO_DURATIONS[st.mode], endAt: null });
    pomoPaint();
  }
  function pomoSetMode(mode) {
    pomoSave({ mode, running: false, remaining: POMO_DURATIONS[mode], endAt: null, completedAt: null });
    pomoPaint();
  }
  function pomoOpenPopout() {
    const w = window.open('pomodoro.html', 'kasiPomodoro', 'width=300,height=400,resizable=yes,menubar=no,toolbar=no,location=no,status=no');
    if (!w) toast("Couldn't open the popout — check your browser's pop-up blocker.");
  }
  function wirePomodoro() {
    const tabs = document.getElementById('pomoTabs');
    if (!tabs || tabs._wired) { pomoPaint(); return; }
    tabs._wired = true;
    tabs.querySelectorAll('.pomo-tab').forEach(b => b.onclick = () => pomoSetMode(b.dataset.mode));
    document.getElementById('pomoStart').onclick = () => pomoLoad().running ? pomoPause() : pomoStart();
    document.getElementById('pomoReset').onclick = pomoReset;
    const popBtn = document.getElementById('pomoPopout');
    if (popBtn) popBtn.onclick = pomoOpenPopout;

    if (!pomoTickHandle) pomoTickHandle = setInterval(pomoPaint, 500);
    window.addEventListener('storage', e => { if (e.key === 'pos:' + POMO_KEY) pomoPaint(); });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) pomoPaint(); });
    pomoPaint();
  }

  /* ---------------- full render ---------------- */
  function render() {
    renderHeader();
    wireTodoInput();
    renderTodo();
    renderStats();
    renderBars();
    renderExamProgress();
    renderUpcoming();
    renderReading();
    renderThoughts();
    renderStacksWidget();
    renderRadar();
    wirePomodoro();
    refreshGalleryBits();
  }

  function init() { render(); }

  return { init, render, refreshGalleryBits };
})();
