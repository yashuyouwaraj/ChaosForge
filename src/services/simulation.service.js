const simulateProcessing = async (message) => {
  console.log("Processing:", message);

  //simulate delay (0-2 sec)
  const delay = Math.random()*2000;
  await new Promise((resolve) => setTimeout(resolve, delay));

   // simulate failure (30% chance)
  const fail = Math.random()<0.3;
  if (fail) {
    console.log("❌ Failed:", message);
    return;
  }
  console.log("✅ Success:", message);
};

module.exports = { simulateProcessing };
