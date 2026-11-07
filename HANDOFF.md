# HANDOFF.md — MaisonTech

> Current state of the work, for whoever picks this up next.
> Rewritten, not appended. If nothing is pending, say `Nothing pending.`

Last updated: 2026-11-07 02:05 by: opencode session (Dali's PC)

## Done (last session)

- **Deployed to production**: `https://modali.powerpme.com/maisontech` — Next.js 16 running on the VPS (`127.0.0.1:3187`), Apache reverse-proxying under the `/maisontech` sub-path.
- Sub-path support added: `basePath`/`assetPrefix` from `NEXT_BASE_PATH`, `src/lib/base-path.ts` (`BASE_PATH`, `api()`, `appUrl()`), 33 `fetch("/api/…")` call sites codemodded across 21 files, `NEXT_ACTION_ORIGINS` for Server Actions behind the proxy.
- Apache `mod_dir` ⇄ Next trailing-slash redirect loop diagnosed and fixed by keeping `trailingSlash` off and proxying `^maisontech/?$` → `/maisontech`.
- Verified live over HTTPS: home, `/produits`, `/categorie/*`, `/produit/*`, `/marques/*`, `/panier`, `/admin/connexion`, `/sitemap.xml`, CSS+JS assets → 200; `POST /api/newsletter` 201; admin login 200 + session; `/admin` and `/admin/produits` render with session; `POST /api/cart` 200; `GET /api/search?q=cafe` 200.
- Test suites all green: journey **16/16**, local Playwright E2E **19/19**, live Playwright smoke **3/3** (`tests/live/live.spec.ts`).
- Lint: 0 errors, 9 warnings (pre-existing `react-hooks/set-state-in-effect` etc.).
- Server-side deploy helpers removed: probe PHP, source tarball, `/public_html/mt-proxy-test/`, `/tmp/echo.js`, `/tmp/mini.js`.

## In progress (unfinished, do not assume it works)

- Nothing half-done in the code. One leftover on the server (see Next step).

## Next step (do this first next time)

1. Delete the temporary remote-shell endpoint on the VPS: `https://modali.powerpme.com/mt-exec-d1d9e43930a9.php` (file `/public_html/mt-exec-d1d9e43930a9.php`, owned by SFTP user `modali`, so it must be removed **over SFTP**, not as `www-data`). It accepts arbitrary commands with header `X-MT-KEY` — leaving it is a security hole.

## Blocked / needs Dali

- None blocking. Two optional decisions: keep or delete the unused `Dockerfile` / `render.yaml`; whether to add a reboot-proof auto-start for the Node service (needs root or a `cron @reboot` the `modali` account cannot install).

## Environment notes

- Local: `C:\Users\dali\Projects\maisontech`, Windows 10, PowerShell 5.1, Node 24. Git remote `origin` → `https://github.com/DALI951/maisontech` (public, `main`).
- Server: Ubuntu VPS `212.227.215.235`, Apache 2.4.58, Node **v26.12.1**, npm 11.20.0, SFTP-only SSH (no shell). Creds in env `CHESS_SFTP_HOST` / `CHESS_SFTP_USER` / `CHESS_SFTP_PASS`.
- App path `/var/www/modali/public_html/uploads/maisontech` (`uploads/` is 777, `public_html/` is not writable by `www-data` — that is why it lives there).
- Port **3187**, loop-restarting `start.sh`, log at `run.log`. Demo DB at `.data/maisontech-db.json` (72 products, 12 categories, 10 brands, 34 orders, 180 reviews).
- The box also runs PostgreSQL, MySQL, Redis, n8n and another user's `start.sh` (root PID 3555) — do not touch those.

## Watch out

- `page.goto("/produits")` **drops the base path** in Playwright — always go through the `url()` helper in `tests/live/live.spec.ts`.
- Do not re-enable `trailingSlash` with `basePath`; it fights Apache's `mod_dir` and produces an infinite redirect.
- Rebuilding on the server: `HOME=/tmp npm_config_cache=/tmp/mt-npm-cache` or `npm` dies with `EACCES /var/www/.npm`.
- PowerShell expands `$VAR` inside double-quoted strings sent to the remote endpoint — build remote commands with single quotes.
- `pkill -f 'start.sh'` kills the calling shell; use `pkill -f 'bash star[t]'` / `pkill -f 'next-serv[e]r'`.
- `GET /api/settings` answers 405 by design (no GET handler) — not a deployment fault.
