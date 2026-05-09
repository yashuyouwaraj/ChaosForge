const client = require("prom-client");

/**
 * 💀 DEFAULT NODE METRICS
 */
client.collectDefaultMetrics();

/**
 * 💀 CUSTOM METRICS
 */

const httpRequestsTotal = new client.Counter({
  name: "chaosforge_http_requests_total",
  help: "Total HTTP requests",
});

const simulationRequestsTotal = new client.Counter({
  name: "chaosforge_simulation_requests_total",
  help: "Total simulation requests processed",
});

const simulationFailuresTotal = new client.Counter({
  name: "chaosforge_simulation_failures_total",
  help: "Total simulation request failures",
});

const activeWebSocketClients = new client.Gauge({
  name: "chaosforge_websocket_clients",
  help: "Connected websocket clients",
});

const requestLatency = new client.Histogram({
  name: "chaosforge_request_latency_ms",
  help: "Simulation request latency",

  buckets: [50, 100, 200, 500, 1000, 2000, 5000],
});

module.exports = {
  client,

  httpRequestsTotal,

  simulationRequestsTotal,

  simulationFailuresTotal,

  activeWebSocketClients,

  requestLatency,
};
