const express = require("express");

const { getRunIncidents } = require("../controllers/incidents.controller");

const router = express.Router();

router.get("/:runId", getRunIncidents);

module.exports = router;
