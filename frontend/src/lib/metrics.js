export const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

export const rate = (part, total) => {
  const safeTotal = toNumber(total);
  return safeTotal > 0 ? (toNumber(part) / safeTotal) * 100 : null;
};

export const percentDelta = (current, previous) => {
  const c = toNumber(current);
  const p = toNumber(previous);

  if (p <= 0) {
    return c > 0 ? null : 0;
  }

  return ((c - p) / p) * 100;
};

export const pointDelta = (currentRate, previousRate) => {
  if (currentRate == null || previousRate == null) {
    return null;
  }

  return currentRate - previousRate;
};
