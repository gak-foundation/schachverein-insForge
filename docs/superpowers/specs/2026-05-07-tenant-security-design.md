# Tenant Security & User Pool Isolation Design

**Date:** 2026-05-07  
**Status:** Approved  
**Scope:** Multi-tenant chess club management platform (InsForge backend)

---

## 1. Problem Statement

Currently, admins can see users from all clubs. The permission model uses global roles (`admin`, `vorstand`, etc.) without strict tenant scoping. This is a security vulnerability: an admin in Club A can theoretically access data from Club B.

## 2. Decisions Log

| Decision | Option Chosen | Rationale |
|----------|---------------|-----------|
| Super-Admins in app? | **No** | Strict tenant isolation. System admin exists only for club approvals, with no access to club data. |
| User-to-Club cardinality | **1:1 strict** | Simplest to secure. No multi-club membership. Club transfer requires re-registration. |
| Club creation | **Public application + approval** | Visitors apply, system admin approves. Aligns with SaaS model. |
| Isolation strategy | **Defense in Depth** | RLS (database layer) + Application guards + Audit logging |

## 3. Architecture Principles

1. **Every data row belongs to exactly one club.**
2. **Every authenticated request carries a tenant context.**
3. **Database RLS is the safety net, not the primary defense.**
4. **No global admin role within the application.**
5. **All admin actions are audited.**

## 4. Database Schema Changes

### 4.1 `auth_user` Table

| Column | Change | Notes |
|--------|--------|-------|
| `club_id` | Keep, enforce NOT NULL after onboarding | Single club assignment |
| `is_super_admin` | **Remove** | No in-app super admin |
| `active_club_id` | **Remove** | Redundant with 1:1 constraint |
| `role` | Keep | Scope is implicitly limited to `club_id` |
| `member_id` | Keep | Links to `members` table |

### 4.2 New Table: `system_admins`

Used **only** for the technical system administrator who approves new clubs. No API access to club data.

```sql
CREATE TABLE system_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.3 Tenant Tables (RLS Enabled)

All tables containing club-specific data MUST have `club_id` and RLS enabled:

- `members`
- `events`
- `tournaments`
- `teams`
- `games`
- `pages` (CMS)
- `finance_records`
- `documents`
- `protocols`
- `seasons`
- `club_invitations`
- `audit_logs`

**RLS Policy Template:**
```sql
ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_<table> ON <table>
FOR ALL TO authenticated
USING (club_id = current_setting(''app.current_club_id'')::UUID);
```

### 4.4 `club_memberships` Table

With strict 1:1 user-to-club, this table becomes primarily for **audit/history**.

Options:
- **A) Simplify**: Keep only for tracking role history, not active permissions.
- **B) Deprecate**: Remove in favor of `auth_user.club_id` + `members.club_id`.

**Decision:** Option A — keep for audit trail, but do not use for permission resolution.

## 5. Tenant Context & Database Access

### 5.1 Setting Tenant Context

Before executing any tenant query, set the Postgres configuration parameter:

```typescript
await client.rpc(''set_config'', {
  key: ''app.current_club_id'',
  value: session.user.clubId
});
```

Or use a connection-level preset via a wrapper function.

### 5.2 Service Client Usage

| Use Case | Client Type | Tenant Context |
|----------|-------------|----------------|
| Club data queries (members, events, etc.) | **Authenticated user client** | Yes, from session |
| User''s own profile update | Authenticated user client | Yes |
| Club approval (system admin) | **Service client** | N/A |
| Cron jobs / background tasks | Service client | Must explicitly set `club_id` per task |
| Public club pages (no auth) | Service client | Must explicitly filter by `club_id` from slug |

**Rule:** The `createServiceClient()` MUST NOT be used for authenticated user actions on club data. It bypasses RLS and is only for system-level operations.

## 6. API & Route Security

### 6.1 Required Checks on Every Protected Route

1. **Authentication**: Valid session exists.
2. **Tenant Assignment**: `session.user.clubId` is present. If missing, redirect to onboarding.
3. **Permission Check**: User has required permission (scoped implicitly by club).
4. **Tenant Filter**: Query explicitly includes `.eq(''club_id'', session.user.clubId)`.
5. **Result Validation**: If a resource ID is provided, verify it belongs to the user''s club. Return generic "Not Found" to prevent ID enumeration.

### 6.2 Central Tenant Wrapper

```typescript
// src/lib/tenant/with-tenant.ts
export async function withTenant<T>(
  permission: Permission,
  action: (ctx: { user: AuthUser; clubId: string }) => Promise<T>
): Promise<T> {
  const session = await requireAuth();
  if (!session.user.clubId) {
    redirect(''/onboarding'');
  }

  if (!hasPermission(session.user.role, session.user.permissions, permission)) {
    throw new Error(''FORBIDDEN'');
  }

  // Set RLS context
  await setTenantContext(session.user.clubId);

  return action({ user: session.user, clubId: session.user.clubId });
}
```

### 6.3 Forbidden Patterns

The following are **prohibited** and will be caught by code review:

- Using `createServiceClient()` in API routes handling club data.
- Database queries without `.eq(''club_id'', session.user.clubId)`.
- Checking `isSuperAdmin` to bypass tenant checks (field is removed).
- Direct `auth_user` table listing for admin pages (use `members` table with tenant filter).
- Returning different HTTP codes for "not found vs not yours" (always 404).

## 7. Permission Model (Club-Scoped)

Roles remain (`admin`, `vorstand`, `spielleiter`, etc.), but their scope is strictly the user''s assigned club.

| Role | Meaning |
|------|---------|
| `admin` | Full admin within their club only. Can manage users, settings, billing. |
| `vorstand` | Board member. Wide permissions within club. |
| `spielleiter` | Tournament director. Tournament/team management. |
| `kassenwart` | Treasurer. Finance access. |
| `jugendwart` | Youth coordinator. Youth member access. |
| `trainer` | Trainer. Read access to members, games. |
| `mitglied` | Regular member. Limited read access. |
| `eltern` | Parent. Read access to own children''s data. |

**Key Change:** There is no global `admin` anymore. `admin` means "admin of my club."

## 8. User Management Flow

### 8.1 Adding New Members

1. Admin with `ADMIN_USERS` permission creates an invitation:
   - Email address
   - Role (default: `mitglied`)
   - Expiry (e.g., 7 days)
2. System sends email with invitation token (bound to `club_id`).
3. User clicks link, registers via InsForge auth.
4. On first login, user is bound to the inviting club (`tenant-binding.ts`).
5. User gets the role from the invitation.

### 8.2 Admin Users Page

- **Query**: `members` table (not `auth_user`) filtered by `club_id`.
- **Displayed**: Name, email, role, status.
- **Actions**: Edit role, deactivate, remove from club (sets `status = ''inactive''`).
- **No cross-club visibility**: RLS + explicit filter ensure this.

### 8.3 Removing a User from a Club

- Set `members.status = ''inactive''`.
- Optionally anonymize personal data per GDPR.
- Do NOT delete `auth_user` (InsForge auth record) unless explicitly requested.

## 9. Frontend Security

### 9.1 Route Guards

- Every `/dashboard/*` route checks auth + club assignment server-side.
- `/dashboard/admin/*` additionally checks admin permissions.
- No client-only route bypass possible (Next.js server components).

### 9.2 UI Permission Gating

- Components use `usePermissions()` to conditionally render UI.
- **Critical**: Server actions re-validate permissions; client-side gating is for UX only.

### 9.3 Onboarding

- New users without `club_id` are redirected to `/onboarding`.
- Onboarding flow: either accept an invitation or apply for a new club.

## 10. Audit & Monitoring

### 10.1 Audit Logs

Every admin action is logged:

```typescript
interface AuditLog {
  id: string;
  clubId: string;
  userId: string;
  action: string;        // e.g., "user.invite", "user.role_change"
  targetId?: string;     // affected user/member ID
  metadata?: Record<string, unknown>;
  createdAt: string;
}
```

### 10.2 Security Monitoring

- Failed tenant access attempts (caught by RLS or app guards) are logged as `SECURITY_EVENT`.
- Unusual login patterns per club trigger alerts.

## 11. Migration Plan (High-Level)

1. **Schema Migration**: Add RLS policies, create `system_admins`, update `auth_user`.
2. **Data Migration**: Ensure all existing rows have valid `club_id`.
3. **Code Migration**: Update all queries to use tenant wrapper / explicit `club_id` filter.
4. **Remove `is_super_admin`**: Migrate any existing super admins to `system_admins` table.
5. **Testing**: Verify RLS policies prevent cross-tenant access.
6. **Deployment**: Deploy with feature flags if needed.

## 12. Security Checklist

- [ ] RLS enabled on all tenant tables with `club_id` policy
- [ ] `auth_user.is_super_admin` removed from app logic
- [ ] `createServiceClient()` not used for authenticated club data access
- [ ] All API routes use `withTenant()` or equivalent
- [ ] All queries include explicit `.eq(''club_id'', ...)`
- [ ] Admin users page queries `members` table, not `auth_user`
- [ ] Audit logging enabled for all admin actions
- [ ] Invitation system binds users to correct club
- [ ] Onboarding redirect for users without `club_id`
- [ ] Error messages do not leak club existence (404 for all "not found / not yours")

---

**Next Step:** Implementation plan via `writing-plans` skill.
