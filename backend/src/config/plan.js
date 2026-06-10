module.exports = {
  free: {
    maxProjects: 3,
    maxRps: 100,
    maxDuration: 300,
  },

  pro: {
    maxProjects: 100,
    maxRps: 10000,
    maxDuration: 3600,
  },

  enterprise: {
    maxProjects: Infinity,
    maxRps: Infinity,
    maxDuration: Infinity,
  },
};
