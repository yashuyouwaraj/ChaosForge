"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Copy,
  Loader2,
  Pin,
  Plus,
  RotateCcw,
  Search,
  Send,
  Sparkles,
  Square,
  Trash2,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { PageHeader } from "@/components/shared/PageHeader";
import { useProject } from "@/components/providers/ProjectProvider";
import { useRun } from "@/components/providers/RunProvider";
import { useAiChat } from "@/hooks/useAiCopilot";
import { AiResponseCards } from "@/components/copilot/AiResponseCards";
import { AiResponseMetadata } from "@/components/copilot/AiResponseMetadata";
import { MarkdownMessage } from "@/components/copilot/MarkdownMessage";

const SUGGESTED_QUESTIONS = [
  "What is the current infrastructure health?",
  "What are the top risks for this run?",
  "Explain the root cause of recent failures.",
  "What remediation steps do you recommend?",
  "Compare latency trends across recent runs.",
  "Should we scale before the next deployment?",
];

function formatRelativeTime(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getConversationPreview(item) {
  const lastMessage = item.messages?.at(-1);
  if (!lastMessage?.content) {
    return "No messages yet";
  }

  return lastMessage.content.slice(0, 80);
}

export default function AskPage() {
  const { projectId } = useProject() || {};
  const { selectedRun } = useRun() || {};
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const searchTimerRef = useRef(null);
  const restoredProjectRef = useRef(null);
  const {
    conversation,
    conversations,
    messages,
    loading,
    streaming,
    error,
    selectConversation,
    loadConversations,
    pinConversation,
    deleteConversationById,
    sendMessage,
    stopGeneration,
    clearConversation,
    setChatContext,
  } = useAiChat();

  useEffect(() => {
    setChatContext({ projectId, runId: selectedRun?.runId });
  }, [projectId, selectedRun?.runId, setChatContext]);

  useEffect(() => {
    if (!projectId) {
      return;
    }

    loadConversations({ projectId }).catch(() => {});
  }, [projectId, loadConversations]);

  useEffect(() => {
    if (!projectId || restoredProjectRef.current === projectId) {
      return;
    }

    loadConversations({ projectId })
      .then((items) => {
        const latest = items.find((item) => (item.messages?.length ?? 0) > 0);
        if (latest) {
          selectConversation(latest._id).catch(() => {});
        }
        restoredProjectRef.current = projectId;
      })
      .catch(() => {
        restoredProjectRef.current = projectId;
      });
  }, [projectId, loadConversations, selectConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  const handleSearch = useCallback(
    (value) => {
      setSearch(value);

      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }

      searchTimerRef.current = setTimeout(() => {
        loadConversations({ projectId, search: value }).catch(() => {});
      }, 300);
    },
    [projectId, loadConversations],
  );

  useEffect(
    () => () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    },
    [],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!input.trim() || loading || streaming || !projectId) {
      return;
    }

    const message = input.trim();
    setInput("");
    await sendMessage(message, { stream: true }).catch(() => {});
  };

  const handleSuggested = async (question) => {
    if (loading || streaming || !projectId) {
      return;
    }

    setInput("");
    await sendMessage(question, { stream: true }).catch(() => {});
  };

  const handleRegenerate = async () => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");

    if (!lastUser?.content) {
      return;
    }

    await sendMessage(lastUser.content, { stream: true, regenerate: true }).catch(() => {});
  };

  const handleCopy = async (text) => {
    if (text) {
      await navigator.clipboard.writeText(text);
    }
  };

  const handleNewConversation = () => {
    clearConversation();
    setInput("");
    inputRef.current?.focus();
  };

  const visibleConversations = conversations.filter(
    (item) => (item.messages?.length ?? 0) > 0,
  );

  const showWelcome = !conversation || messages.length === 0;

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-8">
          <PageHeader
            eyebrow="AI Copilot"
            title="Ask ChaosForge"
            description="Conversational infrastructure intelligence powered by the Intelligence Engine and NVIDIA Build models."
          />

          <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
            <aside className="glass rounded-[28px] p-5">
              <button
                type="button"
                onClick={handleNewConversation}
                disabled={!projectId}
                className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/20 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                New Conversation
              </button>

              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-slate-500" />
                <input
                  value={search}
                  onChange={(event) => handleSearch(event.target.value)}
                  placeholder="Search conversations"
                  className="w-full bg-transparent text-sm text-slate-200 outline-none"
                />
              </div>

              <div className="mt-4 max-h-[520px] space-y-2 overflow-y-auto">
                {visibleConversations.length === 0 ? (
                  <p className="px-2 py-3 text-xs text-slate-500">
                    No conversations yet. Start one below.
                  </p>
                ) : (
                  visibleConversations.map((item) => (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => selectConversation(item._id)}
                      className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                        conversation?._id === item._id
                          ? "border-cyan-500/30 bg-cyan-500/10"
                          : "border-white/10 bg-black/20 hover:bg-black/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-slate-200">
                          {item.title}
                        </p>
                        {item.pinned && (
                          <Pin className="h-3 w-3 shrink-0 text-cyan-300" />
                        )}
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                        {getConversationPreview(item)}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                        <span>{item.messages?.length || 0} messages</span>
                        <span>{formatRelativeTime(item.updatedAt || item.createdAt)}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </aside>

            <div className="glass rounded-[32px] p-8">
              {showWelcome ? (
                <div className="space-y-8">
                  <div className="text-center">
                    <Sparkles className="mx-auto h-10 w-10 text-cyan-300" />
                    <h2 className="mt-4 text-3xl font-black text-white">
                      How can ChaosForge AI help you today?
                    </h2>
                    <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
                      Ask about health, risk, root cause, recommendations, or trends.
                      Conversations are created when you send your first message.
                    </p>
                  </div>

                  {!projectId && (
                    <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5 text-yellow-200">
                      Select a project to start a conversation.
                    </div>
                  )}

                  <div className="flex flex-wrap justify-center gap-2">
                    {SUGGESTED_QUESTIONS.map((question) => (
                      <button
                        key={question}
                        type="button"
                        onClick={() => handleSuggested(question)}
                        disabled={loading || streaming || !projectId}
                        className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-black/30 disabled:opacity-50"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-6 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-6 w-6 text-cyan-300" />
                      <div>
                        <h2 className="text-2xl font-black">
                          {conversation?.title || "Infrastructure Copilot"}
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Ask follow-up questions with conversation memory and streaming.
                        </p>
                      </div>
                    </div>

                    {conversation && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            pinConversation(conversation._id, !conversation.pinned)
                          }
                          className="rounded-xl border border-white/10 bg-black/20 p-2 text-slate-300"
                        >
                          <Pin className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteConversationById(conversation._id)}
                          className="rounded-xl border border-red-500/20 bg-red-500/10 p-2 text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="max-h-[420px] space-y-4 overflow-y-auto rounded-[28px] border border-white/10 bg-black/20 p-6">
                    {messages.map((message, index) => (
                      <div
                        key={message.id || `${message.role}-${index}`}
                        className={`rounded-2xl border p-5 ${
                          message.role === "user"
                            ? "border-cyan-500/20 bg-cyan-500/5"
                            : "border-white/10 bg-black/20"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                            {message.role}
                          </p>
                          {message.role === "assistant" && (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleCopy(message.content)}
                                className="text-slate-400 hover:text-slate-200"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                              {index === messages.length - 1 && !streaming && (
                                <button
                                  type="button"
                                  onClick={handleRegenerate}
                                  className="text-slate-400 hover:text-slate-200"
                                >
                                  <RotateCcw className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="mt-3">
                          {message.role === "assistant" ? (
                            <>
                              <MarkdownMessage content={message.content} />
                              {message.streaming && (
                                <span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-cyan-400" />
                              )}
                            </>
                          ) : (
                            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-200">
                              {message.content}
                            </p>
                          )}
                        </div>

                        {message.metadata && (
                          <div className="mt-4 space-y-4">
                            <AiResponseMetadata
                              metadata={message.metadata.metadata || message.metadata}
                              streaming={message.streaming}
                            />
                            {!message.streaming && (
                              <AiResponseCards response={message.metadata} />
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    {loading && !streaming && (
                      <div className="flex items-center gap-3 text-slate-300">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Thinking...
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </>
              )}

              {error && (
                <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-red-200">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 flex gap-3">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask about infrastructure health, risk, or remediation..."
                  className="flex-1 rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-sm text-slate-100 outline-none"
                />
                {streaming ? (
                  <button
                    type="button"
                    onClick={stopGeneration}
                    className="inline-flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm font-semibold text-red-300"
                  >
                    <Square className="h-4 w-4" />
                    Stop
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || !projectId}
                    className="inline-flex items-center gap-2 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-5 py-4 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/20 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    Send
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
