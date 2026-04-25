const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createUser } = require("../user/user.model");
const User = require("../user/user.model");

const createAuthToken = (user) => {
  return jwt.sign(
    {
      email: user.email,
      role: user.role,
      plan: user.plan,
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
  });

  await user.save();

  return user;
};

const login = async (email, password) => {
  const user = await User.findOne({ email });

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
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");
  user.plan = plan;
  await user.save();
  return user;
};

module.exports = { signup, login, upgradePlan, createAuthToken };
