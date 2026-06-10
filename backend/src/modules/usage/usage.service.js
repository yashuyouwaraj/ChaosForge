const Usage = require("./usage.model");
const { getSimulationLimits } = require("../../middleware/plan.middleware");

const trackSimulation = async ({ userId, config, rps, duration }) => {
  const limits = config
    ? getSimulationLimits(config)
    : {
        maxRps: Number(rps) || 0,
        duration: Number(duration) || 0,
      };

  return Usage.findOneAndUpdate(
    { userId },
    {
      $inc: { simulationsExecuted: 1 },
      $max: {
        peakRpsUsed: limits.maxRps,
        maxDurationUsed: limits.duration,
      },
      $set: { updatedAt: new Date() },
      $setOnInsert: { projectsCreated: 0 },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
};

const trackProjectCreated = async (userId) => {
  return Usage.findOneAndUpdate(
    { userId },
    {
      $inc: { projectsCreated: 1 },
      $set: { updatedAt: new Date() },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
};

const getUsage = async (userId) => {
  return (
    (await Usage.findOne({
      userId,
    })) || {
      projectsCreated: 0,
      simulationsExecuted: 0,
      peakRpsUsed: 0,
      maxDurationUsed: 0,
    }
  );
};

module.exports = {
  trackSimulation,
  trackProjectCreated,
  getUsage,
};
