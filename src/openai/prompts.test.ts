import { describe, it, expect } from "vitest";
import { generateResearchPrompt, SYSTEM_PROMPT } from "./prompts.js";
import type { ResearchContext } from "./prompts.js";

describe("SYSTEM_PROMPT", () => {
  it("includes key guidelines", () => {
    expect(SYSTEM_PROMPT).toContain("business analyst");
    expect(SYSTEM_PROMPT).toContain("citations");
    expect(SYSTEM_PROMPT).toContain("recent data");
  });
});

describe("generateResearchPrompt", () => {
  const baseContext: ResearchContext = {
    businessDescription: "AI-powered document automation for enterprises",
    industry: "Enterprise Software",
    geography: "North America",
    targetCustomers: "Fortune 500 companies",
  };

  describe("market-sizing", () => {
    it("generates market sizing prompt with context", () => {
      const prompt = generateResearchPrompt("market-sizing", baseContext);

      expect(prompt).toContain("AI-powered document automation");
      expect(prompt).toContain("Enterprise Software");
      expect(prompt).toContain("North America");
      expect(prompt).toContain("TAM");
      expect(prompt).toContain("SAM");
      expect(prompt).toContain("SOM");
      expect(prompt).toContain("CAGR");
    });

    it("handles missing industry", () => {
      const prompt = generateResearchPrompt("market-sizing", {
        businessDescription: "Test business",
      });

      expect(prompt).toContain("Not specified");
    });

    it("defaults geography to Global", () => {
      const prompt = generateResearchPrompt("market-sizing", {
        businessDescription: "Test business",
        industry: "Tech",
      });

      expect(prompt).toContain("Global");
    });
  });

  describe("competitive-analysis", () => {
    it("generates competitive analysis prompt", () => {
      const prompt = generateResearchPrompt("competitive-analysis", {
        ...baseContext,
        competitors: ["Competitor A", "Competitor B"],
      });

      expect(prompt).toContain("Competitor A");
      expect(prompt).toContain("Competitor B");
      expect(prompt).toContain("Strengths");
      expect(prompt).toContain("Weaknesses");
      expect(prompt).toContain("Pricing");
      expect(prompt).toContain("Market Position");
    });

    it("prompts to research competitors when not provided", () => {
      const prompt = generateResearchPrompt("competitive-analysis", {
        businessDescription: "Test business",
      });

      expect(prompt).toContain("Research and identify top competitors");
    });
  });

  describe("user-persona", () => {
    it("generates user persona prompt", () => {
      const prompt = generateResearchPrompt("user-persona", baseContext);

      expect(prompt).toContain("Fortune 500 companies");
      expect(prompt).toContain("Demographics");
      expect(prompt).toContain("Psychographics");
      expect(prompt).toContain("goals");
      expect(prompt).toContain("frustrations");
      expect(prompt).toContain("Persona 1");
    });
  });

  describe("swot-analysis", () => {
    it("generates SWOT analysis prompt", () => {
      const prompt = generateResearchPrompt("swot-analysis", baseContext);

      expect(prompt).toContain("Strengths");
      expect(prompt).toContain("Weaknesses");
      expect(prompt).toContain("Opportunities");
      expect(prompt).toContain("Threats");
      expect(prompt).toContain("Impact level");
    });
  });

  describe("business-model-canvas", () => {
    it("generates business model canvas prompt", () => {
      const prompt = generateResearchPrompt("business-model-canvas", baseContext);

      expect(prompt).toContain("Customer Segments");
      expect(prompt).toContain("Value Propositions");
      expect(prompt).toContain("Channels");
      expect(prompt).toContain("Customer Relationships");
      expect(prompt).toContain("Revenue Streams");
      expect(prompt).toContain("Key Resources");
      expect(prompt).toContain("Key Activities");
      expect(prompt).toContain("Key Partnerships");
      expect(prompt).toContain("Cost Structure");
    });
  });

  describe("lean-canvas", () => {
    it("generates lean canvas prompt", () => {
      const prompt = generateResearchPrompt("lean-canvas", {
        ...baseContext,
        productOrService: "Document automation platform",
      });

      expect(prompt).toContain("Document automation platform");
      expect(prompt).toContain("Problem");
      expect(prompt).toContain("Unique Value Proposition");
      expect(prompt).toContain("Solution");
      expect(prompt).toContain("Key Metrics");
      expect(prompt).toContain("Unfair Advantage");
    });
  });

  describe("value-proposition-canvas", () => {
    it("generates value proposition canvas prompt", () => {
      const prompt = generateResearchPrompt("value-proposition-canvas", baseContext);

      expect(prompt).toContain("Customer Jobs");
      expect(prompt).toContain("Pains");
      expect(prompt).toContain("Gains");
      expect(prompt).toContain("Pain Relievers");
      expect(prompt).toContain("Gain Creators");
      expect(prompt).toContain("Fit Analysis");
    });
  });

  describe("all framework types", () => {
    const frameworks = [
      "market-sizing",
      "competitive-analysis",
      "user-persona",
      "swot-analysis",
      "business-model-canvas",
      "lean-canvas",
      "value-proposition-canvas",
    ] as const;

    it.each(frameworks)("generates non-empty prompt for %s", (framework) => {
      const prompt = generateResearchPrompt(framework, baseContext);

      expect(prompt.length).toBeGreaterThan(100);
      expect(prompt).toContain(baseContext.businessDescription);
    });
  });
});
