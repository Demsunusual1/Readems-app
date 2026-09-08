# Readems contributor guidance

## Scope

This repository is the Readems product. Build features against the database
rather than against constants in the source: a number on screen should either
be computed from stored data or say plainly that it is unavailable. Sample
content belongs in `src/lib/seed-data.ts` and is loaded by `npm run db:seed`.

## Engineering standards

- Keep TypeScript strict and avoid `any`.
- Validate new environment variables in `src/lib/env.ts`, document safe placeholders in `.env.example`, and never commit secrets.
- Keep components semantic and keyboard-accessible. Preserve visible focus styles and respect reduced-motion preferences.
- Use Prisma migrations for all schema changes; do not edit applied migrations.
- Write the failing test first. Logic that touches the database belongs in a
  `*.db.test.ts` file, which runs against the local PostgreSQL container.
- Prefer Server Components. Add `'use client'` only where browser interactivity is necessary.

## Required verification

Before submitting changes, run `npm run format`, `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`. Run `npm run test:e2e` for user-facing changes.
