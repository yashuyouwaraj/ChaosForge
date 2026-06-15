const generateSimulationInsights = (metrics = {}) => {
  const insights = [];
  const anomalies = [];
  const recommendations = [];

  const {
    avgLatency = 0,
    p95Latency = 0,
    success = 0,
    failure = 0,
    rps = 0,
  } = metrics;

  const totalRequests = success + failure;
  const successRate = totalRequests > 0 ? (success / totalRequests) * 100 : 0;

  if (totalRequests === 0) {
    return {
      score: 0,
      anomalies: [],
      insights: [
        {
          severity: "info",
          title: "No Simulation Data",
          explanation:
            "No completed simulation metrics were available for analysis.",
        },
      ],
      recommendations: [],
      successRate: 0,
    };
  }

  let score = 100;

  // LATENCY ANALYSIS

  if (avgLatency > 500) {
    score -= 15;

    anomalies.push({
      severity: "medium",
      title: "High Average Latency",
      description: "Average response time exceeds recommended thresholds.",
    });

    recommendations.push(
      "Optimize backend response times and database queries.",
    );
  }

  // P95 ANALYSIS

  if (p95Latency > 1000 && p95Latency > avgLatency * 2.5) {
    score -= 20;

    anomalies.push({
      severity: "high",
      title: "Latency Degradation",
      description: "Tail latency is significantly higher than average latency.",
    });

    recommendations.push("Investigate slow requests and latency spikes.");
  }

  // FAILURE ANALYSIS

  if (failure > 0) {
    score -= 25;

    anomalies.push({
      severity: "critical",
      title: "Request Failures Detected",
      description: `${failure} failed requests detected during simulation.`,
    });

    recommendations.push(
      "Review logs and error responses for root cause analysis.",
    );
  }

  // THROUGHPUT ANALYSIS

  if (rps < 30) {
    score -= 10;

    insights.push({
      severity: "warning",
      title: "Low Throughput",
      explanation: "Requests per second are below expected operational levels.",
    });

    recommendations.push(
      "Increase worker concurrency and optimize bottlenecks.",
    );
  }

  // SUCCESS RATE

  if (successRate > 99) {
    insights.push({
      severity: "info",
      title: "Excellent Reliability",
      explanation: "Simulation completed with near-perfect success rate.",
    });
  }

  score = Math.max(0, score);

  return {
    score,
    anomalies,
    insights,
    recommendations,
    successRate,
  };
};

module.exports = {
  generateSimulationInsights,
};
