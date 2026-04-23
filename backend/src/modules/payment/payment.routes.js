const express = require("express");
const authMiddleware = require("../../middleware/auth.middleware");
const { checkout, webhook, getPayments } = require("./payment.controller");

const router = express.Router();

router.post("/checkout", authMiddleware, checkout);

// Raw body is required for Stripe webhook signature verification.
router.post("/webhook", express.raw({ type: "application/json" }), webhook);

router.get("/history", authMiddleware, getPayments);

module.exports = router;
