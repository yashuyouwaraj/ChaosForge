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
