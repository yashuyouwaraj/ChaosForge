const { success } = require("../utils/response");
const { getIO } = require("../websocket/socket");
const { client: redis } = require("../config/redis");

// Keys:
// metrics:{projectId}
// latencies:{projectId}

let metrics = {};

const recordRequest = async (projectId, latency, isSuccess, errorType = "network") => {
  if (!metrics[projectId]) {
    metrics[projectId] = {
      totalRequests: 0,
      success: 0,
      failure: 0,
      totalLatency: 0,
      latencies: [],
      timestamps: [],
      latencyBuckets: {
        "0-500": 0,
        "500-1000": 0,
        "1000-2000": 0,
        "2000+": 0,
      }, // For histogram

      errorTypes: {
        timeout: 0,
        network: 0,
        server: 0,
      },

      failureTimeline: [], // For failure timeline
    };
  }

  const m = metrics[projectId];
  const metricsKey = `metrics:${projectId}`;
  const latenciesKey = `latencies:${projectId}`;

  //total
  await redis.hincrby(metricsKey,"totalRequests",1)

  m.totalRequests++;
  m.totalLatency += latency;
  m.latencies.push(latency);
  m.timestamps.push(Date.now());

  if(latency<500) m.latencyBuckets["0-500"]++;
  else if(latency<1000) m.latencyBuckets["500-1000"]++;
  else if(latency<2000) m.latencyBuckets["1000-2000"]++;
  else m.latencyBuckets["2000+"]++;

  if (isSuccess) {
    m.success++;
    await redis.hincrby(metricsKey, "success", 1);
  } else {
    m.failure++;
    await redis.hincrby(metricsKey, "failure", 1);
    if (m.errorTypes[errorType] !== undefined) {
      m.errorTypes[errorType]++;
    }
    // 💀 FAILURE TIMELINE
    m.failureTimeline.push({time:Date.now()})
  }

  // latency sum
  await redis.hincrby(metricsKey, "totalLatency", latency);

  // store latency for percentile
  await redis.rpush(latenciesKey, latency);

  // timestamps for RPS
  await redis.rpush(`timestamps:${projectId}`, Date.now());
  // 🔥 EMIT LIVE DATA
  try {
    const io = getIO();
    io.emit(`metrics-${projectId}`,  await getMetrics(projectId));
  } catch (err) {
    console.error("Error emitting metrics:", err);
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
  const m = metrics[projectId];
  const metricsKey = `metrics:${projectId}`;
  const data = await redis.hgetall(metricsKey)

  const latencies = (await redis.lrange(`latencies:${projectId}`, 0, -1)).map(Number);
  const timestamps = (await redis.lrange(`timestamps:${projectId}`, 0, -1)).map(Number);

  const totalRequests = Number(data.totalRequests) || 0;
  const totalLatency = Number(data.totalLatency) || 0;

  if (!m) {
    return {
      totalRequests: 0,
      success: 0,
      failure: 0,
      avgLatency: 0,
      p95Latency: 0,
      rps: 0,
      latencyBuckets: {
        "0-500": 0,
        "500-1000": 0,
        "1000-2000": 0,
        "2000+": 0,
      },
      errorTypes: {
        timeout: 0,
        network: 0,
        server: 0,
      },
      failureTimeline: [],
    };
  }

  return {
    totalRequests,
    success: Number(data.success) || 0,
    failure: Number(data.failure) || 0,
    avgLatency:
      totalRequests > 0 ? Math.round(totalLatency / totalRequests) : 0,
    p95Latency: calculateP95(latencies),
    rps: calculateRPS(timestamps),
    latencyBuckets: m.latencyBuckets,
    errorTypes: m.errorTypes,
    failureTimeline: m.failureTimeline,
  };
};

module.exports = { recordRequest, getMetrics, calculateP95, calculateRPS };
