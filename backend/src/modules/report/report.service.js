const buildCSV = (report) => {
  const rows = [
    ["Metric", "Value"],

    ["Run ID", report.runId],

    ["Project ID", report.projectId],

    ["Total Requests", report.overview.totalRequests],

    ["Success", report.overview.success],

    ["Failure", report.overview.failure],

    ["Average Latency", report.overview.avgLatency],

    ["P95 Latency", report.overview.p95Latency],

    ["Requests Per Second", report.overview.rps],

    [],

    ["Error Type", "Count"],

    ["Timeout", report.errorTypes?.timeout || 0],

    ["Network", report.errorTypes?.network || 0],

    ["Server", report.errorTypes?.server || 0],
  ];

  return rows.map((row) => row.join(",")).join("\n");
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
