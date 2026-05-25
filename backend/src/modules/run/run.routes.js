const express = require("express");
const { verifyProjectOwnership } = require("../../middleware/ownership.middleware");
const { getRuns, getRunDetails, compare } = require("./run.controller");
const authMiddleware = require("../../middleware/auth.middleware");

const router = express.Router();

router.get("/compare",authMiddleware, compare); // 👉 MUST come before /:projectId
router.get("/details/:runId", authMiddleware, getRunDetails);
router.get("/:projectId",authMiddleware, verifyProjectOwnership, getRuns);

module.exports = router;
