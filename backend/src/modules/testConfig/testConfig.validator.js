const { normalizeStages } = require("./pattern.util");

const validateConfig = (config) => {
  const {
    mode = "requests", // "requests" | "duration"
    totalRequests,
    duration,
    rate = 50,
    concurrency = 10,
    pattern = "constant", // "constant" | "stages"
    stages = [], // [{ durationSec, rate }]
  } = config;

  if (pattern === "stages") {
    const normalized = normalizeStages(stages);
    if (normalized.length === 0) {
      throw new Error("Stages required for 'stages' pattern");
    }
    return {
      mode,
      totalRequests,
      duration,
      rate,
      concurrency,
      pattern,
      stages: normalized,
    };
  }

  if (mode === "requests" && (!totalRequests || totalRequests <= 0)) {
    throw new Error("totalRequests required for requests mode");
  }

  if (mode === "duration" && (!duration || duration <= 0)) {
    throw new Error("duration required for duration mode");
  }

  return {
    mode,
    totalRequests,
    duration,
    rate,
    concurrency,
    pattern,
    stages: [],
  };
};

module.exports = { validateConfig };
