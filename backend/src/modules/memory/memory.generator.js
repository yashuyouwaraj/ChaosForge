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
        confidence: Math.min(100, Math.round((run.p95Latency / 500) * 100)),
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
        confidence: Math.min(100, Math.round((run.failure / 20) * 100)),
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
        confidence: Math.min(100, Math.round((run.rps / 100) * 100)),
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
          patternType: memory.patternType,
        }).sort({ updatedAt: -1 });

        if (!exists) {
          await saveMemory({
            ...memory,
            description: memory.description,
            detectionCount: 1,
            firstDetectedAt: new Date(),
            lastDetectedAt: new Date(),
            trend: "emerging",
          });
        } else {
          exists.runId = run.runId;
          exists.title = memory.title;
          exists.description = memory.description;
          exists.recommendation = memory.recommendation;
          exists.severity = memory.severity;
          exists.lastDetectedAt = new Date();
          exists.detectionCount += 1;
          exists.confidence = Math.max(
            exists.confidence,
            memory.confidence || 0,
          );
          if (exists.detectionCount >= 5) {
            exists.trend = "degrading";
          } else if (exists.detectionCount >= 2) {
            exists.trend = "stable";
          }

          await exists.save();
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
