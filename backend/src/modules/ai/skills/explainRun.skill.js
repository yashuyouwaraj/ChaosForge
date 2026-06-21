const buildExplainRunInstruction = () => `
Explain this simulation run.

Include:

1. Executive summary

2. Overall health

3. Risk assessment

4. Root cause

5. Performance observations

6. Infrastructure memory correlation

7. Recommended improvements

8. Confidence

Return valid JSON.
`;

module.exports = {
  buildExplainRunInstruction,
};
