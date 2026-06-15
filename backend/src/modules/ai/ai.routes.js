const express = require("express");

const authMiddleware = require("../../middleware/auth.middleware");

const { getAnalysis } = require("./ai.controller");

const router = express.Router();

router.get("/:projectId/:runId", authMiddleware, getAnalysis);

module.exports = router;