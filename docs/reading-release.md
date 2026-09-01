# Reading experience release

This change adds a `ReadingProgress` table. It does not modify or seed existing user data. Demo chapter text is versioned in `src/lib/chapters.ts`; it is not presented as a published creator submission.

## Database rollout

Before enabling saved progress in a deployment, run `npm run db:deploy` against that deployment's configured PostgreSQL database. CI runs this against its isolated test database.

Do not run preview migrations against production by assuming the databases are isolated. Confirm the preview DATABASE_URL points to a dedicated preview database, then apply the migration through the existing deployment workflow. No migration is run automatically by the application or by `npm run build`.

Reading works without the new table; unavailable progress is reported honestly and never shown as saved. Apply the migration to production when this change is approved for release, then verify an authenticated save and resume. Do not remove the table on rollback: it is additive and the previous application ignores it.

## Included

- Story-detail pages for the sample catalogue; two original sample chapters for Beneath the Baobab Tree.
- Text size and light/dark preferences stored on the current device.
- Explicit save-place and complete-chapter actions, with account-isolated PostgreSQL persistence.
- Story-details resume link. Guests may read but cannot save account progress.

Comments, likes, library management, creator publishing, and automatic progress tracking are not included in this slice.
