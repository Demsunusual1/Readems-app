# Readems

Production-ready technical foundation for Readems. Product features and authentication are intentionally out of scope.

## Prerequisites

- Node.js `24.15.0` (use `nvm use`)
- npm 11 or newer
- Docker and Docker Compose for local PostgreSQL

## Getting started

```bash
cp .env.example .env
docker compose up -d
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The database is local-only and persists in the `postgres_data` Docker volume.

## Environment variables

`DATABASE_URL` is required and validated on server startup. Keep real values in `.env`; `.env.example` contains a local-development-only placeholder.

## Commands

| Command               | Purpose                                   |
| --------------------- | ----------------------------------------- |
| `npm run format`      | Check Prettier formatting.                |
| `npm run lint`        | Run ESLint.                               |
| `npm run typecheck`   | Run strict TypeScript checking.           |
| `npm test`            | Run unit and component tests.             |
| `npm run build`       | Create a production build.                |
| `npm run test:e2e`    | Run the Playwright smoke test.            |
| `npm run db:generate` | Generate Prisma Client.                   |
| `npm run db:migrate`  | Create and apply a development migration. |
| `npm run db:deploy`   | Apply committed migrations.               |

## Quality and CI

`npm run check` runs formatting, linting, type checking, and unit tests. GitHub Actions repeats those checks, builds the app, and runs Playwright against a PostgreSQL service container. The workflow has read-only repository permissions and uses npm dependency caching.

## Security and accessibility

- Environment variables are schema-validated with Zod.
- Security headers disable framing, MIME sniffing, and unnecessary browser capabilities.
- UI primitives use semantic elements, visible keyboard focus, and touch-friendly minimum targets.
- Global styles respect reduced-motion preferences.
