const express = require("express");
const authMiddleware = require("../../middleware/auth.middleware");
const { checkout, webhook, getPayments, confirmPayment } = require("./payment.controller");

const router = express.Router();

router.post("/checkout", authMiddleware, checkout);
router.get("/history", authMiddleware, getPayments);
router.get("/confirm", authMiddleware, confirmPayment);

module.exports = { router, webhookHandler: webhook };
