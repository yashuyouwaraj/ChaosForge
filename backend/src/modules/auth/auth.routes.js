const express = require("express");
const { signupHandler, loginHandler, upgradeHandler, getMe } = require("./auth.controller");
const authMiddleware = require("../../middleware/auth.middleware");

const router = express.Router();

router.post("/signup", signupHandler);
router.post("/login", loginHandler);
router.post("/upgrade",authMiddleware,upgradeHandler)
router.get("/me", authMiddleware, getMe);

module.exports = router;
