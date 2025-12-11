import { z } from "zod";
import { createEntity, getEntity, updateEntity, listEntitiesByType } from "../storage/index.js";
import type { SwotAnalysis } from "../schemas/index.js";

export const createSwotAnalysisSchema = z.object({
  projectId: z.string().describe("The project ID to add this analysis to"),
  name: z.string().describe("Name for this SWOT analysis"),
  description: z.string().optional().describe("Optional description"),
  context: z.string().optional().describe("Context or scope of the analysis"),

  strengths: z
    .array(
      z.object({
        item: z.string().describe("Internal strength"),
        impact: z.enum(["high", "medium", "low"]).optional().describe("Impact level"),
      })
    )
    .describe("Internal positive factors - What do you do well?"),

  weaknesses: z
    .array(
      z.object({
        item: z.string().describe("Internal weakness"),
        impact: z.enum(["high", "medium", "low"]).optional().describe("Impact level"),
        mitigation: z.string().optional().describe("How to address this weakness"),
      })
    )
    .describe("Internal negative factors - What could you improve?"),

  opportunities: z
    .array(
      z.object({
        item: z.string().describe("External opportunity"),
        timeframe: z
          .enum(["immediate", "short-term", "long-term"])
          .optional()
          .describe("When to act"),
        requiredAction: z.string().optional().describe("What action to take"),
      })
    )
    .describe("External positive factors - What opportunities exist?"),

  threats: z
    .array(
      z.object({
        item: z.string().describe("External threat"),
        likelihood: z.enum(["high", "medium", "low"]).optional().describe("Likelihood"),
        contingency: z.string().optional().describe("Contingency plan"),
      })
    )
    .describe("External negative factors - What threats exist?"),
});

export async function createSwotAnalysis(
  args: z.infer<typeof createSwotAnalysisSchema>
): Promise<SwotAnalysis> {
  const analysis = await createEntity<SwotAnalysis>(args.projectId, {
    type: "swot-analysis",
    name: args.name,
    description: args.description,
    context: args.context,
    strengths: args.strengths,
    weaknesses: args.weaknesses,
    opportunities: args.opportunities,
    threats: args.threats,
  });

  return analysis;
}

export const updateSwotAnalysisSchema = z.object({
  entityId: z.string().describe("The analysis ID to update"),
  name: z.string().optional(),
  description: z.string().optional(),
  context: z.string().optional(),
  strengths: createSwotAnalysisSchema.shape.strengths.optional(),
  weaknesses: createSwotAnalysisSchema.shape.weaknesses.optional(),
  opportunities: createSwotAnalysisSchema.shape.opportunities.optional(),
  threats: createSwotAnalysisSchema.shape.threats.optional(),
});

export async function updateSwotAnalysis(
  args: z.infer<typeof updateSwotAnalysisSchema>
): Promise<SwotAnalysis> {
  const existing = await getEntity<SwotAnalysis>(args.entityId);
  if (!existing) {
    throw new Error(`SWOT Analysis ${args.entityId} not found`);
  }

  const updated: SwotAnalysis = {
    ...existing,
    name: args.name ?? existing.name,
    description: args.description ?? existing.description,
    context: args.context ?? existing.context,
    strengths: args.strengths ?? existing.strengths,
    weaknesses: args.weaknesses ?? existing.weaknesses,
    opportunities: args.opportunities ?? existing.opportunities,
    threats: args.threats ?? existing.threats,
  };

  return updateEntity(updated);
}

export async function getSwotAnalysis(entityId: string): Promise<SwotAnalysis | null> {
  return getEntity<SwotAnalysis>(entityId);
}

export async function listSwotAnalyses(projectId: string): Promise<SwotAnalysis[]> {
  const entities = await listEntitiesByType(projectId, "swot-analysis");
  return entities as SwotAnalysis[];
}
