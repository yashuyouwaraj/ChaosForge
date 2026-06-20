const buildCSV = (report) => {
  const chaos = report.chaosReport || {};
  const chaosMetrics = chaos.metrics || {};
  const chaosConfig = chaos.configuration || {};
  const chaosAssessment = chaos.assessment || {};
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

    [],

    ["Chaos Engineering", "Value"],

    ["Enabled", chaos.enabled ? "Yes" : "No"],

    ["Profile", chaos.profile || "custom"],

    ["Assessment", chaos.assessment?.status || "unavailable"],

    ["Assessment Summary", chaosAssessment.summary || ""],

    ["Injected Requests", chaosMetrics.totalInjected || 0],

    ["Successful Injected Requests", chaosMetrics.successfulInjections || 0],

    ["Failed Injected Requests", chaosMetrics.failedInjections || 0],

    ["Injection Rate", `${chaosMetrics.injectionRate || 0}%`],

    ["Resilience Rate", `${chaosMetrics.resilienceRate || 0}%`],

    [
      "Chaos Failure Contribution",
      `${chaosMetrics.failureContributionRate || 0}%`,
    ],

    ["Latency Injections", chaosMetrics.latencyInjected || 0],

    ["Failure Injections", chaosMetrics.failureInjected || 0],

    ["Timeout Injections", chaosMetrics.timeoutInjected || 0],

    ["Packet Loss Injections", chaosMetrics.packetLossInjected || 0],

    [
      "Connection Reset Injections",
      chaosMetrics.connectionResetInjected || 0,
    ],

    ["Configured Failure Rate", `${chaosConfig.failureRate || 0}%`],
  ];

  if (Array.isArray(chaos.enabledFaults) && chaos.enabledFaults.length > 0) {
    rows.push([], ["Configured Fault", "Value"]);

    chaos.enabledFaults.forEach((fault) => {
      rows.push(["Fault", fault]);
    });
  }

  if (Array.isArray(chaos.faultBreakdown) && chaos.faultBreakdown.length > 0) {
    rows.push([], ["Fault Breakdown", "Injected"]);

    chaos.faultBreakdown.forEach((fault) => {
      rows.push([fault.label, fault.injected || 0]);
    });
  }

  if (
    Array.isArray(chaosAssessment.recommendations) &&
    chaosAssessment.recommendations.length > 0
  ) {
    rows.push([], ["Chaos Recommendation", "Value"]);

    chaosAssessment.recommendations.forEach((recommendation) => {
      rows.push(["Recommendation", recommendation]);
    });
  }

  if (report.deploymentReadiness) {
    rows.push([], ["Deployment Readiness", "Score"]);

    Object.entries(report.deploymentReadiness).forEach(([label, value]) => {
      rows.push([label, value]);
    });
  }

  if (report.configurationSnapshot) {
    rows.push([], ["Configuration Snapshot", "Value"]);

    Object.entries(report.configurationSnapshot).forEach(([label, value]) => {
      rows.push([
        label,
        typeof value === "object" ? JSON.stringify(value) : value,
      ]);
    });
  }

  if (Array.isArray(report.aiRecommendations)) {
    rows.push([], ["AI Recommendation", "Value"]);

    report.aiRecommendations.forEach((recommendation) => {
      rows.push(["Title", recommendation.title]);
      rows.push(["Reason", recommendation.reason]);
      rows.push(["Expected Impact", recommendation.expectedImpact]);
      rows.push(["Priority", recommendation.priority]);
      rows.push(["Confidence", recommendation.confidence]);
    });
  }

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
