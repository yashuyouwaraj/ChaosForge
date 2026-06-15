const express = require("express");

const { getAllIncidents, getRunIncidents } = require("../controllers/incidents.controller");

const router = express.Router();

router.get("/", getAllIncidents);
router.get("/:runId", getRunIncidents);

module.exports = router;
