const plans = require("../config/plan");
const { getEffectivePlan } = require("../utils/plan.util");

const getSimulationLimits = (config = {}) => {
  const stageRates = Array.isArray(config.stages)
    ? config.stages.map((stage) => Number(stage.rate) || 0)
    : [];

  const stageDuration = Array.isArray(config.stages)
    ? config.stages.reduce(
        (total, stage) => total + (Number(stage.durationSec) || 0),
        0,
      )
    : 0;

  const maxRps = Math.max(
    Number(config.maxRps) || 0,
    Number(config.rps) || 0,
    Number(config.rate) || 0,
    ...stageRates,
  );

  const duration = Math.max(
    Number(config.duration) || 0,
    Number(config.durationSec) || 0,
    stageDuration,
  );

  return { maxRps, duration };
};

const enforcePlan = (req, res, next) => {
  // Get effective plan (checks expiration)
  const effectivePlan = getEffectivePlan(req.user);
  const plan = effectivePlan || "free";

  const limits = plans[plan] || plans.free;

  const config = req.normalizedConfig || req.body.config || {};
  const { maxRps, duration } = getSimulationLimits(config);

  if (maxRps > plans[plan].limits.maxRps) {
    return res.status(403).json({
      message: `Your ${plan} plan supports up to ${plans[plan].limits.maxRps} RPS.`,
    });
  }

  if (duration > plans[plan].limits.maxDuration) {
    return res.status(403).json({
      message: `Your ${plan} plan supports simulations up to ${plans[plan].limits.maxDuration} seconds.`,
    });
  }

  next();
};

module.exports = enforcePlan;
module.exports.getSimulationLimits = getSimulationLimits;
