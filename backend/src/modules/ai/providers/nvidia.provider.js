const OpenAI = require("openai");

const BaseProvider = require("./base.provider");
const AIResponse = require("../models/ai-response.model");

const { NVIDIA } = require("../config/ai.config");
const { NVIDIA_MODELS, getModelByKey, estimateCost } = require("../models/ai.model");

const parseJsonResponse = (raw) => {
  try {
    return JSON.parse(raw);
  } catch {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        // fall through
      }
    }

    return {
      executiveSummary: raw,
      cards: [],
      findings: [],
      rootCause: {
        title: "Analysis",
        explanation: raw,
        confidence: 0,
      },
      recommendations: [],
      confidence: 0,
    };
  }
};

class NvidiaProvider extends BaseProvider {
  constructor(config = {}) {
    super();

    this.modelKey = config.model;
    this.route = config.route || null;
    this.settings = config.settings || {};

    this.client = new OpenAI({
      apiKey: NVIDIA.apiKey,
      baseURL: NVIDIA.baseUrl,
      timeout: 120_000,
      maxRetries: 1,
    });
  }

  resolveModel(modelKey) {
    const model = getModelByKey(modelKey);

    if (!model) {
      throw new Error(`Unknown NVIDIA model: ${modelKey}`);
    }

    return model;
  }

  buildRequestOptions(prompt, { stream = false, modelKey = this.modelKey } = {}) {
    const model = this.resolveModel(modelKey);
    const options = {
      model: model.id,
      messages: [
        { role: "system", content: prompt.system },
        { role: "system", content: prompt.developer },
        { role: "user", content: `${prompt.context}\n\n${prompt.user}` },
      ],
      temperature: 0.2,
      top_p: 0.95,
      max_tokens: 4096,
      stream,
    };

    if (model.supportsStructuredOutput && !stream) {
      options.response_format = { type: "json_object" };
    }

    if (model.supportsReasoningBudget && this.settings.mode === "deep") {
      options.extra_body = {
        reasoning_budget: 8192,
      };
    }

    return { options, model, modelKey };
  }

  buildAiResponse(parsed, { model, modelKey, usage, route, retries = 0, cached = false, responseTimeMs, ttftMs, streaming = false }) {
    return new AIResponse({
      skill: parsed.skill || "",
      summary: parsed.executiveSummary || parsed.summary || "",
      cards: Array.isArray(parsed.cards) ? parsed.cards : [],
      findings: parsed.findings || [],
      recommendations: parsed.recommendations || [],
      confidence: parsed.confidence,
      metadata: {
        provider: "nvidia",
        providerDisplayName: "NVIDIA",
        model: model.displayName,
        modelKey,
        modelId: model.id,
        mode: this.settings.mode || "automatic",
        reasoning: model.reasoning === "high",
        reasoningModel: model.reasoning === "high",
        supportsStreaming: model.supportsStreaming,
        usage,
        estimatedCost: estimateCost(modelKey, usage),
        rootCause: parsed.rootCause,
        cards: parsed.cards,
        route: route
          ? {
              preferredModel: route.preferredModel,
              routingSource: route.routingSource,
              fallbackModels: route.fallbackModels,
            }
          : null,
        retries,
        cached,
        responseTimeMs,
        ttftMs,
        streaming,
        providerEnriched: true,
      },
    });
  }

  async generateWithModel(prompt, modelKey, { retries = 0 } = {}) {
    const { options, model } = this.buildRequestOptions(prompt, {
      stream: false,
      modelKey,
    });

    const startedAt = Date.now();
    const completion = await this.client.chat.completions.create(options);
    const responseTimeMs = Date.now() - startedAt;
    const raw = completion.choices[0]?.message?.content || "";
    const parsed = parseJsonResponse(raw);

    return this.buildAiResponse(parsed, {
      model,
      modelKey,
      usage: completion.usage,
      route: this.route,
      retries,
      responseTimeMs,
      ttftMs: responseTimeMs,
      streaming: false,
    });
  }

  async generate(prompt) {
    const chain = this.route?.routeChain || [this.modelKey, "llama70b"];
    let lastError = null;
    let retries = 0;

    for (let index = 0; index < chain.length; index += 1) {
      const modelKey = chain[index];

      try {
        return await this.generateWithModel(prompt, modelKey, { retries });
      } catch (err) {
        lastError = err;
        retries += 1;

        if (index < chain.length - 1) {
          continue;
        }
      }
    }

    throw new Error(lastError?.message || "NVIDIA generation failed.");
  }

  async stream(prompt, onChunk, { onFirstToken, signal } = {}) {
    const chain = this.route?.routeChain || [this.modelKey, "llama70b"];
    let lastError = null;

    for (const modelKey of chain) {
      try {
        const { options, model } = this.buildRequestOptions(prompt, {
          stream: true,
          modelKey,
        });

        const startedAt = Date.now();
        let ttftMs = null;
        let fullText = "";

        const stream = await this.client.chat.completions.create(options);

        for await (const chunk of stream) {
          if (signal?.aborted) {
            throw new Error("Stream aborted");
          }

          const text = chunk.choices[0]?.delta?.content || "";

          if (text) {
            if (ttftMs === null) {
              ttftMs = Date.now() - startedAt;

              if (onFirstToken) {
                onFirstToken(ttftMs);
              }
            }

            fullText += text;
            onChunk(text, { modelKey, model: model.displayName });
          }
        }

        const responseTimeMs = Date.now() - startedAt;
        const parsed = parseJsonResponse(fullText);

        return this.buildAiResponse(parsed, {
          model,
          modelKey,
          route: this.route,
          responseTimeMs,
          ttftMs: ttftMs ?? responseTimeMs,
          streaming: true,
        });
      } catch (err) {
        lastError = err;

        if (err.message === "Stream aborted") {
          throw err;
        }
      }
    }

    throw new Error(lastError?.message || "NVIDIA streaming failed.");
  }

  async healthCheck() {
    try {
      const model = this.resolveModel(this.modelKey || "super");
      await this.client.models.retrieve(model.id);
      return { status: "operational", model: model.displayName };
    } catch (err) {
      return { status: "degraded", error: err.message };
    }
  }
}

module.exports = NvidiaProvider;
