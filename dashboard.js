/* ════════════════════════════════════════════════════════════
   DASHBOARD — the overview screen.
   Layout mirrors the reference: filter row, four KPI cards with
   sparklines, a big gradient area chart beside a donut, a bar
   list beside a wide chart, then an activity feed.
   Every number is real, computed from your own progress.
   ════════════════════════════════════════════════════════════ */
const Dashboard = (() => {
  const COLS = { cyan: '#38bdf8', sky: '#3b82f6', blue: '#4f7dfa', indigo: '#6366f1',
                 violet: '#8b5cf6', magenta: '#d946ef', pink: '#ec4899', teal: '#2dd4bf' };
  let range = 30, filter = 'all';

  const sheets = () => window.CODEX_DATA;
  const prog = () => Store.get('prog', {});
  const notes = () => Store.get('note', {});

  function stats() {
    const P = prog(), N = notes();
    const list = sheets().filter(s => filter === 'all' || s.id === filter);
    let topics = 0, mastered = 0, noted = 0, words = 0, sections = 0;
    const per = list.map(s => {
      let t = 0, m = 0, n = 0;
      s.sections.forEach(sec => sec.topics.forEach(tp => {
        t++;
        const k = Atlas.pkey(s.id, tp[0]);
        if (P[k]) m++;
        const note = (N[k] || '').trim();
        if (note) { n++; words += note.split(/\s+/).length; }
      }));
      topics += t; mastered += m; noted += n; sections += s.sections.length;
      return { sheet: s, topics: t, mastered: m, noted: n, pct: t ? m / t : 0 };
    });
    return { list, per, topics, mastered, noted, words, sections };
  }

  /* daily history → a series of `range` days */
  function series(days) {
    const h = Store.get('history', {});
    const out = [], labels = [];
    const d = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const x = new Date(d); x.setDate(d.getDate() - i);
      const key = x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0');
      out.push(h[key]);
      labels.push(x.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }));
    }
    // carry the last known value forward across gaps
    let last = 0;
    const filled = out.map(v => { if (v != null) last = v; return last; });
    return { values: filled, labels };
  }

  function render() {
    const S = stats();
    const hist = series(range);
    const gained = hist.values[hist.values.length - 1] - hist.values[0];

    /* ---- filters ---- */
    document.getElementById('dashFilters').innerHTML = `
      <div class="fsel">
        <svg viewBox="0 0 24 24"><path d="M4 6h16M7 12h10M10 18h4"/></svg>
        <select id="fSubject">
          <option value="all">All subjects</option>
          ${sheets().map(s => `<option value="${esc(s.id)}"${filter === s.id ? ' selected' : ''}>${esc(s.name)}</option>`).join('')}
        </select>
      </div>
      <div class="fsel">
        <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>
        <select id="fRange">
          ${[[7, 'Last 7 days'], [30, 'Last 30 days'], [90, 'Last 90 days']].map(([v, l]) =>
            `<option value="${v}"${range === v ? ' selected' : ''}>${l}</option>`).join('')}
        </select>
      </div>
      <div class="fsel">
        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
        <input id="fSearch" placeholder="Search all ${sheets().reduce((n, s) => n + Atlas.nTopics(s), 0)} topics">
      </div>`;
    document.getElementById('fSubject').onchange = e => { filter = e.target.value; render(); };
    document.getElementById('fRange').onchange = e => { range = +e.target.value; render(); };
    document.getElementById('fSearch').onkeydown = e => {
      if (e.key === 'Enter' && e.target.value.trim()) App.search(e.target.value.trim());
    };

    /* ---- KPI cards ---- */
    const kpi = (label, value, delta, colour, spark) => `
      <div class="kpi">
        <div class="kpi-l">${label}</div>
        <div class="kpi-v">${value}</div>
        <div class="kpi-d${delta ? '' : ' flat'}">${delta || '—'}</div>
        ${Chart.spark(spark, colour)}
      </div>`;
    const covRaw = S.topics ? (S.mastered / S.topics * 100) : 0;
    const cov = covRaw === 0 ? '0' : covRaw < 1 ? covRaw.toFixed(1) : Math.round(covRaw);
    document.getElementById('dashKpis').innerHTML =
      kpi('Topics Mastered', S.mastered.toLocaleString('en-IN'),
          gained > 0 ? '↑ ' + gained + ' this period' : '', COLS.cyan, hist.values) +
      kpi('Coverage', cov + '%', S.topics ? S.topics.toLocaleString('en-IN') + ' in scope' : '',
          COLS.violet, hist.values.map(v => S.topics ? v / S.topics * 100 : 0)) +
      kpi('Topics Noted', S.noted.toLocaleString('en-IN'),
          S.words ? S.words.toLocaleString('en-IN') + ' words written' : '', COLS.magenta,
          S.per.map(p => p.noted)) +
      kpi('Subjects Tracked', S.list.length,
          S.sections + ' sections', COLS.teal, S.per.map(p => p.topics));

    /* ---- area chart ---- */
    const any = hist.values.some(v => v > 0);
    document.getElementById('dashArea').innerHTML = any
      ? Chart.area([{ values: hist.values, colour: COLS.violet }], { labels: hist.labels })
      : `<div class="empty"><b>No history yet</b>Mark a topic mastered in the Atlas and this line starts moving. It records one point a day.</div>`;

    /* ---- donut ---- */
    const segs = S.per.filter(p => p.mastered > 0)
      .sort((a, b) => b.mastered - a.mastered)
      .map(p => ({ label: p.sheet.short || p.sheet.name, value: p.mastered, colour: COLS[p.sheet.accent] || COLS.violet }));
    document.getElementById('dashDonut').innerHTML = segs.length
      ? `<div class="donut-c">${Chart.donut(segs)}
           <div class="donut-mid"><span>mastered</span><b>${S.mastered}</b></div></div>
         <div class="legend">${segs.map(s =>
            `<span><i style="background:${s.colour}"></i>${esc(s.label)} ${Math.round(s.value / S.mastered * 100)}%</span>`).join('')}</div>`
      : `<div class="empty"><b>Nothing marked yet</b>This ring splits your mastered topics by subject.</div>`;

    /* ---- subject bar list ---- */
    document.getElementById('dashBars').innerHTML = `<div class="blist">${
      S.per.slice().sort((a, b) => b.pct - a.pct).map(p => {
        const c = COLS[p.sheet.accent] || COLS.violet;
        return `<div class="brow" data-open="${esc(p.sheet.id)}">
          <div class="brow-t"><span class="brow-n">${esc(p.sheet.name)}</span>
            <span class="brow-v">${p.mastered}/${p.topics}</span></div>
          <div class="btrack"><div class="bfill" style="width:${Math.max(p.pct * 100, p.mastered ? 2 : 0)}%;
            background:linear-gradient(90deg,${c},${COLS.magenta})"></div></div>
        </div>`;
      }).join('')}</div>`;
    document.querySelectorAll('[data-open]').forEach(b => b.onclick = () => {
      Atlas.open(b.dataset.open); App.go('atlas');
    });

    /* ---- section bars ---- */
    const target = filter === 'all' ? null : sheets().find(s => s.id === filter);
    const barData = target
      ? target.sections.map((sec, i) => ({
          label: sec.title, short: String(i + 1),
          value: sec.topics.filter(t => prog()[Atlas.pkey(target.id, t[0])]).length }))
      : S.per.map(p => ({ label: p.sheet.name, short: (p.sheet.short || p.sheet.name).slice(0, 4), value: p.mastered }));
    document.getElementById('dashBarsTitle').textContent = target ? 'Mastery by Section' : 'Mastery by Subject';
    document.getElementById('dashVBars').innerHTML = barData.some(b => b.value > 0)
      ? Chart.bars(barData)
      : `<div class="empty"><b>Nothing to plot yet</b>Bars fill in as you mark topics.</div>`;

    /* ---- activity ---- */
    const acts = Store.get('activity', []).slice(0, 6);
    document.getElementById('dashActivity').innerHTML = acts.length
      ? `<div class="alist">${acts.map(a => {
          const s = sheets().find(x => x.name === a.subject);
          const c = COLS[(s && s.accent) || 'violet'];
          const badge = a.kind === 'mastered' ? '<span class="badge done">Mastered</span>'
                      : a.kind === 'noted' ? '<span class="badge note">Noted</span>'
                      : '<span class="badge read">Written</span>';
          return `<div class="arow">
            <div class="av" style="background:linear-gradient(135deg,${c},${COLS.magenta})">${esc((a.subject || '?')[0])}</div>
            <div class="arow-m"><div class="arow-n">${esc(a.topic)}</div>
              <div class="arow-s">${esc(a.subject)} · ${timeAgo(a.at)}</div></div>
            ${badge}</div>`;
        }).join('')}</div>`
      : `<div class="empty"><b>No activity yet</b>Marking topics and writing notes shows up here.</div>`;
  }

  function timeAgo(t) {
    const s = (Date.now() - t) / 1000;
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s / 60) + 'm ago';
    if (s < 86400) return Math.floor(s / 3600) + 'h ago';
    return Math.floor(s / 86400) + 'd ago';
  }

  return { render };
})();
