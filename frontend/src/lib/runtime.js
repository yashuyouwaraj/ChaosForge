const isBrowser = typeof window !== "undefined";

const LOCAL_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
]);

const cleanUrl = (url) => url?.replace(/\/+$/, "");

const isLocalHostname = (hostname) => (
  LOCAL_HOSTNAMES.has(hostname) ||
  hostname.endsWith(".localhost")
);

const getBrowserFallbackUrl = () => {
  const { hostname, origin, protocol } = window.location;

  if (isLocalHostname(hostname)) {
    return `${protocol}//${hostname}:3001`;
  }

  return origin;
};

export const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;

  if (envUrl) {
    return cleanUrl(envUrl);
  }

  if (isBrowser) {
    return getBrowserFallbackUrl();
  }

  return "http://localhost:3001";
};

export const getSocketBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_SOCKET_URL;

  if (envUrl) {
    return cleanUrl(envUrl);
  }

  return getApiBaseUrl();
};

export const isProduction = process.env.NODE_ENV === "production";

const PRODUCTION_BACKEND_URL = "https://chaosforge.onrender.com";
const BACKEND_WAKE_TIMEOUT_MS = 12000;

const getBackendWakeUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;

  if (envUrl) {
    return cleanUrl(envUrl);
  }

  if (isBrowser && isLocalHostname(window.location.hostname)) {
    return `${window.location.protocol}//${window.location.hostname}:3001`;
  }

  return PRODUCTION_BACKEND_URL;
};

export const wakeBackend = () => {
  if (typeof window === "undefined") {
    return;
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), BACKEND_WAKE_TIMEOUT_MS);
  const backendWakeUrl = `${getBackendWakeUrl()}/health`;

  fetch(backendWakeUrl, {
    method: "GET",
    mode: "no-cors",
    cache: "no-store",
    signal: controller.signal,
  })
    .catch(() => {})
    .finally(() => window.clearTimeout(timeoutId));
};
