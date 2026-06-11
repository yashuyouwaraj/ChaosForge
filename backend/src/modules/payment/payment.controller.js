const { createCheckoutSession } = require("./payment.service");
const Stripe = require("stripe");
const { upgradePlan } = require("../auth/auth.service");
const Payment = require("./payment.model");
const User = require("../user/user.model");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const PAID_PLANS = new Set(["pro", "enterprise"]);

const getSessionPlan = (session) => {
  const plan = session?.metadata?.plan || "pro";

  if (!PAID_PLANS.has(plan)) {
    const error = new Error("Invalid payment plan");
    error.statusCode = 400;
    throw error;
  }

  return plan;
};

const recordPaidSession = async ({ session, stripeEventId = null }) => {
  const email = session.customer_email;

  if (!email) {
    const error = new Error("Session missing customer email");
    error.statusCode = 400;
    throw error;
  }

  const plan = getSessionPlan(session);
  const user = await User.findOne({ email });

  if (!user) {
    const error = new Error("User not found for paid session");
    error.statusCode = 404;
    throw error;
  }

  const paymentOnInsert = {
    email,
    plan,
    amount: (session.amount_total || 0) / 100,
    currency: session.currency,
    status: "success",
    sessionId: session.id,
    date: new Date(),
  };

  const paymentUpdate = {
    $set: {
      userId: user._id,
    },
    $setOnInsert: paymentOnInsert,
  };

  if (stripeEventId) {
    paymentUpdate.$set.stripeEventId = stripeEventId;
  }

  const payment = await Payment.findOneAndUpdate(
    { sessionId: session.id },
    paymentUpdate,
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  const upgradedUser = await upgradePlan(email, plan);

  return { payment, user: upgradedUser };
};

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

    console.log("Stripe webhook event received:", event.type);
    console.log("Session ID:", session.id);

    try {
      const { payment, user } = await recordPaidSession({
        session,
        stripeEventId: event.id,
      });
      console.log("Payment processed for:", user.email, "ID:", payment._id);
    } catch (err) {
      console.error("Webhook processing failed:", err);
      return res.status(err.statusCode || 500).json({
        message: "Webhook processing failed",
      });
    }
  }

  res.json({ received: true });
};

const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      $or: [{ userId: req.user.id }, { email: req.user.email }],
    }).sort({ date: -1 });
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

    if (!email) {
      return res.status(400).json({ message: "Session missing customer email" });
    }

    if (email !== req.user.email) {
      return res.status(403).json({ message: "Payment session belongs to another user" });
    }

    const { user } = await recordPaidSession({ session });
    console.log("User upgraded to pro via confirmation endpoint:", user.email, user.plan);

    res.json({ message: "Payment confirmed", plan: user.plan });
  } catch (err) {
    console.error("Confirm payment failed:", err);
    res.status(500).json({ message: "Confirm payment failed" });
  }
};

const checkout = async (req, res) => {
  const url = await createCheckoutSession({
    email: req.user.email,
    userId: req.user.id,
    plan: req.body.plan,
  });
  console.log("Checkout session created for:", req.user.email);
  res.json({ url });
};

module.exports = { checkout, webhook, getPayments, confirmPayment };
