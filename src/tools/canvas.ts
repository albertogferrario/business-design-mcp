import { z } from "zod";
import { createEntity, getEntity, updateEntity, listEntitiesByType } from "../storage/index.js";
import type { BusinessModelCanvas } from "../schemas/index.js";

export const createBusinessModelCanvasSchema = z.object({
  projectId: z.string().describe("The project ID to add this canvas to"),
  name: z.string().describe("Name for this business model canvas"),
  description: z.string().optional().describe("Optional description of the business model"),

  customerSegments: z
    .array(
      z.object({
        segment: z.string().describe("Customer segment name"),
        characteristics: z.string().optional().describe("Key characteristics of this segment"),
        size: z.string().optional().describe("Estimated size of this segment"),
      })
    )
    .describe("Who are your most important customers?"),

  valuePropositions: z
    .array(
      z.object({
        proposition: z.string().describe("The value proposition"),
        customerPains: z.array(z.string()).optional().describe("Customer pains this addresses"),
        customerGains: z.array(z.string()).optional().describe("Customer gains this creates"),
      })
    )
    .describe("What value do you deliver to the customer?"),

  channels: z
    .array(
      z.object({
        channel: z.string().describe("Channel name"),
        phase: z
          .enum(["awareness", "evaluation", "purchase", "delivery", "after-sales"])
          .optional()
          .describe("Which phase of the customer journey"),
      })
    )
    .describe("How do you reach your customer segments?"),

  customerRelationships: z
    .array(
      z.object({
        relationship: z.string().describe("Type of relationship"),
        type: z
          .enum(["personal", "dedicated", "self-service", "automated", "communities", "co-creation"])
          .optional()
          .describe("Relationship category"),
      })
    )
    .describe("What type of relationship does each customer segment expect?"),

  revenueStreams: z
    .array(
      z.object({
        stream: z.string().describe("Revenue stream"),
        type: z
          .enum(["asset-sale", "usage-fee", "subscription", "licensing", "brokerage", "advertising"])
          .optional()
          .describe("Type of revenue"),
        pricing: z.string().optional().describe("Pricing mechanism or amount"),
      })
    )
    .describe("For what value are customers willing to pay?"),

  keyResources: z
    .array(
      z.object({
        resource: z.string().describe("Key resource"),
        type: z
          .enum(["physical", "intellectual", "human", "financial"])
          .optional()
          .describe("Type of resource"),
      })
    )
    .describe("What key resources do your value propositions require?"),

  keyActivities: z
    .array(
      z.object({
        activity: z.string().describe("Key activity"),
        type: z
          .enum(["production", "problem-solving", "platform"])
          .optional()
          .describe("Type of activity"),
      })
    )
    .describe("What key activities do your value propositions require?"),

  keyPartnerships: z
    .array(
      z.object({
        partner: z.string().describe("Partner name"),
        type: z
          .enum(["strategic-alliance", "coopetition", "joint-venture", "supplier"])
          .optional()
          .describe("Type of partnership"),
        motivation: z.string().optional().describe("Why this partnership"),
      })
    )
    .describe("Who are your key partners and suppliers?"),

  costStructure: z
    .array(
      z.object({
        cost: z.string().describe("Cost item"),
        type: z.enum(["fixed", "variable"]).optional().describe("Fixed or variable cost"),
        priority: z
          .enum(["cost-driven", "value-driven"])
          .optional()
          .describe("Cost vs value driven"),
      })
    )
    .describe("What are the most important costs in your business model?"),
});

export async function createBusinessModelCanvas(
  args: z.infer<typeof createBusinessModelCanvasSchema>
): Promise<BusinessModelCanvas> {
  const canvas = await createEntity<BusinessModelCanvas>(args.projectId, {
    type: "business-model-canvas",
    name: args.name,
    description: args.description,
    customerSegments: args.customerSegments,
    valuePropositions: args.valuePropositions,
    channels: args.channels,
    customerRelationships: args.customerRelationships,
    revenueStreams: args.revenueStreams,
    keyResources: args.keyResources,
    keyActivities: args.keyActivities,
    keyPartnerships: args.keyPartnerships,
    costStructure: args.costStructure,
  });

  return canvas;
}

export const updateBusinessModelCanvasSchema = z.object({
  entityId: z.string().describe("The canvas ID to update"),
  name: z.string().optional().describe("Updated name"),
  description: z.string().optional().describe("Updated description"),
  customerSegments: createBusinessModelCanvasSchema.shape.customerSegments.optional(),
  valuePropositions: createBusinessModelCanvasSchema.shape.valuePropositions.optional(),
  channels: createBusinessModelCanvasSchema.shape.channels.optional(),
  customerRelationships: createBusinessModelCanvasSchema.shape.customerRelationships.optional(),
  revenueStreams: createBusinessModelCanvasSchema.shape.revenueStreams.optional(),
  keyResources: createBusinessModelCanvasSchema.shape.keyResources.optional(),
  keyActivities: createBusinessModelCanvasSchema.shape.keyActivities.optional(),
  keyPartnerships: createBusinessModelCanvasSchema.shape.keyPartnerships.optional(),
  costStructure: createBusinessModelCanvasSchema.shape.costStructure.optional(),
});

export async function updateBusinessModelCanvas(
  args: z.infer<typeof updateBusinessModelCanvasSchema>
): Promise<BusinessModelCanvas> {
  const existing = await getEntity<BusinessModelCanvas>(args.entityId);
  if (!existing) {
    throw new Error(`Business Model Canvas ${args.entityId} not found`);
  }

  const updated: BusinessModelCanvas = {
    ...existing,
    name: args.name ?? existing.name,
    description: args.description ?? existing.description,
    customerSegments: args.customerSegments ?? existing.customerSegments,
    valuePropositions: args.valuePropositions ?? existing.valuePropositions,
    channels: args.channels ?? existing.channels,
    customerRelationships: args.customerRelationships ?? existing.customerRelationships,
    revenueStreams: args.revenueStreams ?? existing.revenueStreams,
    keyResources: args.keyResources ?? existing.keyResources,
    keyActivities: args.keyActivities ?? existing.keyActivities,
    keyPartnerships: args.keyPartnerships ?? existing.keyPartnerships,
    costStructure: args.costStructure ?? existing.costStructure,
  };

  return updateEntity(updated);
}

export async function getBusinessModelCanvas(entityId: string): Promise<BusinessModelCanvas | null> {
  return getEntity<BusinessModelCanvas>(entityId);
}

export async function listBusinessModelCanvases(projectId: string): Promise<BusinessModelCanvas[]> {
  const entities = await listEntitiesByType(projectId, "business-model-canvas");
  return entities as BusinessModelCanvas[];
}
