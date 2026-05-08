const winston = require("winston");

const isProd = process.env.NODE_ENV === "production";

const logger = winston.createLogger({
  level: isProd ? "warn" : "debug",

  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp, ...meta }) => {
      return JSON.stringify({
        timestamp,
        level,
        message,
        ...meta,
      });
    }),
  ),

  transports: [new winston.transports.Console()],
});

module.exports = logger;
