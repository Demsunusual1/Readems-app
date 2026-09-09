import { defineConfig, devices } from '@playwright/test';

// Point the suite at an app that is already running — the container from
// `docker compose --profile app up`, say — and Playwright starts nothing.
const runningApp = process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: runningApp ?? 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
    // Containers commonly cap /dev/shm at 64MB, which crashes the browser
    // part-way through a run. Chromium falls back to /tmp with this flag.
    launchOptions: { args: ['--disable-dev-shm-usage'] },
  },
  webServer: runningApp
    ? undefined
    : {
        command: process.env.CI
          ? 'npm run start -- --hostname 127.0.0.1'
          : 'npm run dev -- --hostname 127.0.0.1',
        url: 'http://127.0.0.1:3000',
        reuseExistingServer: !process.env.CI,
      },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
