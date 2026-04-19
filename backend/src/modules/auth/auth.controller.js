const { signup, login, upgradePlan, createAuthToken } = require("./auth.service");

const signupHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await signup(email, password);

    res.json(user);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message || "Signup failed",
    });
  }
};

const loginHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    const token = await login(email, password);
    res.json({ token });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message || "Login failed",
    });
  }
};

const upgradeHandler = (req, res) => {
  const { plan } = req.body;
  const user = upgradePlan(req.user.email, plan);
  const token = createAuthToken(user);

  res.json({
    message: "Plan upgraded successfully",
    plan: user.plan,
    token,
  });
};

module.exports = { signupHandler, loginHandler, upgradeHandler };
