const { getIO } = require("../websocket/socket");
const { client: redis, connectRedis } = require("../config/redis");

// Keys:
// metrics:{projectId}
// latencies:{projectId}

const MAX_LIST_SIZE = 1000; //limit memory
const TTL = 3600; //1 hour
const metricsBuffer = {};
const completedRuns = new Set();
const PROMETHEUS_METRICS_KEY = "prometheus:simulation";
const PROMETHEUS_LATENCY_BUCKETS = [50, 100, 200, 500, 1000, 2000, 5000];

const markRunActive = (projectId, runId) => {
  metricsBuffer[runId] = projectId;
  completedRuns.delete(runId);
};

const markRunComplete = (runId) => {
  completedRuns.add(runId);
};

const getActiveRunCount = () =>
  Object.keys(metricsBuffer).length - completedRuns.size;

const recordPrometheusMetrics = (multi, latency, isSuccess) => {
  multi.hIncrBy(PROMETHEUS_METRICS_KEY, "requests_total", 1);

  if (!isSuccess) {
    multi.hIncrBy(PROMETHEUS_METRICS_KEY, "failures_total", 1);
  }

  multi.hIncrBy(PROMETHEUS_METRICS_KEY, "latency_count", 1);
  multi.hIncrBy(PROMETHEUS_METRICS_KEY, "latency_sum", Math.round(latency));

  for (const bucket of PROMETHEUS_LATENCY_BUCKETS) {
    if (latency <= bucket) {
      multi.hIncrBy(PROMETHEUS_METRICS_KEY, `latency_bucket_${bucket}`, 1);
    }
  }
};

const recordRequest = async (
  projectId,
  runId,
  latency,
  isSuccess,
  errorType = "network",
) => {
  const redis = await connectRedis();

  const metricsKey = `metrics:${projectId}:${runId}`;
  const latenciesKey = `latencies:${projectId}:${runId}`;
  const timestampsKey = `timestamps:${projectId}:${runId}`;

  const recordedAt = Date.now();

  // Use multi() for atomic operations
  const multi = redis.multi();
  multi.hIncrBy(metricsKey, "totalRequests", 1);
  multi.hIncrBy(metricsKey, isSuccess ? "success" : "failure", 1);
  multi.hIncrBy(metricsKey, "totalLatency", String(latency));
  multi.hSetNX(metricsKey, "startedAt", String(recordedAt));
  multi.hSet(metricsKey, "lastRequestAt", String(recordedAt));

  // latency list (bounded)
  multi.rPush(latenciesKey, String(latency));
  multi.lTrim(latenciesKey, -MAX_LIST_SIZE, -1);

  // timestamps list (bounded)
  multi.rPush(timestampsKey, String(recordedAt));
  multi.lTrim(timestampsKey, -MAX_LIST_SIZE, -1);

  // TTL
  multi.expire(metricsKey, TTL);
  multi.expire(latenciesKey, TTL);
  multi.expire(timestampsKey, TTL);
  recordPrometheusMetrics(multi, latency, isSuccess);

  // 💀 error types in Redis
  if (!isSuccess) {
    multi.hIncrBy(`errors:${projectId}:${runId}`, errorType, 1);
    multi.rPush(`failures:${projectId}:${runId}`, String(Date.now()));
    multi.lTrim(`failures:${projectId}:${runId}`, -MAX_LIST_SIZE, -1);
    multi.expire(`errors:${projectId}:${runId}`, TTL);
    multi.expire(`failures:${projectId}:${runId}`, TTL);
  }

  await multi.exec();

  // 🔥 EMIT
  metricsBuffer[runId] = projectId;
};

const calculateP95 = (latencies) => {
  if (latencies.length === 0) return 0;

  const sorted = [...latencies].sort((a, b) => a - b);
  const index = Math.max(0, Math.ceil(0.95 * sorted.length) - 1);

  return sorted[index];
};

const calculateRPS = (timestamps, now = Date.now(), windowMs = 1000) => {
  if (timestamps.length < 2) return 0;

  const cutoff = now - windowMs;
  const recent = timestamps.filter((timestamp) => timestamp >= cutoff);

  return Math.round((recent.length * 1000) / windowMs);
};

const calculateAverageRPS = (totalRequests, startedAt, lastRequestAt) => {
  if (!totalRequests || !startedAt || !lastRequestAt) return 0;

  const elapsedMs = Math.max(1000, lastRequestAt - startedAt);

  return Math.round((totalRequests * 1000) / elapsedMs);
};

const getMetrics = async (projectId, runId) => {
  const redis = await connectRedis();

  const metricsKey = `metrics:${projectId}:${runId}`;

  const [data, latencies, timestamps, errors, failures] = await Promise.all([
    redis.hGetAll(metricsKey),
    redis.lRange(`latencies:${projectId}:${runId}`, -1000, -1),
    redis.lRange(`timestamps:${projectId}:${runId}`, -1000, -1),
    redis.hGetAll(`errors:${projectId}:${runId}`),
    redis.lRange(`failures:${projectId}:${runId}`, -100, -1),
  ]);

  const parsedLatencies = latencies.map(Number);
  const parsedTimestamps = timestamps.map(Number);
  const now = Date.now();

  const totalRequests = Number(data.totalRequests || 0);
  const totalLatency = Number(data.totalLatency || 0);
  const startedAt = Number(data.startedAt || parsedTimestamps[0] || 0);
  const lastRequestAt = Number(
    data.lastRequestAt || parsedTimestamps[parsedTimestamps.length - 1] || 0,
  );

  // latency buckets (computed here)
  const buckets = {
    "0-500": 0,
    "500-1000": 0,
    "1000-2000": 0,
    "2000+": 0,
  };

  parsedLatencies.forEach((lat) => {
    if (lat < 500) buckets["0-500"]++;
    else if (lat < 1000) buckets["500-1000"]++;
    else if (lat < 2000) buckets["1000-2000"]++;
    else buckets["2000+"]++;
  });

  return {
    totalRequests,
    success: Number(data.success || 0),
    failure: Number(data.failure || 0),
    avgLatency: totalRequests ? Math.round(totalLatency / totalRequests) : 0,
    p95Latency: calculateP95(parsedLatencies),
    rps: calculateAverageRPS(totalRequests, startedAt, lastRequestAt),
    currentRps: calculateRPS(parsedTimestamps, now),
    latencyBuckets: buckets,
    errorTypes: {
      timeout: Number(errors.timeout || 0),
      network: Number(errors.network || 0),
      server: Number(errors.server || 0),
    },
    failureTimeline: failures.map((t) => ({ time: Number(t) })),
  };
};

const getPrometheusSimulationMetrics = async () => {
  const redis = await connectRedis();
  const data = await redis.hGetAll(PROMETHEUS_METRICS_KEY);

  const requestsTotal = Number(data.requests_total || 0);
  const failuresTotal = Number(data.failures_total || 0);
  const latencyCount = Number(data.latency_count || 0);
  const latencySum = Number(data.latency_sum || 0);

  const lines = [
    "# HELP chaosforge_simulation_requests_total Total simulation requests processed",
    "# TYPE chaosforge_simulation_requests_total counter",
    `chaosforge_simulation_requests_total ${requestsTotal}`,
    "# HELP chaosforge_simulation_failures_total Total simulation request failures",
    "# TYPE chaosforge_simulation_failures_total counter",
    `chaosforge_simulation_failures_total ${failuresTotal}`,
    "# HELP chaosforge_request_latency_ms Simulation request latency",
    "# TYPE chaosforge_request_latency_ms histogram",
  ];

  for (const bucket of PROMETHEUS_LATENCY_BUCKETS) {
    lines.push(
      `chaosforge_request_latency_ms_bucket{le="${bucket}"} ${Number(
        data[`latency_bucket_${bucket}`] || 0,
      )}`,
    );
  }

  lines.push(`chaosforge_request_latency_ms_bucket{le="+Inf"} ${latencyCount}`);
  lines.push(`chaosforge_request_latency_ms_sum ${latencySum}`);
  lines.push(`chaosforge_request_latency_ms_count ${latencyCount}`);

  return `${lines.join("\n")}\n`;
};

setInterval(async () => {
  try {
    const io = getIO();

    for (const runId of Object.keys(metricsBuffer)) {
      try {
        const projectId = metricsBuffer[runId];
        const metrics = await getMetrics(projectId, runId);

        io.to(`run-${runId}`).emit(`metrics-${projectId}-${runId}`, metrics);

        // 💀 cleanup completed runs
        if (
          completedRuns.has(runId) &&
          metrics.totalRequests === metrics.success + metrics.failure
        ) {
          delete metricsBuffer[runId];
          completedRuns.delete(runId);
        }
      } catch (err) {
        console.log("Metrics flush error:", err.message);
      }
    }
  } catch (err) {
    // Socket.io not initialized in this process (worker), skip emitting
    return;
  }
}, 500);

module.exports = {
  recordRequest,
  markRunActive,
  markRunComplete,
  getActiveRunCount,
  getMetrics,
  getPrometheusSimulationMetrics,
  calculateP95,
  calculateRPS,
  calculateAverageRPS,
};
