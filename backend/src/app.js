const express = require('express');

const metricsRoutes = require("./routes/metrics.routes");
const testRoutes = require("./routes/test.routes");
const requestIdMiddleware = require("./middleware/requestId");
const authRoutes = require("./modules/auth/auth.routes");

const app = express();

app.use(express.json());

app.use("/auth",authRoutes);

app.use(requestIdMiddleware)

app.use("/",testRoutes);

app.use("/",metricsRoutes)

module.exports = app;