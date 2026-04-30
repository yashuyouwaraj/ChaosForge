const express = require("express");

const {getMetrics} = require("../metrics/metrics.store")

const router = express.Router();

router.get("/metrics/:projectId", (req, res) => {
    res.json(getMetrics(req.params.projectId))
})

module.exports = router;
