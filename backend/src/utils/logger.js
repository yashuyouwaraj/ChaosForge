const winston = require("winston");

const isDebug = process.env.DEBUG === "true";

const logger = winston.createLogger({
  level: isDebug ? "debug" : "info",

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
