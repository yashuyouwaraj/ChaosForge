const Redis = require("ioredis");

const client = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
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

client.on("close", () => {
  isVerified = false;
  console.log("Redis connection closed");
});

const connectRedis = async () => {
  if (isVerified && client.status === "ready") {
    return client;
  }

  if (verifyPromise) {
    return verifyPromise;
  }

  // ioredis connects automatically; ping only when the connection is not verified.
  verifyPromise = client.ping().then(() => {
    isVerified = true;

    if (process.env.DEBUG === "true") {
      console.log("Redis ping successful");
    }

    return client;
  });

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
