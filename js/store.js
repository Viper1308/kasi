/* ============================================================
   Store — local-first, with optional cloud mirroring.
   ------------------------------------------------------------
   Small data  -> localStorage   (instant, synchronous, survives reload)
   Images      -> IndexedDB       (local cache, large)
   BOTH are mirrored to Supabase in the background when signed in,
   so your data follows you across devices. If Supabase isn't set
   up, this behaves exactly like the old local-only Store.

   The public API (get/set/putImg/getImg/…) is unchanged, so none
   of the other files needed to change.
   ============================================================ */
const Store = (() => {
  const P = 'pos:';
  let usable = true, mem = {};
  let mirror = false;          // push writes to cloud?
  let suppress = false;        // true while bulk-loading from cloud (don't echo back)

  try { localStorage.setItem(P + '_t', '1'); localStorage.removeItem(P + '_t'); }
  catch (e) { usable = false; }

  // keys that are per-device and should NOT sync (auth flags)
  const LOCAL_ONLY = new Set(['auth.ok']);

  function setMirror(v) { mirror = v; }

  function get(key, fallback) {
    try {
      const raw = usable ? localStorage.getItem(P + key) : mem[key];
      return raw == null ? structuredClone(fallback) : JSON.parse(raw);
    } catch (e) { return structuredClone(fallback); }
  }
  function set(key, val) {
    const raw = JSON.stringify(val);
    try {
      if (usable) localStorage.setItem(P + key, raw); else mem[key] = raw;
    } catch (e) {
      window.dispatchEvent(new CustomEvent('storage-full'));
    }
    if (mirror && !suppress && !LOCAL_ONLY.has(key) && typeof Sync !== 'undefined') {
      Sync.queuePush(key, val);
    }
    return val;
  }
  function keys() {
    if (!usable) return Object.keys(mem);
    return Object.keys(localStorage).filter(k => k.startsWith(P)).map(k => k.slice(P.length));
  }
  function bytes() {
    let n = 0;
    keys().forEach(k => { const v = usable ? localStorage.getItem(P + k) : mem[k]; n += (v || '').length + k.length; });
    return n;
  }
  function dump() { const o = {}; keys().forEach(k => o[k] = get(k, null)); return o; }
  function load(obj) { Object.entries(obj).forEach(([k, v]) => set(k, v)); }

  // used by Sync.pullAll — write cloud data in without echoing it back up
  function _bulkLoad(obj) {
    suppress = true;
    try { Object.entries(obj).forEach(([k, v]) => set(k, v)); }
    finally { suppress = false; }
  }

  /* ---- IndexedDB for image blobs (local cache) ---- */
  let dbp = null;
  function db() {
    if (dbp) return dbp;
    dbp = new Promise((res, rej) => {
      const r = indexedDB.open('polymath-os', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('img');
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
    return dbp;
  }
  async function putImgLocal(id, dataUrl) {
    try { const d = await db(); return new Promise((res, rej) => { const tx = d.transaction('img', 'readwrite'); tx.objectStore('img').put(dataUrl, id); tx.oncomplete = res; tx.onerror = () => rej(tx.error); }); }
    catch (e) { set('img:' + id, dataUrl); }
  }
  async function getImgLocal(id) {
    try {
      const d = await db();
      return new Promise(res => { const rq = d.transaction('img').objectStore('img').get(id); rq.onsuccess = () => res(rq.result || get('img:' + id, null)); rq.onerror = () => res(null); });
    } catch (e) { return get('img:' + id, null); }
  }
  async function delImgLocal(id) {
    try { const d = await db(); d.transaction('img', 'readwrite').objectStore('img').delete(id); } catch (e) { }
  }
  async function allImgs() {
    try {
      const d = await db();
      return new Promise(res => {
        const out = {}, tx = d.transaction('img').objectStore('img').openCursor();
        tx.onsuccess = e => { const c = e.target.result; if (c) { out[c.key] = c.value; c.continue(); } else res(out); };
        tx.onerror = () => res(out);
      });
    } catch (e) { return {}; }
  }

  /* ---- public image API: writes local cache + mirrors to cloud ---- */
  async function putImg(id, dataUrl) {
    await putImgLocal(id, dataUrl);
    if (mirror && !suppress && typeof Sync !== 'undefined') Sync.putImg(id, dataUrl);
  }
  async function getImg(id) {
    let d = await getImgLocal(id);
    if (d) return d;
    if (mirror && typeof Sync !== 'undefined') {
      d = await Sync.getImg(id);
      if (d) { await putImgLocal(id, d); return d; }
    }
    return null;
  }
  async function delImg(id) {
    await delImgLocal(id);
    if (mirror && typeof Sync !== 'undefined') Sync.delImg(id);
  }

  return {
    get, set, keys, bytes, dump, load, usable,
    putImg, getImg, delImg, allImgs,
    _bulkLoad, setMirror
  };
})();

/* tiny helpers used everywhere */
const uid = () => Math.random().toString(36).slice(2, 10);
const el = (tag, cls, txt) => { const n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; };
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtDate = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const iso = d => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.hidden = false;
  clearTimeout(t._t); t._t = setTimeout(() => t.hidden = true, 2600);
}
