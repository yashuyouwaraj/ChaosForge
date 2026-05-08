const { getIO } = require("../websocket/socket");
const { client: redis, connectRedis } = require("../config/redis");

// Keys:
// metrics:{projectId}
// latencies:{projectId}

const MAX_LIST_SIZE = 1000; //limit memory
const TTL = 3600; //1 hour
const metricsBuffer = {};

const recordRequest = async (
  projectId,
  runId,
  latency,
  isSuccess,
  errorType = "network",
) => {
  await connectRedis();

  const metricsKey = `metrics:${projectId}:${runId}`;
  const latenciesKey = `latencies:${projectId}:${runId}`;
  const timestampsKey = `timestamps:${projectId}:${runId}`;

  const recordedAt = Date.now();
  const pipeline = redis.multi();

  pipeline.hincrby(metricsKey, "totalRequests", 1);
  pipeline.hincrby(metricsKey, isSuccess ? "success" : "failure", 1);
  pipeline.hincrby(metricsKey, "totalLatency", latency);
  pipeline.hsetnx(metricsKey, "startedAt", recordedAt);
  pipeline.hset(metricsKey, "lastRequestAt", recordedAt);

  // latency list (bounded)
  pipeline.rpush(latenciesKey, latency);
  pipeline.ltrim(latenciesKey, -MAX_LIST_SIZE, -1);

  // timestamps list (bounded)
  pipeline.rpush(timestampsKey, recordedAt);
  pipeline.ltrim(timestampsKey, -MAX_LIST_SIZE, -1);

  // TTL
  pipeline.expire(metricsKey, TTL);
  pipeline.expire(latenciesKey, TTL);
  pipeline.expire(timestampsKey, TTL);

  // 💀 error types in Redis
  if (!isSuccess) {
    pipeline.hincrby(`errors:${projectId}:${runId}`, errorType, 1);
    pipeline.rpush(`failures:${projectId}:${runId}`, Date.now());
    pipeline.ltrim(`failures:${projectId}:${runId}`, -MAX_LIST_SIZE, -1);
    pipeline.expire(`errors:${projectId}:${runId}`, TTL);
    pipeline.expire(`failures:${projectId}:${runId}`, TTL);
  }

  await pipeline.exec();

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
  await connectRedis();

  const metricsKey = `metrics:${projectId}:${runId}`;

  const [data, latencies, timestamps, errors, failures] = await Promise.all([
    redis.hgetall(metricsKey),
    redis.lrange(`latencies:${projectId}:${runId}`, -1000, -1),
    redis.lrange(`timestamps:${projectId}:${runId}`, -1000, -1),
    redis.hgetall(`errors:${projectId}:${runId}`),
    redis.lrange(`failures:${projectId}:${runId}`, -100, -1),
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

setInterval(async () => {
  const io = getIO();

  for (const runId of Object.keys(metricsBuffer)) {
    try {
      const projectId = metricsBuffer[runId];
      const metrics = await getMetrics(projectId, runId);

      io.to(`run-${runId}`).emit(`metrics-${projectId}-${runId}`, metrics);

      // 💀 cleanup completed runs
      if (metrics.totalRequests === metrics.success + metrics.failure) {
        delete metricsBuffer[runId];
      }
    } catch (err) {
      console.log("Metrics flush error:", err.message);
    }
  }
}, 500);

module.exports = {
  recordRequest,
  getMetrics,
  calculateP95,
  calculateRPS,
  calculateAverageRPS,
};
