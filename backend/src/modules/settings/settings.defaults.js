const DEFAULT_SETTINGS = {
  appearance: {
    theme: "dark",
    accentColor: "cyan",
  },

  simulationDefaults: {
    method: "GET",
    url: "",
    headers: {},
    authToken: "",
    contentType: "application/json",
    payload: {},
    rps: 100,
    duration: 30,
    concurrency: 20,
    totalRequests: 2000,
  },

  notifications: {
    email: true,
    simulationCompleted: true,
    weeklyReport: true,
  },

  ai: {
    provider: "nvidia",
    mode: "automatic",
    model: "ultra",
  },
};

module.exports = DEFAULT_SETTINGS;
