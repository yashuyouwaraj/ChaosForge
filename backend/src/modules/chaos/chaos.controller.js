const {
  getChaosSettings,
  updateChaosSettings,
  resetChaosSettings,
  applyChaosProfile,
} = require("./chaos.service");

const { validateChaosConfig } = require("./chaos.validator");

const getChaos = async (req, res) => {
  try {
    const chaos = await getChaosSettings(req.user.id, req.params.projectId);

    res.json(chaos);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

const updateChaos = async (req, res) => {
  try {
    const chaosConfig = validateChaosConfig(req.body);

    const chaos = await updateChaosSettings(
      req.user.id,
      req.params.projectId,
      chaosConfig,
    );

    res.json(chaos);
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};

const resetChaos = async (req, res) => {
  try {
    const chaos = await resetChaosSettings(req.user.id, req.params.projectId);

    res.json(chaos);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

const applyProfile = async (req, res) => {
  try {
    const chaos = await applyChaosProfile(
      req.user.id,
      req.params.projectId,
      req.body.profile,
    );

    res.json(chaos);
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};

module.exports = {
  getChaos,
  updateChaos,
  resetChaos,
  applyProfile,
};
