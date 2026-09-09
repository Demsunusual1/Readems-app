# Readems runs as one Node process serving the built app. The build happens in
# a stage that is thrown away, so the image that ships carries the traced
# production dependencies and nothing else.
FROM node:24.15.0-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci --no-audit --no-fund && npm cache clean --force

COPY . .
# DATABASE_URL is validated on import, and the build imports the app. Nothing
# is read from this database during the build; the real one is passed at run
# time.
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public" npm run build

FROM node:24.15.0-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# The standalone output already contains the dependencies the server traces to.
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER node
EXPOSE 3000
CMD ["node", "server.js"]

# Migrations and the editorial seed need the Prisma CLI, which is a development
# dependency, so they run from the build stage rather than from the image that
# serves traffic.
FROM builder AS migrator
CMD ["sh", "-c", "npx prisma migrate deploy && npm run db:seed"]
