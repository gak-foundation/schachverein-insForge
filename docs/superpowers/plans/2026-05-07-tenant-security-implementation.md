# Tenant Security & User Pool Isolation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement strict club-scoped tenant isolation so admins can only see users from their own club, with defense-in-depth (RLS + application guards + audit logging).

**Architecture:** Remove global `is_super_admin`, introduce `system_admins` table for club approvals, add RLS policies on all tenant tables, create a central `withTenant` wrapper for every API route, and switch the admin users page from `auth_user` to `members`.

**Tech Stack:** Next.js 14, InsForge SDK (PostgREST), TypeScript, Drizzle-style schema definitions.

---

## File Map

| File | Responsibility |
|------|---------------|
| `src/lib/db/schema/system_admins.ts` | New table definition for system admins |
| `src/lib/tenant/with-tenant.ts` | Central tenant wrapper: auth + permission + club_id filter + RLS context |
| `src/lib/tenant/set-context.ts` | Helper to set `app.current_club_id` Postgres config for RLS |
| `src/lib/db/queries/auth.ts` | Updated auth queries (remove `isSuperAdmin`, enforce tenant) |
| `src/lib/auth/session.ts` | Remove `isSuperAdmin` from session, remove hardcoded super-admin check |
| `src/lib/auth/permissions.ts` | Remove `isSuperAdmin` parameter from all helpers |
| `src/app/dashboard/admin/users/actions.ts` | Query `members` instead of `auth_user`, remove super-admin bypass |
| `src/app/dashboard/admin/users/page.tsx` | Remove super-admin parameter pass-through |
| `src/app/dashboard/admin/users/users-page-client.tsx` | Remove super-admin UI differences if any |
| `src/features/auth/hooks/use-permissions.ts` | Remove `isSuperAdmin` reference |
| `src/lib/audit.ts` | Ensure audit logging includes `club_id` |
| `src/lib/db/schema/members.ts` | Ensure `club_id` exists and is NOT NULL where appropriate |
| `src/lib/db/schema/index.ts` | Export new `system_admins` schema |
| `src/lib/db/schema/club_memberships.ts` | Mark as audit-only, remove from active permission resolution |

---

## Task 1: Create `system_admins` Schema

**Files:**
- Create: `src/lib/db/schema/system_admins.ts`
- Modify: `src/lib/db/schema/index.ts`

- [ ] **Step 1: Write the schema file**

```typescript
export const systemAdmins = "system_admins" as const;

export interface SystemAdmin {
  id: string;
  email: string;
  createdAt: string;
}

export interface NewSystemAdmin {
  id?: string;
  email: string;
  createdAt?: string;
}
```

- [ ] **Step 2: Export from index**

In `src/lib/db/schema/index.ts`, add:
```typescript
export * from "./system_admins";
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/db/schema/system_admins.ts src/lib/db/schema/index.ts
git commit -m "feat: add system_admins schema for tenant isolation"
```

---

## Task 2: Remove `isSuperAdmin` from Permission System

**Files:**
- Modify: `src/lib/auth/permissions.ts`
- Modify: `src/features/auth/hooks/use-permissions.ts`

- [ ] **Step 1: Update `hasPermission`**

In `src/lib/auth/permissions.ts`, change the signature and body:

```typescript
export function hasPermission(
  role: string,
  userPermissions: string[],
  permission: Permission
): boolean {
  if (userPermissions.includes(permission)) return true;
  const rolePerms = ROLE_PERMISSIONS[role] || [];
  return rolePerms.includes(permission);
}
```

Remove the `isSuperAdmin` parameter entirely.

- [ ] **Step 2: Update `hasAnyPermission`**

```typescript
export function hasAnyPermission(
  role: string,
  userPermissions: string[],
  permissions: Permission[]
): boolean {
  return permissions.some((perm) =>
    hasPermission(role, userPermissions, perm)
  );
}
```

- [ ] **Step 3: Update `hasAllPermissions`**

```typescript
export function hasAllPermissions(
  role: string,
  userPermissions: string[],
  permissions: Permission[]
): boolean {
  return permissions.every((perm) =>
    hasPermission(role, userPermissions, perm)
  );
}
```

- [ ] **Step 4: Update `hasRole`**

```typescript
export function hasRole(
  userRole: string,
  requiredRole: string | string[]
): boolean {
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole);
  }
  return userRole === requiredRole;
}
```

- [ ] **Step 5: Update `usePermissions` hook**

In `src/features/auth/hooks/use-permissions.ts`:

```typescript
export function usePermissions() {
  const { data: session, isPending } = authClient.useSession();

  const userRole = (session?.user as any)?.role ?? "mitglied";
  const userPermissions = (session?.user as any)?.permissions ?? [];

  return {
    isPending,
    hasPermission: (permission: Permission) => 
      hasPermission(userRole, userPermissions, permission),
    hasAnyPermission: (permissions: Permission[]) => 
      hasAnyPermission(userRole, userPermissions, permissions),
    hasAllPermissions: (permissions: Permission[]) => 
      hasAllPermissions(userRole, userPermissions, permissions),
    hasRole: (role: string | string[]) => 
      hasRole(userRole, role),
    role: userRole,
    permissions: userPermissions,
    PERMISSIONS,
  };
}
```

- [ ] **Step 6: Run permission tests**

```bash
npm test -- src/lib/auth/permissions.test.ts
```

Expected: Tests may fail because they test `isSuperAdmin`. Fix them.

- [ ] **Step 7: Fix failing tests**

Open `src/lib/auth/permissions.test.ts` and remove all `isSuperAdmin` test cases and parameters. Update calls to `hasPermission`, `hasAnyPermission`, `hasAllPermissions`, `hasRole` to remove the boolean argument.

- [ ] **Step 8: Re-run tests**

```bash
npm test -- src/lib/auth/permissions.test.ts
```

Expected: All pass.

- [ ] **Step 9: Commit**

```bash
git add src/lib/auth/permissions.ts src/features/auth/hooks/use-permissions.ts src/lib/auth/permissions.test.ts
git commit -m "feat: remove isSuperAdmin from permission system"
```

---

## Task 3: Remove `isSuperAdmin` from Session

**Files:**
- Modify: `src/lib/auth/session.ts`
- Modify: `src/lib/db/queries/auth.ts`

- [ ] **Step 1: Update `getSession` in `session.ts`**

Remove this block entirely:
```typescript
// Check if user is a hard-coded super admin via ENV
const superAdminEmails = process.env.SUPER_ADMIN_EMAILS?.split(",").map(e => e.trim()) || [];
const isHardcodedAdmin = user.email ? superAdminEmails.includes(user.email) : false;
```

Update the return object:
```typescript
return {
  user: {
    id: user.id,
    email: user.email,
    name: userData?.name ?? user.profile?.name ?? user.email?.split("@")[0],
    role: userData?.role ?? "mitglied",
    permissions: userData?.permissions ?? [],
    memberId: userData?.memberId,
    clubId: userData?.clubId,
    emailVerified: userData?.emailVerified || false,
    image: userData?.image || user.profile?.avatar_url,
  },
  session: { user },
};
```

- [ ] **Step 2: Update `getAuthUserWithClub` in `auth.ts`**

Remove `isSuperAdmin` from the return object:

```typescript
return {
  id: data.id,
  name: data.name,
  email: data.email,
  emailVerified: data.email_verified || false,
  image: data.image,
  role,
  permissions: data.permissions || [],
  memberId: data.member_id,
  clubId: data.club_id,
};
```

- [ ] **Step 3: Update `getAllAuthUsers` in `auth.ts`**

Remove `isSuperAdmin` from the mapped return object:

```typescript
return {
  id: u.id,
  name: u.name,
  email: u.email,
  role: effectiveRole,
  createdAt: u.created_at,
  lastLoginAt: u.updated_at,
};
```

- [ ] **Step 4: Update `updateAuthUser` in `auth.ts`**

Remove the `isSuperAdmin` field handling:

```typescript
export async function updateAuthUser(
  id: string,
  data: Partial<{
    name: string;
    email: string;
    image: string;
    role: string;
    permissions: string[];
    memberId: string;
    clubId: string;
  }>
) {
```

And remove:
```typescript
if (data.isSuperAdmin !== undefined) updateData.is_super_admin = data.isSuperAdmin;
```

And remove from return mapping:
```typescript
isSuperAdmin: updated.is_super_admin,
```

- [ ] **Step 5: Remove `isSuperAdmin` from `AuthUser` interface in `auth.ts` schema**

In `src/lib/db/schema/auth.ts`, remove:
```typescript
isSuperAdmin: boolean;
```
from both `AuthUser` and `NewAuthUser`.

- [ ] **Step 6: Run all auth tests**

```bash
npm test -- src/features/auth/actions.test.ts
```

Fix any failures related to `isSuperAdmin`.

- [ ] **Step 7: Commit**

```bash
git add src/lib/auth/session.ts src/lib/db/queries/auth.ts src/lib/db/schema/auth.ts
git commit -m "feat: remove isSuperAdmin from session and auth queries"
```

---

## Task 4: Create Tenant Wrapper and Context Setter

**Files:**
- Create: `src/lib/tenant/set-context.ts`
- Create: `src/lib/tenant/with-tenant.ts`

- [ ] **Step 1: Create `set-context.ts`**

```typescript
import { createServiceClient } from "@/lib/insforge";

/**
 * Set the Postgres configuration parameter `app.current_club_id`
 * so that RLS policies can filter by tenant.
 */
export async function setTenantContext(clubId: string) {
  const client = createServiceClient();
  await client.rpc("set_config", {
    key: "app.current_club_id",
    value: clubId,
  });
}
```

- [ ] **Step 2: Create `with-tenant.ts`**

```typescript
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { hasPermission, type Permission } from "@/lib/auth/permissions";
import { setTenantContext } from "./set-context";

export async function withTenant<T>(
  permission: Permission,
  action: (ctx: { user: { id: string; role: string; permissions: string[]; clubId: string } }) => Promise<T>
): Promise<T> {
  const session = await requireAuth();
  const user = session.user;

  if (!user.clubId) {
    redirect("/onboarding");
  }

  if (!hasPermission(user.role ?? "mitglied", user.permissions ?? [], permission)) {
    throw new Error("FORBIDDEN");
  }

  await setTenantContext(user.clubId);

  return action({
    user: {
      id: user.id,
      role: user.role ?? "mitglied",
      permissions: user.permissions ?? [],
      clubId: user.clubId,
    },
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/tenant/set-context.ts src/lib/tenant/with-tenant.ts
git commit -m "feat: add tenant wrapper and RLS context setter"
```

---

## Task 5: Rewrite Admin Users Page to Use `members` Table

**Files:**
- Modify: `src/app/dashboard/admin/users/actions.ts`
- Modify: `src/app/dashboard/admin/users/page.tsx`

- [ ] **Step 1: Rewrite `getUsers` in `actions.ts`**

```typescript
"use server";

import { createServiceClient } from "@/lib/insforge";
import { withTenant } from "@/lib/tenant/with-tenant";
import { PERMISSIONS } from "@/lib/auth/permissions";

export async function getUsers(search?: string, roleFilter?: string) {
  return withTenant(PERMISSIONS.ADMIN_USERS, async ({ user }) => {
    const client = createServiceClient();

    let query = client
      .from("members")
      .select("id, first_name, last_name, email, role, status, club_id, created_at")
      .eq("club_id", user.clubId)
      .order("created_at", { ascending: false });

    if (search) {
      const escapedSearch = search.replace(/[%_]/g, "\\$&");
      query = query.or(
        `first_name.ilike.%${escapedSearch}%,last_name.ilike.%${escapedSearch}%,email.ilike.%${escapedSearch}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching members:", error);
      return [];
    }

    const members = (data || []).map((m: any) => ({
      id: m.id,
      firstName: m.first_name,
      lastName: m.last_name,
      name: `${m.first_name} ${m.last_name}`.trim(),
      email: m.email,
      role: m.role,
      status: m.status,
      clubId: m.club_id,
      createdAt: m.created_at,
    }));

    if (roleFilter) {
      return members.filter((m) => m.role === roleFilter);
    }

    return members;
  });
}
```

- [ ] **Step 2: Update `page.tsx`**

```typescript
import { getSession } from "@/lib/auth/session";
import { PERMISSIONS, hasPermission } from "@/lib/auth/permissions";
import { redirect } from "next/navigation";
import { getUsers } from "./actions";
import { UsersPageClient } from "./users-page-client";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; role?: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  if (!hasPermission(session.user.role ?? "mitglied", session.user.permissions || [], PERMISSIONS.ADMIN_USERS)) {
    redirect("/dashboard");
  }

  const { search, role } = await searchParams;
  const users = await getUsers(search, role);

  return <UsersPageClient users={users} search={search} role={role} />;
}
```

- [ ] **Step 3: Check `users-page-client.tsx`**

Open `src/app/dashboard/admin/users/users-page-client.tsx` and verify it does not reference `isSuperAdmin`. If it does, remove those branches.

- [ ] **Step 4: Run the app or test**

Build check:
```bash
npm run build
```

Fix any TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/admin/users/actions.ts src/app/dashboard/admin/users/page.tsx
git commit -m "feat: rewrite admin users page to query members table with tenant isolation"
```

---

## Task 6: Update All Admin Routes to Remove `isSuperAdmin`

**Files:**
- Modify: `src/app/dashboard/admin/layout.tsx`
- Modify: `src/app/dashboard/admin/audit/page.tsx`
- Modify: `src/app/super-admin/page.tsx` (deprecate or restrict)

- [ ] **Step 1: Update `admin/layout.tsx`**

Remove any `isSuperAdmin` bypass. Only check `ADMIN_USERS` or relevant permission.

- [ ] **Step 2: Update `audit/page.tsx`**

Remove `isSuperAdmin` parameter. Audit logs should be filtered by `club_id`.

- [ ] **Step 3: Deprecate or protect `super-admin` page**

Option A: Remove the page entirely.
Option B: Keep but require `system_admins` check via separate login (out of scope, keep simple).

**Decision:** Remove `/super-admin` page for now. System admin tasks are done outside the app or via direct database access.

```bash
git rm -r src/app/super-admin
```

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/admin/layout.tsx src/app/dashboard/admin/audit/page.tsx
git commit -m "feat: remove isSuperAdmin from admin routes, deprecate super-admin page"
```

---

## Task 7: Add RLS Policies (Database Migration)

**Files:**
- Create: `supabase/migrations/20260507_tenant_rls.sql` (or equivalent migration path)

- [ ] **Step 1: Write RLS migration**

```sql
-- Enable RLS on tenant tables
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create tenant isolation policies
CREATE POLICY tenant_isolation_members ON members
FOR ALL TO authenticated
USING (club_id = current_setting('app.current_club_id')::UUID);

CREATE POLICY tenant_isolation_events ON events
FOR ALL TO authenticated
USING (club_id = current_setting('app.current_club_id')::UUID);

CREATE POLICY tenant_isolation_tournaments ON tournaments
FOR ALL TO authenticated
USING (club_id = current_setting('app.current_club_id')::UUID);

CREATE POLICY tenant_isolation_teams ON teams
FOR ALL TO authenticated
USING (club_id = current_setting('app.current_club_id')::UUID);

CREATE POLICY tenant_isolation_games ON games
FOR ALL TO authenticated
USING (club_id = current_setting('app.current_club_id')::UUID);

CREATE POLICY tenant_isolation_pages ON pages
FOR ALL TO authenticated
USING (club_id = current_setting('app.current_club_id')::UUID);

CREATE POLICY tenant_isolation_finance ON finance_records
FOR ALL TO authenticated
USING (club_id = current_setting('app.current_club_id')::UUID);

CREATE POLICY tenant_isolation_documents ON documents
FOR ALL TO authenticated
USING (club_id = current_setting('app.current_club_id')::UUID);

CREATE POLICY tenant_isolation_protocols ON protocols
FOR ALL TO authenticated
USING (club_id = current_setting('app.current_club_id')::UUID);

CREATE POLICY tenant_isolation_seasons ON seasons
FOR ALL TO authenticated
USING (club_id = current_setting('app.current_club_id')::UUID);

CREATE POLICY tenant_isolation_invitations ON club_invitations
FOR ALL TO authenticated
USING (club_id = current_setting('app.current_club_id')::UUID);

CREATE POLICY tenant_isolation_audit ON audit_logs
FOR ALL TO authenticated
USING (club_id = current_setting('app.current_club_id')::UUID);
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260507_tenant_rls.sql
git commit -m "feat: add RLS tenant isolation policies to all club-scoped tables"
```

---

## Task 8: Audit Logging with `club_id`

**Files:**
- Modify: `src/lib/audit.ts`

- [ ] **Step 1: Ensure `club_id` is always included**

Open `src/lib/audit.ts`. Verify that every `logAuditEvent` call includes `clubId`. If the function signature does not require `clubId`, update it:

```typescript
export async function logAuditEvent(params: {
  clubId: string;
  userId: string;
  action: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}) {
  const client = createServiceClient();
  await client.from("audit_logs").insert([
    {
      club_id: params.clubId,
      user_id: params.userId,
      action: params.action,
      target_id: params.targetId,
      metadata: params.metadata,
    },
  ]);
}
```

- [ ] **Step 2: Find and fix missing `club_id` calls**

Search for all `logAuditEvent` calls:
```bash
grep -r "logAuditEvent" src/ --include="*.ts" --include="*.tsx"
```

Update each call to pass `clubId`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/audit.ts
git commit -m "feat: enforce club_id in all audit log entries"
```

---

## Task 9: Verify No `auth_user` Direct Listing Remains

**Files:**
- Search: All files referencing `getAllAuthUsers` or `auth_user` listing

- [ ] **Step 1: Search for dangerous patterns**

```bash
grep -r "getAllAuthUsers" src/ --include="*.ts" --include="*.tsx"
grep -r "from(\"auth_user\")" src/ --include="*.ts" --include="*.tsx"
grep -r "from('auth_user')" src/ --include="*.ts" --include="*.tsx"
```

- [ ] **Step 2: Replace or remove**

Any remaining `auth_user` listings for admin purposes must be replaced with `members` queries filtered by `club_id`.

- [ ] **Step 3: Commit**

```bash
git commit -m "fix: replace remaining auth_user listings with members table queries"
```

---

## Task 10: Final Verification

- [ ] **Step 1: Run full test suite**

```bash
npm test
```

Expected: All 170 tests pass (or more, if you added new ones).

- [ ] **Step 2: Type check**

```bash
npx tsc --noEmit
```

Expected: No TypeScript errors.

- [ ] **Step 3: Build**

```bash
npm run build
```

Expected: Successful build.

- [ ] **Step 4: Commit**

```bash
git commit --allow-empty -m "chore: tenant isolation implementation complete"
```

---

## Spec Coverage Check

| Spec Section | Implementing Task |
|--------------|-------------------|
| Remove `is_super_admin` from `auth_user` | Task 3 |
| Create `system_admins` table | Task 1 |
| RLS policies on tenant tables | Task 7 |
| Central `withTenant` wrapper | Task 4 |
| Admin users page uses `members` | Task 5 |
| Permission model without super-admin | Task 2 |
| Audit logging with `club_id` | Task 8 |
| No `auth_user` direct listing | Task 9 |

---

## Security Checklist (Post-Implementation)

- [ ] RLS enabled on all tenant tables with `club_id` policy
- [ ] `auth_user.is_super_admin` removed from app logic
- [ ] `createServiceClient()` not used for authenticated club data access
- [ ] All API routes use `withTenant()` or equivalent
- [ ] All queries include explicit `.eq('club_id', ...)`
- [ ] Admin users page queries `members` table, not `auth_user`
- [ ] Audit logging enabled for all admin actions
- [ ] Invitation system binds users to correct club
- [ ] Onboarding redirect for users without `club_id`
- [ ] Error messages do not leak club existence (404 for all "not found / not yours")
