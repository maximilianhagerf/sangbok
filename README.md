# Sangbok

A personal songbook CMS for managing, editing, and printing song collections. Built as a self-hosted full-stack TypeScript app — monorepo with an Express API and a React frontend.

**Live:** `sangbok.hagerf.se` · **CMS:** `dokploy.hagerf.se` (Tailscale-only)

---

## What it does

- Manage multiple **collections** (songbooks), each with its own cover settings
- Add, edit, and reorder **songs** with lyrics divided into **sections**
- Annotate sections with **chord marks** per line
- **Drag-and-drop** reordering of songs and sections
- **Bulk select** and delete songs
- **Print view** with multiple layout presets and styles, optimised for A4
- **Multilingual UI** (Swedish, English, Spanish) with auto-detection
- Runs entirely **self-hosted** on a single SQLite file

---

## Stack

| Layer | Tech |
|-------|------|
| Server | Express 4 + TypeScript (tsx) |
| Database | SQLite via better-sqlite3 |
| Client | React 19 + Vite + Tailwind CSS v4 |
| Drag & drop | @dnd-kit |
| i18n | i18next + react-i18next |
| Linting | Biome |
| Deploy | Docker → Dokploy on Hetzner |

---

## Local development

```bash
npm install           # install root dev deps (biome, concurrently)
cd client && npm install
cd ../server && npm install

npm run dev           # starts server (:3001) + client (:5173) concurrently
```

Client proxies `/api/*` to `localhost:3001` via Vite config — no CORS setup needed.

---

## Code quality

```bash
npm run check         # biome lint + format (auto-fix)
npm run lint          # lint only
npm run format        # format only
```

Always run `npm run check` before finishing a task.

---

## Deployment

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for the full Dokploy + Docker guide.

```bash
docker compose build
docker compose up -d
```

---

## Project docs

| File | Contents |
|------|---------|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Full system design, data model, component map |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Docker, Dokploy, Cloudflare, DB migration |
| [`docs/AI_CONTEXT.md`](docs/AI_CONTEXT.md) | Guide for AI assistants working on this project |
