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

export const getGrafanaDashboardUrl = (path = "") => {
  return `${getGrafanaUrl()}${path}`;
};
