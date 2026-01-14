import { z } from "zod";
import { linkEntities, unlinkEntities, getLinkedEntities } from "../storage/index.js";

export const linkEntitiesSchema = z.object({
  sourceEntityId: z.string().describe("The entity to add the link to"),
  targetEntityId: z.string().describe("The entity to link to"),
  relationship: z.string().optional().describe("Relationship type (e.g., 'informs', 'validates', 'supports')"),
});

export const unlinkEntitiesSchema = z.object({
  sourceEntityId: z.string().describe("The entity to remove the link from"),
  targetEntityId: z.string().describe("The entity to unlink"),
});

export const getLinkedEntitiesSchema = z.object({
  entityId: z.string().describe("The entity ID to get links for"),
});

export async function linkEntitiesTool(args: z.infer<typeof linkEntitiesSchema>) {
  const success = await linkEntities(args.sourceEntityId, args.targetEntityId, args.relationship);
  return { success, message: success ? "Entities linked" : "Failed to link entities" };
}

export async function unlinkEntitiesTool(args: z.infer<typeof unlinkEntitiesSchema>) {
  const success = await unlinkEntities(args.sourceEntityId, args.targetEntityId);
  return { success, message: success ? "Entities unlinked" : "Failed to unlink entities" };
}

export async function getLinkedEntitiesTool(args: z.infer<typeof getLinkedEntitiesSchema>) {
  return await getLinkedEntities(args.entityId);
}
