import { describe, it, expect } from "vitest";
import {
  createProject,
  getProject,
  updateProject,
  deleteProject,
  listProjects,
  createEntity,
  getEntity,
  updateEntity,
  deleteEntity,
  listEntitiesByProject,
  listEntitiesByType,
  exportProjectToJson,
  exportProjectToMarkdown,
} from "./index.js";
import type { BusinessModelCanvas, SwotAnalysis } from "../schemas/index.js";

describe("Storage Layer", () => {
  describe("Project Operations", () => {
    it("should create a project", async () => {
      const project = await createProject("Test Project", "A test project", ["test", "demo"]);

      expect(project).toBeDefined();
      expect(project.id).toBeDefined();
      expect(project.name).toBe("Test Project");
      expect(project.description).toBe("A test project");
      expect(project.tags).toEqual(["test", "demo"]);
      expect(project.entities).toEqual([]);
      expect(project.createdAt).toBeDefined();
      expect(project.updatedAt).toBeDefined();
    });

    it("should create a project without optional fields", async () => {
      const project = await createProject("Minimal Project");

      expect(project.name).toBe("Minimal Project");
      expect(project.description).toBeUndefined();
      expect(project.tags).toBeUndefined();
    });

    it("should get an existing project", async () => {
      const created = await createProject("Test Project");
      const retrieved = await getProject(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.name).toBe("Test Project");
    });

    it("should return null for non-existent project", async () => {
      const result = await getProject("non-existent-id");
      expect(result).toBeNull();
    });

    it("should update a project", async () => {
      const created = await createProject("Original Name");
      const updated = await updateProject({
        ...created,
        name: "Updated Name",
        description: "New description",
      });

      expect(updated.name).toBe("Updated Name");
      expect(updated.description).toBe("New description");
      expect(new Date(updated.updatedAt).getTime()).toBeGreaterThan(
        new Date(created.updatedAt).getTime()
      );
    });

    it("should delete a project", async () => {
      const created = await createProject("To Delete");
      const deleted = await deleteProject(created.id);

      expect(deleted).toBe(true);

      const retrieved = await getProject(created.id);
      expect(retrieved).toBeNull();
    });

    it("should return false when deleting non-existent project", async () => {
      const result = await deleteProject("non-existent-id");
      expect(result).toBe(false);
    });

    it("should list all projects", async () => {
      await createProject("Project 1");
      await createProject("Project 2");
      await createProject("Project 3");

      const projects = await listProjects();

      expect(projects).toHaveLength(3);
    });

    it("should list projects sorted by updated date (newest first)", async () => {
      const p1 = await createProject("Project 1");
      await createProject("Project 2");
      await updateProject({ ...p1, name: "Project 1 Updated" });

      const projects = await listProjects();

      expect(projects[0].name).toBe("Project 1 Updated");
    });
  });

  describe("Entity Operations", () => {
    it("should create an entity within a project", async () => {
      const project = await createProject("Test Project");

      const entity = await createEntity<SwotAnalysis>(project.id, {
        type: "swot-analysis",
        name: "Test SWOT",
        strengths: [{ item: "Strong team" }],
        weaknesses: [{ item: "Limited budget" }],
        opportunities: [{ item: "Growing market" }],
        threats: [{ item: "Competition" }],
      });

      expect(entity.id).toBeDefined();
      expect(entity.projectId).toBe(project.id);
      expect(entity.type).toBe("swot-analysis");
      expect(entity.name).toBe("Test SWOT");
    });

    it("should add entity reference to project", async () => {
      const project = await createProject("Test Project");

      await createEntity<SwotAnalysis>(project.id, {
        type: "swot-analysis",
        name: "Test SWOT",
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: [],
      });

      const updatedProject = await getProject(project.id);
      expect(updatedProject?.entities).toHaveLength(1);
      expect(updatedProject?.entities[0].type).toBe("swot-analysis");
    });

    it("should throw when creating entity for non-existent project", async () => {
      await expect(
        createEntity<SwotAnalysis>("non-existent", {
          type: "swot-analysis",
          name: "Test",
          strengths: [],
          weaknesses: [],
          opportunities: [],
          threats: [],
        })
      ).rejects.toThrow("Project non-existent not found");
    });

    it("should get an existing entity", async () => {
      const project = await createProject("Test Project");
      const created = await createEntity<SwotAnalysis>(project.id, {
        type: "swot-analysis",
        name: "Test SWOT",
        strengths: [{ item: "Test" }],
        weaknesses: [],
        opportunities: [],
        threats: [],
      });

      const retrieved = await getEntity<SwotAnalysis>(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.strengths).toHaveLength(1);
    });

    it("should return null for non-existent entity", async () => {
      const result = await getEntity("non-existent");
      expect(result).toBeNull();
    });

    it("should update an entity", async () => {
      const project = await createProject("Test Project");
      const created = await createEntity<SwotAnalysis>(project.id, {
        type: "swot-analysis",
        name: "Original",
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: [],
      });

      const updated = await updateEntity({
        ...created,
        name: "Updated",
        strengths: [{ item: "New strength" }],
      });

      expect(updated.name).toBe("Updated");
      expect(updated.strengths).toHaveLength(1);
    });

    it("should delete an entity", async () => {
      const project = await createProject("Test Project");
      const entity = await createEntity<SwotAnalysis>(project.id, {
        type: "swot-analysis",
        name: "To Delete",
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: [],
      });

      const deleted = await deleteEntity(entity.id);
      expect(deleted).toBe(true);

      const retrieved = await getEntity(entity.id);
      expect(retrieved).toBeNull();

      const updatedProject = await getProject(project.id);
      expect(updatedProject?.entities).toHaveLength(0);
    });

    it("should delete entities when project is deleted", async () => {
      const project = await createProject("Test Project");
      const entity = await createEntity<SwotAnalysis>(project.id, {
        type: "swot-analysis",
        name: "Test",
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: [],
      });

      await deleteProject(project.id);

      const retrieved = await getEntity(entity.id);
      expect(retrieved).toBeNull();
    });

    it("should list entities by project", async () => {
      const project = await createProject("Test Project");

      await createEntity<SwotAnalysis>(project.id, {
        type: "swot-analysis",
        name: "SWOT 1",
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: [],
      });

      await createEntity<SwotAnalysis>(project.id, {
        type: "swot-analysis",
        name: "SWOT 2",
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: [],
      });

      const entities = await listEntitiesByProject(project.id);
      expect(entities).toHaveLength(2);
    });

    it("should list entities by type", async () => {
      const project = await createProject("Test Project");

      await createEntity<SwotAnalysis>(project.id, {
        type: "swot-analysis",
        name: "SWOT",
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: [],
      });

      await createEntity<BusinessModelCanvas>(project.id, {
        type: "business-model-canvas",
        name: "BMC",
        customerSegments: [],
        valuePropositions: [],
        channels: [],
        customerRelationships: [],
        revenueStreams: [],
        keyResources: [],
        keyActivities: [],
        keyPartnerships: [],
        costStructure: [],
      });

      const swotEntities = await listEntitiesByType(project.id, "swot-analysis");
      expect(swotEntities).toHaveLength(1);
      expect(swotEntities[0].type).toBe("swot-analysis");
    });
  });

  describe("Export Operations", () => {
    it("should export project to JSON", async () => {
      const project = await createProject("Export Test", "Test description");
      await createEntity<SwotAnalysis>(project.id, {
        type: "swot-analysis",
        name: "Test SWOT",
        strengths: [{ item: "Strength 1" }],
        weaknesses: [],
        opportunities: [],
        threats: [],
      });

      const json = await exportProjectToJson(project.id);
      const parsed = JSON.parse(json);

      expect(parsed.project.name).toBe("Export Test");
      expect(parsed.entities).toHaveLength(1);
      expect(parsed.entities[0].type).toBe("swot-analysis");
    });

    it("should export project to Markdown", async () => {
      const project = await createProject("Export Test", "Test description");
      await createEntity<SwotAnalysis>(project.id, {
        type: "swot-analysis",
        name: "Test SWOT",
        strengths: [{ item: "Strength 1", impact: "high" }],
        weaknesses: [{ item: "Weakness 1" }],
        opportunities: [{ item: "Opportunity 1" }],
        threats: [{ item: "Threat 1" }],
      });

      const markdown = await exportProjectToMarkdown(project.id);

      expect(markdown).toContain("# Export Test");
      expect(markdown).toContain("Test description");
      expect(markdown).toContain("## SWOT Analysis: Test SWOT");
      expect(markdown).toContain("### Strengths");
      expect(markdown).toContain("Strength 1");
    });

    it("should throw when exporting non-existent project", async () => {
      await expect(exportProjectToJson("non-existent")).rejects.toThrow(
        "Project non-existent not found"
      );
    });
  });
});
