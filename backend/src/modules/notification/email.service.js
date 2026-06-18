const nodemailer = require("nodemailer");
const logger = require("../../utils/logger");

const requiredSmtpKeys = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"];
let transporter;

const getMissingSmtpKeys = () =>
  requiredSmtpKeys.filter((key) => !process.env[key]);

const isEmailConfigured = () => getMissingSmtpKeys().length === 0;

const getSmtpPassword = () => process.env.SMTP_PASS.replace(/\s+/g, "");

const getTransporter = () => {
  if (!isEmailConfigured()) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: getSmtpPassword(),
      },
    });
  }

  return transporter;
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!to) {
      logger.warn({
        message: "Email skipped because recipient is missing",
        subject,
      });
      return false;
    }

    const mailer = getTransporter();

    if (!mailer) {
      logger.warn({
        message: "Email skipped because SMTP is not configured",
        missing: getMissingSmtpKeys(),
        to,
        subject,
      });
      return false;
    }

    const info = await mailer.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });

    logger.info({
      message: "Email sent",
      to,
      subject,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
    });

    return true;
  } catch (err) {
    logger.error({
      message: "Email failed",
      error: err.message,
      to,
      subject,
    });

    throw err;
  }
};

const verifyTransport = async () => {
  try {
    const mailer = getTransporter();

    if (!mailer) {
      logger.warn({
        message: "SMTP verification skipped because SMTP is not configured",
        missing: getMissingSmtpKeys(),
      });
      return false;
    }

    await mailer.verify();

    logger.info({
      message: "SMTP connection established",
    });

    return true;
  } catch (err) {
    logger.error({
      message: "SMTP verification failed",
      error: err.message,
    });
    return false;
  }
};

module.exports = {
  sendEmail,
  verifyTransport,
  isEmailConfigured,
};
