/* ════════════════════════════════════════════════════════════
   ATLAS — the library. Index on the left, topic on the right.
   Works with no AI at all: read the gloss, write your own notes,
   mark what you have mastered. If Oracle is switched on in
   config.js, a "Write entry" button appears as well.
   ════════════════════════════════════════════════════════════ */
const Atlas = (() => {
  const K_PROG = 'prog', K_NOTE = 'note', K_UI = 'atlas.ui', K_ACT = 'activity';

  let sheet = null, sel = null, openSec = { 0: true }, q = '', saveTimer = null;

  const sheets = () => window.CODEX_DATA;
  const tid = (a, b) => a + '-' + b;
  const nTopics = s => s.sections.reduce((n, x) => n + x.topics.length, 0);
  const prog = () => Store.get(K_PROG, {});
  const notes = () => Store.get(K_NOTE, {});
  const pkey = (sid, name) => sid + '::' + name;

  /* ---- activity feed, shared with the dashboard ---- */
  function logActivity(kind, subject, topic) {
    const a = Store.get(K_ACT, []);
    a.unshift({ id: uid(), at: Date.now(), kind, subject, topic });
    Store.set(K_ACT, a.slice(0, 60));
  }
  /* ---- daily snapshot so the dashboard has a trend line ---- */
  function snapshot() {
    const h = Store.get('history', {});
    h[today()] = Object.keys(prog()).length;
    Store.set('history', h);
  }

  function boot() {
    const ui = Store.get(K_UI, {});
    sheet = sheets().find(s => s.id === ui.sheet) || sheets()[0];
    if (ui.si != null && sheet && sheet.sections[ui.si]) { sel = { si: ui.si, ti: ui.ti }; openSec[ui.si] = true; }
  }

  function refresh() { if (!sheet) boot(); render(); }

  function open(id, si, ti) {
    const s = sheets().find(x => x.id === id);
    if (!s) return false;
    sheet = s;
    sel = (si != null) ? { si, ti: ti || 0 } : null;
    openSec = si != null ? { [si]: true } : { 0: true };
    q = '';
    Store.set(K_UI, { sheet: id, si: sel && sel.si, ti: sel && sel.ti });
    render();
    return true;
  }

  function render() { renderTabs(); renderIndex(); renderReader(); }

  function renderTabs() {
    const host = document.getElementById('atlasTabs');
    host.innerHTML = sheets().map(s =>
      `<button class="stab${s.id === sheet.id ? ' on' : ''}" data-sheet="${esc(s.id)}">
        <i style="background:var(--${s.accent})"></i>${esc(s.short || s.name)}</button>`).join('');
    host.querySelectorAll('[data-sheet]').forEach(b => b.onclick = () => open(b.dataset.sheet));
  }

  function renderIndex() {
    const host = document.getElementById('atlasIdx');
    const P = prog(), N = notes();
    const total = nTopics(sheet);
    let done = 0, noted = 0;
    sheet.sections.forEach(s => s.topics.forEach(t => {
      if (P[pkey(sheet.id, t[0])]) done++;
      if ((N[pkey(sheet.id, t[0])] || '').trim()) noted++;
    }));
    const pct = total ? Math.round(done / total * 100) : 0;

    let h = `<div class="sheet-h">
      <div class="sheet-n">${esc(sheet.name)}</div>
      <div class="sheet-l">${esc(sheet.level)}</div>
    </div>
    <div class="mini">
      <div class="mini-t"><span>mastered</span><b>${pct}%</b></div>
      <div class="btrack"><div class="bfill" style="width:${pct}%;background:var(--grad)"></div></div>
      <div class="mini-t" style="margin:6px 0 0"><span>${done} / ${total} topics</span><span>${noted} noted</span></div>
    </div>
    <div class="fsel" style="margin-bottom:12px;padding:9px 12px">
      <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
      <input id="atlasFind" placeholder="find a topic" value="${esc(q)}">
    </div>`;

    sheet.sections.forEach((sec, si) => {
      const items = sec.topics.map((t, ti) => ({ t, ti })).filter(({ t }) =>
        !q || (t[0] + ' ' + (t[1] || '') + ' ' + sec.title).toLowerCase().includes(q.toLowerCase()));
      if (!items.length) return;
      const isOpen = q ? true : !!openSec[si];
      const w = sec.topics.filter(t => P[pkey(sheet.id, t[0])]).length;
      h += `<div class="sec">
        <button class="sec-h" data-sec="${si}">
          <span class="sec-i">${String(si + 1).padStart(2, '0')}</span>
          <span class="sec-t">${esc(sec.title)}</span>
          <span class="sec-n">${w}/${sec.topics.length}</span>
        </button>`;
      if (isOpen) {
        h += '<div class="tops">';
        items.forEach(({ t, ti }) => {
          const cls = ['top-i'];
          if (sel && sel.si === si && sel.ti === ti) cls.push('on');
          if (P[pkey(sheet.id, t[0])]) cls.push('done');
          else if ((N[pkey(sheet.id, t[0])] || '').trim()) cls.push('noted');
          h += `<button class="${cls.join(' ')}" data-si="${si}" data-ti="${ti}"><i></i><span>${esc(t[0])}</span></button>`;
        });
        h += '</div>';
      }
      h += '</div>';
    });
    host.innerHTML = h;

    const f = document.getElementById('atlasFind');
    f.oninput = e => {
      q = e.target.value; renderIndex();
      const n = document.getElementById('atlasFind');
      n.focus(); n.setSelectionRange(n.value.length, n.value.length);
    };
    host.querySelectorAll('[data-sec]').forEach(b => b.onclick = () => {
      const i = +b.dataset.sec; openSec[i] = !openSec[i]; renderIndex();
    });
    host.querySelectorAll('[data-si]').forEach(b => b.onclick = () => {
      sel = { si: +b.dataset.si, ti: +b.dataset.ti };
      Store.set(K_UI, { sheet: sheet.id, si: sel.si, ti: sel.ti });
      document.getElementById('atlasGrid').classList.add('reading');
      renderIndex(); renderReader();
    });
  }

  function renderReader() {
    const host = document.getElementById('atlasRead');
    if (!sel) {
      const total = nTopics(sheet);
      host.innerHTML = `<div class="crumb">Sheet</div>
        <h2 class="rd-t">${esc(sheet.name)}</h2>
        <p class="rd-g">${esc(sheet.blurb)}</p>
        <div class="empty" style="text-align:left;padding:26px 0 0">
          <b>${sheet.sections.length} sections · ${total} topics</b>
          Pick a topic from the index. Each one carries a one-line definition of what it is,
          a space for your own notes, and a mastery mark that feeds the dashboard.
        </div>`;
      return;
    }
    const sec = sheet.sections[sel.si], topic = sec.topics[sel.ti];
    const key = pkey(sheet.id, topic[0]);
    const isDone = !!prog()[key];
    const note = notes()[key] || '';
    const oracleOn = !!(window.CODEX_CONFIG || {}).oracle;

    const flat = [];
    sheet.sections.forEach((s, si) => s.topics.forEach((t, ti) => flat.push({ si, ti, name: t[0] })));
    const pos = flat.findIndex(f => f.si === sel.si && f.ti === sel.ti);

    host.innerHTML = `
      <button class="btn back" id="rdBack">‹ Index</button>
      <div class="crumb">${esc(sheet.name)} <b>/ ${esc(sec.title)}</b></div>
      <h2 class="rd-t">${esc(topic[0])}</h2>
      ${topic[1] ? `<p class="rd-g">${esc(topic[1])}</p>` : ''}
      <div class="rd-bar">
        <button class="btn ${isDone ? 'on' : 'grad'}" id="rdDone">${isDone ? '✓ Mastered' : 'Mark mastered'}</button>
        ${oracleOn ? '<button class="btn" id="rdWrite">Write full entry</button>' : ''}
        <button class="btn" id="rdCopy">Copy topic</button>
      </div>
      <div id="rdEntry"></div>
      <div class="notes">
        <div class="notes-l">Your notes</div>
        <textarea id="rdNote" placeholder="What is the actual idea here? Where does it break? Write it in your own words — that is the part that makes it stick.">${esc(note)}</textarea>
        <div class="notes-f"><span id="rdSaved">${note ? 'Saved' : 'Not written yet'}</span>
          <span>·</span><span>${note.trim() ? note.trim().split(/\s+/).length : 0} words</span></div>
      </div>
      <div class="rd-nav">
        ${pos > 0 ? `<button class="navb" data-go="${pos - 1}"><span>‹ Previous</span><b>${esc(flat[pos - 1].name)}</b></button>` : '<span></span>'}
        ${pos < flat.length - 1 ? `<button class="navb r" data-go="${pos + 1}"><span>Next ›</span><b>${esc(flat[pos + 1].name)}</b></button>` : '<span></span>'}
      </div>`;

    document.getElementById('rdBack').onclick = () => {
      document.getElementById('atlasGrid').classList.remove('reading');
    };
    document.getElementById('rdDone').onclick = () => {
      const p = prog();
      if (p[key]) delete p[key];
      else { p[key] = 1; logActivity('mastered', sheet.name, topic[0]); }
      Store.set(K_PROG, p); snapshot();
      renderIndex(); renderReader();
    };
    document.getElementById('rdCopy').onclick = () => {
      const txt = `${topic[0]}\n${sheet.name} · ${sec.title}\n${topic[1] || ''}\n\n${notes()[key] || ''}`;
      if (navigator.clipboard) navigator.clipboard.writeText(txt);
      toast('Copied.');
    };
    const ta = document.getElementById('rdNote');
    ta.oninput = () => {
      clearTimeout(saveTimer);
      document.getElementById('rdSaved').textContent = 'Saving…';
      saveTimer = setTimeout(() => {
        const n = notes(); const had = !!(n[key] || '').trim();
        n[key] = ta.value; Store.set(K_NOTE, n);
        if (!had && ta.value.trim()) logActivity('noted', sheet.name, topic[0]);
        const s = document.getElementById('rdSaved');
        if (s) { s.textContent = 'Saved'; s.className = 'saved'; }
        renderIndex();
      }, 700);
    };
    host.querySelectorAll('[data-go]').forEach(b => b.onclick = () => {
      const f = flat[+b.dataset.go];
      sel = { si: f.si, ti: f.ti }; openSec[f.si] = true;
      Store.set(K_UI, { sheet: sheet.id, si: sel.si, ti: sel.ti });
      renderIndex(); renderReader();
      document.getElementById('atlasRead').scrollIntoView({ block: 'start', behavior: 'smooth' });
    });

    const wbtn = document.getElementById('rdWrite');
    if (wbtn) wbtn.onclick = () => Oracle.write(sheet, sel, document.getElementById('rdEntry'));
    if (oracleOn) Oracle.load(sheet, sel, document.getElementById('rdEntry'));
  }

  return { refresh, open, logActivity, snapshot, nTopics, pkey };
})();
