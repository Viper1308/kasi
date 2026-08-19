/* ════════════════════════════════════════════════════════════
   ORACLE — the AI layer. Dormant until config.oracle = true.
   Two jobs: the "coming soon" screen for the assistant, and the
   optional entry writer inside the Atlas.
   ════════════════════════════════════════════════════════════ */
const Oracle = (() => {
  const PARTS = [
    { tag: 'Orientation', brief: 'Explain what this topic is and why it exists. Start from the problem it was invented to solve. Build the intuition in plain language before any formalism. State plainly what someone gains by understanding it.' },
    { tag: 'The formal core', brief: 'Give the precise account: exact definitions, the central statement or model, and the derivation that produces it. Show the actual reasoning steps. This is what the reader should be able to reconstruct on a blank page.' },
    { tag: 'Worked case', brief: 'Work one concrete case fully through, with real numbers or a canonical instance. Show every step. Then say what the answer means and what would change if a key input moved.' },
    { tag: 'Limits and traps', brief: 'Name the assumptions the result depends on and what breaks when each fails. List the specific errors people reliably make, and the distinctions that are easy to blur.' },
    { tag: 'Connections and sources', brief: 'Show how this connects to the neighbouring topics listed below. Then name the standard texts or authors to go to. Close with the sharpest question the reader should be able to answer.' }
  ];

  const key = (sid, t) => 'entry:' + sid + ':' + t;

  function prompt(ctx, part, prior, i) {
    return `You are writing one part of a reference entry in a rigorous personal study library.

SUBJECT: ${ctx.subject}
DEPTH: ${ctx.level}
SECTION: ${ctx.section}
TOPIC: ${ctx.topic}${ctx.gloss ? `\nSHORT GLOSS: ${ctx.gloss}` : ''}
NEIGHBOURING TOPICS: ${ctx.siblings.join('; ')}

You are writing PART ${i + 1} OF ${PARTS.length}: "${part.tag}".
Remit: ${part.brief}
${prior ? `\nThe previous part ended with:\n"""${prior}"""\nContinue without repeating it.` : ''}

Rules:
- 350 to 500 words. Write to the stated depth; do not water it down.
- Start immediately with the content. No title, no "in this section".
- There is no mathematics renderer, so never use LaTeX or dollar signs. Write formulas in ordinary letters and words: \`dy/dx\`, \`sum over i of x_i\`, \`sigma\`, \`E[X]\`.
- Define every variable in words the first time it appears.
- When the written-out form differs from how a result is normally printed, name the real notation once: give the standard symbol, say what it is called, and how it is read aloud.
- Use \`code\` style for formulas and symbols. Markdown ## subheadings only where genuinely needed.
- No preamble, no closing pleasantries.`;
  }

  async function ask(p) {
    const r = await fetch('/api/oracle', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: p })
    });
    if (!r.ok) {
      let d = ''; try { const j = await r.json(); d = j && j.error ? ' — ' + j.error.message : ''; } catch (e) {}
      throw new Error('Request failed (' + r.status + ')' + d);
    }
    const j = await r.json();
    return (j.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');
  }

  function md(src) {
    const inline = s => s.replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*\w])\*([^*\n]+)\*/g, '$1<em>$2</em>');
    const out = []; let list = null, para = [];
    const fp = () => { if (para.length) { out.push('<p>' + inline(para.join(' ')) + '</p>'); para = []; } };
    const fl = () => { if (list) { out.push('</' + list + '>'); list = null; } };
    esc(String(src || '')).split(/\r?\n/).forEach(raw => {
      const l = raw.trim(); let m;
      if (!l) { fp(); fl(); }
      else if ((m = l.match(/^#{2,4}\s+(.*)$/))) { fp(); fl(); out.push('<h4>' + inline(m[1]) + '</h4>'); }
      else if ((m = l.match(/^&gt;\s?(.*)$/))) { fp(); fl(); out.push('<blockquote>' + inline(m[1]) + '</blockquote>'); }
      else if ((m = l.match(/^[-*•]\s+(.*)$/))) { fp(); if (list !== 'ul') { fl(); out.push('<ul>'); list = 'ul'; } out.push('<li>' + inline(m[1]) + '</li>'); }
      else if ((m = l.match(/^\d+[.)]\s+(.*)$/))) { fp(); if (list !== 'ol') { fl(); out.push('<ol>'); list = 'ol'; } out.push('<li>' + inline(m[1]) + '</li>'); }
      else { fl(); para.push(l); }
    });
    fp(); fl();
    return out.join('');
  }

  const paint = (host, parts) => {
    host.innerHTML = '<div class="art">' + parts.map((p, i) =>
      `<section class="part"><div class="part-tag">${String(i + 1).padStart(2, '0')} · ${esc(p.tag)}</div>${md(p.body)}</section>`
    ).join('') + '</div>';
  };

  function load(sheet, sel, host) {
    const t = sel.si + '-' + sel.ti;
    const stored = Store.get(key(sheet.id, t), null);
    if (stored && stored.length) paint(host, stored); else host.innerHTML = '';
  }

  async function write(sheet, sel, host) {
    const sec = sheet.sections[sel.si], topic = sec.topics[sel.ti];
    const t = sel.si + '-' + sel.ti;
    const ctx = {
      subject: sheet.name, level: sheet.level, section: sec.title,
      topic: topic[0], gloss: topic[1] || '',
      siblings: sec.topics.filter((_, k) => k !== sel.ti).map(x => x[0]).slice(0, 11)
    };
    const parts = []; let prior = '';
    try {
      for (let i = 0; i < PARTS.length; i++) {
        host.innerHTML = (parts.length ? host.innerHTML : '') +
          `<div class="empty" id="oWait"><b>Writing part ${i + 1} of ${PARTS.length}</b>${esc(PARTS[i].tag)}</div>`;
        const body = String(await ask(prompt(ctx, PARTS[i], prior, i))).trim();
        parts.push({ tag: PARTS[i].tag, body });
        prior = body.slice(-420);
        paint(host, parts);
      }
      Store.set(key(sheet.id, t), parts);
      Atlas.logActivity('written', sheet.name, topic[0]);
      toast('Entry written.');
    } catch (e) {
      host.innerHTML += `<div class="empty"><b>Could not write the entry</b>${esc(e.message)}</div>`;
    }
  }

  function renderScreen() {
    document.getElementById('oracleBody').innerHTML = `
      <div class="orb"><i></i><i></i><i></i><b></b></div>
      <h2>ORACLE</h2>
      <p class="tagline">The assistant layer. It will read what you have already mastered, know what
      you have not, and answer in the context of your own library rather than from nowhere.</p>
      <div class="soon-tag">Coming soon</div>
      <div class="plans">
        <div class="plan"><em>Phase 1</em><b>Entry writer</b><span>Full written entries for any topic on any
          sheet, generated on demand and kept. Already built — switch <code>oracle</code> to true in
          config.js once you have a key.</span></div>
        <div class="plan"><em>Phase 2</em><b>Conversational recall</b><span>Ask questions against your own
          notes and mastered topics. Answers cite which sheet and section they came from.</span></div>
        <div class="plan"><em>Phase 3</em><b>Socratic mode</b><span>It examines you rather than answers you.
          Picks topics you marked mastered, probes them, and unmarks the ones that do not hold up.</span></div>
        <div class="plan"><em>Phase 4</em><b>Ambient</b><span>Voice in, voice out. Briefings on what to study
          next, drawn from the gaps the dashboard already tracks.</span></div>
      </div>`;
  }

  return { renderScreen, write, load, PARTS };
})();
