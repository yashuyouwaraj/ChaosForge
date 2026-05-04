const express = require("express");

const {getMetrics} = require("../metrics/metrics.store")
const Run = require("../modules/run/run.model");

const router = express.Router();

router.get("/metrics/:projectId", async (req, res) => {
    const { projectId } = req.params;
    const savedRun = req.query.runId
        ? await Run.findOne({ projectId, runId: req.query.runId })
        : await Run.findOne({ projectId }).sort({ createdAt: -1 });
    const runId = savedRun?.runId;

    if (!runId) {
        return res.json(await getMetrics(projectId));
    }

    const metrics = await getMetrics(projectId, runId);

    if (metrics.totalRequests > 0 || !savedRun?.totalRequests) {
        return res.json(metrics);
    }

    return res.json({
        totalRequests: savedRun.totalRequests || 0,
        success: savedRun.success || 0,
        failure: savedRun.failure || 0,
        avgLatency: savedRun.avgLatency || 0,
        p95Latency: savedRun.p95Latency || 0,
        rps: savedRun.rps || 0,
        currentRps: 0,
        latencyBuckets: savedRun.latencyBuckets || {
            "0-500": 0,
            "500-1000": 0,
            "1000-2000": 0,
            "2000+": 0,
        },
        errorTypes: savedRun.errorTypes || {
            timeout: 0,
            network: 0,
            server: 0,
        },
        failureTimeline: savedRun.failureTimeline || [],
    })
})

module.exports = router;
