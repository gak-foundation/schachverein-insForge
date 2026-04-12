---
name: auth-security
description: Comprehensive authentication and security system for Next.js applications using Better Auth. Includes password hashing, JWT tokens, rate limiting, RBAC, 2FA/TOTP, account lockout, CSRF protection, and secure session management. Use when implementing or modifying authentication flows, security features, or access control.
---

# Authentication & Security System

## Overview

This skill provides a complete, production-ready authentication and security system for Next.js applications. Built on Better Auth with PostgreSQL/Drizzle ORM, it includes all essential security features for enterprise-grade applications.

## Core Capabilities

### 1. Secure Authentication
- Password-based authentication with bcrypt hashing
- Social login (GitHub, extensible to others)
- Email verification workflow
- Password reset with secure tokens
- Secure session management with httpOnly cookies

### 2. Session Management
- Server-side sessions stored in PostgreSQL
- Automatic session expiration (7 days default)
- Secure cookie configuration (httpOnly, sameSite, secure in production)
- Session cleanup and revocation

### 3. Rate Limiting
- Redis-based distributed rate limiting
- Per-user and per-IP limits
- Configurable windows for login, registration, password reset
- Fail-closed behavior in production

### 4. RBAC (Role-Based Access Control)
- 8 predefined roles: admin, vorstand, sportwart, jugendwart, kassenwart, trainer, mitglied, eltern
- 23 granular permissions
- Role-permission matrix with inheritance
- Support for individual permission overrides

### 5. Two-Factor Authentication (TOTP)
- TOTP-based 2FA using authenticator apps
- Backup codes for account recovery
- Enable/disable 2FA workflow
- QR code generation for setup

### 6. Account Security
- Automatic account lockout after failed attempts (5 attempts, 30 min lockout)
- Failed login attempt tracking
- Unlock after lockout period
- Audit logging for security events

### 7. Input Validation & Sanitization
- Zod schemas for all inputs
- Password complexity requirements
- Email validation
- SQL injection protection via Drizzle ORM parameterized queries

### 8. Security Headers
- Content Security Policy (CSP)
- X-Frame-Options, X-Content-Type-Options
- Referrer-Policy, Permissions-Policy
- Applied via middleware

## File Structure

```
src/lib/auth/
├── better-auth.ts          # Main Better Auth configuration
├── client.ts               # Client-side auth hooks
├── session.ts              # Server-side session utilities
├── permissions.ts          # RBAC permission system
├── rate-limit.ts           # Rate limiting implementation
├── account-lockout.ts      # Failed login handling
├── security-headers.ts     # Security header definitions
├── redis.ts                # Redis connection utility
├── email.ts                # Email sending utilities
└── password.ts             # Password utilities

src/lib/db/schema.ts        # Database schema including auth tables
src/proxy.ts                # Middleware (route protection, security headers)
src/app/api/auth/[...all]/  # Better Auth API routes
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
  const { data: session } = authClient.useSession();
  
  const handleLogin = async (email: string, password: string) => {
    const result = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/dashboard",
    });
    
    if (result.error) {
      console.error(result.error.code);
    }
  };
  
  const handleLogout = async () => {
    await authClient.signOut();
  };
  
  return <form>...</form>;
}
```

### Rate Limiting

```typescript
import { checkRateLimit, checkRateLimitByIP } from "@/lib/auth/rate-limit";

export async function loginAction(email: string, ip: string) {
  // Check per-user rate limit
  await checkRateLimit(email, "login");
  
  // Check per-IP rate limit
  await checkRateLimitByIP(ip, "login_ip");
  
  // Proceed with login...
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

### Two-Factor Authentication

```typescript
import { authClient } from "@/lib/auth/client";

// Enable 2FA
const { data } = await authClient.twoFactor.enable({
  password: currentPassword,
});
// Returns: { totpURI, backupCodes }

// Verify TOTP
await authClient.twoFactor.verifyTotp({
  code: totpCode,
});

// Disable 2FA
await authClient.twoFactor.disable({
  password: currentPassword,
});
```

### Account Lockout Check

```typescript
import { isAccountLocked, isAccountLockedByEmail } from "@/lib/auth/account-lockout";

// Check by email before attempting login
const { locked, unlockAt, userId } = await isAccountLockedByEmail(email);

if (locked) {
  throw new Error(`Account locked until ${unlockAt}`);
}

// After failed login
const { locked } = await handleFailedLogin(userId);

// After successful login
await handleSuccessfulLogin(userId);
```

## Configuration

### Environment Variables

```bash
# Better Auth
BETTER_AUTH_SECRET=your-secret-key-min-32-characters
BETTER_AUTH_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname

# Redis (required for rate limiting in production)
REDIS_URL=redis://localhost:6379

# Social Login (optional)
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

# Email (required for verification and password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com
```

### Security Configuration

See `src/lib/auth/better-auth.ts` for:
- Session expiration (default: 7 days)
- Cookie settings (httpOnly, secure, sameSite)
- Password requirements (min 8, max 128 chars)
- Email verification requirements

## Security Best Practices

1. **Always use Server Components for data fetching** - session is validated server-side
2. **Use rate limiting on all auth endpoints** - prevents brute force attacks
3. **Validate all inputs with Zod** - prevents injection attacks
4. **Check permissions before actions** - defense in depth
5. **Log security events** - use `logAudit()` for security-relevant actions
6. **Use secure headers** - middleware applies security headers automatically
7. **Keep dependencies updated** - regularly update Better Auth and related packages

## Extension Points

### Adding a New Social Provider

Edit `src/lib/auth/better-auth.ts`:

```typescript
socialProviders: {
  github: { ... },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  },
}
```

### Adding a New Permission

Edit `src/lib/auth/permissions.ts`:

```typescript
export const PERMISSIONS = {
  // ... existing permissions
  NEW_FEATURE: "new.feature",
} as const;

// Add to ROLE_PERMISSIONS as needed
```

### Custom Rate Limit Rules

Edit `src/lib/auth/rate-limit.ts`:

```typescript
export const RATE_LIMITS = {
  // ... existing limits
  customAction: { windowMs: 60 * 1000, maxRequests: 10, keyPrefix: "custom" },
} as const;
```

## References

See `references/` directory for:
- `security-checklist.md` - Security audit checklist
- `threat-model.md` - Threat model and mitigations
- `database-schema.md` - Auth-related database tables
