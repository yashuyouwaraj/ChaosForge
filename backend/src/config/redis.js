const redis = require("redis");

// Handle different Redis URL formats (Upstash, Render, etc.)
const getRedisUrl = () => {
  // If REDIS_URL is provided, use it directly (but fix protocol if needed)
  if (process.env.REDIS_URL) {
    let url = process.env.REDIS_URL;
    // Convert https:// to rediss:// for Upstash
    if (url.startsWith("https://")) {
      url = url.replace("https://", "rediss://");
    }
    // Ensure it has redis:// or rediss:// protocol
    if (!url.startsWith("redis://") && !url.startsWith("rediss://")) {
      url = `redis://${url}`;
    }
    return url;
  }

  // Fallback to host/port
  const host = process.env.REDIS_HOST || "127.0.0.1";
  const port = parseInt(process.env.REDIS_PORT, 10) || 6379;

  // If host already includes protocol, use it as-is
  if (host.startsWith("redis://") || host.startsWith("rediss://")) {
    return host;
  }

  return `redis://${host}:${port}`;
};

const client = redis.createClient({
  url: getRedisUrl(),
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
