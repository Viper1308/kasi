/* ════════════════════════════════════════════════════════════
   APP — routing and boot.
   ════════════════════════════════════════════════════════════ */
const App = (() => {
  const SCREENS = ['dashboard', 'atlas', 'oracle'];
  let current = null;

  function go(v) {
    if (!SCREENS.includes(v)) v = 'dashboard';
    current = v;
    SCREENS.forEach(s => document.getElementById('screen-' + s).classList.toggle('on', s === v));
    document.querySelectorAll('.nav .pill').forEach(p => p.classList.toggle('on', p.dataset.go === v));
    Store.set('ui.screen', v);
    if (v === 'dashboard') Dashboard.render();
    if (v === 'atlas') Atlas.refresh();
    if (v === 'oracle') Oracle.renderScreen();
    window.scrollTo({ top: 0 });
  }

  /* search from the dashboard filter row jumps to the first hit */
  function search(term) {
    const q = term.toLowerCase();
    for (const s of window.CODEX_DATA) {
      for (let si = 0; si < s.sections.length; si++) {
        const ti = s.sections[si].topics.findIndex(t =>
          (t[0] + ' ' + (t[1] || '')).toLowerCase().includes(q));
        if (ti > -1) { Atlas.open(s.id, si, ti); go('atlas'); return; }
      }
    }
    toast('Nothing matches "' + term + '".');
  }

  function backup() {
    const blob = new Blob([JSON.stringify({ v: 1, at: Date.now(), app: 'codex', data: Store.dump() }, null, 1)],
      { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'codex-' + today() + '.json';
    a.click(); URL.revokeObjectURL(a.href);
    toast('Backed up.');
  }
  function restore(file) {
    const fr = new FileReader();
    fr.onload = () => {
      try {
        const j = JSON.parse(fr.result);
        if (!j.data) throw 0;
        Store.load(j.data);
        toast('Restored. Reloading…');
        setTimeout(() => location.reload(), 700);
      } catch (e) { toast('Not a valid Codex backup.'); }
    };
    fr.readAsText(file);
  }

  async function boot() {
    document.querySelectorAll('.nav .pill').forEach(p => p.onclick = () => go(p.dataset.go));
    document.getElementById('btnBackup').onclick = backup;
    document.getElementById('fileRestore').onchange = e => { if (e.target.files[0]) restore(e.target.files[0]); };

    await Store.connect();          // no-op unless Supabase is configured
    Atlas.snapshot();               // record today's baseline
    const cfg = window.CODEX_CONFIG || {};
    go(Store.get('ui.screen', cfg.home || 'dashboard'));

    const n = window.CODEX_DATA.reduce((a, s) => a + Atlas.nTopics(s), 0);
    document.getElementById('brandSub').textContent =
      window.CODEX_DATA.length + ' subjects · ' + n.toLocaleString('en-IN') + ' topics';
  }

  document.addEventListener('DOMContentLoaded', boot);
  return { go, search, backup };
})();
