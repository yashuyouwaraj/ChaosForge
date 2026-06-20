const allowedStatusCodes = [400, 401, 403, 404, 408, 429, 500, 502, 503, 504];
const allowedProfiles = ["custom", "latency", "network", "failure", "stress"];

const toNumber = (value, fallback = 0) => {
  const number = Number(value ?? fallback);

  if (!Number.isFinite(number)) {
    throw new Error("Chaos configuration contains an invalid number.");
  }

  return number;
};

const validatePercentage = (value, label) => {
  if (value < 0 || value > 100) {
    throw new Error(`${label} must be between 0 and 100.`);
  }
};

const validateChaosConfig = (config = {}) => {
  const profile = allowedProfiles.includes(config.profile)
    ? config.profile
    : "custom";

  const chaos = {
    profile,
    enabled: Boolean(config.enabled),

    failureRate: toNumber(config.failureRate, 0),

    latency: {
      enabled: Boolean(config.latency?.enabled),
      min: toNumber(config.latency?.min, 0),
      max: toNumber(config.latency?.max, 0),
      percentage: toNumber(config.latency?.percentage, 0),
    },

    statusCode: {
      enabled: Boolean(config.statusCode?.enabled),
      codes: Array.isArray(config.statusCode?.codes)
        ? config.statusCode.codes.map((code) => toNumber(code))
        : [500],
    },

    timeout: {
      enabled: Boolean(config.timeout?.enabled),
      duration: toNumber(config.timeout?.duration, 5000),
      percentage: toNumber(config.timeout?.percentage, 0),
    },

    packetLoss: {
      enabled: Boolean(config.packetLoss?.enabled),
      percentage: toNumber(config.packetLoss?.percentage, 0),
    },

    connectionReset: {
      enabled: Boolean(config.connectionReset?.enabled),
      percentage: toNumber(config.connectionReset?.percentage, 0),
    },
  };

  validatePercentage(chaos.failureRate, "Failure rate");

  if (chaos.latency.min < 0) {
    throw new Error("Latency minimum must be positive.");
  }

  if (chaos.latency.max < chaos.latency.min) {
    throw new Error(
      "Latency maximum must be greater than or equal to minimum.",
    );
  }

  validatePercentage(chaos.latency.percentage, "Latency percentage");

  if (chaos.timeout.duration <= 0) {
    throw new Error("Timeout duration must be positive.");
  }

  validatePercentage(chaos.timeout.percentage, "Timeout percentage");

  validatePercentage(chaos.packetLoss.percentage, "Packet loss percentage");

  validatePercentage(
    chaos.connectionReset.percentage,
    "Connection reset percentage",
  );

  if (chaos.statusCode.enabled && chaos.statusCode.codes.length === 0) {
    throw new Error("At least one HTTP status code is required.");
  }

  for (const code of chaos.statusCode.codes) {
    if (!allowedStatusCodes.includes(code)) {
      throw new Error(`Unsupported status code: ${code}`);
    }
  }

  return chaos;
};

module.exports = {
  validateChaosConfig,
};
