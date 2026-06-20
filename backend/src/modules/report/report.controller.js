const { buildOperationalReport } = require("./report.builder");
const { buildCSV } = require("./report.service");
const PDFDocument = require("pdfkit");

const PAGE_BOTTOM_PADDING = 48;
const CONTENT_WIDTH = 511;
const PAGE_MARGIN = 42;

const statusColors = {
  excellent: "#16a34a",
  good: "#0891b2",
  warning: "#f97316",
  critical: "#dc2626",
  high: "#dc2626",
  moderate: "#f97316",
  stable: "#16a34a",
  info: "#0891b2",
};

const capitalize = (value = "") =>
  String(value).charAt(0).toUpperCase() + String(value).slice(1);

const formatDate = (value) => {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(date);
};

const getToneColor = (value, fallback = "#0891b2") =>
  statusColors[String(value || "").toLowerCase()] || fallback;

const formatPercent = (value) => `${Number(value || 0).toFixed(1)}%`;

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

const drawProgressBar = (doc, value, color, options = {}) => {
  const width = options.width || CONTENT_WIDTH;
  const height = options.height || 10;
  const x = options.x || doc.page.margins.left;
  const y = options.y || doc.y;
  const normalized = Math.max(0, Math.min(100, Number(value) || 0));

  ensureSpace(doc, height + 18);
  doc.roundedRect(x, y, width, height, height / 2).fill("#e2e8f0");
  doc
    .roundedRect(x, y, (width * normalized) / 100, height, height / 2)
    .fill(color);
  doc.x = x;
  doc.y = y + height + 10;
};

const getReportLatencyTimeline = (report) => {
  const candidates = [
    report.runMetrics?.latencyTimeline,
    report.rawMetrics?.latencyTimeline,
    report.latencyTimeline,
  ];

  return candidates.find((value) => Array.isArray(value) && value.length > 0) || [];
};

const getLatencyTrendPoints = (report) => {
  const timeline = getReportLatencyTimeline(report)
    .map((point, index) => ({
      time: Number(point.time ?? point.timestamp ?? point.recordedAt),
      latency: Number(point.latency ?? point.value ?? point.duration),
      request: Number(point.request || index + 1),
    }))
    .filter(
      (point) =>
        Number.isFinite(point.time) && Number.isFinite(point.latency),
    )
    .sort((a, b) => a.time - b.time || a.request - b.request);

  if (timeline.length === 0) {
    return [];
  }

  const startedAt = timeline[0].time;
  const endedAt = timeline[timeline.length - 1].time;
  const duration = Math.max(1, endedAt - startedAt);
  const targetBuckets = Math.min(40, Math.max(8, Math.ceil(timeline.length / 25)));
  const bucketSize = Math.max(1000, Math.ceil(duration / targetBuckets));
  const buckets = new Map();

  timeline.forEach((point) => {
    const elapsed = Math.max(0, point.time - startedAt);
    const bucketIndex = Math.floor(elapsed / bucketSize);

    if (!buckets.has(bucketIndex)) {
      buckets.set(bucketIndex, []);
    }

    buckets.get(bucketIndex).push(point.latency);
  });

  return [...buckets.entries()].map(([bucketIndex, latencies]) => {
    const sorted = [...latencies].sort((a, b) => a - b);
    const p95Index = Math.max(0, Math.ceil(sorted.length * 0.95) - 1);
    const avg =
      latencies.reduce((total, latency) => total + latency, 0) /
      latencies.length;

    return {
      label: `${Math.round((bucketIndex * bucketSize) / 1000)}s`,
      avg: Math.round(avg),
      p95: Math.round(sorted[p95Index]),
      max: Math.round(sorted[sorted.length - 1]),
    };
  });
};

const drawAxes = (doc, x, y, width, height) => {
  doc
    .strokeColor("#94a3b8")
    .lineWidth(0.7)
    .moveTo(x, y)
    .lineTo(x, y + height)
    .lineTo(x + width, y + height)
    .stroke();

  for (let i = 1; i < 4; i++) {
    const gridY = y + (height * i) / 4;
    doc
      .strokeColor("#e2e8f0")
      .lineWidth(0.4)
      .moveTo(x, gridY)
      .lineTo(x + width, gridY)
      .stroke();
  }
};

const drawLineSeries = (doc, points, key, color, x, y, width, height, maxValue) => {
  const drawablePoints = points.map((point, index) => ({
    x: x + (points.length === 1 ? 0 : (width * index) / (points.length - 1)),
    y: y + height - (height * Number(point[key] || 0)) / maxValue,
  }));

  doc.strokeColor(color).lineWidth(2);
  drawablePoints.forEach((point, index) => {
    if (index === 0) {
      doc.moveTo(point.x, point.y);
    } else {
      doc.lineTo(point.x, point.y);
    }
  });
  doc.stroke();
};

const drawChartPanel = (doc, title, options = {}) => {
  const x = options.x ?? doc.page.margins.left;
  const y = options.y ?? doc.y;
  const width = options.width ?? CONTENT_WIDTH;
  const height = options.height ?? 220;

  doc
    .roundedRect(x, y, width, height, 8)
    .fillAndStroke("#f8fafc", "#cbd5e1");
  doc
    .font("Helvetica-Bold")
    .fontSize(options.titleSize || 11)
    .fillColor("#0f172a")
    .text(title, x + 14, y + 12, {
      width: width - 28,
      lineBreak: false,
    });

  return {
    x,
    y,
    width,
    height,
    plotX: x + (options.leftPadding ?? 42),
    plotY: y + (options.topPadding ?? 42),
    plotWidth: width - (options.leftPadding ?? 42) - (options.rightPadding ?? 18),
    plotHeight: height - (options.topPadding ?? 42) - (options.bottomPadding ?? 34),
  };
};

const drawLatencyTrendPanel = (doc, report) => {
  const points = getLatencyTrendPoints(report);

  ensureSpace(doc, 320);

  const panel = drawChartPanel(doc, "Latency Trend Chart", {
    height: 300,
    leftPadding: 52,
    rightPadding: 22,
    topPadding: 48,
    bottomPadding: 54,
  });

  if (points.length === 0) {
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#64748b")
      .text(
        "Per-request latency telemetry is not available for this run.",
        panel.plotX,
        panel.plotY + 70,
        {
          width: panel.plotWidth,
          align: "center",
        },
      );
    doc.y = panel.y + panel.height + 14;
    doc.x = doc.page.margins.left;
    return;
  }

  const maxValue = Math.max(
    1,
    ...points.flatMap((point) => [point.avg, point.p95, point.max]),
  );

  drawAxes(doc, panel.plotX, panel.plotY, panel.plotWidth, panel.plotHeight);
  drawLineSeries(
    doc,
    points,
    "avg",
    "#0891b2",
    panel.plotX,
    panel.plotY,
    panel.plotWidth,
    panel.plotHeight,
    maxValue,
  );
  drawLineSeries(
    doc,
    points,
    "p95",
    "#dc2626",
    panel.plotX,
    panel.plotY,
    panel.plotWidth,
    panel.plotHeight,
    maxValue,
  );
  drawLineSeries(
    doc,
    points,
    "max",
    "#ca8a04",
    panel.plotX,
    panel.plotY,
    panel.plotWidth,
    panel.plotHeight,
    maxValue,
  );

  doc.font("Helvetica").fontSize(8).fillColor("#64748b");
  doc.text(`${maxValue} ms`, panel.x + 12, panel.plotY - 4, { width: 38 });
  doc.text("0 ms", panel.x + 18, panel.plotY + panel.plotHeight - 4, {
    width: 30,
  });

  const labelStride = Math.max(1, Math.ceil(points.length / 6));
  points.forEach((point, index) => {
    if (index % labelStride !== 0 && index !== points.length - 1) {
      return;
    }

    const labelX =
      panel.plotX +
      (points.length === 1
        ? 0
        : (panel.plotWidth * index) / (points.length - 1)) -
      18;

    doc.text(point.label, labelX, panel.plotY + panel.plotHeight + 8, {
      width: 36,
      align: "center",
    });
  });

  doc.x = panel.x + 14;
  doc.y = panel.y + panel.height - 26;
  drawInlineLegend(doc, [
    { label: "Avg", color: "#0891b2" },
    { label: "P95", color: "#dc2626" },
    { label: "Max", color: "#ca8a04" },
  ]);

  doc.y = panel.y + panel.height + 14;
  doc.x = doc.page.margins.left;
};

const drawLatencyDistributionPanel = (doc, buckets = {}, options = {}) => {
  const panel = drawChartPanel(doc, "Latency Distribution", {
    ...options,
    height: options.height ?? 205,
    leftPadding: 24,
    rightPadding: 18,
    topPadding: 48,
    bottomPadding: 42,
  });
  const items = [
    { label: "0-500", value: buckets["0-500"] || 0, color: "#16a34a" },
    { label: "500-1k", value: buckets["500-1000"] || 0, color: "#0891b2" },
    { label: "1k-2k", value: buckets["1000-2000"] || 0, color: "#f97316" },
    { label: "2k+", value: buckets["2000+"] || 0, color: "#dc2626" },
  ];
  const maxValue = Math.max(1, ...items.map((item) => item.value));
  const gap = 10;
  const barWidth = Math.max(
    24,
    (panel.plotWidth - gap * (items.length - 1)) / items.length,
  );

  items.forEach((item, index) => {
    const barHeight = (panel.plotHeight * item.value) / maxValue;
    const barX = panel.plotX + index * (barWidth + gap);
    const barY = panel.plotY + panel.plotHeight - barHeight;

    doc.rect(barX, barY, barWidth, Math.max(1, barHeight)).fill(item.color);
    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor("#111827")
      .text(String(item.value), barX, barY - 12, {
        width: barWidth,
        align: "center",
      });
    doc
      .font("Helvetica")
      .fontSize(7)
      .fillColor("#64748b")
      .text(item.label, barX, panel.plotY + panel.plotHeight + 8, {
        width: barWidth,
        align: "center",
      });
  });

  return panel;
};

const drawErrorBreakdownPanel = (doc, errorTypes = {}, options = {}) => {
  const panel = drawChartPanel(doc, "Failure Breakdown", {
    ...options,
    height: options.height ?? 205,
    leftPadding: 18,
    rightPadding: 18,
    topPadding: 46,
    bottomPadding: 22,
  });
  const items = [
    { label: "Timeout", color: "#e9724d", value: errorTypes.timeout || 0 },
    { label: "Network", color: "#72BAA9", value: errorTypes.network || 0 },
    { label: "Server", color: "#3b82f6", value: errorTypes.server || 0 },
  ];
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const centerX = panel.plotX + 58;
  const centerY = panel.plotY + 60;
  const radius = 46;

  if (total === 0) {
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#64748b")
      .text("No errors recorded.", panel.plotX, centerY - 8, {
        width: panel.plotWidth,
        align: "center",
      });
  } else {
    let angle = 0;

    items.forEach((item) => {
      if (item.value === 0) {
        return;
      }

      const sweep = (item.value / total) * 360;
      drawPieSlice(doc, centerX, centerY, radius, angle, angle + sweep, item.color);
      angle += sweep;
    });
  }

  const legendX = panel.x + panel.width - 96;
  let legendY = panel.plotY + 22;

  items.forEach((item) => {
    doc.rect(legendX, legendY + 2, 8, 8).fill(item.color);
    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor("#334155")
      .text(`${item.label}: ${item.value}`, legendX + 12, legendY, {
        width: 80,
      });
    legendY += 18;
  });

  return panel;
};

const drawReportCharts = (doc, report) => {
  ensureSpace(doc, 390);
  drawSectionTitle(doc, "Performance Charts");
  drawLatencyTrendPanel(doc, report);

  ensureSpace(doc, 250);

  const gap = 17;
  const columnWidth = (CONTENT_WIDTH - gap) / 2;
  const rowY = doc.y;

  drawLatencyDistributionPanel(
    doc,
    report.runMetrics?.latencyBuckets || report.rawMetrics?.latencyBuckets || {},
    {
      x: doc.page.margins.left,
      y: rowY,
      width: columnWidth,
      height: 205,
    },
  );
  drawErrorBreakdownPanel(doc, report.errorTypes, {
    x: doc.page.margins.left + columnWidth + gap,
    y: rowY,
    width: columnWidth,
    height: 205,
  });

  doc.x = doc.page.margins.left;
  doc.y = rowY + 222;

  ensureSpace(doc, 260);
  drawSectionTitle(doc, "Infrastructure Stability");
  drawNativeFailureHeatmap(doc, report);
  drawNativeStabilityTimeline(doc, report);
};

const drawNativeLatencyTrend = (doc, report) => {
  const points = getLatencyTrendPoints(report);

  if (points.length === 0) {
    drawParagraph(doc, "Per-request latency telemetry is not available for this run.");
    return;
  }

  ensureSpace(doc, 280);

  const x = doc.page.margins.left + 36;
  const y = doc.y + 12;
  const width = CONTENT_WIDTH - 56;
  const height = 190;
  const maxValue = Math.max(1, ...points.flatMap((point) => [point.avg, point.p95, point.max]));

  doc
    .roundedRect(doc.page.margins.left, doc.y, CONTENT_WIDTH, 260, 8)
    .fillAndStroke("#f8fafc", "#cbd5e1");
  drawAxes(doc, x, y, width, height);
  drawLineSeries(doc, points, "avg", "#22d3ee", x, y, width, height, maxValue);
  drawLineSeries(doc, points, "p95", "#f87171", x, y, width, height, maxValue);
  drawLineSeries(doc, points, "max", "#facc15", x, y, width, height, maxValue);

  doc.font("Helvetica").fontSize(8).fillColor("#64748b");
  doc.text(points[0].label, x, y + height + 8, { width: 60 });
  doc.text(points[points.length - 1].label, x + width - 60, y + height + 8, {
    width: 60,
    align: "right",
  });
  doc.text(`${maxValue} ms`, doc.page.margins.left + 8, y - 4, { width: 42 });
  doc.text("0 ms", doc.page.margins.left + 8, y + height - 4, { width: 42 });

  doc.y = y + height + 32;
  doc.x = doc.page.margins.left + 16;
  drawInlineLegend(doc, [
    { label: "Avg", color: "#22d3ee" },
    { label: "P95", color: "#f87171" },
    { label: "Max", color: "#facc15" },
  ]);
  doc.y = Math.max(doc.y, y + height + 54);
  doc.x = doc.page.margins.left;
};

const drawNativeLatencyDistribution = (doc, buckets = {}) => {
  const items = [
    { label: "0-500ms", value: buckets["0-500"] || 0, color: "#16a34a" },
    { label: "500ms-1s", value: buckets["500-1000"] || 0, color: "#0891b2" },
    { label: "1s-2s", value: buckets["1000-2000"] || 0, color: "#f97316" },
    { label: "2s+", value: buckets["2000+"] || 0, color: "#dc2626" },
  ];
  const maxValue = Math.max(1, ...items.map((item) => item.value));

  ensureSpace(doc, 220);
  doc.font("Helvetica-Bold").fontSize(12).fillColor("#0f172a").text("Latency Distribution");
  doc.moveDown(0.5);

  const x = doc.page.margins.left;
  const y = doc.y;
  const barWidth = 90;
  const gap = 34;
  const chartHeight = 130;

  items.forEach((item, index) => {
    const barHeight = (chartHeight * item.value) / maxValue;
    const barX = x + index * (barWidth + gap);
    const barY = y + chartHeight - barHeight;

    doc.rect(barX, barY, barWidth, barHeight).fill(item.color);
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor("#111827")
      .text(String(item.value), barX, barY - 16, { width: barWidth, align: "center" });
    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor("#64748b")
      .text(item.label, barX, y + chartHeight + 8, { width: barWidth, align: "center" });
  });

  doc.y = y + chartHeight + 34;
  doc.x = doc.page.margins.left;
};

const addPageNumbersAndFooters = (doc) => {
  const range = doc.bufferedPageRange();
  const totalPages = range.count;
  const originalPage = doc._pageBufferStart + doc._pageBuffer.indexOf(doc.page);

  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);

    const pageNumber = i - range.start + 1;
    const footerY = doc.page.height - doc.page.margins.bottom - 18;

    doc
      .moveTo(doc.page.margins.left, footerY - 8)
      .lineTo(doc.page.width - doc.page.margins.right, footerY - 8)
      .strokeColor("#cbd5e1")
      .lineWidth(0.5)
      .stroke();
    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor("#64748b")
      .text("Generated by ChaosForge", doc.page.margins.left, footerY, {
        width: CONTENT_WIDTH / 2,
        align: "left",
        lineBreak: false,
      })
      .text(`Page ${pageNumber} of ${totalPages}`, doc.page.margins.left, footerY, {
        width: CONTENT_WIDTH,
        align: "right",
        lineBreak: false,
      });
  }

  if (originalPage >= range.start && originalPage < range.start + range.count) {
    doc.switchToPage(originalPage);
  }
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

const addChart = (doc, title, image, fit = [500, 240]) => {
  if (!image) {
    return false;
  }

  try {
    const imageBuffer = imageFromDataUrl(image);

    ensureSpace(doc, fit[1] + 28);
    doc.image(imageBuffer, doc.page.margins.left, doc.y, {
      fit,
      align: "center",
    });
  } catch (error) {
    console.warn("PDF chart render failed:", error.message);
    return false;
  }

  doc.moveDown();
  doc.x = doc.page.margins.left;
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

const drawInlineLegend = (doc, items) => {
  const startX = doc.x;
  const y = doc.y;

  doc.font("Helvetica").fontSize(9);
  items.forEach(({ label, color }, index) => {
    const x = startX + index * 70;
    doc.rect(x, y + 2, 9, 9).fill(color);
    doc.fillColor("#334155").text(label, x + 14, y, { width: 48 });
  });

  doc.y = y + 18;
  doc.x = startX;
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

const getFailureHeatmapItems = (report) => {
  const errors = report.errorTypes || {};
  const metrics = report.runMetrics || {};

  return [
    {
      label: "Timeout Failures",
      value: errors.timeout || 0,
    },
    {
      label: "Network Failures",
      value: errors.network || 0,
    },
    {
      label: "Server Failures",
      value: errors.server || 0,
    },
    {
      label: "Queue Pressure",
      value: Math.round((metrics.failure || 0) * 0.7),
    },
    {
      label: "Worker Instability",
      value: Math.round((metrics.p95Latency || 0) / 20),
    },
    {
      label: "Traffic Saturation",
      value: Math.round((metrics.rps || 0) / 10),
    },
  ];
};

const getHeatmapColor = (value) => {
  if (value >= 100) {
    return { fill: "#fee2e2", stroke: "#dc2626", text: "#991b1b" };
  }

  if (value >= 50) {
    return { fill: "#fef3c7", stroke: "#f97316", text: "#9a3412" };
  }

  if (value > 0) {
    return { fill: "#ecfeff", stroke: "#0891b2", text: "#0e7490" };
  }

  return { fill: "#f8fafc", stroke: "#cbd5e1", text: "#64748b" };
};

const drawNativeFailureHeatmap = (doc, report) => {
  const items = getFailureHeatmapItems(report);
  const cellWidth = 154;
  const cellHeight = 78;
  const gap = 14;
  const x = doc.page.margins.left;
  const startY = doc.y;

  ensureSpace(doc, 210);

  items.forEach((item, index) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    const cellX = x + col * (cellWidth + gap);
    const cellY = startY + row * (cellHeight + gap);
    const color = getHeatmapColor(item.value);

    doc.roundedRect(cellX, cellY, cellWidth, cellHeight, 8).fillAndStroke(color.fill, color.stroke);
    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor("#334155")
      .text(item.label.toUpperCase(), cellX + 10, cellY + 12, {
        width: cellWidth - 20,
      });
    doc
      .font("Helvetica-Bold")
      .fontSize(22)
      .fillColor(color.text)
      .text(String(item.value), cellX + 10, cellY + 38, {
        width: cellWidth - 20,
      });
  });

  doc.y = startY + cellHeight * 2 + gap + 16;
  doc.x = doc.page.margins.left;
};

const getStabilityPoints = (report) => {
  const metrics = report.runMetrics || {};
  const failure = Number(metrics.failure || 0);
  const p95Latency = Number(metrics.p95Latency || 0);
  const avgLatency = Number(metrics.avgLatency || 0);

  return [
    {
      label: "Initialization",
      stability: 95,
    },
    {
      label: "Traffic Ramp",
      stability: Math.max(70, 100 - failure),
    },
    {
      label: "Peak Load",
      stability: Math.max(30, 100 - Math.round(p95Latency / 40)),
    },
    {
      label: "Recovery",
      stability: Math.max(60, 100 - Math.round(avgLatency / 25)),
    },
    {
      label: "Completion",
      stability: Math.max(75, 100 - Math.round(failure / 2)),
    },
  ];
};

const drawNativeStabilityTimeline = (doc, report) => {
  const points = getStabilityPoints(report);

  ensureSpace(doc, 250);

  const x = doc.page.margins.left + 36;
  const y = doc.y + 12;
  const width = CONTENT_WIDTH - 56;
  const height = 170;

  doc
    .roundedRect(doc.page.margins.left, doc.y, CONTENT_WIDTH, 230, 8)
    .fillAndStroke("#f8fafc", "#cbd5e1");
  drawAxes(doc, x, y, width, height);
  drawLineSeries(doc, points, "stability", "#22d3ee", x, y, width, height, 100);

  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#64748b")
    .text("0", doc.page.margins.left + 14, y + height - 4, { width: 20 })
    .text("100", doc.page.margins.left + 8, y - 4, { width: 28 });

  points.forEach((point, index) => {
    const labelX = x + (points.length === 1 ? 0 : (width * index) / (points.length - 1)) - 32;
    doc.text(point.label, labelX, y + height + 8, {
      width: 64,
      align: "center",
    });
  });

  doc.y = y + height + 42;
  doc.x = doc.page.margins.left;
};

const drawCoverPage = (doc, report) => {
  const {
    projectId,
    runId,
    generatedAt,
    configurationSnapshot = {},
    chaosReport = {},
    healthScore = {},
    predictiveRisk = {},
    runMetrics = {},
  } = report;
  const x = doc.page.margins.left;
  const top = 86;
  const successRate =
    runMetrics.successRate ??
    (runMetrics.totalRequests
      ? (Number(runMetrics.success || 0) / Number(runMetrics.totalRequests)) *
        100
      : 100);

  doc.rect(0, 0, doc.page.width, 150).fill("#0f172a");
  doc
    .rect(0, 150, doc.page.width, 8)
    .fill("#22d3ee");
  doc
    .fontSize(26)
    .font("Helvetica-Bold")
    .fillColor("#ffffff")
    .text("ChaosForge Performance Report", x, top, {
      width: CONTENT_WIDTH,
      align: "center",
    });

  doc.y = 210;
  doc
    .roundedRect(x, doc.y, CONTENT_WIDTH, 260, 10)
    .fillAndStroke("#f8fafc", "#cbd5e1");
  doc.y += 28;
  doc.x = x + 28;
  drawKeyValueRows(doc, [
    ["Project ID", projectId],
    ["Run ID", runId],
    ["Generated At", formatDate(generatedAt)],
    ["Environment", configurationSnapshot.environment || "N/A"],
    ["Simulation Duration", configurationSnapshot.duration || "N/A"],
    ["Chaos Enabled", chaosReport.enabled ? "Yes" : "No"],
    ["Chaos Profile", chaosReport.profile || "custom"],
    ["Generated Version", "ChaosForge Enterprise Report v1"],
    ["Health Score", healthScore.score ?? "N/A"],
    ["Risk Level", capitalize(predictiveRisk.level || "stable")],
    ["Success Rate", formatPercent(successRate)],
  ]);

  doc.y = 525;
  doc
    .fontSize(10)
    .fillColor("#64748b")
    .text("Real-time Load Testing and Observability Platform", x, doc.y, {
      width: CONTENT_WIDTH,
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
  drawProgressBar(doc, healthScore.score ?? 0, color, {
    x: doc.page.margins.left + 16,
    width: CONTENT_WIDTH - 32,
    height: 8,
  });
  doc.font("Helvetica").fillColor("#111827");
};

const drawPredictiveRisk = (doc, predictiveRisk = {}) => {
  const color = getToneColor(predictiveRisk.level, "#f97316");

  drawSectionTitle(doc, "Predictive Risk");
  drawKeyValueRows(doc, [
    ["Risk Level", capitalize(predictiveRisk.level || "stable")],
    ["Risk Percentage", `${predictiveRisk.risk ?? 0}%`],
  ]);
  drawProgressBar(doc, predictiveRisk.risk ?? 0, color);
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
    const color = getToneColor(pattern.severity, "#0891b2");

    ensureSpace(doc, 150);
    doc
      .roundedRect(doc.page.margins.left, doc.y, CONTENT_WIDTH, 28, 6)
      .fillAndStroke("#f8fafc", "#cbd5e1");
    doc
      .rect(doc.page.margins.left, doc.y, 5, 28)
      .fill(color);
    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor("#0f172a")
      .text(pattern.title || "Infrastructure Pattern", doc.page.margins.left + 12, doc.y + 8, {
        width: CONTENT_WIDTH - 24,
      });
    doc.y += 38;
    doc.x = doc.page.margins.left;
    doc.font("Helvetica").fontSize(10).fillColor("#111827");
    drawKeyValueRows(doc, [
      ["Pattern Type", capitalize(pattern.patternType || "unknown")],
      ["Severity", capitalize(pattern.severity || "info")],
      ["Confidence", `${pattern.confidence ?? 0}%`],
      ["Detection Count", pattern.detectionCount || 0],
      ["First Seen", formatDate(pattern.firstDetectedAt)],
      ["Last Seen", formatDate(pattern.lastDetectedAt)],
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

const drawConfigurationSnapshot = (doc, report) => {
  const snapshot = report.configurationSnapshot;

  drawSectionTitle(doc, "Configuration Snapshot");

  if (!snapshot) {
    drawParagraph(doc, "No configuration snapshot available.");
    return;
  }

  drawKeyValueRows(doc, [
    ["HTTP Method", snapshot.method || "N/A"],
    ["Target URL", snapshot.targetUrl || "N/A"],
    ["Headers", JSON.stringify(snapshot.headers || {})],
    ["Payload Size", `${snapshot.payloadSize || 0} bytes`],
    ["Concurrency", snapshot.concurrency ?? "N/A"],
    ["Duration", snapshot.duration || "N/A"],
    ["Workers", snapshot.workers ?? "N/A"],
    ["Kafka Enabled", snapshot.kafkaEnabled ? "Yes" : "No"],
    ["Redis Enabled", snapshot.redisEnabled ? "Yes" : "No"],
    ["Retry Count", snapshot.retryCount ?? "N/A"],
    ["Timeout", `${snapshot.timeout || 0} ms`],
    ["Traffic Pattern", capitalize(snapshot.trafficPattern || "requests")],
    [
      "Stages",
      Array.isArray(snapshot.stages) && snapshot.stages.length > 0
        ? JSON.stringify(snapshot.stages)
        : "N/A",
    ],
    ["Chaos Enabled", snapshot.chaosEnabled ? "Yes" : "No"],
    ["Chaos Profile", capitalize(snapshot.chaosProfile || "custom")],
    ["Failure Rate", `${snapshot.failureRate || 0}%`],
    ["Latency Range", snapshot.latencyRange || "Disabled"],
    ["Packet Loss", snapshot.packetLoss || "Disabled"],
    ["Timeout Injection", snapshot.timeoutInjection || "Disabled"],
    ["Connection Reset", snapshot.connectionReset || "Disabled"],
  ]);
};

const drawDeploymentReadiness = (doc, readiness = {}) => {
  drawSectionTitle(doc, "Deployment Readiness");
  drawKeyValueRows(doc, [
    ["Overall", `${readiness.overall ?? 0}/100`],
    ["Availability", `${readiness.availability ?? 0}/100`],
    ["Reliability", `${readiness.reliability ?? 0}/100`],
    ["Performance", `${readiness.performance ?? 0}/100`],
    ["Resilience", `${readiness.resilience ?? 0}/100`],
    ["Observability", `${readiness.observability ?? 0}/100`],
  ]);
};

const drawAiRecommendations = (doc, recommendations = []) => {
  drawSectionTitle(doc, "AI Recommendations");

  if (!Array.isArray(recommendations) || recommendations.length === 0) {
    drawParagraph(doc, "No AI recommendations generated for this run.");
    return;
  }

  recommendations.forEach((recommendation) => {
    ensureSpace(doc, 145);
    drawParagraph(doc, recommendation.title || "Recommendation", {
      font: "Helvetica-Bold",
      moveDown: 0.25,
    });
    drawKeyValueRows(doc, [
      ["Reason", recommendation.reason || "N/A"],
      ["Expected Impact", recommendation.expectedImpact || "N/A"],
      ["Priority", capitalize(recommendation.priority || "medium")],
      ["Confidence", `${recommendation.confidence ?? 0}%`],
    ]);
  });
};

const drawHistoricalComparison = (doc, comparison = {}) => {
  drawSectionTitle(doc, "Historical Comparison");

  if (!comparison.hasPreviousRun) {
    drawParagraph(doc, "No previous run exists for comparison.");
    return;
  }

  const metrics = comparison.metrics || {};

  drawKeyValueRows(
    doc,
    Object.entries(metrics).map(([label, value]) => [
      capitalize(label),
      `${value.current} vs ${value.previous} (${value.trend})`,
    ]),
  );
};

const drawChaosReport = (doc, report) => {
  const chaos = report.chaosReport || {};
  const metrics = chaos.metrics || {};
  const assessment = chaos.assessment || {};

  drawSectionTitle(doc, "Chaos Engineering");
  drawKeyValueRows(doc, [
    ["Enabled", chaos.enabled ? "Yes" : "No"],
    ["Profile", capitalize(chaos.profile || "custom")],
    ["Assessment", assessment.label || capitalize(assessment.status || "unavailable")],
    ["Injected Requests", metrics.totalInjected || 0],
    ["Successful Injections", metrics.successfulInjections || 0],
    ["Failed Injections", metrics.failedInjections || 0],
    ["Injection Rate", `${metrics.injectionRate || 0}%`],
    ["Resilience Rate", `${metrics.resilienceRate || 0}%`],
    ["Chaos Failure Contribution", `${metrics.failureContributionRate || 0}%`],
    ["Latency Injections", metrics.latencyInjected || 0],
    ["Failure Injections", metrics.failureInjected || 0],
    ["Timeout Injections", metrics.timeoutInjected || 0],
    ["Packet Loss Injections", metrics.packetLossInjected || 0],
    ["Connection Reset Injections", metrics.connectionResetInjected || 0],
  ]);
  drawParagraph(doc, assessment.summary || "No Chaos assessment available.");

  if (Array.isArray(chaos.enabledFaults) && chaos.enabledFaults.length > 0) {
    drawParagraph(doc, "Configured Faults", {
      font: "Helvetica-Bold",
      moveDown: 0.3,
    });
    drawBulletList(doc, chaos.enabledFaults, (fault) => fault);
  }

  if (Array.isArray(chaos.faultBreakdown) && chaos.faultBreakdown.length > 0) {
    drawParagraph(doc, "Injected Fault Breakdown", {
      font: "Helvetica-Bold",
      moveDown: 0.3,
    });
    drawKeyValueRows(
      doc,
      chaos.faultBreakdown.map((fault) => [
        fault.label || "Fault",
        fault.injected || 0,
      ]),
    );
  }

  if (Array.isArray(assessment.evidence) && assessment.evidence.length > 0) {
    drawParagraph(doc, "Evidence", {
      font: "Helvetica-Bold",
      moveDown: 0.3,
    });
    drawBulletList(doc, assessment.evidence, (item) => item);
  }

  if (
    Array.isArray(assessment.recommendations) &&
    assessment.recommendations.length > 0
  ) {
    drawParagraph(doc, "Recommendations", {
      font: "Helvetica-Bold",
      moveDown: 0.3,
    });
    drawBulletList(doc, assessment.recommendations, (item) => item);
  }
};

const drawIncidentTimeline = (doc, incidentTimeline = []) => {
  const incidents = Array.isArray(incidentTimeline)
    ? [...incidentTimeline].sort(
        (a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0),
      )
    : [];
  const uniqueIncidents = [];
  const seen = new Set();

  incidents.forEach((incident) => {
    const key = [
      incident.title,
      incident.message,
      incident.severity,
    ].join("|");

    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    uniqueIncidents.push(incident);
  });

  ensureSpace(doc, Math.min(300, 92 + uniqueIncidents.length * 58));
  drawSectionTitle(doc, "Incident Timeline");

  if (uniqueIncidents.length === 0) {
    drawParagraph(doc, "No incidents recorded for this run.");
    return;
  }

  uniqueIncidents.forEach((incident) => {
    const color = getToneColor(incident.severity, "#0891b2");
    const timestamp = `${formatDate(incident.timestamp)} - ${capitalize(
      incident.severity || "info",
    )}`;
    const title = incident.title || "Infrastructure Event";
    const message = incident.message || "";
    const textWidth = CONTENT_WIDTH - 34;
    const timestampHeight = doc
      .font("Helvetica-Bold")
      .fontSize(9.5)
      .heightOfString(timestamp, {
        width: textWidth,
        lineGap: 1,
      });
    const titleHeight = doc.fontSize(10).heightOfString(title, {
      width: textWidth,
      lineGap: 1,
    });
    const messageHeight = message
      ? doc.font("Helvetica").fontSize(9).heightOfString(message, {
          width: textWidth,
          lineGap: 2,
        })
      : 0;
    const rowHeight =
      Math.max(42, timestampHeight + titleHeight + messageHeight + 14);

    ensureSpace(doc, rowHeight + 8);
    const y = doc.y;
    doc
      .circle(doc.page.margins.left + 6, y + 8, 4)
      .fill(color);
    doc
      .font("Helvetica-Bold")
      .fontSize(9.5)
      .fillColor(color)
      .text(
        timestamp,
        doc.page.margins.left + 18,
        y,
        { width: CONTENT_WIDTH - 18 },
      );
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor("#111827")
      .text(title, {
        width: CONTENT_WIDTH - 18,
        lineGap: 1,
      });

    if (message) {
      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor("#334155")
        .text(message, {
          width: CONTENT_WIDTH - 18,
          lineGap: 2,
        });
    }

    doc.x = doc.page.margins.left;
    doc.y = y + rowHeight;
  });
};

const downloadPDF = async (req, res) => {
  const { projectId, runId } = req.params;
  const report = await buildOperationalReport({
    projectId,
    runId,
  });
  const doc = new PDFDocument({
    bufferPages: true,
    margin: PAGE_MARGIN,
    size: "A4",
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="report-${runId}.pdf"`,
  );

  doc.pipe(res);

  drawCoverPage(doc, report);

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

  drawConfigurationSnapshot(doc, report);

  drawDeploymentReadiness(doc, report.deploymentReadiness);

  drawChaosReport(doc, report);

  drawAiRecommendations(doc, report.aiRecommendations);

  drawHistoricalComparison(doc, report.historicalComparison);

  drawReportCharts(doc, report);

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

  addPageNumbersAndFooters(doc);
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
