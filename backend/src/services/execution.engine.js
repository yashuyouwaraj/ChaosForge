const pLimitModule = require("p-limit");
const { v4: uuidv4 } = require("uuid");
const { simulateProcessing } = require("./simulation.service");

const pLimit = pLimitModule.default || pLimitModule;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const runConstantSecond = async ({
  rate,
  concurrency,
  projectId,
  url,
  runId,
}) => {
  const limit = pLimit(concurrency);
  const batch = [];

  for (let i = 0; i < rate; i++) {
    batch.push(
      limit(() => simulateProcessing(url, uuidv4(), projectId, runId)),
    );
  }
  await Promise.all(batch);
};

// 🔥 NEW: run stages (time-based)
const runStages = async ({ stages, concurrency, projectId, url, runId }) => {
  const limit = pLimit(Number(concurrency) || 1);
  const pending = [];

  for (const stage of stages) {
    const durationSec = Number(stage.durationSec) || 0;
    const rate = Number(stage.rate) || 0;

    for (let second = 0; second < durationSec; second++) {
      for (let i = 0; i < rate; i++) {
        pending.push(
          limit(() => simulateProcessing(url, uuidv4(), projectId, runId)),
        );
      }
      await delay(1000);
    }
  }

  await Promise.all(pending);
};

// existing modes (keep yours, minor tweak to call helper)
const runRequestMode = async ({
  totalRequests,
  rate,
  concurrency,
  projectId,
  url,
  runId,
}) => {
  const limit = pLimit(concurrency);
  let sent = 0;

  while (sent < totalRequests) {
    const batch = [];
    for (let i = 0; i < rate && sent < totalRequests; i++) {
      batch.push(
        limit(() => simulateProcessing(url, uuidv4(), projectId, runId)),
      );
      sent++;
    }
    await Promise.all(batch);
    await delay(1000);
  }
};

const runDurationMode = async ({ duration, rate, concurrency, projectId, url, runId }) =>{
    const endTime = Date.now() + duration * 1000

    while(Date.now() < endTime){
        await runConstantSecond({ rate, concurrency, projectId, url, runId })
        await delay(1000)
    }
}

module.exports = {
  runRequestMode,
  runDurationMode,
  runStages
};

