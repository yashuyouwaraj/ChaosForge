"use client";

import { useEffect, useState } from "react";

import { AiPostmortemSummary } from "./AiPostmortemSummary";
import { FailureBreakdown } from "./FailureBreakdown";
import { IncidentReportTimeline } from "./IncidentReportTimeline";
import { LatencyDistribution } from "./LatencyDistribution";
import { LatencyTrendChart } from "./LatencyTrendChart";
import { ReportOverview } from "./ReportOverview";
import { RunOperationalSummary } from "./RunOperationalSummary";
import { loadRunDetails } from "./reportData";
import { api } from "@/lib/api";
import { FailureHeatmap } from "./FailureHeatmap";
import { InfrastructureStabilityTimeline } from "./InfrastructureStabilityTimeline";
import { RegressionAnalysis } from "./RegressionAnalysis";

export function ReportDetailContent({ projectId, runId }) {
  const [run, setRun] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(Boolean(runId));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!runId) {
      return;
    }

    let ignore = false;

    const loadReport = async () => {
      try {
        setLoading(true);
        setError("");

        const runData = await loadRunDetails(runId, projectId);
        const incidentData = await api(`/api/incidents/${runId}`).catch(
          (incidentError) => {
            console.error(incidentError);
            return [];
          },
        );

        if (!ignore) {
          setRun(runData);
          setIncidents(Array.isArray(incidentData) ? incidentData : []);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Unable to load report.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadReport();

    return () => {
      ignore = true;
    };
  }, [projectId, runId]);

  if (!runId) {
    return (
      <div className="glass rounded-[32px] border border-red-500/20 bg-red-500/5 p-10">
        <h2 className="text-2xl font-black text-red-300">
          Report could not be loaded
        </h2>
        <p className="mt-3 text-slate-300">Report run id is missing.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="glass rounded-[32px] p-10 text-slate-300">
        Loading report...
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass rounded-[32px] border border-red-500/20 bg-red-500/5 p-10">
        <h2 className="text-2xl font-black text-red-300">
          Report could not be loaded
        </h2>
        <p className="mt-3 text-slate-300">{error}</p>
      </div>
    );
  }

  if (!run) {
    return (
      <div className="glass rounded-[32px] p-10 text-slate-300">
        Report not found.
      </div>
    );
  }

  return (
    <>
      <ReportOverview run={run} runId={runId} />

      <RunOperationalSummary run={run} />

      <RegressionAnalysis projectId={projectId} runId={runId} />

      <FailureBreakdown run={run} />

      <LatencyDistribution run={run} />

      <LatencyTrendChart run={run} runId={runId} />

      <FailureHeatmap run={run} runId={runId} />

      <InfrastructureStabilityTimeline run={run} runId={runId} />

      <IncidentReportTimeline incidents={incidents} runId={runId} />

      <AiPostmortemSummary incidents={incidents} run={run} runId={runId} />
    </>
  );
}
