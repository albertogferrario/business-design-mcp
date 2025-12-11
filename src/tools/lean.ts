import { z } from "zod";
import { createEntity, getEntity, updateEntity, listEntitiesByType } from "../storage/index.js";
import type { LeanCanvas } from "../schemas/index.js";

export const createLeanCanvasSchema = z.object({
  projectId: z.string().describe("The project ID to add this canvas to"),
  name: z.string().describe("Name for this lean canvas"),
  description: z.string().optional().describe("Optional description"),

  problem: z
    .array(
      z.object({
        problem: z.string().describe("Top problem to solve"),
        existingAlternatives: z.string().optional().describe("How customers solve this today"),
      })
    )
    .describe("List top 1-3 problems you're solving"),

  customerSegments: z
    .array(
      z.object({
        segment: z.string().describe("Target customer segment"),
        earlyAdopters: z.string().optional().describe("Characteristics of early adopters"),
      })
    )
    .describe("Who are your target customers? Who are your early adopters?"),

  uniqueValueProposition: z
    .object({
      proposition: z.string().describe("Single, clear, compelling message"),
      highLevelConcept: z.string().optional().describe("X for Y analogy (e.g., YouTube for Courses)"),
    })
    .describe("What is your single, clear, compelling message?"),

  solution: z
    .array(
      z.object({
        feature: z.string().describe("Top feature"),
        description: z.string().optional().describe("Brief description"),
      })
    )
    .describe("Outline a possible solution for each problem"),

  channels: z.array(z.string()).describe("Path to customers (list your channels)"),

  revenueStreams: z
    .array(
      z.object({
        stream: z.string().describe("Revenue source"),
        amount: z.string().optional().describe("Expected amount"),
      })
    )
    .describe("How will you make money?"),

  costStructure: z
    .array(
      z.object({
        cost: z.string().describe("Cost item"),
        amount: z.string().optional().describe("Estimated amount"),
      })
    )
    .describe("Customer acquisition costs, distribution costs, hosting, people, etc."),

  keyMetrics: z
    .array(
      z.object({
        metric: z.string().describe("Key metric to track"),
        target: z.string().optional().describe("Target value"),
      })
    )
    .describe("Key activities you measure (acquisition, activation, retention, revenue, referral)"),

  unfairAdvantage: z
    .string()
    .optional()
    .describe("Something that cannot easily be bought or copied"),
});

export async function createLeanCanvas(
  args: z.infer<typeof createLeanCanvasSchema>
): Promise<LeanCanvas> {
  const canvas = await createEntity<LeanCanvas>(args.projectId, {
    type: "lean-canvas",
    name: args.name,
    description: args.description,
    problem: args.problem,
    customerSegments: args.customerSegments,
    uniqueValueProposition: args.uniqueValueProposition,
    solution: args.solution,
    channels: args.channels,
    revenueStreams: args.revenueStreams,
    costStructure: args.costStructure,
    keyMetrics: args.keyMetrics,
    unfairAdvantage: args.unfairAdvantage,
  });

  return canvas;
}

export const updateLeanCanvasSchema = z.object({
  entityId: z.string().describe("The canvas ID to update"),
  name: z.string().optional(),
  description: z.string().optional(),
  problem: createLeanCanvasSchema.shape.problem.optional(),
  customerSegments: createLeanCanvasSchema.shape.customerSegments.optional(),
  uniqueValueProposition: createLeanCanvasSchema.shape.uniqueValueProposition.optional(),
  solution: createLeanCanvasSchema.shape.solution.optional(),
  channels: createLeanCanvasSchema.shape.channels.optional(),
  revenueStreams: createLeanCanvasSchema.shape.revenueStreams.optional(),
  costStructure: createLeanCanvasSchema.shape.costStructure.optional(),
  keyMetrics: createLeanCanvasSchema.shape.keyMetrics.optional(),
  unfairAdvantage: createLeanCanvasSchema.shape.unfairAdvantage.optional(),
});

export async function updateLeanCanvas(
  args: z.infer<typeof updateLeanCanvasSchema>
): Promise<LeanCanvas> {
  const existing = await getEntity<LeanCanvas>(args.entityId);
  if (!existing) {
    throw new Error(`Lean Canvas ${args.entityId} not found`);
  }

  const updated: LeanCanvas = {
    ...existing,
    name: args.name ?? existing.name,
    description: args.description ?? existing.description,
    problem: args.problem ?? existing.problem,
    customerSegments: args.customerSegments ?? existing.customerSegments,
    uniqueValueProposition: args.uniqueValueProposition ?? existing.uniqueValueProposition,
    solution: args.solution ?? existing.solution,
    channels: args.channels ?? existing.channels,
    revenueStreams: args.revenueStreams ?? existing.revenueStreams,
    costStructure: args.costStructure ?? existing.costStructure,
    keyMetrics: args.keyMetrics ?? existing.keyMetrics,
    unfairAdvantage: args.unfairAdvantage ?? existing.unfairAdvantage,
  };

  return updateEntity(updated);
}

export async function getLeanCanvas(entityId: string): Promise<LeanCanvas | null> {
  return getEntity<LeanCanvas>(entityId);
}

export async function listLeanCanvases(projectId: string): Promise<LeanCanvas[]> {
  const entities = await listEntitiesByType(projectId, "lean-canvas");
  return entities as LeanCanvas[];
}
