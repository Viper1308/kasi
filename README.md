# CODEX

A personal library of what mastery of a field actually contains. Eight subjects,
885 topics, a dashboard that tracks what you have actually absorbed, and a
reserved slot for the assistant layer.

**No API key required.** No build step, no framework, no npm install. It is
plain HTML, CSS and JavaScript — the same deployment model as Polymath.

---

## Deploying (about ten minutes)

1. Create a GitHub repo, drag this whole folder in, commit.
2. Vercel → Add New → Project → import the repo.
   - Framework Preset: **Other**
   - Build Command: leave blank
   - Output Directory: leave blank
3. Deploy. You get a `.vercel.app` URL.
4. Custom domain: Vercel → Settings → Domains → add `codex.datamotion.in`.
   In Cloudflare DNS add a CNAME `codex` → the target Vercel gives you, proxy
   status **DNS only** (grey cloud).

That is the whole deployment. There is nothing to configure because nothing
needs a key.

---

## What's in here

```
index.html            the shell — nav, screens, script tags
css/codex.css         the entire visual system (all colours are variables)
js/config.js          the only file you edit to change how it is wired
js/core.js            storage + the hand-rolled SVG chart library
js/atlas.js           the library screen
js/dashboard.js       the overview screen
js/oracle.js          the assistant screen, and the dormant entry writer
js/app.js             routing and boot
data/*.js             one file per subject — this is where the content lives
api/oracle.js         serverless function, unused until you switch Oracle on
```

---

## Adding or editing a subject

This is meant to be the easy part. Each file in `data/` is one subject and
nothing references it except a script tag.

```js
CODEX_DATA.push({
  id: 'chemistry',            // unique, lowercase, no spaces
  name: 'Chemistry',          // shown everywhere
  short: 'Chem',              // shown on the narrow subject tabs
  accent: 'green',            // any accent variable from codex.css
  level: 'Undergraduate depth',
  blurb: 'One or two sentences on what commanding this subject means.',
  sections: [
    { title: 'Thermodynamics', note: '', topics: [
      ['Gibbs free energy', 'spontaneity criterion at constant T and P'],
      ['Entropy', 'the second law and its statistical reading'],
    ]},
  ]
});
```

Then add one line to `index.html`, next to the others:

```html
<script src="data/chemistry.js"></script>
```

That is it. The subject appears in the Atlas tabs, the dashboard filter, the
donut, the bar list and the global search automatically. Nothing else needs
touching.

Available accents: `cyan sky blue indigo violet magenta pink teal green amber rose`.

**Editing existing content** — open the file, change the strings. A topic is
just `['Name', 'one-line gloss']`. Deleting a topic does not delete your notes
on it; they are keyed by name, so renaming a topic orphans its note. Rename
carefully.

---

## Changing the look

Every colour, radius and font sits in the `:root` block at the top of
`css/codex.css`. Changing the three gradient stops re-skins the whole thing:

```css
--cyan:#38bdf8;   /* left of every gradient  */
--violet:#8b5cf6; /* middle                  */
--magenta:#d946ef;/* right                   */
```

The charts read those same variables, so they follow along. `--bg`, `--card`
and `--line` control the ground and the card surfaces.

---

## Switching Oracle on later

Everything for the entry writer is already built and dormant. When you want it:

1. Go to **aistudio.google.com** → Get API key. Free, no credit card, and the
   key does not expire. Flash models give roughly 1,500 requests a day, which is
   about 300 full entries — far more than you will use.
2. In Vercel → Settings → Environment Variables, add:

   | Name | Value |
   |---|---|
   | `AI_API_KEY` | your `AIza…` key |
   | `AI_PROVIDER` | `gemini` |
   | `AI_MODEL` | `gemini-2.5-flash` |
   | `ORACLE_PASSCODE` | optional, any string, stops strangers using the endpoint |

3. In `js/config.js` set `oracle: true`.
4. Commit, then redeploy (Vercel does not pick up new env vars on a finished
   build — use Deployments → ⋯ → Redeploy).

A **Write full entry** button then appears on every topic. Each entry is five
passes — orientation, formal core, worked case, limits and traps, connections —
roughly two thousand words, saved to your browser.

`api/oracle.js` also speaks OpenAI, Anthropic, and any OpenAI-compatible
endpoint (OpenRouter, Groq, DeepSeek, a local Ollama). Change `AI_PROVIDER` and,
for the last category, `AI_BASE_URL`.

---

## Where your data lives

Notes, mastery marks, the daily history line and the activity feed are in
`localStorage` under the `codex:` prefix. Per browser, per device.

The **↓ button** in the top bar downloads everything as JSON. The **↑ button**
restores it. Use them when you switch machines — or set up sync properly:

Fill in `supabase` in `js/config.js` with the same project Polymath uses. It
writes to the same `kv` table, namespaced under `codex:`, so no new SQL is
needed and the two apps do not collide. Sync only activates when a Supabase
session already exists in that browser.

---

## Notes on the design

The layout is a recreation of a reference dashboard: filter row, four KPI cards
with gradient sparklines, a large area chart beside a donut, a bar list beside a
column chart, then an activity feed with pill badges.

The charts are hand-written SVG in `js/core.js` — no charting library. Roughly
150 lines for the sparkline, area, donut and bars. If you want to change how a
chart looks, that is the file, and each function takes plain data and returns an
SVG string.
