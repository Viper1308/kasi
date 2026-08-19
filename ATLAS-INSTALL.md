# The Atlas, inside Polymath OS

An eighth screen. Same desk, same login, same sync. Every subject you care about
gets an index of topics, and every topic opens into a written entry — five
passes, about two thousand words — composed on demand and kept forever.

Nothing about how Polymath works changes. No build step, no framework, no new
login. You are still uploading plain files to GitHub and letting Vercel serve
them.

---

## What changed

**Five new files**

| File | What it is |
|---|---|
| `js/atlas-data.js` | The four standing sheets: Economics, Finance, Mathematics, Computer Science. 51 sections, 444 topics. Plain data. |
| `js/atlas.js` | The screen itself — index, reader, entry writer, subject builder. |
| `css/atlas.css` | Styling. Uses your existing theme variables, so it re-skins with every theme. |
| `api/atlas.js` | A serverless function holding your AI key. Vercel picks up anything in `/api` automatically. |
| `atlas-supabase.sql` | One new table for written entries. |

**Five touched files** — small, surgical edits:

| File | Edit |
|---|---|
| `index.html` | Stylesheet link, a desk monitor, a nav tab, the view markup, two script tags |
| `js/app.js` | `'atlas'` added to `VIEWS`; one line in `openView` |
| `js/sync.js` | Exposes `client()` so the Atlas can reach its own table |
| `js/web.js` | An "Open in the Atlas" button on each subject panel |
| `js/thoughts.js` | `Margin.push()` so other screens can file a note |

Everything else is byte-identical to what you had.

---

## Two design decisions, and why

**Entries do not go through `Store`.** Every other screen writes to localStorage
and lets `Sync` mirror it into `kv`. Entries can't work that way: each is 8–12 KB
and there could eventually be hundreds, which is past the ~5 MB localStorage
ceiling, and it would make `pullAll()` on every login drag. So entries live in
their own table, `atlas_entries`, with an IndexedDB cache in front — the same
shape as the images path already in `store.js`. Your progress marks and any
subjects you build *are* small, so those ride the normal `kv` sync.

**The API route is gated by your existing login.** The browser sends its
Supabase access token; `api/atlas.js` checks it with Supabase before spending
anything. Nobody who isn't signed in to Polymath can reach the model. This is
better than a shared passcode and it costs you nothing — you already have auth.

---

## Step by step

### 1 · Run the SQL (2 minutes)

Supabase → your project → **SQL Editor** → **New query**. Paste all of
`atlas-supabase.sql` and hit **Run**.

It creates one table with the same row-level security as your `kv` table, plus
two indexes. It does not touch anything that already exists, and it's safe to
run twice.

### 2 · Get an AI key

console.anthropic.com → API Keys → create one. **Then set a monthly spend limit
under Billing → Limits.** Twenty dollars is a sensible ceiling. Do this now, not
later — see the cost note at the bottom.

If you'd rather use OpenAI, Gemini, or anything else, skip to *Using a different
provider* below. The route handles all of them.

### 3 · Upload the files to GitHub

Go to your `polymath-os` repo and drag the whole contents of this folder in,
replacing what's there. GitHub will show you a diff before you commit; the
changed files should be the ten listed above and nothing else.

If you'd rather be careful, upload only the ten changed and new files. The
`api/` folder is new — GitHub will create it when you drag it in.

Commit.

### 4 · Add the environment variables in Vercel

Vercel → your project → **Settings** → **Environment Variables**. Add four:

| Name | Value |
|---|---|
| `AI_API_KEY` | your Anthropic key |
| `AI_PROVIDER` | `anthropic` |
| `SUPABASE_URL` | your project URL, e.g. `https://abcdefgh.supabase.co` |
| `SUPABASE_ANON_KEY` | the same anon key that's in `js/config.js` |

Tick all three environments (Production, Preview, Development).

The last two are what enforce the login check. If you leave them out the route
still works, but it's open to anyone who finds the URL.

### 5 · Redeploy

Vercel redeploys automatically on push, but it won't pick up new environment
variables on an already-finished build. Go to **Deployments** → the top one →
**⋯** → **Redeploy**.

### 6 · Try it

Open `os.datamotion.in`, log in as normal. There's a new monitor on the desk and
a new tab, **The Atlas**.

Pick Economics, open any section, click a topic, hit **Write the full entry**.
You should see five parts land one after another over about a minute.

Then reload the page and open the same topic. If the entry is still there, the
whole chain — function, key, table, sync — is working.

### 7 · Check it followed you

Open the site on your phone and sign in. The entry you just wrote should be
there. That's the Supabase table doing its job; nothing is stranded on one
device.

---

## What to do when it doesn't work

| What you see | What it means |
|---|---|
| "Sign in to Polymath first" | The route can't verify your token. Usually `SUPABASE_URL` or `SUPABASE_ANON_KEY` is missing or has a typo — or you redeployed before adding them. |
| "AI_API_KEY is not set on the server" | Variable missing in Vercel, or you added it but didn't redeploy. |
| 404 on `/api/atlas` | The `api` folder didn't upload, or it landed inside another folder. It must sit at the repo root, beside `index.html`. |
| Entries write but vanish on reload | The SQL didn't run, or ran against the wrong project. Check Supabase → Table Editor for `atlas_entries`. |
| Entries save on one device only | Same cause — the local IndexedDB cache is covering for a missing table. |
| A 400 mentioning the model | The model id has moved on. Set `AI_MODEL` to a current one. |

---

## Using a different provider

Change environment variables, not code. The route converts every provider's
reply into the same shape.

```
OpenAI      AI_PROVIDER=openai      AI_MODEL=gpt-5
Gemini      AI_PROVIDER=gemini      AI_MODEL=gemini-2.5-pro
OpenRouter  AI_PROVIDER=compatible  AI_BASE_URL=https://openrouter.ai/api/v1
                                    AI_MODEL=anthropic/claude-sonnet-5
```

`compatible` also covers DeepSeek (`https://api.deepseek.com/v1`), Groq
(`https://api.groq.com/openai/v1`), Together, Mistral, xAI, and a local Ollama.

One caveat: the five-pass prompts were tuned against Claude. Smaller models tend
to collapse them into bullet summaries, and they're unreliable at the strict JSON
the subject builder needs. If building an index keeps failing on a cheap model,
that's why.

---

## Living with it

**Cost.** Each entry is five calls, roughly 4–5 cents on Sonnet 5. A whole
120-topic subject is about six dollars. "Write all remaining" on a big section is
the fastest way to spend money, which is what the spend limit is for.

**Where things live.** Entries in `atlas_entries`. Progress marks and any
subjects you build in `kv`, alongside everything else — so your existing backup
button captures them, and your `polymath-os-*.json` backups keep working
unchanged. Entries are *not* in that backup; to export them, run this in
Supabase's SQL editor and download the result:

```sql
select sheet, tid, topic, parts from public.atlas_entries
where user_id = auth.uid() order by sheet, tid;
```

**Adding your own permanent sheets.** The four built-in subjects are plain
objects at the top of `js/atlas-data.js`. Copy the shape and add a fifth.
Anything built through the **+** button lives in `kv` instead and syncs, which is
fine — moving it into the file just makes it permanent and version-controlled.

**The Web link.** Open a subject node in The Web and there's now an "Open in the
Atlas" button. `cs` and `ai` both map to Computer Science, `math` to
Mathematics; the mapping is at the top of `openSubject()` in `js/atlas.js` if you
want to change it.
