const plans = require("../config/plans");

const enforcePlan = (req, res, next) => {
  const plan = req.user.plan || "free";

  const limits = plans[plan] || plans.free;

  const config = req.body.config || {};

  const maxRps = config.maxRps || config.rps || 0;

  const duration = config.duration || 0;

  if (maxRps > limits.maxRps) {
    return res.status(403).json({
      message: `Your ${plan} plan supports up to ${limits.maxRps} RPS.`,
    });
  }

  if (duration > limits.maxDuration) {
    return res.status(403).json({
      message: `Your ${plan} plan supports simulations up to ${limits.maxDuration} seconds.`,
    });
  }

  next();
};

module.exports = enforcePlan;
