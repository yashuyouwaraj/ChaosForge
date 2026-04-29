const buildCSV = (metrics) => {
  const rows = [
    ["Metric", "Value"],
    ["Total Requests", metrics.totalRequests],
    ["Success", metrics.success],
    ["Failure", metrics.failure],
    ["Avg Latency", metrics.avgLatency],
    ["P95 Latency", metrics.p95Latency],
    ["RPS", metrics.rps],
  ];

  return rows.map(r => r.join(",")).join("\n");
};


module.exports = { buildCSV };