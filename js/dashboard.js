/* ══════════════ THE DASHBOARD — home screen ══════════════
   A life-planner front page: greeting + clock, a to-do list, a focus
   streak, four headline stats, a week/month/year overview chart,
   upcoming events, and (below the fold) everything else the desk used
   to show — exam progress, subject balance, the focus timer, reading,
   the margin, projects and the gallery.

   Reads straight from Store for anything display-only (always fresh —
   the view is rebuilt every time you land back here). The one thing it
   *writes* — tasks — goes through Cal's small dashTasks/dashAddTask API
   so The Calendar and this widget never disagree about what's done. */
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
    if (hello) hello.textContent = `${greetingWord()}${name && name !== 'Your name' ? ', ' + name.split(' ')[0] : ''}.`;
    const dateEl = document.getElementById('dashDate');
    if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  /* ---------------- today's plan (backed by cal.items, kind:'task') ---------------- */
  function renderTodo() {
    const host = document.getElementById('dashTodoList');
    if (!host) return;
    const today = todayIso();
    const tasks = Cal.dashTasks()
      .filter(t => !t.done ? true : (t.date === today || !t.date))
      .filter(t => !t.date || t.date <= addDays(today, 6));
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
      if (t.done) { pillCls = 'pill-good'; pillText = 'Done'; }
      else if (overdue) { pillCls = 'pill-bad'; pillText = 'Overdue'; }
      else if (t.date === today) { pillCls = 'pill-warn'; pillText = 'Today'; }
      row.innerHTML = `
        <button class="dash-check" aria-label="Toggle done">${t.done ? '✓' : ''}</button>
        <span class="dash-todo-text">${esc(t.text)}</span>
        <span class="pill ${pillCls}">${pillText}</span>
        ${t.date ? `<span class="dash-todo-when${overdue ? ' late' : ''}">${t.date === today ? 'Today' : fmtShort(t.date)}</span>` : ''}
        <button class="dash-todo-x" aria-label="Remove">✕</button>`;
      row.querySelector('.dash-check').onclick = () => { Cal.dashToggleTask(t.id); render(); };
      row.querySelector('.dash-todo-x').onclick = () => { Cal.dashRemoveTask(t.id); render(); };
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
      render();
    });
  }

  /* ---------------- focus streak ---------------- */
  function dayHasCompletion(dateIso) {
    return Cal.dashTasks().some(t => t.done && t.date === dateIso);
  }
  function computeStreak() {
    let n = 0, d = new Date();
    // if nothing done today yet, the streak still counts through yesterday
    if (!dayHasCompletion(iso(d))) d.setDate(d.getDate() - 1);
    while (dayHasCompletion(iso(d))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  function renderStreak() {
    const numEl = document.getElementById('dashStreakNum');
    const grid = document.getElementById('dashStreakGrid');
    if (!numEl || !grid) return;
    numEl.textContent = computeStreak();
    const today = new Date();
    const shift = (today.getDay() + 6) % 7; // days since this week's Monday
    const thisMonday = new Date(today); thisMonday.setDate(today.getDate() - shift);
    const start = new Date(thisMonday); start.setDate(thisMonday.getDate() - 7); // 2 weeks total
    grid.innerHTML = '';
    for (let i = 0; i < 14; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const k = iso(d);
      const n = Cal.dashTasks().filter(t => t.done && t.date === k).length;
      const level = n === 0 ? 0 : n === 1 ? 1 : n === 2 ? 2 : 3;
      const cell = el('div', 'streak-cell');
      cell.dataset.level = String(level);
      cell.title = `${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} — ${n} completed`;
      grid.appendChild(cell);
    }
  }

  /* ---------------- headline stat cards ---------------- */
  const ICONS = {
    check: '<path d="M20 6L9 17l-5-5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    flame: '<path d="M12 2c1 4-4 5-4 9a4 4 0 008 0c0-2-1-3-1-3s2 2 2 5a6 6 0 01-12 0c0-5 4-6 5-11z"/>',
    trend: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>'
  };
  function statCard(icon, value, label) {
    return `<div class="stat-card">
      <div class="si"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[icon]}</svg></div>
      <div class="sv">${value}</div><div class="sl">${label}</div>
    </div>`;
  }
  function pomoHoursThisWeek() {
    const ws = startOfWeekIso(), we = endOfWeekIso();
    const log = Store.get('pomo.log', []);
    const mins = log.filter(x => x.date >= ws && x.date <= we).reduce((a, x) => a + (x.mins || 0), 0);
    return mins / 60;
  }
  function renderStatCards() {
    const host = document.getElementById('dashStatRow');
    if (!host) return;
    const ws = startOfWeekIso(), we = endOfWeekIso();
    let weekTasks = Cal.dashTasks().filter(t => t.date && t.date >= ws && t.date <= we);
    const done = weekTasks.filter(t => t.done).length;
    const total = weekTasks.length || Cal.dashTasks().length;
    const pct = total ? Math.round((done / (weekTasks.length ? weekTasks.length : Math.max(total, 1))) * 100) : 0;
    const focusH = pomoHoursThisWeek();
    host.innerHTML =
      statCard('check', done, 'Tasks completed') +
      statCard('clock', focusH.toFixed(1), 'Focus hours') +
      statCard('trend', pct + '%', 'Productivity');
  }

  /* ---------------- overview: donut (this week) ---------------- */
  function renderStats() {
    const svg = document.getElementById('dashPie');
    const legend = document.getElementById('dashPieLegend');
    if (!svg) return;
    const ws = startOfWeekIso(), we = endOfWeekIso();
    let tasks = Cal.dashTasks().filter(t => t.date && t.date >= ws && t.date <= we);
    if (!tasks.length) tasks = Cal.dashTasks();
    const done = tasks.filter(t => t.done).length;
    const total = tasks.length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    const r = 50, C = 2 * Math.PI * r;
    const doneLen = total ? (done / total) * C : 0;
    svg.innerHTML = `
      <circle cx="60" cy="60" r="${r}" fill="none" stroke="var(--panel-2)" stroke-width="16"/>
      ${total ? `<circle cx="60" cy="60" r="${r}" fill="none" stroke="var(--amber)" stroke-width="16"
        stroke-dasharray="${doneLen} ${C - doneLen}" stroke-linecap="round" transform="rotate(-90 60 60)"/>` : ''}
      <text x="60" y="56" text-anchor="middle" class="dash-pie-num">${pct}%</text>
      <text x="60" y="74" text-anchor="middle" class="dash-pie-lbl">done</text>`;
    if (legend) legend.innerHTML = `
      <div><i style="background:var(--amber)"></i> ${done} done</div>
      <div><i style="background:var(--panel-2)"></i> ${total - done} open</div>
      <div class="dash-pie-total">${total} task${total === 1 ? '' : 's'} this week</div>`;
  }

  /* ---------------- overview: week/month/year bars ---------------- */
  let overviewRange = 'week';
  function renderBars() {
    const svg = document.getElementById('dashBars');
    if (!svg) return;
    const tasks = Cal.dashTasks();
    let buckets = [];
    if (overviewRange === 'week') {
      for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const k = iso(d); buckets.push({ label: d.toLocaleDateString('en-IN', { weekday: 'narrow' }), from: k, to: k }); }
    } else if (overviewRange === 'month') {
      for (let i = 4; i >= 0; i--) {
        const end = new Date(); end.setDate(end.getDate() - i * 7);
        const start = new Date(end); start.setDate(end.getDate() - 6);
        buckets.push({ label: 'W' + (5 - i), from: iso(start), to: iso(end) });
      }
    } else {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(); d.setMonth(d.getMonth() - i);
        const from = iso(new Date(d.getFullYear(), d.getMonth(), 1));
        const to = iso(new Date(d.getFullYear(), d.getMonth() + 1, 0));
        buckets.push({ label: d.toLocaleDateString('en-IN', { month: 'narrow' }), from, to });
      }
    }
    const byBucket = buckets.map(b => {
      const list = tasks.filter(t => t.date && t.date >= b.from && t.date <= b.to);
      return { ...b, done: list.filter(t => t.done).length, open: list.filter(t => !t.done).length };
    });
    const max = Math.max(1, ...byBucket.map(x => x.done + x.open));
    const W = 300, H = 130, padB = 20, padT = 6, bw = W / byBucket.length, gap = byBucket.length > 9 ? 4 : 10;
    let bars = '';
    byBucket.forEach((x, i) => {
      const cx = i * bw + bw / 2;
      const usable = H - padB - padT;
      const doneH = (x.done / max) * usable, openH = (x.open / max) * usable;
      const bw2 = Math.max(4, bw - gap);
      let y = H - padB;
      if (x.open) { bars += `<rect x="${cx - bw2 / 2}" y="${y - openH}" width="${bw2}" height="${openH}" rx="2" fill="var(--cyan)" opacity=".55"/>`; y -= openH; }
      if (x.done) { bars += `<rect x="${cx - bw2 / 2}" y="${y - doneH}" width="${bw2}" height="${doneH}" rx="2" fill="var(--amber)"/>`; y -= doneH; }
      if (!x.open && !x.done) bars += `<rect x="${cx - bw2 / 2}" y="${H - padB - 2}" width="${bw2}" height="2" rx="1" fill="var(--panel-2)"/>`;
      bars += `<text x="${cx}" y="${H - 4}" text-anchor="middle" class="dash-bar-lbl">${x.label}</text>`;
    });
    svg.innerHTML = bars;
  }
  function wireOverviewTabs() {
    const wrap = document.getElementById('dashOverviewTabs');
    if (!wrap || wrap._wired) return;
    wrap._wired = true;
    wrap.querySelectorAll('button').forEach(b => b.onclick = () => {
      overviewRange = b.dataset.range;
      wrap.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
      renderBars();
    });
  }

  /* ---------------- exam progress ---------------- */
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
      .slice(0, 6);
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

  /* ---------------- D-Day hero (CLAT + IIM-B UGAT countdown) ----------------
     Reads straight from the same 'docket.examdate.<key>' Store keys DocketExtra
     owns, with its own copy of the label + seed date, so this renders correctly
     even on the very first paint (Dashboard.init runs before Docket's own init
     seeds those keys). DocketExtra.refreshDdayHero() (if present) re-paints this
     the moment a date is edited on the Docket screen, so the two stay in sync. */
  const DDAY_EXAMS = [
    { key: 'clat', label: 'CLAT 2027', seed: '2027-12-06' },
    { key: 'iimb', label: 'IIM Bangalore UGAT', seed: '2026-11-15' }
  ];
  function renderDdayHero() {
    const host = document.getElementById('dashDdayHero');
    if (!host) return;
    host.innerHTML = DDAY_EXAMS.map(ex => {
      const storeKey = 'docket.examdate.' + ex.key;
      const val = Store.get(storeKey, '') || ex.seed;
      const days = Math.ceil((new Date(val + 'T00:00:00') - new Date(new Date().toDateString())) / 86400000);
      const past = days < 0;
      const text = days > 0 ? `${days}` : days === 0 ? 'Today' : `+${Math.abs(days)}`;
      return `<div class="dday-big${past ? ' past' : ''}">
        <div class="dday-big-label">${esc(ex.label)}</div>
        <div class="dday-big-num">${esc(text)}<span class="dday-big-unit">${past ? '' : 'd'}</span></div>
      </div>`;
    }).join('');
  }

  /* ---------------- gallery bits (left-nav badge count) ---------------- */
  function refreshGalleryBits() {
    const n = Gallery.count();
    const e = document.getElementById('dashGalleryCount');
    if (e) e.textContent = n ? String(n) : '0';
    renderOnRepeat();
  }

  /* ---------------- "On repeat" — one picture, rotating every 10 seconds ----------------
     A separate, small feature card (distinct from the Gallery strip above): shows a
     single picture from the Gallery at a time, and swaps to a new one automatically
     every 10 seconds. Picks a fresh random picture each interval (never the one
     currently showing, when there's more than one to choose from). */
  const ON_REPEAT_MS = 10 * 1000;
  let onRepeatTimer = null;
  let onRepeatCurrentId = null;

  function onRepeatStop() { if (onRepeatTimer) { clearInterval(onRepeatTimer); onRepeatTimer = null; } }
  function onRepeatPickNext(pool) {
    if (!pool.length) return null;
    if (pool.length === 1) return pool[0];
    let pick;
    do { pick = pool[Math.floor(Math.random() * pool.length)]; } while (pick.id === onRepeatCurrentId);
    return pick;
  }
  function onRepeatShow(rec) {
    const host = document.getElementById('dashOnRepeat');
    if (!host || !rec) return;
    onRepeatCurrentId = rec.id;
    Store.getImg('gal:' + rec.id).then(u => { if (u) host.style.backgroundImage = `url(${u})`; });
  }
  function renderOnRepeat() {
    const card = document.getElementById('dashOnRepeatCard');
    const host = document.getElementById('dashOnRepeat');
    if (!card || !host) return;
    onRepeatStop();
    card.onclick = () => Gallery.openModal();
    const pool = Gallery.all();
    if (!pool.length) {
      host.style.backgroundImage = '';
      card.classList.add('empty');
      return;
    }
    card.classList.remove('empty');
    onRepeatShow(onRepeatPickNext(pool));
    onRepeatTimer = setInterval(() => onRepeatShow(onRepeatPickNext(Gallery.all())), ON_REPEAT_MS);
  }

  /* ---------------- subject-balance radar ---------------- */
  function renderRadar() {
    const svg = document.getElementById('dashRadar');
    if (!svg) return;
    if (typeof Docket === 'undefined' || !Docket.sectionProgress) return;
    const axes = [
      { l: 'ENG', v: Docket.sectionProgress('iimb', 'english').pct },
      { l: 'QADI', v: Docket.sectionProgress('iimb', 'quant').pct },
      { l: 'LR', v: Docket.sectionProgress('iimb', 'logical').pct }
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
      rings += `<polygon points="${p}" fill="none" stroke="var(--panel-2)" stroke-width="1"/>`;
    });
    let spokes = '', labels = '';
    axes.forEach((a, i) => {
      const [x, y] = pt(i, 1);
      spokes += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="var(--panel-2)" stroke-width="1"/>`;
      const [lx, ly] = pt(i, 1.22);
      labels += `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" class="dash-radar-lbl">${a.l}</text>`;
    });
    const shape = axes.map((a, i) => pt(i, Math.max(.08, a.v / max)).join(',')).join(' ');
    svg.innerHTML = `${rings}${spokes}
      <polygon points="${shape}" fill="var(--amber)" fill-opacity=".22" stroke="var(--amber)" stroke-width="1.6"/>
      ${labels}`;
  }

  /* ---------------- pomodoro / focus timer ---------------- */
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
  function pomoLogSession(mode) {
    if (mode !== 'focus') return; // only focus blocks count toward "focus hours"
    const log = Store.get('pomo.log', []);
    log.push({ date: todayIso(), mins: POMO_DURATIONS.focus / 60 });
    Store.set('pomo.log', log.slice(-500)); // keep it bounded
  }

  function pomoPaint() {
    const st = pomoLoad();
    const remaining = pomoRemaining(st);
    const t = document.getElementById('pomoTime');
    if (t) t.textContent = pomoFmt(remaining);
    const btn = document.getElementById('pomoStart');
    if (btn) btn.textContent = st.running ? 'Pause' : (remaining === POMO_DURATIONS[st.mode] ? 'Start' : 'Resume');
    document.querySelectorAll('.pomo-tab').forEach(b => b.classList.toggle('on', b.dataset.mode === st.mode));

    const ring = document.getElementById('pomoArc');
    if (ring) {
      const total = POMO_DURATIONS[st.mode] || 1;
      const frac = Math.max(0, Math.min(1, remaining / total));
      const C = 326.7;
      ring.style.strokeDasharray = String(C);
      ring.style.strokeDashoffset = String(C * (1 - frac));
    }

    if (st.running && remaining <= 0 && st.completedAt !== pomoLastCompletedAt) {
      pomoLastCompletedAt = st.completedAt || Date.now();
      const finished = { ...st, running: false, remaining: 0, endAt: null, completedAt: pomoLastCompletedAt };
      pomoSave(finished);
      pomoLogSession(st.mode);
      toast(st.mode === 'focus' ? 'Focus block done — take a break.' : 'Break over — back to it.');
      pomoPaint();
      renderStatCards();
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
    const w = window.open('pomodoro.html', 'nexusPomodoro', 'width=300,height=400,resizable=yes,menubar=no,toolbar=no,location=no,status=no');
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
    renderDdayHero();
    wireTodoInput();
    renderTodo();
    renderStreak();
    renderStatCards();
    renderStats();
    wireOverviewTabs();
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

  return { init, render, refreshGalleryBits, refreshDdayHero: renderDdayHero };
})();
