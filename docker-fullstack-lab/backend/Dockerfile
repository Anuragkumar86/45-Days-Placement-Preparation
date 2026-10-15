# Dependencies are installed with a lockfile to make builds reproducible.
FROM node:22-bookworm-slim AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

# Runtime stage: source and migration files only, no development toolchain.
FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
ENV PORT=4000
WORKDIR /app

COPY --from=dependencies --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json package-lock.json ./
COPY --chown=node:node src ./src
COPY --chown=node:node migrations ./migrations

USER node
EXPOSE 4000
CMD ["node", "src/server.js"]
