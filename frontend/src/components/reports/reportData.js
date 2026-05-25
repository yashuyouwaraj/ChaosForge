import { api } from "@/lib/api";

const isMissingDetailsRoute = (error) =>
  error?.message?.includes("Cannot GET /runs/details");

export const loadRunDetails = async (runId, projectId = null) => {
  return loadRunDetailsForProject(runId, projectId);
};

export const loadRunDetailsForProject = async (runId, projectId = null) => {
  if (projectId) {
    try {
      const runs = await api(`/runs/${projectId}`);
      const run = runs.find((item) => item.runId === runId);

      if (!run) {
        throw new Error("Report run was not found for this project.");
      }

      return await mergeLatestMetrics(run, projectId);
    } catch (error) {
      if (!isMissingDetailsRoute(error)) {
        throw error;
      }
    }
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

      return await mergeLatestMetrics(runWithProject, projectId);
    }
  }

  throw new Error("Report run was not found.");
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
