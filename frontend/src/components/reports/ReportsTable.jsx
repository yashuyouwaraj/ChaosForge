"use client";

import { useEffect, useState } from "react";

import { useProject } from "@/components/providers/ProjectProvider";
import { api } from "@/lib/api";

import { ReportSummaryCard } from "./ReportSummaryCard";

export function ReportsTable() {
  const { projectId: selectedProjectId } =
    useProject() || {};

  const [runs, setRuns] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [projectName, setProjectName] =
    useState("");

  useEffect(() => {
    let ignore = false;

    const loadReports =
      async () => {
        try {
          setLoading(true);

          if (selectedProjectId) {
            const [project, projectRuns] =
              await Promise.all([
                api(
                  `/projects/${selectedProjectId}`,
                ),
                api(
                  `/runs/${selectedProjectId}`,
                ),
              ]);

            if (!ignore) {
              setProjectName(
                project?.name ||
                  "Selected Project",
              );
              setRuns(
                Array.isArray(projectRuns)
                  ? projectRuns.map(
                      (run) => ({
                        ...run,
                        projectId:
                          selectedProjectId,
                        projectName:
                          project?.name ||
                          "Selected Project",
                      }),
                    )
                  : [],
              );
            }

            return;
          }

          const projects =
            await api(
              "/projects",
            );

          const allRuns = [];

          for (const project of projects) {
            const projectId =
              project._id ||
              project.id;

            const runs =
              await api(
                `/runs/${projectId}`,
              );

            runs.forEach(
              (run) => {
                allRuns.push({
                  ...run,
                  projectId,

                  projectName:
                    project.name,
                });
              },
            );
          }

          if (!ignore) {
            setProjectName("");
            setRuns(
              allRuns,
            );
          }
        } catch (err) {
          console.error(err);
        } finally {
          if (!ignore) {
            setLoading(false);
          }
        }
      };

    loadReports();

    return () => {
      ignore = true;
    };
  }, [selectedProjectId]);

  if (loading) {
    return (
      <div
        className="
          glass rounded-[32px]
          p-10
        "
      >
        Loading reports...
      </div>
    );
  }

  if (runs.length === 0) {
    return (
      <div
        className="
          glass rounded-[32px]
          p-10 text-center
        "
      >
        <h3
          className="
            text-2xl font-bold
          "
        >
          No Reports Available
        </h3>

        <p
          className="
            mt-3 text-muted-foreground
          "
        >
          {selectedProjectId
            ? "This project does not have simulation reports yet."
            : "Historical simulation reports will appear here."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {selectedProjectId && (
        <div
          className="
            rounded-2xl
            border border-white/10
            bg-black/20
            px-5 py-4
            text-sm text-slate-300
          "
        >
          Showing reports for{" "}
          <span className="font-semibold text-cyan-300">
            {projectName ||
              "Selected Project"}
          </span>
        </div>
      )}

      {runs.map((run) => (
        <ReportSummaryCard
          key={run.runId}
          run={run}
        />
      ))}
    </div>
  );
}
