const express = require('express');
const logger = require("../utils/logger");
const {sendMessage} = require('../services/producer.service');
const {generateTraffic} = require('../services/traffic.service');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');


const router = express.Router();

router.get('/traffic',authMiddleware,async(req,res)=>{
    const count = req.query.count || 10;

    const requestId = req.requestId ;

    logger.info({requestId, message:`Generating ${count} requests`})
    
    await generateTraffic(count, requestId);

    res.send(`Generated ${count} requests ✅`)
})

router.get('/send',async(req,res)=>{
    await sendMessage();
    res.send("Message sent to Kafka ✅")
})

router.get("/admin",authMiddleware,roleMiddleware("admin"),(req,res)=>{
    res.send("Welcome Admin! This is a protected route.")
})

module.exports = router;
