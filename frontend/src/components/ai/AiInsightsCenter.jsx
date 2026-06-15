"use client";

import { AiCapabilities } from "./AiCapabilities";
import { AiStatusGrid } from "./AiStatusGrid";
import { AiRecentFindings } from "./AiRecentFindings";
import { AiModelStatus } from "./AiModelStatus";
import { AiRoadmap } from "./AiRoadmap";
import { useAiDashboard } from "@/hooks/useAiDashboard";
import { useAiInsights } from "@/hooks/useAiInsights";

export function AiInsightsCenter() {
  const { metrics, incidents } = useAiDashboard();
  const findings = useAiInsights({ metrics, incidents });

  return (
    <div className="space-y-14">
      <AiStatusGrid findings={findings} incidents={incidents} />

      <AiRecentFindings findings={findings} />

      <AiCapabilities />

      <AiModelStatus />

      <AiRoadmap />
    </div>
  );
}
