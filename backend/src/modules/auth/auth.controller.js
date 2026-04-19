const { signup, login } = require("./auth.service");

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

module.exports = { signupHandler, loginHandler };
