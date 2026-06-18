const COLORS = require("./email.styles");

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const buildHeader = () => `
<div style="
background:${COLORS.primary};
padding:32px;
text-align:center;
border-radius:16px 16px 0 0;
">

<h1 style="
margin:0;
color:white;
font-size:32px;
font-family:Arial,sans-serif;
letter-spacing:2px;
">
CHAOSFORGE
</h1>

<p style="
margin-top:10px;
color:#e0f7fa;
font-size:15px;
">
Infrastructure Intelligence Platform
</p>

</div>
`;

const buildFooter = () => `
<hr style="
margin:40px 0;
border:none;
border-top:1px solid ${COLORS.border};
">

<p style="
text-align:center;
color:${COLORS.muted};
font-size:13px;
">

Generated automatically by ChaosForge

<br><br>

© ${new Date().getFullYear()} ChaosForge

</p>
`;

const buildMetricCard = (title, value, color = COLORS.primary) => `
<td style="
padding:16px;
border:1px solid ${COLORS.border};
border-radius:12px;
text-align:center;
background:#fafafa;
">

<div style="
font-size:13px;
color:${COLORS.muted};
margin-bottom:8px;
">
${escapeHtml(title)}
</div>

<div style="
font-size:24px;
font-weight:bold;
color:${color};
">
${escapeHtml(value)}
</div>

</td>
`;

const buildRecommendationList = (recommendations = []) => `
<ul style="
padding-left:18px;
line-height:28px;
color:${COLORS.text};
">
${recommendations
  .map(
    (item) => `
<li>${escapeHtml(item)}</li>
`,
  )
  .join("")}
</ul>
`;

const buildButton = (url = "#", label = "Open Dashboard") => `
<div style="text-align:center;margin-top:30px;">

<a
href="${escapeHtml(url)}"
style="
display:inline-block;
padding:16px 32px;
background:${COLORS.primary};
color:white;
text-decoration:none;
border-radius:10px;
font-weight:bold;
font-size:15px;
">

${escapeHtml(label)}

</a>

</div>
`;

const buildSimulationCompletedTemplate = (run) => {
  const healthScore = getRunHealthScore(run);
  const healthColor =
    healthScore >= 90
      ? COLORS.success
      : healthScore >= 70
        ? COLORS.warning
        : COLORS.danger;

  return `
<!DOCTYPE html>

<html>

<head>

<meta charset="utf-8"/>

<title>ChaosForge</title>

</head>

<body style="
margin:0;
padding:40px;
background:${COLORS.background};
font-family:Arial,sans-serif;
">

<div style="
max-width:760px;
margin:auto;
background:${COLORS.card};
border-radius:16px;
overflow:hidden;
box-shadow:0 8px 30px rgba(0,0,0,.08);
">

${buildHeader()}

<div style="padding:40px;">

<h2 style="
margin-top:0;
color:${COLORS.text};
">
Simulation Completed Successfully
<!--
✅ Simulation Completed Successfully
-->
</h2>

<p style="
color:${COLORS.muted};
line-height:26px;
">

Your ChaosForge simulation has finished executing successfully.

</p>

<table width="100%" cellspacing="12">

<tr>

${buildMetricCard("Health Score", healthScore ?? "N/A", healthColor)}

${buildMetricCard(
  "Predictive Risk",
  run.predictiveRisk ?? "Low",
  COLORS.warning,
)}

</tr>

<tr>

${buildMetricCard("P95 Latency", `${run.p95Latency ?? 0} ms`)}

${buildMetricCard("Avg Latency", `${run.avgLatency ?? 0} ms`)}

</tr>

<tr>

${buildMetricCard(
  "Failures",
  run.failure ?? 0,
  run.failure > 0 ? COLORS.danger : COLORS.success,
)}

${buildMetricCard("Requests", run.totalRequests ?? 0)}

</tr>

</table>

<hr style="
margin:35px 0;
border:none;
border-top:1px solid ${COLORS.border};
">

<h3 style="color:${COLORS.text};">
Run Details
</h3>

<table
width="100%"
style="
border-collapse:collapse;
font-size:14px;
">

<tr>

<td style="padding:10px;color:${COLORS.muted};">
Project
</td>

<td style="padding:10px;">
${escapeHtml(run.projectId)}
</td>

</tr>

<tr>

<td style="padding:10px;color:${COLORS.muted};">
Run ID
</td>

<td style="padding:10px;">
${escapeHtml(run.runId)}
</td>

</tr>

<tr>

<td style="padding:10px;color:${COLORS.muted};">
Status
</td>

<td style="
padding:10px;
font-weight:bold;
color:${COLORS.success};
">

${escapeHtml(run.status)}

</td>

</tr>

<tr>

<td style="padding:10px;color:${COLORS.muted};">
Average Latency
</td>

<td style="padding:10px;">
${escapeHtml(run.avgLatency ?? 0)} ms
</td>

</tr>

<tr>

<td style="padding:10px;color:${COLORS.muted};">
Requests
</td>

<td style="padding:10px;">
${escapeHtml(run.totalRequests ?? 0)}
</td>

</tr>

</table>

<hr style="
margin:35px 0;
border:none;
border-top:1px solid ${COLORS.border};
">

<h3 style="color:${COLORS.text};">
Infrastructure Intelligence
</h3>

${buildRecommendationList([
  "Simulation executed successfully.",
  "Infrastructure memory has been updated.",
  "Review latency trends in the dashboard.",
  "Investigate any recurring failures if present.",
])}

${buildButton(
  process.env.FRONTEND_URL
    ? `${process.env.FRONTEND_URL}/reports/${encodeURIComponent(run.runId)}`
    : "#",
  "View Dashboard",
)}

</div>

${buildFooter()}

</div>

</body>

</html>
`;
};

const formatNumber = (value) =>
  Number(value || 0).toLocaleString("en-US");

const formatDateTime = (value) => {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const formatTrend = (trend) => {
  if (!trend) {
    return "Stable";
  }

  return String(trend).charAt(0).toUpperCase() + String(trend).slice(1);
};

const getRunFailureCount = (run) => {
  if (!run) {
    return 0;
  }

  if (run.failure !== undefined && run.failure !== null) {
    return Number(run.failure || 0);
  }

  if (run.failures !== undefined && run.failures !== null) {
    return Number(run.failures || 0);
  }

  if (run.errorTypes && typeof run.errorTypes === "object") {
    return Object.values(run.errorTypes).reduce(
      (sum, value) => sum + Number(value || 0),
      0,
    );
  }

  if (Array.isArray(run.failureTimeline)) {
    return run.failureTimeline.length;
  }

  const totalRequests = Number(run.totalRequests || 0);
  const success = Number(run.success || 0);

  if (totalRequests > 0 && success >= 0 && success <= totalRequests) {
    return totalRequests - success;
  }

  return 0;
};

const getRunHealthScore = (run) => {
  if (!run) {
    return null;
  }

  if (Number.isFinite(run.healthScore)) {
    return run.healthScore;
  }

  const totalRequests = Number(run.totalRequests || 0);
  const failures = getRunFailureCount(run);
  const failureRate =
    totalRequests > 0 ? (failures / totalRequests) * 100 : 0;
  const p95Latency = Number(run.p95Latency || 0);
  const avgLatency = Number(run.avgLatency || 0);

  const failurePenalty = Math.min(45, Math.round(failureRate * 3));
  const tailPenalty =
    p95Latency > 0 ? Math.min(30, Math.round(p95Latency / 120)) : 0;
  const averagePenalty =
    avgLatency > 0 ? Math.min(15, Math.round(avgLatency / 200)) : 0;

  return Math.max(0, 100 - failurePenalty - tailPenalty - averagePenalty);
};

const buildTableRow = (label, value) => `
<tr>
<td style="padding:12px;color:${COLORS.muted};border-bottom:1px solid ${COLORS.border};">
${escapeHtml(label)}
</td>
<td style="padding:12px;font-weight:bold;border-bottom:1px solid ${COLORS.border};">
${escapeHtml(value)}
</td>
</tr>
`;

const buildReportDetailsTable = (report) => `
<table
width="100%"
style="
border-collapse:collapse;
font-size:14px;
"
>
${buildTableRow("Generated At", formatDateTime(report.generatedAt))}
${buildTableRow("Total Runs", formatNumber(report.totalRuns))}
${buildTableRow("Completed Runs", formatNumber(report.completedRuns))}
${buildTableRow("Runs With Failures", formatNumber(report.failedRuns))}
${buildTableRow("Total Requests", formatNumber(report.totalRequests))}
${buildTableRow("Request Failures", formatNumber(report.totalFailures))}
</table>
`;

const buildRunHighlightRow = (label, run) => {
  if (!run) {
    return `
<tr>
<td style="padding:12px;color:${COLORS.muted};border-bottom:1px solid ${COLORS.border};">
${escapeHtml(label)}
</td>
<td colspan="6" style="padding:12px;border-bottom:1px solid ${COLORS.border};">
No run available
</td>
</tr>
`;
  }

  return `
<tr>
<td style="padding:12px;color:${COLORS.muted};border-bottom:1px solid ${COLORS.border};">
${escapeHtml(label)}
</td>
<td style="padding:12px;border-bottom:1px solid ${COLORS.border};">
${escapeHtml(run.runId || "N/A")}
</td>
<td style="padding:12px;border-bottom:1px solid ${COLORS.border};">
${escapeHtml(run.projectId || "N/A")}
</td>
<td style="padding:12px;border-bottom:1px solid ${COLORS.border};">
${escapeHtml(run.status || "N/A")}
</td>
<td style="padding:12px;border-bottom:1px solid ${COLORS.border};">
${escapeHtml(getRunHealthScore(run) ?? "N/A")}
</td>
<td style="padding:12px;border-bottom:1px solid ${COLORS.border};">
${escapeHtml(formatNumber(getRunFailureCount(run)))}
</td>
<td style="padding:12px;border-bottom:1px solid ${COLORS.border};">
${escapeHtml(formatDateTime(run.createdAt))}
</td>
</tr>
`;
};

const buildRunHighlightsTable = (report) => `
<table
width="100%"
style="
border-collapse:collapse;
font-size:13px;
"
>
<tr>
<th align="left" style="padding:12px;color:${COLORS.muted};border-bottom:1px solid ${COLORS.border};">
Type
</th>
<th align="left" style="padding:12px;color:${COLORS.muted};border-bottom:1px solid ${COLORS.border};">
Run ID
</th>
<th align="left" style="padding:12px;color:${COLORS.muted};border-bottom:1px solid ${COLORS.border};">
Project
</th>
<th align="left" style="padding:12px;color:${COLORS.muted};border-bottom:1px solid ${COLORS.border};">
Status
</th>
<th align="left" style="padding:12px;color:${COLORS.muted};border-bottom:1px solid ${COLORS.border};">
Health
</th>
<th align="left" style="padding:12px;color:${COLORS.muted};border-bottom:1px solid ${COLORS.border};">
Failures
</th>
<th align="left" style="padding:12px;color:${COLORS.muted};border-bottom:1px solid ${COLORS.border};">
Created
</th>
</tr>
${buildRunHighlightRow("Latest Run", report.latestRun)}
${buildRunHighlightRow("Best Run", report.bestRun)}
${buildRunHighlightRow("Worst Run", report.worstRun)}
</table>
`;

const buildMemoryTable = (topIssue) => {
  if (!topIssue) {
    return `
<p style="
color:${COLORS.muted};
line-height:26px;
">
No recurring infrastructure patterns detected.
</p>
`;
  }

  return `
<table
width="100%"
style="
border-collapse:collapse;
font-size:14px;
"
>

<tr>
<td style="padding:12px;color:${COLORS.muted};border-bottom:1px solid ${COLORS.border};">
Most Frequent Pattern
</td>
<td style="padding:12px;font-weight:bold;border-bottom:1px solid ${COLORS.border};">
${escapeHtml(topIssue.title || topIssue.patternType || "Infrastructure Pattern")}
</td>
</tr>

<tr>
<td style="padding:12px;color:${COLORS.muted};border-bottom:1px solid ${COLORS.border};">
Confidence
</td>
<td style="padding:12px;font-weight:bold;border-bottom:1px solid ${COLORS.border};">
${escapeHtml(topIssue.confidence ?? 0)}%
</td>
</tr>

<tr>
<td style="padding:12px;color:${COLORS.muted};border-bottom:1px solid ${COLORS.border};">
Trend
</td>
<td style="padding:12px;font-weight:bold;border-bottom:1px solid ${COLORS.border};">
${escapeHtml(formatTrend(topIssue.trend))}
</td>
</tr>

<tr>
<td style="padding:12px;color:${COLORS.muted};">
Detection Count
</td>
<td style="padding:12px;font-weight:bold;">
${escapeHtml(topIssue.detectionCount ?? 0)}
</td>
</tr>

</table>
`;
};

const buildWeeklyReportTemplate = (report) => {
  const healthColor =
    report.avgHealthScore >= 90
      ? COLORS.success
      : report.avgHealthScore >= 70
        ? COLORS.warning
        : COLORS.danger;
  const dashboardUrl = process.env.FRONTEND_URL
    ? `${process.env.FRONTEND_URL}/dashboard`
    : "#";

  return `
<!DOCTYPE html>

<html>

<head>

<meta charset="utf-8"/>

<title>ChaosForge Weekly Executive Report</title>

</head>

<body style="
margin:0;
padding:40px;
background:${COLORS.background};
font-family:Arial,sans-serif;
">

<div style="
max-width:760px;
margin:auto;
background:${COLORS.card};
border-radius:16px;
overflow:hidden;
box-shadow:0 8px 30px rgba(0,0,0,.08);
">

${buildHeader()}

<div style="padding:40px;">

<h2 style="color:${COLORS.text};">
Weekly Executive Report
</h2>

<p style="
line-height:28px;
color:${COLORS.muted};
">
Your weekly ChaosForge infrastructure summary is ready.

</p>

<table width="100%" cellspacing="12">

<tr>

${buildMetricCard(
  "Health Score",
  report.avgHealthScore ?? 0,
  healthColor,
)}

${buildMetricCard("Average Latency", `${report.avgLatency ?? 0} ms`)}

</tr>

<tr>

${buildMetricCard("P95 Latency", `${report.avgP95Latency ?? 0} ms`)}

${buildMetricCard("Requests", formatNumber(report.totalRequests))}

</tr>

<tr>

${buildMetricCard(
  "Request Failures",
  report.totalFailures ?? 0,
  report.totalFailures > 0 ? COLORS.danger : COLORS.success,
)}

${buildMetricCard("Completed Runs", report.completedRuns ?? 0, COLORS.success)}

</tr>

<tr>

${buildMetricCard(
  "Runs With Failures",
  report.failedRuns ?? 0,
  report.failedRuns > 0 ? COLORS.danger : COLORS.success,
)}

${buildMetricCard("Total Runs", report.totalRuns ?? 0)}

</tr>

</table>

<hr style="
margin:35px 0;
border:none;
border-top:1px solid ${COLORS.border};
">

<h3 style="color:${COLORS.text};">
Executive Summary
</h3>

${buildRecommendationList(report.executiveSummary || [])}

<hr style="
margin:35px 0;
border:none;
border-top:1px solid ${COLORS.border};
">

<h3 style="color:${COLORS.text};">
Report Details
</h3>

${buildReportDetailsTable(report)}

<hr style="
margin:35px 0;
border:none;
border-top:1px solid ${COLORS.border};
">

<h3 style="color:${COLORS.text};">
Run Highlights
</h3>

${buildRunHighlightsTable(report)}

<hr style="
margin:35px 0;
border:none;
border-top:1px solid ${COLORS.border};
">

<h3 style="color:${COLORS.text};">
Infrastructure Memory
</h3>

${buildMemoryTable(report.topIssue)}

${buildButton(dashboardUrl)}

</div>

${buildFooter()}

</div>

</body>

</html>
`;
};

module.exports = {
  buildSimulationCompletedTemplate,
  buildWeeklyReportTemplate,
};
