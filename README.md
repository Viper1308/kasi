# KASI — Knowledge & Areas of Self-Improvement

(Formerly Polymath OS — same app, same data, new name and a new home screen.)

A private life-planner + seven-screen dashboard. No accounts, no server, no one else's copy of your data.

**Login:** `admin` / `Timmyboi1!` (offline mode). Set up Supabase below for real accounts + sync across devices.

---

## Step-by-step: putting this on the internet with GitHub + Vercel

You need: a browser. That's it. No terminal, no command line, nothing to install.

### Part 1 — GitHub (where the code lives)

1. Go to **github.com** and click **Sign up**. Use any email. Pick a username. Verify.
2. Once you're in, click the **+** button in the top-right corner → **New repository**.
3. Repository name: `polymath-os`
4. Set it to **Public** (Vercel's free tier requires this; your login gate keeps people out).
5. Leave everything else default. Click **Create repository**.
6. On the next page, you'll see an empty repo. Click the link that says **uploading an existing file**.
7. **Unzip the `polymath-os.zip`** file I gave you on your computer.
8. **Drag the entire contents** into the GitHub upload area:
   - `index.html`
   - `css/` folder (with `style.css` inside)
   - `js/` folder (with all the `.js` files inside)
   - `README.md`
9. Scroll down, click **Commit changes**.
10. Done. Your code is on GitHub. The URL looks like `github.com/yourusername/polymath-os`.

### Part 2 — Vercel (turns GitHub into a website)

1. Go to **vercel.com** and click **Sign Up** → **Continue with GitHub**. Authorise it.
2. You land on the Vercel dashboard. Click **Add New…** → **Project**.
3. You'll see your GitHub repos listed. Find `polymath-os` and click **Import**.
4. On the "Configure Project" screen:
   - **Framework Preset:** leave as `Other`
   - **Root Directory:** leave blank (it's the repo root)
   - **Build Command:** leave blank
   - **Output Directory:** leave blank
5. Click **Deploy**.
6. Wait 15–30 seconds. It'll say "Congratulations!"
7. Click the preview or the URL. It looks like `polymath-os-yourusername.vercel.app`.
8. You'll see the login screen. Type `admin` and `Timmyboi1!`. You're in.

### Part 3 — Custom domain (optional, e.g. os.datamotion.in)

1. In Vercel, go to your project → **Settings** → **Domains**.
2. Type `os.datamotion.in` and click **Add**.
3. Vercel shows you a CNAME record: something like `cname.vercel-dns.com`.
4. Go to **Cloudflare** (where datamotion.in is managed).
5. DNS → **Add record**:
   - Type: `CNAME`
   - Name: `os`
   - Target: `cname.vercel-dns.com` (whatever Vercel told you)
   - Proxy status: **DNS only** (grey cloud) — Vercel handles its own SSL
6. Back in Vercel, click **Refresh**. It'll verify and issue an SSL certificate.
7. `os.datamotion.in` now loads your dashboard.

### Part 4 — Updating the site later

**Option A (easy, through the browser):**
1. Go to your repo on github.com.
2. Click on a file (e.g. `js/app.js`).
3. Click the pencil icon (Edit).
4. Make your change, click **Commit changes**.
5. Vercel detects the change and redeploys in ~30 seconds. That's it.

**Option B (once you're comfortable):**
1. Install GitHub Desktop (desktop app, no command line).
2. Clone your repo.
3. Edit files in any text editor.
4. Commit and push. Vercel picks it up automatically.


---

## Importing your book list

On The Shelf, click **Import list** and choose a `.csv`, `.xlsx`, or `.xls` file. Click **Template** to download a correctly-formatted blank CSV to fill in.

**Expected columns** (header row, any order, extra columns ignored):

| Column | Required | Notes |
|---|---|---|
| Title | yes | the only truly required field |
| Author | no | helps cover lookup |
| Status | no | `Reading`, `Finished`/`Read`, or `Want to read`. Defaults to Want to read |
| Rating | no | 0–5 |
| Year | no | publication year |
| Notes | no | free text |

If your file has no header row, the first column is treated as Title and the second as Author. Duplicate title+author pairs are skipped. Covers are fetched from Open Library automatically after import (needs internet).

Excel import loads a small reader library from a CDN the first time — so the very first Excel import needs internet. CSV import works fully offline.

---

## Settings (gear icon, top-right of the desk)

- **Theme** — six dark palettes: Midnight Amber, Deep Forest, Abyssal Blue, Velvet Plum, Ember Rust, Graphite Mono — plus a **Custom palette** builder (five colour pickers; the rest of the room is derived to match). Changes the whole app instantly and is remembered.
- **Ambience** — toggle rain, dust motes, string lights, and the spinning vinyl on the desk.
- **Data** — back up / restore everything, or log out.

---

## Sync across devices (Supabase)

By default the app runs **offline** — data lives in each browser and doesn't sync, and login is the `admin` / `Timmyboi1!` gate. To log in with a real account and have the same data on your laptop, phone, and anywhere else, connect it to Supabase (free). Setup is browser-only, about ten minutes, roughly the same difficulty as the Vercel steps.

### Part 1 — Create a Supabase project

1. Go to **supabase.com** → **Start your project** → sign in with GitHub.
2. Click **New project**. Give it a name (e.g. `polymath-os`), set a database password (save it somewhere — you won't need it often), pick the region closest to you, and create. Wait ~2 minutes for it to spin up.

### Part 2 — Run the setup SQL

1. In your project, open **SQL Editor** (left sidebar) → **New query**.
2. Open the file **`supabase-setup.sql`** (included in this project), copy everything, paste it in, and click **Run**.
3. You should see "Success." This creates your data table, a private images bucket, and the security rules that keep each account's data separate.

### Part 3 — Turn off email confirmation (recommended for personal use)

1. Go to **Authentication** → **Sign In / Providers** (or **Providers → Email**).
2. Turn **Confirm email** OFF. This lets you sign up and log in immediately without clicking a confirmation link. (Leave it ON if you prefer — you'll just get a confirmation email the first time.)

### Part 4 — Paste your keys into the app

1. In Supabase, go to **Project Settings** → **API**.
2. Copy two things:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon public** key (a long string under "Project API keys")
3. Open **`js/config.js`** in this project and paste them in:
   ```js
   window.SUPABASE_CONFIG = {
     url:     'https://abcdefgh.supabase.co',
     anonKey: 'eyJhbGc...your-long-anon-key...'
   };
   ```
4. Save. If you're deploying through GitHub, edit `js/config.js` on github.com (pencil icon), commit, and Vercel redeploys automatically.

**Are these keys safe to commit to a public repo? Yes.** The anon key is *designed* to be public — it's in the browser on every request. Your data is protected by the Row Level Security rules from the SQL step, which enforce that each logged-in account can only ever touch its own rows. Nobody can read your data with just the anon key; they'd need your account password.

### Part 5 — Use it

1. Open the site. The login screen now says "sign in to sync across devices" and asks for an **email**.
2. First time: click **Create an account**, enter any email and a password (6+ characters).
3. On any other device, open the same URL and log in with the same email and password — your books, calendar, web, notes, profile, and vision-board images will all be there.

A small dot appears top-right: **cyan** = synced, **amber pulsing** = saving, **red** = a sync error (it retries automatically).

### How it works (so nothing surprises you)

- **Local-first.** Your device keeps a full copy in the browser, so the app is instant and works even if your connection drops. Changes are pushed to Supabase in the background a moment after you make them.
- **On login, the app pulls your cloud data down first,** then reloads once so everything shows up. That one automatic reload right after your first login is expected.
- **Last write wins.** If you edit the *same* thing on two devices while both are offline, whichever syncs last wins for that item. For normal one-device-at-a-time use you'll never notice.
- **Free tier limits:** 500 MB database (text — you'd need tens of thousands of entries to approach this) and 1 GB image storage. Vision-board images are compressed on upload, so 1 GB is a lot of pictures.
- **Logging out** signs you out of the account. **Backup / Restore** in settings still works and is a good idea regardless — it's your own offline copy.

### If you skip this

Leave `js/config.js` blank and everything works exactly as before: offline, local-only, `admin` / `Timmyboi1!` login. No Supabase account needed.


---

## The Stacks

A top-down view of a room floor. Every project is a **stack** of books; every book is a step.
The one on top is step one — the framework, the sources, the first draft and the edits are the
books underneath it.

**Moving around the floor**

- Drag anywhere on the floor to walk around.
- Scroll, pinch, or use the `−` / `+` buttons to zoom.
- **Tidy floor** lines every pile up in a grid; **Fit view** frames them all.
- Drag a pile itself to reposition it. A short tap opens it.

**Opening a stack**

Tap a pile and the camera pushes in, the floor tips away, and the stack swings round to a side
elevation: the tower of books down the left, what each one actually *is* written beside it.

- Type into the box at the bottom and press Enter to add a layer. New layers go to the **bottom**
  of the pile — the next thing to do.
- Click the tick to mark a step done (the book goes grey, the progress bar moves).
- `↑` / `↓` reorder a step, `✕` removes it.
- Click the title or any step label to edit it in place. The small line under each label is a
  notes field.
- **Recolour** rerolls the accent; **Delete stack** removes the whole pile.
- `Esc` or the **Floor** button takes you back out.

Spine colours are random, drawn from a warm library palette, and fixed once assigned.

---

## The Board — tabs, endless canvas, group copy/paste

**Tabs.** The strip along the top holds one tab per board. `+` makes a new one, double-click a tab
to rename it, and the `✕` on a tab deletes that board and everything on it. Your existing pictures
land on a tab called **Universal** the first time you open the new version — same positions, same
sizes, same stacking order, nothing moved.

**Endless canvas.** No board has edges any more. Scroll or two-finger drag to pan, `⌘/Ctrl` + scroll
(or pinch) to zoom, hold `Space` and drag to pan with the mouse, and **Fit** frames everything you
have pinned.

**Selecting more than one thing.** Drag a box across empty canvas to lasso, or shift-click to add
things one at a time. `⌘/Ctrl + A` takes the lot. Drag any selected item and the whole selection
moves together.

**Copy and paste with the layout intact.** Select a group, `⌘/Ctrl + C`, then `⌘/Ctrl + V` — the
copies land in exactly the same relative arrangement. This works **across tabs**: copy a cluster on
one board, switch to another, paste, and the arrangement comes with it. `⌘/Ctrl + D` duplicates in
place. Copies of pictures are real copies, so deleting the original leaves the copy alone.

**Pasting several pictures at once.** Paste or drop a batch of images and they arrive in a tidy row
(three per line, all scaled to the same box) instead of scattered at random — then use the **Align**
row to nudge them left / centre / right / top / middle / bottom, or **Row** / **Grid** to lay the
whole selection out evenly.

**Backgrounds.** **Background…** in the toolbar sets the look of the *current* board: a colour or
gradient wash, or upload your own picture (fill / fit / tile, with a dim slider so pinned items stay
readable). **Ruling** switches the grid between graph, dots, lines and plain. **Use this look on
every board** copies the colour and ruling across all tabs — uploaded pictures stay per-board, since
each one is usually the point of that board.

Uploaded backgrounds are compressed and stored the same way vision-board pictures are, so they
sync and appear in backups.

---

## On a phone

The interface reshapes itself under 760px wide:

- The desk becomes a scrollable grid of cards, two across, with the furniture that only reads at
  desktop size (plant, record player, under-desk clutter) hidden.
- The screen strip along the top scrolls sideways and keeps the current screen in view.
- The Web's dossier panel, and the Board's background panel, come up as bottom sheets rather than
  side panels.
- The Calendar's two side strips stack above and below the month grid.
- Canvases (The Board, The Stacks) take one-finger drag to pan and two fingers to zoom, and the
  resize handles are bigger so a thumb can find them.
- Notch and home-bar insets are respected, and the address bar no longer cuts the bottom off —
  the app measures the real viewport rather than trusting `100vh`.

Add it to your home screen (Share → Add to Home Screen) and it opens without Safari's chrome.


---

## Where your data lives

Everything is stored **in your browser, on your machine.**

| What | Where | Size |
|---|---|---|
| Profile, books, calendar, thoughts, the web, stacks, board layouts | `localStorage` | ~5 MB |
| Board pictures, board backgrounds, avatar | `IndexedDB` | hundreds of MB |

**Storage is per browser, per domain.** Chrome and Safari are separate. `localhost` and `os.datamotion.in` are separate.

**"Back up data"** (top bar, 💾 button) downloads one JSON with everything. **Restore** reads it back. Do this regularly and before clearing browser data.

---

## About the login

The login gate is client-side — it keeps casual visitors out but anyone who reads the source code can find the password. This is fine for a personal dashboard.

If you want real password protection later, Vercel supports Edge Middleware with proper authentication. That's a future upgrade, not something to worry about now.

---

## Keyboard shortcuts

| Key | Action |
|---|---|
| `1`–`7` | Jump to a screen |
| `Esc` | Back to desk |
| `Ctrl/⌘ + Enter` | Save a thought (in The Margin) |

On **The Board** specifically:

| Key | Action |
|---|---|
| `⌘/Ctrl + C` / `V` / `X` | Copy / paste / cut the selection — the arrangement is kept |
| `⌘/Ctrl + D` | Duplicate the selection in place |
| `⌘/Ctrl + A` | Select everything on this board |
| `Delete` | Remove the selection |
| Hold `Space` + drag | Pan the canvas (or just scroll / two-finger drag) |
| `⌘/Ctrl` + scroll | Zoom |

---

## The Dashboard (home screen)

Replaces the old row of monitors. It's the life-planner front page:

- **Quick nav** — a card for each of the seven screens below, in place of the old clickable monitors.
- **To-do** — a real task list, backed by the exact same tasks The Calendar uses. Tick something off here and it's ticked off there too (and vice versa). Quick-add at the bottom drops an unscheduled task; anything you date on The Calendar shows up here as well while it's due.
- **This week** — a donut of this week's tasks, done vs open.
- **Activity, last 7 days** — a small bar chart of the same tasks, day by day.
- **Tiles** — books finished, thoughts kept, projects on the go, pictures kept.
- **Upcoming** — the next few dated items from The Calendar.
- **Reading now** — whatever's on The Shelf marked "Reading."
- **From the margin** — your three most recent thoughts/quotes.
- **Projects** — progress bars for your stacks.
- **Gallery strip** — the most recent pictures kept in the Gallery (see below), with a button to open the full thing.

Everything here reads live from the same data the other screens use, so nothing needs re-entering — it just reflects what's already in The Calendar, The Shelf, The Margin, The Stacks, and The Board.

## The Gallery

Every picture you ever pin to The Board — and every picture you set as a board's background — is also copied into the Gallery the moment you add it. The Board itself is meant to be curated (you'll delete and rearrange things there), but the Gallery is append-only: removing a picture from a board does **not** remove it from the Gallery. Open it from the **Gallery** button on the Dashboard. Each picture keeps a small caption (which board it came from, and when), and pictures can only be removed from the Gallery deliberately, from inside the Gallery itself.

## Colour — six palettes, or build your own

Settings still has the original six dark palettes. Underneath them is a **Custom palette** picker: five colour swatches (background, panels, primary accent, secondary accent, text). Pick your five, click **Use this palette**, and the rest of the room — borders, dimmed text, the secondary accents, everything — is derived from those five to stay coherent. It's saved as its own theme and stays selected until you pick something else.

## The seven screens

**The Record** — editable CV. Click any field to change it. Add experience, education, certifications, achievements, skills.

**The Web** — 13 subjects, 78 written connection dossiers (~23,000 words). Click any strand for the full breakdown. Add subjects, add topics, draw your own strands.

**The Shelf** — type a title, it queries Open Library for the cover and paints the spine in the book's real colour. Click a spine to pull it off the shelf.

**The Stacks** — projects as piles of books on a floor, seen from above. See below.

**The Calendar** — square month view. Left strip: view modes and calendars. Right strip: workspace, type and Enter to log, drag onto a day. Import `.ics` from Google Calendar.

**The Margin** — thoughts and quotes. Tag with `#hashtags`. Search. Double-click to edit.

**The Board** — tabbed, endless pinboards. Drag pictures in, paste from the clipboard, add notes, select several at once and move or copy them as a group. See below.
