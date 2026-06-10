const express = require("express");

const authMiddleware = require("../../middleware/auth.middleware");

const { getMyUsage } = require("./usage.controller");

const router = express.Router();

router.get("/me", authMiddleware, getMyUsage);

module.exports = {
  router,
};
