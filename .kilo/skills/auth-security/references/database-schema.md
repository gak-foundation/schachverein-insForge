# Database Schema - Authentication Tables

## Overview

This document describes the authentication-related database tables used by Better Auth.

## Tables

### auth_user

Stores user account information.

```sql
CREATE TABLE auth_user (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) NOT NULL UNIQUE,
  email_verified BOOLEAN DEFAULT FALSE NOT NULL,
  image TEXT,
  password VARCHAR(255),
  member_id UUID REFERENCES members(id),
  role member_role DEFAULT 'mitglied' NOT NULL,
  permissions JSONB DEFAULT '[]',
  failed_login_attempts INTEGER DEFAULT 0 NOT NULL,
  locked_until TIMESTAMP,
  password_reset_at TIMESTAMP,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX auth_user_email_idx ON auth_user(email);
CREATE INDEX auth_user_member_id_idx ON auth_user(member_id);
```

**Fields:**
- `id`: UUIDv4 unique identifier
- `name`: Display name
- `email`: Unique email address (verified)
- `email_verified`: Whether email has been verified
- `image`: Profile image URL
- `password`: Bcrypt hashed password
- `member_id`: Optional link to members table
- `role`: User role from member_role enum
- `permissions`: Additional individual permissions (JSON array)
- `failed_login_attempts`: Count of consecutive failed logins
- `locked_until`: Account lockout expiration
- `password_reset_at`: Last password reset timestamp
- `two_factor_enabled`: Whether 2FA is active

### auth_session

Stores active user sessions.

```sql
CREATE TABLE auth_session (
  id VARCHAR(128) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
  token VARCHAR(128) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX auth_session_user_id_idx ON auth_session(user_id);
CREATE INDEX auth_session_token_idx ON auth_session(token);
```

**Fields:**
- `id`: Session unique identifier
- `user_id`: Reference to auth_user
- `token`: Session token for cookie
- `expires_at`: Session expiration timestamp
- `ip_address`: Client IP for audit
- `user_agent`: Client browser info

### auth_account

Stores OAuth account connections.

```sql
CREATE TABLE auth_account (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
  account_id VARCHAR(255) NOT NULL,
  provider_id VARCHAR(255) NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  access_token_expires_at TIMESTAMP,
  refresh_token_expires_at TIMESTAMP,
  scope VARCHAR(255),
  id_token TEXT,
  password VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX auth_account_user_id_idx ON auth_account(user_id);
CREATE UNIQUE INDEX auth_account_provider_idx ON auth_account(provider_id, account_id);
```

**Fields:**
- `account_id`: Provider's account ID
- `provider_id`: OAuth provider (github, google, etc.)
- `access_token`: OAuth access token
- `refresh_token`: OAuth refresh token
- `scope`: Granted OAuth scopes

### auth_verification

Stores email verification and password reset tokens.

```sql
CREATE TABLE auth_verification (
  id VARCHAR(36) PRIMARY KEY,
  identifier VARCHAR(255) NOT NULL,
  value VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX auth_verification_identifier_idx ON auth_verification(identifier);
```

**Fields:**
- `identifier`: Token type + identifier (e.g., "email-verification:user@example.com")
- `value`: Token hash
- `expires_at`: Token expiration

### auth_two_factor

Stores TOTP 2FA configuration.

```sql
CREATE TABLE auth_two_factor (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
  secret VARCHAR(255) NOT NULL,
  backup_codes JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE UNIQUE INDEX auth_two_factor_user_id_idx ON auth_two_factor(user_id);
```

**Fields:**
- `secret`: TOTP secret (encrypted at rest)
- `backup_codes`: Array of hashed backup codes

## Relationships

```
auth_user ||--o{ auth_session : has
auth_user ||--o{ auth_account : has
auth_user ||--o| auth_two_factor : has
auth_user ||--o| members : references
```

## Indexes

| Table | Index | Purpose |
|-------|-------|---------|
| auth_user | email_idx | Fast login lookup |
| auth_user | member_id_idx | Join with members |
| auth_session | user_id_idx | Find user's sessions |
| auth_session | token_idx | Session validation |
| auth_account | provider_idx | Unique provider account |
| auth_verification | identifier_idx | Token lookup |
| auth_two_factor | user_id_idx | Unique 2FA per user |

## Enums

### member_role

- `admin` - Full system access
- `vorstand` - Board member access
- `sportwart` - Sports manager
- `jugendwart` - Youth coordinator
- `kassenwart` - Treasurer
- `trainer` - Trainer
- `mitglied` - Regular member
- `eltern` - Parent (limited access)
