const { getProjectMemory, saveMemory } = require("./memory.service");

const getMemory = async (req, res) => {
  try {
    const memory = await getProjectMemory(req.params.projectId);
    res.json(memory);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch memory" });
  }
};

const createMemory = async (req, res) => {
  try {
    const memory = await saveMemory(req.body);
    res.status(201).json(memory);
  } catch (err) {
    res.status(500).json({ error: "Failed to create memory" });
  }
};

module.exports = {
  getMemory,
  createMemory,
};
