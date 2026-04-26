const express = require('express');
const authMiddleware = require('../../middleware/auth.middleware')
const controller = require('./project.controller')
const {runProjectTraffic} = require("./project.controller")

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const router = express.Router();

router.post("/",authMiddleware,asyncHandler(controller.createProject))
router.get("/",authMiddleware,asyncHandler(controller.getProjects))
router.post("/:id/traffic",authMiddleware,asyncHandler(runProjectTraffic))
router.get("/:id",authMiddleware,asyncHandler(controller.getProject))

module.exports = router;