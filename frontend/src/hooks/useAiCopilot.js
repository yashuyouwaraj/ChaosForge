"use client";

import { useCallback, useRef, useState } from "react";

import { api, streamApi } from "@/lib/api";

const responseCache = new Map();

const cacheKey = (skill, payload) =>
  `${skill}:${JSON.stringify(payload || {})}`;

const SKILL_ROUTES = {
  explainRun: "/api/ai/explain/run",
  explainDashboard: "/api/ai/explain/dashboard",
  explainReport: "/api/ai/explain/report",
  compareRuns: "/api/ai/compare",
  incidentInvestigator: "/api/ai/incident/investigate",
  executiveBrief: "/api/ai/executive-brief",
  optimizationAdvisor: "/api/ai/optimize",
  chaosExperimentAdvisor: "/api/ai/chaos/advise",
  capacityPlanner: "/api/ai/capacity",
  runbook: "/api/ai/runbook",
  postmortem: "/api/ai/postmortem",
  aiReportGenerator: "/api/ai/report/generate",
  weeklyInfrastructureReview: "/api/ai/weekly-review",
};

export function useAiCopilot() {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [error, setError] = useState("");
  const inflightRef = useRef(null);
  const abortRef = useRef(null);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    inflightRef.current = null;
    setStreaming(false);
    setLoading(false);
  }, []);

  const invoke = useCallback(async (skill, payload = {}, options = {}) => {
    const key = cacheKey(skill, payload);
    const route = SKILL_ROUTES[skill];

    if (!route) {
      throw new Error(`Unknown AI skill: ${skill}`);
    }

    if (!options.force && !options.stream && responseCache.has(key)) {
      const cached = responseCache.get(key);
      setResponse(cached);
      setError("");
      return cached;
    }

    if (inflightRef.current) {
      return inflightRef.current;
    }

    setLoading(true);
    setError("");
    setStreamText("");

    if (options.stream) {
      setStreaming(true);
      const controller = new AbortController();
      abortRef.current = controller;

      const request = streamApi(
        route,
        { ...payload, force: options.force },
        {
          signal: controller,
          onStart: () => setStreamText(""),
          onToken: (token) => {
            setStreamText((previous) => previous + token);
          },
          onDone: (result) => {
            responseCache.set(key, result);
            setResponse(result);
            setStreaming(false);
            setLoading(false);
          },
          onAborted: () => {
            setStreaming(false);
            setLoading(false);
          },
        },
      );

      inflightRef.current = request;

      try {
        const { result } = await request;
        return result;
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "AI stream failed");
        }
        throw err;
      } finally {
        inflightRef.current = null;
        abortRef.current = null;
        setStreaming(false);
        setLoading(false);
      }
    }

    const controller = new AbortController();
    abortRef.current = controller;

    const request = api(
      route,
      "POST",
      {
        ...payload,
        force: options.force,
      },
      {
        signal: controller.signal,
        timeoutMs: options.timeoutMs ?? 120_000,
      },
    );
    inflightRef.current = request;

    try {
      const result = await request;
      responseCache.set(key, result);
      setResponse(result);
      return result;
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message || "AI request failed");
      }
      throw err;
    } finally {
      inflightRef.current = null;
      abortRef.current = null;
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResponse(null);
    setStreamText("");
    setError("");
  }, []);

  return {
    response,
    loading,
    streaming,
    streamText,
    error,
    invoke,
    stop,
    reset,
  };
}

export function useAiChat() {
  const [conversation, setConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [error, setError] = useState("");
  const abortRef = useRef(null);
  const chatContextRef = useRef({ projectId: null, runId: null });
  const creatingRef = useRef(null);

  const setChatContext = useCallback(({ projectId, runId } = {}) => {
    chatContextRef.current = { projectId, runId };
  }, []);

  const loadConversations = useCallback(async ({ projectId, search } = {}) => {
    const params = new URLSearchParams();

    if (projectId) {
      params.set("projectId", projectId);
    }

    if (search) {
      params.set("search", search);
    }

    const query = params.toString();
    const result = await api(`/api/ai/chat${query ? `?${query}` : ""}`);
    const items = Array.isArray(result) ? result : [];
    setConversations(items);
    return items;
  }, []);

  const startConversation = useCallback(async ({ projectId, runId, title }) => {
    if (creatingRef.current) {
      return creatingRef.current;
    }

    setLoading(true);
    setError("");

    const request = api("/api/ai/chat", "POST", {
      projectId,
      runId,
      title,
    });

    creatingRef.current = request;

    try {
      const created = await request;
      setConversation(created);
      setMessages(created.messages || []);
      await loadConversations({ projectId });
      return created;
    } catch (err) {
      setError(err.message || "Failed to start conversation");
      throw err;
    } finally {
      creatingRef.current = null;
      setLoading(false);
    }
  }, [loadConversations]);

  const clearConversation = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setConversation(null);
    setMessages([]);
    setStreaming(false);
    setLoading(false);
    setError("");
    setStreamText("");
  }, []);

  const selectConversation = useCallback(async (conversationId) => {
    setLoading(true);
    setError("");

    try {
      const loaded = await api(`/api/ai/chat/${conversationId}`);
      setConversation(loaded);
      setMessages(loaded.messages || []);
      return loaded;
    } catch (err) {
      setError(err.message || "Failed to load conversation");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const pinConversation = useCallback(
    async (conversationId, pinned) => {
      const updated = await api(`/api/ai/chat/${conversationId}`, "PATCH", {
        pinned,
      });
      setConversation((current) =>
        current?._id === conversationId ? updated : current,
      );
      await loadConversations({ projectId: updated.projectId });
      return updated;
    },
    [loadConversations],
  );

  const deleteConversationById = useCallback(
    async (conversationId) => {
      await api(`/api/ai/chat/${conversationId}`, "DELETE");
      setConversations((previous) =>
        previous.filter((item) => item._id !== conversationId),
      );

      if (conversation?._id === conversationId) {
        setConversation(null);
        setMessages([]);
      }
    },
    [conversation],
  );

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreaming(false);
    setLoading(false);
  }, []);

  const sendMessage = useCallback(
    async (message, { stream = true, regenerate = false } = {}) => {
      let activeConversation = conversation;

      if (!activeConversation?._id) {
        const { projectId, runId } = chatContextRef.current;

        if (!projectId) {
          throw new Error("Select a project to start a conversation");
        }

        activeConversation = await startConversation({
          projectId,
          runId,
          title: "ChaosForge Conversation",
        });
      }

      if (loading || streaming) {
        return null;
      }

      setLoading(true);
      setStreaming(Boolean(stream));
      setError("");
      setStreamText("");

      if (!regenerate) {
        setMessages((previous) => [
          ...previous,
          {
            role: "user",
            content: message,
            createdAt: new Date().toISOString(),
          },
        ]);
      }

      const assistantId = `assistant-${Date.now()}`;

      if (stream) {
        const controller = new AbortController();
        abortRef.current = controller;

        setMessages((previous) => [
          ...previous,
          {
            id: assistantId,
            role: "assistant",
            content: "",
            streaming: true,
            createdAt: new Date().toISOString(),
          },
        ]);

        try {
          const { result } = await streamApi(
            `/api/ai/chat/${activeConversation._id}/messages`,
            { message },
            {
              signal: controller,
              onToken: (token) => {
                setStreamText((previous) => previous + token);
                setMessages((previous) =>
                  previous.map((item) =>
                    item.id === assistantId
                      ? { ...item, content: (item.content || "") + token }
                      : item,
                  ),
                );
              },
              onDone: (payload) => {
                const aiResponse = payload.response || payload;
                setMessages((previous) =>
                  previous.map((item) =>
                    item.id === assistantId
                      ? {
                          ...item,
                          content: aiResponse.summary || item.content,
                          metadata: aiResponse,
                          streaming: false,
                        }
                      : item,
                  ),
                );
              },
            },
          );

          return result?.response || result;
        } catch (err) {
          if (err.name !== "AbortError") {
            setError(err.message || "Failed to send message");
            setMessages((previous) =>
              previous.map((item) =>
                item.id === assistantId ? { ...item, streaming: false } : item,
              ),
            );
          }
          throw err;
        } finally {
          abortRef.current = null;
          setStreaming(false);
          setLoading(false);
          await loadConversations({ projectId: activeConversation.projectId });
        }
      }

      try {
        const result = await api(
          `/api/ai/chat/${activeConversation._id}/messages`,
          "POST",
          { message },
        );

        setMessages((previous) => [
          ...previous,
          {
            role: "assistant",
            content: result.response?.summary || "Analysis complete.",
            metadata: result.response,
            createdAt: new Date().toISOString(),
          },
        ]);

        return result.response;
      } catch (err) {
        setError(err.message || "Failed to send message");
        throw err;
      } finally {
        setLoading(false);
        await loadConversations({ projectId: activeConversation.projectId });
      }
    },
    [conversation, loading, streaming, startConversation, loadConversations],
  );

  return {
    conversation,
    conversations,
    messages,
    loading,
    streaming,
    streamText,
    error,
    startConversation,
    selectConversation,
    loadConversations,
    pinConversation,
    deleteConversationById,
    sendMessage,
    stopGeneration,
    clearConversation,
    setChatContext,
  };
}

export function useAiModels() {
  const [models, setModels] = useState([]);
  const [modes, setModes] = useState([]);
  const [configured, setConfigured] = useState(false);

  const loadModels = useCallback(async () => {
    const result = await api("/api/ai/models");
    setModels(result.models || []);
    setModes(result.modes || []);
    setConfigured(Boolean(result.configured));
    return result;
  }, []);

  return {
    models,
    modes,
    configured,
    loadModels,
  };
}

export function useAiStatus() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadStatus = useCallback(async () => {
    setLoading(true);

    try {
      const result = await api("/api/ai/status");
      setStatus(result);
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  return { status, loading, loadStatus };
}
