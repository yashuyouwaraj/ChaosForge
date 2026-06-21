const buildPostmortemInstruction = () => `
Generate an engineering postmortem.

Include

Timeline

Impact

Root Cause

Contributing Factors

Lessons Learned

Action Items

Return JSON.
`;

module.exports = {
  buildPostmortemInstruction,
};
