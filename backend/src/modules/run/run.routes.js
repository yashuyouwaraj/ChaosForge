const express = require("express")

const { getRuns } = require("./run.controller");

const router = express.Router();

router.get("/:projectId",getRuns);

module.exports = router;