const getPrometheusHealthUrl = () => {
  const base = process.env.PROMETHEUS_BASE_URL || "http://localhost:9090";

  if (!base) {
    return null;
  }

  return `${base.replace(/\/$/, "")}/-/healthy`;
};

module.exports = {
  getPrometheusHealthUrl,
};
