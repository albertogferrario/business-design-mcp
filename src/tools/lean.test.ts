import { describe, it, expect, beforeEach } from "vitest";
import {
  createLeanCanvas,
  updateLeanCanvas,
  getLeanCanvas,
  listLeanCanvases,
} from "./lean.js";
import { createProject } from "../storage/index.js";

describe("Lean Canvas", () => {
  let projectId: string;

  beforeEach(async () => {
    const project = await createProject("Test Project");
    projectId = project.id;
  });

  it("should create a complete lean canvas", async () => {
    const canvas = await createLeanCanvas({
      projectId,
      name: "Startup Idea",
      description: "A lean canvas for my startup",
      problem: [
        { problem: "Manual data entry is slow", existingAlternatives: "Spreadsheets, manual work" },
        { problem: "Errors in data", existingAlternatives: "Double-checking" },
      ],
      customerSegments: [
        { segment: "SMB Finance Teams", earlyAdopters: "Tech-savvy accountants" },
      ],
      uniqueValueProposition: {
        proposition: "Automate 80% of data entry in minutes",
        highLevelConcept: "Zapier for accounting",
      },
      solution: [
        { feature: "AI-powered data extraction", description: "Automatically extract data from documents" },
        { feature: "Smart validation", description: "Catch errors before they happen" },
      ],
      channels: ["Content marketing", "LinkedIn ads", "Partnerships"],
      revenueStreams: [
        { stream: "Monthly SaaS subscription", amount: "$99-499/mo" },
        { stream: "Enterprise contracts", amount: "$10k+/year" },
      ],
      costStructure: [
        { cost: "Engineering team", amount: "$50k/mo" },
        { cost: "Cloud infrastructure", amount: "$5k/mo" },
        { cost: "Marketing", amount: "$10k/mo" },
      ],
      keyMetrics: [
        { metric: "Monthly Active Users", target: "1000" },
        { metric: "MRR", target: "$50k" },
        { metric: "Churn Rate", target: "<5%" },
      ],
      unfairAdvantage: "Proprietary AI model trained on 1M+ documents",
    });

    expect(canvas.id).toBeDefined();
    expect(canvas.type).toBe("lean-canvas");
    expect(canvas.problem).toHaveLength(2);
    expect(canvas.uniqueValueProposition.highLevelConcept).toBe("Zapier for accounting");
    expect(canvas.unfairAdvantage).toBeDefined();
  });

  it("should create a minimal lean canvas", async () => {
    const canvas = await createLeanCanvas({
      projectId,
      name: "Minimal",
      problem: [{ problem: "A problem" }],
      customerSegments: [{ segment: "Everyone" }],
      uniqueValueProposition: { proposition: "We solve it" },
      solution: [{ feature: "Our solution" }],
      channels: ["Online"],
      revenueStreams: [{ stream: "Subscription" }],
      costStructure: [{ cost: "Operations" }],
      keyMetrics: [{ metric: "Users" }],
    });

    expect(canvas.id).toBeDefined();
    expect(canvas.unfairAdvantage).toBeUndefined();
  });

  it("should update a lean canvas", async () => {
    const created = await createLeanCanvas({
      projectId,
      name: "Original",
      problem: [{ problem: "Original problem" }],
      customerSegments: [{ segment: "Original segment" }],
      uniqueValueProposition: { proposition: "Original" },
      solution: [{ feature: "Original" }],
      channels: ["Original"],
      revenueStreams: [{ stream: "Original" }],
      costStructure: [{ cost: "Original" }],
      keyMetrics: [{ metric: "Original" }],
    });

    const updated = await updateLeanCanvas({
      entityId: created.id,
      name: "Updated",
      unfairAdvantage: "New unfair advantage",
      keyMetrics: [
        { metric: "New metric 1", target: "100" },
        { metric: "New metric 2", target: "200" },
      ],
    });

    expect(updated.name).toBe("Updated");
    expect(updated.unfairAdvantage).toBe("New unfair advantage");
    expect(updated.keyMetrics).toHaveLength(2);
    expect(updated.problem[0].problem).toBe("Original problem");
  });

  it("should throw when updating non-existent canvas", async () => {
    await expect(
      updateLeanCanvas({
        entityId: "non-existent",
        name: "Test",
      })
    ).rejects.toThrow("Lean Canvas non-existent not found");
  });

  it("should get a lean canvas by ID", async () => {
    const created = await createLeanCanvas({
      projectId,
      name: "Test",
      problem: [{ problem: "Test" }],
      customerSegments: [{ segment: "Test" }],
      uniqueValueProposition: { proposition: "Test" },
      solution: [{ feature: "Test" }],
      channels: ["Test"],
      revenueStreams: [{ stream: "Test" }],
      costStructure: [{ cost: "Test" }],
      keyMetrics: [{ metric: "Test" }],
    });

    const retrieved = await getLeanCanvas(created.id);

    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(created.id);
  });

  it("should list lean canvases in a project", async () => {
    const baseCanvas = {
      problem: [{ problem: "Test" }],
      customerSegments: [{ segment: "Test" }],
      uniqueValueProposition: { proposition: "Test" },
      solution: [{ feature: "Test" }],
      channels: ["Test"],
      revenueStreams: [{ stream: "Test" }],
      costStructure: [{ cost: "Test" }],
      keyMetrics: [{ metric: "Test" }],
    };

    await createLeanCanvas({ projectId, name: "Canvas 1", ...baseCanvas });
    await createLeanCanvas({ projectId, name: "Canvas 2", ...baseCanvas });

    const canvases = await listLeanCanvases(projectId);

    expect(canvases).toHaveLength(2);
  });
});
