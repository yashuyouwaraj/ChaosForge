const BASE_URL = process.env.BASE_URL || "http://localhost:3001";
const PROJECT_ID = process.env.PROJECT_ID;
const TOKEN = process.env.TOKEN;

const payload = {
  url: "https://jsonplaceholder.typicode.com/posts",
  config: {
    pattern: "stages",
    concurrency: 10,
    stages: [
      { durationSec: 5, rate: 10 },
      { durationSec: 5, rate: 50 },
      { durationSec: 5, rate: 100 },
      { durationSec: 5, rate: 50 },
      { durationSec: 5, rate: 10 },
    ],
  },
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const request = async (path, options = {}) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: TOKEN ? `Bearer ${TOKEN}` : "",
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(`${options.method || "GET"} ${path} failed: ${res.status} ${JSON.stringify(data)}`);
  }

  return data;
};

const summarize = (run) => ({
  runId: run?.runId,
  status: run?.status,
  totalRequests: run?.totalRequests || 0,
  success: run?.success || 0,
  failure: run?.failure || 0,
  avgLatency: run?.avgLatency || 0,
  p95Latency: run?.p95Latency || 0,
  rps: run?.rps || 0,
});

const expectedTotalRequests = payload.config.stages.reduce(
  (total, stage) => total + stage.durationSec * stage.rate,
  0,
);

const verifyRampShape = (samples) => {
  const maxSample = samples.reduce(
    (best, sample) => (sample.rps > best.rps ? sample : best),
    samples[0],
  );
  const firstThirdMax = Math.max(...samples.slice(0, Math.ceil(samples.length / 3)).map((sample) => sample.rps));
  const finalThirdMax = Math.max(...samples.slice(Math.floor(samples.length * 2 / 3)).map((sample) => sample.rps));

  return {
    peakRps: maxSample.rps,
    peakAtSecond: maxSample.second,
    rampUpDetected: maxSample.rps > firstThirdMax,
    rampDownDetected: finalThirdMax < maxSample.rps,
  };
};

const waitForRunCompletion = async (runId, timeoutMs = 120000) => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const runs = await request(`/runs/${PROJECT_ID}`);
    const currentRun = runs.find((run) => run.runId === runId);

    if (currentRun && currentRun.status !== "running") {
      return currentRun;
    }

    await sleep(2000);
  }

  throw new Error(`Run ${runId} did not complete within ${timeoutMs}ms`);
};

const main = async () => {
  if (!PROJECT_ID || !TOKEN) {
    throw new Error("Set PROJECT_ID and TOKEN env vars before running this script.");
  }

  console.log("Starting staged test...");
  console.log(`Expected scheduled requests: ${expectedTotalRequests}`);

  const started = await request(`/test/${PROJECT_ID}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const runId = started.runId;
  console.log(`Run started: ${runId}`);

  const samples = [];
  const totalDurationSec = payload.config.stages.reduce(
    (total, stage) => total + stage.durationSec,
    0,
  );

  for (let second = 1; second <= totalDurationSec + 5; second += 1) {
    await sleep(1000);
    const metrics = await request(`/metrics/${PROJECT_ID}?runId=${runId}`);
    const sample = {
      second,
      totalRequests: metrics.totalRequests || 0,
      rps: metrics.currentRps ?? metrics.rps ?? 0,
      success: metrics.success || 0,
      failure: metrics.failure || 0,
    };
    samples.push(sample);
    console.log(
      `t=${String(second).padStart(2, "0")}s total=${sample.totalRequests} rps=${sample.rps} success=${sample.success} failure=${sample.failure}`,
    );
  }

  console.log("\nWaiting for saved run to complete...");
  const currentRun = await waitForRunCompletion(runId);
  const summary = summarize(currentRun);
  const ramp = verifyRampShape(samples);
  const stuck = samples.length > 2 && samples.at(-1).totalRequests === samples.at(-2).totalRequests && summary.status === "running";

  console.table([summary]);
  console.log("Ramp verification:", ramp);
  console.log("Not stuck:", !stuck);
  console.log("Expected total:", expectedTotalRequests);
  console.log("Actual total:", summary.totalRequests);

  console.log("\nRunning 20 parallel API checks against GET /runs/:projectId...");
  const parallelStartedAt = Date.now();
  const parallelResponses = await Promise.all(
    Array.from({ length: 20 }, () => request(`/runs/${PROJECT_ID}`)),
  );
  console.log(
    `Parallel checks completed: ${parallelResponses.length}/20 in ${Date.now() - parallelStartedAt}ms`,
  );
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
