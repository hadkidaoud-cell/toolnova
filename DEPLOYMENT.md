# ToolNova Deployment

Deployment files for a single-VPS Docker setup: `web`, `admin`, `Caddy` (HTTPS) and optional `Litestream` (continuous DB backup). Both apps share one SQLite file mounted from `./data`.

## Requirements

- A VPS (~1 GB RAM) with **Docker** and the **Compose v2** plugin.
- A domain with DNS access (optional at first — you can start over the IP).

## 1. Get the code on the server

```bash
git clone https://github.com/hadkidaoud-cell/toolnova.git
cd toolnova
```

## 2. Environment

```bash
cp .env.example .env
```

Edit `.env`:
- `PUBLIC_APP_URL` — your public domain (no trailing slash).
- `WEB_AUTH_SECRET` / `ADMIN_AUTH_SECRET` — random values, e.g.
  `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.

## 3. Database — first run

**Recommended: bring the existing database** (it already has the admin user and seed data):

```bash
mkdir -p data
cp packages/database/prisma/dev.db data/dev.db
```

**Fresh install alternative** (empty DB, no admin user yet):

```bash
docker compose build
docker compose run --rm admin sh -c "node node_modules/.bin/prisma db push --schema /app/packages/database/prisma/schema.prisma"
docker compose run --rm admin sh -c "DATABASE_URL=file:/data/dev.db node -r tsx scripts/seed-db.ts"
```

## 4. Build and start

```bash
docker compose build
docker compose up -d
```

Verify:
- `http://<server-ip>:3100` — web
- `http://<server-ip>:3001` — admin login (`admin@toolnova.com` / `admin123`, change it after first login)

## 5. Domain + HTTPS

1. Point DNS A records at the server IP: `toolnova.com` + `www` → web, `admin.toolnova.com` → admin.
2. Replace the placeholder domains in `Caddyfile` with your real ones.
3. Restart Caddy so it issues Let's Encrypt certificates automatically:

```bash
docker compose restart caddy
```

## 6. Backups

- **Continuous (recommended):** fill `LITESTREAM_BUCKET/ENDPOINT/ACCESS_KEY_ID/SECRET_ACCESS_KEY` in `.env`, then:

  ```bash
  docker compose --profile backup up -d
  ```

- **Restore a backup:**

  ```bash
  docker compose run --rm litestream restore -if-db-not-exists /data/dev.db
  docker compose restart web admin
  ```

- The admin **Backups** page also offers manual backup/restore of the same SQLite file (stop the containers if you restore while they are running).

## Updates

```bash
git pull && docker compose build && docker compose up -d
```

## Troubleshooting

- **NextAuth `UntrustedHost`:** `AUTH_TRUST_HOST=true` is already set in `docker-compose.yml`.
- **Login fails:** confirm `AUTH_SECRET` is set and `/data/dev.db` contains the admin user (seed it if you started fresh).
- **SQLite locked on restore:** stop `web` and `admin` first.
- **Caddy certificate errors:** expected until your domain's A records actually point at the server.
