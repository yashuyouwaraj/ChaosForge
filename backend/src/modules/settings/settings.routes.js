const express = require("express");

const authMiddleware = require("../../middleware/auth.middleware");

const {
  getUserSettings,
  updateUserSettings,
  reset,
} = require("./settings.controller");

const router = express.Router();

router.get("/", authMiddleware, getUserSettings);

router.patch("/", authMiddleware, updateUserSettings);

router.post("/reset", authMiddleware, reset);
module.exports = router;
