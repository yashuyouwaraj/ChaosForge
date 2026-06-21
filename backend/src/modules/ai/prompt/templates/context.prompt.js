const buildContextPrompt = (context) => `
Infrastructure Context

${JSON.stringify(context, null, 2)}
`;

module.exports = {
  buildContextPrompt,
};
