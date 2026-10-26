import { defineConfig, devices } from "@playwright/test";
import { rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * Playwright runs against a real production server (`next start`), on its own
 * port, with a throwaway database so the demo data in `.data/` is never mutated
 * by a test run.
 */
const PORT = 3021;
const DB_PATH = path.join(os.tmpdir(), `maisontech-e2e-${process.pid}.json`);

// A fresh database for every run: orders and stock changes are not cumulative.
rmSync(DB_PATH, { force: true });

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./tests/.artifacts",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    locale: "fr-TN",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://127.0.0.1:${PORT}/api/auth/me`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: { DEMO_DB_PATH: DB_PATH, NODE_ENV: "production" },
  },
});
