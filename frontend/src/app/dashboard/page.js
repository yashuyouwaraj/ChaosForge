import { AppShell } from "@/components/layout/AppShell";

import { DashboardSection }
  from "@/components/dashboard/DashboardSection";

import { InfraStatusCard }
  from "@/components/dashboard/InfraStatusCard";

import { AiInsightsPreview }
  from "@/components/dashboard/AiInsightsPreview";

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="space-y-10">

        {/* HERO */}
        <section
          className="
            glass rounded-[32px]
            p-10
          "
        >
          <p
            className="
              text-sm uppercase tracking-[0.3em]
              text-cyan-400
            "
          >
            AI-native observability
          </p>

          <h1
            className="
              mt-4 max-w-4xl
              text-5xl font-black
              leading-tight
            "
          >
            Distributed Infrastructure
            Intelligence Platform
          </h1>

          <p
            className="
              mt-6 max-w-2xl
              text-lg text-muted-foreground
            "
          >
            Realtime distributed load testing,
            observability, AI insights,
            and infrastructure intelligence.
          </p>
        </section>

        {/* INFRA */}
        <DashboardSection
          title="Infrastructure Health"
          description="Realtime distributed system status."
        >
          <div
            className="
              grid gap-6
              md:grid-cols-2
              xl:grid-cols-4
            "
          >
            <InfraStatusCard
              title="Kafka Workers"
              status="healthy"
              value="8"
            />

            <InfraStatusCard
              title="Redis"
              status="healthy"
              value="Connected"
            />

            <InfraStatusCard
              title="WebSockets"
              status="healthy"
              value="42"
            />

            <InfraStatusCard
              title="Prometheus"
              status="healthy"
              value="Active"
            />
          </div>
        </DashboardSection>

        {/* AI */}
        <DashboardSection
          title="AI Insights"
          description="Realtime infrastructure intelligence."
        >
          <AiInsightsPreview />
        </DashboardSection>
      </div>
    </AppShell>
  );
}