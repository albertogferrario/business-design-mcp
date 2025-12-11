import { z } from "zod";
import { createEntity, getEntity, updateEntity, listEntitiesByType } from "../storage/index.js";
import type { MarketSizing } from "../schemas/index.js";

export const createMarketSizingSchema = z.object({
  projectId: z.string().describe("The project ID to add this analysis to"),
  name: z.string().describe("Name for this market sizing analysis"),
  description: z.string().optional().describe("Optional description or context"),

  tam: z
    .object({
      value: z.number().describe("Total Addressable Market value"),
      currency: z.string().default("USD").describe("Currency (default: USD)"),
      unit: z.enum(["annual", "monthly"]).default("annual").describe("Time unit"),
      methodology: z.string().optional().describe("How did you calculate this?"),
      sources: z.array(z.string()).optional().describe("Data sources"),
      assumptions: z.array(z.string()).optional().describe("Key assumptions"),
    })
    .describe("TAM - Total Addressable Market: Total market demand for your product/service"),

  sam: z
    .object({
      value: z.number().describe("Serviceable Addressable Market value"),
      currency: z.string().default("USD").describe("Currency (default: USD)"),
      unit: z.enum(["annual", "monthly"]).default("annual").describe("Time unit"),
      constraints: z.array(z.string()).optional().describe("What limits your serviceable market?"),
      targetSegments: z.array(z.string()).optional().describe("Which segments can you serve?"),
    })
    .describe("SAM - Serviceable Addressable Market: Portion of TAM you can realistically serve"),

  som: z
    .object({
      value: z.number().describe("Serviceable Obtainable Market value"),
      currency: z.string().default("USD").describe("Currency (default: USD)"),
      unit: z.enum(["annual", "monthly"]).default("annual").describe("Time unit"),
      timeframe: z.string().optional().describe("Over what period?"),
      captureStrategy: z.string().optional().describe("How will you capture this market?"),
      assumptions: z.array(z.string()).optional().describe("Key assumptions"),
    })
    .describe("SOM - Serviceable Obtainable Market: Realistic portion you can capture"),

  growthRate: z
    .object({
      rate: z.number().describe("Growth rate percentage"),
      period: z.string().describe("Time period (e.g., 'annual', '5-year CAGR')"),
      drivers: z.array(z.string()).optional().describe("What drives this growth?"),
    })
    .optional()
    .describe("Market growth rate"),
});

export async function createMarketSizing(
  args: z.infer<typeof createMarketSizingSchema>
): Promise<MarketSizing> {
  const sizing = await createEntity<MarketSizing>(args.projectId, {
    type: "market-sizing",
    name: args.name,
    description: args.description,
    tam: args.tam,
    sam: args.sam,
    som: args.som,
    growthRate: args.growthRate,
  });

  return sizing;
}

export const updateMarketSizingSchema = z.object({
  entityId: z.string().describe("The analysis ID to update"),
  name: z.string().optional(),
  description: z.string().optional(),
  tam: createMarketSizingSchema.shape.tam.optional(),
  sam: createMarketSizingSchema.shape.sam.optional(),
  som: createMarketSizingSchema.shape.som.optional(),
  growthRate: createMarketSizingSchema.shape.growthRate.optional(),
});

export async function updateMarketSizing(
  args: z.infer<typeof updateMarketSizingSchema>
): Promise<MarketSizing> {
  const existing = await getEntity<MarketSizing>(args.entityId);
  if (!existing) {
    throw new Error(`Market Sizing ${args.entityId} not found`);
  }

  const updated: MarketSizing = {
    ...existing,
    name: args.name ?? existing.name,
    description: args.description ?? existing.description,
    tam: args.tam ?? existing.tam,
    sam: args.sam ?? existing.sam,
    som: args.som ?? existing.som,
    growthRate: args.growthRate ?? existing.growthRate,
  };

  return updateEntity(updated);
}

export async function getMarketSizing(entityId: string): Promise<MarketSizing | null> {
  return getEntity<MarketSizing>(entityId);
}

export async function listMarketSizings(projectId: string): Promise<MarketSizing[]> {
  const entities = await listEntitiesByType(projectId, "market-sizing");
  return entities as MarketSizing[];
}
