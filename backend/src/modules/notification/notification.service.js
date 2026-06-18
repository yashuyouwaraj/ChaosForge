const { getSettings } = require("../settings/settings.service");
const { sendEmail } = require("./email.service");
const {
  buildSimulationCompletedTemplate,
  buildWeeklyReportTemplate,
} = require("./notification.templates");
const logger = require("../../utils/logger");
const Run = require("../run/run.model");

const markSimulationEmailSent = async (run, sentAt = new Date()) => {
  if (!run?._id) {
    return;
  }

  await Run.updateOne(
    { _id: run._id },
    {
      $set: { simulationCompletedEmailSentAt: sentAt },
      $unset: {
        simulationCompletedEmailFailedAt: "",
        simulationCompletedEmailError: "",
      },
    },
  );
};

const markSimulationEmailFailed = async (run, err) => {
  if (!run?._id) {
    return;
  }

  await Run.updateOne(
    { _id: run._id },
    {
      $set: {
        simulationCompletedEmailFailedAt: new Date(),
        simulationCompletedEmailError: err.message,
      },
    },
  );
};

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

    if (run?.simulationCompletedEmailSentAt) {
      logger.info({
        message: "Simulation completion email skipped because it was already sent",
        userId: user._id,
        runId: run?.runId,
      });
      return false;
    }

    const settings = await getSettings(user._id);

    if (!settings?.notifications?.email) {
      logger.info({
        message: "Simulation email skipped because email notifications are disabled",
        userId: user._id,
        runId: run?.runId,
      });
      return false;
    }

    if (!settings.notifications.simulationCompleted) {
      logger.info({
        message: "Simulation email skipped because completion notifications are disabled",
        userId: user._id,
        runId: run?.runId,
      });
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

    await markSimulationEmailSent(run);

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

    await markSimulationEmailFailed(run, err).catch((updateErr) => {
      logger.warn({
        message: "Failed to record simulation email failure",
        error: updateErr.message,
        runId: run?.runId,
      });
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
