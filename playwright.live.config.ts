import { defineConfig } from "@playwright/test";

/**
 * Smoke config for a deployed instance: no local web server, the base URL comes
 * from PLAYWRIGHT_LIVE_URL (e.g. https://modali.powerpme.com/maisontech).
 */
const baseURL = process.env.PLAYWRIGHT_LIVE_URL;
if (!baseURL) {
  throw new Error("PLAYWRIGHT_LIVE_URL is required, e.g. https://modali.powerpme.com/maisontech");
}

export default defineConfig({
  testDir: "./tests/live",
  timeout: 90_000,
  retries: 1,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL,
    headless: true,
    trace: "retain-on-failure",
  },
});
