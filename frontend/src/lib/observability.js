const cleanUrl = (url) => url?.replace(/\/$/, "");

export const getGrafanaUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_GRAFANA_URL;
  if (envUrl) {
    return cleanUrl(envUrl);
  }

  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:5000`;
  }

  return "http://localhost:5000";
};

export const getGrafanaWakeUrl = () => {
  const envUrl =
    process.env.NEXT_PUBLIC_GRAFANA_WAKE_URL ||
    process.env.NEXT_PUBLIC_GRAFANA_URL;

  if (envUrl) {
    return cleanUrl(envUrl);
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:5000";
  }

  return "";
};

export const wakeGrafana = () => {
  if (typeof window === "undefined") {
    return;
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 8000);
  const grafanaWakeUrl = getGrafanaWakeUrl();

  if (!grafanaWakeUrl) {
    window.clearTimeout(timeoutId);
    return;
  }

  fetch(grafanaWakeUrl, {
    method: "GET",
    mode: "no-cors",
    cache: "no-store",
    signal: controller.signal,
  })
    .catch(() => {})
    .finally(() => window.clearTimeout(timeoutId));
};

export const getPrometheusUrl = () => {
    const envUrl = process.env.NEXT_PUBLIC_PROMETHEUS_URL;
    if (envUrl) {
      return cleanUrl(envUrl);
    }

    if(typeof window !== "undefined") {
      return `${window.location.protocol}//${window.location.hostname}:9090`;
    }

    return "http://localhost:9090";
};

export const getPrometheusGraphUrl = (path= "") => {
    return `${getPrometheusUrl()}${path}`;
}

export const getGrafanaDashboardUrl = (path = "") => {
  return `${getGrafanaUrl()}${path}`;
};

