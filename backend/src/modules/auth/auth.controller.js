const { signup, login } = require("./auth.service");
const User = require("../user/user.model");
const {
  wakeGrafanaInBackground,
} = require("../../services/grafana-readiness.service");
const {
  wakePrometheusInBackground,
} = require("../../services/prometheus-readiness.service");
const { getEffectivePlan, getPlanStatus } = require("../../utils/plan.util");

const wakeInfrastructureInBackground = () => {
  wakeGrafanaInBackground();
  wakePrometheusInBackground();
};

const signupHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await signup(email, password);
    wakeInfrastructureInBackground();

    res.status(201).json({
      id: user._id,
      email: user.email,
      role: user.role,
      plan: getEffectivePlan(user),
      planStatus: getPlanStatus(user),
      planExpiresAt: user.planExpiresAt,
    });
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
    wakeInfrastructureInBackground();
    res.json({ token });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message || "Login failed",
    });
  }
};

const getMe = async (req, res) => {
  const user = await User.findOne({ email: req.user.email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({
    email: user.email,
    role: user.role,
    plan: getEffectivePlan(user),
    planStatus: getPlanStatus(user),
    planExpiresAt: user.planExpiresAt,
  });
};

module.exports = { signupHandler, loginHandler, getMe };
