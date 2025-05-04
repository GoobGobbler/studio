# Dockerfile for Next.js Frontend

# 1. Base Image
FROM node:20-alpine AS base

# 2. Set working directory
WORKDIR /app

# 3. Install dependencies only when needed
FROM base AS deps
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# 4. Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time environment variables
# ARG NEXT_PUBLIC_COLLABORATION_WS_URL
# ENV NEXT_PUBLIC_COLLABORATION_WS_URL=$NEXT_PUBLIC_COLLABORATION_WS_URL
# Add other NEXT_PUBLIC_ vars if needed during build

RUN npm run build

# 5. Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/public ./public
# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# Set runtime environment variables passed from docker-compose.yml
# ENV GOOGLE_GENAI_API_KEY=... # No need to set here if passed via docker-compose
# ENV OLLAMA_BASE_URL=...
# ENV REDIS_URL=...
# ENV COLLABORATION_SERVICE_URL=...
# ENV SECRETS_SERVICE_URL=...
# ENV NEXT_PUBLIC_COLLABORATION_WS_URL=... # Already set in build, but can be overridden

USER node

EXPOSE 9002

ENV PORT 9002
# Set the HOSTNAME to localhost to listen on all interfaces required by Next.js
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
