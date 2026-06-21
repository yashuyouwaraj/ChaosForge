const buildExplainRunInstruction = () => `
Explain this simulation run using ONLY the supplied intelligence context.

Return valid JSON with this structure:

{
  "executiveSummary": "",
  "cards": [
    {
      "type": "executive|health|risk|latency|failures|rootCause|memory|recommendations|confidence",
      "title": "",
      "content": "",
      "severity": "info|moderate|warning|high|critical",
      "confidence": 95,
      "items": []
    }
  ],
  "findings": [],
  "rootCause": { "title": "", "explanation": "", "confidence": 95 },
  "recommendations": [
    { "priority": "High", "recommendation": "", "expectedImpact": "", "category": "Performance" }
  ],
  "confidence": 95
}

Cover executive summary, health, risk, latency, failures, root cause, infrastructure memory, recommendations, and confidence.
Do not recalculate scores. Explain existing intelligence only.
`;

const buildExplainDashboardInstruction = () => `
Explain the overall infrastructure dashboard state using ONLY the supplied context.

Return valid JSON with cards covering:
- overall infrastructure health
- system stability
- major bottlenecks
- top risks
- current incidents
- operational observations
- recommended actions
- confidence

Use the same JSON structure as explain run with appropriate card types.
`;

const buildExplainReportInstruction = () => `
Explain this operational report using ONLY the supplied intelligence and report context.

Return valid JSON with cards covering:
- Health Score
- Risk
- Infrastructure Health
- Trend
- Operational Insights
- Recommendations
- Infrastructure Memory
- Confidence

Do not recalculate metrics. Explain existing intelligence only.
`;

const buildRunComparisonInstruction = () => `
Compare two simulation runs using ONLY the supplied comparison context.

Return valid JSON with cards covering:
- Executive Summary
- Health Difference
- Latency Difference
- Regression Analysis
- Improvement Analysis
- Recovered Problems
- New Problems
- Deployment Recommendation
- Overall Winner
- Confidence

Include findings and recommendations arrays.
`;

const buildIncidentInvestigatorInstruction = () => `
Investigate operational incidents using ONLY the supplied timeline, intelligence, and memory context.

Return valid JSON with cards covering:
- Executive Summary
- Timeline Explanation
- Contributing Factors
- Likely Root Cause
- Recommended Fix
- Confidence

Correlate timeline, infrastructure memory, historical runs, health, risk, and root cause signals.
`;

const buildExecutiveBriefInstruction = () => `
Generate a CTO-friendly executive brief using ONLY the supplied intelligence.

No implementation details.

Return valid JSON with cards covering:
- Business Impact
- Operational Health
- Risks
- Priorities
- Recommended Actions
- Confidence
`;

const buildOptimizationAdvisorInstruction = () => `
Analyze simulation configuration and performance using ONLY the supplied context.

Recommend configuration improvements with expected impact.

Return valid JSON with cards covering:
- configuration analysis (retries, timeouts, workers, traffic pattern, concurrency)
- latency and failure observations
- recommended configuration improvements
- expected health improvement
- expected latency improvement
- deployment confidence
- confidence score
`;

const buildChaosExperimentAdvisorInstruction = (goal = "") => `
Design a chaos engineering experiment for this goal: "${goal || "resilience validation"}"

Reuse the existing chaos configuration format from context when available.

Return valid JSON with cards covering:
- Chaos Profile recommendation (type: "chaosProfile", include metadata.configuration with enabled, profile, failureRate, latency, timeout, packetLoss, connectionReset fields matching ChaosForge chaos settings)
- Latency injection settings
- Packet Loss settings
- Timeout injection settings
- Failure Injection settings
- Duration
- Expected Result
- Rollback Strategy
- Success Criteria
`;

const buildCapacityPlanningInstruction = () => `
Analyze infrastructure capacity using ONLY the supplied intelligence context.

Return valid JSON with cards covering:
- Future Bottlenecks
- Scaling Strategy
- CPU pressure assessment
- Memory pressure assessment
- Worker scaling recommendation
- Traffic scaling recommendation
- Expected Health outlook
- Deployment Recommendation
- Confidence
`;

const buildRunbookInstruction = () => `
Generate an operational runbook using ONLY the supplied intelligence context.

Return valid JSON with cards covering:
- Detection
- Diagnosis
- Immediate Actions
- Recovery Steps
- Validation
- Rollback
- Postmortem Tasks
`;

const buildPostmortemInstruction = () => `
Generate an engineering postmortem using ONLY the supplied intelligence context.

Return valid JSON with cards covering:
- Timeline
- Impact
- Root Cause
- Contributing Factors
- Lessons Learned
- Action Items
- Confidence
`;

const buildAiReportGeneratorInstruction = () => `
Generate an AI-enhanced operational report narrative using ONLY the supplied intelligence context.

Return valid JSON with cards covering:
- Executive Summary
- Technical Summary
- Operational Summary
- Business Summary
- Recommendations
- Future Risks
- Infrastructure Memory highlights
- Confidence
`;

const buildWeeklyInfrastructureReviewInstruction = () => `
Generate a weekly infrastructure review using ONLY the supplied project context.

Summarize all recent runs, top incidents, recurring problems, health trends, risk trends, and recommendations.

Return valid JSON with cards and an executive summary.
`;

const buildAskChaosForgeInstruction = (userMessage = "") => `
Answer the user's infrastructure question using ONLY the supplied context.

User question: "${userMessage || "Provide an operational summary."}"

Support follow-up reasoning using conversation history in context.

Return valid JSON with:
- executiveSummary
- cards (actionable insights)
- findings
- recommendations
- confidence
`;

module.exports = {
  buildExplainRunInstruction,
  buildExplainDashboardInstruction,
  buildExplainReportInstruction,
  buildRunComparisonInstruction,
  buildIncidentInvestigatorInstruction,
  buildExecutiveBriefInstruction,
  buildOptimizationAdvisorInstruction,
  buildChaosExperimentAdvisorInstruction,
  buildCapacityPlanningInstruction,
  buildRunbookInstruction,
  buildPostmortemInstruction,
  buildAiReportGeneratorInstruction,
  buildWeeklyInfrastructureReviewInstruction,
  buildAskChaosForgeInstruction,
};
