/**
 * Local README screenshot capture script.
 * Starts a live simulation, waits for metrics, and captures full-page + section shots.
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const jwt = require(path.resolve("backend/node_modules/jsonwebtoken"));

const BASE = "http://localhost:3000";
const API = "http://localhost:3001";
const OUT = path.resolve("docs/images");

const LOGIN = {
  email: process.env.CF_EMAIL || "yashuyouwaraj@gmail.com",
  password: process.env.CF_PASSWORD || "123456",
};

const EXISTING_USER = {
  id: "6a34030592f37cb5ebd4a17f",
  email: LOGIN.email,
  role: "user",
  plan: "pro",
  planStatus: "active",
  planExpiresAt: null,
};

const PROJECT_ID = "6a34030d92f37cb5ebd4a182";
const RUN_ID = "4d221413-59a8-4de5-b5ea-68321e1839a7";

const SIMULATION_CONFIG = {
  url: "http://localhost:3001/health",
  config: {
    pattern: "stages",
    concurrency: 10,
    method: "GET",
    headers: {},
    queryParams: {},
    stages: [
      { durationSec: 45, rate: 15 },
      { durationSec: 45, rate: 45 },
      { durationSec: 45, rate: 75 },
      { durationSec: 45, rate: 45 },
      { durationSec: 45, rate: 15 },
    ],
  },
};

function readJwtSecret() {
  const envPath = path.resolve("backend/.env.development");
  const raw = fs.readFileSync(envPath, "utf8");
  const match = raw.match(/^JWT_SECRET=(.+)$/m);
  if (!match) {
    throw new Error("JWT_SECRET not found in backend/.env.development");
  }
  return match[1].replace(/^"|"$/g, "");
}

function createToken() {
  return jwt.sign(
    {
      id: EXISTING_USER.id,
      email: EXISTING_USER.email,
      role: EXISTING_USER.role,
      plan: EXISTING_USER.plan,
      planStatus: EXISTING_USER.planStatus,
      planExpiresAt: EXISTING_USER.planExpiresAt,
    },
    readJwtSecret(),
    { expiresIn: "2h" },
  );
}

async function capture(page, name, options = {}) {
  const { fullPage = false, clip = null, element = null } = options;
  await page.waitForTimeout(options.waitMs ?? 2500);
  const file = path.join(OUT, `${name}.png`);

  if (element) {
    await element.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);
    await element.screenshot({ path: file });
  } else {
    const screenshotOptions = { path: file, fullPage };
    if (clip) {
      screenshotOptions.clip = clip;
    }
    await page.screenshot(screenshotOptions);
  }

  console.log(`Saved ${file}`);
}

async function scrollToSelector(page, selector, optional = false) {
  const target = page.locator(selector).first();
  try {
    await target.waitFor({ state: "visible", timeout: optional ? 15000 : 60000 });
    await target.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    return true;
  } catch (error) {
    if (optional) {
      console.warn(`Optional selector not found: ${selector}`);
      return false;
    }
    throw error;
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

  console.log(`Started simulation run ${data.runId}`);
  return data.runId;
}

async function waitForRunMetrics(token, runId, attempts = 24) {
  for (let i = 0; i < attempts; i += 1) {
    const response = await fetch(`${API}/runs/${PROJECT_ID}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const runs = await response.json();
    const active = Array.isArray(runs)
      ? runs.find((run) => run.runId === runId)
      : null;

    if (active && Number(active.metrics?.totalRequests || 0) > 5) {
      console.log(
        `Run ${runId} has ${active.metrics.totalRequests} requests — capturing live metrics`,
      );
      return active;
    }

    await new Promise((resolve) => setTimeout(resolve, 2500));
  }

  console.warn(`Run ${runId} metrics still warming up — capturing best-effort screenshots`);
  return null;
}

async function primeRunContext(page, runId) {
  await page.evaluate(
    ({ projectId, activeRunId }) => {
      localStorage.setItem("projectId", projectId);
      localStorage.setItem("currentRunId", activeRunId);
      localStorage.setItem("currentRunActive", "true");
    },
    { projectId: PROJECT_ID, activeRunId: runId },
  );
}

async function loginViaUi(page) {
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
    console.log(`Logged in as ${LOGIN.email}`);
    return true;
  } catch {
    const errorText = await page.locator("form p.text-red-200").textContent().catch(() => "");
    console.warn(`UI login failed${errorText ? `: ${errorText.trim()}` : ""} — falling back to API login`);
  }

  return false;
}

async function loginViaApi(page) {
  const result = await page.evaluate(
    async ({ email, password, apiBase }) => {
      const res = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { ok: false, error: data?.message || data?.error || "Login failed" };
      }
      localStorage.setItem("token", data.token);
      return { ok: true, token: data.token };
    },
    { email: LOGIN.email, password: LOGIN.password, apiBase: API },
  );

  if (result.ok) {
    console.log(`API login succeeded for ${LOGIN.email}`);
    return result.token;
  }

  console.warn(`API login failed: ${result.error} — using locally signed JWT`);
  return createToken();
}

async function authenticate(page) {
  const uiOk = await loginViaUi(page);
  if (uiOk) {
    return getAuthToken(page);
  }
  return loginViaApi(page);
}

async function getAuthToken(page) {
  return page.evaluate(() => localStorage.getItem("token"));
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: "dark",
  });

  const page = await context.newPage();

  // --- Public pages ---
  await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 90000 });
  await capture(page, "landing-page");

  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await capture(page, "login");

  await page.goto(`${BASE}/signup`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await capture(page, "register");

  // --- Landing page sections (full scroll coverage) ---
  await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 90000 });

  const landingSections = [
    ["landing-hero", "main"],
    ["landing-workflow", "#workflow"],
    ["landing-chaos", "#chaos"],
    ["landing-ai-copilot", "#ai-copilot"],
    ["landing-architecture", "#architecture"],
    ["landing-dashboard-showcase", "#dashboard"],
    ["landing-intelligence", "#intelligence"],
    ["landing-pricing", "#pricing"],
  ];

  for (const [name, selector] of landingSections) {
    await scrollToSelector(page, selector);
    await capture(page, name);
  }

  await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 90000 });
  await capture(page, "landing-page-full", { fullPage: true, waitMs: 4000 });

  // --- Authenticate via login form (with API/JWT fallback) ---
  const token = await authenticate(page);
  await page.evaluate(
    ({ projectId }) => localStorage.setItem("projectId", projectId),
    { projectId: PROJECT_ID },
  );

  // --- Start live simulation before authenticated captures ---
  const activeRunId = await startSimulation(token);
  await waitForRunMetrics(token, activeRunId);
  await primeRunContext(page, activeRunId);

  // --- Dashboard: overview + live metrics ---
  await page.goto(
    `${BASE}/dashboard?projectId=${PROJECT_ID}&runId=${activeRunId}`,
    { waitUntil: "networkidle", timeout: 90000 },
  );
  await capture(page, "dashboard", { waitMs: 5000 });

  await scrollToSelector(page, 'text=Realtime Telemetry');
  await capture(page, "dashboard-realtime-telemetry", { waitMs: 3500 });

  await scrollToSelector(page, 'text=Request Throughput');
  await capture(page, "dashboard-running-graphs", { waitMs: 4000 });

  await scrollToSelector(page, 'text=Latency Distribution');
  await capture(page, "dashboard-latency-buckets", { waitMs: 3500 });

  if (await scrollToSelector(page, 'text=Realtime Infrastructure Feed', true)) {
    await capture(page, "dashboard-live-logs", { waitMs: 3500 });
  }

  if (await scrollToSelector(page, 'text=Incident Timeline', true)) {
    await capture(page, "dashboard-incident-timeline", { waitMs: 3500 });
  }

  await page.goto(
    `${BASE}/dashboard?projectId=${PROJECT_ID}&runId=${activeRunId}`,
    { waitUntil: "networkidle", timeout: 90000 },
  );
  await capture(page, "dashboard-running-simulation", { waitMs: 5000 });

  await page.goto(
    `${BASE}/dashboard?projectId=${PROJECT_ID}&runId=${activeRunId}`,
    { waitUntil: "networkidle", timeout: 90000 },
  );
  await capture(page, "dashboard-full", { fullPage: true, waitMs: 6000 });

  // --- Simulations workspace ---
  await page.goto(`${BASE}/simulations`, { waitUntil: "networkidle", timeout: 90000 });
  await capture(page, "simulations", { waitMs: 4000 });

  await scrollToSelector(page, "#create-simulation-panel");
  await capture(page, "simulations-create", { waitMs: 3000 });

  await scrollToSelector(page, 'text=Active Simulations');
  await capture(page, "simulations-active", { waitMs: 3500 });

  await scrollToSelector(page, 'h2:text("Simulation History")');
  const historyPanel = page.locator("section.glass").filter({ hasText: "Simulation History" });
  if (await historyPanel.count()) {
    await capture(page, "simulation-history", { element: historyPanel, waitMs: 2000 });
  } else {
    await capture(page, "simulation-history", { waitMs: 3000 });
  }

  if (await scrollToSelector(page, 'text=Run Comparison', true)) {
    await capture(page, "simulations-run-comparison", { waitMs: 3000 });
  }

  await page.goto(`${BASE}/simulations`, { waitUntil: "networkidle", timeout: 90000 });
  await capture(page, "simulations-full", { fullPage: true, waitMs: 5000 });

  // Running simulation graphs live on the dashboard
  await page.goto(
    `${BASE}/dashboard?projectId=${PROJECT_ID}&runId=${activeRunId}`,
    { waitUntil: "networkidle", timeout: 90000 },
  );
  if (await scrollToSelector(page, 'text=Request Throughput', true)) {
    await capture(page, "simulation-running", { waitMs: 5000 });
  } else {
    await capture(page, "simulation-running", { waitMs: 4000 });
  }

  // --- Remaining authenticated pages ---
  const authPages = [
    ["projects", "/projects"],
    ["chaos-page", "/chaos"],
    ["observability", "/observability"],
    ["ai-copilot", "/ai"],
    ["ask-chaosforge", "/ask"],
    ["reports", "/reports"],
    ["report-preview", `/reports/${RUN_ID}`],
    ["run-details", `/reports/${RUN_ID}`],
    ["infrastructure", "/infrastructure"],
    ["settings", "/settings"],
  ];

  for (const [name, url] of authPages) {
    await page.goto(`${BASE}${url}`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await capture(page, name);
  }

  await page.goto(`${BASE}/settings`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await capture(page, "ai-settings", { waitMs: 3000 });

  await page.goto("http://localhost:5000/d/chaosforge-metrics/chaosforge-metrics", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await capture(page, "grafana-dashboard", { waitMs: 5000 });

  await page.goto("http://localhost:9090/targets", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await capture(page, "prometheus-panels", { waitMs: 4000 });

  await browser.close();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
