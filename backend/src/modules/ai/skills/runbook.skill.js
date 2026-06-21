const buildRunbookInstruction = () => `
Generate an operational runbook for this simulation run.

Include:

1. Situation summary

2. Detection signals

3. Triage steps

4. Mitigation steps

5. Escalation criteria

6. Verification steps

7. Prevention recommendations

Return valid JSON.
`;

module.exports = {
  buildRunbookInstruction,
};
