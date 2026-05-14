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

