const express = require("express");

const { downloadCSV, downloadPDF, downloadJSON } = require("./report.controller");

const router = express.Router();
router.get("/pdf/:projectId/:runId", downloadPDF);
router.post("/pdf/:projectId/:runId", downloadPDF);
router.get("/csv/:projectId/:runId", downloadCSV);
router.get("/json/:projectId/:runId", downloadJSON);

module.exports = { router };
