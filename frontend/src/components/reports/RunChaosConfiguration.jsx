"use client";

import { ChaosMetricCard } from "@/components/chaos/ChaosMetricCard";
import { ChaosStatusBadge } from "@/components/chaos/ChaosStatusBadge";
import { normalizeChaosSettings } from "@/lib/chaos";

const percentage = (part, total) =>
  total > 0 ? ((Number(part || 0) / Number(total)) * 100).toFixed(1) : "0.0";

const configurationItems = (chaos) => [
  ["Enabled", <ChaosStatusBadge key="status" enabled={chaos.enabled} />],
  ["Profile", `${chaos.profile[0].toUpperCase()}${chaos.profile.slice(1)}`],
  [
    "Latency",
    chaos.latency.enabled
      ? `${chaos.latency.min}-${chaos.latency.max}ms at ${chaos.latency.percentage}%`
      : "Disabled",
  ],
  [
    "Timeout",
    chaos.timeout.enabled
      ? `${chaos.timeout.duration}ms at ${chaos.timeout.percentage}%`
      : "Disabled",
  ],
  [
    "Packet Loss",
    chaos.packetLoss.enabled ? `${chaos.packetLoss.percentage}%` : "Disabled",
  ],
  [
    "Connection Reset",
    chaos.connectionReset.enabled
      ? `${chaos.connectionReset.percentage}%`
      : "Disabled",
  ],
  [
    "Failure Rate",
    chaos.statusCode.enabled ? `${chaos.failureRate}%` : "Disabled",
  ],
];

const faultMetrics = [
  ["Latency", "latencyInjected"],
  ["Failure", "failureInjected"],
  ["Timeout", "timeoutInjected"],
  ["Packet Loss", "packetLossInjected"],
  ["Connection Reset", "connectionResetInjected"],
];

const buildRecommendations = ({ chaos, injected, resilienceRate, failed, run }) => {
  if (!chaos?.enabled) {
    return [
      "Enable a controlled Chaos profile before the next resilience validation run.",
    ];
  }

  if (injected === 0) {
    return [
      "Increase traffic volume or configured injection percentages so faults are exercised during the run.",
      "Re-run the experiment and confirm the incident timeline records injected fault behavior.",
    ];
  }

  const recommendations = [];

  if (resilienceRate < 80) {
    recommendations.push(
      "Treat this run as a critical resilience regression before increasing load.",
    );
  } else if (resilienceRate < 95) {
    recommendations.push(
      "Review affected request paths and strengthen retry plus timeout and fallback policies.",
    );
  } else {
    recommendations.push(
      "Preserve this configuration as a resilience baseline for future release comparisons.",
    );
  }

  if (failed > 0) {
    recommendations.push(
      "Correlate failed injected requests with logs and infrastructure memory patterns.",
    );
  }

  if (Number(run?.p95Latency || 0) > 1000) {
    recommendations.push(
      "Investigate tail latency during fault windows before approving higher concurrency.",
    );
  }

  return recommendations;
};

const getAssessment = (run) => {
  const injected = Number(run.chaosInjected || 0);
  const successful = Number(run.chaosSuccess || 0);
  const resilienceRate = Number(percentage(successful, injected));

  if (!run.chaosConfig) {
    return {
      label: "Unavailable",
      tone: "text-muted-foreground",
      summary: "This run predates Chaos configuration snapshots.",
    };
  }

  if (!run.chaosConfig.enabled) {
    return {
      label: "Not exercised",
      tone: "text-muted-foreground",
      summary: "Chaos Engineering was disabled for this run.",
    };
  }

  if (injected === 0) {
    return {
      label: "Not triggered",
      tone: "text-amber-300",
      summary: "Chaos was enabled, but no configured fault was injected.",
    };
  }

  return {
    label:
      resilienceRate >= 95
        ? "Resilient"
        : resilienceRate >= 80
          ? "Degraded"
          : "Critical",
    tone:
      resilienceRate >= 95
        ? "text-emerald-300"
        : resilienceRate >= 80
          ? "text-amber-300"
          : "text-red-300",
    summary: `${successful} of ${injected} fault-injected requests completed successfully.`,
  };
};

export function RunChaosConfiguration({ run }) {
  const chaos = run?.chaosConfig
    ? normalizeChaosSettings(run.chaosConfig)
    : null;
  const injected = Number(run?.chaosInjected || 0);
  const successful = Number(run?.chaosSuccess || 0);
  const failed = Number(run?.chaosFailure || 0);
  const resilienceRate = Number(percentage(successful, injected));
  const failureContribution = Number(percentage(failed, run?.failure));
  const assessment = getAssessment(run || {});
  const evidence = [
    `${injected} fault-injected request(s) observed.`,
    `${resilienceRate.toFixed(1)}% resilience rate across injected traffic.`,
    `${failureContribution.toFixed(1)}% of run failures came from chaos-injected requests.`,
  ];
  const recommendations = buildRecommendations({
    chaos,
    injected,
    resilienceRate,
    failed,
    run,
  });

  return (
    <section className="glass rounded-[32px] p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
            Enterprise Chaos Report
          </p>
          <h2 className="mt-3 text-2xl font-black">Fault Injection Analysis</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
            Immutable experiment configuration, injected fault outcomes, and
            resilience evidence captured for this run.
          </p>
        </div>

        <div className="min-w-48 rounded-2xl border border-white/10 bg-black/20 p-5">
          <p className="text-sm text-muted-foreground">Assessment</p>
          <p className={`mt-2 text-xl font-black ${assessment.tone}`}>
            {assessment.label}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {assessment.summary}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ChaosMetricCard title="Injected Requests" value={injected} />
        <ChaosMetricCard
          title="Injection Rate"
          value={percentage(injected, run?.totalRequests)}
          unit="%"
        />
        <ChaosMetricCard
          title="Resilience Rate"
          value={percentage(successful, injected)}
          unit="%"
        />
        <ChaosMetricCard
          title="Failure Attribution"
          value={percentage(failed, run?.failure)}
          unit="%"
        />
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-black">Run Configuration Snapshot</h3>
        {chaos ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {configurationItems(chaos).map(([label, value]) => (
              <div
                key={label}
                className="min-w-0 rounded-2xl border border-white/10 bg-black/20 p-5"
              >
                <p className="text-sm text-muted-foreground">{label}</p>
                <div className="mt-3 break-words text-lg font-bold">{value}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-muted-foreground">
            No configuration snapshot is available for this historical run.
          </div>
        )}
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-black">Injected Fault Breakdown</h3>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {faultMetrics.map(([title, key]) => (
            <ChaosMetricCard
              key={key}
              title={title}
              value={Number(run?.[key] || 0)}
            />
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <h3 className="text-lg font-black">Resilience Evidence</h3>
          <div className="mt-4 space-y-3">
            {evidence.map((item) => (
              <p key={item} className="text-sm leading-6 text-muted-foreground">
                {item}
              </p>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <h3 className="text-lg font-black">Recommendations</h3>
          <div className="mt-4 space-y-3">
            {recommendations.map((item) => (
              <p key={item} className="text-sm leading-6 text-muted-foreground">
                {item}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
