const Chaos = require("./chaos.model");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const loadChaosConfig = async (owner, projectId) => {
  return Chaos.findOne({
    owner,
    projectId,
  }).lean();
};

const shouldInject = (percentage) => {
  return Math.random() * 100 < Number(percentage ?? 0);
};

const createChaosMetrics = () => ({
  injected: false,
  latency: false,
  timeout: false,
  failure: false,
  packetLoss: false,
  connectionReset: false,
});

const updateInjectedFlag = (metrics) => {
  metrics.injected =
    metrics.latency ||
    metrics.timeout ||
    metrics.failure ||
    metrics.packetLoss ||
    metrics.connectionReset;
};

const createInjectedError = (type, message, context) => {
  const error = new Error(message);

  error.chaosMetric = type;
  error.chaos = {
    type,
    projectId: context.projectId,
    owner: context.owner,
    timestamp: Date.now(),
    injected: true,
  };

  return error;
};

const applyPacketLoss = (config, context) => {
  if (!config.packetLoss?.enabled || !shouldInject(config.packetLoss.percentage)) {
    return false;
  }

  const error = createInjectedError(
    "packetLoss",
    "Injected packet loss",
    context,
  );

  error.code = "PACKET_LOSS";

  throw error;
};

const applyConnectionReset = (config, context) => {
  if (
    !config.connectionReset?.enabled ||
    !shouldInject(config.connectionReset.percentage)
  ) {
    return false;
  }

  const error = createInjectedError(
    "connectionReset",
    "Injected connection reset",
    context,
  );

  error.code = "ECONNRESET";

  throw error;
};

const applyFailure = (config, context) => {
  if (!config.statusCode?.enabled || !shouldInject(config.failureRate)) {
    return false;
  }

  const codes = config.statusCode.codes;
  const status = codes[Math.floor(Math.random() * codes.length)];
  const error = createInjectedError(
    "failure",
    `Injected HTTP ${status}`,
    context,
  );

  error.response = {
    status,
  };

  throw error;
};

const applyLatency = async (config) => {
  if (!config.latency?.enabled || !shouldInject(config.latency.percentage)) {
    return false;
  }

  const min = Number(config.latency.min || 0);
  const max = Number(config.latency.max || min);
  const latency = Math.floor(Math.random() * (max - min + 1)) + min;

  await delay(latency);

  return true;
};

const applyTimeout = (config, request) => {
  if (!config.timeout?.enabled || !shouldInject(config.timeout.percentage)) {
    return false;
  }

  request.timeout = Number(config.timeout.duration || request.timeout);

  return true;
};

const executeChaos = async ({ owner, projectId, request }) => {
  const config = await loadChaosConfig(owner, projectId);
  const metrics = createChaosMetrics();
  const finalRequest = {
    ...request,
    headers: {
      ...(request.headers || {}),
    },
    params: {
      ...(request.params || {}),
    },
  };
  const context = {
    owner,
    projectId,
  };

  if (!config || !config.enabled) {
    return {
      request: finalRequest,
      metrics,
    };
  }

  try {
    metrics.packetLoss = applyPacketLoss(config, context);
    metrics.connectionReset = applyConnectionReset(config, context);
    metrics.failure = applyFailure(config, context);
    metrics.latency = await applyLatency(config);
    metrics.timeout = applyTimeout(config, finalRequest);
  } catch (err) {
    if (err.chaosMetric) {
      metrics[err.chaosMetric] = true;
    }

    updateInjectedFlag(metrics);
    err.chaosMetrics = metrics;
    throw err;
  }

  updateInjectedFlag(metrics);

  return {
    request: finalRequest,
    metrics,
  };
};

module.exports = {
  executeChaos,
};
