import { describe, it, expect, beforeEach } from "vitest";
import {
  createSwotAnalysis,
  updateSwotAnalysis,
  getSwotAnalysis,
  listSwotAnalyses,
} from "./swot.js";
import { createProject } from "../storage/index.js";

describe("SWOT Analysis", () => {
  let projectId: string;

  beforeEach(async () => {
    const project = await createProject("Test Project");
    projectId = project.id;
  });

  it("should create a complete SWOT analysis", async () => {
    const swot = await createSwotAnalysis({
      projectId,
      name: "Market Entry SWOT",
      description: "SWOT analysis for entering the European market",
      context: "Q1 2025 expansion planning",
      strengths: [
        { item: "Strong brand recognition", impact: "high" },
        { item: "Experienced team", impact: "medium" },
        { item: "Solid financials", impact: "high" },
      ],
      weaknesses: [
        { item: "No local presence", impact: "high", mitigation: "Hire local team" },
        { item: "Limited localization", impact: "medium", mitigation: "Invest in translations" },
      ],
      opportunities: [
        { item: "Growing market demand", timeframe: "immediate", requiredAction: "Launch marketing campaign" },
        { item: "Competitor exit", timeframe: "short-term" },
      ],
      threats: [
        { item: "Regulatory changes", likelihood: "medium", contingency: "Legal review" },
        { item: "Currency fluctuations", likelihood: "high", contingency: "Hedge exposure" },
      ],
    });

    expect(swot.id).toBeDefined();
    expect(swot.type).toBe("swot-analysis");
    expect(swot.strengths).toHaveLength(3);
    expect(swot.weaknesses).toHaveLength(2);
    expect(swot.opportunities).toHaveLength(2);
    expect(swot.threats).toHaveLength(2);
    expect(swot.context).toBe("Q1 2025 expansion planning");
  });

  it("should create a minimal SWOT analysis", async () => {
    const swot = await createSwotAnalysis({
      projectId,
      name: "Quick SWOT",
      strengths: [{ item: "We're good" }],
      weaknesses: [{ item: "We could improve" }],
      opportunities: [{ item: "There's potential" }],
      threats: [{ item: "Watch out" }],
    });

    expect(swot.id).toBeDefined();
    expect(swot.context).toBeUndefined();
    expect(swot.strengths[0].impact).toBeUndefined();
  });

  it("should update a SWOT analysis", async () => {
    const created = await createSwotAnalysis({
      projectId,
      name: "Original",
      strengths: [{ item: "Original strength" }],
      weaknesses: [{ item: "Original weakness" }],
      opportunities: [{ item: "Original opportunity" }],
      threats: [{ item: "Original threat" }],
    });

    const updated = await updateSwotAnalysis({
      entityId: created.id,
      name: "Updated SWOT",
      context: "New context",
      strengths: [
        { item: "New strength 1", impact: "high" },
        { item: "New strength 2", impact: "medium" },
      ],
    });

    expect(updated.name).toBe("Updated SWOT");
    expect(updated.context).toBe("New context");
    expect(updated.strengths).toHaveLength(2);
    expect(updated.weaknesses[0].item).toBe("Original weakness");
  });

  it("should throw when updating non-existent analysis", async () => {
    await expect(
      updateSwotAnalysis({
        entityId: "non-existent",
        name: "Test",
      })
    ).rejects.toThrow("SWOT Analysis non-existent not found");
  });

  it("should get a SWOT analysis by ID", async () => {
    const created = await createSwotAnalysis({
      projectId,
      name: "Test",
      strengths: [{ item: "Test" }],
      weaknesses: [{ item: "Test" }],
      opportunities: [{ item: "Test" }],
      threats: [{ item: "Test" }],
    });

    const retrieved = await getSwotAnalysis(created.id);

    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(created.id);
  });

  it("should list SWOT analyses in a project", async () => {
    const baseSwot = {
      strengths: [{ item: "Test" }],
      weaknesses: [{ item: "Test" }],
      opportunities: [{ item: "Test" }],
      threats: [{ item: "Test" }],
    };

    await createSwotAnalysis({ projectId, name: "SWOT 1", ...baseSwot });
    await createSwotAnalysis({ projectId, name: "SWOT 2", ...baseSwot });
    await createSwotAnalysis({ projectId, name: "SWOT 3", ...baseSwot });

    const analyses = await listSwotAnalyses(projectId);

    expect(analyses).toHaveLength(3);
  });
});
