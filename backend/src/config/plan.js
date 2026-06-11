const plans = {
  free: {
    id: "free",

    name: "Free",

    price: 0,

    features: ["Basic Simulations", "Basic Reports"],

    limits: {
      maxProjects: 3,
      maxRps: 100,
      maxDuration: 300,
    },
  },

  pro: {
    id: "pro",

    name: "Pro",

    price: 500,

    features: [
      "Advanced Reports",
      "AI Intelligence",
      "Predictive Risk",
      "Infrastructure Memory",
    ],

    limits: {
      maxProjects: 100,
      maxRps: 10000,
      maxDuration: 3600,
    },
  },

  enterprise: {
    id: "enterprise",

    name: "Enterprise",

    price: 2500,

    features: [
      "Unlimited Simulations",
      "Enterprise Analytics",
      "Priority Support",
      "Custom Integrations",
    ],

    limits: {
      maxProjects: Infinity,
      maxRps: Infinity,
      maxDuration: Infinity,
    },
  },
};

module.exports = plans;
