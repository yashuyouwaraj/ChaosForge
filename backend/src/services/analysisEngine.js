const generateInfrastructureInsights = ({
  health,
  alerts,
}) => {
  const insights = [];

  if (
    health.redis !==
      "connected" &&
    alerts.some(
      (a) =>
        a.message.includes(
          "Redis",
        ),
    )
  ) {
    insights.push({
      severity:
        "critical",

      title:
        "Redis Instability Detected",

      explanation:
        "Redis connectivity issues may impact realtime metrics, websocket synchronization, and distributed state management.",

      recommendation:
        "Verify Redis availability, connection pooling, and memory pressure.",
    });
  }

  if (
    health.memory
      ?.heapUsed >
    300 * 1024 * 1024
  ) {
    insights.push({
      severity:
        "warning",

      title:
        "Elevated Memory Pressure",

      explanation:
        "Backend memory usage is increasing under current operational load.",

      recommendation:
        "Inspect worker concurrency, websocket scaling, and request batching.",
    });
  }

  if (
    health.activeRuns >
    5
  ) {
    insights.push({
      severity:
        "warning",

      title:
        "High Simulation Concurrency",

      explanation:
        "Multiple active simulations are increasing infrastructure load and operational pressure.",

      recommendation:
        "Monitor Kafka throughput, worker queues, and websocket stability.",
    });
  }

  if (
    health.websockets
      ?.connectedClients >
    50
  ) {
    insights.push({
      severity:
        "info",

      title:
        "Websocket Load Increasing",

      explanation:
        "Realtime client connections are increasing across observability streams.",

      recommendation:
        "Monitor socket scaling and event throughput under sustained traffic.",
    });
  }

  if (
    alerts.length === 0
  ) {
    insights.push({
      severity: "info",

      title:
        "Infrastructure Stable",

      explanation:
        "No critical operational anomalies detected across monitored systems.",

      recommendation:
        "Continue monitoring infrastructure telemetry and simulation health.",
    });
  }

  return insights;
};

module.exports = {
  generateInfrastructureInsights,
};