"use client";

import { useEffect, useState } from "react";

import { api } from "@/lib/api";

import { ReportSummaryCard } from "./ReportSummaryCard";

export function ReportsTable() {
  const [runs, setRuns] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let ignore = false;

    const loadReports =
      async () => {
        try {
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

                  projectName:
                    project.name,
                });
              },
            );
          }

          if (!ignore) {
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
  }, []);

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
          Historical simulation
          reports will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {runs.map((run) => (
        <ReportSummaryCard
          key={run.runId}
          run={run}
        />
      ))}
    </div>
  );
}