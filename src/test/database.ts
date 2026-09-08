// Database-backed tests read the same DATABASE_URL the application uses.
// Next.js loads .env by itself; Vitest does not, so load it here when the
// variable is not already provided by the environment (as CI provides it).
if (!process.env.DATABASE_URL) {
  try {
    process.loadEnvFile();
  } catch {
    // No .env file: the missing-variable message below is the useful error.
  }
}

if (!process.env.DATABASE_URL)
  throw new Error(
    'DATABASE_URL is required for database tests. Copy .env.example to .env and run docker compose up -d.',
  );
