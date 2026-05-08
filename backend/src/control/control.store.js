const { client: redis, connectRedis } = require("../config/redis");

const key = (projectId, runId) => `control:${projectId}:${runId}`;

const initControl = async (projectId, runId) => {
  const redis = await connectRedis();

  await redis.hSet(key(projectId, runId), {
    status: "running", // running | paused | stopped
    rateOverride: "", // optional number
  });

  await redis.expire(key(projectId, runId), 3600);
};

const setStatus = async (projectId, runId, status) => {
  const redis = await connectRedis();
  await redis.hSet(key(projectId, runId), { status });
};

const setRate = async (projectId, runId, rate) => {
  const redis = await connectRedis();
  await redis.hSet(key(projectId, runId), { rateOverride: String(rate) });
};

const getControl = async (projectId, runId) => {
  const redis = await connectRedis();
  const data = await redis.hGetAll(key(projectId, runId));

  return {
    status: data.status || "running",
    rateOverride: data.rateOverride ? Number(data.rateOverride) : null,
  };
};

module.exports = { initControl, setStatus, setRate, getControl };
