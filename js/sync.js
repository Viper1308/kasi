/* ============================================================
   SYNC — Supabase auth + cross-device data sync.
   ------------------------------------------------------------
   Architecture: local-first.
   • localStorage stays the instant working layer (app stays fast
     and synchronous — no other file had to change).
   • Every write is mirrored up to Supabase in the background.
   • On login, we pull the cloud copy down into localStorage first,
     then start the app.

   If config.js is blank, everything here no-ops and the app runs
   exactly as before (offline, local-only, admin/password login).
   ============================================================ */
const Sync = (() => {
  const cfg = window.SUPABASE_CONFIG || { url: '', anonKey: '' };
  const enabled = !!(cfg.url && cfg.anonKey);

  let sb = null;             // supabase client
  let user = null;           // logged-in user
  let ready = false;         // client library loaded
  const listeners = [];      // status change callbacks

  const on = fn => listeners.push(fn);
  const emit = status => listeners.forEach(fn => { try { fn(status); } catch (e) { } });

  /* ---- load the supabase-js library from CDN (only if configured) ---- */
  function loadLib() {
    if (window.supabase) return Promise.resolve();
    return new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
      s.onload = res;
      s.onerror = () => rej(new Error('Could not load Supabase (need internet).'));
      document.head.appendChild(s);
    });
  }

  async function init() {
    if (!enabled) { ready = true; return { enabled: false }; }
    try {
      await loadLib();
      sb = window.supabase.createClient(cfg.url, cfg.anonKey, {
        auth: { persistSession: true, autoRefreshToken: true }
      });
      ready = true;
      const { data } = await sb.auth.getSession();
      user = data?.session?.user || null;
      return { enabled: true, user };
    } catch (e) {
      console.warn('Sync init failed, falling back to offline:', e.message);
      ready = true;
      return { enabled: false, error: e.message };
    }
  }

  /* ---- auth ---- */
  async function signIn(email, password) {
    if (!sb) throw new Error('offline');
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    user = data.user;
    return user;
  }
  async function signUp(email, password) {
    if (!sb) throw new Error('offline');
    const { data, error } = await sb.auth.signUp({ email, password });
    if (error) throw error;
    // If email confirmation is OFF (recommended for personal use), we get a session now.
    user = data.user;
    return { user, needsConfirm: !data.session };
  }
  async function signOut() {
    if (sb) await sb.auth.signOut();
    user = null;
  }
  function currentUser() { return user; }

  /* ---- pull the whole cloud dataset into localStorage ---- */
  // rows: table "kv" with columns (user_id, k, v jsonb, updated_at)
  async function pullAll() {
    if (!sb || !user) return { ok: false };
    const { data, error } = await sb.from('kv').select('k,v').eq('user_id', user.id);
    if (error) { console.warn('pull error', error.message); return { ok: false, error }; }
    // write straight into localStorage without re-triggering push
    Store._bulkLoad((data || []).reduce((o, r) => { o[r.k] = r.v; return o; }, {}));
    return { ok: true, count: (data || []).length };
  }

  /* ---- push one key (debounced per key) ---- */
  const pending = {};
  let flushTimer = null;
  function queuePush(k, v) {
    if (!sb || !user) return;
    pending[k] = v;
    clearTimeout(flushTimer);
    flushTimer = setTimeout(flush, 700);
  }
  async function flush() {
    if (!sb || !user) return;
    const batch = Object.entries(pending).map(([k, v]) => ({
      user_id: user.id, k, v, updated_at: new Date().toISOString()
    }));
    Object.keys(pending).forEach(k => delete pending[k]);
    if (!batch.length) return;
    emit('syncing');
    const { error } = await sb.from('kv').upsert(batch, { onConflict: 'user_id,k' });
    emit(error ? 'error' : 'synced');
    if (error) console.warn('push error', error.message);
  }

  /* ---- delete a key from the cloud ---- */
  async function del(k) {
    if (!sb || !user) return;
    await sb.from('kv').delete().eq('user_id', user.id).eq('k', k);
  }

  /* ---- IMAGES → Supabase Storage bucket "images" ---- */
  // path scheme: {user_id}/{imgId}
  async function putImg(id, dataUrl) {
    if (!sb || !user) return { ok: false };
    try {
      const blob = dataUrlToBlob(dataUrl);
      const path = `${user.id}/${id}`;
      const { error } = await sb.storage.from('images').upload(path, blob, {
        upsert: true, contentType: blob.type || 'image/jpeg'
      });
      if (error) { console.warn('img upload', error.message); return { ok: false }; }
      return { ok: true };
    } catch (e) { return { ok: false }; }
  }
  async function getImg(id) {
    if (!sb || !user) return null;
    try {
      const path = `${user.id}/${id}`;
      const { data, error } = await sb.storage.from('images').download(path);
      if (error || !data) return null;
      return await blobToDataUrl(data);
    } catch (e) { return null; }
  }
  async function delImg(id) {
    if (!sb || !user) return;
    try { await sb.storage.from('images').remove([`${user.id}/${id}`]); } catch (e) { }
  }
  async function listImgIds() {
    if (!sb || !user) return [];
    try {
      const { data, error } = await sb.storage.from('images').list(user.id, { limit: 1000 });
      if (error) return [];
      return (data || []).map(f => f.name);
    } catch (e) { return []; }
  }

  function dataUrlToBlob(dataUrl) {
    const [head, body] = dataUrl.split(',');
    const mime = (head.match(/data:([^;]+)/) || [, 'image/jpeg'])[1];
    const bin = atob(body);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: mime });
  }
  function blobToDataUrl(blob) {
    return new Promise(res => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(blob); });
  }

  return {
    enabled, init, on,
    signIn, signUp, signOut, currentUser,
    pullAll, queuePush, flush, del,
    putImg, getImg, delImg, listImgIds,
    get user() { return user; }
  };
})();
