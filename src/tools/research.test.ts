import { describe, it, expect, vi } from "vitest";
import {
  configureOpenAISchema,
  deepResearchSchema,
  populateFrameworkSchema,
  configureOpenAI,
  checkOpenAIConfig,
  populateFramework,
} from "./research.js";
import { createProject } from "./project.js";

// Mock the openai client to avoid actual API calls
vi.mock("../openai/client.js", () => ({
  setOpenAIApiKey: vi.fn(),
  getOpenAIApiKey: vi.fn(() => null),
  executeDeepResearch: vi.fn(),
}));

describe("Research Tool Schemas", () => {
  describe("configureOpenAISchema", () => {
    it("validates API key is required", () => {
      const result = configureOpenAISchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("accepts valid API key", () => {
      const result = configureOpenAISchema.safeParse({
        apiKey: "sk-test-key-12345",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("deepResearchSchema", () => {
    it("validates required fields", () => {
      const result = deepResearchSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("accepts valid research request", () => {
      const result = deepResearchSchema.safeParse({
        projectId: "proj-123",
        frameworkType: "market-sizing",
        context: {
          businessDescription: "AI document automation",
        },
      });
      expect(result.success).toBe(true);
    });

    it("validates framework type enum", () => {
      const result = deepResearchSchema.safeParse({
        projectId: "proj-123",
        frameworkType: "invalid-type",
        context: {
          businessDescription: "Test",
        },
      });
      expect(result.success).toBe(false);
    });

    it("accepts all valid framework types", () => {
      const types = [
        "market-sizing",
        "competitive-analysis",
        "user-persona",
        "swot-analysis",
        "business-model-canvas",
        "lean-canvas",
        "value-proposition-canvas",
      ];

      for (const type of types) {
        const result = deepResearchSchema.safeParse({
          projectId: "proj-123",
          frameworkType: type,
          context: { businessDescription: "Test" },
        });
        expect(result.success).toBe(true);
      }
    });

    it("accepts optional context fields", () => {
      const result = deepResearchSchema.safeParse({
        projectId: "proj-123",
        frameworkType: "market-sizing",
        context: {
          businessDescription: "AI document automation",
          industry: "Enterprise Software",
          geography: "North America",
          targetCustomers: "Fortune 500",
          productOrService: "SaaS platform",
          competitors: ["Competitor A", "Competitor B"],
        },
      });
      expect(result.success).toBe(true);
    });

    it("validates model enum", () => {
      const validResult = deepResearchSchema.safeParse({
        projectId: "proj-123",
        frameworkType: "market-sizing",
        context: { businessDescription: "Test" },
        model: "o4-mini-deep-research-2025-06-26",
      });
      expect(validResult.success).toBe(true);

      const invalidResult = deepResearchSchema.safeParse({
        projectId: "proj-123",
        frameworkType: "market-sizing",
        context: { businessDescription: "Test" },
        model: "invalid-model",
      });
      expect(invalidResult.success).toBe(false);
    });
  });

  describe("populateFrameworkSchema", () => {
    it("validates required fields", () => {
      const result = populateFrameworkSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("accepts valid populate request", () => {
      const result = populateFrameworkSchema.safeParse({
        projectId: "proj-123",
        frameworkType: "market-sizing",
        name: "Q1 Market Analysis",
        researchData: {
          tam: { value: 50000000000 },
          sam: { value: 10000000000 },
          som: { value: 1000000000 },
        },
        citations: [
          {
            id: "cit-1",
            title: "Market Report",
            url: "https://example.com/report",
            accessedAt: "2024-01-01T00:00:00Z",
            relevantFields: ["tam"],
          },
        ],
      });
      expect(result.success).toBe(true);
    });

    it("accepts optional fields", () => {
      const result = populateFrameworkSchema.safeParse({
        projectId: "proj-123",
        frameworkType: "swot-analysis",
        name: "SWOT Analysis",
        description: "Comprehensive analysis",
        researchData: {},
        citations: [],
        researchModel: "o4-mini-deep-research",
        confidence: 85,
      });
      expect(result.success).toBe(true);
    });
  });
});

describe("configureOpenAI", () => {
  it("returns success message", async () => {
    const result = await configureOpenAI({ apiKey: "sk-test-key" });

    expect(result.success).toBe(true);
    expect(result.message).toContain("configured");
  });
});

describe("checkOpenAIConfig", () => {
  it("returns configured false when no key", async () => {
    const { getOpenAIApiKey } = await import("../openai/client.js");
    vi.mocked(getOpenAIApiKey).mockReturnValue(null);

    const result = await checkOpenAIConfig();

    expect(result.configured).toBe(false);
    expect(result.source).toBe(null);
  });
});

describe("populateFramework", () => {
  it("creates market sizing entity from research data", async () => {
    const project = await createProject({
      name: "Test Project",
    });

    const result = await populateFramework({
      projectId: project.id,
      frameworkType: "market-sizing",
      name: "Market Analysis",
      researchData: {
        tam: { value: 50000000000, currency: "USD", unit: "annual" },
        sam: { value: 10000000000, currency: "USD", unit: "annual" },
        som: { value: 1000000000, currency: "USD", unit: "annual" },
      },
      citations: [
        {
          id: "cit-1",
          title: "Market Report 2024",
          url: "https://example.com/report",
          accessedAt: new Date().toISOString(),
          relevantFields: ["tam"],
        },
      ],
      confidence: 85,
    });

    expect(result.entityId).toBeDefined();
    expect(result.type).toBe("market-sizing");
    expect(result.name).toBe("Market Analysis");
    expect(result.citationCount).toBe(1);
  });

  it("creates SWOT analysis entity", async () => {
    const project = await createProject({
      name: "Test Project 2",
    });

    const result = await populateFramework({
      projectId: project.id,
      frameworkType: "swot-analysis",
      name: "SWOT Analysis",
      researchData: {
        strengths: [{ item: "Strong team" }],
        weaknesses: [{ item: "Limited funding" }],
        opportunities: [{ item: "Growing market" }],
        threats: [{ item: "Competition" }],
      },
      citations: [],
    });

    expect(result.entityId).toBeDefined();
    expect(result.type).toBe("swot-analysis");
  });

  it("creates competitive analysis entity", async () => {
    const project = await createProject({
      name: "Test Project 3",
    });

    const result = await populateFramework({
      projectId: project.id,
      frameworkType: "competitive-analysis",
      name: "Competitor Analysis",
      researchData: {
        competitors: [
          {
            name: "Competitor A",
            strengths: ["Strong brand"],
            weaknesses: ["High prices"],
          },
        ],
      },
      citations: [],
    });

    expect(result.entityId).toBeDefined();
    expect(result.type).toBe("competitive-analysis");
  });

  it("creates user persona entity", async () => {
    const project = await createProject({
      name: "Test Project 4",
    });

    const result = await populateFramework({
      projectId: project.id,
      frameworkType: "user-persona",
      name: "Enterprise User",
      researchData: {
        personas: [
          {
            name: "Enterprise Emma",
            demographics: { age: "35-45", occupation: "VP Engineering" },
            behavior: {
              goals: ["Improve productivity"],
              frustrations: ["Too many tools"],
              motivations: ["Career growth"],
            },
          },
        ],
      },
      citations: [],
    });

    expect(result.entityId).toBeDefined();
    expect(result.type).toBe("user-persona");
  });

  it("creates business model canvas entity", async () => {
    const project = await createProject({
      name: "Test Project 5",
    });

    const result = await populateFramework({
      projectId: project.id,
      frameworkType: "business-model-canvas",
      name: "BMC",
      researchData: {
        customerSegments: [{ segment: "Enterprise" }],
        valuePropositions: [{ proposition: "Automation" }],
        channels: [{ channel: "Direct sales" }],
        customerRelationships: [{ relationship: "Dedicated support" }],
        revenueStreams: [{ stream: "Subscription" }],
        keyResources: [{ resource: "Engineering team" }],
        keyActivities: [{ activity: "Product development" }],
        keyPartnerships: [{ partner: "Cloud providers" }],
        costStructure: [{ cost: "Personnel" }],
      },
      citations: [],
    });

    expect(result.entityId).toBeDefined();
    expect(result.type).toBe("business-model-canvas");
  });

  it("creates lean canvas entity", async () => {
    const project = await createProject({
      name: "Test Project 6",
    });

    const result = await populateFramework({
      projectId: project.id,
      frameworkType: "lean-canvas",
      name: "Lean Canvas",
      researchData: {
        problem: [{ problem: "Manual processes" }],
        customerSegments: [{ segment: "SMBs" }],
        uniqueValueProposition: { proposition: "One-click automation" },
        solution: [{ feature: "AI automation" }],
        channels: ["Direct", "Partners"],
        revenueStreams: [{ stream: "SaaS subscription" }],
        costStructure: [{ cost: "Cloud hosting" }],
        keyMetrics: [{ metric: "MRR" }],
      },
      citations: [],
    });

    expect(result.entityId).toBeDefined();
    expect(result.type).toBe("lean-canvas");
  });

  it("creates value proposition canvas entity", async () => {
    const project = await createProject({
      name: "Test Project 7",
    });

    const result = await populateFramework({
      projectId: project.id,
      frameworkType: "value-proposition-canvas",
      name: "VPC",
      researchData: {
        customerProfile: {
          customerJobs: [{ job: "Manage team" }],
          pains: [{ pain: "Too many meetings" }],
          gains: [{ gain: "More productivity" }],
        },
        valueMap: {
          productsAndServices: [{ item: "Platform" }],
          painRelievers: [{ reliever: "Automation" }],
          gainCreators: [{ creator: "AI insights" }],
        },
      },
      citations: [],
    });

    expect(result.entityId).toBeDefined();
    expect(result.type).toBe("value-proposition-canvas");
  });
});
