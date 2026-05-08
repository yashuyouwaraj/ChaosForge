const redis = require("redis");

const client = redis.createClient({
  url:
    process.env.REDIS_URL ||
    `redis://${process.env.REDIS_HOST || "127.0.0.1"}:${process.env.REDIS_PORT || 6379}`,
});

let isVerified = false;
let verifyPromise = null;

client.on("connect", () => {
  console.log("Redis connecting...");
});

client.on("ready", () => {
  isVerified = true;
  console.log("Redis ready");
});

client.on("error", (err) => {
  isVerified = false;
  console.error("Redis error:", err.message);
});

client.on("end", () => {
  isVerified = false;
  console.log("Redis connection closed");
});

const connectRedis = async () => {
  if (isVerified && client.isOpen) {
    return client;
  }

  if (verifyPromise) {
    return verifyPromise;
  }

  verifyPromise = (async () => {
    if (!client.isOpen) {
      await client.connect();
    }

    await client.ping();
    isVerified = true;

    if (process.env.DEBUG === "true") {
      console.log("Redis ping successful");
    }

    return client;
  })();

  try {
    return await verifyPromise;
  } catch (err) {
    isVerified = false;
    console.error("Redis connection failed:", err.message);
    throw err;
  } finally {
    verifyPromise = null;
  }
};

module.exports = { client, connectRedis };
