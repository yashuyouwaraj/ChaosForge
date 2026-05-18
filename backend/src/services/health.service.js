const os = require("os");
const { getConnectedClients } = require("../websocket/socket");
const { evaluateInfrastructureAlerts } = require("./alertEngine");
const { client: redis } = require("../config/redis");
const { kafka } = require("../config/kafka");
const { getConnectedKafkaWorkerCount } = require("./worker-heartbeat.service");
const { getActiveRunCount } = require("../metrics/metrics.store");
const Run = require("../modules/run/run.model");
const { completeFinishedActiveRuns } = require("../modules/run/run.service");
const { getGrafanaHealthUrl } = require("./grafana-readiness.service");
const { generateInfrastructureInsights } = require("./analysisEngine");
const { getPrometheusHealthUrl } = require("./prometheus-readiness.service");

const KAFKA_HEALTH_TIMEOUT_MS = Number(
  process.env.KAFKA_HEALTH_TIMEOUT_MS || 3000,
);

const SERVICE_HEALTH_TIMEOUT_MS = Number(
  process.env.SERVICE_HEALTH_TIMEOUT_MS || 2500,
);

const withTimeout = async (promise, message) => {
  let timeoutId;

  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timeoutId = setTimeout(
          () => reject(new Error(message)),
          KAFKA_HEALTH_TIMEOUT_MS,
        );
      }),
    ]);
  } finally {
    clearTimeout(timeoutId);
  }
};

const getKafkaHealth = async () => {
  if (process.env.USE_KAFKA !== "true") {
    return "disabled";
  }

  const admin = kafka.admin();

  try {
    await withTimeout(
      admin.connect(),
      "Kafka health check connection timed out",
    );

    await withTimeout(
      admin.listTopics(),
      "Kafka health check metadata request timed out",
    );

    return "connected";
  } catch {
    return "error";
  } finally {
    await admin.disconnect().catch(() => {});
  }
};

const getGrafanaHealth = async () => {
  const grafanaHealthUrl = getGrafanaHealthUrl();

  if (!grafanaHealthUrl) {
    return "disabled";
  }

  const controller = new AbortController();

  const timeoutId = setTimeout(
    () => controller.abort(),
    SERVICE_HEALTH_TIMEOUT_MS,
  );

  try {
    const response = await fetch(grafanaHealthUrl, {
      signal: controller.signal,
    });

    return response.ok ? "connected" : "error";
  } catch {
    return "error";
  } finally {
    clearTimeout(timeoutId);
  }
};

const getPrometheusHealth = async()=>{
  const url = getPrometheusHealthUrl()

  if(!url){
    return "disabled"
  }

  const controller = new AbortController()

  const timeoutId = setTimeout(
    ()=> controller.abort(),
    SERVICE_HEALTH_TIMEOUT_MS,
  )

  try {
    const response = await fetch(url, {
      signal: controller.signal
    })

    return response.ok ? "connected" : "error"
  } catch {
    return "error"
  } finally{
    clearTimeout(timeoutId)
  }
}

const getActiveRunTotal = async () => {
  try {
    await completeFinishedActiveRuns();

    return await Run.countDocuments({
      status: {
        $in: ["running", "paused"],
      },
    });
  } catch {
    return Math.max(0, getActiveRunCount());
  }
};

const getSystemHealth = async () => {
  let redisStatus = "disconnected";
  let kafkaWorkerCount = 0;

  const [kafkaStatus, grafanaStatus, prometheusStatus, activeRuns] = await Promise.all([
    getKafkaHealth(),
    getGrafanaHealth(),
    getPrometheusHealth(),
    getActiveRunTotal(),
  ]);

  try {
    await redis.ping();

    redisStatus = "connected";
    kafkaWorkerCount = await getConnectedKafkaWorkerCount();
  } catch (err) {
    redisStatus = "error";
  }

  const health = {
    status: "ok",
    uptime: process.uptime(),
    memory: {
      res: process.memoryUsage().rss,
      heapUsed: process.memoryUsage().heapUsed,
      heapTotal: process.memoryUsage().heapTotal,
    },
    cpuLoad: os.loadavg(),
    platform: os.platform(),
    nodeVersion: process.version,
    redis: redisStatus,
    kafka: kafkaStatus,
    kafkaWorkers: {
      connected: kafkaWorkerCount,
    },
    grafana: grafanaStatus,
    prometheus: prometheusStatus,
    websockets: {
      connectedClients: getConnectedClients(),
    },
    activeRuns,
    timeStamp: new Date().toISOString(),
  };

  health.alerts = evaluateInfrastructureAlerts(health);
  health.insights = generateInfrastructureInsights({
    health,
    alerts: health.alerts,
  });

  return health;
};

module.exports = {
  getSystemHealth,
};
