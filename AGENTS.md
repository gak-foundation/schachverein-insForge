# AGENTS.md

Project-specific rules for OpenCode. See also [CLAUDE.md](./CLAUDE.md) for behavioral guidelines.

## Commands

| Task | Command |
|---|---|
| Dev server | `npm run dev` |
| Build (incl. prod migrate script) | `npm run build && npm run build:migrate` |
| Lint | `npm run lint` |
| Unit tests | `npm run test` (watch) / `npm run test:ci` (single run) |
| E2E tests | `npm run test:e2e` (starts dev server automatically) |
| DB push (dev) | `npm run db:push` |
| DB migrations (prod) | `npm run db:generate` then `npm run prod:migrate` |
| DB seed | `npm run db:seed` |
| Docker (Redis for jobs) | `npm run docker:up` |
| TypeScript check | `npx tsc --noEmit` |

## Architecture

- **Framework**: Next.js 16.2 (App Router), `output: "standalone"`
- **Auth**: Supabase Auth via `@supabase/ssr` (3 client types: browser, server, service-role)
- **DB**: PostgreSQL via Drizzle ORM. Connection prefers `DIRECT_URL` (non-pooled) over `DATABASE_URL`
- **Styling**: Tailwind CSS v4 with `@tailwindcss/postcss` (PostCSS plugin, no `tailwind.config`)
- **UI**: shadcn/ui (base-nova style), Lucide icons, Radix primitives
- **Path alias**: `@/` → `./src/`

## Route Architecture (Critical)

`src/proxy.ts` is the Next.js middleware. It implements multi-tenant routing:

- **Root domain** (`schach.studio`) → serves `(marketing)` and `(admin)` route groups
- **Subdomains** (`{club-slug}.schach.studio`) → serve `(tenant)` route group, inject `x-club-slug` header
- **app.schach.studio** → served as tenant subdomain

When adding routes, update `marketingRoutes`, `adminRoutes`, or `tenantAppRoutes` in `src/proxy.ts:9-30`.

## Multi-Tenant Pattern

Subdomain routing injects `x-club-slug` header via middleware. Server components in `(tenant)` resolve the club from that header. Do NOT query the club directly in shared layout — use the club context from `@/lib/club-context`.

## Database Quirks

- **HMR singleton** (`src/lib/db/index.ts:17-42`): The DB client lives on `globalThis` to survive Next.js HMR. Without this, each hot reload creates a new pool, exhausting Supabase pooler connections.
- **Prepared statements**: Disabled when using Supabase pooler (`prepare: false`), enabled otherwise.
- **Schema**: Flat barrel export at `src/lib/db/schema/index.ts` — 17 schema files. Add new tables there.

## Encryption (Mandatory)

- IBAN and BIC stored in DB MUST be encrypted via `@/lib/crypto` (`encrypt()`/`decrypt()`)
- `ENCRYPTION_KEY` is a 64-char hex string (32 bytes). Generate with `openssl rand -hex 32`
- Never store IBANs in plaintext. `maskIban()` for display.

## Environment

- `.env.local` takes precedence over `.env` (loaded in `drizzle.config.ts` and `src/env.ts`)
- CI (GitHub Actions) uses placeholder env values — real Supabase credentials never needed for lint/unit-test/build
- E2E tests need a real Postgres (CI provides via service container)

## Testing

- **Vitest** for unit tests. Test files: `*.test.ts`. Setup mocks `@/lib/db`, `next/headers`, `next/cache`, `@/lib/auth/session`, `@/lib/audit` at module level.
- **Playwright** for E2E. Tests in `e2e/`. Auto-starts dev server on `127.0.0.1:3000`.
- **Pre-commit** hook runs `npm test` (vitest). Commits block on test failure.

## Docker / Production

- Build runs `npm run build:migrate` (esbuild bundles `src/lib/db/migrate.ts` to `dist-migrate/`)
- `bbpPairings` is a native Linux binary for Swiss-system pairings, installed at `/usr/local/bin/bbpPairings` in the Docker image
- `node server.js` is the production entrypoint (standalone output)

## A11y/Compliance

All UI must meet WCAG 2.2 AA / BFSG 2025: minimum 4.5:1 contrast ratio, 40px+ touch targets. Target audience is 55+.
