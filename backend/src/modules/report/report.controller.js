const { getMetrics } = require("../../metrics/metrics.store");
const {
  buildCSV,
  drawSectionTitle,
  drawKeyValue,
} = require("./report.service");
const PDFDocument = require("pdfkit");

const imageFromDataUrl = (image) => {
  if (!image || !image.startsWith("data:image/")) {
    return image;
  }

  return Buffer.from(image.split(",")[1], "base64");
};

const downloadCSV = (req, res) => {
  const projectId = req.params.projectId;
  const metrics = getMetrics(projectId);
  const csv = buildCSV(metrics);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="report-${projectId}.csv"`,
  );
  res.send(csv);
};

const addChart = (doc, title, image, fit = [500, 220]) => {
  if (!image) {
    return;
  }

  if (doc.y > 560) {
    doc.addPage();
  }

  doc.font("Helvetica-Bold").fontSize(12).text(title);
  doc.moveDown(0.5);
  doc.image(imageFromDataUrl(image), { fit, align: "center" });
  doc.moveDown();
  doc.font("Helvetica");
};

const drawLegend = (doc, title, items) => {
  if (doc.y > 650) {
    doc.addPage();
  }

  doc.font("Helvetica-Bold").fontSize(11).text(title);
  doc.moveDown(0.25);
  doc.font("Helvetica").fontSize(10);

  items.forEach(({ label, color, value }) => {
    const x = doc.x;
    const y = doc.y + 3;
    doc.rect(x, y, 10, 10).fill(color);
    doc.fillColor("black").text(`${label}: ${value}`, x + 16, y - 1);
  });

  doc.moveDown();
};

const drawPieSlice = (doc, centerX, centerY, radius, startAngle, endAngle, color) => {
  const steps = Math.max(8, Math.ceil((endAngle - startAngle) / 8));

  doc.moveTo(centerX, centerY);

  for (let i = 0; i <= steps; i++) {
    const angle = startAngle + ((endAngle - startAngle) * i) / steps;
    const radians = (angle - 90) * (Math.PI / 180);
    doc.lineTo(
      centerX + Math.cos(radians) * radius,
      centerY + Math.sin(radians) * radius,
    );
  }

  doc.closePath().fill(color);
};

const drawErrorBreakdown = (doc, errorTypes = {}) => {
  const items = [
    {
      label: "Timeout",
      color: "#e9724d",
      value: errorTypes.timeout || 0,
    },
    {
      label: "Network",
      color: "#72BAA9",
      value: errorTypes.network || 0,
    },
    {
      label: "Server",
      color: "#3b82f6",
      value: errorTypes.server || 0,
    },
  ];
  const total = items.reduce((sum, item) => sum + item.value, 0);

  if (doc.y > 560) {
    doc.addPage();
  }

  doc.font("Helvetica-Bold").fontSize(12).text("Error Breakdown");
  doc.moveDown(0.75);

  if (total === 0) {
    doc.font("Helvetica").fontSize(10).text("No errors recorded.");
    doc.moveDown();
    drawLegend(doc, "Error Color Legend", items);
    return;
  }

  const startY = doc.y;
  const centerX = doc.x + 110;
  const centerY = startY + 85;
  const radius = 72;
  let angle = 0;

  items.forEach((item) => {
    if (item.value === 0) {
      return;
    }

    const sweep = (item.value / total) * 360;
    drawPieSlice(doc, centerX, centerY, radius, angle, angle + sweep, item.color);
    angle += sweep;
  });

  doc.circle(centerX, centerY, radius).strokeColor("#ffffff").lineWidth(1).stroke();
  doc.y = startY;
  doc.x = centerX + radius + 36;
  drawLegend(doc, "Error Color Legend", items);
  doc.x = 42;
  doc.y = Math.max(doc.y, startY + radius * 2 + 24);
};

const downloadPDF = (req, res) => {
  const projectId = req.params.projectId;
  const metrics = getMetrics(projectId);
  const { requestsChart, latencyChart, distributionChart } = req.body || {};

  const doc = new PDFDocument({ margin: 42, size: "A4" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="report-${projectId}.pdf"`,
  );

  doc.pipe(res);

  doc
    .fontSize(22)
    .font("Helvetica-Bold")
    .text("ChaosForge Performance Report", { align: "center" });
  doc.moveDown(0.5);

  doc
    .fontSize(10)
    .font("Helvetica")
    .text(`Project ID: ${projectId}`, { align: "center" })
    .text(`Generated on: ${new Date().toLocaleString()}`, { align: "center" });
  doc.moveDown(1.5);

  drawSectionTitle(doc, "Executive Summary");
  doc
    .fontSize(11)
    .text(
      "This report summarizes system performance under simulated load, including latency behavior, throughput, and failure characteristics.",
    );

  drawSectionTitle(doc, "Metrics Overview");
  [
    ["Total Requests", metrics.totalRequests],
    ["Successful Requests", metrics.success],
    ["Failed Requests", metrics.failure],
    ["Average Latency", `${metrics.avgLatency} ms`],
    ["P95 Latency", `${metrics.p95Latency} ms`],
    ["Requests per Second", metrics.rps],
  ].forEach(([label, value]) => drawKeyValue(doc, label, value));

  drawSectionTitle(doc, "Performance Charts");
  addChart(doc, "Requests Over Time", requestsChart);
  addChart(doc, "Latency Trends", latencyChart);
  addChart(doc, "Latency Distribution", distributionChart);
  drawErrorBreakdown(doc, metrics.errorTypes);
  doc.moveDown(1.5)

  drawSectionTitle(doc, "Insights");
  doc.font("Helvetica-Bold").text("Observations:");
  doc.font("Helvetica");

  if (metrics.p95Latency > metrics.avgLatency * 1.5) {
    doc.text("- Noticeable tail latency indicating occasional slow responses.");
  }

  if (metrics.failure > 0) {
    doc.text("- Failures detected during peak load conditions.");
  } else {
    doc.text("- No failures observed under current load profile.");
  }

  if (metrics.rps < 30) {
    doc.text(
      "- Throughput is relatively low, indicating potential bottlenecks.",
    );
  } else {
    doc.text("- Throughput is stable under the configured load.");
  }

  doc.moveDown();
  doc.font("Helvetica-Bold").text("Recommendations:");
  doc.font("Helvetica");
  doc.text("- Optimize API response time to reduce tail latency.");
  doc.text(
    "- Introduce rate limiting or scaling to handle higher concurrency.",
  );
  doc.text(
    "- Monitor error patterns and increase timeout thresholds if required.",
  );

  drawSectionTitle(doc, "Conclusion");
  doc.text(
    "The system demonstrates stable performance under the current load profile. As concurrency increases, latency and failure rates should be monitored closely.",
  );

  doc.moveDown(2);
  doc.fontSize(9).text(
    "Generated by ChaosForge - Real-time Load Testing & Observability Platform",
    { align: "center" },
  );

  doc.end();
};

module.exports = { downloadCSV, downloadPDF };
