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
