const Chaos = require("./chaos.model");

const CHAOS_PRESETS = {
  custom: {},

  latency: {
    enabled: true,

    failureRate: 0,

    latency: {
      enabled: true,
      min: 200,
      max: 1000,
      percentage: 50,
    },
  },

  failure: {
    enabled: true,

    failureRate: 30,

    statusCode: {
      enabled: true,
      codes: [500],
    },
  },

  network: {
    enabled: true,

    packetLoss: {
      enabled: true,
      percentage: 20,
    },

    timeout: {
      enabled: true,
      duration: 5000,
      percentage: 20,
    },
  },

  stress: {
    enabled: true,

    failureRate: 10,

    latency: {
      enabled: true,
      min: 500,
      max: 2000,
      percentage: 50,
    },

    timeout: {
      enabled: true,
      duration: 8000,
      percentage: 10,
    },

    packetLoss: {
      enabled: true,
      percentage: 15,
    },
  },
};

const DEFAULT_CHAOS = {
  profile: "custom",
  enabled: false,

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

const getChaosSettings = async (owner, projectId) => {
  let chaos = await Chaos.findOne({
    owner,
    projectId,
  });

  if (!chaos) {
    chaos = await Chaos.create({
      owner,
      projectId,
      ...DEFAULT_CHAOS,
    });
  }

  return chaos;
};

const getChaosSnapshot = async (owner, projectId) => {
  const chaos = await getChaosSettings(owner, projectId);
  const source = chaos.toObject ? chaos.toObject() : chaos;

  return {
    profile: source.profile,
    enabled: source.enabled,
    failureRate: source.failureRate,
    latency: source.latency,
    statusCode: source.statusCode,
    timeout: source.timeout,
    packetLoss: source.packetLoss,
    connectionReset: source.connectionReset,
  };
};

const updateChaosSettings = async (owner, projectId, chaosConfig) => {
  const chaos = await Chaos.findOneAndUpdate(
    {
      owner,
      projectId,
    },
    {
      $set: chaosConfig,
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );

  return chaos;
};

const resetChaosSettings = async (owner, projectId) => {
  const chaos = await Chaos.findOneAndUpdate(
    {
      owner,
      projectId,
    },
    {
      $set: DEFAULT_CHAOS,
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );

  return chaos;
};

const applyChaosProfile = async (owner, projectId, profile) => {
  if (!CHAOS_PRESETS[profile]) {
    throw new Error("Invalid chaos profile.");
  }

  return updateChaosSettings(owner, projectId, {
    ...DEFAULT_CHAOS,
    ...CHAOS_PRESETS[profile],
    profile,
  });
};

module.exports = {
  DEFAULT_CHAOS,
  getChaosSettings,
  getChaosSnapshot,
  updateChaosSettings,
  resetChaosSettings,
  applyChaosProfile,
};
