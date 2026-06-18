const {
  getSettings,
  updateSettings,
  resetSettings,
} = require("./settings.service");

const logger = require("../../utils/logger");

const getUserSettings = async (req, res) => {
  try {
    const settings = await getSettings(req.user.id);

    return res.json(settings);
  } catch (err) {
    logger.error({
      message: "Failed to load settings",
      userId: req.user.id,
      error: err.message,
    });

    return res.status(500).json({
      error: "Failed to load settings",
    });
  }
};

const updateUserSettings = async (req, res) => {
  try {
    const settings = await updateSettings(req.user.id, req.body);

    return res.json(settings);
  } catch (err) {
    logger.error({
      message: "Failed to update settings",
      userId: req.user.id,
      error: err.message,
    });

    return res.status(500).json({
      error: "Failed to update settings",
    });
  }
};

const reset = async (req, res) => {
  try {
    const settings = await resetSettings(req.user.id);
    return res.json(settings);

  } catch (err) { 
    return res.status(500).json({
      error: "Failed to reset settings",
    });
  }
};

module.exports = {
  getUserSettings,
  updateUserSettings,
  reset
};
