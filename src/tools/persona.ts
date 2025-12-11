import { z } from "zod";
import { createEntity, getEntity, updateEntity, listEntitiesByType } from "../storage/index.js";
import type { UserPersona } from "../schemas/index.js";

export const createUserPersonaSchema = z.object({
  projectId: z.string().describe("The project ID to add this persona to"),
  name: z.string().describe("Name for this persona (e.g., 'Tech-Savvy Sarah')"),

  demographics: z
    .object({
      age: z.string().optional().describe("Age or age range"),
      gender: z.string().optional().describe("Gender"),
      location: z.string().optional().describe("Location or region"),
      occupation: z.string().optional().describe("Job title or profession"),
      income: z.string().optional().describe("Income level or range"),
      education: z.string().optional().describe("Education level"),
      familyStatus: z.string().optional().describe("Family situation"),
    })
    .describe("Demographic information"),

  psychographics: z
    .object({
      personality: z.array(z.string()).optional().describe("Personality traits"),
      values: z.array(z.string()).optional().describe("Core values"),
      interests: z.array(z.string()).optional().describe("Hobbies and interests"),
      lifestyle: z.string().optional().describe("Lifestyle description"),
    })
    .optional()
    .describe("Psychological characteristics"),

  behavior: z
    .object({
      goals: z.array(z.string()).describe("What does this persona want to achieve?"),
      frustrations: z.array(z.string()).describe("What frustrates this persona?"),
      motivations: z.array(z.string()).describe("What motivates this persona?"),
      preferredChannels: z.array(z.string()).optional().describe("Preferred communication channels"),
      buyingBehavior: z.string().optional().describe("How do they make purchasing decisions?"),
    })
    .describe("Behavioral patterns"),

  quote: z.string().optional().describe("A characteristic quote that captures this persona"),
  bio: z.string().optional().describe("A brief bio or story about this persona"),
  scenario: z.string().optional().describe("A typical usage scenario for this persona"),
});

export async function createUserPersona(
  args: z.infer<typeof createUserPersonaSchema>
): Promise<UserPersona> {
  const persona = await createEntity<UserPersona>(args.projectId, {
    type: "user-persona",
    name: args.name,
    demographics: args.demographics,
    psychographics: args.psychographics ?? {},
    behavior: args.behavior,
    quote: args.quote,
    bio: args.bio,
    scenario: args.scenario,
  });

  return persona;
}

export const updateUserPersonaSchema = z.object({
  entityId: z.string().describe("The persona ID to update"),
  name: z.string().optional(),
  demographics: createUserPersonaSchema.shape.demographics.optional(),
  psychographics: createUserPersonaSchema.shape.psychographics.optional(),
  behavior: createUserPersonaSchema.shape.behavior.optional(),
  quote: z.string().optional(),
  bio: z.string().optional(),
  scenario: z.string().optional(),
});

export async function updateUserPersona(
  args: z.infer<typeof updateUserPersonaSchema>
): Promise<UserPersona> {
  const existing = await getEntity<UserPersona>(args.entityId);
  if (!existing) {
    throw new Error(`User Persona ${args.entityId} not found`);
  }

  const updated: UserPersona = {
    ...existing,
    name: args.name ?? existing.name,
    demographics: args.demographics ?? existing.demographics,
    psychographics: args.psychographics ?? existing.psychographics,
    behavior: args.behavior ?? existing.behavior,
    quote: args.quote ?? existing.quote,
    bio: args.bio ?? existing.bio,
    scenario: args.scenario ?? existing.scenario,
  };

  return updateEntity(updated);
}

export async function getUserPersona(entityId: string): Promise<UserPersona | null> {
  return getEntity<UserPersona>(entityId);
}

export async function listUserPersonas(projectId: string): Promise<UserPersona[]> {
  const entities = await listEntitiesByType(projectId, "user-persona");
  return entities as UserPersona[];
}
