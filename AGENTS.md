# Readems contributor guidance

## Scope

This repository contains the production foundation for Readems. Do not add product features, authentication, or domain-specific database models unless the task explicitly requests them.

## Engineering standards

- Keep TypeScript strict and avoid `any`.
- Validate new environment variables in `src/lib/env.ts`, document safe placeholders in `.env.example`, and never commit secrets.
- Keep components semantic and keyboard-accessible. Preserve visible focus styles and respect reduced-motion preferences.
- Use Prisma migrations for all schema changes; do not edit applied migrations.
- Prefer Server Components. Add `'use client'` only where browser interactivity is necessary.

## Required verification

Before submitting changes, run `npm run format`, `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`. Run `npm run test:e2e` for user-facing changes.
