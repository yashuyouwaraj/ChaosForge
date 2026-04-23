const { createCheckoutSession } = require("./payment.service");
const Stripe = require("stripe");
const { upgradePlan } = require("../auth/auth.service");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const webhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.log("Webhook error:", err.message);
    return res.status(400).send("Webhook Error");
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const email = session.customer_email;

    console.log("Payment success for:", email);

    if (email) {
      upgradePlan(email, "pro");
    }
  }

  res.json({ received: true });
};

const checkout = async (req, res) => {
  const url = await createCheckoutSession(req.user.email);
  res.json({ url });
};

module.exports = { checkout, webhook };
