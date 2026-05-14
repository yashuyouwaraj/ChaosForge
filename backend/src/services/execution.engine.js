const pLimitModule = require("p-limit");
const { v4: uuidv4 } = require("uuid");
const { simulateProcessing } = require("./simulation.service");
const { getControl } = require("../control/control.store");

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

  for (const stage of stages) {
    const durationSec = Number(stage.durationSec) || 0;
    const baseRate = Number(stage.rate) || 0;

    for (let second = 0; second < durationSec; second++) {
      // 🔥 CHECK CONTROL EVERY SECOND
      const state = await waitIfPaused(projectId, runId);
      if (state === "stopped") return;

      // 🔥 GET LIVE RATE (override support)
      const rate = await getEffectiveRate(projectId, runId, baseRate);

      const promises = [];

      for (let i = 0; i < rate; i++) {
        promises.push(
          limit(() =>
            simulateProcessing(url, uuidv4(), projectId, runId)
          )
        );
      }

      // 🔥 execute THIS SECOND’s requests
      await Promise.all(promises);

    }
  }
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
  const limit = pLimit(Number(concurrency) || 1);
  let sent = 0;

  while (sent < totalRequests) {
    // 🔥 control check
    const state = await waitIfPaused(projectId, runId);
    if (state === "stopped") return;

    // 🔥 dynamic rate (uses incoming rate as base)
    const effectiveRate = await getEffectiveRate(projectId, runId, rate);

    const batch = [];

    for (let i = 0; i < effectiveRate && sent < totalRequests; i++) {
      batch.push(
        limit(() =>
          simulateProcessing(url, uuidv4(), projectId, runId)
        )
      );
      sent++;
    }

    // execute this second's batch
    await Promise.all(batch);

    // next second tick
    await delay(1000);
  }
};

const runDurationMode = async ({
  duration,
  rate,
  concurrency,
  projectId,
  url,
  runId,
}) => {
  const endTime = Date.now() + duration * 1000;
  const baseRate = Number(rate) || 0;

  while (Date.now() < endTime) {
    const state = await waitIfPaused(projectId, runId);
    if (state === "stopped") return;

    const effectiveRate = await getEffectiveRate(projectId, runId, baseRate);

    //then fire 'rate' requests for this second

    await runConstantSecond({
      rate: effectiveRate,
      concurrency,
      projectId,
      url,
      runId,
    });
    await delay(1000);
  }
};

const waitIfPaused = async (projectId, runId) => {
  while (true) {
    const { status } = await getControl(projectId, runId);

    if (status === "stopped") return "stopped";
    if (status === "running") return "running";
    // paused
    await new Promise((r) => setTimeout(r, 300));
  }
};

const getEffectiveRate = async (projectId, runId, baseRate) => {
  const { rateOverride } = await getControl(projectId, runId);
  return rateOverride && rateOverride > 0 ? rateOverride : baseRate;
};

module.exports = {
  runRequestMode,
  runDurationMode,
  runStages,
};
