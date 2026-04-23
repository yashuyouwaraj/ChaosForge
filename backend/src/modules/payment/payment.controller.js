const { createCheckoutSession } = require("./payment.service");
const Stripe = require("stripe");
const { upgradePlan } = require("../auth/auth.service");
const { savePayment } = require("./payment.model");
const { getPaymentsByUser } = require("./payment.model");

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
    const plan = session.metadata.plan || "pro";

    console.log("Payment success for:", email);

    if (email) {
      upgradePlan(email, "pro");
      savePayment({
        email,
        plan,
        amount: session.amount_total / 100,
        status: "success",
        date: new Date(),
      });
    }
  }

  res.json({ received: true });
};



const getPayments = (req, res) => {
  const payments = getPaymentsByUser(req.user.email);

  res.json(payments);
};

const checkout = async (req, res) => {
  const url = await createCheckoutSession(req.user.email);
  res.json({ url });
};

module.exports = { checkout, webhook, getPayments };
