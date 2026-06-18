const { signup, login, changePassword } = require("./auth.service");
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
    id: user._id,
    email: user.email,
    role: user.role,
    plan: getEffectivePlan(user),
    planStatus: getPlanStatus(user),
    planExpiresAt: user.planExpiresAt,
    createdAt: user.createdAt,
  });
};

const changePasswordHandler = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "Current password, new password, and confirm password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New password and confirm password do not match",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: "New password must be different from current password",
      });
    }

    await changePassword(req.user.id, currentPassword, newPassword);

    return res.json({
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Failed to change password",
    });
  }
};

module.exports = {
  signupHandler,
  loginHandler,
  getMe,
  changePasswordHandler,
};
