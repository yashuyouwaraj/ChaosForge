const { getSettings } = require("../settings/settings.service");
const { sendEmail } = require("./email.service");
const {
  buildSimulationCompletedTemplate,
  buildWeeklyReportTemplate,
} = require("./notification.templates");
const logger = require("../../utils/logger");

const sendSimulationCompletedNotification = async (user, run) => {
  try {
    if (!user?._id) {
      logger.warn({
        message: "Simulation email skipped because user is missing",
        runId: run?.runId,
      });
      return false;
    }

    if (!user.email) {
      logger.warn({
        message: "Simulation email skipped because user email is missing",
        userId: user._id,
        runId: run?.runId,
      });
      return false;
    }

    const settings = await getSettings(user._id);

    if (!settings?.notifications?.email) {
      return false;
    }

    if (!settings.notifications.simulationCompleted) {
      return false;
    }

    const html = buildSimulationCompletedTemplate(run);
    const sent = await sendEmail({
      to: user.email,
      subject: "ChaosForge - Simulation Completed",
      html,
    });

    if (!sent) {
      return false;
    }

    logger.info({
      message: "Simulation completion email sent",
      userId: user._id,
      runId: run.runId,
    });

    return true;
  } catch (err) {
    logger.error({
      message: "Failed to send simulation notification",
      error: err.message,
      userId: user?._id,
      runId: run?.runId,
    });

    return false;
  }
};

const sendWeeklyReportNotification = async (user, report) => {
  try {
    if (!user?._id) {
      logger.warn({
        message: "Weekly report skipped because user is missing",
      });
      return false;
    }

    if (!user.email) {
      logger.warn({
        message: "Weekly report skipped because user email is missing",
        userId: user._id,
      });
      return false;
    }

    const settings = await getSettings(user._id);

    if (!settings?.notifications?.email) {
      logger.info({
        message: "Weekly report skipped because email notifications are disabled",
        userId: user._id,
      });
      return false;
    }

    if (!settings.notifications.weeklyReport) {
      logger.info({
        message: "Weekly report skipped because weekly reports are disabled",
        userId: user._id,
      });
      return false;
    }

    const html = buildWeeklyReportTemplate(report);
    const sent = await sendEmail({
      to: user.email,
      subject: "ChaosForge - Weekly Report",
      html,
    });

    if (!sent) {
      return false;
    }

    logger.info({
      message: "Weekly report email sent",
      userId: user._id,
    });

    return true;
  } catch (err) {
    logger.error({
      message: "Failed to send weekly report",
      error: err.message,
      userId: user?._id,
    });

    return false;
  }
};

module.exports = {
  sendSimulationCompletedNotification,
  sendWeeklyReportNotification,
};
