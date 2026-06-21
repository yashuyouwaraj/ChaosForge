/**
 * ChaosForge Intelligence Platform — canonical health score formula.
 *
 * Starting score: 100
 * Deductions:
 * - Failure rate >20%: -30 | >10%: -20 | >5%: -10 | >0%: -5
 * - Avg latency >2000ms: -20 | >1000ms: -15 | >500ms: -8
 * - P95 latency >3000ms: -20 | >2000ms: -15 | >1000ms: -8
 * - Error types: up to -20 (5 per 5 errors)
 *
 * Status: excellent ≥90 | good ≥75 | warning ≥50 | critical <50
 * Grade: A ≥90 | B ≥75 | C ≥50 | D <50
 */

module.exports = {};
