const { createCheckoutSession } = require("./payment.service");

const checkout = async (req, res) => {
  const url = await createCheckoutSession(req.user.email);
  res.json({ url });
};

module.exports = { checkout };
