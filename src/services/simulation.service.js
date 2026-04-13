const {recordRequest} = require("../metrics/metrics.store")

const simulateProcessing = async (message) => {
  const start = Date.now();

  console.log("Processing:", message);

  //simulate delay (0-2 sec)
  const delay = Math.random()*2000;
  await new Promise((resolve) => setTimeout(resolve, delay));

   // simulate failure (30% chance)
  const fail = Math.random()<0.3;

  const latency = Date.now() - start;

  if (fail) {
    console.log("❌ Failed:", message);
    recordRequest(latency, false);
    return;
  }
  console.log("✅ Success:", message);
  recordRequest(latency, true);
};

module.exports = { simulateProcessing };
