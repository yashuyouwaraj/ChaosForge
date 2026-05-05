const { client: redis, connectRedis } = require("../config/redis");

const key = (projectId, runId) => `control:${projectId}:${runId}`;

const initControl = async (projectId, runId) => {
  await connectRedis();

  await redis.hset(key(projectId, runId), {
    status: "running", // running | paused | stopped
    rateOverride: "", // optional number
  });

  await redis.expire(key(projectId, runId), 3600);
};

const setStatus = async (projectId, runId, status) => {
  await connectRedis();
  await redis.hset(key(projectId, runId), { status });
};

const setRate = async (projectId, runId, rate) => {
  await connectRedis();
  await redis.hset(key(projectId, runId), { rateOverride: String(rate) });
};

const getControl = async (projectId, runId) => {
  await connectRedis();
  const data = await redis.hgetall(key(projectId, runId));

  return {
    status: data.status || "running",
    rateOverride: data.rateOverride ? Number(data.rateOverride) : null,
  };
};

module.exports = { initControl, setStatus, setRate, getControl };
