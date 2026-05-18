const logger = require("../utils/logger");

const PROMETHEUS_WAKE_TIMEOUT_MS = Number(
  process.env.PROMETHEUS_WAKE_TIMEOUT_MS || 30000,
);

const cleanUrl = (url) => url?.replace(/\/+$/, "");

const getPrometheusBaseUrl = () => {
  if (process.env.PROMETHEUS_WAKE_URL) {
    return cleanUrl(process.env.PROMETHEUS_WAKE_URL);
  }

  if (process.env.PROMETHEUS_URL) {
    return cleanUrl(process.env.PROMETHEUS_URL);
  }

  if (process.env.PROMETHEUS_BASE_URL) {
    return cleanUrl(process.env.PROMETHEUS_BASE_URL);
  }

  if (process.env.PROMETHEUS_HEALTH_URL) {
    return cleanUrl(process.env.PROMETHEUS_HEALTH_URL.replace(/\/-\/healthy$/, ""));
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:9090";
  }

  return null;
};

const getPrometheusHealthUrl = () => {
  if (process.env.PROMETHEUS_HEALTH_URL) {
    return process.env.PROMETHEUS_HEALTH_URL;
  }

  const prometheusBaseUrl = getPrometheusBaseUrl();

  return prometheusBaseUrl ? `${prometheusBaseUrl}/-/healthy` : null;
};

const wakePrometheus = async () => {
  const prometheusUrl = getPrometheusBaseUrl();

  if (!prometheusUrl) {
    logger.warn({
      message: "Prometheus wake skipped because no Prometheus URL is configured",
    });

    return false;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    PROMETHEUS_WAKE_TIMEOUT_MS,
  );

  try {
    const response = await fetch(prometheusUrl, {
      method: "GET",
      signal: controller.signal,
    });

    return response.ok;
  } catch (err) {
    logger.warn({
      message: "Prometheus wake request failed",
      prometheusUrl,
      error: err.message,
    });

    return false;
  } finally {
    clearTimeout(timeoutId);
  }
};

const wakePrometheusInBackground = () => {
  wakePrometheus().catch((err) => {
    logger.warn({
      message: "Prometheus background wake failed",
      error: err.message,
    });
  });
};

module.exports = {
  getPrometheusHealthUrl,
  wakePrometheus,
  wakePrometheusInBackground,
};
