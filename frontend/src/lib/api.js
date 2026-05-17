import { getApiBaseUrl } from "./runtime";

export const getBaseUrl = () => {
  return getApiBaseUrl();
};

export const api = async (url, method = "GET", body = null) => {
  const BASE_URL = getApiBaseUrl();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  try {
    const res = await fetch(`${BASE_URL}${url}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: body ? JSON.stringify(body) : null,
    });

    const contentType = res.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await res.json()
      : await res.text();

    if (!res.ok) {
      const message =
        typeof data === "string"
          ? data
          : data?.message || data?.error || "Request failed";
      throw new Error(message);
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "Cannot reach backend server.",
      );
    }

    throw error;
  }
};
