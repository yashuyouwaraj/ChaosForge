const safeObject = (value) =>
  value && typeof value === "object" && !Array.isArray(value) ? value : {};

const payloadSize = (body) => {
  if (body == null) {
    return 0;
  }

  if (typeof body === "string") {
    return Buffer.byteLength(body);
  }

  return Buffer.byteLength(JSON.stringify(body));
};

const buildRunConfigurationSnapshot = ({
  config = {},
  chaosConfig = null,
  url = "",
} = {}) => {
  const headers = safeObject(config.headers);
  const stages = Array.isArray(config.stages) ? config.stages : [];

  return {
    environment: process.env.NODE_ENV || "development",
    method: String(config.method || "GET").toUpperCase(),
    targetUrl: url || config.url || "",
    headers,
    payloadSize: payloadSize(config.body),
    concurrency: Number(config.concurrency || config.rate || 0),
    duration: Number(config.duration || config.durationSec || 0),
    workers: Number(config.workers || process.env.WORKER_COUNT || 1),
    kafkaEnabled: process.env.USE_KAFKA === "true",
    redisEnabled: true,
    retryCount: Number(config.retryCount || 3),
    timeout: Number(config.timeout || 5000),
    trafficPattern: config.pattern || "requests",
    stages,
    chaosEnabled: Boolean(chaosConfig?.enabled),
    chaosProfile: chaosConfig?.profile || "custom",
    failureRate: Number(chaosConfig?.failureRate || 0),
    latencyRange: chaosConfig?.latency?.enabled
      ? `${chaosConfig.latency.min || 0}-${chaosConfig.latency.max || 0}ms`
      : "Disabled",
    packetLoss: chaosConfig?.packetLoss?.enabled
      ? `${chaosConfig.packetLoss.percentage || 0}%`
      : "Disabled",
    timeoutInjection: chaosConfig?.timeout?.enabled
      ? `${chaosConfig.timeout.duration || 0}ms at ${chaosConfig.timeout.percentage || 0}%`
      : "Disabled",
    connectionReset: chaosConfig?.connectionReset?.enabled
      ? `${chaosConfig.connectionReset.percentage || 0}%`
      : "Disabled",
  };
};

module.exports = {
  buildRunConfigurationSnapshot,
};
