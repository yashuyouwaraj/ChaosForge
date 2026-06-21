const AI_RESPONSE_SCHEMA = {
  type: "object",

  properties: {
    executiveSummary: {
      type: "string",
    },

    findings: {
      type: "array",

      items: {
        type: "string",
      },
    },

    rootCause: {
      type: "object",

      properties: {
        title: {
          type: "string",
        },

        explanation: {
          type: "string",
        },

        confidence: {
          type: "number",
        },
      },
    },

    recommendations: {
      type: "array",

      items: {
        type: "object",

        properties: {
          priority: {
            type: "string",
          },

          recommendation: {
            type: "string",
          },

          expectedImpact: {
            type: "string",
          },
        },
      },
    },

    confidence: {
      type: "number",
    },
  },

  required: [
    "executiveSummary",
    "findings",
    "rootCause",
    "recommendations",
    "confidence",
  ],
};

module.exports = {
  AI_RESPONSE_SCHEMA,
};
