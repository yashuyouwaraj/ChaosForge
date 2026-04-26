const { createCheckoutSession } = require("./payment.service");
const Stripe = require("stripe");
const { upgradePlan } = require("../auth/auth.service");
const Payment = require("./payment.model");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const webhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  console.log("Stripe webhook received, signature header:", sig);

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

    console.log("Stripe webhook event received:", event.type);
    console.log("Payment success for:", email);
    console.log("Session ID:", session.id);
    console.log("Amount:", session.amount_total);

    if (email) {
      try {
        const user = await upgradePlan(email, "pro");
        console.log("User upgraded to pro:", user.email, user.plan);
        const payment = await Payment.create({
          email,
          plan,
          amount: session.amount_total / 100,
          status: "success",
          sessionId: session.id,
        });
        console.log("Payment record saved for:", email, "ID:", payment._id);
      } catch (err) {
        console.error("Webhook processing failed:", err);
        return res.status(500).json({ message: "Webhook processing failed" });
      }
    } else {
      console.warn("Webhook checkout.session.completed missing customer_email");
    }
  }

  res.json({ received: true });
};

const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ email: req.user.email }).sort({ date: -1 });
    res.json(payments);
  } catch (err) {
    console.error("Failed to fetch payment history:", err);
    res.status(500).json({ message: "Failed to fetch payment history" });
  }
};

const confirmPayment = async (req, res) => {
  try {
    const sessionId = req.query.session_id;

    if (!sessionId) {
      return res.status(400).json({ message: "Missing session_id" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    const email = session.customer_email;
    const plan = session.metadata.plan || "pro";

    if (!email) {
      return res.status(400).json({ message: "Session missing customer email" });
    }

    const existingPayment = await Payment.findOne({ sessionId: session.id });

    if (!existingPayment) {
      await Payment.create({
        email,
        plan,
        amount: session.amount_total / 100,
        status: "success",
        sessionId: session.id,
      });
      console.log("Payment record saved via confirmation endpoint for:", email);
    }

    const user = await upgradePlan(email, plan);
    console.log("User upgraded to pro via confirmation endpoint:", user.email, user.plan);

    res.json({ message: "Payment confirmed", plan: user.plan });
  } catch (err) {
    console.error("Confirm payment failed:", err);
    res.status(500).json({ message: "Confirm payment failed" });
  }
};

const checkout = async (req, res) => {
  const url = await createCheckoutSession(req.user.email);
  console.log("Checkout session created for:", req.user.email);
  res.json({ url });
};

module.exports = { checkout, webhook, getPayments, confirmPayment };
