const { signup, login } = require("./auth.service");

const signupHandler = async (req, res) => {
  const { email, password } = req.body;
  const user = await signup(email, password);

  res.json(user);
};

const loginHandler = async (req, res) => {
  const { email, password } = req.body;
  const token = await login(email, password);
  res.json({ token });
};

module.exports = { signupHandler, loginHandler };
