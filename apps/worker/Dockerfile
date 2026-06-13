# Use Node 20 alpine as base
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy lockfile and configs
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json tsconfig.json ./
COPY apps/worker/package.json ./apps/worker/
COPY packages/schemas/package.json ./packages/schemas/
COPY packages/validators/package.json ./packages/validators/
COPY packages/prompts/package.json ./packages/prompts/
COPY packages/ssot/package.json ./packages/ssot/
COPY packages/shared/package.json ./packages/shared/
COPY packages/ui/package.json ./packages/ui/

# Install dependencies
FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Build everything
FROM build-deps AS build
COPY . .
RUN pnpm run build

# Final production stage
FROM base AS runner
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/apps/worker/dist ./apps/worker/dist
COPY --from=build /app/apps/worker/package.json ./apps/worker/package.json
COPY --from=build /app/packages ./packages

ENV NODE_ENV=production
WORKDIR /app/apps/worker

CMD ["node", "dist/index.js"]
