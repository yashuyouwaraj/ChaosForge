const express = require("express");

const { getRuns, compare } = require("./run.controller");

const router = express.Router();

router.get("/compare", compare); // 👉 MUST come before /:projectId
router.get("/:projectId", getRuns);

module.exports = router;
