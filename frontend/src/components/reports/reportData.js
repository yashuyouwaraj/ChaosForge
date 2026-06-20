import { api } from "@/lib/api";

const isMissingDetailsRoute = (error) =>
  error?.message?.includes("Cannot GET /runs/details");

export const loadRunDetails = async (runId, projectId = null) => {
  return loadRunDetailsForProject(runId, projectId);
};

export const loadRunDetailsForProject = async (runId, projectId = null) => {
  if (projectId) {
    try {
      return await loadOperationalReport(runId, projectId);
    } catch (error) {
      console.error(error);
    }

    const runs = await api(`/runs/${projectId}`);
    const run = runs.find((item) => item.runId === runId);

    if (!run) {
      throw new Error("Report run was not found for this project.");
    }

    return await mergeLatestMetrics(run, projectId);
  }

  try {
    const run = await api(`/runs/details/${runId}`);
    return await mergeLatestMetrics(run, run?.projectId);
  } catch (error) {
    if (!isMissingDetailsRoute(error)) {
      throw error;
    }
  }

  const projects = await api("/projects");

  for (const project of projects) {
    const projectId = project._id || project.id;

    if (!projectId) {
      continue;
    }

    const runs = await api(`/runs/${projectId}`);
    const run = runs.find((item) => item.runId === runId);

    if (run) {
      const runWithProject = {
        ...run,
        projectName: project.name,
      };

      try {
        return await loadOperationalReport(runId, projectId, runWithProject);
      } catch (error) {
        console.error(error);
        return await mergeLatestMetrics(runWithProject, projectId);
      }
    }
  }

  throw new Error("Report run was not found.");
};

const flattenOperationalReport = (report, fallbackRun = {}) => {
  const runMetrics = report.runMetrics || {};
  const overview = report.overview || {};

  return {
    ...fallbackRun,
    ...runMetrics,
    totalRequests: runMetrics.totalRequests ?? overview.totalRequests ?? 0,
    success: runMetrics.success ?? overview.success ?? 0,
    failure: runMetrics.failure ?? overview.failure ?? 0,
    avgLatency: runMetrics.avgLatency ?? overview.avgLatency ?? 0,
    p95Latency: runMetrics.p95Latency ?? overview.p95Latency ?? 0,
    rps: runMetrics.rps ?? overview.rps ?? 0,
    errorTypes: report.errorTypes || runMetrics.errorTypes || fallbackRun.errorTypes,
    latencyTimeline:
      runMetrics.latencyTimeline ||
      report.rawMetrics?.latencyTimeline ||
      fallbackRun.latencyTimeline ||
      [],
    latencyBuckets:
      runMetrics.latencyBuckets ||
      report.rawMetrics?.latencyBuckets ||
      fallbackRun.latencyBuckets ||
      {},
    failureTimeline:
      runMetrics.failureTimeline ||
      report.rawMetrics?.failureTimeline ||
      fallbackRun.failureTimeline ||
      [],
    configurationSnapshot:
      report.configurationSnapshot || fallbackRun.configurationSnapshot,
    chaosConfig:
      runMetrics.chaosConfig ||
      report.chaosReport?.configuration ||
      fallbackRun.chaosConfig,
    projectId: report.projectId || fallbackRun.projectId,
    runId: report.runId || fallbackRun.runId,
    report,
  };
};

const loadOperationalReport = async (runId, projectId, fallbackRun = {}) => {
  const report = await api(
    `/report/json/${projectId}/${encodeURIComponent(runId)}`,
  );

  return flattenOperationalReport(report, {
    ...fallbackRun,
    projectId,
    runId,
  });
};

const mergeLatestMetrics = async (run, projectId) => {
  if (!run || !projectId) {
    return run;
  }

  try {
    const metrics = await api(
      `/metrics/${projectId}?runId=${encodeURIComponent(run.runId)}`,
    );

    return {
      ...run,
      ...metrics,
      projectId,
      runId: run.runId,
    };
  } catch (error) {
    console.error(error);
    return {
      ...run,
      projectId,
    };
  }
};
