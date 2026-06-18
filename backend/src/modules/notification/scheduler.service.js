const cron = require("node-cron");
const logger = require("../../utils/logger");
const User = require("../user/user.model");
const Settings = require("../settings/settings.model");
const InfrastructureMemory = require("../memory/memory.model");

const { sendWeeklyReportNotification } = require("./notification.service");

const Run = require("../run/run.model");

let scheduledTask = null;
let schedulerRunning = false;

const getRunFailureCount = (run) => {
  if (run.failure !== undefined && run.failure !== null) {
    return Number(run.failure || 0);
  }

  if (run.failures !== undefined && run.failures !== null) {
    return Number(run.failures || 0);
  }

  if (run.errorTypes && typeof run.errorTypes === "object") {
    return Object.values(run.errorTypes).reduce(
      (sum, value) => sum + Number(value || 0),
      0,
    );
  }

  if (Array.isArray(run.failureTimeline)) {
    return run.failureTimeline.length;
  }

  const totalRequests = Number(run.totalRequests || 0);
  const success = Number(run.success || 0);

  if (totalRequests > 0 && success >= 0 && success <= totalRequests) {
    return totalRequests - success;
  }

  return 0;
};

const calculateRunHealthScore = (run) => {
  if (Number.isFinite(run.healthScore)) {
    return run.healthScore;
  }

  const totalRequests = Number(run.totalRequests || 0);
  const failures = getRunFailureCount(run);
  const failureRate =
    totalRequests > 0 ? (failures / totalRequests) * 100 : 0;
  const p95Latency = Number(run.p95Latency || 0);
  const avgLatency = Number(run.avgLatency || 0);

  const failurePenalty = Math.min(45, Math.round(failureRate * 3));
  const tailPenalty =
    p95Latency > 0 ? Math.min(30, Math.round(p95Latency / 120)) : 0;
  const averagePenalty =
    avgLatency > 0 ? Math.min(15, Math.round(avgLatency / 200)) : 0;

  return Math.max(0, 100 - failurePenalty - tailPenalty - averagePenalty);
};

const runWeeklyReports = async () => {
  if (schedulerRunning) {
    logger.warn({
      message: "Weekly report scheduler skipped because previous run is still active",
    });
    return;
  }

  schedulerRunning = true;
  const startedAt = Date.now();

  try {
    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const users = await User.find({
      email: {
        $exists: true,
        $ne: "",
      },
    })
      .select("_id email")
      .lean();

    const userIds = users.map((user) => String(user._id));

    const userSettings = await Settings.find({
      owner: {
        $in: userIds,
      },
    })
      .select("owner notifications")
      .lean();

    const settingsByOwner = new Map(
      userSettings.map((setting) => [String(setting.owner), setting]),
    );

    const eligibleUsers = users.filter((user) => {
      const settings = settingsByOwner.get(String(user._id));

      if (!settings) {
        return true;
      }

      return (
        settings.notifications?.email === true &&
        settings.notifications?.weeklyReport === true
      );
    });

    const ownerIds = eligibleUsers.map((user) => String(user._id));

    if (ownerIds.length === 0) {
      logger.info({
        message: "Scheduler completed",
        users: 0,
        sent: 0,
        skipped: 0,
        durationMs: Date.now() - startedAt,
      });
      return;
    }

    const usersById = new Map(
      eligibleUsers.map((user) => [String(user._id), user]),
    );

    const weeklyRuns = await Run.find({
      owner: {
        $in: ownerIds,
      },
      createdAt: {
        $gte: oneWeekAgo,
        $lte: now,
      },
    })
      .sort({ createdAt: -1 })
      .lean();

    const runsByOwner = new Map();
    const projectIds = new Set();

    weeklyRuns.forEach((run) => {
      const ownerId = String(run.owner);

      if (!runsByOwner.has(ownerId)) {
        runsByOwner.set(ownerId, []);
      }

      runsByOwner.get(ownerId).push(run);

      if (run.projectId) {
        projectIds.add(run.projectId);
      }
    });

    const memories = projectIds.size
      ? await InfrastructureMemory.find({
          projectId: {
            $in: [...projectIds],
          },
        })
          .sort({
            detectionCount: -1,
            confidence: -1,
          })
          .lean()
      : [];

    const memoriesByProject = new Map();

    memories.forEach((memory) => {
      if (!memoriesByProject.has(memory.projectId)) {
        memoriesByProject.set(memory.projectId, []);
      }

      memoriesByProject.get(memory.projectId).push(memory);
    });

    let sentCount = 0;
    let skippedCount = 0;

    for (const ownerId of ownerIds) {
      try {
        const user = usersById.get(ownerId);

        if (!user) {
          skippedCount += 1;
          logger.warn({
            message: "Weekly report skipped because user no longer exists",
            userId: ownerId,
          });
          continue;
        }

        const userRuns = runsByOwner.get(ownerId) || [];
        const totalRuns = userRuns.length;

        if (totalRuns === 0) {
          skippedCount += 1;
          logger.info({
            message: "Skipping weekly report because user had no activity.",
            userId: ownerId,
          });
          continue;
        }

        const completedRuns = userRuns.filter(
          (run) => run.status === "completed",
        ).length;
        const failedRuns = userRuns.filter(
          (run) => run.status === "failed" || getRunFailureCount(run) > 0,
        ).length;
        const latestRun = userRuns[0] || null;
        const bestRun = userRuns.reduce((best, current) =>
          calculateRunHealthScore(current) >
          (best ? calculateRunHealthScore(best) : -1)
            ? current
            : best,
        null);
        const worstRun = userRuns.reduce((worst, current) =>
          calculateRunHealthScore(current) <
          (worst ? calculateRunHealthScore(worst) : 101)
            ? current
            : worst,
        null);
        const userProjectIds = new Set(
          userRuns.map((run) => run.projectId).filter(Boolean),
        );
        const topMemory = [...userProjectIds]
          .flatMap((projectId) => memoriesByProject.get(projectId) || [])
          .sort(
            (left, right) =>
              Number(right.detectionCount || 0) -
                Number(left.detectionCount || 0) ||
              Number(right.confidence || 0) - Number(left.confidence || 0),
          )[0] || null;

        const avgHealthScore =
          userRuns.length === 0
            ? 0
            : Math.round(
                userRuns.reduce(
                (sum, run) => sum + calculateRunHealthScore(run),
                0,
              ) /
                  userRuns.length,
            );

        const avgLatency =
          userRuns.length === 0
            ? 0
            : Math.round(
                userRuns.reduce(
                  (sum, run) => sum + Number(run.avgLatency || 0),
                  0,
                ) / userRuns.length,
            );

        const avgP95Latency =
          userRuns.length === 0
            ? 0
            : Math.round(
                userRuns.reduce(
                  (sum, run) => sum + Number(run.p95Latency || 0),
                  0,
                ) / userRuns.length,
            );

        const totalFailures = userRuns.reduce(
          (sum, run) => sum + getRunFailureCount(run),
          0,
        );

        const totalRequests = userRuns.reduce(
          (sum, run) => sum + Number(run.totalRequests || 0),
          0,
        );

        const report = {
          generatedAt: now,

          totalRuns,
          completedRuns,
          failedRuns,

          avgHealthScore,
          avgLatency,
          avgP95Latency,

          totalFailures,
          totalRequests,

          latestRun,
          bestRun,
          worstRun,

          topIssue: topMemory,

          executiveSummary: [],
        };

        report.executiveSummary = buildExecutiveSummary(report);

        const sent = await sendWeeklyReportNotification(user, report);

        if (sent) {
          sentCount += 1;
        } else {
          skippedCount += 1;
        }
      } catch (err) {
        skippedCount += 1;
        logger.error({
          message: "Email failed",
          error: err.message,
          userId: ownerId,
          notificationType: "weeklyReport",
        });
      }
    }

    logger.info({
      message: "Scheduler completed",
      users: users.length,
      sent: sentCount,
      skipped: skippedCount,
      durationMs: Date.now() - startedAt,
    });
  } catch (err) {
    logger.error({
      message: "Scheduler failed",
      error: err.message,
    });
  } finally {
    schedulerRunning = false;
  }
};

const startNotificationScheduler = () => {
  if (scheduledTask) {
    logger.warn({
      message: "Notification scheduler already started",
    });
    return scheduledTask;
  }

  const schedule = process.env.WEEKLY_REPORT_CRON || "* * * * *";

  if (!cron.validate(schedule)) {
    logger.error({
      message: "Scheduler failed",
      error: "Invalid WEEKLY_REPORT_CRON expression",
      schedule,
    });
    return null;
  }

  logger.info({
    message: "Scheduler started",
    schedule,
  });

  scheduledTask = cron.schedule(schedule, async () => {
    logger.info({
      message: "Running weekly report scheduler",
    });

    await runWeeklyReports();
  });

  return scheduledTask;
};

const buildExecutiveSummary = (report) => {
  const summary = [];

  if (report.failedRuns === 0) {
    summary.push(
      "All simulations completed successfully this week.",
    );
  }

  if (report.avgHealthScore >= 90) {
    summary.push(
      "Infrastructure health remained excellent.",
    );
  } else if (report.avgHealthScore >= 70) {
    summary.push(
      "Infrastructure remained stable with minor degradation.",
    );
  } else {
    summary.push(
      "Infrastructure health declined and requires attention.",
    );
  }

  if (report.totalFailures > 0) {
    summary.push(
      `${report.totalFailures} failures were recorded across all simulations.`,
    );
  }

  if (report.topIssue) {
    summary.push(
      `Most frequent issue: ${
        report.topIssue.title || report.topIssue.patternType
      }.`,
    );
  }

  return summary;
};

module.exports = {
  startNotificationScheduler,
  runWeeklyReports,
};
