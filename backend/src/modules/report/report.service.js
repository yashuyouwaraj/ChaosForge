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

  return rows.map((r) => r.join(",")).join("\n");
};

const drawSectionTitle = (doc, title) => {
  doc.moveDown();
  doc.fontSize(16).font("Helvetica-Bold").text(title, { underline: true });
  doc.moveDown(0.5);
  doc.font("Helvetica");
};

const drawKeyValue = (doc, label, value) => {
  doc.fontSize(11).text(`${label}: `, { continued: true });
  doc.font("Helvetica-Bold").text(`${value}`);
  doc.font("Helvetica");
};

module.exports = { buildCSV, drawSectionTitle, drawKeyValue };
