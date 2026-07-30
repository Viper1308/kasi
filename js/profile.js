/* ══════════════ THE RECORD — your private CV ══════════════ */
const Profile = (() => {
  const D = {
    id: Store.get('profile', { name: 'Your name', role: 'Add a headline', place: 'Bengaluru, IN', about: 'A line or two about what you are actually doing with your time.' }),
    exp: Store.get('p.exp', []),
    edu: Store.get('p.edu', []),
    cert: Store.get('p.cert', []),
    ach: Store.get('p.ach', []),
    skill: Store.get('p.skill', [])
  };
  const save = k => Store.set(k === 'id' ? 'profile' : 'p.' + k, D[k]);

  const SECTIONS = [
    { k: 'exp', t: 'Experience', f: ['when', 'title', 'org', 'note'], ph: ['2024 – now', 'Role', 'Organisation', 'What you actually did'] },
    { k: 'edu', t: 'Education', f: ['when', 'title', 'org', 'note'], ph: ['2019 – 2023', 'Degree / programme', 'Institution', 'Focus, marks, anything worth keeping'] },
    { k: 'cert', t: 'Certifications', f: ['when', 'title', 'org', 'note'], ph: ['Mar 2025', 'Certificate', 'Issued by', 'Credential ID or notes'] },
    { k: 'ach', t: 'Achievements', f: ['when', 'title', 'org', 'note'], ph: ['2025', 'What you won or built', 'Where', 'Why it mattered'] }
  ];

  function render() {
    // identity card
    const idc = document.getElementById('idCard');
    idc.innerHTML = `
      <div class="avatar" id="avatar" title="Click to set a picture">${D.id.name.trim().charAt(0).toUpperCase() || '·'}</div>
      <h1 contenteditable="true" data-f="name">${esc(D.id.name)}</h1>
      <div class="role" contenteditable="true" data-f="role">${esc(D.id.role)}</div>
      <div class="place" contenteditable="true" data-f="place">${esc(D.id.place)}</div>
      <div class="about" contenteditable="true" data-f="about">${esc(D.id.about)}</div>
      <div class="stat-row" id="statRow"></div>`;
    idc.querySelectorAll('[data-f]').forEach(n => {
      n.addEventListener('blur', () => { D.id[n.dataset.f] = n.textContent.trim(); save('id'); render(); });
      n.addEventListener('keydown', e => { if (e.key === 'Enter' && n.dataset.f !== 'about') { e.preventDefault(); n.blur(); } });
    });
    const av = document.getElementById('avatar');
    Store.getImg('avatar').then(src => { if (src) { av.style.backgroundImage = `url(${src})`; av.textContent = ''; } });
    av.onclick = () => {
      const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*';
      i.onchange = () => i.files[0] && shrink(i.files[0], 400, u => { Store.putImg('avatar', u).then(render); });
      i.click();
    };
    stats();

    // sections
    const b = document.getElementById('recordBody'); b.innerHTML = '';
    SECTIONS.forEach(s => b.appendChild(listSection(s)));
    b.appendChild(skillSection());
  }

  function stats() {
    const books = Store.get('books', []).filter(x => x.status === 'read').length;
    const strands = Object.keys(Store.get('web.custom', {})).length + 78;
    const th = Store.get('thoughts', []).length;
    document.getElementById('statRow').innerHTML = `
      <div class="stat"><b>${books}</b><span>books finished</span></div>
      <div class="stat"><b>${strands}</b><span>strands live</span></div>
      <div class="stat"><b>${th}</b><span>thoughts kept</span></div>`;
  }

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
