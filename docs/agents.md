# Schachverein - Development Guide

## Tech Stack
- **Framework**: Next.js 16 (App Router, Server Components, Server Actions)
- **Language**: TypeScript (strict mode)
- **ORM**: Drizzle ORM with PostgreSQL
- **Auth**: Supabase Auth (managed)
- **UI**: shadcn/ui + Tailwind CSS 4
- **State**: Zustand (client-side)
- **Chess**: chess.js + react-chessboard
- **Validation**: Zod

## Commands
- `npm run dev` - Development server
- `npm run build` - Production build (runs TypeScript check + Next.js build)
- `npm run lint` - ESLint (im Repo noch zahlreiche bestehende Meldungen)
- `npm run test:ci` - Vitest einmalig (für CI)
- `npm run db:generate` - Generate Drizzle migration
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Drizzle Studio
- `npm run test` - Run Vitest tests

## Architecture
- Server Components by default, Client Components only when needed ("use client")
- Server Actions in `src/lib/actions/` (Barrel-Export `src/lib/actions/index.ts`) für Mutationen
- All route pages validate auth with `getSession()` from `src/lib/auth/session.ts`
- RBAC via `hasPermission(role, permissions, PERMISSIONS.XXX)` from `src/lib/auth/permissions.ts`
- Audit logging via `logAudit()` in `src/lib/audit.ts`
- Zod schemas in `src/lib/validations/index.ts`
- DB schema in `src/lib/db/schema.ts`

## Code Style
- German UI text (the app is for German chess clubs)
- No comments in code unless explicitly requested
- Server Components for data fetching, Client Components for interactivity
- Form actions use `FormData` pattern with server action functions
- All imports use `@/` path alias

## Key Files
- `src/lib/db/schema.ts` - All database tables and relations
- `src/lib/auth/permissions.ts` - RBAC permission matrix (8 roles, 23 permissions)
- `src/lib/auth/client.ts` - Supabase Auth client-side hooks
- `src/lib/auth/session.ts` - Server-side session utilities
- `src/lib/actions/` - Server Actions nach Thema (z. B. `members.ts`, `finance.ts`)
- `src/lib/validations/index.ts` - Zod validation schemas
- `src/middleware.ts` - Next.js middleware (route protection, host-based routing)
- `src/components/layout/sidebar.tsx` - Navigation with RBAC filtering

## Database Migrations
After modifying `src/lib/db/schema.ts`:
1. Run `npm run db:generate` to create migration
2. Run `npm run db:push` to apply to development database

## Supabase Auth
Authentication is handled by Supabase Auth (managed service). Key files:
- `src/lib/supabase/client.ts` - Client-side Supabase client
- `src/lib/supabase/server.ts` - Server-side Supabase client
- `src/lib/auth/session.ts` - Session helpers using Supabase
- `src/lib/auth/client.ts` - React hooks for auth state

## Environment Variables
See `.env.example` for required environment variables.
