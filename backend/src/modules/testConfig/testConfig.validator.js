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
    method = "GET",
  } = config;

  const normalizedConcurrency = Number(concurrency);
  const normalizedRate = Number(rate);

  if (!Number.isFinite(normalizedConcurrency) || normalizedConcurrency <= 0) {
    throw new Error("concurrency must be greater than 0");
  }

  if (!["GET", "POST"].includes(String(method).toUpperCase())) {
    throw new Error("method must be GET or POST");
  }

  if (pattern === "stages") {
    const normalized = normalizeStages(stages);
    if (normalized.length === 0) {
      throw new Error("Stages required for 'stages' pattern");
    }
    return {
      mode,
      totalRequests,
      duration,
      rate: normalizedRate,
      concurrency: normalizedConcurrency,
      pattern,
      stages: normalized,
      method: String(method).toUpperCase(),
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
    rate: normalizedRate,
    concurrency: normalizedConcurrency,
    pattern,
    stages: [],
    method: String(method).toUpperCase(),
  };
};

module.exports = { validateConfig };
