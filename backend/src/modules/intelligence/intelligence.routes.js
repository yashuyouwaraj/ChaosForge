const express = require("express");

const authMiddleware = require("../../middleware/auth.middleware");
const { getIntelligence } = require("./intelligence.controller");

const router = express.Router();

router.get("/:projectId/:runId", authMiddleware, getIntelligence);

module.exports = router;
