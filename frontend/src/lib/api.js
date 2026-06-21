import { getApiBaseUrl } from "./runtime";

export const getBaseUrl = () => {
  return getApiBaseUrl();
};

export const api = async (url, method = "GET", body = null, options = {}) => {
  const BASE_URL = getApiBaseUrl();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const controller = options.signal ? null : new AbortController();
  const signal = options.signal || controller?.signal;
  let timeoutId;

  if (options.timeoutMs && controller) {
    timeoutId = setTimeout(() => controller.abort(), options.timeoutMs);
  }

  try {
    const res = await fetch(`${BASE_URL}${url}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: body ? JSON.stringify(body) : null,
      signal,
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
      const error = new Error(message);

      if (data?.details) {
        error.details = data.details;
      }
      if (data?.code) {
        error.code = data.code;
      }

      throw error;
    }

    return data;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(
        options.timeoutMs ? "Request timed out. Please try again." : "Request aborted.",
      );
    }

    if (error instanceof TypeError) {
      throw new Error("Cannot reach backend server.");
    }

    throw error;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
};

export const streamApi = async (url, body, callbacks = {}) => {
  const BASE_URL = getApiBaseUrl();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const controller = callbacks.signal || new AbortController();

  const res = await fetch(`${BASE_URL}${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({ ...body, stream: true }),
    signal: controller.signal,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || "Stream request failed");
  }

  const reader = res.body?.getReader();

  if (!reader) {
    throw new Error("Streaming not supported");
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let finalResult = null;

  const processEvent = (block) => {
    const lines = block.split("\n");
    let event = "message";
    let data = "";

    for (const line of lines) {
      if (line.startsWith("event:")) {
        event = line.slice(6).trim();
      } else if (line.startsWith("data:")) {
        data += line.slice(5).trim();
      }
    }

    if (!data) {
      return;
    }

    const parsed = JSON.parse(data);

    if (event === "token" && callbacks.onToken) {
      callbacks.onToken(parsed.token || "", parsed);
    } else if (event === "ttft" && callbacks.onFirstToken) {
      callbacks.onFirstToken(parsed.ttftMs);
    } else if (event === "start" && callbacks.onStart) {
      callbacks.onStart(parsed);
    } else if (event === "done") {
      finalResult = parsed;
      if (callbacks.onDone) {
        callbacks.onDone(parsed);
      }
    } else if (event === "error") {
      throw new Error(parsed.error || "Stream error");
    } else if (event === "aborted" && callbacks.onAborted) {
      callbacks.onAborted(parsed);
    }
  };

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split("\n\n");
    buffer = blocks.pop() || "";

    for (const block of blocks) {
      if (block.trim()) {
        processEvent(block);
      }
    }
  }

  if (buffer.trim()) {
    processEvent(buffer);
  }

  return { result: finalResult, abort: () => controller.abort(), signal: controller };
};
