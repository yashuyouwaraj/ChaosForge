const express = require('express');

const metricsRoutes = require("./routes/metrics.routes");
const testRoutes = require("./routes/test.routes");
const requestIdMiddleware = require("./middleware/requestId");
const authRoutes = require("./modules/auth/auth.routes");
const projectRoutes = require("./modules/project/project.routes");

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());

app.use("/auth",authRoutes);

app.use(requestIdMiddleware)

app.use("/projects", projectRoutes);

app.use("/",testRoutes);

app.use("/",metricsRoutes)

module.exports = app;
