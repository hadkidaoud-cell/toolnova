FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app
COPY . .

FROM base AS deps
RUN pnpm install --frozen-lockfile

FROM deps AS builder
ARG APP=web
RUN pnpm --filter @toolnova/${APP} build

FROM node:20-alpine AS runner
ARG APP=web
ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /app/apps/${APP}/package.json ./package.json
COPY --from=builder /app/apps/${APP}/.next ./.next
COPY --from=builder /app/apps/${APP}/public ./public
COPY --from=builder /app/apps/${APP}/dist ./dist
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules/.pnpm ./node_modules/.pnpm
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

EXPOSE 3000

CMD if [ "$APP" = "api" ]; then \
      node dist/main; \
    else \
      node node_modules/.pnpm/next/dist/bin/next start; \
    fi
