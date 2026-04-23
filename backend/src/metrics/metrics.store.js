const { getIO } = require("../websocket/socket");

let metrics = {};

const recordRequest = (projectId, latency, isSuccess) => {
  if (!metrics[projectId]) {
    metrics[projectId] = {
      totalRequests: 0,
      success: 0,
      failure: 0,
      totalLatency: 0,
    };
  }

  const m = metrics[projectId];

  m.totalRequests++;
  m.totalLatency += latency;

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

const getMetrics = (projectId) => {
  return (
    metrics[projectId] || {
      totalRequests: 0,
      success: 0,
      failure: 0,
      totalLatency: 0,
    }
  );
};

module.exports = { recordRequest, getMetrics };
