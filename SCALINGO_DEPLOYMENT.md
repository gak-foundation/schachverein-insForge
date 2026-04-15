# Scalingo Deployment Guide

## Prerequisites

1. Install Scalingo CLI: https://doc.scalingo.com/basics/cli
2. Create account at https://scalingo.com
3. Login: `scalingo login`

## 1. Create Application

```bash
scalingo create schachverein --region eu-3
```

## 2. Add PostgreSQL Database

```bash
scalingo addons add postgresql:starter --addon-name schachverein-db
```

Wait for provisioning, then get the connection URL:

```bash
scalingo env | grep DATABASE_URL
```

## 3. Add Redis (required for BullMQ)

```bash
scalingo addons add redis:starter --addon-name schachverein-redis
```

Get Redis URL:

```bash
scalingo env | grep REDIS_URL
```

## 4. Generate Secure Keys

```bash
# Better Auth Secret
openssl rand -base64 32

# Encryption Key (32-byte hex)
openssl rand -hex 32
```

## 5. Set Environment Variables

Replace placeholders with your actual values:

```bash
scalingo env-set \
  BETTER_AUTH_SECRET="<output_from_rand_base64_32>" \
  ENCRYPTION_KEY="<output_from_rand_hex_32>" \
  BETTER_AUTH_URL="https://schachverein.scalingo.app" \
  NEXT_PUBLIC_APP_URL="https://schachverein.scalingo.app" \
  SMTP_HOST="smtp.example.com" \
  SMTP_PORT="587" \
  SMTP_USER="your_smtp_user" \
  SMTP_PASS="your_smtp_password" \
  EMAIL_FROM="noreply@yourdomain.com" \
  S3_ENDPOINT="https://s3.example.com" \
  S3_ACCESS_KEY="your_s3_key" \
  S3_SECRET_KEY="your_s3_secret" \
  S3_BUCKET="schachverein" \
  MOLLIE_API_KEY="your_mollie_key"
```

## 6. Deploy

```bash
git push scalingo main
```

## 7. Run Database Migrations

After deployment completes:

```bash
scalingo run npm run db:push
```

## 8. Verify Deployment

Visit: https://schachverein.scalingo.app

Check logs:

```bash
scalingo logs
```

## Optional: Custom Domain

```bash
scalingo domains add schachverein.yourdomain.com
```

Configure DNS CNAME record pointing to `scalingo-app.scalingo.app`.

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | Provided by Scalingo PostgreSQL addon |
| `REDIS_URL` | ✅ | Provided by Scalingo Redis addon |
| `BETTER_AUTH_SECRET` | ✅ | Random base64 string (32 chars) |
| `ENCRYPTION_KEY` | ✅ | Random hex string (32 bytes = 64 chars) |
| `BETTER_AUTH_URL` | ✅ | Your app URL |
| `NEXT_PUBLIC_APP_URL` | ✅ | Your app URL |
| `SMTP_*` | ⚠️ | For email notifications |
| `S3_*` | ⚠️ | For file storage |
| `MOLLIE_API_KEY` | ⚠️ | For payment processing |

## Troubleshooting

### Build fails
Check logs: `scalingo logs --follow`

### Database connection error
Verify addon is active: `scalingo addons`

### Redis not available
Check addon status: `scalingo addons | grep redis`
