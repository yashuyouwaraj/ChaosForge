"use client";

import { useState } from "react";
import { Check, Loader2, Sparkles, Zap } from "lucide-react";

import { useProject } from "@/components/providers/ProjectProvider";
import { useRun } from "@/components/providers/RunProvider";
import { useAiCopilot } from "@/hooks/useAiCopilot";
import { AiResponseCards } from "./AiResponseCards";
import { AiResponseMetadata } from "./AiResponseMetadata";
import { applyChaosProfile, updateChaosSettings } from "@/lib/chaos";

const extractChaosConfig = (response) => {
  const cards = response?.cards || [];
  const chaosCard = cards.find(
    (card) =>
      card.type === "chaosProfile" ||
      card.title?.toLowerCase().includes("chaos"),
  );

  if (!chaosCard?.metadata?.configuration) {
    return null;
  }

  return chaosCard.metadata.configuration;
};

export function ChaosAdvisorPanel() {
  const { projectId } = useProject() || {};
  const { selectedRun } = useRun() || {};
  const { response, loading, streaming, streamText, error, invoke } =
    useAiCopilot();
  const [goal, setGoal] = useState("");
  const [applying, setApplying] = useState(false);
  const [applyStatus, setApplyStatus] = useState("");

  const handleGenerate = async () => {
    if (!projectId || !goal.trim()) {
      return;
    }

    setApplyStatus("");
    await invoke(
      "chaosExperimentAdvisor",
      {
        projectId,
        runId: selectedRun?.runId,
        goal: goal.trim(),
      },
      { stream: true },
    );
  };

  const handleApply = async () => {
    const config = extractChaosConfig(response);

    if (!projectId || !config) {
      setApplyStatus("No chaos configuration found in AI response.");
      return;
    }

    setApplying(true);
    setApplyStatus("");

    try {
      await updateChaosSettings(projectId, {
        ...config,
        enabled: true,
        profile: "custom",
      });
      setApplyStatus("Chaos configuration applied successfully.");
    } catch (err) {
      setApplyStatus(err.message || "Failed to apply configuration.");
    } finally {
      setApplying(false);
    }
  };

  const handleApplyProfile = async (profile) => {
    if (!projectId) {
      return;
    }

    setApplying(true);

    try {
      await applyChaosProfile(projectId, profile);
      setApplyStatus(`Applied ${profile} chaos profile.`);
    } catch (err) {
      setApplyStatus(err.message || "Failed to apply profile.");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="glass rounded-[32px] p-8">
      <div className="flex items-center gap-3">
        <Zap className="h-6 w-6 text-orange-300" />
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-orange-400">
            Chaos Advisor
          </p>
          <h2 className="text-2xl font-black">AI Chaos Experiment Designer</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Describe your resilience goal and AI will generate a chaos profile
            with latency, packet loss, failure rate, timeout, duration, rollback,
            and expected impact.
          </p>
        </div>
      </div>

      {!projectId && (
        <div className="mt-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5 text-yellow-200">
          Select a project to use Chaos Advisor.
        </div>
      )}

      <div className="mt-6 space-y-4">
        <textarea
          value={goal}
          onChange={(event) => setGoal(event.target.value)}
          placeholder='Example: "I want to test payment service resilience under network degradation."'
          rows={3}
          className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-sm text-slate-100 outline-none"
        />

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || !projectId || !goal.trim()}
            className="inline-flex items-center gap-2 rounded-2xl border border-orange-500/20 bg-orange-500/10 px-5 py-3 text-sm font-semibold text-orange-300 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Generate Chaos Profile
          </button>

          {response && (
            <button
              type="button"
              onClick={handleApply}
              disabled={applying}
              className="inline-flex items-center gap-2 rounded-2xl border border-green-500/20 bg-green-500/10 px-5 py-3 text-sm font-semibold text-green-300 disabled:opacity-50"
            >
              {applying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Apply Configuration
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {["latency", "network", "failure", "stress"].map((profile) => (
            <button
              key={profile}
              type="button"
              onClick={() => handleApplyProfile(profile)}
              disabled={applying || !projectId}
              className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-slate-300 hover:bg-black/30 disabled:opacity-50"
            >
              Reuse {profile} profile
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-red-200">
          {error}
        </div>
      )}

      {applyStatus && (
        <div className="mt-4 rounded-2xl border border-green-500/20 bg-green-500/5 p-4 text-green-200">
          {applyStatus}
        </div>
      )}

      {(response || streamText) && (
        <div className="mt-8">
          {response?.metadata && (
            <AiResponseMetadata metadata={response.metadata} streaming={streaming} />
          )}
          <AiResponseCards
            response={response}
            streaming={streaming}
            streamText={streamText}
          />
        </div>
      )}
    </div>
  );
}
