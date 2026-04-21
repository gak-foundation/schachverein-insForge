FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js telemetry is disabled
ENV NEXT_TELEMETRY_DISABLED=1

# Build the Next.js app
RUN npm run build
RUN npm run build:migrate

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install runtime dependencies for bbpPairings
RUN apk add --no-cache libstdc++ gcompat wget

# Install bbpPairings binary (using a stable version)
RUN wget https://github.com/BieremaBoyzProgramming/bbpPairings/releases/download/v4.2.0/bbpPairings-linux-x86_64 -O /usr/local/bin/bbpPairings && \
    chmod +x /usr/local/bin/bbpPairings

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir -p .next tmp/pairings
RUN chown -R nextjs:nodejs .next tmp/pairings

# Copy the worker build and migration scripts
COPY --from=builder --chown=nextjs:nodejs /app/dist-worker ./dist-worker
COPY --from=builder --chown=nextjs:nodejs /app/dist-migrate ./dist-migrate
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
# set hostname to localhost
ENV HOSTNAME="0.0.0.0"

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
