const jwt = require("jsonwebtoken");
const User = require("../modules/user/user.model");
const { getEffectivePlan, getPlanStatus, updateExpiredPlans } = require("../utils/plan.util");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user;

    if (decoded.id) {
      user = await User.findById(decoded.id);
    } else if (decoded.email) {
      user = await User.findOne({
        email: decoded.email,
      });
    }

    if (!user) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    // Check and update expired plans in database
    await updateExpiredPlans(user._id);

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      plan: getEffectivePlan(user),
      planStatus: getPlanStatus(user),
      planExpiresAt: user.planExpiresAt,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
};

module.exports = authMiddleware;
