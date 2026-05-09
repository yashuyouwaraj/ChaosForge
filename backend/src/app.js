const express = require("express");
const cors = require("cors");

const metricsRoutes = require("./routes/metrics.routes");
const testRoutes = require("./routes/test.routes");
const requestIdMiddleware = require("./middleware/requestId");
const authRoutes = require("./modules/auth/auth.routes");
const projectRoutes = require("./modules/project/project.routes");
const paymentRoutes = require("./modules/payment/payment.routes");
const reportRoutes = require("./modules/report/report.routes");
const runRoutes = require("./modules/run/run.routes");
const healthRoutes = require("./routes/health.routes");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    process.env.CORS_ORIGIN || "http://localhost:3000",
  );
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.post(
  "/payment/webhook",
  express.raw({ type: "*/*" }),
  paymentRoutes.webhookHandler,
);

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

app.use("/payment", paymentRoutes.router);
app.use("/auth", authRoutes);

app.use(requestIdMiddleware);

app.use("/projects", projectRoutes);

app.use("/report", reportRoutes.router);

app.use("/", testRoutes);

app.use("/", metricsRoutes);

app.use("/runs", runRoutes);

app.use("/health", healthRoutes);

module.exports = app;
