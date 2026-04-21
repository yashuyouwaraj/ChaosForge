const express = require("express");
const authMiddleware = require("../../middleware/auth.middleware");
const { checkout } = require("./payment.controller");

const router = express.Router();

router.post("/checkout", authMiddleware, checkout);

module.exports = router;
