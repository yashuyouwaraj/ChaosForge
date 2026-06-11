const Stripe = require("stripe");
const plans = require("../../config/plan");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async ({ email, userId, plan }) => {
  const selectedPlan = plans[plan];

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card", "upi"],
    mode: "payment",
    customer_email: email,
    client_reference_id: userId,

    metadata: {
      plan: plan,
      userId,
    },
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: `ChaosForge ${selectedPlan.name}`,
          },
          unit_amount: selectedPlan.price * 100, // Convert to cents
        },
        quantity: 1,
      },
    ],
    success_url:
      process.env.STRIPE_SUCCESS_URL ||
      "http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}",
    cancel_url: process.env.STRIPE_CANCEL_URL || "http://localhost:3000/cancel",
  });
  return session.url;
};

module.exports = { createCheckoutSession };
