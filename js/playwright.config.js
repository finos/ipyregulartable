import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  testMatch: "jupyterlite.spec.js",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 300_000,
  reporter: [["line"]],
  use: {
    baseURL: "http://127.0.0.1:8878",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "python -m http.server 8878 --bind 127.0.0.1 --directory ../dist",
    url: "http://127.0.0.1:8878/lite/lab/index.html",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
