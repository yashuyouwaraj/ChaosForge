const { buildOperationalReport } = require("./report.builder");
const { buildCSV } = require("./report.service");
const PDFDocument = require("pdfkit");

const PAGE_BOTTOM_PADDING = 48;
const CONTENT_WIDTH = 511;

const statusColors = {
  excellent: "#16a34a",
  good: "#0891b2",
  warning: "#f97316",
  critical: "#dc2626",
};

const capitalize = (value = "") =>
  String(value).charAt(0).toUpperCase() + String(value).slice(1);

const formatDate = (value) => {
  if (!value) {
    return "N/A";
  }

  return new Date(value).toLocaleString();
};

const ensureSpace = (doc, requiredHeight = 80) => {
  const bottom = doc.page.height - doc.page.margins.bottom - PAGE_BOTTOM_PADDING;

  if (doc.y + requiredHeight > bottom) {
    doc.addPage();
  }
};

const drawSectionTitle = (doc, title) => {
  ensureSpace(doc, 70);
  doc.moveDown(0.7);
  doc.font("Helvetica-Bold").fontSize(16).fillColor("#0f172a").text(title);
  doc
    .moveTo(doc.page.margins.left, doc.y + 4)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y + 4)
    .strokeColor("#22d3ee")
    .lineWidth(1)
    .stroke();
  doc.moveDown(0.8);
  doc.font("Helvetica").fillColor("#111827");
};

const drawParagraph = (doc, text, options = {}) => {
  if (!text) {
    return;
  }

  const fontSize = options.fontSize || 10.5;
  const width = options.width || CONTENT_WIDTH;
  doc.font(options.font || "Helvetica").fontSize(fontSize);
  const height = doc.heightOfString(String(text), {
    width,
    lineGap: options.lineGap || 3,
  });
  ensureSpace(doc, height + 16);
  doc.fillColor(options.color || "#111827").text(String(text), {
    width,
    lineGap: options.lineGap || 3,
    align: options.align || "left",
  });
  doc.moveDown(options.moveDown ?? 0.7);
};

const drawHighlightedBox = (doc, text) => {
  const x = doc.page.margins.left;
  const width = CONTENT_WIDTH;
  const padding = 16;
  const body = String(text || "No executive brief available.");
  const textHeight = doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .heightOfString(body, {
      width: width - padding * 2,
      lineGap: 4,
    });
  const height = textHeight + padding * 2;

  ensureSpace(doc, height + 24);

  const y = doc.y;
  doc
    .roundedRect(x, y, width, height, 8)
    .fillAndStroke("#ecfeff", "#22d3ee");
  doc
    .fillColor("#0f172a")
    .font("Helvetica-Bold")
    .fontSize(14)
    .text(body, x + padding, y + padding, {
      width: width - padding * 2,
      lineGap: 4,
    });
  doc.y = y + height + 12;
  doc.x = x;
  doc.font("Helvetica").fillColor("#111827");
};

const drawBulletList = (doc, items, renderItem) => {
  const list = Array.isArray(items) ? items : [];

  if (list.length === 0) {
    drawParagraph(doc, "No entries available.");
    return;
  }

  list.forEach((item) => {
    const text = renderItem(item);
    const width = CONTENT_WIDTH - 18;
    doc.font("Helvetica").fontSize(10);
    const height = doc.heightOfString(text, { width, lineGap: 2 });
    ensureSpace(doc, height + 14);
    doc.fillColor("#0891b2").text("-", { continued: true });
    doc.fillColor("#111827").text(` ${text}`, {
      width,
      lineGap: 2,
    });
    doc.moveDown(0.35);
  });
};

const drawKeyValueRows = (doc, rows) => {
  rows.forEach(([label, value]) => {
    const safeValue = value ?? "N/A";
    const labelWidth = 132;
    const valueWidth = CONTENT_WIDTH - labelWidth;
    const x = doc.page.margins.left;

    doc.font("Helvetica-Bold").fontSize(10.5);
    const labelHeight = doc.heightOfString(`${label}:`, {
      width: labelWidth,
      lineGap: 2,
    });
    doc.font("Helvetica").fontSize(10.5);
    const valueHeight = doc.heightOfString(String(safeValue), {
      width: valueWidth,
      lineGap: 2,
    });
    const rowHeight = Math.max(labelHeight, valueHeight) + 8;

    ensureSpace(doc, rowHeight + 4);

    const y = doc.y;
    doc
      .font("Helvetica-Bold")
      .fontSize(10.5)
      .fillColor("#334155")
      .text(`${label}:`, x, y, {
        width: labelWidth,
        lineGap: 2,
      });
    doc
      .font("Helvetica")
      .fontSize(10.5)
      .fillColor("#111827")
      .text(String(safeValue), x + labelWidth, y, {
        width: valueWidth,
        lineGap: 2,
      });

    doc.x = x;
    doc.y = y + rowHeight;
  });
};

const imageFromDataUrl = (image) => {
  if (!image || !image.startsWith("data:image/")) {
    return image;
  }

  return Buffer.from(image.split(",")[1], "base64");
};

const downloadCSV = async (req, res) => {
  const { projectId, runId } = req.params;
  const report = await buildOperationalReport({
    projectId,
    runId,
  });
  const csv = buildCSV(report);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="report-${runId}.csv"`,
  );
  res.send(csv);
};

const addChart = (doc, title, image, fit = [500, 220]) => {
  if (!image) {
    return false;
  }

  ensureSpace(doc, fit[1] + 60);

  doc.font("Helvetica-Bold").fontSize(12).text(title);
  doc.moveDown(0.5);

  try {
    doc.image(imageFromDataUrl(image), { fit, align: "center" });
  } catch (error) {
    console.warn("PDF chart render failed:", error.message);
    return false;
  }

  doc.moveDown();
  doc.font("Helvetica");
  return true;
};

const drawLegend = (doc, title, items) => {
  ensureSpace(doc, 80);

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

const drawPieSlice = (
  doc,
  centerX,
  centerY,
  radius,
  startAngle,
  endAngle,
  color,
) => {
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

  ensureSpace(doc, 210);

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
    drawPieSlice(
      doc,
      centerX,
      centerY,
      radius,
      angle,
      angle + sweep,
      item.color,
    );
    angle += sweep;
  });

  doc
    .circle(centerX, centerY, radius)
    .strokeColor("#ffffff")
    .lineWidth(1)
    .stroke();
  doc.y = startY;
  doc.x = centerX + radius + 36;
  drawLegend(doc, "Error Color Legend", items);
  doc.x = doc.page.margins.left;
  doc.y = Math.max(doc.y, startY + radius * 2 + 24);
};

const drawCoverPage = (doc, { projectId, runId, generatedAt }) => {
  doc
    .fontSize(26)
    .font("Helvetica-Bold")
    .fillColor("#0f172a")
    .text("ChaosForge Performance Report", {
      align: "center",
    });

  doc.moveDown(1.5);
  doc
    .fontSize(11)
    .font("Helvetica")
    .fillColor("#334155")
    .text(`Project ID: ${projectId}`, { align: "center" })
    .moveDown(0.4)
    .text(`Run ID: ${runId}`, { align: "center" })
    .moveDown(0.4)
    .text(`Generated At: ${formatDate(generatedAt)}`, { align: "center" });

  doc.moveDown(3);
  doc
    .fontSize(10)
    .fillColor("#64748b")
    .text("Real-time Load Testing & Observability Platform", {
      align: "center",
    });
};

const drawHealthScore = (doc, healthScore = {}) => {
  const status = healthScore.status || "good";
  const color = statusColors[status] || statusColors.good;

  drawSectionTitle(doc, "Health Score");
  ensureSpace(doc, 90);
  doc
    .roundedRect(doc.page.margins.left, doc.y, CONTENT_WIDTH, 72, 8)
    .fillAndStroke("#f8fafc", color);

  const y = doc.y + 16;
  doc
    .fillColor(color)
    .font("Helvetica-Bold")
    .fontSize(20)
    .text(`Score: ${healthScore.score ?? "N/A"}`, doc.page.margins.left + 16, y, {
      continued: false,
    });

  doc
    .fillColor("#111827")
    .font("Helvetica-Bold")
    .fontSize(13)
    .text(`Status: ${capitalize(status)}`, doc.page.margins.left + 16, y + 28);
  doc.y = y + 64;
  doc.font("Helvetica").fillColor("#111827");
};

const drawPredictiveRisk = (doc, predictiveRisk = {}) => {
  drawSectionTitle(doc, "Predictive Risk");
  drawKeyValueRows(doc, [
    ["Risk Level", capitalize(predictiveRisk.level || "stable")],
    ["Risk Percentage", `${predictiveRisk.risk ?? 0}%`],
  ]);
  drawParagraph(doc, predictiveRisk.forecast || "No predictive risk forecast available.");
};

const drawRootCauseAnalysis = (doc, rootCauseAnalysis = []) => {
  drawSectionTitle(doc, "Root Cause Analysis");
  drawBulletList(
    doc,
    rootCauseAnalysis,
    (cause) =>
      `${cause.title || "Probable cause"} (${cause.confidence ?? "N/A"}% confidence): ${cause.evidence || ""} Recommendation: ${cause.recommendation || "N/A"}`,
  );
};

const drawOperationalInsights = (doc, operationalInsights = []) => {
  drawSectionTitle(doc, "Operational Insights");
  drawBulletList(
    doc,
    operationalInsights,
    (insight) =>
      `${capitalize(insight.severity || "info")} - ${insight.title || "Insight"}: ${insight.description || ""}`,
  );
};

const drawInfrastructureMemory = (doc, infrastructureMemory = {}) => {
  drawSectionTitle(doc, "Infrastructure Memory");
  drawKeyValueRows(doc, [
    ["Total Patterns", infrastructureMemory.totalPatterns || 0],
  ]);

  const patterns = Array.isArray(infrastructureMemory.patterns)
    ? infrastructureMemory.patterns
    : [];

  if (patterns.length === 0) {
    drawParagraph(doc, "No infrastructure memory patterns recorded.");
    return;
  }

  patterns.forEach((pattern) => {
    ensureSpace(doc, 120);
    doc.font("Helvetica-Bold").fontSize(11).fillColor("#0f172a").text(pattern.title || "Infrastructure Pattern");
    doc.font("Helvetica").fontSize(10).fillColor("#111827");
    drawKeyValueRows(doc, [
      ["Severity", capitalize(pattern.severity || "info")],
      ["Confidence", `${pattern.confidence ?? 0}%`],
      ["Detection Count", pattern.detectionCount || 0],
      ["Trend", capitalize(pattern.trend || "stable")],
    ]);
    drawParagraph(doc, `Recommendation: ${pattern.recommendation || "N/A"}`, {
      fontSize: 10,
      moveDown: 0.3,
    });
  });
};

const drawRunMetrics = (doc, report) => {
  const metrics = report.runMetrics || {};
  const overview = report.overview || {};

  drawSectionTitle(doc, "Run Metrics");
  drawKeyValueRows(doc, [
    ["Status", capitalize(metrics.status || "unknown")],
    ["URL", metrics.url || "N/A"],
    ["Total Requests", metrics.totalRequests ?? overview.totalRequests ?? 0],
    ["Success", metrics.success ?? overview.success ?? 0],
    ["Failure", metrics.failure ?? overview.failure ?? 0],
    ["Failure Rate", `${metrics.failureRate ?? 0}%`],
    ["Average Latency", `${metrics.avgLatency ?? overview.avgLatency ?? 0} ms`],
    ["P95 Latency", `${metrics.p95Latency ?? overview.p95Latency ?? 0} ms`],
    ["RPS", metrics.rps ?? overview.rps ?? 0],
  ]);
};

const drawIncidentTimeline = (doc, incidentTimeline = []) => {
  drawSectionTitle(doc, "Incident Timeline");
  const incidents = Array.isArray(incidentTimeline)
    ? [...incidentTimeline].sort(
        (a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0),
      )
    : [];

  if (incidents.length === 0) {
    drawParagraph(doc, "No incidents recorded for this run.");
    return;
  }

  incidents.forEach((incident) => {
    ensureSpace(doc, 95);
    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor("#0f172a")
      .text(`${formatDate(incident.timestamp)} - ${capitalize(incident.severity || "info")}`);
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor("#111827")
      .text(incident.title || "Infrastructure Event");
    drawParagraph(doc, incident.message || "", {
      fontSize: 10,
      moveDown: 0.4,
    });
  });
};

const downloadPDF = async (req, res) => {
  const { projectId, runId } = req.params;
  const report = await buildOperationalReport({
    projectId,
    runId,
  });
  const { latencyChart, distributionChart } = req.body || {};

  const doc = new PDFDocument({ margin: 42, size: "A4" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="report-${runId}.pdf"`,
  );

  doc.pipe(res);

  drawCoverPage(doc, {
    projectId,
    runId,
    generatedAt: report.generatedAt,
  });

  doc.addPage();

  drawSectionTitle(doc, "Executive Brief");
  drawHighlightedBox(doc, report.executiveBrief);

  drawSectionTitle(doc, "Executive Summary");
  drawParagraph(doc, report.executiveSummary);

  drawHealthScore(doc, report.healthScore);

  drawPredictiveRisk(doc, report.predictiveRisk);

  drawRootCauseAnalysis(doc, report.rootCauseAnalysis);

  drawOperationalInsights(doc, report.operationalInsights);

  drawInfrastructureMemory(doc, report.infrastructureMemory);

  drawRunMetrics(doc, report);

  drawSectionTitle(doc, "Latency Charts");

  const chartAdded1 = addChart(doc, "Latency Trends", latencyChart);
  const chartAdded2 = addChart(doc, "Latency Distribution", distributionChart);

  if (!chartAdded1 && !chartAdded2) {
    drawParagraph(doc, "Performance charts were not available for this export.");
    drawBulletList(
      doc,
      [
        `Latency analysis based on ${report.rawMetrics?.totalRequests ?? report.runMetrics?.totalRequests ?? 0} requests`,
        `Average response time: ${report.overview?.avgLatency ?? report.runMetrics?.avgLatency ?? 0}ms`,
        `P95 tail latency: ${report.overview?.p95Latency ?? report.runMetrics?.p95Latency ?? 0}ms`,
      ],
      (item) => item,
    );
  }

  drawSectionTitle(doc, "Failure Breakdown");
  // Always render the error breakdown directly in PDF.
  // Frontend capture may produce an invalid image for the pie chart.
  drawErrorBreakdown(doc, report.errorTypes);

  drawIncidentTimeline(doc, report.incidentTimeline);

  ensureSpace(doc, 60);
  doc.moveDown(2);
  doc
    .fontSize(9)
    .fillColor("#64748b")
    .text(
      "Generated by ChaosForge - Real-time Load Testing & Observability Platform",
      { align: "center" },
    );

  doc.end();
};

const downloadJSON = async (req, res) => {
  const { projectId, runId } = req.params;

  const report = await buildOperationalReport({
    projectId,
    runId,
  });

  res.setHeader("Content-Type", "application/json");

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="report-${runId}.json"`,
  );

  res.send(JSON.stringify(report, null, 2));
};

module.exports = { downloadCSV, downloadPDF, downloadJSON };
