const simulateProcessing = async (message) => {
  console.log("Processing started...");

  //simulate delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log("Processed: ", message);
};

module.exports = { simulateProcessing };
