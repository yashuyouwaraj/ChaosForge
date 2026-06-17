const { normalizeStages } = require("./pattern.util");

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

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
    headers = {},
    body,
    queryParams = {},
  } = config;

  const normalizedConcurrency = Number(concurrency);
  const normalizedRate = Number(rate);
  const normalizedMethod = String(method).toUpperCase();

  if (!Number.isFinite(normalizedConcurrency) || normalizedConcurrency <= 0) {
    throw new Error("concurrency must be greater than 0");
  }

  if (!HTTP_METHODS.includes(normalizedMethod)) {
    throw new Error("method must be GET, POST, PUT, PATCH, or DELETE");
  }

  if (!isPlainObject(headers)) {
    throw new Error("headers must be a JSON object");
  }

  if (!isPlainObject(queryParams)) {
    throw new Error("queryParams must be a JSON object");
  }

  const requestConfig = {
    method: normalizedMethod,
    headers,
    body,
    queryParams,
  };

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
      ...requestConfig,
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
    ...requestConfig,
  };
};

module.exports = { validateConfig };
