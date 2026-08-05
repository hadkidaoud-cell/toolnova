# AGENTS.md

Operating notes for AI agents working in the ToolNova monorepo.

## Project Overview

- Monorepo: pnpm workspaces + Turborepo.
- Apps: `apps/web` (Next.js 15, tool catalog), `apps/admin` (Next.js 15, management dashboard), `apps/api` (NestJS).
- Packages: `database` (Prisma), `auth`, `core`, `ui`, `utils`, `types`, `config`, `seo`, `analytics`, `tools`.
- Database is **SQLite** via Prisma (shared file `packages/database/prisma/dev.db`), despite the stale README claiming PostgreSQL.
- Testing is **vitest** (not Jest), despite the stale README.

## Environment / Ports

| App | Dev | Prod |
|-----|-----|------|
| web | `http://localhost:3000` | `http://localhost:3100` (`pnpm --filter @toolnova/web start`) |
| admin | `http://localhost:3001` | `http://localhost:3001` |

- Starting **web** or **admin** in **production** requires `AUTH_TRUST_HOST=true`, otherwise the NextAuth routes (`/api/auth/*`, login) fail with `UntrustedHost`:
  `$env:AUTH_TRUST_HOST="true"; pnpm --filter @toolnova/web start --port 3100`
  `$env:AUTH_TRUST_HOST="true"; pnpm --filter @toolnova/admin start --port 3001`
- Do NOT export a `DATABASE_URL` process override when starting prod servers — the `.env.local` files already set the correct absolute path; an overriding (e.g. quoted) value silently breaks prisma while DB fallbacks mask it.
- Admin test login: `admin@toolnova.com` / `admin123`.

## Environment Files (critical)

- `apps/admin/.env` is **tracked** — do NOT edit it. Admin reads real values from `apps/admin/.env.local` (untracked).
- `apps/web/.env.local` holds the absolute `DATABASE_URL` for the web app; it must point at the same SQLite file so web reads the shared DB.
- `packages/database/.env` sets `DATABASE_URL` for prisma CLI (generate/push/seed).
- Env keys used: `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_API_URL`, plus optional Stripe keys (`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_PRICE_ID`, `STRIPE_ENTERPRISE_PRICE_ID`).

## Commands

Run package-scoped commands with `pnpm --filter @toolnova/<pkg> <script>` or inside the app dir with `pnpm.cmd <script>`.

- Dev all: `pnpm dev` (turbo). Single apps: `pnpm --filter @toolnova/web dev`, `pnpm --filter @toolnova/admin dev`.
- Typecheck: `pnpm --filter @toolnova/admin typecheck`, `pnpm --filter @toolnova/web typecheck` (each runs `tsc --noEmit`; both should be clean).
- Tests: `pnpm --filter @toolnova/admin test` / `@toolnova/web test` (vitest run). Root `pnpm test` runs both via turbo.
- DB: `pnpm db:generate`, `pnpm db:push`, `pnpm db:seed` (turbo). Alternatively run prisma directly in `packages/database`.

### Windows/PowerShell notes

- Use `pnpm.cmd` / `npx.cmd` in PowerShell.
- Running servers hold a lock on `query_engine-windows.dll.node`; stop node servers before `prisma generate` to avoid lock errors.
- Do not `cd` in shell commands; use the `workdir` parameter.

## Architecture Notes

### Tool pages (web)

- 58 static tool pages under `apps/web/src/app/tools/<slug>/` are **fully implemented** and take precedence over the dynamic route.
- `apps/web/src/app/tools/[slug]/page.tsx` renders DB tools via `components/tool/db-tool-page.tsx`; it shows a **comingSoon** panel only for DB-added tools without a static page. This is expected behavior — do not treat it as a bug.
- `components/tools/tools-browser.tsx` lists published DB tools via `lib/db-tools.ts` (`getDbPublishedTools`).
- `components/home/home-page.tsx` (client) + `app/page.tsx` (server wrapper) render `featured` DB tools.

### Usage tracking

- `components/tool/tool-view-tracker.tsx` (mounted inside `ToolLayout` and `db-tool-page`) POSTs once per page to `api/tools/[slug]/view` (route `apps/web/src/app/api/tools/[slug]/view/route.ts`).
- The route increments `Tool.views` and creates a `ToolUsage` row (ip, userAgent, referer, optional userId). It returns 404 for unpublished/missing tools and is fail-safe (errors are ignored client-side).

### Admin

- Auth: `apps/admin/src/lib/auth.ts` (NextAuth credentials via `createAuthConfig` from `@toolnova/auth`). `requireAdmin()` gates every `"use server"` action; `src/middleware.ts` protects pages and redirects anonymous users to `/login` with a callback URL.
- Only `ADMIN`/`MODERATOR` users can log in; only `ADMIN` can change roles or delete users.
- Backups: `lib/backup-store.ts` resolves the SQLite path from `DATABASE_URL` and stores copies in `<db-dir>/backups/`. `restoreBackup(id)` replaces the live DB file and fails with a clear error if the file is locked by a running server (stop servers first, then retry).
- Pages: dashboard, analytics, logs, users, tools, categories, settings, seo, profile, backups.

### Database schema highlights

- `User` (role: ADMIN/USER/MODERATOR, status: ACTIVE/INACTIVE/BANNED), `Tool` (status, views, featured, metadata JSON string), `Category` (toolCount), `ToolUsage`, `ActivityLog`, `Backup`, `Setting`, `Subscription`.
- Seed data: `packages/database/src/seeds/index.ts` (10 categories, 10 tools, admin user). Admin catalog sync (`syncCatalog` in `lib/admin-actions.ts`) upserts the 60-tool seed from `lib/tool-seed.ts`.

## Testing

- vitest configs: `apps/web/vitest.config.ts`, `apps/admin/vitest.config.ts` (globals enabled, node env, `@` alias → `src`).
- Web tests: `apps/web/src/__tests__/*.test.ts` (tool engines, home, PDF/image utils). Admin tests: `apps/admin/src/__tests__/` (`backup-store`, `catalog-seeds`).
- `pnpm test` at root runs turbo `test` across packages that define the script.

## Gotchas

- Do not add comments to code unless asked.
- Never commit secrets; `.env.local` files are untracked.
- `apps/api` and `packages/core` are largely legacy/unused by the admin+web work in progress.
