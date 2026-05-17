export const clearAuthStorage = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("projectId");
  localStorage.removeItem("currentRunId");
  localStorage.removeItem("currentRunActive");
};

export const getStoredToken = () => {
  const token = localStorage.getItem("token");

  if (!token || token === "undefined" || token === "null") {
    return null;
  }

  return token.trim() || null;
};

export const isJwtExpired = (token) => {
  const parts = token.split(".");

  if (parts.length !== 3) {
    return true;
  }

  try {
    const base64 = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(parts[1].length / 4) * 4, "=");
    const payload = JSON.parse(atob(base64));
    const expiresAt = Number(payload.exp || 0) * 1000;

    return !expiresAt || expiresAt <= Date.now();
  } catch {
    return true;
  }
};

export const getUsableStoredToken = () => {
  const token = getStoredToken();

  if (!token || isJwtExpired(token)) {
    clearAuthStorage();
    return null;
  }

  return token;
};
