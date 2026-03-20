# Architecture

## Overview

Monorepo with two packages: `server/` (Express API) and `client/` (React SPA). In production, Express serves the built React app as static files — one container, one process.

```
sangbok/
├── server/          Express API + SQLite
├── client/          React SPA (Vite)
├── Dockerfile       Multi-stage build
├── docker-compose.yml
└── biome.json       Shared linter/formatter config
```

---

## Server

**Entry:** `server/src/index.ts`
**Runtime:** `tsx` (runs TypeScript directly, no compile step)
**Port:** `process.env.PORT || 3001`

### Routes

| Mount | File | Description |
|-------|------|-------------|
| `/api/collections` | `routes/collections.ts` | Collection CRUD |
| `/api/songs` | `routes/songs.ts` | Song + section CRUD, reorder |
| `/api/sections` | `routes/sections.ts` | Section update/delete |
| `/api/settings` | `routes/settings.ts` | Cover page settings per collection |

After API routes, Express serves `client/dist/` as static files, with a catch-all that returns `index.html` for React Router.

### Database

**File:** `server/src/db.ts`
**Location:** `server/data/sangbok.db`
**Engine:** better-sqlite3 (synchronous, no connection pool needed)
**Modes:** WAL journal, foreign keys enabled

#### Schema

```sql
collections (id, name, position)

songs (
  id, position, title, credit, original,
  columns INTEGER (1|2|3),
  collection_id → collections.id
)

sections (
  id, song_id → songs.id (CASCADE DELETE),
  position, label, content,
  chords TEXT  -- JSON: [{line: number, chord: string}]
)

settings (
  collection_id → collections.id,
  key TEXT,
  value TEXT,
  PRIMARY KEY (collection_id, key)
  -- keys: cover_title, cover_subtitle, cover_credit
)
```

Migrations run on startup via `PRAGMA table_info()` checks — safe to restart at any time.

### Collections query (enriched)

```sql
SELECT c.*,
  (SELECT COUNT(*) FROM songs WHERE collection_id = c.id) AS song_count,
  (SELECT value FROM settings WHERE collection_id = c.id AND key = 'cover_title') AS cover_title
FROM collections c ORDER BY c.position
```

---

## Client

**Entry:** `client/src/main.tsx`
**Build:** `tsc && vite build` → `client/dist/`
**Styling:** Tailwind CSS v4 (via `@tailwindcss/vite` plugin, no config file needed)

### Routing (`App.tsx`)

```
/           → SongList     (main CMS)
/songs/:id  → SongEdit     (song editor)
/print      → PrintView    (print/PDF preview)
```

### State management

No external state library. State lives in `useCollection` hook (`hooks/useCollection.ts`), which is consumed by `SongList`. It manages:

- `collections` — all collections
- `activeCollectionId` — persisted to `localStorage` key `sangbok_collection`
- `songs` — songs in the active collection
- `settings` — cover settings for the active collection
- All CRUD methods (create/rename/delete collection, setSongs, setSettings)

### API layer (`api.ts`)

Central `request<T>()` function handles all fetch calls with JSON headers. All API functions are typed. HTTP 204 → `undefined`. Non-ok responses throw `Error` with the server's error message.

### Component map

```
pages/
  SongList.tsx          Main view: sidebar + song grid + modals
  SongEdit.tsx          Song metadata + section editor
  PrintView.tsx         Print layout selector + preview

components/
  SangbokLogo.tsx       SVG wordmark with quarter-note motif (DM Serif Display)
  LanguageSwitcher.tsx  EN/SV/ES toggle (shared between SongList + PrintView)

  collections/
    CollectionSidebar.tsx   Cards per collection, inline rename, delete, create

  songs/
    SongRow.tsx           Draggable song card with round checkbox, drag handle
    NewSongModal.tsx      Create song modal
    BulkBar.tsx           Floating bar when songs are selected (bulk delete)

  settings/
    CoverSettingsPanel.tsx  Modal: edit cover_title, cover_subtitle, cover_credit

  print/
    Cover.tsx             Rendered cover page
    SongPage.tsx          Full-page song layout
    SongBlock.tsx         Song content block (lyrics + chords)
    SongCard.tsx          Compact card layout
    CardSheet.tsx         Sheet of song cards
    StyleSwitcher.tsx     Toggle between print styles
    PresetPanel.tsx       Print preset selector

hooks/
  useCollection.ts      Global app state + API orchestration
```

### Drag and drop

Uses `@dnd-kit` with `rectSortingStrategy` (supports 2D grid layouts).
`PointerSensor` has `activationConstraint: { distance: 6 }` so clicks (for selection toggle) don't accidentally start drags.
Drag is always enabled — selection mode and drag coexist.

### Layout constraints

`SongList` uses `h-screen overflow-hidden` at the root with `overflow-y-auto` only on the song list div — this keeps the sidebar and header fixed while only the song list scrolls.

Song grid uses Tailwind container queries (`@container`, `@6xl:grid-cols-2`) for responsive 1→2 column layout. `gap-x-8` (32px) prevents the absolute-positioned checkbox from bleeding into the adjacent column.

### i18n

Translation files: `client/src/locales/{en,sv,es}/translation.json`
Language is auto-detected from the browser. `LanguageSwitcher` changes it on demand.

### Fonts

Loaded via Google Fonts in `index.html`:
- **DM Serif Display** — logo wordmark
- **Cormorant Garamond** — song titles, headings
- **EB Garamond** — body text / print view
- **Geist** — UI labels
