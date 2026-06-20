import { api } from "./api";

export const CHAOS_PROFILES = [
  "custom",
  "latency",
  "network",
  "failure",
  "stress",
];

export const DEFAULT_CHAOS_SETTINGS = {
  enabled: false,
  profile: "custom",
  failureRate: 0,
  latency: {
    enabled: false,
    min: 0,
    max: 0,
    percentage: 0,
  },
  statusCode: {
    enabled: false,
    codes: [500],
  },
  timeout: {
    enabled: false,
    duration: 5000,
    percentage: 0,
  },
  packetLoss: {
    enabled: false,
    percentage: 0,
  },
  connectionReset: {
    enabled: false,
    percentage: 0,
  },
};

const numberOr = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

export const normalizeChaosSettings = (settings = {}) => ({
  enabled: Boolean(settings.enabled),
  profile: CHAOS_PROFILES.includes(settings.profile)
    ? settings.profile
    : DEFAULT_CHAOS_SETTINGS.profile,
  failureRate: numberOr(settings.failureRate),
  latency: {
    ...DEFAULT_CHAOS_SETTINGS.latency,
    ...settings.latency,
    enabled: Boolean(settings.latency?.enabled),
    min: numberOr(settings.latency?.min),
    max: numberOr(settings.latency?.max),
    percentage: numberOr(settings.latency?.percentage),
  },
  statusCode: {
    ...DEFAULT_CHAOS_SETTINGS.statusCode,
    ...settings.statusCode,
    enabled: Boolean(settings.statusCode?.enabled),
    codes:
      Array.isArray(settings.statusCode?.codes) &&
      settings.statusCode.codes.length > 0
        ? settings.statusCode.codes.map(Number)
        : DEFAULT_CHAOS_SETTINGS.statusCode.codes,
  },
  timeout: {
    ...DEFAULT_CHAOS_SETTINGS.timeout,
    ...settings.timeout,
    enabled: Boolean(settings.timeout?.enabled),
    duration: numberOr(
      settings.timeout?.duration,
      DEFAULT_CHAOS_SETTINGS.timeout.duration,
    ),
    percentage: numberOr(settings.timeout?.percentage),
  },
  packetLoss: {
    ...DEFAULT_CHAOS_SETTINGS.packetLoss,
    ...settings.packetLoss,
    enabled: Boolean(settings.packetLoss?.enabled),
    percentage: numberOr(settings.packetLoss?.percentage),
  },
  connectionReset: {
    ...DEFAULT_CHAOS_SETTINGS.connectionReset,
    ...settings.connectionReset,
    enabled: Boolean(settings.connectionReset?.enabled),
    percentage: numberOr(settings.connectionReset?.percentage),
  },
});

export const countEnabledFaults = (settings = DEFAULT_CHAOS_SETTINGS) =>
  [
    settings.latency?.enabled,
    settings.statusCode?.enabled,
    settings.timeout?.enabled,
    settings.packetLoss?.enabled,
    settings.connectionReset?.enabled,
  ].filter(Boolean).length;

export const getChaosSettings = async (projectId) =>
  normalizeChaosSettings(await api(`/chaos/${projectId}`));

export const updateChaosSettings = async (projectId, data) =>
  normalizeChaosSettings(
    await api(`/chaos/${projectId}`, "PATCH", normalizeChaosSettings(data)),
  );

export const resetChaosSettings = async (projectId) =>
  normalizeChaosSettings(await api(`/chaos/${projectId}/reset`, "POST"));

export const applyChaosProfile = async (projectId, profile) =>
  normalizeChaosSettings(
    await api(`/chaos/${projectId}/profile`, "POST", {
      profile,
    }),
  );
