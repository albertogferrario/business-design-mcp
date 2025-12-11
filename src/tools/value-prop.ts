import { z } from "zod";
import { createEntity, getEntity, updateEntity, listEntitiesByType } from "../storage/index.js";
import type { ValuePropositionCanvas } from "../schemas/index.js";

export const createValuePropositionCanvasSchema = z.object({
  projectId: z.string().describe("The project ID to add this canvas to"),
  name: z.string().describe("Name for this value proposition canvas"),
  description: z.string().optional().describe("Optional description"),

  customerProfile: z
    .object({
      customerJobs: z
        .array(
          z.object({
            job: z.string().describe("What job is the customer trying to get done?"),
            type: z
              .enum(["functional", "social", "emotional", "supporting"])
              .optional()
              .describe("Type of job"),
            importance: z
              .enum(["critical", "important", "nice-to-have"])
              .optional()
              .describe("How important is this job?"),
          })
        )
        .describe("Jobs customers are trying to get done"),

      pains: z
        .array(
          z.object({
            pain: z.string().describe("What frustrates or annoys customers?"),
            severity: z
              .enum(["extreme", "moderate", "light"])
              .optional()
              .describe("How severe is this pain?"),
          })
        )
        .describe("Customer pains, frustrations, and obstacles"),

      gains: z
        .array(
          z.object({
            gain: z.string().describe("What outcomes or benefits do customers want?"),
            relevance: z
              .enum(["required", "expected", "desired", "unexpected"])
              .optional()
              .describe("How relevant is this gain?"),
          })
        )
        .describe("Outcomes and benefits customers want"),
    })
    .describe("Customer Profile: jobs, pains, and gains"),

  valueMap: z
    .object({
      productsAndServices: z
        .array(
          z.object({
            item: z.string().describe("Product or service"),
            type: z
              .enum(["physical", "digital", "intangible", "financial"])
              .optional()
              .describe("Type of offering"),
          })
        )
        .describe("Your products and services"),

      painRelievers: z
        .array(
          z.object({
            reliever: z.string().describe("How does your offering relieve pain?"),
            addressedPain: z.string().optional().describe("Which pain does this address?"),
          })
        )
        .describe("How your offerings relieve customer pains"),

      gainCreators: z
        .array(
          z.object({
            creator: z.string().describe("How does your offering create gains?"),
            addressedGain: z.string().optional().describe("Which gain does this create?"),
          })
        )
        .describe("How your offerings create customer gains"),
    })
    .describe("Value Map: products, pain relievers, and gain creators"),

  fitScore: z
    .number()
    .min(0)
    .max(100)
    .optional()
    .describe("Product-market fit score (0-100)"),
});

export async function createValuePropositionCanvas(
  args: z.infer<typeof createValuePropositionCanvasSchema>
): Promise<ValuePropositionCanvas> {
  const canvas = await createEntity<ValuePropositionCanvas>(args.projectId, {
    type: "value-proposition-canvas",
    name: args.name,
    description: args.description,
    customerProfile: args.customerProfile,
    valueMap: args.valueMap,
    fitScore: args.fitScore,
  });

  return canvas;
}

export const updateValuePropositionCanvasSchema = z.object({
  entityId: z.string().describe("The canvas ID to update"),
  name: z.string().optional(),
  description: z.string().optional(),
  customerProfile: createValuePropositionCanvasSchema.shape.customerProfile.optional(),
  valueMap: createValuePropositionCanvasSchema.shape.valueMap.optional(),
  fitScore: createValuePropositionCanvasSchema.shape.fitScore.optional(),
});

export async function updateValuePropositionCanvas(
  args: z.infer<typeof updateValuePropositionCanvasSchema>
): Promise<ValuePropositionCanvas> {
  const existing = await getEntity<ValuePropositionCanvas>(args.entityId);
  if (!existing) {
    throw new Error(`Value Proposition Canvas ${args.entityId} not found`);
  }

  const updated: ValuePropositionCanvas = {
    ...existing,
    name: args.name ?? existing.name,
    description: args.description ?? existing.description,
    customerProfile: args.customerProfile ?? existing.customerProfile,
    valueMap: args.valueMap ?? existing.valueMap,
    fitScore: args.fitScore ?? existing.fitScore,
  };

  return updateEntity(updated);
}

export async function getValuePropositionCanvas(entityId: string): Promise<ValuePropositionCanvas | null> {
  return getEntity<ValuePropositionCanvas>(entityId);
}

export async function listValuePropositionCanvases(projectId: string): Promise<ValuePropositionCanvas[]> {
  const entities = await listEntitiesByType(projectId, "value-proposition-canvas");
  return entities as ValuePropositionCanvas[];
}
