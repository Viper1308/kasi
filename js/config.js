/* ============================================================
   CONFIG — your Supabase keys go here.
   ------------------------------------------------------------
   Leave these blank to run in offline mode (local storage only,
   no cross-device sync, and the old admin/password login).

   Fill them in to turn on real accounts + sync across devices.
   Both values are SAFE to put here and commit to GitHub — the
   anon key is designed to be public. Your data is protected by
   Row Level Security (the SQL you paste into Supabase), not by
   hiding this key. See README, "Sync across devices".
   ============================================================ */
window.SUPABASE_CONFIG = {
  url:     'https://tqnmkfedmipugznonzjh.supabase.co',   // e.g. https://abcdefgh.supabase.co
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxbm1rZmVkbWlwdWd6bm9uempoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0MjI0NjUsImV4cCI6MjEwMDk5ODQ2NX0.dOki6Ph1tgVUI4TWG5O83B5fGf80FE2stjlNHdQcOtk'    // the long "anon public" key from Supabase → Settings → API
};
