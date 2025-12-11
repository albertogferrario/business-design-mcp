import { z } from "zod";
import { createEntity, getEntity, updateEntity, listEntitiesByType } from "../storage/index.js";
import type { CompetitiveAnalysis } from "../schemas/index.js";

export const createCompetitiveAnalysisSchema = z.object({
  projectId: z.string().describe("The project ID to add this analysis to"),
  name: z.string().describe("Name for this competitive analysis"),
  description: z.string().optional().describe("Optional description or context"),

  competitors: z
    .array(
      z.object({
        name: z.string().describe("Competitor name"),
        website: z.string().optional().describe("Competitor website"),
        description: z.string().optional().describe("Brief description"),
        strengths: z.array(z.string()).describe("Competitor strengths"),
        weaknesses: z.array(z.string()).describe("Competitor weaknesses"),
        pricing: z
          .object({
            model: z.string().optional().describe("Pricing model"),
            range: z.string().optional().describe("Price range"),
          })
          .optional()
          .describe("Pricing information"),
        marketShare: z.string().optional().describe("Estimated market share"),
        targetAudience: z.string().optional().describe("Target audience"),
        features: z
          .array(
            z.object({
              feature: z.string().describe("Feature name"),
              rating: z
                .enum(["strong", "moderate", "weak", "absent"])
                .optional()
                .describe("How well they do this"),
            })
          )
          .optional()
          .describe("Feature comparison"),
      })
    )
    .describe("List of competitors to analyze"),

  comparisonMatrix: z
    .array(
      z.object({
        criterion: z.string().describe("Comparison criterion"),
        weight: z.number().optional().describe("Importance weight (0-1)"),
        scores: z.record(z.string(), z.number()).optional().describe("Competitor scores"),
      })
    )
    .optional()
    .describe("Weighted comparison matrix"),

  ourPosition: z
    .object({
      differentiators: z.array(z.string()).describe("Our key differentiators"),
      gaps: z.array(z.string()).describe("Gaps we need to address"),
      opportunities: z.array(z.string()).describe("Market opportunities"),
    })
    .optional()
    .describe("Our competitive position"),
});

export async function createCompetitiveAnalysis(
  args: z.infer<typeof createCompetitiveAnalysisSchema>
): Promise<CompetitiveAnalysis> {
  const analysis = await createEntity<CompetitiveAnalysis>(args.projectId, {
    type: "competitive-analysis",
    name: args.name,
    description: args.description,
    competitors: args.competitors,
    comparisonMatrix: args.comparisonMatrix,
    ourPosition: args.ourPosition,
  });

  return analysis;
}

export const updateCompetitiveAnalysisSchema = z.object({
  entityId: z.string().describe("The analysis ID to update"),
  name: z.string().optional(),
  description: z.string().optional(),
  competitors: createCompetitiveAnalysisSchema.shape.competitors.optional(),
  comparisonMatrix: createCompetitiveAnalysisSchema.shape.comparisonMatrix.optional(),
  ourPosition: createCompetitiveAnalysisSchema.shape.ourPosition.optional(),
});

export async function updateCompetitiveAnalysis(
  args: z.infer<typeof updateCompetitiveAnalysisSchema>
): Promise<CompetitiveAnalysis> {
  const existing = await getEntity<CompetitiveAnalysis>(args.entityId);
  if (!existing) {
    throw new Error(`Competitive Analysis ${args.entityId} not found`);
  }

  const updated: CompetitiveAnalysis = {
    ...existing,
    name: args.name ?? existing.name,
    description: args.description ?? existing.description,
    competitors: args.competitors ?? existing.competitors,
    comparisonMatrix: args.comparisonMatrix ?? existing.comparisonMatrix,
    ourPosition: args.ourPosition ?? existing.ourPosition,
  };

  return updateEntity(updated);
}

export async function getCompetitiveAnalysis(entityId: string): Promise<CompetitiveAnalysis | null> {
  return getEntity<CompetitiveAnalysis>(entityId);
}

export async function listCompetitiveAnalyses(projectId: string): Promise<CompetitiveAnalysis[]> {
  const entities = await listEntitiesByType(projectId, "competitive-analysis");
  return entities as CompetitiveAnalysis[];
}
