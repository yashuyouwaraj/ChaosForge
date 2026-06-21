"use client";

import { useProject } from "@/components/providers/ProjectProvider";
import { useRun } from "@/components/providers/RunProvider";
import { AiExplainButton } from "@/components/copilot/AiExplainPanel";

export function DashboardCopilotActions() {
  const { projectId } = useProject() || {};
  const { selectedRun } = useRun() || {};

  if (!projectId) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-3">
      <AiExplainButton
        label="✨ Explain Dashboard"
        title="Explain Dashboard"
        skill="explainDashboard"
        payload={{
          projectId,
          runId: selectedRun?.runId,
        }}
      />

      {selectedRun?.runId && (
        <AiExplainButton
          label="✨ Explain Run"
          title="Explain Run"
          skill="explainRun"
          payload={{
            projectId,
            runId: selectedRun.runId,
          }}
        />
      )}
    </div>
  );
}
