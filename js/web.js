/* ══════════════ THE WEB — subjects, strands, dossiers ══════════════ */
const Web = (() => {
  const NS = 'http://www.w3.org/2000/svg';
  const BASE = [
    ['economics', 'Economics'], ['finance', 'Finance'], ['law', 'Law'], ['physics', 'Physics'],
    ['math', 'Math'], ['ai', 'AI'], ['cs', 'Programming / CS'], ['philosophy', 'Philosophy'],
    ['history', 'History'], ['politics', 'Politics'], ['logic', 'Logic'], ['debate', 'Debate'], ['art', 'Art']
  ];

  // uniform glyphs so every subject node is the same size → clean ring
  const ICONS = {
    economics: 'M4 20h16M7 16l3-4 3 3 4-6M6 8h1M10 6h1',
    finance:   'M12 3v18M8 7h6a3 3 0 010 6H8m8 0h-6a3 3 0 000 6h7',
    law:       'M12 4v16M6 20h12M5 8l3 4a3 3 0 01-6 0zM19 8l3 4a3 3 0 01-6 0zM5 8l7-2 7 2',
    physics:   'M12 12m-2 0a2 2 0 104 0 2 2 0 10-4 0M12 12m-9 0a9 4.5 0 0018 0 9 4.5 0 00-18 0M12 12m0-9a4.5 9 30 000 18 4.5 9 30 000-18',
    math:      'M5 5l6 7-6 7M13 5h6M13 12h6M13 19h6',
    ai:        'M9 4h6v3H9zM7 7h10v8H7zM10 15v3M14 15v3M9 18h6M4 10h3M17 10h3M11 10.5v1M13 10.5v1',
    cs:        'M8 8l-4 4 4 4M16 8l4 4-4 4M13 6l-2 12',
    philosophy:'M12 3a5 5 0 00-3 9c1 1 1 2 1 3h4c0-1 0-2 1-3a5 5 0 00-3-9zM10 19h4M10.5 21h3',
    history:   'M12 7v5l3 2M12 3a9 9 0 109 9M12 3V1M6 4L4.5 2.5',
    politics:  'M12 3l9 5-9 5-9-5zM5 11v6M9 11v6M15 11v6M19 11v6M3 20h18',
    logic:     'M6 6h5v5H6zM13 13h5v5h-5zM8.5 11v2M13 15.5h-2.5v-2.5',
    debate:    'M4 6h9a2 2 0 012 2v3a2 2 0 01-2 2H8l-3 3v-3H4a2 2 0 01-2-2V8a2 2 0 012-2zM16 9h4a2 2 0 012 2v2a2 2 0 01-2 2h-1v2l-2-2',
    art:       'M12 3a9 9 0 00-9 9 5 5 0 005 5h1a2 2 0 012 2 2 2 0 002 2 9 9 0 007-9 9 9 0 00-10-9zM7.5 10.5v.01M9.5 7.5v.01M14.5 7.5v.01M16.5 10.5v.01'
  };
  const GENERIC_ICON = 'M12 3a9 9 0 100 18 9 9 0 000-18M12 8v8M8 12h8';

  let subjects = Store.get('web.subjects', BASE.map(([id, label]) => ({ id, label, topics: [] })));
  let pos = Store.get('web.pos', {});
  let custom = Store.get('web.custom', {});      // user-drawn strands
  let notes = Store.get('web.notes', {});        // notes on built-in strands
  let view = Store.get('web.view', { x: 0, y: 0, k: 1 });

  let svg, gRoot, sel = null, selEdge = null, linkMode = false, linkFrom = null, tempLine = null;
  let W = 1000, H = 700;

  const saveAll = () => { Store.set('web.subjects', subjects); Store.set('web.pos', pos); Store.set('web.custom', custom); Store.set('web.notes', notes); Store.set('web.view', view); };
  const key = (a, b) => [a, b].sort().join('|');
  const subj = id => subjects.find(s => s.id === id);

  /* ---------- node list (subjects + their topics) ---------- */
  function nodes() {
    const out = [];
    subjects.forEach(s => {
      out.push({ id: s.id, label: s.label, kind: 'subject' });
      (s.topics || []).forEach(t => out.push({ id: `t:${s.id}:${t.id}`, label: t.label, kind: 'topic', parent: s.id }));
    });
    return out;
  }
  function label(id) { const n = nodes().find(n => n.id === id); return n ? n.label : id; }

  /* ---------- layout ---------- */
  function ring() {
    const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.37;
    subjects.forEach((s, i) => {
      const a = (i / subjects.length) * Math.PI * 2 - Math.PI / 2;
      pos[s.id] = { x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R };
      (s.topics || []).forEach((t, j) => {
        const tot = s.topics.length, sp = 0.5, aa = a - sp / 2 + (tot > 1 ? (j / (tot - 1)) * sp : 0);
        pos[`t:${s.id}:${t.id}`] = { x: cx + Math.cos(aa) * (R + 92), y: cy + Math.sin(aa) * (R + 92) };
      });
    });
    saveAll();
  }
  function ensurePos() {
    let need = false;
    nodes().forEach(n => { if (!pos[n.id]) need = true; });
    if (need) ring();
  }

  /* ---------- edges ---------- */
  function edges() {
    const out = [], seen = new Set();
    for (let i = 0; i < subjects.length; i++)
      for (let j = i + 1; j < subjects.length; j++) {
        const k = key(subjects[i].id, subjects[j].id);
        seen.add(k);
        out.push({ k, a: subjects[i].id, b: subjects[j].id, custom: !CONNECTIONS[k] });
      }
    Object.values(custom).forEach(c => { if (!seen.has(key(c.a, c.b))) out.push({ k: key(c.a, c.b), a: c.a, b: c.b, custom: true }); });
    return out;
  }

  /* ---------- draw ---------- */
  function draw() {
    ensurePos();
    if (document.getElementById('webSubjList')) renderSubjList();
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    gRoot.setAttribute('transform', `translate(${view.x},${view.y}) scale(${view.k})`);
    gRoot.innerHTML = '';

    const gE = document.createElementNS(NS, 'g'), gN = document.createElementNS(NS, 'g');
    gRoot.append(gE, gN);
    const cx = W / 2, cy = H / 2;
    const showAll = document.getElementById('wAllStrands').checked;

    edges().forEach(e => {
      const p1 = pos[e.a], p2 = pos[e.b];
      if (!p1 || !p2) return;
      const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
      const qx = mx + (cx - mx) * 0.42, qy = my + (cy - my) * 0.42;
      const d = `M${p1.x},${p1.y} Q${qx},${qy} ${p2.x},${p2.y}`;
      const touches = sel && (e.a === sel || e.b === sel);

      const hit = document.createElementNS(NS, 'path');
      hit.setAttribute('d', d); hit.setAttribute('class', 'hitline');
      const line = document.createElementNS(NS, 'path');
      line.setAttribute('d', d);
      let cls = 'strand' + (e.custom ? ' custom' : '');
      if (selEdge === e.k) cls += ' sel';
      else if (touches) cls += ' hot';
      else if (sel || !showAll) cls += ' mute';
      line.setAttribute('class', cls);
      const open = ev => { ev.stopPropagation(); selEdge = e.k; sel = null; draw(); panel(e); };
      hit.addEventListener('click', open); line.addEventListener('click', open);
      hit.addEventListener('mouseenter', () => line.classList.add('hot'));
      hit.addEventListener('mouseleave', () => { if (selEdge !== e.k && !touches) line.classList.remove('hot'); });
      gE.append(line, hit);
    });

    nodes().forEach(n => {
      const p = pos[n.id]; if (!p) return;
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'node' + (n.kind === 'topic' ? ' topic' : '') + (sel === n.id ? ' sel' : ''));
      g.setAttribute('transform', `translate(${p.x},${p.y})`);

      if (n.kind === 'topic') {
        const r = 7;
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('r', r);
        const t = document.createElementNS(NS, 'text');
        t.textContent = n.label; t.setAttribute('y', -14);
        g.append(c, t);
        wireNode(g, n, r);
      } else {
        // uniform disc — same radius for every subject → perfect ring
        const r = 26;
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('r', r);
        const icon = document.createElementNS(NS, 'path');
        icon.setAttribute('d', ICONS[n.id] || GENERIC_ICON);
        icon.setAttribute('class', 'node-glyph');
        icon.setAttribute('transform', 'translate(-12,-12)');
        const t = document.createElementNS(NS, 'text');
        t.textContent = n.label;
        t.setAttribute('class', 'node-caption');
        t.setAttribute('y', r + 16);
        g.append(c, icon, t);
        wireNode(g, n, r);
      }
      gN.appendChild(g);
    });
  }

  /* ---------- pointer plumbing ---------- */
  function toGraph(ev) {
    const r = svg.getBoundingClientRect();
    return { x: ((ev.clientX - r.left) * (W / r.width) - view.x) / view.k, y: ((ev.clientY - r.top) * (H / r.height) - view.y) / view.k };
  }
  function wireNode(g, n, r) {
    let moved = false, start = null, off = null;
    g.addEventListener('pointerdown', ev => {
      ev.stopPropagation(); g.setPointerCapture(ev.pointerId);
      moved = false; start = toGraph(ev);
      if (linkMode || ev.shiftKey) {
        linkFrom = n.id;
        tempLine = document.createElementNS(NS, 'line');
        tempLine.setAttribute('class', 'temp-line');
        tempLine.setAttribute('x1', pos[n.id].x); tempLine.setAttribute('y1', pos[n.id].y);
        tempLine.setAttribute('x2', pos[n.id].x); tempLine.setAttribute('y2', pos[n.id].y);
        gRoot.appendChild(tempLine);
      } else off = { x: pos[n.id].x - start.x, y: pos[n.id].y - start.y };
    });
    g.addEventListener('pointermove', ev => {
      const p = toGraph(ev);
      if (linkFrom === n.id && tempLine) { tempLine.setAttribute('x2', p.x); tempLine.setAttribute('y2', p.y); return; }
      if (!off) return;
      if (Math.hypot(p.x - start.x, p.y - start.y) > 3) moved = true;
      pos[n.id] = { x: p.x + off.x, y: p.y + off.y };
      g.setAttribute('transform', `translate(${pos[n.id].x},${pos[n.id].y})`);
    });
    g.addEventListener('pointerup', ev => {
      if (linkFrom && tempLine) {
        const p = toGraph(ev), target = nodeAt(p, linkFrom);
        tempLine.remove(); tempLine = null;
        const from = linkFrom; linkFrom = null;
        if (target) makeStrand(from, target);
        else { linkMode = false; document.getElementById('wLink').classList.remove('on'); svg.classList.remove('linking'); draw(); }
        return;
      }
      if (off) { off = null; saveAll(); if (!moved) { sel = sel === n.id ? null : n.id; selEdge = null; draw(); if (sel) nodePanel(n); else hidePanel(); } else draw(); }
    });
  }
  function nodeAt(p, not) {
    let best = null, bd = 1e9;
    nodes().forEach(n => {
      if (n.id === not || !pos[n.id]) return;
      const d = Math.hypot(pos[n.id].x - p.x, pos[n.id].y - p.y);
      const r = n.kind === 'topic' ? 16 : 30;
      if (d < r && d < bd) { bd = d; best = n.id; }
    });
    return best;
  }
  function makeStrand(a, b) {
    const k = key(a, b);
    if (!custom[k] && !CONNECTIONS[k]) custom[k] = { a, b, brief: '', developments: [], relevance: [], projects: [] };
    saveAll(); selEdge = k; sel = null; draw();
    panel({ k, a, b, custom: !CONNECTIONS[k] });
    toast(`Strand drawn: ${label(a)} ↔ ${label(b)}`);
  }

  /* ---------- panels ---------- */
  const P = () => document.getElementById('webPanel');
  function hidePanel() { P().hidden = true; }
  function shell(title, sub) {
    const p = P(); p.hidden = false;
    p.innerHTML = `<button class="wp-close" title="Close">✕</button>
      <div class="eyebrow">${sub}</div><h2 class="wp-title">${title}</h2>`;
    p.querySelector('.wp-close').onclick = () => { hidePanel(); selEdge = null; sel = null; draw(); };
    return p;
  }
  function sec(p, head, html) {
    const d = el('div', 'wp-sec');
    d.innerHTML = `<h5>${head}</h5>${html}`;
    p.appendChild(d); return d;
  }
  function panel(e) {
    const built = CONNECTIONS[e.k];
    const p = shell(`${esc(label(e.a))} <em>×</em> ${esc(label(e.b))}`, built ? 'Strand' : 'Your strand');
    if (built) {
      sec(p, 'How it actually plays out', `<div class="wp-brief">${built.brief}</div>`);
      sec(p, 'Developments worth knowing', `<ul class="wp-list">${built.developments.map(d => `<li>${d}</li>`).join('')}</ul>`);
      if (built.relevance?.length) sec(p, 'Also relevant', `<ul class="wp-list">${built.relevance.map(d => `<li>${d}</li>`).join('')}</ul>`);
      sec(p, 'Five projects you could actually build', `<ul class="wp-list proj">${built.projects.map(d => `<li>${d}</li>`).join('')}</ul>`);
      const n = sec(p, 'Your notes', `<textarea class="inp area mynotes" placeholder="What you make of this connection…"></textarea>`);
      const ta = n.querySelector('textarea');
      ta.value = notes[e.k] || '';
      ta.onchange = () => { notes[e.k] = ta.value; saveAll(); toast('Note saved.'); };
    } else {
      const c = custom[e.k] || (custom[e.k] = { a: e.a, b: e.b, brief: '', developments: [], relevance: [], projects: [] });
      const field = (head, k, ph, list) => {
        const d = sec(p, head, `<textarea class="inp area mynotes" placeholder="${ph}"></textarea>`);
        const ta = d.querySelector('textarea');
        ta.value = list ? (c[k] || []).join('\n') : (c[k] || '');
        ta.onchange = () => { c[k] = list ? ta.value.split('\n').filter(Boolean) : ta.value; saveAll(); toast('Saved.'); };
      };
      field('How it plays out', 'brief', 'Write the connection as you see it.');
      field('Developments', 'developments', 'One per line.', true);
      field('Also relevant', 'relevance', 'One per line.', true);
      field('Projects', 'projects', 'One per line.', true);
      const del = el('button', 'btn ghost danger', 'Remove this strand');
      del.style.marginTop = '20px';
      del.onclick = () => { delete custom[e.k]; saveAll(); hidePanel(); selEdge = null; draw(); };
      p.appendChild(del);
    }
  }
  function nodePanel(n) {
    if (n.kind === 'topic') {
      const p = shell(esc(n.label), 'Topic of ' + esc(label(n.parent)));
      sec(p, 'What this is', `<div class="wp-brief">Drag a strand from here to anything else on the map. Hold Shift and drag, or switch on “Draw strand”.</div>`);
      const del = el('button', 'btn ghost danger', 'Delete topic');
      del.onclick = () => {
        const s = subj(n.parent); s.topics = s.topics.filter(t => `t:${s.id}:${t.id}` !== n.id);
        delete pos[n.id]; sel = null; saveAll(); hidePanel(); draw();
      };
      p.appendChild(del); return;
    }
    const s = subj(n.id);
    const p = shell(esc(s.label), 'Subject');
    const links = subjects.filter(x => x.id !== s.id).length;
    sec(p, 'Position', `<div class="wp-brief">${links} strands run from here. Click any highlighted strand to open it.</div>`);
    const t = sec(p, 'Topics', `<ul class="wp-list" id="tlist">${(s.topics || []).map(x => `<li>${esc(x.label)}</li>`).join('') || '<li style="color:var(--faint)">None yet.</li>'}</ul>
      <div class="topic-add"><input class="inp tiny" id="tnew" placeholder="Add a topic"><button class="btn tiny" id="tadd">Add</button></div>`);
    const go = () => {
      const v = t.querySelector('#tnew').value.trim(); if (!v) return;
      s.topics = s.topics || []; s.topics.push({ id: uid(), label: v });
      saveAll(); ring(); draw(); nodePanel(n);
    };
    t.querySelector('#tadd').onclick = go;
    t.querySelector('#tnew').onkeydown = e => { if (e.key === 'Enter') go(); };
    if (!BASE.some(b => b[0] === s.id)) {
      const del = el('button', 'btn ghost danger', 'Delete subject');
      del.style.marginTop = '20px';
      del.onclick = () => {
        subjects = subjects.filter(x => x.id !== s.id);
        Object.keys(custom).forEach(k => { if (k.split('|').some(p => p === s.id || p.startsWith('t:' + s.id))) delete custom[k]; });
        sel = null; saveAll(); ring(); hidePanel(); draw();
      };
      p.appendChild(del);
    }
  }

  /* ---------- left subject list (NEXUS sidebar) ---------- */
  function renderSubjList() {
    const host = document.getElementById('webSubjList');
    const count = document.getElementById('webSubjCount');
    if (!host) return;
    if (count) count.textContent = subjects.length + ' subjects';
    host.innerHTML = subjects.map(s => `
      <button class="web-subj-item${sel === s.id ? ' sel' : ''}" data-id="${s.id}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="${ICONS[s.id] || GENERIC_ICON}"/></svg>
        <span>${esc(s.label)}</span>
      </button>`).join('');
    host.querySelectorAll('.web-subj-item').forEach(b => b.onclick = () => {
      sel = b.dataset.id; selEdge = null; draw(); renderSubjList(); nodePanel(subj(b.dataset.id));
    });
  }

  /* ---------- init ---------- */
  function init() {
    renderSubjList();
    svg = document.getElementById('webSvg');
    gRoot = document.createElementNS(NS, 'g');
    svg.appendChild(gRoot);

    const ro = new ResizeObserver(() => {
      const r = svg.getBoundingClientRect();
      if (!r.width) return;
      const fresh = !Object.keys(pos).length;
      W = Math.round(r.width); H = Math.round(r.height);
      if (fresh) ring();
      draw();
    });
    ro.observe(svg);

    // pan + zoom
    let panning = null;
    svg.addEventListener('pointerdown', ev => {
      if (ev.target.closest('.node') || ev.target.classList.contains('hitline')) return;
      panning = { x: ev.clientX, y: ev.clientY, vx: view.x, vy: view.y };
      sel = null; selEdge = null; hidePanel(); draw();
    });
    window.addEventListener('pointermove', ev => {
      if (!panning) return;
      const r = svg.getBoundingClientRect();
      view.x = panning.vx + (ev.clientX - panning.x) * (W / r.width);
      view.y = panning.vy + (ev.clientY - panning.y) * (H / r.height);
      gRoot.setAttribute('transform', `translate(${view.x},${view.y}) scale(${view.k})`);
    });
    window.addEventListener('pointerup', () => { if (panning) { panning = null; saveAll(); } });
    svg.addEventListener('wheel', ev => {
      ev.preventDefault();
      const p = toGraph(ev), f = ev.deltaY < 0 ? 1.12 : 1 / 1.12;
      const k2 = Math.min(3, Math.max(.35, view.k * f));
      const r = svg.getBoundingClientRect();
      const sx = (ev.clientX - r.left) * (W / r.width), sy = (ev.clientY - r.top) * (H / r.height);
      view.x = sx - p.x * k2; view.y = sy - p.y * k2; view.k = k2;
      gRoot.setAttribute('transform', `translate(${view.x},${view.y}) scale(${view.k})`);
      clearTimeout(svg._z); svg._z = setTimeout(saveAll, 400);
    }, { passive: false });

    document.getElementById('wLink').onclick = e => {
      linkMode = !linkMode;
      e.target.classList.toggle('on', linkMode);
      svg.classList.toggle('linking', linkMode);
      document.getElementById('wHint').textContent = linkMode
        ? 'Drag from one node to another to tie them together.'
        : 'Click a strand to open it. Drag a node to move it.';
    };
    document.getElementById('wAddSubject').onclick = () => {
      const name = prompt('New subject');
      if (!name || !name.trim()) return;
      subjects.push({ id: 'u_' + uid(), label: name.trim(), topics: [] });
      ring(); draw(); toast(name.trim() + ' added — its strands are drawn and waiting to be written.');
    };
    document.getElementById('wReset').onclick = () => { ring(); view = { x: 0, y: 0, k: 1 }; saveAll(); draw(); };
    document.getElementById('wAllStrands').onchange = draw;
  }

  return { init, draw, get count() { return Object.keys(custom).length; } };
})();
