const Run = require("./run.model");
const logger = require("../../utils/logger");

const saveRun = async (data) => {
  try {
    logger.info({
      message: "Saving run to database",
      projectId: data.projectId,
      runId: data.runId,
      status: data.status,
      metrics: {
        totalRequests: data.totalRequests,
        success: data.success,
        failure: data.failure,
        avgLatency: data.avgLatency,
        p95Latency: data.p95Latency,
        rps: data.rps,
        hasErrorTypes: !!data.errorTypes,
        hasLatencyBuckets: !!data.latencyBuckets,
      },
    });
    return await Run.findOneAndUpdate(
      { projectId: data.projectId, runId: data.runId },
      { $set: data },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
  } catch (err) {
    logger.error({
      message: "Error saving run",
      error: err.message,
      data,
    });
    throw err;
  }
};

const getRunsByProject = async (projectId) => {
  try {
    return await Run.find({ projectId }).sort({ createdAt: -1 });
  } catch (err) {
    logger.error({
      message: "Error fetching runs",
      error: err.message,
      projectId,
    });
    throw err;
  }
};

module.exports = {
  saveRun,
  getRunsByProject,
};
