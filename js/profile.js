/* ══════════════ THE RECORD — your private CV ══════════════
   Identity + About/Hobbies/Extracurriculars/Skills/Achievements/
   Interests/Languages summary cards up top (matching the NEXUS layout),
   a five-stat strip, and — unchanged from before — the fully editable
   Experience / Education / Certifications sections and the Skills
   chip editor further down the page. */
const Profile = (() => {
  const D = {
    id: Store.get('profile', {
      name: 'Your name', role: 'Add a headline', place: 'Bengaluru, IN',
      about: 'A line or two about what you are actually doing with your time.',
      email: '', quote: 'Curiosity compounds. So does consistency.'
    }),
    exp: Store.get('p.exp', []),
    edu: Store.get('p.edu', []),
    cert: Store.get('p.cert', []),
    ach: Store.get('p.ach', []),
    skill: Store.get('p.skill', []),
    hobby: Store.get('p.hobby', []),
    extra: Store.get('p.extra', []),
    interest: Store.get('p.interest', []),
    lang: Store.get('p.lang', [])
  };
  const save = k => Store.set(k === 'id' ? 'profile' : 'p.' + k, D[k]);

  const SECTIONS = [
    { k: 'exp', t: 'Experience', f: ['when', 'title', 'org', 'note'], ph: ['2024 – now', 'Role', 'Organisation', 'What you actually did'] },
    { k: 'edu', t: 'Education', f: ['when', 'title', 'org', 'note'], ph: ['2019 – 2023', 'Degree / programme', 'Institution', 'Focus, marks, anything worth keeping'] },
    { k: 'cert', t: 'Certifications', f: ['when', 'title', 'org', 'note'], ph: ['Mar 2025', 'Certificate', 'Issued by', 'Credential ID or notes'] },
    { k: 'ach', t: 'Achievements', f: ['when', 'title', 'org', 'note'], ph: ['2025', 'What you won or built', 'Where', 'Why it mattered'] }
  ];

  function render() {
    renderIdCard();
    renderQuote();
    renderInfoGrid();
    renderStats();

    const b = document.getElementById('recordBody'); b.innerHTML = '';
    SECTIONS.forEach(s => b.appendChild(listSection(s)));
    b.appendChild(skillSection());
  }

  /* ---------------- identity card ---------------- */
  function renderIdCard() {
    const idc = document.getElementById('idCard');
    idc.innerHTML = `
      <div class="avatar" id="avatar" title="Click to set a picture">${D.id.name.trim().charAt(0).toUpperCase() || '·'}</div>
      <div class="id-info">
        <h1 contenteditable="true" data-f="name">${esc(D.id.name)}</h1>
        <div class="role" contenteditable="true" data-f="role">${esc(D.id.role)}</div>
        <div class="id-meta-row">
          <span data-f="place" contenteditable="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="10" r="3"/><path d="M12 21s7-6.5 7-11a7 7 0 10-14 0c0 4.5 7 11 7 11z"/></svg>${esc(D.id.place)}</span>
          <span data-f="email" contenteditable="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>${esc(D.id.email || 'Add an email')}</span>
        </div>
      </div>
      <button class="btn ghost id-edit-btn" id="idEditBtn">Edit profile</button>`;
    idc.querySelectorAll('[data-f]').forEach(n => {
      n.addEventListener('blur', () => {
        const f = n.dataset.f;
        // strip the leading icon's text is fine since icon is SVG (no text content)
        D.id[f] = n.textContent.trim();
        save('id'); render();
      });
      n.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); n.blur(); } });
    });
    const av = document.getElementById('avatar');
    Store.getImg('avatar').then(src => { if (src) { av.style.backgroundImage = `url(${src})`; av.textContent = ''; } });
    av.onclick = () => {
      const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*';
      i.onchange = () => i.files[0] && shrink(i.files[0], 400, u => { Store.putImg('avatar', u).then(render); });
      i.click();
    };
    document.getElementById('idEditBtn').onclick = () => { const p = idc.querySelector('.role'); p.focus(); };
  }

  function renderQuote() {
    const q = document.getElementById('profQuote');
    if (!q) return;
    q.textContent = D.id.quote || '';
    q.oninput = null;
    q.onblur = () => { D.id.quote = q.textContent.trim(); save('id'); };
  }

  /* ---------------- top summary cards ---------------- */
  function simpleListCard(label, list, key, placeholder) {
    const wrap = el('div', 'card info-card');
    wrap.innerHTML = `<span class="lbl">${label}</span>
      <ul class="plain-list">${list.map((v, i) => `<li>${esc(v)}<span class="x-inline" data-i="${i}">✕</span></li>`).join('') || '<li style="color:var(--faint)">Nothing yet.</li>'}</ul>
      <div class="add-inline"><input class="inp tiny" placeholder="${placeholder}"></div>`;
    wrap.querySelectorAll('.x-inline').forEach(x => x.onclick = () => { D[key].splice(+x.dataset.i, 1); save(key); render(); });
    const inp = wrap.querySelector('.add-inline input');
    inp.onkeydown = e => { if (e.key === 'Enter' && inp.value.trim()) { D[key].push(inp.value.trim()); save(key); render(); } };
    return wrap;
  }

  function chipListCard(label, list, key, placeholder) {
    const wrap = el('div', 'card info-card');
    wrap.innerHTML = `<span class="lbl">${label}</span>
      <div class="chiprow">${list.map((v, i) => `<span class="tag">${esc(v)}<span class="x-inline" data-i="${i}">✕</span></span>`).join('') || '<span style="color:var(--faint);font-size:12.5px">Nothing yet.</span>'}</div>
      <div class="add-inline"><input class="inp tiny" placeholder="${placeholder}"></div>`;
    wrap.querySelectorAll('.x-inline').forEach(x => x.onclick = () => { D[key].splice(+x.dataset.i, 1); save(key); render(); });
    const inp = wrap.querySelector('.add-inline input');
    inp.onkeydown = e => { if (e.key === 'Enter' && inp.value.trim()) { D[key].push(inp.value.trim()); save(key); render(); } };
    return wrap;
  }

  function aboutCard() {
    const wrap = el('div', 'card info-card');
    wrap.innerHTML = `<span class="lbl">About me</span><p class="about-txt" contenteditable="true">${esc(D.id.about)}</p>`;
    const p = wrap.querySelector('p');
    p.onblur = () => { D.id.about = p.textContent.trim(); save('id'); };
    return wrap;
  }

  function skillSummaryCard() {
    const wrap = el('div', 'card info-card');
    wrap.innerHTML = `<span class="lbl">Skills</span>` +
      (D.skill.length
        ? D.skill.map(s => `<div class="bar-row"><div class="br-top"><span>${esc(s.name)}</span><span>${s.lv * 20}%</span></div><div class="bar-track"><i class="bar-fill" style="width:${s.lv * 20}%"></i></div></div>`).join('')
        : `<p style="color:var(--faint);font-size:12.5px">Add skills below.</p>`);
    return wrap;
  }

  function achievementsSummaryCard() {
    const wrap = el('div', 'card info-card');
    const top = D.ach.slice(0, 5);
    wrap.innerHTML = `<span class="lbl">Achievements</span>
      <ul class="plain-list">${top.map(a => `<li>${esc(a.title)}${a.when ? ` <span style="color:var(--faint)">· ${esc(a.when)}</span>` : ''}</li>`).join('') || '<li style="color:var(--faint)">Add achievements below.</li>'}</ul>`;
    return wrap;
  }

  function langCard() {
    const wrap = el('div', 'card info-card');
    wrap.innerHTML = `<span class="lbl">Languages</span>` +
      D.lang.map((l, i) => `<div class="bar-row"><div class="br-top"><span>${esc(l.name)}<span class="x-inline" data-i="${i}" style="margin-left:6px">✕</span></span><span>${l.pct}%</span></div><div class="bar-track"><i class="bar-fill" style="width:${l.pct}%"></i></div></div>`).join('') +
      `<div class="add-inline"><input class="inp tiny" id="langName" placeholder="Language" style="flex:1.3"><input class="inp tiny" id="langPct" type="number" min="0" max="100" placeholder="%" style="width:56px"></div>`;
    wrap.querySelectorAll('.x-inline').forEach(x => x.onclick = () => { D.lang.splice(+x.dataset.i, 1); save('lang'); render(); });
    const go = () => {
      const n = wrap.querySelector('#langName').value.trim();
      const p = Math.max(0, Math.min(100, parseInt(wrap.querySelector('#langPct').value, 10) || 0));
      if (!n) return;
      D.lang.push({ name: n, pct: p }); save('lang'); render();
    };
    wrap.querySelector('#langPct').onkeydown = e => { if (e.key === 'Enter') go(); };
    wrap.querySelector('#langName').onkeydown = e => { if (e.key === 'Enter') wrap.querySelector('#langPct').focus(); };
    return wrap;
  }

  function renderInfoGrid() {
    const g1 = document.getElementById('profileInfoGrid');
    if (g1) { g1.innerHTML = ''; g1.append(aboutCard(), simpleListCard('Hobbies', D.hobby, 'hobby', 'Add a hobby'), simpleListCard('Extracurriculars', D.extra, 'extra', 'Add an activity'), skillSummaryCard()); }
    const g2 = document.getElementById('profileInfoGrid2');
    if (g2) { g2.innerHTML = ''; g2.append(achievementsSummaryCard(), chipListCard('Interests', D.interest, 'interest', 'Add an interest'), langCard()); }
  }

  /* ---------------- five-stat strip ---------------- */
  function activeDaysCount() {
    const days = new Set();
    (Store.get('pomo.log', [])).forEach(x => days.add(x.date));
    (Store.get('cal.items', [])).forEach(i => { if (i.done && i.date) days.add(i.date); });
    (Store.get('thoughts', [])).forEach(t => { if (t.at) days.add(iso(new Date(t.at))); });
    return days.size;
  }
  function renderStats() {
    const host = document.getElementById('statRow');
    if (!host) return;
    const books = Store.get('books', []).filter(x => x.status === 'read').length;
    const th = Store.get('thoughts', []).length;
    const projects = Store.get('stk.stacks', []).length;
    const hours = (Store.get('pomo.log', []).reduce((a, x) => a + (x.mins || 0), 0) / 60);
    const days = activeDaysCount();
    const stat = (v, l) => `<div class="stat-card"><div class="sv">${v}</div><div class="sl">${l}</div></div>`;
    host.innerHTML = stat(projects, 'Projects') + stat(books, 'Books read') + stat(th, 'Notes created') + stat(hours.toFixed(1), 'Hours logged') + stat(days, 'Days active');
  }

  /* ---------------- legacy editable sections (unchanged) ---------------- */
  function listSection(s) {
    const wrap = el('div', 'sec');
    wrap.innerHTML = `<div class="sec-head"><h3>${s.t}</h3><div class="rule"></div></div>`;
    const rows = el('div');
    D[s.k].forEach((it, i) => {
      const r = el('div', 'entry');
      r.innerHTML = `<div class="when">${esc(it.when)}</div>
        <div class="what"><b>${esc(it.title)}</b><span>${esc(it.org)}</span>${it.note ? `<p>${esc(it.note)}</p>` : ''}</div>
        <button class="x" title="Remove">✕</button>`;
      r.querySelector('.x').onclick = () => { D[s.k].splice(i, 1); save(s.k); render(); };
      rows.appendChild(r);
    });
    wrap.appendChild(rows);
    const add = el('div', 'add-line');
    s.f.forEach((f, i) => { const n = el('input', 'inp'); n.placeholder = s.ph[i]; n.dataset.f = f; add.appendChild(n); });
    const btn = el('button', 'btn tiny', 'Add');
    btn.onclick = () => {
      const o = {}; add.querySelectorAll('input').forEach(n => o[n.dataset.f] = n.value.trim());
      if (!o.title) return toast('Give it a title first.');
      D[s.k].unshift(o); save(s.k); render();
    };
    add.appendChild(btn); wrap.appendChild(add);
    return wrap;
  }

  function skillSection() {
    const wrap = el('div', 'sec');
    wrap.innerHTML = `<div class="sec-head"><h3>Skills</h3><div class="rule"></div></div>`;
    const chips = el('div', 'chips');
    D.skill.forEach((sk, i) => {
      const c = el('div', 'chip');
      c.innerHTML = `<span>${esc(sk.name)}</span><i class="lv">${'●'.repeat(sk.lv)}${'○'.repeat(5 - sk.lv)}</i><button class="x">✕</button>`;
      c.querySelector('.lv').onclick = () => { sk.lv = sk.lv % 5 + 1; save('skill'); render(); };
      c.querySelector('.lv').style.cursor = 'pointer';
      c.querySelector('.lv').title = 'Click to change level';
      c.querySelector('.x').onclick = () => { D.skill.splice(i, 1); save('skill'); render(); };
      chips.appendChild(c);
    });
    wrap.appendChild(chips);
    const add = el('div', 'add-line');
    const inp = el('input', 'inp'); inp.placeholder = 'Skill (Enter to add)';
    const go = () => { if (!inp.value.trim()) return; D.skill.push({ name: inp.value.trim(), lv: 3 }); save('skill'); render(); };
    inp.onkeydown = e => { if (e.key === 'Enter') go(); };
    const btn = el('button', 'btn tiny', 'Add'); btn.onclick = go;
    add.append(inp, btn); wrap.appendChild(add);
    return wrap;
  }

  return { render };
})();

/* shared: downscale an image file before storing it */
function shrink(file, max, cb) {
  const fr = new FileReader();
  fr.onload = () => {
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      cb(c.toDataURL('image/jpeg', 0.82), c.width, c.height);
    };
    img.src = fr.result;
  };
  fr.readAsDataURL(file);
}
