const logger = require("../utils/logger");

const GRAFANA_WAKE_TIMEOUT_MS = Number(
  process.env.GRAFANA_WAKE_TIMEOUT_MS || 30000,
);

const cleanUrl = (url) => url?.replace(/\/+$/, "");

const getGrafanaBaseUrl = () => {
  if (process.env.GRAFANA_WAKE_URL) {
    return cleanUrl(process.env.GRAFANA_WAKE_URL);
  }

  if (process.env.GRAFANA_URL) {
    return cleanUrl(process.env.GRAFANA_URL);
  }

  if (process.env.GRAFANA_HEALTH_URL) {
    return cleanUrl(process.env.GRAFANA_HEALTH_URL.replace(/\/api\/health$/, ""));
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:5000";
  }

  return null;
};

const getGrafanaHealthUrl = () => {
  if (process.env.GRAFANA_HEALTH_URL) {
    return process.env.GRAFANA_HEALTH_URL;
  }

  const grafanaBaseUrl = getGrafanaBaseUrl();

  return grafanaBaseUrl ? `${grafanaBaseUrl}/api/health` : null;
};

const wakeGrafana = async () => {
  const grafanaUrl = getGrafanaBaseUrl();

  if (!grafanaUrl) {
    logger.warn({
      message: "Grafana wake skipped because no Grafana URL is configured",
    });

    return false;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    GRAFANA_WAKE_TIMEOUT_MS,
  );

  try {
    const response = await fetch(grafanaUrl, {
      method: "GET",
      signal: controller.signal,
    });

    return response.ok;
  } catch (err) {
    logger.warn({
      message: "Grafana wake request failed",
      grafanaUrl,
      error: err.message,
    });

    return false;
  } finally {
    clearTimeout(timeoutId);
  }
};

const wakeGrafanaInBackground = () => {
  wakeGrafana().catch((err) => {
    logger.warn({
      message: "Grafana background wake failed",
      error: err.message,
    });
  });
};

module.exports = {
  getGrafanaHealthUrl,
  wakeGrafana,
  wakeGrafanaInBackground,
};
