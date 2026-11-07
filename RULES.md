# RULES.md — MaisonTech

> Project rules. Binding for every session, on every machine.
> Injected automatically by the `project-contract.ts` plugin.
> **Keep under ~120 lines** — it is prompt budget on every request.
> Rules only; current state lives in `HANDOFF.md`.
> Last reviewed: 2026-11-07

## What this project is

Demo e-commerce of household appliances ("MaisonTech"), French UI, prices in TND.
Live at `https://modali.powerpme.com/maisontech` (Dali's own VPS, Apache reverse proxy).
Repo: `DALI951/maisontech`. **Everything is simulated**: no real payment, no real order, no real data.

## Stack

- Next.js **16.4.3** App Router, React **19.3.1**, TypeScript 5.9 (strict), Tailwind **4.3.3**, ESLint 9 flat config.
- Data: single JSON file via `src/lib/db.ts` (`.data/maisontech-db.json`, gitignored), seeded from `src/data/seed.ts`.
- Auth: `scrypt` (`src/lib/password.ts`), DB sessions, `HttpOnly` cookie `mt_session`, `requireAdmin()` / `requireUser()`.
- Tests: `node --test` (HTTP journeys) + Playwright (browser E2E, local and live).

## Commands (exact)

| Purpose | Command | Dir |
|---|---|---|
| install | `npm install` | `C:\Users\dali\Projects\maisontech` |
| dev | `npm run dev` (`:3000`) | same |
| build / run | `npm run build` then `npm run start` (`:3000`) | same |
| typecheck | `npm run typecheck` | same |
| lint | `npm run lint` | same |
| journey tests | `npm test` | same |
| E2E (local, own server on `:3021`) | `npm run test:e2e` | same |
| E2E (live deploy) | `$env:PLAYWRIGHT_LIVE_URL="https://modali.powerpme.com/maisontech"; npx playwright test --config=playwright.live.config.ts` | same |
| full battery | `npm run battery` | same |

## Conventions

- **UI copy is French**, code/comments/commits in English. Prices always through the TND formatter (`src/lib/format.ts`), never hand-written.
- Server Components by default; `"use client"` only for state, effects or browser APIs.
- Every client `fetch("/api/…")` must go through `api()` from `src/lib/base-path.ts` (sub-path deploy).
- New catalog data goes in `src/data/` (one file per category, registered in `src/data/products/index.ts`), never inline in components.
- Money/stock/order mutations go through `src/lib/db.ts` helpers, not direct file writes.
- Visuals are local vector illustrations (`product-visual.tsx`); no remote images unless `next.config.ts` whitelists the host.

## Do NOT

- **Never** store or log plaintext passwords; never weaken to client-side-only auth checks.
- **Never** enable `trailingSlash` with `basePath` — it loops with Apache's `mod_dir` redirect (cost a long debug session).
- **Never** commit `.data/`, `.next/`, `test-results/`, `tests/.artifacts/`, or `.env*.local`.
- Never claim a real payment/order happened in UI text — it must read as simulation.
- Never add a dependency unless it earns its place; no UI kit, no ORM, no state library.
- Never `git push --force` on `main`; never delete `.data/maisontech-db.json` on the server without telling Dali (it holds the demo orders).
- Never kill server processes not owned by `www-data`, and never use `pkill -f 'start.sh'` / `'bin/next start'` (they match the invoking shell — use `'bash star[t]'` / `'next-serv[e]r'`).

## Deploy facts (needed to touch production)

- Code dir on the VPS: `/var/www/modali/public_html/uploads/maisontech` (owned `www-data`).
- Process: `bash start.sh` → infinite loop `next start -p 3187 -H 127.0.0.1`; log `run.log`.
- Proxy: managed block in `/var/www/modali/public_html/.htaccess` (backup `.htaccess.bak-2026-11-07`). Root path is proxied **without** trailing slash.
- Build env: `NEXT_BASE_PATH` + `NEXT_PUBLIC_BASE_PATH=/maisontech`, `NEXT_PUBLIC_SITE_URL=https://modali.powerpme.com/maisontech`, `NEXT_ACTION_ORIGINS=modali.powerpme.com`.
- Remote shell over SFTP is impossible; the only exec path is a temporary PHP endpoint (delete it after use). `npm` as `www-data` needs `HOME=/tmp npm_config_cache=/tmp/mt-npm-cache`.
- No `cron`, no `root`: the process survives session end but not a VPS reboot — relaunch `start.sh` by hand.
- Full procedure: README → "Déploiement".

## Decisions (append-only)

- 2026-10-26 — Next.js + file-backed JSON DB instead of a real DB — zero infrastructure, fully inspectable demo data.
- 2026-10-26 — Deployed on Dali's VPS under `/maisontech` (not a PaaS) — his own server, no card, no cold starts. Cost: `basePath` complexity.
- 2026-11-07 — `api()` helper + codemod of 33 fetch sites — sub-path deploy would 404 every client call otherwise.
- 2026-11-07 — `trailingSlash` stays **off**; the Apache block maps `^maisontech/?$` → `/maisontech` — avoids redirect loop.
- 2026-11-07 — Playwright live spec uses a `url()` helper instead of `page.goto("/path")` — a leading slash resolves against the domain root and silently drops `/maisontech`.

## Open questions for Dali

- [ ] Keep `Dockerfile` / `render.yaml` (unused PaaS fallback) or delete them?
