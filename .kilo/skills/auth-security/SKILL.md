---
name: auth-security
description: Authentication and security system for Next.js applications using Supabase Auth. Includes managed authentication, RBAC, session management, and security best practices. Use when implementing or modifying authentication flows, security features, or access control.
---

# Authentication & Security System

## Overview

This skill provides authentication and security guidelines for the Schachverein project using **Supabase Auth** (managed service). Built on top of Supabase Auth with PostgreSQL/Drizzle ORM.

## Core Capabilities

### 1. Supabase Auth (Managed)
- Password-based authentication (handled by Supabase)
- OAuth social login (GitHub, Google, etc.)
- Email verification workflow
- Password reset with secure tokens
- Secure session management via httpOnly cookies

### 2. Session Management
- Server-side sessions via Supabase Auth
- Automatic session expiration
- Secure cookie configuration (handled by Supabase)
- Session cleanup on sign out

### 3. RBAC (Role-Based Access Control)
- 8 predefined roles: admin, vorstand, sportwart, jugendwart, kassenwart, trainer, mitglied, eltern
- 23 granular permissions
- Role-permission matrix with inheritance
- Support for individual permission overrides

### 4. Input Validation & Sanitization
- Zod schemas for all inputs
- Password complexity requirements (enforced by Supabase)
- Email validation
- SQL injection protection via Drizzle ORM parameterized queries

### 5. Security Headers
- Content Security Policy (CSP)
- X-Frame-Options, X-Content-Type-Options
- Referrer-Policy, Permissions-Policy
- Applied via middleware

## File Structure

```
src/lib/supabase/
├── client.ts               # Client-side Supabase client
├── server.ts               # Server-side Supabase client
└── middleware.ts           # Session refresh middleware

src/lib/auth/
├── client.ts               # Client-side auth hooks
├── session.ts              # Server-side session utilities
├── permissions.ts          # RBAC permission system
├── protected.tsx           # Protected page wrappers
└── invitations.ts          # Invitation handling

src/lib/db/schema.ts        # Database schema including auth tables
src/proxy.ts                # Next.js middleware (route protection)
```

## Usage Examples

### Server Component Authentication

```typescript
import { getSession } from "@/lib/auth/session";
import { hasPermission, PERMISSIONS } from "@/lib/auth/permissions";

export default async function DashboardPage() {
  const session = await getSession();
  
  if (!session) {
    redirect("/login");
  }
  
  const canManageUsers = hasPermission(
    session.user.role,
    session.user.permissions || [],
    PERMISSIONS.ADMIN_USERS
  );
  
  return <Dashboard user={session.user} canManageUsers={canManageUsers} />;
}
```

### Client Component Authentication

```typescript
"use client";

import { authClient } from "@/lib/auth/client";

export function LoginForm() {
  const { data: session, isPending } = authClient.useSession();
  
  const handleLogin = async (email: string, password: string) => {
    const { data, error } = await authClient.signIn.email({
      email,
      password,
    });
    
    if (error) {
      console.error(error.message);
    }
  };
  
  const handleLogout = async () => {
    await authClient.signOut();
  };
  
  return <form>...</form>;
}
```

### RBAC Permission Check

```typescript
import { hasPermission, hasAnyPermission, PERMISSIONS } from "@/lib/auth/permissions";

// Check single permission
const canEdit = hasPermission(user.role, user.permissions, PERMISSIONS.MEMBERS_WRITE);

// Check any of multiple permissions
const canAccessFinance = hasAnyPermission(
  user.role,
  user.permissions,
  [PERMISSIONS.FINANCE_READ, PERMISSIONS.FINANCE_WRITE]
);

// Check all permissions
const isFullAdmin = hasAllPermissions(
  user.role,
  user.permissions,
  [PERMISSIONS.ADMIN_USERS, PERMISSIONS.ADMIN_ROLES, PERMISSIONS.ADMIN_SETTINGS]
);
```

### Protected Page Wrapper

```typescript
import { ProtectedPage } from "@/lib/auth/protected";

export default async function AdminPage() {
  return (
    <ProtectedPage>
      <AdminContent />
    </ProtectedPage>
  );
}
```

## Configuration

### Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]

# Database (for Drizzle)
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

### Supabase Dashboard Configuration

In Supabase Dashboard → Authentication → URL Configuration:
- Site URL: `https://deine-domain.de`
- Redirect URLs: `https://deine-domain.de/auth/callback`

## Security Best Practices

1. **Always use Server Components for data fetching** - session is validated server-side
2. **Validate all inputs with Zod** - prevents injection attacks
3. **Check permissions before actions** - defense in depth
4. **Log security events** - use `logAudit()` for security-relevant actions
5. **Use secure headers** - middleware applies security headers automatically
6. **Keep dependencies updated** - regularly update Supabase packages

## Migration from Better Auth

This project was migrated from Better Auth to Supabase Auth. The migration guide is available at `docs/migration/SUPABASE-MIGRATION.md`.

Key changes:
- Better Auth → Supabase Auth (managed)
- Self-hosted → Cloud-managed authentication
- Redis sessions → Supabase session management
- Custom API routes → Supabase Auth endpoints

## Extension Points

### Adding a New Permission

Edit `src/lib/auth/permissions.ts`:

```typescript
export const PERMISSIONS = {
  // ... existing permissions
  NEW_FEATURE: "new.feature",
} as const;

// Add to ROLE_PERMISSIONS as needed
```

### Custom Session Data

Extend session data in `src/lib/auth/session.ts`:

```typescript
// Fetch additional user data from database
const { data: userData } = await supabase
  .from("auth_user")
  .select("*")
  .eq("id", user.id)
  .single();
```

## References

See `references/` directory for:
- `security-checklist.md` - Security audit checklist
- `database-schema.md` - Auth-related database tables

## Supabase Documentation

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
