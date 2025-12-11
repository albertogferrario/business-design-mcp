import { describe, it, expect, beforeEach } from "vitest";
import {
  createCompetitiveAnalysis,
  updateCompetitiveAnalysis,
  getCompetitiveAnalysis,
  listCompetitiveAnalyses,
} from "./competitive.js";
import { createProject } from "../storage/index.js";

describe("Competitive Analysis", () => {
  let projectId: string;

  beforeEach(async () => {
    const project = await createProject("Test Project");
    projectId = project.id;
  });

  it("should create a complete competitive analysis", async () => {
    const analysis = await createCompetitiveAnalysis({
      projectId,
      name: "Market Competitors",
      description: "Analysis of main competitors in the automation space",
      competitors: [
        {
          name: "Competitor A",
          website: "https://competitor-a.com",
          description: "Market leader in enterprise automation",
          strengths: ["Large customer base", "Strong brand", "Enterprise features"],
          weaknesses: ["Expensive", "Complex setup", "Poor UX"],
          pricing: { model: "Per-seat licensing", range: "$50-200/user/mo" },
          marketShare: "35%",
          targetAudience: "Enterprise (1000+ employees)",
          features: [
            { feature: "Workflow automation", rating: "strong" },
            { feature: "AI capabilities", rating: "moderate" },
            { feature: "Mobile app", rating: "weak" },
          ],
        },
        {
          name: "Competitor B",
          website: "https://competitor-b.com",
          description: "Fast-growing startup targeting SMBs",
          strengths: ["Easy to use", "Affordable", "Modern UI"],
          weaknesses: ["Limited integrations", "No enterprise features"],
          pricing: { model: "Tiered subscription", range: "$29-99/mo" },
          marketShare: "15%",
          targetAudience: "SMB (10-200 employees)",
        },
      ],
      comparisonMatrix: [
        { criterion: "Ease of use", weight: 0.3, scores: { "Competitor A": 3, "Competitor B": 5, "Us": 4 } },
        { criterion: "Feature depth", weight: 0.25, scores: { "Competitor A": 5, "Competitor B": 3, "Us": 4 } },
        { criterion: "Price", weight: 0.2, scores: { "Competitor A": 2, "Competitor B": 5, "Us": 4 } },
        { criterion: "Support", weight: 0.25, scores: { "Competitor A": 4, "Competitor B": 3, "Us": 5 } },
      ],
      ourPosition: {
        differentiators: ["AI-first approach", "Best-in-class UX", "Transparent pricing"],
        gaps: ["Limited enterprise features", "Smaller partner ecosystem"],
        opportunities: ["Mid-market segment underserved", "AI capabilities in demand"],
      },
    });

    expect(analysis.id).toBeDefined();
    expect(analysis.type).toBe("competitive-analysis");
    expect(analysis.competitors).toHaveLength(2);
    expect(analysis.competitors[0].features).toHaveLength(3);
    expect(analysis.comparisonMatrix).toHaveLength(4);
    expect(analysis.ourPosition?.differentiators).toHaveLength(3);
  });

  it("should create a minimal competitive analysis", async () => {
    const analysis = await createCompetitiveAnalysis({
      projectId,
      name: "Quick Analysis",
      competitors: [
        {
          name: "Main Competitor",
          strengths: ["Established"],
          weaknesses: ["Slow"],
        },
      ],
    });

    expect(analysis.id).toBeDefined();
    expect(analysis.comparisonMatrix).toBeUndefined();
    expect(analysis.ourPosition).toBeUndefined();
  });

  it("should update a competitive analysis", async () => {
    const created = await createCompetitiveAnalysis({
      projectId,
      name: "Original",
      competitors: [
        {
          name: "Original Competitor",
          strengths: ["Original strength"],
          weaknesses: ["Original weakness"],
        },
      ],
    });

    const updated = await updateCompetitiveAnalysis({
      entityId: created.id,
      name: "Updated Analysis",
      ourPosition: {
        differentiators: ["New differentiator"],
        gaps: ["New gap"],
        opportunities: ["New opportunity"],
      },
      competitors: [
        {
          name: "New Competitor 1",
          strengths: ["Strong"],
          weaknesses: ["Weak"],
        },
        {
          name: "New Competitor 2",
          strengths: ["Also strong"],
          weaknesses: ["Also weak"],
        },
      ],
    });

    expect(updated.name).toBe("Updated Analysis");
    expect(updated.competitors).toHaveLength(2);
    expect(updated.ourPosition?.differentiators).toHaveLength(1);
  });

  it("should throw when updating non-existent analysis", async () => {
    await expect(
      updateCompetitiveAnalysis({
        entityId: "non-existent",
        name: "Test",
      })
    ).rejects.toThrow("Competitive Analysis non-existent not found");
  });

  it("should get a competitive analysis by ID", async () => {
    const created = await createCompetitiveAnalysis({
      projectId,
      name: "Test Analysis",
      competitors: [
        {
          name: "Test Competitor",
          strengths: ["Test"],
          weaknesses: ["Test"],
        },
      ],
    });

    const retrieved = await getCompetitiveAnalysis(created.id);

    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(created.id);
  });

  it("should list competitive analyses in a project", async () => {
    const baseAnalysis = {
      competitors: [
        {
          name: "Competitor",
          strengths: ["Test"],
          weaknesses: ["Test"],
        },
      ],
    };

    await createCompetitiveAnalysis({ projectId, name: "Analysis 1", ...baseAnalysis });
    await createCompetitiveAnalysis({ projectId, name: "Analysis 2", ...baseAnalysis });

    const analyses = await listCompetitiveAnalyses(projectId);

    expect(analyses).toHaveLength(2);
  });
});
