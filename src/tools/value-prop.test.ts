import { describe, it, expect, beforeEach } from "vitest";
import {
  createValuePropositionCanvas,
  updateValuePropositionCanvas,
  getValuePropositionCanvas,
  listValuePropositionCanvases,
} from "./value-prop.js";
import { createProject } from "../storage/index.js";

describe("Value Proposition Canvas", () => {
  let projectId: string;

  beforeEach(async () => {
    const project = await createProject("Test Project");
    projectId = project.id;
  });

  it("should create a complete value proposition canvas", async () => {
    const canvas = await createValuePropositionCanvas({
      projectId,
      name: "Enterprise VPC",
      description: "Value proposition for enterprise customers",
      customerProfile: {
        customerJobs: [
          { job: "Process invoices accurately", type: "functional", importance: "critical" },
          { job: "Look competent to leadership", type: "social", importance: "important" },
          { job: "Feel confident in data quality", type: "emotional", importance: "important" },
        ],
        pains: [
          { pain: "Manual data entry takes hours", severity: "extreme" },
          { pain: "Errors cause compliance issues", severity: "extreme" },
          { pain: "Hard to track processing status", severity: "moderate" },
        ],
        gains: [
          { gain: "Real-time processing visibility", relevance: "expected" },
          { gain: "Zero manual data entry", relevance: "desired" },
          { gain: "Automatic error detection", relevance: "required" },
        ],
      },
      valueMap: {
        productsAndServices: [
          { item: "AI-powered data extraction", type: "digital" },
          { item: "Dashboard and analytics", type: "digital" },
          { item: "API integrations", type: "digital" },
          { item: "Training and support", type: "intangible" },
        ],
        painRelievers: [
          { reliever: "Automated extraction reduces manual work by 90%", addressedPain: "Manual data entry takes hours" },
          { reliever: "Built-in validation catches errors before processing", addressedPain: "Errors cause compliance issues" },
          { reliever: "Real-time status tracking dashboard", addressedPain: "Hard to track processing status" },
        ],
        gainCreators: [
          { creator: "Live dashboard with processing metrics", addressedGain: "Real-time processing visibility" },
          { creator: "AI handles all data entry automatically", addressedGain: "Zero manual data entry" },
          { creator: "ML-based anomaly detection", addressedGain: "Automatic error detection" },
        ],
      },
      fitScore: 85,
    });

    expect(canvas.id).toBeDefined();
    expect(canvas.type).toBe("value-proposition-canvas");
    expect(canvas.customerProfile.customerJobs).toHaveLength(3);
    expect(canvas.customerProfile.pains).toHaveLength(3);
    expect(canvas.customerProfile.gains).toHaveLength(3);
    expect(canvas.valueMap.productsAndServices).toHaveLength(4);
    expect(canvas.valueMap.painRelievers).toHaveLength(3);
    expect(canvas.valueMap.gainCreators).toHaveLength(3);
    expect(canvas.fitScore).toBe(85);
  });

  it("should create a minimal value proposition canvas", async () => {
    const canvas = await createValuePropositionCanvas({
      projectId,
      name: "Minimal VPC",
      customerProfile: {
        customerJobs: [{ job: "Get work done" }],
        pains: [{ pain: "Too slow" }],
        gains: [{ gain: "More speed" }],
      },
      valueMap: {
        productsAndServices: [{ item: "Our product" }],
        painRelievers: [{ reliever: "We make it fast" }],
        gainCreators: [{ creator: "We add speed" }],
      },
    });

    expect(canvas.id).toBeDefined();
    expect(canvas.fitScore).toBeUndefined();
    expect(canvas.customerProfile.customerJobs[0].type).toBeUndefined();
  });

  it("should update a value proposition canvas", async () => {
    const created = await createValuePropositionCanvas({
      projectId,
      name: "Original",
      customerProfile: {
        customerJobs: [{ job: "Original job" }],
        pains: [{ pain: "Original pain" }],
        gains: [{ gain: "Original gain" }],
      },
      valueMap: {
        productsAndServices: [{ item: "Original product" }],
        painRelievers: [{ reliever: "Original reliever" }],
        gainCreators: [{ creator: "Original creator" }],
      },
    });

    const updated = await updateValuePropositionCanvas({
      entityId: created.id,
      name: "Updated VPC",
      fitScore: 75,
      customerProfile: {
        customerJobs: [
          { job: "New job 1", type: "functional" },
          { job: "New job 2", type: "social" },
        ],
        pains: [{ pain: "New pain", severity: "extreme" }],
        gains: [{ gain: "New gain", relevance: "required" }],
      },
    });

    expect(updated.name).toBe("Updated VPC");
    expect(updated.fitScore).toBe(75);
    expect(updated.customerProfile.customerJobs).toHaveLength(2);
    expect(updated.valueMap.productsAndServices[0].item).toBe("Original product");
  });

  it("should throw when updating non-existent canvas", async () => {
    await expect(
      updateValuePropositionCanvas({
        entityId: "non-existent",
        name: "Test",
      })
    ).rejects.toThrow("Value Proposition Canvas non-existent not found");
  });

  it("should get a value proposition canvas by ID", async () => {
    const created = await createValuePropositionCanvas({
      projectId,
      name: "Test VPC",
      customerProfile: {
        customerJobs: [{ job: "Test" }],
        pains: [{ pain: "Test" }],
        gains: [{ gain: "Test" }],
      },
      valueMap: {
        productsAndServices: [{ item: "Test" }],
        painRelievers: [{ reliever: "Test" }],
        gainCreators: [{ creator: "Test" }],
      },
    });

    const retrieved = await getValuePropositionCanvas(created.id);

    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(created.id);
  });

  it("should list value proposition canvases in a project", async () => {
    const baseCanvas = {
      customerProfile: {
        customerJobs: [{ job: "Test" }],
        pains: [{ pain: "Test" }],
        gains: [{ gain: "Test" }],
      },
      valueMap: {
        productsAndServices: [{ item: "Test" }],
        painRelievers: [{ reliever: "Test" }],
        gainCreators: [{ creator: "Test" }],
      },
    };

    await createValuePropositionCanvas({ projectId, name: "VPC 1", ...baseCanvas });
    await createValuePropositionCanvas({ projectId, name: "VPC 2", ...baseCanvas });

    const canvases = await listValuePropositionCanvases(projectId);

    expect(canvases).toHaveLength(2);
  });
});
