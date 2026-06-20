"use client";

import { AlertTriangle, FolderKanban, RefreshCw } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { useChaosSettings } from "@/hooks/useChaosSettings";

import { ChaosActionsCard } from "./ChaosActionsCard";
import { ChaosConfigurationSummary } from "./ChaosConfigurationSummary";
import { ChaosHero } from "./ChaosHero";
import { ChaosOverviewGrid } from "./ChaosOverviewGrid";
import { ChaosProfileCard } from "./ChaosProfileCard";
import { ChaosToggleCard } from "./ChaosToggleCard";
import { ConnectionResetCard } from "./ConnectionResetCard";
import { FailureCard } from "./FailureCard";
import { LatencyCard } from "./LatencyCard";
import { PacketLossCard } from "./PacketLossCard";
import { TimeoutCard } from "./TimeoutCard";

export function ChaosContent() {
  const { projectId, chaos, setChaos, loading, error, refresh } =
    useChaosSettings();

  if (!projectId) {
    return (
      <EmptyState
        title="Select a project"
        description="Choose a project from the navbar to configure its Chaos Engineering controls."
        className="mt-2"
      >
        <FolderKanban className="mx-auto h-8 w-8 text-cyan-400" />
      </EmptyState>
    );
  }

  if (loading) {
    return <ChaosPageSkeleton />;
  }

  if (error || !chaos) {
    return (
      <EmptyState
        title="Unable to load Chaos configuration"
        description={error || "The Chaos configuration is unavailable."}
        className="border-red-500/20 bg-red-500/5"
      >
        <Button
          type="button"
          variant="outline"
          onClick={refresh}
          className="mx-auto rounded-xl border-red-400/30 bg-red-500/10 px-4 text-red-200 hover:bg-red-500/20"
        >
          <RefreshCw />
          Retry
        </Button>
      </EmptyState>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-10">
      <ChaosHero chaos={chaos} />
      <ChaosOverviewGrid chaos={chaos} />
      <ChaosConfigurationSummary chaos={chaos} />

      {!chaos.enabled ? (
        <EmptyState
          title="Chaos injection is disabled"
          description="Your simulations will run normally until the Chaos Engine is enabled and the configuration is saved."
          className="border-cyan-400/20 bg-cyan-400/[0.04] p-8"
        >
          <AlertTriangle className="mx-auto h-8 w-8 text-cyan-400" />
        </EmptyState>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <ChaosProfileCard chaos={chaos} setChaos={setChaos} />
        <ChaosToggleCard chaos={chaos} setChaos={setChaos} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="xl:col-span-2">
          <LatencyCard chaos={chaos} setChaos={setChaos} />
        </div>
        <FailureCard chaos={chaos} setChaos={setChaos} />
        <TimeoutCard chaos={chaos} setChaos={setChaos} />
        <PacketLossCard chaos={chaos} setChaos={setChaos} />
        <ConnectionResetCard chaos={chaos} setChaos={setChaos} />
      </div>

      <ChaosActionsCard
        chaos={chaos}
        setChaos={setChaos}
        reload={refresh}
      />
    </div>
  );
}

function ChaosPageSkeleton() {
  return (
    <div className="space-y-6 lg:space-y-10" aria-label="Loading Chaos settings">
      <div className="glass rounded-[32px] p-8 lg:p-10">
        <div className="h-4 w-40 animate-pulse rounded-lg bg-white/10" />
        <div className="mt-5 h-12 w-80 max-w-full animate-pulse rounded-xl bg-white/10" />
        <div className="mt-5 h-5 w-full max-w-3xl animate-pulse rounded-lg bg-white/10" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="glass rounded-[24px] p-6">
            <div className="h-4 w-28 animate-pulse rounded-lg bg-white/10" />
            <div className="mt-5 h-9 w-24 animate-pulse rounded-lg bg-white/10" />
            <div className="mt-4 h-4 w-36 animate-pulse rounded-lg bg-white/10" />
          </div>
        ))}
      </div>

      {[0, 1, 2].map((item) => (
        <div key={item} className="glass rounded-[32px] p-8">
          <div className="h-7 w-52 animate-pulse rounded-xl bg-white/10" />
          <div className="mt-4 h-4 w-80 max-w-full animate-pulse rounded-xl bg-white/10" />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="h-16 animate-pulse rounded-2xl bg-white/10" />
            <div className="h-16 animate-pulse rounded-2xl bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}
