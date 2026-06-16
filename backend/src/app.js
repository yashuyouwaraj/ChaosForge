const express = require("express");
const cors = require("cors");
const incidentRoutes = require("./routes/incidents.routes");

const metricsRoutes = require("./routes/metrics.routes");
const testRoutes = require("./routes/test.routes");

const requestIdMiddleware = require("./middleware/requestId");
const memoryRoutes = require("./modules/memory/memory.routes");
const authRoutes = require("./modules/auth/auth.routes");
const projectRoutes = require("./modules/project/project.routes");
const paymentRoutes = require("./modules/payment/payment.routes");
const reportRoutes = require("./modules/report/report.routes");
const runRoutes = require("./modules/run/run.routes");
const usageRoutes = require("./modules/usage/usage.routes");
const aiRouter = require("./modules/ai/ai.routes");
const healthRoutes = require("./routes/health.routes");

const { client, httpRequestsTotal } = require("./metrics/prometheus");
const { getPrometheusSimulationMetrics } = require("./metrics/metrics.store");

const app = express();

const parseAllowedOrigins = () => {
  const configuredOrigins = [
    process.env.FRONTEND_URL,
    process.env.CORS_ORIGIN,
    "http://localhost:3000",
  ];

  return configuredOrigins
    .flatMap((origin) => (origin || "").split(","))
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean);
};

const allowedOrigins = parseAllowedOrigins();

/**
 * 💀 CORS
 */
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      const normalizedOrigin = origin.replace(/\/+$/, "");

      if (allowedOrigins.includes(normalizedOrigin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  }),
);

/**
 * 💀 PROMETHEUS HTTP REQUEST COUNTER
 */
app.use((req, res, next) => {
  httpRequestsTotal.inc();

  next();
});

/**
 * 💀 STRIPE / PAYMENT WEBHOOK
 * MUST come before express.json()
 */
app.post(
  "/payment/webhook",
  express.raw({ type: "*/*" }),
  paymentRoutes.webhookHandler,
);

/**
 * 💀 BODY PARSERS
 */
app.use(express.json({ limit: "25mb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "25mb",
  }),
);

/**
 * 💀 REQUEST ID
 */
app.use(requestIdMiddleware);

/**
 * 💀 ROUTES
 */
app.use("/auth", authRoutes);

app.use("/projects", projectRoutes);

app.use("/payment", paymentRoutes.router);

app.use("/report", reportRoutes.router);

app.use("/runs", runRoutes);

app.use("/usage", usageRoutes.router);

app.use("/health", healthRoutes);

app.use("/", metricsRoutes);

app.use("/", testRoutes);

app.use("/api/incidents", incidentRoutes);

app.use("/api/ai", aiRouter);

app.use("/api/memory", memoryRoutes);

/**
 * 💀 PROMETHEUS METRICS ENDPOINT
 */
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);

  const inProcessMetrics = await client.register.metrics();
  const redisSimulationMetrics = await getPrometheusSimulationMetrics();
  const hiddenInProcessMetricNames = [
    "chaosforge_simulation_requests_total",
    "chaosforge_simulation_failures_total",
    "chaosforge_request_latency_ms",
  ];

  const visibleInProcessMetrics = inProcessMetrics
    .split("\n")
    .filter(
      (line) => !hiddenInProcessMetricNames.some((name) => line.includes(name)),
    )
    .join("\n");

  res.end(`${visibleInProcessMetrics}\n${redisSimulationMetrics}`);
});

module.exports = app;
