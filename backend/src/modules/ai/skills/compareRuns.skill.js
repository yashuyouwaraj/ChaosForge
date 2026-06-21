const buildRunComparisonInstruction = () => `
Compare the current run against previous runs.

Explain:

- Improvements

- Regressions

- New issues

- Repeated patterns

- Overall trend

Return JSON.
`;

module.exports = {
  buildRunComparisonInstruction,
};
