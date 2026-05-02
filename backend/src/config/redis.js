const Redis = require("ioredis");

const client = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
});

client.on("connect", () => {
  console.log("✅ Redis connecting...");
});

client.on("ready", () => {
  console.log("🔥 Redis ready");
});

client.on("error", (err) => {
  console.error("❌ Redis error:", err.message);
});

client.on("close", () => {
  console.log("⚠️ Redis connection closed");
});

// 🚀 Connect is automatic with ioredis
const connectRedis = async () => {
  // ioredis connects automatically, just verify connection
  try {
    await client.ping();
    console.log("✅ Redis ping successful");
  } catch (err) {
    console.error("❌ Redis connection failed:", err.message);
    throw err;
  }
};

module.exports = { client, connectRedis };
