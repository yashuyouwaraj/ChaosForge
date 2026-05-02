const express = require("express");

const {getMetrics} = require("../metrics/metrics.store")

const router = express.Router();

router.get("/metrics/:projectId", async (req, res) => {
    res.json(await getMetrics(req.params.projectId))
})

module.exports = router;
