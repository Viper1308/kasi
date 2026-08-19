/* ════════════════════════════════════════════════════════════
   CODEX — configuration. This is the only file you need to touch
   to change how the app is wired up.
   ════════════════════════════════════════════════════════════ */

window.CODEX_CONFIG = {

  /* ---- ORACLE (the AI writer) ----------------------------------
     Leave false and the whole app works with zero API keys: you get
     the full index, your own notes, mastery tracking and the
     dashboard. Nothing is missing except machine-written entries.

     To switch it on later:
       1. Get a free key at aistudio.google.com (no card needed).
       2. Put it in Vercel as AI_API_KEY, with AI_PROVIDER=gemini.
       3. Flip this to true and redeploy.
     The "Write entry" button then appears on every topic.        */
  oracle: false,

  /* ---- SUPABASE (optional cross-device sync) -------------------
     Blank = everything is stored in this browser only, which is
     perfectly fine. Fill both in to sync across your devices.
     The anon key is safe to commit — row level security protects
     the data, not secrecy of this string.                        */
  supabase: {
    url: '',
    anonKey: ''
  },

  /* ---- Which screen opens first ---- */
  home: 'dashboard'   // 'dashboard' | 'atlas' | 'oracle'
};

/* Subjects register themselves into this array. Add a file to
   data/ and a <script> tag in index.html — nothing else. */
window.CODEX_DATA = [];
