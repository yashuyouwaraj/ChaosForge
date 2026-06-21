const Settings = require("./settings.model");
const logger = require("../../utils/logger");
const DEFAULT_SETTINGS = require("./settings.defaults");

const allowedUpdatePaths = {
  appearance: new Set(["theme", "accentColor"]),
  simulationDefaults: new Set([
    "method",
    "url",
    "headers",
    "authToken",
    "contentType",
    "payload",
    "rps",
    "duration",
    "concurrency",
    "totalRequests",
  ]),
  notifications: new Set(["email", "simulationCompleted", "weeklyReport"]),
  ai: new Set(["provider", "mode", "model"]),
};

const buildSettingsUpdate = (updates = {}) => {
  const set = {};

  Object.entries(allowedUpdatePaths).forEach(([section, allowedFields]) => {
    const sectionUpdates = updates[section];

    if (!sectionUpdates || typeof sectionUpdates !== "object") {
      return;
    }

    Object.entries(sectionUpdates).forEach(([field, value]) => {
      if (!allowedFields.has(field)) {
        return;
      }

      set[`${section}.${field}`] = value;
    });
  });

  return set;
};

const getSettings = async (userId) => {
  try {
    let settings = await Settings.findOne({
      owner: userId,
    });

    if (!settings) {
      settings = await Settings.create({
        owner: userId,
        ...DEFAULT_SETTINGS,
      });

      logger.info({
        message: "Default settings created",
        userId,
      });
    }

    return settings;
  } catch (err) {
    logger.error({
      message: "Failed to fetch settings",
      userId,
      error: err.message,
    });

    throw err;
  }
};

const updateSettings = async (userId, updates) => {
  try {
    const set = buildSettingsUpdate(updates);

    if (Object.keys(set).length === 0) {
      return await getSettings(userId);
    }

    const settings = await Settings.findOneAndUpdate(
      {
        owner: userId,
      },
      {
        $set: set,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    logger.info({
      message: "Settings updated",
      userId,
    });

    return settings;
  } catch (err) {
    logger.error({
      message: "Failed to update settings",
      userId,
      error: err.message,
    });

    throw err;
  }
};

const resetSettings = async (owner) => {
  return await Settings.findOneAndUpdate(
    { owner },
    {
      $set: DEFAULT_SETTINGS,
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );
};

module.exports = {
  getSettings,
  updateSettings,
  resetSettings,
};
