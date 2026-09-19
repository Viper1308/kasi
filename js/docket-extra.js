/* ══════════════ DOCKET EXTRA — NEXUS summary widgets ══════════════
   docket.js (unmodified above) owns the exam switching, the syllabus
   checklist, the mock-score sheet + charts, and the error log. This
   file only adds the NEXUS-style "always visible" glance widgets
   around it — section-wise progress bars, an exam date / D-Day field,
   a Recent Mocks list, and a permanent Grade 12 CBSE glance — reading
   the same Store keys docket.js already writes to, so nothing here
   can get out of sync with it. It attaches its own listeners to the
   exam tab buttons rather than touching docket.js's own handlers. */
const DocketExtra = (() => {

  const META = {
    clat: { storageKey: 'exam-tracker-clat2027', label: 'CLAT 2027', sections: [
      { key: 'english', label: 'English' }, { key: 'quant', label: 'Quantitative Aptitude' },
      { key: 'logical', label: 'Logical Reasoning' }, { key: 'legal', label: 'Legal Reasoning' },
      { key: 'gk', label: 'General Knowledge' }
    ]},
    iimb: { storageKey: 'exam-tracker-iimb-ugat', label: 'IIM Bangalore UGAT', sections: [
      { key: 'english', label: 'English Comprehension' }, { key: 'quant', label: 'Quant & Data Interpretation' },
      { key: 'logical', label: 'Logical Reasoning' }
    ]},
    grade12: { storageKey: 'exam-tracker-grade12-commerce', label: 'Grade 12 Commerce', sections: [
      { key: 'english', label: 'English' }, { key: 'appmath', label: 'Applied Mathematics' },
      { key: ['macro', 'ied'], label: 'Economics' }, { key: 'acc', label: 'Accountancy' }, { key: 'bst', label: 'Business Studies' }
    ]}
  };

  let currentExam = 'clat';

  // D-Day exam dates. Seeded once with real dates on first run; after that the
  // person's own edits (via either date input) always win — seeding never
  // overwrites an existing value.
  const DDAY_SEED = { clat: '2027-12-06', iimb: '2026-11-15' };
  const DDAY_EXAMS = ['clat', 'iimb'];

  function seedExamDates() {
    DDAY_EXAMS.forEach(k => {
      const key = 'docket.examdate.' + k;
      if (!Store.get(key, '')) Store.set(key, DDAY_SEED[k]);
    });
  }

  function mockEntries(examKey) {
    return Store.get('docket.' + META[examKey].storageKey + '-mocks', []) || [];
  }

  function examDate(examKey) { return Store.get('docket.examdate.' + examKey, ''); }
  function setExamDate(examKey, val) { Store.set('docket.examdate.' + examKey, val); }

  // Shared D-Day math, used by both the Docket screen's big display and the
  // Dashboard hero banner, so the two are always reading the same number.
  function ddayInfo(examKey) {
    const val = examDate(examKey);
    if (!val) return { val: '', days: null, text: '—', past: false };
    const days = Math.ceil((new Date(val + 'T00:00:00') - new Date(new Date().toDateString())) / 86400000);
    const text = days > 0 ? `${days}` : days === 0 ? 'Today' : `+${Math.abs(days)}`;
    return { val, days, text, past: days < 0 };
  }

  function renderSecProgress() {
    const host = document.getElementById('docketSecProgress');
    if (!host || typeof Docket === 'undefined') return;
    const m = META[currentExam];
    host.innerHTML = `<h4>Section-wise progress</h4>` + m.sections.map(s => {
      const p = Docket.sectionProgress(currentExam, s.key);
      return `<div class="sec-progress-row">
        <span class="spr-label">${esc(s.label)}</span>
        <div class="spr-track"><i class="spr-fill" style="width:${p.pct}%"></i></div>
        <span class="spr-pct mono">${p.pct}%</span>
      </div>`;
    }).join('');
  }

  function renderDateBar() {
    const host = document.getElementById('docketDateBar');
    if (!host) return;
    const { val, text, days, past } = ddayInfo(currentExam);
    const longText = !val ? '—' : days > 0 ? `${days} days` : days === 0 ? 'Today' : `${Math.abs(days)} days ago`;
    host.innerHTML = `
      <div class="dd-field"><span>Exam date</span><input type="date" id="docketExamDate" value="${val}"></div>
      <div class="dd-field"><span>D-Day</span><span class="dd-num">${longText}</span></div>`;
    document.getElementById('docketExamDate').onchange = e => { setExamDate(currentExam, e.target.value); renderDateBar(); renderDdayHero(); if (typeof Dashboard !== 'undefined') Dashboard.refreshDdayHero(); };
    renderDdayHero();
  }

  /* ---------------- big D-Day hero, Docket screen ---------------- */
  function renderDdayHero() {
    const host = document.getElementById('docketDdayHero');
    if (!host) return;
    host.innerHTML = DDAY_EXAMS.map(k => {
      const { text, past } = ddayInfo(k);
      return `<div class="dday-big${past ? ' past' : ''}${k === currentExam ? ' current' : ''}">
        <div class="dday-big-label">${esc(META[k].label)}</div>
        <div class="dday-big-num">${esc(text)}<span class="dday-big-unit">${past ? '' : 'd'}</span></div>
      </div>`;
    }).join('');
  }

  function renderMocks() {
    const host = document.getElementById('docketMocksList');
    if (!host) return;
    const entries = mockEntries(currentExam).slice(-6).reverse();
    if (!entries.length) { host.innerHTML = `<p class="dash-empty">Log a mock in the Mock Score Log to see it here.</p>`; return; }
    host.innerHTML = entries.map((e, i) => {
      const label = e.label || ('Mock ' + (mockEntries(currentExam).length - i));
      const total = e.total !== '' && e.total != null ? e.total : '—';
      const acc = e.accuracy !== '' && e.accuracy != null ? e.accuracy + '%' : '';
      return `<div class="mock-mini-row"><b>${esc(label)}</b><span class="mmr-score mono">${esc(String(total))}${acc ? ' · ' + esc(acc) : ''}</span></div>`;
    }).join('');
  }

  function renderGrade12() {
    const host = document.getElementById('docketGrade12List');
    if (!host || typeof Docket === 'undefined') return;
    host.innerHTML = META.grade12.sections.map(s => {
      const p = Docket.sectionProgress('grade12', s.key);
      return `<div class="bar-row"><div class="br-top"><span>${esc(s.label)}</span><span>${p.pct}%</span></div><div class="bar-track"><i class="bar-fill" style="width:${p.pct}%"></i></div></div>`;
    }).join('');
  }

  function refresh() {
    renderSecProgress();
    renderDateBar();
    renderMocks();
    renderGrade12();
  }

  function init() {
    seedExamDates();
    document.querySelectorAll('.docket-examlist .tab-btn[data-exam]').forEach(btn => {
      btn.addEventListener('click', () => { currentExam = btn.dataset.exam; refresh(); });
    });
    const viewG12 = document.getElementById('docketViewGrade12');
    if (viewG12) viewG12.onclick = () => {
      const btn = document.querySelector('.docket-examlist .tab-btn[data-exam="grade12"]');
      if (btn) btn.click();
    };
    refresh();
  }

  return { init, refresh, ddayInfo, examLabel: k => META[k] ? META[k].label : k, DDAY_EXAMS };
})();
