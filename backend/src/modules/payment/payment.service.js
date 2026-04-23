const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


const createCheckoutSession = async (email) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card", "upi"],
    mode: "payment",
    customer_email: email,
    
    metadata:{
      plan:"pro" // 👈 ADD THIS
    },
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: "ChaosForge Pro Plan",
          },
          unit_amount: 50000, //Rs 500
        },
        quantity: 1,
      },
    ],
    success_url: "http://localhost:3001/success",
    cancel_url: "http://localhost:3001/cancel",
  });
  return session.url;
};

module.exports = { createCheckoutSession };
