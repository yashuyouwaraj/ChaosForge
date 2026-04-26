const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


const createCheckoutSession = async (email) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card", "upi"],
    mode: "payment",
    customer_email: email,

    metadata: {
      plan: "pro",
    },
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: "ChaosForge Pro Plan",
          },
          unit_amount: 50000, // Rs 500
        },
        quantity: 1,
      },
    ],
    success_url: process.env.STRIPE_SUCCESS_URL || "http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}",
    cancel_url: process.env.STRIPE_CANCEL_URL || "http://localhost:3000/cancel",
  });
  return session.url;
};

module.exports = { createCheckoutSession };
