const express = require('express');

const testRoutes = require("./routes/test.routes");

const app = express();

app.use(express.json());

app.use("/",testRoutes);

module.exports = app;