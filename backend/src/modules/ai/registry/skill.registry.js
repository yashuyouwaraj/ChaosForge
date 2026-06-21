const { listSkills } = require("../skills/skill.builder");

const registry = Object.fromEntries(
  listSkills().map((skill) => [skill, skill]),
);

module.exports = registry;
