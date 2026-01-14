import { describe, it, expect } from "vitest";
import {
  createProject,
  createEntity,
  linkEntities,
  unlinkEntities,
  getLinkedEntities,
  getEntity,
  StorageError,
} from "./index.js";
import type { SwotAnalysis, UserPersona } from "../schemas/index.js";

describe("Entity Linking", () => {
  describe("linkEntities", () => {
    it("should link two entities successfully", async () => {
      const project = await createProject("Test Project");

      const swot = await createEntity<SwotAnalysis>(project.id, {
        type: "swot-analysis",
        name: "Test SWOT",
        strengths: [{ item: "Strong team" }],
        weaknesses: [],
        opportunities: [],
        threats: [],
      });

      const persona = await createEntity<UserPersona>(project.id, {
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

      const result = await linkEntities(swot.id, persona.id, "informs");

      expect(result).toBe(true);

      // Verify the link exists on the source entity
      const updatedSwot = await getEntity<SwotAnalysis>(swot.id);
      expect(updatedSwot?.linkedEntities).toHaveLength(1);
      expect(updatedSwot?.linkedEntities?.[0].id).toBe(persona.id);
      expect(updatedSwot?.linkedEntities?.[0].type).toBe("user-persona");
      expect(updatedSwot?.linkedEntities?.[0].relationship).toBe("informs");
    });

    it("should link entities without relationship", async () => {
      const project = await createProject("Test Project");

      const swot = await createEntity<SwotAnalysis>(project.id, {
        type: "swot-analysis",
        name: "Test SWOT",
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: [],
      });

      const persona = await createEntity<UserPersona>(project.id, {
        type: "user-persona",
        name: "Test Persona",
        demographics: {},
        psychographics: {},
        behavior: {
          goals: [],
          frustrations: [],
          motivations: [],
        },
      });

      const result = await linkEntities(swot.id, persona.id);

      expect(result).toBe(true);

      const updatedSwot = await getEntity<SwotAnalysis>(swot.id);
      expect(updatedSwot?.linkedEntities?.[0].relationship).toBeUndefined();
    });

    it("should prevent duplicate links", async () => {
      const project = await createProject("Test Project");

      const swot = await createEntity<SwotAnalysis>(project.id, {
        type: "swot-analysis",
        name: "Test SWOT",
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: [],
      });

      const persona = await createEntity<UserPersona>(project.id, {
        type: "user-persona",
        name: "Test Persona",
        demographics: {},
        psychographics: {},
        behavior: {
          goals: [],
          frustrations: [],
          motivations: [],
        },
      });

      // First link should succeed
      const first = await linkEntities(swot.id, persona.id, "informs");
      expect(first).toBe(true);

      // Second link should return false (duplicate)
      const second = await linkEntities(swot.id, persona.id, "validates");
      expect(second).toBe(false);

      // Should still only have one link
      const updatedSwot = await getEntity<SwotAnalysis>(swot.id);
      expect(updatedSwot?.linkedEntities).toHaveLength(1);
    });

    it("should throw when source entity does not exist", async () => {
      const project = await createProject("Test Project");

      const persona = await createEntity<UserPersona>(project.id, {
        type: "user-persona",
        name: "Test Persona",
        demographics: {},
        psychographics: {},
        behavior: {
          goals: [],
          frustrations: [],
          motivations: [],
        },
      });

      await expect(linkEntities("non-existent", persona.id)).rejects.toThrow(
        StorageError
      );
    });

    it("should throw when target entity does not exist", async () => {
      const project = await createProject("Test Project");

      const swot = await createEntity<SwotAnalysis>(project.id, {
        type: "swot-analysis",
        name: "Test SWOT",
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: [],
      });

      await expect(linkEntities(swot.id, "non-existent")).rejects.toThrow(
        StorageError
      );
    });

    it("should throw when linking entities from different projects", async () => {
      const project1 = await createProject("Project 1");
      const project2 = await createProject("Project 2");

      const swot = await createEntity<SwotAnalysis>(project1.id, {
        type: "swot-analysis",
        name: "Test SWOT",
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: [],
      });

      const persona = await createEntity<UserPersona>(project2.id, {
        type: "user-persona",
        name: "Test Persona",
        demographics: {},
        psychographics: {},
        behavior: {
          goals: [],
          frustrations: [],
          motivations: [],
        },
      });

      await expect(linkEntities(swot.id, persona.id)).rejects.toThrow(
        "Cannot link entities from different projects"
      );
    });
  });

  describe("unlinkEntities", () => {
    it("should unlink entities successfully", async () => {
      const project = await createProject("Test Project");

      const swot = await createEntity<SwotAnalysis>(project.id, {
        type: "swot-analysis",
        name: "Test SWOT",
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: [],
      });

      const persona = await createEntity<UserPersona>(project.id, {
        type: "user-persona",
        name: "Test Persona",
        demographics: {},
        psychographics: {},
        behavior: {
          goals: [],
          frustrations: [],
          motivations: [],
        },
      });

      await linkEntities(swot.id, persona.id, "informs");

      const result = await unlinkEntities(swot.id, persona.id);
      expect(result).toBe(true);

      const updatedSwot = await getEntity<SwotAnalysis>(swot.id);
      expect(updatedSwot?.linkedEntities).toBeUndefined();
    });

    it("should return false when link does not exist", async () => {
      const project = await createProject("Test Project");

      const swot = await createEntity<SwotAnalysis>(project.id, {
        type: "swot-analysis",
        name: "Test SWOT",
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: [],
      });

      const persona = await createEntity<UserPersona>(project.id, {
        type: "user-persona",
        name: "Test Persona",
        demographics: {},
        psychographics: {},
        behavior: {
          goals: [],
          frustrations: [],
          motivations: [],
        },
      });

      const result = await unlinkEntities(swot.id, persona.id);
      expect(result).toBe(false);
    });

    it("should return false when source entity does not exist", async () => {
      const project = await createProject("Test Project");

      const persona = await createEntity<UserPersona>(project.id, {
        type: "user-persona",
        name: "Test Persona",
        demographics: {},
        psychographics: {},
        behavior: {
          goals: [],
          frustrations: [],
          motivations: [],
        },
      });

      const result = await unlinkEntities("non-existent", persona.id);
      expect(result).toBe(false);
    });

    it("should keep other links when unlinking one", async () => {
      const project = await createProject("Test Project");

      const swot = await createEntity<SwotAnalysis>(project.id, {
        type: "swot-analysis",
        name: "Test SWOT",
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: [],
      });

      const persona1 = await createEntity<UserPersona>(project.id, {
        type: "user-persona",
        name: "Persona 1",
        demographics: {},
        psychographics: {},
        behavior: {
          goals: [],
          frustrations: [],
          motivations: [],
        },
      });

      const persona2 = await createEntity<UserPersona>(project.id, {
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

      await linkEntities(swot.id, persona1.id, "informs");
      await linkEntities(swot.id, persona2.id, "validates");

      await unlinkEntities(swot.id, persona1.id);

      const updatedSwot = await getEntity<SwotAnalysis>(swot.id);
      expect(updatedSwot?.linkedEntities).toHaveLength(1);
      expect(updatedSwot?.linkedEntities?.[0].id).toBe(persona2.id);
    });
  });

  describe("getLinkedEntities", () => {
    it("should return linked entities with resolved data", async () => {
      const project = await createProject("Test Project");

      const swot = await createEntity<SwotAnalysis>(project.id, {
        type: "swot-analysis",
        name: "Test SWOT",
        strengths: [{ item: "Strong team" }],
        weaknesses: [],
        opportunities: [],
        threats: [],
      });

      const persona = await createEntity<UserPersona>(project.id, {
        type: "user-persona",
        name: "Test Persona",
        demographics: { age: "25-35" },
        psychographics: {},
        behavior: {
          goals: ["Save time"],
          frustrations: [],
          motivations: [],
        },
      });

      await linkEntities(swot.id, persona.id, "informs");

      const linked = await getLinkedEntities(swot.id);

      expect(linked).toHaveLength(1);
      expect(linked[0].entity.id).toBe(persona.id);
      expect(linked[0].entity.type).toBe("user-persona");
      expect((linked[0].entity as UserPersona).name).toBe("Test Persona");
      expect(linked[0].relationship).toBe("informs");
    });

    it("should return empty array for entity with no links", async () => {
      const project = await createProject("Test Project");

      const swot = await createEntity<SwotAnalysis>(project.id, {
        type: "swot-analysis",
        name: "Test SWOT",
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: [],
      });

      const linked = await getLinkedEntities(swot.id);
      expect(linked).toHaveLength(0);
    });

    it("should return empty array for non-existent entity", async () => {
      const linked = await getLinkedEntities("non-existent");
      expect(linked).toHaveLength(0);
    });

    it("should handle deleted linked entities gracefully", async () => {
      const project = await createProject("Test Project");

      const swot = await createEntity<SwotAnalysis>(project.id, {
        type: "swot-analysis",
        name: "Test SWOT",
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: [],
      });

      const persona = await createEntity<UserPersona>(project.id, {
        type: "user-persona",
        name: "Test Persona",
        demographics: {},
        psychographics: {},
        behavior: {
          goals: [],
          frustrations: [],
          motivations: [],
        },
      });

      await linkEntities(swot.id, persona.id, "informs");

      // Manually delete the persona file to simulate orphaned link
      // We need to delete it directly without going through deleteEntity
      // to keep the link reference orphaned
      const { deleteEntity } = await import("./index.js");

      // Get linked entities before deletion - should have 1
      const linkedBefore = await getLinkedEntities(swot.id);
      expect(linkedBefore).toHaveLength(1);

      // Delete the persona
      await deleteEntity(persona.id);

      // Get linked entities after deletion - should handle gracefully
      const linkedAfter = await getLinkedEntities(swot.id);
      // The linked entity reference still exists but won't be resolved
      expect(linkedAfter).toHaveLength(0);
    });

    it("should return multiple linked entities", async () => {
      const project = await createProject("Test Project");

      const swot = await createEntity<SwotAnalysis>(project.id, {
        type: "swot-analysis",
        name: "Test SWOT",
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: [],
      });

      const persona1 = await createEntity<UserPersona>(project.id, {
        type: "user-persona",
        name: "Persona 1",
        demographics: {},
        psychographics: {},
        behavior: {
          goals: [],
          frustrations: [],
          motivations: [],
        },
      });

      const persona2 = await createEntity<UserPersona>(project.id, {
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

      await linkEntities(swot.id, persona1.id, "informs");
      await linkEntities(swot.id, persona2.id, "validates");

      const linked = await getLinkedEntities(swot.id);

      expect(linked).toHaveLength(2);
      expect(linked.map((l) => l.entity.id)).toContain(persona1.id);
      expect(linked.map((l) => l.entity.id)).toContain(persona2.id);
    });
  });
});
