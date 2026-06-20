const { connectRedis } = require("../config/redis");

const TTL = 3600;

const recordChaos = async (projectId, runId, metrics = {}) => {
  if (!metrics.injected) {
    return;
  }

  const redis = await connectRedis();
  const key = `chaos:${projectId}:${runId}`;
  const multi = redis.multi();

  multi.hIncrBy(key, "totalInjected", 1);
  multi.hIncrBy(key, "injected", 1);

  if (metrics.latency) {
    multi.hIncrBy(key, "latency", 1);
  }

  if (metrics.failure) {
    multi.hIncrBy(key, "failure", 1);
  }

  if (metrics.timeout) {
    multi.hIncrBy(key, "timeout", 1);
  }

  if (metrics.packetLoss) {
    multi.hIncrBy(key, "packetLoss", 1);
  }

  if (metrics.connectionReset) {
    multi.hIncrBy(key, "connectionReset", 1);
  }

  multi.expire(key, TTL);

  await multi.exec();
};

const getChaosMetrics = async (projectId, runId) => {
  const redis = await connectRedis();
  const key = `chaos:${projectId}:${runId}`;

  const metrics = await redis.hGetAll(key);

  return {
    totalInjected: Number(metrics.totalInjected || 0),
    injected: Number(metrics.injected || metrics.totalInjected || 0),

    latency: Number(metrics.latency || 0),

    failure: Number(metrics.failure || 0),

    timeout: Number(metrics.timeout || 0),

    packetLoss: Number(metrics.packetLoss || 0),

    connectionReset: Number(metrics.connectionReset || 0),
  };
};

module.exports = {
  recordChaos,
  getChaosMetrics,
};
