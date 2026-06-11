const User = require("../modules/user/user.model");

const getEffectivePlan = (user) => {
  if (!user) {
    return "free";
  }

  if (
    user.plan !== "free" &&
    user.planExpiresAt &&
    new Date() > user.planExpiresAt
  ) {
    return "free";
  }

  return user.plan;
};

const getPlanStatus = (user) => {
  if (
    user.plan !== "free" &&
    user.planExpiresAt &&
    new Date() > user.planExpiresAt
  ) {
    return "expired";
  }

  return "active";
};

// Persist expired plan to database
const updateExpiredPlans = async (userId) => {
  const user = await User.findById(userId);
  
  if (
    user &&
    user.plan !== "free" &&
    user.planExpiresAt &&
    new Date() > user.planExpiresAt
  ) {
    // Plan has expired - update database
    await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          plan: "free",
          planStatus: "expired",
        },
      },
      { new: true }
    );
    console.log(`Plan expired for user ${user.email} - downgraded to free`);
    return true;
  }
  
  return false;
};

module.exports = {
  getEffectivePlan,
  getPlanStatus,
  updateExpiredPlans,
};
