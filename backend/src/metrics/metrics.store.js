const { success } = require("../utils/response");
const { getIO } = require("../websocket/socket");
const { client: redis, connectRedis } = require("../config/redis");

// Keys:
// metrics:{projectId}
// latencies:{projectId}

const MAX_LIST_SIZE=1000; //limit memory
const TTL=3600 //1 hour

const recordRequest = async (projectId, latency, isSuccess, errorType = "network") => {
  await connectRedis();

  const metricsKey = `metrics:${projectId}`;
  const latenciesKey = `latencies:${projectId}`;
  const timestampsKey = `timestamps:${projectId}`;

  const pipeline = redis.multi();

  pipeline.hincrby(metricsKey, "totalRequests", 1);
  pipeline.hincrby(metricsKey, isSuccess ? "success" : "failure", 1);
  pipeline.hincrby(metricsKey, "totalLatency", latency);

  // latency list (bounded)
  pipeline.rpush(latenciesKey, latency);
  pipeline.ltrim(latenciesKey, -MAX_LIST_SIZE, -1);

  // timestamps list (bounded)
  pipeline.rpush(timestampsKey, Date.now());
  pipeline.ltrim(timestampsKey, -MAX_LIST_SIZE, -1);

  // TTL
  pipeline.expire(metricsKey, TTL);
  pipeline.expire(latenciesKey, TTL);
  pipeline.expire(timestampsKey, TTL);

  // 💀 error types in Redis
  if (!isSuccess) {
    pipeline.hincrby(`errors:${projectId}`, errorType, 1);
    pipeline.rpush(`failures:${projectId}`, Date.now());
    pipeline.ltrim(`failures:${projectId}`, -MAX_LIST_SIZE, -1);
    pipeline.expire(`errors:${projectId}`, TTL);
    pipeline.expire(`failures:${projectId}`, TTL);
  }

  await pipeline.exec();

  // 🔥 EMIT
  try {
    const io = getIO();
    io.emit(`metrics-${projectId}`, await getMetrics(projectId));
  } catch (err) {
    console.error("Emit error:", err.message);
  }
};

const calculateP95 = (latencies) => {
  if (latencies.length === 0) return 0;

  const sorted = [...latencies].sort((a, b) => a - b);
  const index = Math.max(0, Math.ceil(0.95 * sorted.length) - 1);

  return sorted[index];
};

const calculateRPS = (timestamps) => {
  if (timestamps.length < 2) return 0;

  const duration = (timestamps[timestamps.length - 1] - timestamps[0]) / 1000; // seconds

  return duration > 0 ? Math.round(timestamps.length / duration) : 0;
};

const getMetrics = async (projectId) => {
  await connectRedis();

  const metricsKey = `metrics:${projectId}`;

  const [data, latencies, timestamps, errors, failures] = await Promise.all([
    redis.hgetall(metricsKey),
    redis.lrange(`latencies:${projectId}`, -1000, -1),
    redis.lrange(`timestamps:${projectId}`, -1000, -1),
    redis.hgetall(`errors:${projectId}`),
    redis.lrange(`failures:${projectId}`, -100, -1),
  ]);

  const parsedLatencies = latencies.map(Number);
  const parsedTimestamps = timestamps.map(Number);

  const totalRequests = Number(data.totalRequests || 0);
  const totalLatency = Number(data.totalLatency || 0);

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
    avgLatency: totalRequests
      ? Math.round(totalLatency / totalRequests)
      : 0,
    p95Latency: calculateP95(parsedLatencies),
    rps: calculateRPS(parsedTimestamps),
    latencyBuckets: buckets,
    errorTypes: {
      timeout: Number(errors.timeout || 0),
      network: Number(errors.network || 0),
      server: Number(errors.server || 0),
    },
    failureTimeline: failures.map((t) => ({ time: Number(t) })),
  };
};
module.exports = { recordRequest, getMetrics, calculateP95, calculateRPS };
