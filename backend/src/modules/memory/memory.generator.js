const InfrastructureMemory = require("./memory.model");
const { saveMemory } = require("./memory.service");
const logger = require("../../utils/logger");

const generateInfrastructureMemory = async (run) => {
  try {
    logger.info({
      message: "Generating infrastructure memory",
      projectId: run.projectId,
      runId: run.runId,
      metrics: {
        p95Latency: run.p95Latency,
        failure: run.failure,
        avgLatency: run.avgLatency,
        rps: run.rps,
      },
    });

    const memories = [];

    if (run.p95Latency > 100) {
      memories.push({
        projectId: run.projectId,
        runId: run.runId,
        patternType: "tail_latency",
        severity: "high",
        title: "Recurring Tail Latency",
        description: "P95 latency exceeded 100ms during execution.",
        recommendation: "Inspect worker saturation and backend bottlenecks.",
      });
    }

    if (run.failure > 5) {
      memories.push({
        projectId: run.projectId,
        runId: run.runId,
        patternType: "failure_escalation",
        severity: "critical",
        title: "Failure Escalation",
        description: "Failure volume exceeded operational thresholds.",
        recommendation: "Investigate dependency instability and retry storms.",
      });
    }

    if (run.avgLatency > 500 || run.rps > 50) {
      memories.push({
        projectId: run.projectId,
        runId: run.runId,
        patternType: "infrastructure_saturation",
        severity: "high",
        title: "Infrastructure Saturation",
        description: "High throughput combined with elevated latency.",
        recommendation: "Increase worker capacity and optimize queues.",
      });
    }

    if (memories.length === 0) {
      logger.debug({
        message: "No infrastructure memory conditions met",
        projectId: run.projectId,
        runId: run.runId,
      });
      return;
    }

    for (const memory of memories) {
      try {
        const exists = await InfrastructureMemory.findOne({
          projectId: memory.projectId,
          runId: memory.runId,
          patternType: memory.patternType,
        });

        if (!exists) {
          await saveMemory(memory);
          logger.info({
            message: "Infrastructure memory saved",
            projectId: memory.projectId,
            runId: memory.runId,
            patternType: memory.patternType,
          });
        } else {
          logger.debug({
            message: "Infrastructure memory already exists, skipping duplicate",
            projectId: memory.projectId,
            runId: memory.runId,
            patternType: memory.patternType,
          });
        }
      } catch (err) {
        logger.error({
          message: "Failed to save infrastructure memory",
          projectId: memory.projectId,
          runId: memory.runId,
          patternType: memory.patternType,
          error: err.message,
        });
      }
    }
  } catch (err) {
    logger.error({
      message: "Error in generateInfrastructureMemory",
      projectId: run.projectId,
      runId: run.runId,
      error: err.message,
    });
  }
};

module.exports = {
  generateInfrastructureMemory,
};
