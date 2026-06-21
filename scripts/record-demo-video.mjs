/**
 * Records a ChaosForge demo video with a live simulation running.
 * Output: docs/videos/chaosforge-demo.webm
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE = "http://localhost:3000";
const API = "http://localhost:3001";
const OUT_DIR = path.resolve("docs/videos");

const LOGIN = {
  email: process.env.CF_EMAIL || "yashuyouwaraj@gmail.com",
  password: process.env.CF_PASSWORD || "123456",
};

const PROJECT_ID = "6a34030d92f37cb5ebd4a182";

const SIMULATION_CONFIG = {
  url: "http://localhost:3001/health",
  config: {
    pattern: "stages",
    concurrency: 10,
    method: "GET",
    headers: {},
    queryParams: {},
    stages: [
      { durationSec: 60, rate: 20 },
      { durationSec: 60, rate: 60 },
      { durationSec: 60, rate: 100 },
      { durationSec: 60, rate: 60 },
      { durationSec: 60, rate: 20 },
    ],
  },
};

async function login(page) {
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded", timeout: 60000 });
  const emailInput = page.locator('input[type="email"]');
  const passwordInput = page.locator('input[type="password"]');
  await emailInput.click();
  await emailInput.fill(LOGIN.email);
  await passwordInput.click();
  await passwordInput.fill(LOGIN.password);
  await page.getByRole("button", { name: "Login" }).click();

  try {
    await page.waitForURL("**/projects**", { timeout: 20000 });
    return;
  } catch {
    const result = await page.evaluate(
      async ({ email, password, apiBase }) => {
        const res = await fetch(`${apiBase}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.message || data?.error || "Login failed");
        }
        localStorage.setItem("token", data.token);
        return data.token;
      },
      { email: LOGIN.email, password: LOGIN.password, apiBase: API },
    );
    if (!result) {
      throw new Error("Unable to authenticate for demo recording");
    }
    await page.goto(`${BASE}/projects`, { waitUntil: "networkidle", timeout: 60000 });
  }
}

async function startSimulation(token) {
  const response = await fetch(`${API}/test/${PROJECT_ID}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(SIMULATION_CONFIG),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || data?.message || "Failed to start simulation");
  }
  return data.runId;
}

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function scrollToText(page, text) {
  const target = page.locator(`text=${text}`).first();
  await target.waitFor({ state: "visible", timeout: 60000 });
  await target.scrollIntoViewIfNeeded();
  await wait(2000);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
    recordVideo: {
      dir: OUT_DIR,
      size: { width: 1440, height: 900 },
    },
  });

  const page = await context.newPage();

  // Intro — landing page
  await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 90000 });
  await wait(4000);
  await page.evaluate(() => window.scrollTo({ top: 900, behavior: "smooth" }));
  await wait(3000);
  await page.evaluate(() => window.scrollTo({ top: 1800, behavior: "smooth" }));
  await wait(3000);

  // Login
  await login(page);
  await wait(2500);

  // Start simulation via API
  const token = await page.evaluate(() => localStorage.getItem("token"));
  const runId = await startSimulation(token);
  console.log(`Started run ${runId}`);

  await page.evaluate(
    ({ projectId, activeRunId }) => {
      localStorage.setItem("projectId", projectId);
      localStorage.setItem("currentRunId", activeRunId);
      localStorage.setItem("currentRunActive", "true");
    },
    { projectId: PROJECT_ID, activeRunId: runId },
  );

  // Dashboard with live metrics
  await page.goto(
    `${BASE}/dashboard?projectId=${PROJECT_ID}&runId=${runId}`,
    { waitUntil: "networkidle", timeout: 90000 },
  );
  await wait(6000);
  await scrollToText(page, "Request Throughput");
  await wait(5000);
  await scrollToText(page, "Latency Distribution");
  await wait(4000);
  await scrollToText(page, "Realtime Infrastructure Feed");
  await wait(4000);

  // Simulations workspace
  await page.goto(`${BASE}/simulations`, { waitUntil: "networkidle", timeout: 90000 });
  await wait(5000);
  await scrollToText(page, "Active Simulations");
  await wait(4000);
  await scrollToText(page, "Simulation History");
  await wait(4000);

  // Chaos page
  await page.goto(`${BASE}/chaos`, { waitUntil: "networkidle", timeout: 90000 });
  await wait(4000);

  // AI copilot
  await page.goto(`${BASE}/ai`, { waitUntil: "networkidle", timeout: 90000 });
  await wait(4000);

  const video = page.video();
  await page.close();
  await context.close();
  await browser.close();

  const rawPath = await video.path();
  const finalPath = path.join(OUT_DIR, "chaosforge-demo.webm");
  if (fs.existsSync(finalPath)) {
    fs.unlinkSync(finalPath);
  }
  fs.renameSync(rawPath, finalPath);
  console.log(`Demo video saved to ${finalPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
