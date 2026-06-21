const { buildSystemPrompt } = require("./templates/System.prompt");
const { buildDeveloperPrompt } = require("./templates/developer.prompt");
const { buildContextPrompt } = require("./templates/context.prompt");
const { buildInstructionPrompt } = require("./templates/instruction.prompt");

const buildPrompt = ({ instruction, context }) => {
  return {
    system: buildSystemPrompt(),

    developer: buildDeveloperPrompt(),

    context: buildContextPrompt(context),

    user: buildInstructionPrompt(instruction),
  };
};

module.exports = {
  buildPrompt,
};
