const express = require("express");
const { verifyProjectOwnership } = require("../../middleware/ownership.middleware");
const { getRuns, compare } = require("./run.controller");
const authMiddleware = require("../../middleware/auth.middleware");

const router = express.Router();

router.get("/compare",authMiddleware, compare); // 👉 MUST come before /:projectId
router.get("/:projectId",authMiddleware, verifyProjectOwnership, getRuns);

module.exports = router;
