const express = require("express");
const { signupHandler, loginHandler, upgradeHandler } = require("./auth.controller");
const authMiddleware = require("../../middleware/auth.middleware");

const router = express.Router();

router.post("/signup", signupHandler);
router.post("/login", loginHandler);
router.post("/upgrade",authMiddleware,upgradeHandler)

module.exports = router;
