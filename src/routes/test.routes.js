const express = require('express');

const {sendMessage} = require('../services/producer.service');

const {generateTraffic} = require('../services/traffic.service');

const router = express.Router();

router.get('/traffic',async(req,res)=>{
    const count = req.query.count || 10;

    await generateTraffic(count);

    res.send(`Generated ${count} requests ✅`)
})

router.get('/send',async(req,res)=>{
    await sendMessage();
    res.send("Message sent to Kafka ✅")
})

module.exports = router;