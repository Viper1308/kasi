/* ══════════════ THE RIG — login, desk scene, view switching ══════════════ */
(() => {
  const VIEWS = ['profile', 'web', 'books', 'stacks', 'calendar', 'thoughts', 'vision', 'docket'];
  let current = null;
  let inited = false;

  /* ──────── LOGIN ──────── */
  // Two modes:
  //  • Supabase configured (config.js filled in) → real accounts + cross-device sync
  //  • Not configured → the old local admin/password gate, offline only
  const CRED_USER = 'admin';
  const CRED_PASS = 'Timmyboi1!';
  let signupMode = false;

  async function checkLogin() {
    Themes.apply(Themes.current());

    const initRes = await Sync.init();  // loads library + restores session if signed in

    if (Sync.enabled && !initRes.error) {
      setupSupabaseLogin();
      if (Sync.currentUser()) {
        // already signed in on this device → pull data, then in
        await enterWithSync();
      }
      return;
    }

    // ---- offline fallback: old local gate ----
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
      document.getElementById('loginGate').style.animation = 'monitorOn .35s ease reverse both';
      setTimeout(unlock, 350);
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

  // pull cloud data down, turn on mirroring, then start the app
  async function enterWithSync() {
    const sub = document.getElementById('loginSub');
    sub.textContent = 'syncing your data…';
    const firstEntryThisLoad = !window.__pulled;
    try {
      const res = await Sync.pullAll();   // cloud → localStorage (suppressed, no echo)
      window.__pulled = true;
      // If this login just replaced the in-memory module state with fresh cloud
      // data, the already-loaded modules are holding stale values. A single
      // reload re-runs every module against the now-current localStorage.
      // The Supabase session persists, so the reload enters directly.
      if (firstEntryThisLoad && res && res.ok && res.count > 0 && !sessionStorage.getItem('pos_reloaded')) {
        sessionStorage.setItem('pos_reloaded', '1');
        Store.setMirror(true);
        location.reload();
        return;
      }
    } catch (e) { console.warn(e); }
    Store.setMirror(true);        // from now on, every write also goes up
    document.getElementById('loginGate').style.animation = 'monitorOn .35s ease reverse both';
    setTimeout(unlock, 350);
  }

  function unlock() {
    document.getElementById('loginGate').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    if (!inited) initApp();
  }

  /* ──────── DESK SCENE ──────── */
  function showDesk() {
    document.getElementById('deskView').classList.remove('hidden');
    document.getElementById('fullView').classList.add('hidden');
    current = null;
    if (typeof Dashboard !== 'undefined') Dashboard.render();
  }

  /* ──────── FULLSCREEN VIEW ──────── */
  function openView(v) {
    document.getElementById('deskView').classList.add('hidden');
    const fv = document.getElementById('fullView');
    fv.classList.remove('hidden');
    // re-trigger the CRT turn-on animation
    fv.style.animation = 'none';
    fv.offsetHeight; // force reflow
    fv.style.animation = '';

    current = v;
    VIEWS.forEach(k => document.getElementById('view-' + k).classList.toggle('on', k === v));
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.view === v));
    Store.set('ui.view', v);
    if (v === 'web') Web.draw();
    if (v === 'calendar') Cal.grid();
    if (v === 'profile') Profile.render();
    if (v === 'stacks') Stacks.refresh();
    if (v === 'vision') Board.refresh();
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
      a.download = `polymath-os-${iso(new Date())}.json`;
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
    // relabel logout button to match mode
    const lo = document.getElementById('setLogout');
    if (lo) lo.textContent = u ? 'Sign out' : 'Log out';
  }

  /* ──────── INIT ──────── */
  function initApp() {
    inited = true;
    Themes.apply(Themes.current());
    buildSettings();

    // sync status dot (only when signed in)
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

    Mobile.init();
    Profile.render(); Web.init(); Books.init(); Stacks.init(); Cal.init(); Margin.init(); Board.init();
    Gallery.init(); Dashboard.init(); Docket.init();
    clock(); setInterval(clock, 20000);
    gauge(); setInterval(gauge, 8000);

    // dashboard quick-nav → open view
    document.querySelectorAll('.quick-nav[data-view]').forEach(m => {
      m.onclick = () => openView(m.dataset.view);
    });

    // back to desk
    document.getElementById('backBtn').onclick = showDesk;

    // tab switching within fullscreen
    document.querySelectorAll('.tab[data-view]').forEach(t => {
      t.onclick = () => openView(t.dataset.view);
    });

    // backup / restore
    document.getElementById('topExport').onclick = backup;
    document.getElementById('fileImport').onchange = e => e.target.files[0] && restore(e.target.files[0]);

    // keyboard shortcuts
    document.addEventListener('keydown', e => {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) || document.activeElement.isContentEditable) return;
      if (e.key === 'Escape') {
        const sp = document.getElementById('settingsPanel');
        if (sp && !sp.classList.contains('hidden')) { sp.classList.add('hidden'); return; }
        if (current) showDesk();
        return;
      }
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= VIEWS.length) openView(VIEWS[n - 1]);
    });

    // if there's a saved view, jump straight in on reload
    const last = Store.get('ui.lastDesk', true);
    if (!last) {
      const sv = Store.get('ui.view', null);
      if (sv) openView(sv);
    }
  }

  document.addEventListener('DOMContentLoaded', checkLogin);
})();
