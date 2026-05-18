import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:8000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Starts FastAPI automatically before tests.
  // reuseExistingServer: true → if already running, doesn't start another.
  webServer: {
    command: '.venv/bin/uvicorn app.main:app --port 8000',
    url: 'http://localhost:8000',
    reuseExistingServer: true,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
