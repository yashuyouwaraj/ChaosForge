const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../user/user.model");

const ALLOWED_PLANS = new Set(["free", "pro", "enterprise"]);

const createAuthToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      plan: user.plan,
      planStatus: user.planStatus,
      planExpiresAt: user.planExpiresAt,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );
};

const signup = async (email, password) => {
  const hashed = await bcrypt.hash(password, 10);

  const user = new User({
    email,
    password: hashed,
    plan: "free",
    planStatus: "active",
    planExpiresAt: null,
  });

  await user.save();

  return user;
};

const login = async (email, password) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    const error = new Error("Invalid password");
    error.statusCode = 401;
    throw error;
  }

  return createAuthToken(user);
};

const upgradePlan = async (email, plan) => {
  if (!ALLOWED_PLANS.has(plan)) {
    const error = new Error("Invalid plan");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOneAndUpdate(
    { email },
    { $set: { 
      plan,
      planStatus: "active",
      planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
     } },
    { new: true, runValidators: true },
  );
  if (!user) throw new Error("User not found");
  return user;
};

module.exports = { signup, login, upgradePlan, createAuthToken };
