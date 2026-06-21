const crypto = require("crypto");

const { client: redis, connectRedis } = require("../../../config/redis");
const logger = require("../../../utils/logger");

const RESPONSE_TTL = 3600;
const PROMPT_TTL = 1800;
const CONVERSATION_TTL = 7200;
const METRICS_TTL = 86400;

const memoryCache = new Map();
const MEMORY_MAX = 200;

const hashKey = (input) =>
  crypto.createHash("sha256").update(JSON.stringify(input)).digest("hex");

const getRedis = async () => {
  try {
    return await connectRedis();
  } catch {
    return null;
  }
};

const setMemoryCache = (key, value, ttlMs) => {
  if (memoryCache.size >= MEMORY_MAX) {
    const firstKey = memoryCache.keys().next().value;
    memoryCache.delete(firstKey);
  }

  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
};

const getMemoryCache = (key) => {
  const entry = memoryCache.get(key);

  if (!entry) {
    return null;
  }

  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }

  return entry.value;
};

const getResponseCache = async (cacheKey) => {
  const redisClient = await getRedis();

  if (redisClient) {
    try {
      const cached = await redisClient.get(`ai:response:${cacheKey}`);

      if (cached) {
        return { data: JSON.parse(cached), source: "redis" };
      }
    } catch (err) {
      logger.warn({ message: "AI response cache read failed", error: err.message });
    }
  }

  const memory = getMemoryCache(`response:${cacheKey}`);

  if (memory) {
    return { data: memory, source: "memory" };
  }

  return null;
};

const setResponseCache = async (cacheKey, data) => {
  const redisClient = await getRedis();

  if (redisClient) {
    try {
      await redisClient.setEx(
        `ai:response:${cacheKey}`,
        RESPONSE_TTL,
        JSON.stringify(data),
      );
    } catch (err) {
      logger.warn({ message: "AI response cache write failed", error: err.message });
    }
  }

  setMemoryCache(`response:${cacheKey}`, data, RESPONSE_TTL * 1000);
};

const getPromptCache = async (promptHash) => {
  const redisClient = await getRedis();

  if (redisClient) {
    try {
      const cached = await redisClient.get(`ai:prompt:${promptHash}`);

      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      return null;
    }
  }

  return getMemoryCache(`prompt:${promptHash}`);
};

const setPromptCache = async (promptHash, data) => {
  const redisClient = await getRedis();

  if (redisClient) {
    try {
      await redisClient.setEx(
        `ai:prompt:${promptHash}`,
        PROMPT_TTL,
        JSON.stringify(data),
      );
    } catch {
      // fall through to memory
    }
  }

  setMemoryCache(`prompt:${promptHash}`, data, PROMPT_TTL * 1000);
};

const getConversationCache = async (conversationId) => {
  const redisClient = await getRedis();

  if (redisClient) {
    try {
      const cached = await redisClient.get(`ai:conversation:${conversationId}`);

      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      return null;
    }
  }

  return getMemoryCache(`conversation:${conversationId}`);
};

const setConversationCache = async (conversationId, data) => {
  const redisClient = await getRedis();

  if (redisClient) {
    try {
      await redisClient.setEx(
        `ai:conversation:${conversationId}`,
        CONVERSATION_TTL,
        JSON.stringify(data),
      );
    } catch {
      // fall through
    }
  }

  setMemoryCache(`conversation:${conversationId}`, data, CONVERSATION_TTL * 1000);
};

const invalidateConversationCache = async (conversationId) => {
  const redisClient = await getRedis();

  if (redisClient) {
    try {
      await redisClient.del(`ai:conversation:${conversationId}`);
    } catch {
      // ignore
    }
  }

  memoryCache.delete(`conversation:${conversationId}`);
};

const buildResponseCacheKey = ({ owner, skill, projectId, runId, payload = {} }) =>
  hashKey({ owner, skill, projectId, runId, payload });

const buildPromptHash = (prompt) =>
  hashKey({
    system: prompt.system,
    developer: prompt.developer,
    context: prompt.context,
    user: prompt.user,
  });

const incrementCacheHit = async () => {
  const redisClient = await getRedis();

  if (redisClient) {
    try {
      await redisClient.incr("ai:metrics:cache_hits");
      await redisClient.expire("ai:metrics:cache_hits", METRICS_TTL);
    } catch {
      // ignore
    }
  }
};

const incrementCacheMiss = async () => {
  const redisClient = await getRedis();

  if (redisClient) {
    try {
      await redisClient.incr("ai:metrics:cache_misses");
      await redisClient.expire("ai:metrics:cache_misses", METRICS_TTL);
    } catch {
      // ignore
    }
  }
};

const getCacheStats = async () => {
  const redisClient = await getRedis();

  if (!redisClient) {
    return { hits: 0, misses: 0, hitRatio: 0, backend: "memory" };
  }

  try {
    const [hits, misses] = await Promise.all([
      redisClient.get("ai:metrics:cache_hits"),
      redisClient.get("ai:metrics:cache_misses"),
    ]);

    const hitCount = Number(hits) || 0;
    const missCount = Number(misses) || 0;
    const total = hitCount + missCount;

    return {
      hits: hitCount,
      misses: missCount,
      hitRatio: total > 0 ? Math.round((hitCount / total) * 100) : 0,
      backend: "redis",
    };
  } catch {
    return { hits: 0, misses: 0, hitRatio: 0, backend: "unavailable" };
  }
};

module.exports = {
  getResponseCache,
  setResponseCache,
  getPromptCache,
  setPromptCache,
  getConversationCache,
  setConversationCache,
  invalidateConversationCache,
  buildResponseCacheKey,
  buildPromptHash,
  incrementCacheHit,
  incrementCacheMiss,
  getCacheStats,
};
