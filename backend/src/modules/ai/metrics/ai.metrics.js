const { client: redis, connectRedis } = require("../../../config/redis");
const { estimateCost } = require("../models/ai.model");

const METRICS_TTL = 86400;

const runtimeMetrics = {
  totalRequests: 0,
  totalFailures: 0,
  totalRetries: 0,
  totalStreamingSessions: 0,
  ttftSamples: [],
  responseTimeSamples: [],
  lastRequest: null,
};

const getRedis = async () => {
  try {
    return await connectRedis();
  } catch {
    return null;
  }
};

const recordMetric = async (field, value = 1) => {
  const redisClient = await getRedis();

  if (redisClient) {
    try {
      await redisClient.hIncrBy("ai:metrics:aggregate", field, value);
      await redisClient.expire("ai:metrics:aggregate", METRICS_TTL);
    } catch {
      // ignore redis failures
    }
  }
};

const recordRequest = async ({
  skill,
  model,
  provider = "nvidia",
  mode = "automatic",
  cached = false,
  streaming = false,
  ttftMs = null,
  responseTimeMs,
  usage = null,
  retries = 0,
  failed = false,
}) => {
  runtimeMetrics.totalRequests += 1;

  if (failed) {
    runtimeMetrics.totalFailures += 1;
  }

  runtimeMetrics.totalRetries += retries;

  if (streaming) {
    runtimeMetrics.totalStreamingSessions += 1;
  }

  if (ttftMs != null) {
    runtimeMetrics.ttftSamples.push(ttftMs);

    if (runtimeMetrics.ttftSamples.length > 100) {
      runtimeMetrics.ttftSamples.shift();
    }
  }

  if (responseTimeMs != null) {
    runtimeMetrics.responseTimeSamples.push(responseTimeMs);

    if (runtimeMetrics.responseTimeSamples.length > 100) {
      runtimeMetrics.responseTimeSamples.shift();
    }
  }

  runtimeMetrics.lastRequest = {
    skill,
    model,
    provider,
    mode,
    cached,
    streaming,
    ttftMs,
    responseTimeMs,
    retries,
    failed,
    at: new Date().toISOString(),
  };

  const estimatedCost = estimateCost(model, usage);

  const redisClient = await getRedis();

  if (redisClient) {
    try {
      const multi = redisClient.multi();
      multi.hIncrBy("ai:metrics:aggregate", "totalRequests", 1);

      if (failed) {
        multi.hIncrBy("ai:metrics:aggregate", "totalFailures", 1);
      }

      if (cached) {
        multi.hIncrBy("ai:metrics:aggregate", "cacheHits", 1);
      }

      if (streaming) {
        multi.hIncrBy("ai:metrics:aggregate", "streamingSessions", 1);
      }

      multi.hIncrBy("ai:metrics:aggregate", "totalRetries", retries);

      if (usage?.prompt_tokens) {
        multi.hIncrBy(
          "ai:metrics:aggregate",
          "inputTokens",
          usage.prompt_tokens,
        );
      }

      if (usage?.completion_tokens) {
        multi.hIncrBy(
          "ai:metrics:aggregate",
          "outputTokens",
          usage.completion_tokens,
        );
      }

      if (estimatedCost > 0) {
        multi.hIncrByFloat(
          "ai:metrics:aggregate",
          "estimatedCost",
          estimatedCost,
        );
      }

      if (ttftMs != null) {
        multi.hIncrBy("ai:metrics:aggregate", "ttftSum", Math.round(ttftMs));
        multi.hIncrBy("ai:metrics:aggregate", "ttftCount", 1);
      }

      if (responseTimeMs != null) {
        multi.hIncrBy(
          "ai:metrics:aggregate",
          "responseTimeSum",
          Math.round(responseTimeMs),
        );
        multi.hIncrBy("ai:metrics:aggregate", "responseTimeCount", 1);
      }

      multi.hSet("ai:metrics:last", {
        skill,
        model,
        provider,
        mode,
        cached: String(cached),
        streaming: String(streaming),
        ttftMs: String(ttftMs ?? ""),
        responseTimeMs: String(responseTimeMs ?? ""),
        at: new Date().toISOString(),
      });

      await multi.exec();
    } catch {
      // ignore
    }
  }

  await recordMetric(`model:${model}`, 1);
  await recordMetric(`skill:${skill}`, 1);
};

const average = (samples) => {
  if (!samples.length) {
    return 0;
  }

  return Math.round(
    samples.reduce((sum, value) => sum + value, 0) / samples.length,
  );
};

const getMetrics = async () => {
  const redisClient = await getRedis();
  let aggregate = {};

  if (redisClient) {
    try {
      aggregate = await redisClient.hGetAll("ai:metrics:aggregate");
    } catch {
      aggregate = {};
    }
  }

  const ttftCount = Number(aggregate.ttftCount) || 0;
  const responseTimeCount = Number(aggregate.responseTimeCount) || 0;
  const cacheHits = Number(aggregate.cacheHits) || 0;
  const totalRequests = Number(aggregate.totalRequests) || runtimeMetrics.totalRequests;

  return {
    totalRequests,
    totalFailures: Number(aggregate.totalFailures) || runtimeMetrics.totalFailures,
    totalRetries: Number(aggregate.totalRetries) || runtimeMetrics.totalRetries,
    streamingSessions:
      Number(aggregate.streamingSessions) || runtimeMetrics.totalStreamingSessions,
    avgTimeToFirstTokenMs:
      ttftCount > 0
        ? Math.round(Number(aggregate.ttftSum) / ttftCount)
        : average(runtimeMetrics.ttftSamples),
    avgResponseTimeMs:
      responseTimeCount > 0
        ? Math.round(Number(aggregate.responseTimeSum) / responseTimeCount)
        : average(runtimeMetrics.responseTimeSamples),
    cacheHitRatio:
      totalRequests > 0 ? Math.round((cacheHits / totalRequests) * 100) : 0,
    inputTokens: Number(aggregate.inputTokens) || 0,
    outputTokens: Number(aggregate.outputTokens) || 0,
    estimatedCost: Number(aggregate.estimatedCost) || 0,
    lastRequest: runtimeMetrics.lastRequest,
    provider: "nvidia",
    providerStatus: "operational",
  };
};

module.exports = {
  recordRequest,
  recordMetric,
  getMetrics,
};
