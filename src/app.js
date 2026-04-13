const express = require('express');

const metricsRoutes = require("./routes/metrics.routes");
const testRoutes = require("./routes/test.routes");

const app = express();

app.use(express.json());

app.use("/",testRoutes);

app.use("/",metricsRoutes)

module.exports = app;