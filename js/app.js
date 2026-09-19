/* ══════════════ THE RIG — login, sidebar routing ══════════════
   NEXUS-style rework: the old "desk vs fullscreen" split is gone.
   Every screen (including the Dashboard) is a peer view switched by
   the persistent left sidebar. All view-level init calls below are
   unchanged from before — only how a view is shown has changed. */
(() => {
  const VIEWS = ['dashboard', 'profile', 'web', 'books', 'stacks', 'calendar', 'thoughts', 'docket'];
  let current = null;
  let inited = false;

  /* ──────── LOGIN ──────── */
  const CRED_USER = 'admin';
  const CRED_PASS = 'Timmyboi1!';
  let signupMode = false;

  async function checkLogin() {
    Themes.apply(Themes.current());

    const initRes = await Sync.init();

    if (Sync.enabled && !initRes.error) {
      setupSupabaseLogin();
      if (Sync.currentUser()) { await enterWithSync(); }
      return;
    }

    document.getElementById('loginSub').textContent = 'private terminal · offline';
    if (Store.get('auth.ok', false)) { unlock(); return; }
    document.getElementById('loginBtn').onclick = tryLocalLogin;
    document.getElementById('loginPass').addEventListener('keydown', e => { if (e.key === 'Enter') tryLocalLogin(); });
    document.getElementById('loginUser').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('loginPass').focus(); });
  }

  function tryLocalLogin() {
    const u = document.getElementById('loginUser').value.trim();
    const p = document.getElementById('loginPass').value;
    if (u === CRED_USER && p === CRED_PASS) {
      Store.set('auth.ok', true);
      unlock();
    } else {
      loginErr('Wrong credentials.');
    }
  }

  function setupSupabaseLogin() {
    document.getElementById('loginSub').textContent = 'sign in to sync across devices';
    const userInp = document.getElementById('loginUser');
    userInp.type = 'email';
    userInp.placeholder = 'email';
    userInp.autocomplete = 'email';
    const sw = document.getElementById('loginSwitch');
    sw.hidden = false;
    renderSwitch();
    document.getElementById('loginBtn').onclick = doSupabaseAuth;
    document.getElementById('loginPass').addEventListener('keydown', e => { if (e.key === 'Enter') doSupabaseAuth(); });
    userInp.addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('loginPass').focus(); });
  }
  function renderSwitch() {
    const sw = document.getElementById('loginSwitch');
    const btn = document.getElementById('loginBtn');
    if (signupMode) {
      btn.textContent = 'Create account';
      sw.innerHTML = 'Already have an account? <a href="#" id="swLink">Log in</a>';
    } else {
      btn.textContent = 'Log in';
      sw.innerHTML = 'First time here? <a href="#" id="swLink">Create an account</a>';
    }
    document.getElementById('swLink').onclick = e => { e.preventDefault(); signupMode = !signupMode; loginErr(''); renderSwitch(); };
  }

  async function doSupabaseAuth() {
    const email = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value;
    if (!email || !pass) { loginErr('Email and password, please.'); return; }
    if (pass.length < 6) { loginErr('Password must be at least 6 characters.'); return; }
    const btn = document.getElementById('loginBtn');
    btn.disabled = true; btn.textContent = signupMode ? 'Creating…' : 'Signing in…';
    try {
      if (signupMode) {
        const { needsConfirm } = await Sync.signUp(email, pass);
        if (needsConfirm) {
          loginErr('Check your email to confirm, then log in.');
          signupMode = false; renderSwitch();
          btn.disabled = false; return;
        }
      } else {
        await Sync.signIn(email, pass);
      }
      await enterWithSync();
    } catch (e) {
      loginErr(prettyAuthError(e));
      btn.disabled = false; renderSwitch();
    }
  }

  function prettyAuthError(e) {
    const m = (e && e.message || '').toLowerCase();
    if (m.includes('invalid login')) return 'Wrong email or password.';
    if (m.includes('already registered')) return 'That email already has an account — log in instead.';
    if (m.includes('rate')) return 'Too many tries. Wait a minute.';
    if (m.includes('offline') || m.includes('fetch')) return 'Can’t reach the server. Check your connection.';
    return e.message || 'Something went wrong.';
  }
  function loginErr(msg) {
    document.getElementById('loginErr').textContent = msg;
    if (msg) { document.getElementById('loginPass').value = ''; document.getElementById('loginPass').focus(); }
  }

  async function enterWithSync() {
    const sub = document.getElementById('loginSub');
    sub.textContent = 'syncing your data…';
    const firstEntryThisLoad = !window.__pulled;
    try {
      const res = await Sync.pullAll();
      window.__pulled = true;
      if (firstEntryThisLoad && res && res.ok && res.count > 0 && !sessionStorage.getItem('pos_reloaded')) {
        sessionStorage.setItem('pos_reloaded', '1');
        Store.setMirror(true);
        location.reload();
        return;
      }
    } catch (e) { console.warn(e); }
    Store.setMirror(true);
    unlock();
  }

  function unlock() {
    document.getElementById('loginGate').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    if (!inited) initApp();
  }

  /* ──────── VIEW ROUTING ──────── */
  function switchView(v) {
    if (!VIEWS.includes(v)) v = 'dashboard';
    current = v;
    VIEWS.forEach(k => { const s = document.getElementById('view-' + k); if (s) s.classList.toggle('on', k === v); });
    document.querySelectorAll('.nav-item[data-view]').forEach(t => t.classList.toggle('active', t.dataset.view === v));
    Store.set('ui.view', v);
    const stage = document.querySelector('.stage'); if (stage) stage.scrollTop = 0;
    // A problem in one view must never make the whole command centre
    // unusable.  The sidebar is intentionally still available so the user
    // can move to another screen while the failing view is diagnosed.
    try {
      if (v === 'web') Web.draw();
      if (v === 'calendar') Cal.grid();
      if (v === 'profile') Profile.render();
      if (v === 'stacks') Stacks.refresh();
      if (v === 'dashboard') Dashboard.render();
      if (v === 'thoughts') Margin.render();
      if (v === 'docket' && typeof DocketExtra !== 'undefined') DocketExtra.refresh();
    } catch (e) {
      console.error(`Could not render the ${v} view:`, e);
      const screen = document.getElementById('view-' + v);
      if (screen && !screen.textContent.trim()) {
        screen.innerHTML = '<div class="card"><h2>Unable to load this screen</h2><p class="sub">Try another tab, then refresh the page.</p></div>';
      }
    }
  }

  // Install the sidebar router independently of feature initialization.
  // This is deliberately delegated at document level: a broken optional
  // widget must never leave the navigation controls inert.
  function wireRouting() {
    if (document.documentElement.dataset.nexusRouting === 'ready') return;
    document.documentElement.dataset.nexusRouting = 'ready';
    document.addEventListener('click', e => {
      const item = e.target.closest('.nav-item[data-view]');
      if (item) switchView(item.dataset.view);
    });
  }

  /* ──────── CLOCK ──────── */
  function clock() {
    const n = new Date();
    const hm = n.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
    const dc = document.getElementById('deskClock');
    if (dc) dc.textContent = hm;
    const tc = document.getElementById('topClock');
    if (tc) tc.textContent = n.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase() + '  ' + hm;
    const hc = document.getElementById('hubClock');
    if (hc) hc.textContent = hm;
  }

  /* ──────── STORAGE GAUGE ──────── */
  function gauge() {
    const kb = Store.bytes() / 1024;
    const g = document.getElementById('gauge');
    if (!g) return;
    g.textContent = Store.usable
      ? `${kb < 1024 ? kb.toFixed(0) + ' KB' : (kb / 1024).toFixed(1) + ' MB'}`
      : 'NO STORAGE';
    if (!Store.usable) g.style.color = 'var(--rose)';
  }

  /* ──────── BACKUP / RESTORE ──────── */
  function backup() {
    Store.allImgs().then(imgs => {
      const blob = new Blob([JSON.stringify({ v: 1, at: Date.now(), data: Store.dump(), imgs }, null, 1)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `nexus-${iso(new Date())}.json`;
      a.click(); URL.revokeObjectURL(a.href);
      toast('Backed up. Keep the file somewhere safe.');
    });
  }
  function restore(file) {
    const fr = new FileReader();
    fr.onload = async () => {
      try {
        const j = JSON.parse(fr.result);
        if (!j.data) throw 0;
        Store.load(j.data);
        for (const [k, v] of Object.entries(j.imgs || {})) await Store.putImg(k, v);
        toast('Restored. Reloading…');
        setTimeout(() => location.reload(), 700);
      } catch (e) { toast('Not a valid backup file.'); }
    };
    fr.readAsText(file);
  }

  /* ──────── SETTINGS ──────── */
  function paintThemeGrid() {
    const grid = document.getElementById('themeGrid');
    grid.innerHTML = '';
    Themes.list().forEach(t => {
      const sw = document.createElement('button');
      sw.className = 'theme-swatch' + (t.key === Themes.current() ? ' on' : '');
      sw.innerHTML = `
        <span class="check">✓</span>
        <div class="dots">
          <i style="background:${t.vars['--amber']}"></i>
          <i style="background:${t.vars['--cyan']}"></i>
          <i style="background:${t.accent2 || t.vars['--violet']}"></i>
          <i style="background:${t.vars['--panel-2']}"></i>
        </div>
        <b>${t.name}</b><span>${t.mood}</span>`;
      sw.onclick = () => {
        Themes.apply(t.key);
        grid.querySelectorAll('.theme-swatch').forEach(x => x.classList.remove('on'));
        sw.classList.add('on');
      };
      grid.appendChild(sw);
    });
  }

  function wireCustomTheme() {
    const base = Themes.getCustomBase() || Themes.defaultCustomBase;
    const map = { ctBg: 'bg', ctPanel: 'panel', ctPrimary: 'primary', ctSecondary: 'secondary', ctInk: 'ink' };
    Object.entries(map).forEach(([id, key]) => { const inp = document.getElementById(id); if (inp) inp.value = base[key]; });
    document.getElementById('ctApply').onclick = () => {
      const b = {};
      Object.entries(map).forEach(([id, key]) => { b[key] = document.getElementById(id).value; });
      Themes.applyCustom(b);
      paintThemeGrid();
      toast('Custom palette applied.');
    };
  }

  function buildSettings() {
    paintThemeGrid();
    wireCustomTheme();

    document.getElementById('settingsGear').onclick = () => {
      document.getElementById('settingsPanel').classList.remove('hidden');
      updateSetGauge();
    };
    const close = () => document.getElementById('settingsPanel').classList.add('hidden');
    document.getElementById('settingsClose').onclick = close;
    document.getElementById('settingsBackdrop').onclick = close;
    document.getElementById('setExport').onclick = backup;
    document.getElementById('setImport').onchange = e => e.target.files[0] && restore(e.target.files[0]);
    document.getElementById('setLogout').onclick = async () => {
      sessionStorage.removeItem('pos_reloaded');
      try { await Sync.signOut(); } catch (e) { }
      Store.set('auth.ok', false);
      location.reload();
    };
  }
  function updateSetGauge() {
    const kb = Store.bytes() / 1024;
    const g = document.getElementById('setGauge');
    if (!g) return;
    let line = Store.usable
      ? `Using ${kb < 1024 ? kb.toFixed(0) + ' KB' : (kb / 1024).toFixed(1) + ' MB'} of local storage.`
      : 'Local storage unavailable in this preview — download the files and open index.html.';
    const u = Sync.currentUser && Sync.currentUser();
    if (u) line = `Signed in as ${u.email}. Data syncs across your devices. ` + line;
    else if (Sync.enabled) line = 'Sync is set up but you are in offline mode. ' + line;
    else line = 'Offline (local only). Set up Supabase to sync across devices — see README. ' + line;
    g.textContent = line;
    const lo = document.getElementById('setLogout');
    if (lo) lo.textContent = u ? 'Sign out' : 'Log out';
  }

  /* ──────── INIT ──────── */
  function initApp() {
    inited = true;
    Themes.apply(Themes.current());
    buildSettings();

    // Wire and activate navigation before initializing individual modules.
    // Previously an exception in any module below stopped execution here,
    // leaving every `.view` hidden and every sidebar tab inert.
    wireRouting();
    switchView(Store.get('ui.view', 'dashboard'));

    const safeInit = (name, fn) => {
      try { fn(); }
      catch (e) { console.error(`Could not initialize ${name}:`, e); }
    };

    const dot = document.getElementById('syncDot');
    if (dot && Sync.currentUser && Sync.currentUser()) {
      dot.hidden = false;
      dot.className = 'sync-dot ok';
      dot.title = 'Synced';
      Sync.on(status => {
        dot.className = 'sync-dot ' + (status === 'syncing' ? 'busy' : status === 'error' ? 'err' : 'ok');
        dot.title = status === 'syncing' ? 'Syncing…' : status === 'error' ? 'Sync error — will retry' : 'Synced';
      });
    }

    safeInit('mobile layout', () => Mobile.init());
    safeInit('profile', () => Profile.render());
    safeInit('web', () => Web.init());
    safeInit('shelf', () => Books.init());
    safeInit('stacks', () => Stacks.init());
    safeInit('calendar', () => Cal.init());
    safeInit('margin', () => Margin.init());
    safeInit('gallery', () => Gallery.init());
    safeInit('dashboard', () => Dashboard.init());
    safeInit('docket', () => Docket.init());
    if (typeof DocketExtra !== 'undefined') safeInit('docket summary', () => DocketExtra.init());
    clock(); setInterval(clock, 20000);
    gauge(); setInterval(gauge, 8000);

    document.getElementById('topExport').onclick = backup;
    document.getElementById('fileImport').onchange = e => e.target.files[0] && restore(e.target.files[0]);

    document.addEventListener('keydown', e => {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) || document.activeElement.isContentEditable) return;
      if (e.key === 'Escape') {
        const sp = document.getElementById('settingsPanel');
        if (sp && !sp.classList.contains('hidden')) { sp.classList.add('hidden'); return; }
        return;
      }
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= VIEWS.length) switchView(VIEWS[n - 1]);
    });

    // Repaint the selected view now that all of its data modules have had a
    // chance to initialize.
    switchView(current || Store.get('ui.view', 'dashboard'));
  }

  document.addEventListener('DOMContentLoaded', () => {
    wireRouting();
    checkLogin();
  });
})();
