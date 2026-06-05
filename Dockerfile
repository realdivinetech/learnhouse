# ───────────────────────────────────────────────
# Stage 1: Frontend dependency install
# ───────────────────────────────────────────────
FROM oven/bun:1-alpine AS frontend-deps
RUN apk update && apk add --no-cache libc6-compat && rm -rf /var/cache/apk/*
WORKDIR /app

COPY apps/web/package.json apps/web/bun.lock* ./
RUN bun install --frozen-lockfile

# ───────────────────────────────────────────────
# Stage 2: Frontend build
# ───────────────────────────────────────────────
FROM oven/bun:1-alpine AS frontend-builder
WORKDIR /app
COPY --from=frontend-deps /app/node_modules ./node_modules
COPY apps/web .

# Copy DigitalBridge customization layer
COPY customizations/ ./customizations/
RUN mkdir -p ./apps/web/public && \
    cp -f customizations/assets/DigitalBridge_bigicon.png ./apps/web/public/learnhouse_bigicon.png && \
    cp -f customizations/assets/DigitalBridge_bigicon_1.png ./apps/web/public/learnhouse_bigicon_1.png && \
    cp -f customizations/assets/DigitalBridge_ai_simple.png ./apps/web/public/learnhouse_ai_simple.png && \
    cp -f customizations/assets/DigitalBridge_ai_simple_colored.png ./apps/web/public/learnhouse_ai_simple_colored.png && \
    cp -f customizations/assets/DigitalBridge_ai_black_logo.png ./apps/web/public/learnhouse_ai_black_logo.png && \
    cp -f customizations/assets/logo.svg ./apps/web/public/lrn.svg && \
    cp -f customizations/assets/logo.svg ./apps/web/public/lrn-dash.svg && \
    cp -f customizations/assets/logo.svg ./apps/web/public/lrn-text.svg && \
    cp -f customizations/assets/logo.svg ./apps/web/public/learnhouse_logo.png && \
    cp -f customizations/assets/logo.svg ./apps/web/public/learnhouse_icon.png && \
    cp -f customizations/assets/logo.svg ./apps/web/public/dashLogo.png && \
    cp -f customizations/assets/logo.svg ./apps/web/public/black_logo.png && \
    cp -f customizations/assets/logo.svg ./apps/web/public/learnhouse_text_white.png && \
    cp -f customizations/assets/favicon.svg ./apps/web/public/favicon.ico && \
    cp -f customizations/assets/favicon.svg ./apps/web/public/favicon.svg && \
    mkdir -p ./apps/web/styles && \
    cp -f ./customizations/styles/branding-overrides.css ./apps/web/styles/ && \
    mkdir -p ./apps/web/components/Admin/BrandingCustomization && \
    cp ./customizations/admin-components/*.tsx ./apps/web/components/Admin/BrandingCustomization/

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Remove .env files to avoid leaking secrets into the build
RUN rm -f .env*

RUN bun run build

# ───────────────────────────────────────────────
# Stage 3: Frontend production image
# ───────────────────────────────────────────────
FROM node:24-alpine AS frontend-runner
WORKDIR /app

RUN apk update && apk add --no-cache curl && rm -rf /var/cache/apk/*

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=frontend-builder /app/public ./public

RUN mkdir .next && chown nextjs:nodejs .next

# Leverage output traces to reduce image size
COPY --from=frontend-builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=frontend-builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy server wrapper for runtime environment variable injection
COPY --chown=nextjs:nodejs apps/web/server-wrapper.js ./
RUN chmod +x server-wrapper.js

# ───────────────────────────────────────────────
# Stage 4: Collab server build
# ───────────────────────────────────────────────
FROM oven/bun:1-alpine AS collab-builder
WORKDIR /app

COPY apps/collab/package.json apps/collab/bun.lock* ./
RUN bun install --frozen-lockfile

COPY apps/collab/tsconfig.json ./
COPY apps/collab/src/ ./src/

RUN bun run build

# ───────────────────────────────────────────────
# Stage 5: Final image combining frontend + backend + collab
# ───────────────────────────────────────────────
FROM python:3.14.3-slim-bookworm AS runner

# Single apt layer: nginx, curl, netcat, node, pm2
RUN apt-get update \
    && apt-get install -y --no-install-recommends nginx curl netcat-openbsd ca-certificates gnupg unzip build-essential \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && npm install -g pm2 \
    && curl -fsSL https://bun.sh/install | bash \
    && apt-get purge -y gnupg \
    && apt-get autoremove -y \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /root/.npm \
    && rm /etc/nginx/sites-enabled/default

ENV PATH="/root/.bun/bin:${PATH}"

# Copy the frontend standalone build
COPY --from=frontend-runner /app /app/web

# Backend: install deps first (better layer caching)
WORKDIR /app/api
COPY ./apps/api/uv.lock ./apps/api/pyproject.toml ./
RUN pip install --no-cache-dir --upgrade pip uv \
    && uv sync --no-dev
COPY ./apps/api ./

# Remove Enterprise Edition folder for public builds
ARG LEARNHOUSE_PUBLIC=false
RUN if [ "$LEARNHOUSE_PUBLIC" = "true" ]; then rm -rf /app/api/ee; fi

# Collab server: copy built JS + production deps
WORKDIR /app/collab
COPY --from=collab-builder /app/dist ./dist
COPY apps/collab/package.json apps/collab/bun.lock* ./
RUN bun install --production

# Copy configs and scripts
WORKDIR /app
COPY ./docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./apps/api/docker-entrypoint.sh /app/api/docker-entrypoint.sh
COPY ./docker/start.sh /app/start.sh
RUN chmod +x /app/api/docker-entrypoint.sh /app/start.sh

ENV PORT=8000 LEARNHOUSE_PORT=9000 COLLAB_PORT=4000 HOSTNAME=0.0.0.0 LEARNHOUSE_OSS=false NEXT_PUBLIC_LEARNHOUSE_OSS=false

# DigitalBridge: Remove OSS "Powered by LearnHouse" watermark from the pre-built JS bundle
RUN find /app/web -name '*.js' -type f -exec sed -i \
  's/Powered by LearnHouse/DigitalBridge/g; s/Powered by Open edX/DigitalBridge/g' {} + 2>/dev/null; true

EXPOSE 80 9000 4000

CMD ["sh", "/app/start.sh"]
