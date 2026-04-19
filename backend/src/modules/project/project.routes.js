const express = require('express');
const authMiddleware = require('../../middleware/auth.middleware')
const controller = require('./project.controller')
const {runProjectTraffic} = require("./project.controller")

const router = express.Router();

router.post("/",authMiddleware,controller.createProject)
router.get("/",authMiddleware,controller.getProjects)
router.post("/:id/traffic",authMiddleware,runProjectTraffic)
router.get("/:id",authMiddleware,controller.getProject)

module.exports = router;