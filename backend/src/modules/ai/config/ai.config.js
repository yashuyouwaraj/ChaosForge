const AI_PROVIDER = process.env.AI_PROVIDER || "nvidia";

const AI_MODEL = process.env.AI_MODEL || "ultra";

const NVIDIA = {
  apiKey: process.env.NVIDIA_API_KEY,

  baseUrl: process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1",
};

module.exports = {
  AI_PROVIDER,
  AI_MODEL,
  NVIDIA,
};
