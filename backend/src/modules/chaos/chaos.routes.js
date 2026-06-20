const express = require("express");

const authMiddleware = require("../../middleware/auth.middleware");
const {
  verifyProjectOwnership,
} = require("../../middleware/ownership.middleware");

const {
  getChaos,
  updateChaos,
  resetChaos,
  applyProfile,
} = require("./chaos.controller");

const router = express.Router();

router.get("/:projectId", authMiddleware, verifyProjectOwnership, getChaos);

router.patch(
  "/:projectId",
  authMiddleware,
  verifyProjectOwnership,
  updateChaos,
);

router.post(
  "/:projectId/reset",
  authMiddleware,
  verifyProjectOwnership,
  resetChaos,
);

router.post(
  "/:projectId/profile",
  authMiddleware,
  verifyProjectOwnership,
  applyProfile,
);

module.exports = router;
