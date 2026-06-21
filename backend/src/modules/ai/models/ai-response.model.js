class AIResponse {
  constructor({
    skill = "",
    summary = "",
    cards = [],
    findings = [],
    recommendations = [],
    confidence = null,
    metadata = {},
  } = {}) {
    this.skill = skill;
    this.summary = summary;
    this.cards = cards;
    this.findings = findings;
    this.recommendations = recommendations;
    this.confidence = confidence;
    this.metadata = metadata;
  }

  toJSON() {
    return {
      skill: this.skill,
      summary: this.summary,
      cards: this.cards,
      findings: this.findings,
      recommendations: this.recommendations,
      confidence: this.confidence,
      metadata: this.metadata,
    };
  }
}

module.exports = AIResponse;
