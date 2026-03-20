# AI Context — Sangbok

This file is for AI assistants (Claude, Copilot, etc.) working on this codebase. Read it before making changes.

---

## What this project is

A self-hosted personal songbook CMS. One user (Max), Swedish family context, deployed on Hetzner via Dokploy. The app manages song collections with lyrics and chord annotations, and produces a print-ready PDF output.

---

## Conventions and rules

### Always run Biome before finishing
```bash
npx biome check <file>          # check one file
npx biome check --write <file>  # auto-fix
cd /path/to/sangbok && npm run check  # whole project
```
Biome handles both linting AND formatting. Never submit code with biome errors.

### One commit per session
Don't split commits by file type or feature sub-part. One session = one commit.

### Don't browse files unprompted
If acting as a chatbot/advisor, don't go reading files unless the user explicitly points you at a task. Ask first.

---

## Tech decisions to preserve

| Decision | Reason |
|----------|--------|
| `tsx` at runtime (no tsc compile) | Simpler deploy, no build step for server |
| `better-sqlite3` (sync) | Simpler code, no async DB calls needed |
| No ORM | Direct parameterised SQL, easy to read and debug |
| No state management library | `useCollection` hook is sufficient for one-page app |
| Tailwind v4 | No config file — uses `@tailwindcss/vite` plugin directly |
| `rectSortingStrategy` for DnD | Needed for 2D grid layouts (not vertical-only) |
| `PointerSensor activationConstraint: { distance: 6 }` | Allows click-to-select AND drag simultaneously |
| `express-session` MemoryStore | Sessions lost on restart is acceptable for personal app |

---

## Things that will break if you change them

- **`h-screen overflow-hidden` on SongList root** — removing this breaks the fixed sidebar/header layout; only the song list should scroll
- **`gap-x-8` on the song grid** — smaller gaps cause the absolute-positioned checkbox (conceptually at `-left-6`) to bleed into adjacent columns
- **Always-rendered credit `<p>` with `h-4`** in `SongRow` — keeps grid row heights uniform; removing the fixed height causes vertical jitter
- **Route order in `server/src/index.ts`** — API routes must be mounted before the static file catch-all, or `index.html` gets served for API calls
- **`CHECK (id = 1)` on `auth` table** — enforces single-row for TOTP secret; don't add more rows
- **Biome-ignore comments must be `//` line comments** before the JSX element, not `{/* */}` inside JSX — the latter gets treated as JSX children and breaks compilation

---

## Planned but not yet built

- **TOTP-only authentication** — plan exists, not implemented. The plan uses `otplib`, `express-session`, `qrcode`. Route order: auth router public, then `requireAuth` middleware before all other API routes. Single-row `auth` table in SQLite.

---

## File map (quick reference)

```
server/src/
  index.ts          Entry point, route mounting, static file serving
  db.ts             Schema, migrations, DB instance
  routes/
    collections.ts  Collection CRUD (with song_count + cover_title in GET)
    songs.ts        Song + section CRUD + reorder
    sections.ts     Section update/delete
    settings.ts     Cover page settings (key-value per collection)

client/src/
  App.tsx           Router only — 3 routes
  api.ts            All fetch calls, typed, central request() function
  types.ts          Collection, Song, Section, Settings, ChordMark
  hooks/
    useCollection.ts  All app state + API orchestration
  pages/
    SongList.tsx    Main view (sidebar + grid + modals)
    SongEdit.tsx    Song editor
    PrintView.tsx   Print/PDF preview
  components/
    SangbokLogo.tsx           SVG logo (inline, uses DM Serif Display)
    LanguageSwitcher.tsx      EN/SV/ES toggle
    collections/
      CollectionSidebar.tsx   Collection nav cards
    songs/
      SongRow.tsx             Draggable song card
      NewSongModal.tsx        Create song
      BulkBar.tsx             Bulk action bar
    settings/
      CoverSettingsPanel.tsx  Cover settings modal
    print/                    Print layout components
```

---

## Data model relationships

```
Collection (1) ──< Song (many)
Song (1) ──< Section (many)
Section.chords: JSON [{line, chord}]
Collection (1) ──< Settings (key-value pairs)
  keys: cover_title (required), cover_subtitle, cover_credit
```

---

## Deployment summary

- Docker Compose → Dokploy on Hetzner
- SQLite in a named volume (`sangbok-frontend-mintup_db-data`)
- Traefik handles `sangbok.hagerf.se` → container
- `dokploy.hagerf.se` is Tailscale-only (private admin)
- See `docs/DEPLOYMENT.md` for full ops guide

---

## Design system

- **Primary palette:** stone (Tailwind) — stone-800 for active/primary, stone-200 for borders, stone-50 for backgrounds
- **Logo font:** DM Serif Display (friendly, editorial)
- **Headings / song titles:** Cormorant Garamond (refined)
- **Print body:** EB Garamond
- **UI labels:** Geist
- **Accent for destructive:** rose-500
- No gradients, no shadows except subtle `shadow-sm`
- Checkboxes are custom round (label + hidden input + styled span)
- Biome-ignore suppression rule for `role="button"` on divs: `lint/a11y/useSemanticElements`

---

## How to run locally

```bash
npm install && cd client && npm install && cd ../server && npm install && cd ..
npm run dev        # server :3001 + client :5173
```

Access the app at `http://localhost:5173`. The Vite dev server proxies `/api/*` to port 3001.
