const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createUser, findUserByEmail } = require("../user/user.model");

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
  const existingUser = findUserByEmail(email);

  if (existingUser) {
    const error = new Error("User already exists");
    error.statusCode = 409;
    throw error;
  }

  const hashed = await bcrypt.hash(password, 10);
  return createUser({ email, password: hashed, role: "user" });
};

const login = async (email, password) => {
  const user = findUserByEmail(email);

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

const upgradePlan = (email, plan) => {
  const user = findUserByEmail(email);
  if (!user) throw new Error("User not found");
  user.plan = plan;
  return user;
};

module.exports = { signup, login, upgradePlan, createAuthToken };
