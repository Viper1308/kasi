/* ══════════════ THE ATLAS — a written library, one entry per topic ══════════════
   Follows the house pattern: an IIFE exposing a small public API, drawing into
   #view-atlas, using Store for small state so it rides the existing kv sync.

   Entries are the exception. They run 8–12 KB each and there are hundreds, which
   would blow past the localStorage ceiling and bloat every pullAll. So they live
   in their own Supabase table (atlas_entries) with an IndexedDB cache in front —
   the same shape as the images path in store.js.
   ═══════════════════════════════════════════════════════════════════════════ */
const Atlas = (() => {

  /* ---------- keys ---------- */
  const K_CUSTOM = 'atlas.sheets';   // subjects built via "New subject"
  const K_PROG   = 'atlas.prog';     // { "sheetId::Topic name": 1 }
  const K_UI     = 'atlas.ui';       // { sheet, si, ti }

  /* ---------- the five passes ---------- */
  const PARTS = [
    { tag: 'Orientation', plan: 'What it is, why it exists, the intuition underneath',
      brief: 'Explain what this topic is and why it exists. Start from the problem it was invented to solve. Build the intuition in plain language before any formalism — an analogy or a concrete situation the reader can picture. State plainly what someone gains by understanding it.' },
    { tag: 'The formal core', plan: 'Precise definitions, the central result, where it comes from',
      brief: 'Give the precise account: exact definitions, the central statement or model, and the derivation or proof sketch that produces it. Show the actual steps of the reasoning, not a summary that it exists. This is the part the reader should be able to reconstruct on a blank page afterwards.' },
    { tag: 'Worked case', plan: 'One concrete instance carried all the way through',
      brief: 'Work one concrete case fully through, with real numbers, a specific instance, or a canonical example. Show every step including the arithmetic or manipulation. Then say what the answer means and what would change if a key input moved.' },
    { tag: 'Limits and traps', plan: 'Assumptions, failure modes, mistakes people actually make',
      brief: 'Name the assumptions the result depends on and what breaks when each fails. List the specific errors people reliably make with this topic, and the distinctions that are easy to blur. Be concrete about the boundary of validity — where the idea stops applying and what replaces it there.' },
    { tag: 'Connections and sources', plan: 'Links to neighbouring topics, and where to read further',
      brief: 'Show how this topic connects to the neighbouring topics listed below — what it depends on, what depends on it, what it generalises. Then name the standard texts, papers or authors a serious reader should go to. Close with the single sharpest question the reader should be able to answer if they have really understood this.' }
  ];

  function partPrompt(ctx, part, prior, i) {
    return `You are writing one part of a reference entry in a rigorous personal study library.

SUBJECT: ${ctx.subject}
DEPTH: ${ctx.level}
SECTION: ${ctx.section}
TOPIC: ${ctx.topic}${ctx.gloss ? `\nSHORT GLOSS: ${ctx.gloss}` : ''}
NEIGHBOURING TOPICS IN THIS SECTION: ${ctx.siblings.join('; ')}
${ctx.spec ? `READER'S STANDING INSTRUCTIONS: ${ctx.spec}` : ''}

You are writing PART ${i + 1} OF ${PARTS.length}: "${part.tag}".
Remit of this part: ${part.brief}
${prior ? `\nThe previous part ended with:\n"""${prior}"""\nContinue from there without repeating it.` : ''}

Rules:
- 350 to 500 words. Write to the stated depth — assume a serious reader, do not water it down.
- Start immediately with the content. Do NOT restate the topic name as a title, and do not write "In this section".
- Plain prose paragraphs by default. Use markdown ## subheadings only if the part genuinely has two or more distinct movements, and short bullet lists only where the content is genuinely a list.
- There is no mathematics renderer here, so never use LaTeX, dollar signs, or symbols that may not display. Write every formula in ordinary letters and words: \`dy/dx\`, \`sum over i of x_i\`, \`the integral from a to b of f(x) dx\`, \`sigma\`, \`lambda\`, \`E[X]\`.
- Define every variable in words the first time it appears — what it stands for, and what kind of object it is.
- Whenever the written-out form differs from how the result is normally printed, name the real notation for the reader in a short aside: give the standard symbol, say what the symbol is called, and say how the expression is read aloud. Do this once per new piece of notation, not repeatedly.
- Use \`code\` style for every formula, variable and symbol.
- No preamble, no summary of what you are about to do, no closing pleasantries.`;
  }

  /* ---------- state ---------- */
  let sheets = [], sheet = null, sel = null, openSec = { 0: true }, q = '';
  let writtenIdx = {};          // sheetId -> { tid: 1 }
  let cache = {};               // "sheetId:tid" -> parts[]
  let busy = null, stopFlag = false, booted = false, errMsg = null;  // errMsg = {key, text}

  const tid = (si, ti) => si + '-' + ti;
  const nTopics = s => s.sections.reduce((n, x) => n + x.topics.length, 0);
  const prog = () => Store.get(K_PROG, {});

  /* ---------- entry storage: IndexedDB cache + Supabase table ---------- */
  let dbp = null;
  function db() {
    if (dbp) return dbp;
    dbp = new Promise(res => {
      try {
        const r = indexedDB.open('polymath-atlas', 1);
        r.onupgradeneeded = () => r.result.createObjectStore('entries');
        r.onsuccess = () => res(r.result);
        r.onerror = () => res(null);
      } catch (e) { res(null); }
    });
    return dbp;
  }
  function idb(mode, fn) {
    return db().then(d => {
      if (!d) return null;
      return new Promise(res => {
        try {
          const rq = fn(d.transaction('entries', mode).objectStore('entries'));
          rq.onsuccess = () => res(rq.result === undefined ? null : rq.result);
          rq.onerror = () => res(null);
        } catch (e) { res(null); }
      });
    });
  }
  const sb = () => (typeof Sync !== 'undefined' && Sync.client && Sync.client()) || null;
  const me = () => (typeof Sync !== 'undefined' && Sync.currentUser && Sync.currentUser()) || null;

  async function loadIndex(sheetId) {
    if (writtenIdx[sheetId]) return writtenIdx[sheetId];
    const idx = {};
    const local = await idb('readonly', s => s.getAllKeys());
    (local || []).forEach(k => {
      const [sh, t] = String(k).split('|');
      if (sh === sheetId) idx[t] = 1;
    });
    const c = sb(), u = me();
    if (c && u) {
      const { data, error } = await c.from('atlas_entries').select('tid').eq('user_id', u.id).eq('sheet', sheetId);
      if (!error) (data || []).forEach(r => { idx[r.tid] = 1; });
    }
    writtenIdx[sheetId] = idx;
    return idx;
  }

  async function readEntry(sheetId, t) {
    const key = sheetId + ':' + t;
    if (cache[key]) return cache[key];
    const local = await idb('readonly', s => s.get(sheetId + '|' + t));
    if (local) { cache[key] = local; return local; }
    const c = sb(), u = me();
    if (c && u) {
      const { data } = await c.from('atlas_entries').select('parts')
        .eq('user_id', u.id).eq('sheet', sheetId).eq('tid', t).maybeSingle();
      if (data && data.parts) {
        cache[key] = data.parts;
        idb('readwrite', s => s.put(data.parts, sheetId + '|' + t));
        return data.parts;
      }
    }
    return null;
  }

  async function saveEntry(sheetId, t, topicName, parts) {
    cache[sheetId + ':' + t] = parts;
    await idb('readwrite', s => s.put(parts, sheetId + '|' + t));
    (writtenIdx[sheetId] = writtenIdx[sheetId] || {})[t] = 1;
    const c = sb(), u = me();
    if (c && u) {
      const { error } = await c.from('atlas_entries').upsert({
        user_id: u.id, sheet: sheetId, tid: t, topic: topicName,
        parts, updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,sheet,tid' });
      if (error) console.warn('atlas save', error.message);
    }
  }

  /* ---------- the model ---------- */
  async function ask(prompt) {
    let token = null;
    const c = sb();
    if (c) { try { token = (await c.auth.getSession()).data?.session?.access_token || null; } catch (e) { } }
    const r = await fetch('/api/atlas', {
      method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json' },
        token ? { Authorization: 'Bearer ' + token } : {}),
      body: JSON.stringify({ prompt })
    });
    if (r.status === 401) throw new Error('Signed out, or the server can’t verify you. Log in again.');
    if (r.status === 429) throw new Error('Rate limited. Wait a minute.');
    if (!r.ok) {
      let d = ''; try { const j = await r.json(); d = j?.error?.message ? ' — ' + j.error.message : ''; } catch (e) { }
      throw new Error('Request failed (' + r.status + ')' + d);
    }
    const j = await r.json();
    return (j.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');
  }

  function parseJSON(text) {
    let t = String(text || '').trim().replace(/^```(?:json)?/i, '').replace(/```\s*$/, '').trim();
    const a = t.indexOf('{'), b = t.lastIndexOf('}');
    if (a !== -1 && b > a) t = t.slice(a, b + 1);
    return JSON.parse(t);
  }

  /* ---------- markdown ---------- */
  function md(src) {
    const inline = s => s
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*\w])\*([^*\n]+)\*/g, '$1<em>$2</em>');
    const lines = esc(String(src || '')).split(/\r?\n/);
    const out = []; let list = null, para = [];
    const fp = () => { if (para.length) { out.push('<p>' + inline(para.join(' ')) + '</p>'); para = []; } };
    const fl = () => { if (list) { out.push('</' + list + '>'); list = null; } };
    for (const raw of lines) {
      const l = raw.trim(); let m;
      if (!l) { fp(); fl(); continue; }
      if ((m = l.match(/^#{2,4}\s+(.*)$/))) { fp(); fl(); out.push('<h4>' + inline(m[1]) + '</h4>'); }
      else if (/^(---+|\*\*\*+)$/.test(l)) { fp(); fl(); out.push('<hr/>'); }
      else if ((m = l.match(/^&gt;\s?(.*)$/))) { fp(); fl(); out.push('<blockquote>' + inline(m[1]) + '</blockquote>'); }
      else if ((m = l.match(/^[-*•]\s+(.*)$/))) { fp(); if (list !== 'ul') { fl(); out.push('<ul>'); list = 'ul'; } out.push('<li>' + inline(m[1]) + '</li>'); }
      else if ((m = l.match(/^\d+[.)]\s+(.*)$/))) { fp(); if (list !== 'ol') { fl(); out.push('<ol>'); list = 'ol'; } out.push('<li>' + inline(m[1]) + '</li>'); }
      else { fl(); para.push(l); }
    }
    fp(); fl();
    return out.join('');
  }

  /* ---------- boot ---------- */
  function allSheets() {
    return (window.ATLAS_SHEETS || []).concat(Store.get(K_CUSTOM, []));
  }
  async function boot() {
    sheets = allSheets();
    const ui = Store.get(K_UI, {});
    sheet = sheets.find(s => s.id === ui.sheet) || sheets[0];
    if (!sheet) return;
    await loadIndex(sheet.id);
    booted = true;
  }

  async function refresh() {
    if (!booted) await boot();
    else sheets = allSheets();
    render();
  }

  async function openSheet(id) {
    const s = sheets.find(x => x.id === id);
    if (!s) return;
    sheet = s; sel = null; q = ''; openSec = { 0: true };
    Store.set(K_UI, { sheet: id });
    await loadIndex(id);
    render();
  }

  /* called from The Web: jump straight to a subject's sheet */
  function openSubject(webId) {
    const map = { cs: 'computing', ai: 'computing', math: 'mathematics' };
    const target = map[webId] || webId;
    const s = sheets.find(x => x.id === target) ||
              sheets.find(x => x.name.toLowerCase().includes(String(webId).toLowerCase()));
    if (!s) { toast('No Atlas sheet for that subject yet — build one from the Atlas.'); return false; }
    openSheet(s.id);
    return true;
  }

  /* ---------- render ---------- */
  function render() {
    renderIndex();
    renderReader();
  }

  function renderIndex() {
    const host = document.getElementById('atlIndex');
    if (!host || !sheet) return;
    const idx = writtenIdx[sheet.id] || {}, P = prog();
    const total = nTopics(sheet), written = Object.keys(idx).length;
    const pct = total ? Math.round(written / total * 100) : 0;
    let mastered = 0;
    sheet.sections.forEach(s => s.topics.forEach(t => { if (P[sheet.id + '::' + t[0]]) mastered++; }));

    let h = '';
    h += `<div class="atl-pick">
      <select id="atlSheetSel" class="inp">${sheets.map(s =>
        `<option value="${esc(s.id)}"${s.id === sheet.id ? ' selected' : ''}>${esc(s.name)}</option>`).join('')}</select>
      <button class="tool tiny" id="atlNew" title="Build an index for a new subject">+</button>
    </div>`;
    h += `<div class="atl-lvl">${esc(sheet.level)}</div>`;
    h += `<div class="atl-gauge">
      <div class="atl-gauge-top"><span>library</span><b>${pct}%</b></div>
      <div class="atl-rule"><i style="width:${pct}%"></i></div>
      <div class="atl-gauge-foot"><span>${written} / ${total} written</span><span>${mastered} mastered</span></div>
    </div>`;
    h += `<input id="atlFind" class="inp atl-find" placeholder="find a topic…" value="${esc(q)}">`;

    sheet.sections.forEach((sec, si) => {
      const items = sec.topics.map((t, ti) => ({ t, ti })).filter(({ t }) =>
        !q || (t[0] + ' ' + (t[1] || '') + ' ' + sec.title).toLowerCase().includes(q.toLowerCase()));
      if (!items.length) return;
      const open = q ? true : !!openSec[si];
      const w = sec.topics.filter((_, ti) => idx[tid(si, ti)]).length;
      h += `<div class="atl-sec">
        <button class="atl-sec-head" data-sec="${si}">
          <span class="atl-i">${String(si + 1).padStart(2, '0')}</span>
          <span class="atl-sec-t">${esc(sec.title)}</span>
          <span class="atl-sec-n">${w}/${sec.topics.length}</span>
        </button>`;
      if (open) {
        h += '<div class="atl-topics">';
        items.forEach(({ t, ti }) => {
          const id = tid(si, ti);
          const cls = ['atl-t'];
          if (sel && sel.si === si && sel.ti === ti) cls.push('on');
          if (idx[id]) cls.push('has');
          if (P[sheet.id + '::' + t[0]]) cls.push('done');
          h += `<button class="${cls.join(' ')}" data-si="${si}" data-ti="${ti}"><i></i><span>${esc(t[0])}</span></button>`;
        });
        if (!q && w < sec.topics.length) {
          h += `<button class="atl-t atl-bulk" data-bulk="${si}"><i class="ghost"></i><span>write all ${sec.topics.length - w} remaining</span></button>`;
        }
        h += '</div>';
      }
      h += '</div>';
    });

    if (sheet.id.startsWith('gen-')) {
      h += `<button class="tool atl-discard" id="atlDiscard">Discard this subject</button>`;
    }
    host.innerHTML = h;

    document.getElementById('atlSheetSel').onchange = e => openSheet(e.target.value);
    document.getElementById('atlNew').onclick = newSubject;
    const find = document.getElementById('atlFind');
    find.oninput = e => { q = e.target.value; renderIndex(); const f = document.getElementById('atlFind'); f.focus(); f.setSelectionRange(f.value.length, f.value.length); };
    host.querySelectorAll('.atl-sec-head').forEach(b => b.onclick = () => {
      const i = +b.dataset.sec; openSec[i] = !openSec[i]; renderIndex();
    });
    host.querySelectorAll('.atl-t[data-si]').forEach(b => b.onclick = () => {
      select(+b.dataset.si, +b.dataset.ti);
    });
    host.querySelectorAll('.atl-bulk').forEach(b => b.onclick = () => writeSection(+b.dataset.bulk));
    const dis = document.getElementById('atlDiscard');
    if (dis) dis.onclick = discard;
  }

  async function select(si, ti) {
    sel = { si, ti };
    Store.set(K_UI, { sheet: sheet.id, si, ti });
    renderIndex();
    renderReader();
    const t = tid(si, ti);
    if ((writtenIdx[sheet.id] || {})[t] && !cache[sheet.id + ':' + t]) {
      await readEntry(sheet.id, t);
      renderReader();
    }
    document.getElementById('view-atlas').classList.add('reading');
  }

  function renderReader() {
    const host = document.getElementById('atlRead');
    if (!host || !sheet) return;

    if (!sel) {
      host.innerHTML = `
        <div class="atl-intro">
          <h2>${esc(sheet.name)}</h2>
          <p class="atl-blurb">${esc(sheet.blurb)}</p>
          <div class="atl-note">
            <b>How this works</b>
            <p>Every one of the ${nTopics(sheet)} topics on this sheet opens into a written entry — five passes, roughly two thousand words. Pick one from the index and it gets written. Once written, it's kept and synced to your account.</p>
            <ol class="atl-plan">${PARTS.map(p => `<li><b>${esc(p.tag)}</b><span>${esc(p.plan)}</span></li>`).join('')}</ol>
          </div>
        </div>`;
      return;
    }

    const sec = sheet.sections[sel.si], topic = sec.topics[sel.ti];
    const t = tid(sel.si, sel.ti), key = sheet.id + ':' + t;
    const parts = cache[key];
    const writing = busy && busy.key === key;
    const P = prog(), isDone = !!P[sheet.id + '::' + topic[0]];

    let h = `<button class="tool tiny atl-back" id="atlBack">‹ index</button>
      <div class="atl-crumb">${esc(sheet.name)} <b>/ ${esc(sec.title)}</b></div>
      <h2 class="atl-title">${esc(topic[0])}</h2>
      ${topic[1] ? `<p class="atl-gloss">${esc(topic[1])}</p>` : ''}
      <div class="atl-bar">
        ${!parts && !writing ? `<button class="tool primary" id="atlWrite">Write the full entry</button>` : ''}
        ${parts && !writing ? `<button class="tool" id="atlWrite">Rewrite</button>` : ''}
        <button class="tool${isDone ? ' on' : ''}" id="atlDone">${isDone ? '✓ mastered' : 'mark mastered'}</button>
        ${parts ? `<button class="tool" id="atlMargin">Send note to Margin</button>` : ''}
      </div>`;

    if (errMsg && errMsg.key === key) h += `<div class="atl-err">${esc(errMsg.text)}</div>`;

    if (parts && parts.length) {
      h += '<div class="atl-art">';
      parts.forEach((p, i) => {
        h += `<section class="atl-part"><div class="atl-tag">${String(i + 1).padStart(2, '0')} · ${esc(p.tag)}</div>${md(p.body)}</section>`;
      });
      h += '</div>';
    }

    if (writing) {
      const step = Math.min(busy.step, PARTS.length - 1);
      h += `<div class="atl-writing"><i class="spin"></i> writing part ${Math.min(busy.step + 1, PARTS.length)} of ${PARTS.length} — ${esc(PARTS[step].tag)}</div>`;
    } else if (!parts) {
      h += `<div class="atl-note"><b>Not written yet</b>
        <ol class="atl-plan">${PARTS.map(p => `<li><b>${esc(p.tag)}</b><span>${esc(p.plan)}</span></li>`).join('')}</ol></div>`;
    }

    // prev / next across the whole sheet
    const flat = [];
    sheet.sections.forEach((s, si) => s.topics.forEach((tp, ti) => flat.push({ si, ti, name: tp[0] })));
    const pos = flat.findIndex(f => f.si === sel.si && f.ti === sel.ti);
    h += '<div class="atl-nav">';
    h += pos > 0 ? `<button class="atl-navb" data-go="${pos - 1}"><span>‹ previous</span><b>${esc(flat[pos - 1].name)}</b></button>` : '<span></span>';
    h += pos > -1 && pos < flat.length - 1 ? `<button class="atl-navb right" data-go="${pos + 1}"><span>next ›</span><b>${esc(flat[pos + 1].name)}</b></button>` : '<span></span>';
    h += '</div>';

    host.innerHTML = h;
    host.scrollTop = writing ? host.scrollTop : 0;

    document.getElementById('atlBack').onclick = () => {
      document.getElementById('view-atlas').classList.remove('reading');
      sel = null; renderIndex(); renderReader();
    };
    const wbtn = document.getElementById('atlWrite');
    if (wbtn) wbtn.onclick = () => writeOne(sel.si, sel.ti);
    document.getElementById('atlDone').onclick = () => {
      const p = prog(), kk = sheet.id + '::' + topic[0];
      if (p[kk]) delete p[kk]; else p[kk] = 1;
      Store.set(K_PROG, p); renderIndex(); renderReader();
    };
    const mg = document.getElementById('atlMargin');
    if (mg) mg.onclick = () => sendToMargin(topic[0], sec.title);
    host.querySelectorAll('.atl-navb').forEach(b => b.onclick = () => {
      const f = flat[+b.dataset.go]; select(f.si, f.ti);
    });
  }

  /* ---------- writing ---------- */
  async function writeOne(si, ti, quiet) {
    const sec = sheet.sections[si], topic = sec.topics[ti];
    const t = tid(si, ti), key = sheet.id + ':' + t;
    const ctx = {
      subject: sheet.name, level: sheet.level, section: sec.title,
      topic: topic[0], gloss: topic[1] || '',
      siblings: sec.topics.filter((_, k) => k !== ti).map(x => x[0]).slice(0, 11),
      spec: sheet.spec || ''
    };
    busy = { key, step: 0 }; errMsg = null;
    renderReader();
    const parts = []; let prior = '';
    try {
      for (let i = 0; i < PARTS.length; i++) {
        if (stopFlag) break;
        const body = String(await ask(partPrompt(ctx, PARTS[i], prior, i))).trim();
        parts.push({ tag: PARTS[i].tag, body });
        prior = body.slice(-420);
        cache[key] = parts.slice();
        busy = { key, step: parts.length };
        renderReader();
      }
      if (parts.length === PARTS.length) {
        await saveEntry(sheet.id, t, topic[0], parts);
        busy = null; renderIndex(); renderReader();
      } else { busy = null; renderReader(); }
    } catch (e) {
      busy = null;
      errMsg = { key, text: e.message || 'Could not write the entry.' };
      if (!parts.length) delete cache[key];
      renderReader();
      throw e;
    }
  }

  async function writeSection(si) {
    const sec = sheet.sections[si];
    const idx = writtenIdx[sheet.id] || {};
    const todo = sec.topics.map((_, ti) => ti).filter(ti => !idx[tid(si, ti)]);
    if (!todo.length) return;
    stopFlag = false;
    const bar = document.getElementById('atlQueue');
    bar.hidden = false;
    for (let i = 0; i < todo.length; i++) {
      if (stopFlag) break;
      document.getElementById('atlQueueTxt').textContent =
        `writing “${sec.title}” — ${i + 1} of ${todo.length}`;
      await select(si, todo[i]);
      try { await writeOne(si, todo[i], true); }
      catch (e) { toast(e.message); break; }
    }
    bar.hidden = true;
    toast(stopFlag ? 'Stopped.' : 'Section written.');
    stopFlag = false;
  }

  /* ---------- cross-links into the rest of the OS ---------- */
  function sendToMargin(topicName, secTitle) {
    const line = `Atlas · ${sheet.name} → ${secTitle} → ${topicName}`;
    if (typeof Margin !== 'undefined' && Margin.push) { Margin.push(line); }
    else {
      const list = Store.get('thoughts', []);
      list.unshift({ id: uid(), at: Date.now(), kind: 'thought', who: '', text: line });
      Store.set('thoughts', list);
    }
    toast('Noted in Margin.');
  }

  /* ---------- new subject ---------- */
  function newSubject() {
    const wrap = document.getElementById('atlModal');
    wrap.hidden = false;
    wrap.innerHTML = `<div class="atl-modal">
      <b class="atl-mtitle">Build an index</b>
      <p class="atl-msub">Name a subject. The Atlas charts its sections, then lists the topics in each. Entries get written afterwards.</p>
      <label>Subject</label>
      <input class="inp" id="atlSub" placeholder="Statistical mechanics · Constitutional law · Music theory">
      <label>Depth</label>
      <select class="inp" id="atlDepth">
        <option value="school-leaving syllabus level">School</option>
        <option value="a full bachelor's degree curriculum">Undergraduate</option>
        <option value="graduate / PhD qualifying-exam depth" selected>Graduate</option>
        <option value="what a working professional must actually use">Practitioner</option>
      </select>
      <label>Specifications <em>(optional — these steer every entry too)</em></label>
      <textarea class="inp" id="atlSpec" rows="3" placeholder="Weight it toward the Indian statutory context. Skip the history."></textarea>
      <div class="atl-log" id="atlLog" hidden></div>
      <div class="atl-mact">
        <button class="tool" id="atlCancel">Cancel</button>
        <button class="tool primary" id="atlBuild">Build the index</button>
      </div>
    </div>`;
    document.getElementById('atlCancel').onclick = () => { wrap.hidden = true; };
    document.getElementById('atlBuild').onclick = build;
  }

  async function build() {
    const name = document.getElementById('atlSub').value.trim();
    const hint = document.getElementById('atlDepth').value;
    const spec = document.getElementById('atlSpec').value.trim();
    const log = document.getElementById('atlLog');
    const btn = document.getElementById('atlBuild');
    if (!name) { toast('Name a subject first.'); return; }
    btn.disabled = true; btn.textContent = 'Building…';
    log.hidden = false; log.innerHTML = '';
    const note = s => { log.innerHTML += `<div>${esc(s)}</div>`; log.scrollTop = log.scrollHeight; };

    try {
      note('Surveying ' + name + '…');
      const head = parseJSON(await ask(
`You are compiling the index of a rigorous study library for the subject: "${name}".
Target depth: ${hint}.
${spec ? `Reader's requirements: ${spec}` : ''}

Return ONLY a JSON object, no prose, no markdown fences:
{"name":"<subject name, cleaned up>","level":"<short depth descriptor, under 8 words>","blurb":"<2 sentences: what commanding this subject means and where its real difficulty sits>","sections":[{"title":"<major division of the field>","note":""}]}

Give 8 to 13 sections covering the whole subject, foundations first, then core theory, then advanced and applied.`));
      if (!head || !Array.isArray(head.sections) || !head.sections.length) throw new Error('Unusable outline. Try rephrasing.');
      note('Charted ' + head.sections.length + ' sections. Listing topics…');

      const sections = [];
      for (const s of head.sections.slice(0, 13)) {
        let topics = [];
        try {
          topics = (parseJSON(await ask(
`Subject: "${head.name}". Depth: ${hint}.
${spec ? `Reader's requirements: ${spec}` : ''}
Section: "${s.title}"

List the specific topics a person must know to have mastered this section at that depth.
Return ONLY JSON, no fences:
{"topics":[["<topic name, under 6 words>","<gloss under 12 words: the key result, distinction or method>"]]}
Give 6 to 12 topics. Name theorems, models, methods and results — never vague themes.`)).topics || [])
            .map(x => Array.isArray(x) ? [String(x[0] || '').trim(), String(x[1] || '').trim()] : [String(x), ''])
            .filter(x => x[0]);
        } catch (e) { topics = []; }
        note('· ' + s.title + ' — ' + topics.length + ' topics');
        if (topics.length) sections.push({ title: s.title, note: s.note || '', topics });
      }
      if (!sections.length) throw new Error('No topics came back.');

      const id = 'gen-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 36) + '-' + uid().slice(0, 4);
      const built = { id, name: head.name || name, level: head.level || hint, blurb: head.blurb || '', spec, sections };
      const list = Store.get(K_CUSTOM, []); list.push(built); Store.set(K_CUSTOM, list);
      sheets = allSheets();
      document.getElementById('atlModal').hidden = true;
      openSheet(id);
      toast('Index built.');
    } catch (e) {
      note('✕ ' + (e.message || 'failed'));
      btn.disabled = false; btn.textContent = 'Build the index';
    }
  }

  function discard() {
    if (!confirm('Discard this subject and its index? Written entries stay in the database.')) return;
    Store.set(K_CUSTOM, Store.get(K_CUSTOM, []).filter(s => s.id !== sheet.id));
    sheets = allSheets();
    openSheet(sheets[0].id);
  }

  /* ---------- wire the queue stop button once ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    const s = document.getElementById('atlStop');
    if (s) s.onclick = () => { stopFlag = true; toast('Stopping after this entry.'); };
  });

  return { refresh, openSheet, openSubject, PARTS };
})();
