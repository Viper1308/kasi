/* ════════════════════════════════════════════════════════════
   STORE — local first, optional Supabase mirror.
   Small state (mastery, notes, activity) in localStorage.
   Long AI entries, if ever enabled, go to IndexedDB.
   ════════════════════════════════════════════════════════════ */
const Store = (() => {
  const P = 'codex:';
  let mem = {}, usable = true, sb = null, user = null;
  try { localStorage.setItem(P + '_t', '1'); localStorage.removeItem(P + '_t'); }
  catch (e) { usable = false; }

  function get(k, fb) {
    try {
      const raw = usable ? localStorage.getItem(P + k) : mem[k];
      return raw == null ? fb : JSON.parse(raw);
    } catch (e) { return fb; }
  }
  function set(k, v) {
    const raw = JSON.stringify(v);
    try { if (usable) localStorage.setItem(P + k, raw); else mem[k] = raw; }
    catch (e) { toast('Browser storage is full.'); }
    if (sb && user) push(k, v);
    return v;
  }
  function bytes() {
    if (!usable) return 0;
    return Object.keys(localStorage).filter(k => k.startsWith(P))
      .reduce((n, k) => n + (localStorage.getItem(k) || '').length, 0);
  }
  function dump() {
    const o = {};
    (usable ? Object.keys(localStorage).filter(k => k.startsWith(P)).map(k => k.slice(P.length)) : Object.keys(mem))
      .forEach(k => o[k] = get(k, null));
    return o;
  }
  function load(o) { Object.entries(o || {}).forEach(([k, v]) => set(k, v)); }

  /* ---- optional Supabase mirror ---- */
  const pend = {}; let timer = null;
  function push(k, v) {
    pend[k] = v; clearTimeout(timer); timer = setTimeout(flush, 800);
  }
  async function flush() {
    if (!sb || !user) return;
    const batch = Object.entries(pend).map(([k, v]) => ({ user_id: user.id, k: 'codex:' + k, v, updated_at: new Date().toISOString() }));
    Object.keys(pend).forEach(k => delete pend[k]);
    if (!batch.length) return;
    try { await sb.from('kv').upsert(batch, { onConflict: 'user_id,k' }); } catch (e) { }
  }
  async function connect() {
    const c = (window.CODEX_CONFIG || {}).supabase || {};
    if (!c.url || !c.anonKey) return false;
    try {
      if (!window.supabase) await new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
        s.onload = res; s.onerror = rej; document.head.appendChild(s);
      });
      sb = window.supabase.createClient(c.url, c.anonKey, { auth: { persistSession: true } });
      const { data } = await sb.auth.getSession();
      user = data && data.session ? data.session.user : null;
      if (!user) return false;
      const { data: rows } = await sb.from('kv').select('k,v').eq('user_id', user.id).like('k', 'codex:%');
      (rows || []).forEach(r => {
        const key = r.k.replace(/^codex:/, '');
        try { if (usable) localStorage.setItem(P + key, JSON.stringify(r.v)); } catch (e) { }
      });
      return true;
    } catch (e) { return false; }
  }
  function client() { return sb; }

  return { get, set, bytes, dump, load, connect, client, usable };
})();

/* small shared helpers */
const uid = () => Math.random().toString(36).slice(2, 10);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.hidden = false;
  clearTimeout(t._t); t._t = setTimeout(() => t.hidden = true, 2600);
}

/* ════════════════════════════════════════════════════════════
   CHARTS — hand-rolled SVG. No library, no build step.
   Every chart takes plain data and returns an SVG string.
   ════════════════════════════════════════════════════════════ */
const Chart = (() => {
  let gid = 0;
  const g = () => 'g' + (++gid);

  /* smooth path through points using a cardinal-ish curve */
  function curve(pts) {
    if (pts.length < 2) return pts.length ? `M${pts[0][0]},${pts[0][1]}` : '';
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
      const cx = (x0 + x1) / 2;
      d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`;
    }
    return d;
  }

  /* tiny sparkline for the KPI cards */
  function spark(values, colour) {
    const w = 240, h = 42, id = g();
    if (!values.length) values = [0, 0];
    const max = Math.max(...values, 1), min = Math.min(...values, 0);
    const span = (max - min) || 1;
    const pts = values.map((v, i) => [
      values.length === 1 ? w : (i / (values.length - 1)) * w,
      h - 4 - ((v - min) / span) * (h - 10)
    ]);
    const line = curve(pts);
    return `<svg class="kpi-spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${colour}" stop-opacity=".45"/>
        <stop offset="100%" stop-color="${colour}" stop-opacity="0"/>
      </linearGradient></defs>
      <path d="${line} L${w},${h} L0,${h} Z" fill="url(#${id})"/>
      <path d="${line}" fill="none" stroke="${colour}" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`;
  }

  /* the big gradient area chart */
  function area(series, opts) {
    opts = opts || {};
    const w = 720, h = 260, pl = 42, pr = 12, pt = 14, pb = 28, id = g();
    const iw = w - pl - pr, ih = h - pt - pb;
    const all = series.flatMap(s => s.values);
    const max = Math.max(...all, 1) * 1.15;
    const n = Math.max(...series.map(s => s.values.length), 2);

    let grid = '';
    for (let i = 0; i <= 4; i++) {
      const y = pt + (i / 4) * ih;
      grid += `<line class="gridline" x1="${pl}" y1="${y}" x2="${w - pr}" y2="${y}"/>`;
      grid += `<text class="axis" x="${pl - 8}" y="${y + 3.5}" text-anchor="end">${Math.round(max * (1 - i / 4))}</text>`;
    }
    let body = '';
    series.forEach((s, k) => {
      const gd = g();
      const pts = s.values.map((v, i) => [pl + (i / (n - 1)) * iw, pt + ih - (v / max) * ih]);
      const line = curve(pts);
      body += `<defs><linearGradient id="${gd}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${s.colour}" stop-opacity=".38"/>
        <stop offset="100%" stop-color="${s.colour}" stop-opacity="0"/></linearGradient></defs>
        <path d="${line} L${pts[pts.length-1][0]},${pt+ih} L${pts[0][0]},${pt+ih} Z" fill="url(#${gd})"/>
        <path d="${line}" fill="none" stroke="${s.colour}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
      if (k === 0) pts.forEach((p, i) => {
        body += `<circle cx="${p[0]}" cy="${p[1]}" r="3.2" fill="${s.colour}" opacity="0"
          class="dot" data-i="${i}"><animate attributeName="opacity" values="0;0" dur="1s"/></circle>`;
      });
    });
    let labels = '';
    (opts.labels || []).forEach((l, i) => {
      if (n > 8 && i % Math.ceil(n / 7) !== 0 && i !== n - 1) return;
      labels += `<text class="axis" x="${pl + (i / (n - 1)) * iw}" y="${h - 8}" text-anchor="middle">${esc(l)}</text>`;
    });
    return `<svg class="chart" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet">${grid}${body}${labels}</svg>`;
  }

  /* donut with a gradient-ish multi-segment ring */
  function donut(segs) {
    const size = 210, r = 78, sw = 24, c = size / 2;
    const total = segs.reduce((n, s) => n + s.value, 0) || 1;
    const circ = 2 * Math.PI * r;
    let off = 0, body = '';
    body += `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="rgba(255,255,255,.05)" stroke-width="${sw}"/>`;
    segs.forEach(s => {
      const frac = s.value / total;
      const len = frac * circ;
      if (len > 0.5) {
        body += `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${s.colour}"
          stroke-width="${sw}" stroke-linecap="butt"
          stroke-dasharray="${len - 2} ${circ - len + 2}"
          stroke-dashoffset="${-off}"
          transform="rotate(-90 ${c} ${c})"/>`;
      }
      off += len;
    });
    return `<svg class="chart" viewBox="0 0 ${size} ${size}" style="max-width:210px">${body}</svg>`;
  }

  /* vertical bars with gradient fill */
  function bars(items) {
    const w = 720, h = 250, pl = 40, pr = 10, pt = 14, pb = 34, id = g();
    const iw = w - pl - pr, ih = h - pt - pb;
    const max = Math.max(...items.map(i => i.value), 1) * 1.15;
    const bw = Math.max(6, Math.min(38, (iw / Math.max(items.length, 1)) * 0.55));
    let grid = '';
    for (let i = 0; i <= 4; i++) {
      const y = pt + (i / 4) * ih;
      grid += `<line class="gridline" x1="${pl}" y1="${y}" x2="${w - pr}" y2="${y}"/>`;
      grid += `<text class="axis" x="${pl - 8}" y="${y + 3.5}" text-anchor="end">${Math.round(max * (1 - i / 4))}</text>`;
    }
    let body = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#8b5cf6"/></linearGradient></defs>`;
    items.forEach((it, i) => {
      const x = pl + (i + 0.5) * (iw / Math.max(items.length, 1)) - bw / 2;
      const bh = Math.max(2, (it.value / max) * ih);
      body += `<rect x="${x}" y="${pt + ih - bh}" width="${bw}" height="${bh}" rx="4" fill="url(#${id})">
        <title>${esc(it.label)}: ${it.value}</title></rect>`;
      if (items.length <= 16)
        body += `<text class="axis" x="${x + bw / 2}" y="${h - 12}" text-anchor="middle">${esc(String(it.short || i + 1))}</text>`;
    });
    return `<svg class="chart" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet">${grid}${body}</svg>`;
  }

  return { spark, area, donut, bars, curve };
})();
