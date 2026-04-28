const { success } = require("../utils/response");
const { getIO } = require("../websocket/socket");

let metrics = {};

const recordRequest = (projectId, latency, isSuccess) => {
  if (!metrics[projectId]) {
    metrics[projectId] = {
      totalRequests: 0,
      success: 0,
      failure: 0,
      totalLatency: 0,
      latencies: [],
      timestamps: [],
    };
  }

  const m = metrics[projectId];

  m.totalRequests++;
  m.totalLatency += latency;
  m.latencies.push(latency);
  m.timestamps.push(Date.now());

  if (isSuccess) {
    m.success++;
  } else {
    m.failure++;
  }
  m.totalLatency += latency;

  // 🔥 EMIT LIVE DATA
  try {
    const io = getIO();
    io.emit("metrics", getMetrics());
  } catch (err) {
    console.error("Error emitting metrics:", err);
  }
};

const calculateP95 = (latencies) => {
  if (latencies.length === 0) return 0;

  const sorted = [...latencies].sort((a, b) => a - b);
  const index = Math.ceil(0.95 * sorted.length);

  return sorted[index];
};

const calculateRPS = (timestamps) => {
  if (timestamps.length < 2) return 0;

  const duration = (timestamps[timestamps.length - 1] - timestamps[0]) / 1000; // seconds

  return duration > 0 ? Math.round(timestamps.length / duration) : 0;
};

const getMetrics = (projectId) => {
  const m = metrics[projectId];

  if (!m) {
    return {
      totalRequests: 0,
      success: 0,
      failure: 0,
      avgLatency: 0,
      p95Latency: 0,
      rps: 0,
    };
  }

  return {
    totalRequests: m.totalRequests,
    success: m.success,
    failure: m.failure,
    avgLatency:
      m.totalRequests > 0 ? Math.round(m.totalLatency / m.totalRequests) : 0,
    p95Latency: calculateP95(m.latencies),
    rps: calculateRPS(m.timestamps),
  };
};

module.exports = { recordRequest, getMetrics, calculateP95, calculateRPS };
