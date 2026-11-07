# MaisonTech — demo store: orders and payments are simulated.

# syntax=docker/dockerfile:1

# Next.js 16 production image. Works on Render, Fly.io, Hugging Face Spaces,
# or any Docker host: the container listens on $PORT (default 7860).

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=7860 \
    DEMO_DB_PATH=/tmp/maisontech-db.json
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
RUN addgroup -S app && adduser -S app -G app && mkdir -p /tmp/.data && chown -R app:app /app /tmp/.data
USER app
EXPOSE 7860
CMD ["sh", "-c", "npx next start -p ${PORT:-7860} -H 0.0.0.0"]
