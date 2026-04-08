const express = require('express');

const {sendMessage} = require('../services/producer.service');

const router = express.Router();

router.get('/send',async(req,res)=>{
    await sendMessage();
    res.send("Message sent to Kafka ✅")
})

module.exports = router;