const { getIO } = require("../websocket/socket");

let metrics = {
  totalRequests: 0,
  success: 0,
  failure: 0,
  totalLatency: 0,
};

const recordRequest = (latency, isSuccess) => {
  metrics.totalRequests++;
  if (isSuccess) {
    metrics.success++;
  } else {
    metrics.failure++;
  }
  metrics.totalLatency += latency;

  // 🔥 EMIT LIVE DATA
  try{
    const io = getIO();
    io.emit("metrics",getMetrics())
  } catch(err){
    console.error("Error emitting metrics:", err);
  }
};

const getMetrics = () => {
  const avgLatency =
    metrics.totalRequests === 0
      ? 0
      : metrics.totalLatency / metrics.totalRequests;

    return {
        ...metrics,
        avgLatency:avgLatency.toFixed(2)
    }
};

module.exports= {recordRequest, getMetrics}
