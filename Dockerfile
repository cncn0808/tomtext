FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/docs/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

# Generate Prisma Client
ENV DATABASE_URL="file:./dev.db"
RUN npx prisma generate

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
RUN apk add --no-cache yt-dlp ffmpeg python3
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Manually copy the native binary for LibSQL
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@libsql/linux-x64-musl ./node_modules/@libsql/linux-x64-musl

# Initialize the database file in the runner
COPY --from=builder /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts

# Set DATABASE_URL for runtime
ENV DATABASE_URL="file:./dev.db"

# We will create the DB at runtime since copying a pre-made one is tricky with permissions/existence


USER nextjs

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

# Ensure npx is available or use the binary from node_modules if needed, but 'npx' is fine.
# We set the database URL strictly for this command to ensure it writes to the file we want, though env var should handle it.
CMD npx prisma db push --skip-generate && node server.js