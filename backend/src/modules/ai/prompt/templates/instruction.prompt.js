const buildInstructionPrompt = (instruction) => `
Instruction

${instruction}
`;

module.exports = {
  buildInstructionPrompt,
};
