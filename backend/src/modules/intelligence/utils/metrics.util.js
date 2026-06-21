const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const rate = (part, total) => {
  const safeTotal = toNumber(total);
  return safeTotal > 0 ? (toNumber(part) / safeTotal) * 100 : 0;
};

const round = (value, precision = 1) => {
  const factor = 10 ** precision;
  return Math.round(toNumber(value) * factor) / factor;
};

const clampScore = (value) => Math.max(0, Math.min(100, Math.round(value)));

const percentDelta = (current, previous) => {
  const c = toNumber(current);
  const p = toNumber(previous);

  if (p <= 0) {
    return c > 0 ? null : 0;
  }

  return ((c - p) / p) * 100;
};

const pointDelta = (currentRate, previousRate) => {
  if (currentRate == null || previousRate == null) {
    return null;
  }

  return currentRate - previousRate;
};

const titleCase = (value = "") =>
  String(value)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const preferNonEmptyArray = (...values) => {
  const firstNonEmpty = values.find(
    (value) => Array.isArray(value) && value.length > 0,
  );

  return firstNonEmpty || [];
};

const normalizeMetrics = (savedRun, metrics = {}) => ({
  totalRequests: toNumber(savedRun?.totalRequests ?? metrics.totalRequests),
  success: toNumber(savedRun?.success ?? metrics.success),
  failure: toNumber(savedRun?.failure ?? metrics.failure),
  avgLatency: toNumber(savedRun?.avgLatency ?? metrics.avgLatency),
  p95Latency: toNumber(savedRun?.p95Latency ?? metrics.p95Latency),
  rps: toNumber(savedRun?.rps ?? metrics.rps),
  currentRps: toNumber(metrics.currentRps ?? savedRun?.currentRps ?? metrics.rps),
  errorTypes: savedRun?.errorTypes || metrics.errorTypes || {},
  latencyTimeline: preferNonEmptyArray(
    savedRun?.latencyTimeline,
    metrics.latencyTimeline,
  ),
  latencyBuckets: savedRun?.latencyBuckets || metrics.latencyBuckets || {},
  failureTimeline: preferNonEmptyArray(
    savedRun?.failureTimeline,
    metrics.failureTimeline,
  ),
  chaosInjected: toNumber(savedRun?.chaosInjected ?? metrics.chaosInjected),
  chaosSuccess: toNumber(savedRun?.chaosSuccess ?? metrics.chaosSuccess),
  chaosFailure: toNumber(savedRun?.chaosFailure ?? metrics.chaosFailure),
  latencyInjected: toNumber(
    savedRun?.latencyInjected ?? metrics.latencyInjected,
  ),
  failureInjected: toNumber(
    savedRun?.failureInjected ?? metrics.failureInjected,
  ),
  timeoutInjected: toNumber(
    savedRun?.timeoutInjected ?? metrics.timeoutInjected,
  ),
  packetLossInjected: toNumber(
    savedRun?.packetLossInjected ?? metrics.packetLossInjected,
  ),
  connectionResetInjected: toNumber(
    savedRun?.connectionResetInjected ?? metrics.connectionResetInjected,
  ),
});

const getOverview = (metrics) => ({
  totalRequests: metrics.totalRequests || 0,
  success: metrics.success || 0,
  failure: metrics.failure || 0,
  avgLatency: metrics.avgLatency || 0,
  p95Latency: metrics.p95Latency || 0,
  rps: metrics.rps || 0,
});

const getErrorCount = (errorTypes = {}) =>
  Object.values(errorTypes).reduce((total, value) => total + toNumber(value), 0);

module.exports = {
  toNumber,
  rate,
  round,
  clampScore,
  percentDelta,
  pointDelta,
  titleCase,
  preferNonEmptyArray,
  normalizeMetrics,
  getOverview,
  getErrorCount,
};
