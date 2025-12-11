import { describe, it, expect, beforeEach } from "vitest";
import {
  createBusinessModelCanvas,
  updateBusinessModelCanvas,
  getBusinessModelCanvas,
  listBusinessModelCanvases,
} from "./canvas.js";
import { createProject } from "../storage/index.js";

describe("Business Model Canvas", () => {
  let projectId: string;

  beforeEach(async () => {
    const project = await createProject("Test Project");
    projectId = project.id;
  });

  it("should create a complete business model canvas", async () => {
    const canvas = await createBusinessModelCanvas({
      projectId,
      name: "My Business Model",
      description: "A test business model canvas",
      customerSegments: [
        { segment: "Small businesses", characteristics: "10-50 employees", size: "1M+" },
        { segment: "Enterprise", characteristics: "500+ employees" },
      ],
      valuePropositions: [
        {
          proposition: "Save time on manual tasks",
          customerPains: ["Too much manual work", "Error-prone processes"],
          customerGains: ["More time for strategic work"],
        },
      ],
      channels: [
        { channel: "Direct sales", phase: "purchase" },
        { channel: "Website", phase: "awareness" },
      ],
      customerRelationships: [
        { relationship: "Dedicated account manager", type: "dedicated" },
        { relationship: "Self-service portal", type: "self-service" },
      ],
      revenueStreams: [
        { stream: "Monthly subscription", type: "subscription", pricing: "$99-999/mo" },
        { stream: "Professional services", type: "usage-fee" },
      ],
      keyResources: [
        { resource: "Engineering team", type: "human" },
        { resource: "Cloud infrastructure", type: "physical" },
        { resource: "Patents", type: "intellectual" },
      ],
      keyActivities: [
        { activity: "Product development", type: "production" },
        { activity: "Customer support", type: "problem-solving" },
      ],
      keyPartnerships: [
        { partner: "AWS", type: "supplier", motivation: "Infrastructure" },
        { partner: "Salesforce", type: "strategic-alliance", motivation: "Integration" },
      ],
      costStructure: [
        { cost: "Salaries", type: "fixed", priority: "value-driven" },
        { cost: "Cloud hosting", type: "variable" },
      ],
    });

    expect(canvas.id).toBeDefined();
    expect(canvas.type).toBe("business-model-canvas");
    expect(canvas.name).toBe("My Business Model");
    expect(canvas.customerSegments).toHaveLength(2);
    expect(canvas.valuePropositions).toHaveLength(1);
    expect(canvas.channels).toHaveLength(2);
    expect(canvas.revenueStreams[0].pricing).toBe("$99-999/mo");
  });

  it("should create a minimal business model canvas", async () => {
    const canvas = await createBusinessModelCanvas({
      projectId,
      name: "Minimal Canvas",
      customerSegments: [{ segment: "Everyone" }],
      valuePropositions: [{ proposition: "We help you" }],
      channels: [{ channel: "Online" }],
      customerRelationships: [{ relationship: "Self-service" }],
      revenueStreams: [{ stream: "Subscription" }],
      keyResources: [{ resource: "Team" }],
      keyActivities: [{ activity: "Building" }],
      keyPartnerships: [{ partner: "None" }],
      costStructure: [{ cost: "Operations" }],
    });

    expect(canvas.id).toBeDefined();
    expect(canvas.customerSegments[0].characteristics).toBeUndefined();
  });

  it("should update a business model canvas", async () => {
    const created = await createBusinessModelCanvas({
      projectId,
      name: "Original",
      customerSegments: [{ segment: "Original segment" }],
      valuePropositions: [{ proposition: "Original value" }],
      channels: [{ channel: "Original channel" }],
      customerRelationships: [{ relationship: "Original" }],
      revenueStreams: [{ stream: "Original" }],
      keyResources: [{ resource: "Original" }],
      keyActivities: [{ activity: "Original" }],
      keyPartnerships: [{ partner: "Original" }],
      costStructure: [{ cost: "Original" }],
    });

    const updated = await updateBusinessModelCanvas({
      entityId: created.id,
      name: "Updated Name",
      customerSegments: [
        { segment: "New segment 1" },
        { segment: "New segment 2" },
      ],
    });

    expect(updated.name).toBe("Updated Name");
    expect(updated.customerSegments).toHaveLength(2);
    expect(updated.valuePropositions[0].proposition).toBe("Original value");
  });

  it("should throw when updating non-existent canvas", async () => {
    await expect(
      updateBusinessModelCanvas({
        entityId: "non-existent",
        name: "Test",
      })
    ).rejects.toThrow("Business Model Canvas non-existent not found");
  });

  it("should get a business model canvas by ID", async () => {
    const created = await createBusinessModelCanvas({
      projectId,
      name: "Test Canvas",
      customerSegments: [{ segment: "Test" }],
      valuePropositions: [{ proposition: "Test" }],
      channels: [{ channel: "Test" }],
      customerRelationships: [{ relationship: "Test" }],
      revenueStreams: [{ stream: "Test" }],
      keyResources: [{ resource: "Test" }],
      keyActivities: [{ activity: "Test" }],
      keyPartnerships: [{ partner: "Test" }],
      costStructure: [{ cost: "Test" }],
    });

    const retrieved = await getBusinessModelCanvas(created.id);

    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(created.id);
  });

  it("should list business model canvases in a project", async () => {
    await createBusinessModelCanvas({
      projectId,
      name: "Canvas 1",
      customerSegments: [{ segment: "Test" }],
      valuePropositions: [{ proposition: "Test" }],
      channels: [{ channel: "Test" }],
      customerRelationships: [{ relationship: "Test" }],
      revenueStreams: [{ stream: "Test" }],
      keyResources: [{ resource: "Test" }],
      keyActivities: [{ activity: "Test" }],
      keyPartnerships: [{ partner: "Test" }],
      costStructure: [{ cost: "Test" }],
    });

    await createBusinessModelCanvas({
      projectId,
      name: "Canvas 2",
      customerSegments: [{ segment: "Test" }],
      valuePropositions: [{ proposition: "Test" }],
      channels: [{ channel: "Test" }],
      customerRelationships: [{ relationship: "Test" }],
      revenueStreams: [{ stream: "Test" }],
      keyResources: [{ resource: "Test" }],
      keyActivities: [{ activity: "Test" }],
      keyPartnerships: [{ partner: "Test" }],
      costStructure: [{ cost: "Test" }],
    });

    const canvases = await listBusinessModelCanvases(projectId);

    expect(canvases).toHaveLength(2);
  });
});
