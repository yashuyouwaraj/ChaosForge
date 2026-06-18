const express = require('express');
const authMiddleware = require('../../middleware/auth.middleware')
const controller = require('./project.controller')
const {runProjectTraffic} = require("./project.controller")
const { verifyProjectOwnership } = require("../../middleware/ownership.middleware");

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const router = express.Router();

router.post("/",authMiddleware,asyncHandler(controller.createProject))
router.get("/",authMiddleware,asyncHandler(controller.getProjects))
router.delete("/",authMiddleware,asyncHandler(controller.deleteProjects))
router.patch("/:id",authMiddleware,verifyProjectOwnership,asyncHandler(controller.updateProject))
router.delete("/:id",authMiddleware,verifyProjectOwnership,asyncHandler(controller.deleteProject))
router.post("/:id/traffic",authMiddleware,verifyProjectOwnership,asyncHandler(runProjectTraffic))
router.get("/:id",authMiddleware,verifyProjectOwnership,asyncHandler(controller.getProject))

module.exports = router;
