const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createUser, findUserByEmail } = require("../user/user.model");

const signup = async (email, password) => {
  const hashed = await bcrypt.hash(password, 10);
  return createUser({ email, password: hashed, role: "user" });
};

const login = async (email, password) => {
  const user = findUserByEmail(email);

  if (!user) throw new Error("User not found");

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) throw new Error("Invalid password");

  const token = jwt.sign(
    {
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return token;
};

module.exports = { signup, login };
