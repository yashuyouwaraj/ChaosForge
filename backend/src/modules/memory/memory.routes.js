const express = require("express");

const { getMemory, createMemory } = require("./memory.controller");

const authMiddleware = require("../../middleware/auth.middleware");

const router = express.Router();

router.get("/:projectId", authMiddleware, getMemory);
router.post("/test",authMiddleware, createMemory);

module.exports = router;
