import { describe, it, expect, beforeEach } from "vitest";
import {
  linkEntitiesTool,
  unlinkEntitiesTool,
  getLinkedEntitiesTool,
} from "./linking.js";
import { createProject, createEntity, getEntity } from "../storage/index.js";
import type { SwotAnalysis, UserPersona } from "../schemas/index.js";

describe("Entity Linking Tools", () => {
  let projectId: string;
  let swotId: string;
  let personaId: string;

  beforeEach(async () => {
    const project = await createProject("Test Project");
    projectId = project.id;

    const swot = await createEntity<SwotAnalysis>(projectId, {
      type: "swot-analysis",
      name: "Test SWOT",
      strengths: [{ item: "Strong team" }],
      weaknesses: [],
      opportunities: [],
      threats: [],
    });
    swotId = swot.id;

    const persona = await createEntity<UserPersona>(projectId, {
      type: "user-persona",
      name: "Test Persona",
      demographics: { age: "25-35" },
      psychographics: {},
      behavior: {
        goals: ["Save time"],
        frustrations: ["Complex tools"],
        motivations: ["Efficiency"],
      },
    });
    personaId = persona.id;
  });

  describe("linkEntitiesTool", () => {
    it("should link entities successfully", async () => {
      const result = await linkEntitiesTool({
        sourceEntityId: swotId,
        targetEntityId: personaId,
        relationship: "informs",
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe("Entities linked");

      const entity = await getEntity<SwotAnalysis>(swotId);
      expect(entity?.linkedEntities).toHaveLength(1);
      expect(entity?.linkedEntities?.[0].id).toBe(personaId);
    });

    it("should link entities without relationship", async () => {
      const result = await linkEntitiesTool({
        sourceEntityId: swotId,
        targetEntityId: personaId,
      });

      expect(result.success).toBe(true);

      const entity = await getEntity<SwotAnalysis>(swotId);
      expect(entity?.linkedEntities?.[0].relationship).toBeUndefined();
    });

    it("should return failure for duplicate links", async () => {
      await linkEntitiesTool({
        sourceEntityId: swotId,
        targetEntityId: personaId,
      });

      const result = await linkEntitiesTool({
        sourceEntityId: swotId,
        targetEntityId: personaId,
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe("Failed to link entities");
    });

    it("should throw for invalid source entity", async () => {
      await expect(
        linkEntitiesTool({
          sourceEntityId: "invalid-id",
          targetEntityId: personaId,
        })
      ).rejects.toThrow();
    });

    it("should throw for invalid target entity", async () => {
      await expect(
        linkEntitiesTool({
          sourceEntityId: swotId,
          targetEntityId: "invalid-id",
        })
      ).rejects.toThrow();
    });
  });

  describe("unlinkEntitiesTool", () => {
    it("should unlink entities successfully", async () => {
      await linkEntitiesTool({
        sourceEntityId: swotId,
        targetEntityId: personaId,
      });

      const result = await unlinkEntitiesTool({
        sourceEntityId: swotId,
        targetEntityId: personaId,
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe("Entities unlinked");

      const entity = await getEntity<SwotAnalysis>(swotId);
      expect(entity?.linkedEntities).toBeUndefined();
    });

    it("should return failure when link does not exist", async () => {
      const result = await unlinkEntitiesTool({
        sourceEntityId: swotId,
        targetEntityId: personaId,
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe("Failed to unlink entities");
    });

    it("should return failure for non-existent source entity", async () => {
      const result = await unlinkEntitiesTool({
        sourceEntityId: "invalid-id",
        targetEntityId: personaId,
      });

      expect(result.success).toBe(false);
    });
  });

  describe("getLinkedEntitiesTool", () => {
    it("should return linked entities with resolved data", async () => {
      await linkEntitiesTool({
        sourceEntityId: swotId,
        targetEntityId: personaId,
        relationship: "informs",
      });

      const result = await getLinkedEntitiesTool({ entityId: swotId });

      expect(result).toHaveLength(1);
      expect(result[0].entity.id).toBe(personaId);
      expect(result[0].entity.type).toBe("user-persona");
      expect((result[0].entity as UserPersona).name).toBe("Test Persona");
      expect(result[0].relationship).toBe("informs");
    });

    it("should return empty array for entity with no links", async () => {
      const result = await getLinkedEntitiesTool({ entityId: swotId });

      expect(result).toHaveLength(0);
    });

    it("should return empty array for non-existent entity", async () => {
      const result = await getLinkedEntitiesTool({ entityId: "invalid-id" });

      expect(result).toHaveLength(0);
    });

    it("should return multiple linked entities", async () => {
      const persona2 = await createEntity<UserPersona>(projectId, {
        type: "user-persona",
        name: "Persona 2",
        demographics: {},
        psychographics: {},
        behavior: {
          goals: [],
          frustrations: [],
          motivations: [],
        },
      });

      await linkEntitiesTool({
        sourceEntityId: swotId,
        targetEntityId: personaId,
        relationship: "informs",
      });

      await linkEntitiesTool({
        sourceEntityId: swotId,
        targetEntityId: persona2.id,
        relationship: "validates",
      });

      const result = await getLinkedEntitiesTool({ entityId: swotId });

      expect(result).toHaveLength(2);
      expect(result.map((r) => r.entity.id)).toContain(personaId);
      expect(result.map((r) => r.entity.id)).toContain(persona2.id);
    });
  });
});
