const express = require("express");

const {getMetrics} = require("../metrics/metrics.store")

const router = express.Router();

router.get("/metrics",(req,res)=>{
    res.json(getMetrics())
})

module.exports = router;