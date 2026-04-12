# Security Checklist

## Authentication

- [ ] Passwords hashed with bcrypt (salt rounds >= 10)
- [ ] Minimum password length enforced (8 characters)
- [ ] Password complexity requirements (upper, lower, number, special)
- [ ] Email verification required before access
- [ ] Secure session cookies (httpOnly, secure, sameSite)
- [ ] Session expiration appropriate (7 days)
- [ ] Session token rotation on authentication
- [ ] Secure password reset flow (time-limited tokens)

## Authorization

- [ ] RBAC implemented with principle of least privilege
- [ ] Permission checks on all protected routes
- [ ] Permission checks on all server actions
- [ ] Role hierarchy properly defined
- [ ] Admin routes properly protected

## Rate Limiting

- [ ] Login attempts rate limited (5 per 15 min)
- [ ] Registration rate limited (3 per hour)
- [ ] Password reset rate limited (3 per hour)
- [ ] IP-based limits implemented
- [ ] Rate limit headers exposed to client

## Session Management

- [ ] Sessions stored server-side
- [ ] Session invalidation on logout
- [ ] Session timeout after inactivity
- [ ] Concurrent session limits (optional)
- [ ] Session metadata tracked (IP, user agent)

## Input Validation

- [ ] All inputs validated with Zod
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS prevention (output encoding)
- [ ] CSRF tokens on state-changing operations
- [ ] File upload validation

## Security Headers

- [ ] Content-Security-Policy configured
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] Permissions-Policy configured
- [ ] Strict-Transport-Security (HSTS)

## Logging & Monitoring

- [ ] Failed login attempts logged
- [ ] Successful logins logged
- [ ] Permission violations logged
- [ ] Password changes logged
- [ ] 2FA events logged
- [ ] Suspicious activity alerts

## Account Security

- [ ] Account lockout after failed attempts
- [ ] 2FA available for sensitive accounts
- [ ] Backup codes for 2FA recovery
- [ ] Password history (optional)
- [ ] Force password change on compromise

## Infrastructure

- [ ] HTTPS enforced
- [ ] Secrets in environment variables
- [ ] Database credentials secured
- [ ] Redis secured (if used)
- [ ] Regular dependency updates
