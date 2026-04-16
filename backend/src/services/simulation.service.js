const {recordRequest} = require("../metrics/metrics.store");
const logger = require("../utils/logger");
const {getIO} = require("../websocket/socket")

const simulateProcessing = async (message,requestId) => {
  const io = getIO();

  const log=(text,type="info")=>{
    io.emit("logs",{
      requestId,message:text,
      type,
      time:new Date().toLocaleTimeString()
    })
  }

  log(`Processing ${message}`)

  const start = Date.now();

  //simulate delay (0-2 sec)
  const delay = Math.random()*2000;
  await new Promise((resolve) => setTimeout(resolve, delay));

   // simulate failure (30% chance)
  const fail = Math.random()<0.3;

  const latency = Date.now() - start;

  if (fail) {
    log(`Failed ${message}`, "error");
    recordRequest(latency, false);
    return;
  }
  log(`Success ${message}`, "success");
  recordRequest(latency, true);
};

module.exports = { simulateProcessing };
