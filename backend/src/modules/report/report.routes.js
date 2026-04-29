const express = require("express");

const { downloadCSV, downloadPDF } = require("./report.controller");

const router = express.Router();
router.get("/pdf/:projectId", downloadPDF);
router.get("/csv/:projectId", downloadCSV);

module.exports = { router };
