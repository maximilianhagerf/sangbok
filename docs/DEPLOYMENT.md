# Deployment

## Infrastructure

| Component | Details |
|-----------|---------|
| Server | Hetzner VPS (ubuntu-8gb-hel1-1) |
| PaaS | Dokploy v0.28.5 |
| Reverse proxy | Traefik v3.6.7 (managed by Dokploy) |
| DNS / CDN | Cloudflare |
| VPN (admin access) | Tailscale |

### DNS setup

| Record | Target | Access |
|--------|--------|--------|
| `dokploy.hagerf.se` | Tailscale IP (Hetzner) | Private — only Tailscale devices |
| `sangbok.hagerf.se` | Hetzner public IP | Public |

Traffic flow:
```
Browser → Cloudflare DNS → Hetzner public IP
→ Traefik (port 80/443) → sangbok container (port 3001 internally)
```

The port mapping `3001:3001` in `docker-compose.yml` is for local dev only. In production, Traefik routes by hostname — port 3001 does not need to be open in the Hetzner firewall.

---

## Docker

### Build

```bash
docker compose build
```

**Multi-stage Dockerfile:**
1. **builder** (node:20-alpine) — installs client deps, runs `vite build`, produces `client/dist/`
2. **runner** (node:20-alpine) — installs server prod deps, copies `server/src/` + built `client/dist/`, starts with `tsx`

### Run locally

```bash
docker compose up -d
# app available at http://localhost:3001
```

If port 3001 is already in use (e.g. dev server running):
```bash
docker run -p 3002:3001 -v sangbok_db-data:/app/server/data sangbok-app
```

### SQLite persistence

The DB lives in a named Docker volume:
```
sangbok-frontend-mintup_db-data   (Dokploy naming convention)
```
Mounted at `/app/server/data` inside the container. Survives container restarts and redeploys.

---

## Dokploy setup

1. Push repo to Git
2. Dokploy → **New Application** → Docker Compose
3. Point to repo, set compose file: `docker-compose.yml`
4. **Domains tab** → add `sangbok.hagerf.se` → Traefik handles routing + Let's Encrypt cert automatically

No extra environment variables needed — `PORT` and `NODE_ENV` are defined in `docker-compose.yml`.

---

## Migrating the local database to production

Stop the container first (SQLite WAL mode keeps sidecar files that must be consistent):

```bash
# On the server
docker stop sangbok-frontend-mintup-app-1
```

Copy the local DB:
```bash
# On your local machine
scp /path/to/sangbok/server/data/sangbok.db root@<hetzner-ip>:/tmp/sangbok.db
```

Load it into the volume:
```bash
# On the server
docker run --rm \
  -v sangbok-frontend-mintup_db-data:/data \
  -v /tmp:/tmp \
  alpine sh -c 'cp /tmp/sangbok.db /data/sangbok.db && rm -f /data/sangbok.db-wal /data/sangbok.db-shm'
```

Restart:
```bash
docker start sangbok-frontend-mintup-app-1
```

---

## Useful server commands

```bash
# See running containers
docker ps

# See all volumes
docker volume ls | grep sangbok

# Tail logs
docker logs sangbok-frontend-mintup-app-1 -f

# Open a shell in the container
docker exec -it sangbok-frontend-mintup-app-1 sh

# Inspect the DB directly
docker run --rm -v sangbok-frontend-mintup_db-data:/data alpine ls -lh /data/
```

---

## Recovery: locked out / lost data

If the DB is corrupted or needs resetting:
```bash
docker run --rm -v sangbok-frontend-mintup_db-data:/data alpine rm /data/sangbok.db
docker restart sangbok-frontend-mintup-app-1
# Server will recreate the DB schema on next start
```
