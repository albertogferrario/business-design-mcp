import { describe, it, expect } from "vitest";
import {
  createProject,
  getProject,
  updateProject,
  deleteProject,
  listProjects,
  deleteEntityTool,
  exportProject,
  listProjectEntities,
} from "./project.js";
import { createSwotAnalysis } from "./swot.js";
import { createBusinessModelCanvas } from "./canvas.js";
import { linkEntitiesTool } from "./linking.js";

describe("Project Management Tools", () => {
  describe("createProject", () => {
    it("should create a project with all fields", async () => {
      const result = await createProject({
        name: "Test Project",
        description: "A test project",
        tags: ["test", "demo"],
      });

      expect(result.id).toBeDefined();
      expect(result.name).toBe("Test Project");
      expect(result.description).toBe("A test project");
      expect(result.tags).toEqual(["test", "demo"]);
    });

    it("should create a project with minimal fields", async () => {
      const result = await createProject({ name: "Minimal" });

      expect(result.name).toBe("Minimal");
      expect(result.description).toBeUndefined();
    });
  });

  describe("getProject", () => {
    it("should get a project with its entities", async () => {
      const project = await createProject({ name: "Test Project" });

      await createSwotAnalysis({
        projectId: project.id,
        name: "Test SWOT",
        strengths: [{ item: "Test" }],
        weaknesses: [{ item: "Test" }],
        opportunities: [{ item: "Test" }],
        threats: [{ item: "Test" }],
      });

      const result = await getProject({ projectId: project.id });

      expect(result).not.toBeNull();
      expect(result?.project.name).toBe("Test Project");
      expect(result?.entities).toHaveLength(1);
    });

    it("should return null for non-existent project", async () => {
      const result = await getProject({ projectId: "non-existent" });
      expect(result).toBeNull();
    });
  });

  describe("updateProject", () => {
    it("should update project fields", async () => {
      const project = await createProject({ name: "Original" });

      const result = await updateProject({
        projectId: project.id,
        name: "Updated",
        description: "New description",
        tags: ["new", "tags"],
      });

      expect(result.name).toBe("Updated");
      expect(result.description).toBe("New description");
      expect(result.tags).toEqual(["new", "tags"]);
    });

    it("should throw for non-existent project", async () => {
      await expect(
        updateProject({
          projectId: "non-existent",
          name: "Test",
        })
      ).rejects.toThrow("Project non-existent not found");
    });
  });

  describe("deleteProject", () => {
    it("should delete a project and return success", async () => {
      const project = await createProject({ name: "To Delete" });

      const result = await deleteProject({ projectId: project.id });

      expect(result.success).toBe(true);
      expect(result.message).toContain("deleted");
    });

    it("should return failure for non-existent project", async () => {
      const result = await deleteProject({ projectId: "non-existent" });

      expect(result.success).toBe(false);
      expect(result.message).toContain("not found");
    });
  });

  describe("listProjects", () => {
    it("should list all projects", async () => {
      await createProject({ name: "Project 1" });
      await createProject({ name: "Project 2" });
      await createProject({ name: "Project 3" });

      const result = await listProjects();

      expect(result).toHaveLength(3);
    });
  });

  describe("deleteEntityTool", () => {
    it("should delete an entity", async () => {
      const project = await createProject({ name: "Test" });
      const entity = await createSwotAnalysis({
        projectId: project.id,
        name: "Test SWOT",
        strengths: [{ item: "Test" }],
        weaknesses: [{ item: "Test" }],
        opportunities: [{ item: "Test" }],
        threats: [{ item: "Test" }],
      });

      const result = await deleteEntityTool({ entityId: entity.id });

      expect(result.success).toBe(true);
    });

    it("should return failure for non-existent entity", async () => {
      const result = await deleteEntityTool({ entityId: "non-existent" });

      expect(result.success).toBe(false);
    });
  });

  describe("exportProject", () => {
    it("should export to JSON", async () => {
      const project = await createProject({ name: "Export Test" });
      await createSwotAnalysis({
        projectId: project.id,
        name: "Test SWOT",
        strengths: [{ item: "Test" }],
        weaknesses: [{ item: "Test" }],
        opportunities: [{ item: "Test" }],
        threats: [{ item: "Test" }],
      });

      const result = await exportProject({
        projectId: project.id,
        format: "json",
      });

      const parsed = JSON.parse(result);
      expect(parsed.project.name).toBe("Export Test");
      expect(parsed.entities).toHaveLength(1);
    });

    it("should export to Markdown", async () => {
      const project = await createProject({ name: "Export Test" });
      await createSwotAnalysis({
        projectId: project.id,
        name: "Test SWOT",
        strengths: [{ item: "Strength item" }],
        weaknesses: [{ item: "Test" }],
        opportunities: [{ item: "Test" }],
        threats: [{ item: "Test" }],
      });

      const result = await exportProject({
        projectId: project.id,
        format: "markdown",
      });

      expect(result).toContain("# Export Test");
      expect(result).toContain("## SWOT Analysis: Test SWOT");
      expect(result).toContain("Strength item");
    });

    it("should include linkedEntityDetails with resolved names in JSON export", async () => {
      const project = await createProject({ name: "Linked Export Test" });
      const swot = await createSwotAnalysis({
        projectId: project.id,
        name: "My SWOT",
        strengths: [{ item: "Test" }],
        weaknesses: [{ item: "Test" }],
        opportunities: [{ item: "Test" }],
        threats: [{ item: "Test" }],
      });
      const bmc = await createBusinessModelCanvas({
        projectId: project.id,
        name: "My Canvas",
        customerSegments: [{ segment: "Test" }],
        valuePropositions: [{ proposition: "Test" }],
        channels: [{ channel: "Test" }],
        customerRelationships: [{ relationship: "Test" }],
        revenueStreams: [{ stream: "Test" }],
        keyResources: [{ resource: "Test" }],
        keyActivities: [{ activity: "Test" }],
        keyPartnerships: [{ partner: "Test" }],
        costStructure: [{ cost: "Test" }],
      });

      // Link SWOT to BMC
      await linkEntitiesTool({
        sourceEntityId: swot.id,
        targetEntityId: bmc.id,
        relationship: "informs",
      });

      const result = await exportProject({
        projectId: project.id,
        format: "json",
      });

      const parsed = JSON.parse(result);
      const linkedSwot = parsed.entities.find((e: { name: string }) => e.name === "My SWOT");
      expect(linkedSwot.linkedEntityDetails).toBeDefined();
      expect(linkedSwot.linkedEntityDetails).toHaveLength(1);
      expect(linkedSwot.linkedEntityDetails[0].name).toBe("My Canvas");
      expect(linkedSwot.linkedEntityDetails[0].relationship).toBe("informs");
    });

    it("should show Linked Entities section in markdown export", async () => {
      const project = await createProject({ name: "Linked Markdown Test" });
      const swot = await createSwotAnalysis({
        projectId: project.id,
        name: "Analysis SWOT",
        strengths: [{ item: "Test" }],
        weaknesses: [{ item: "Test" }],
        opportunities: [{ item: "Test" }],
        threats: [{ item: "Test" }],
      });
      const bmc = await createBusinessModelCanvas({
        projectId: project.id,
        name: "Target Canvas",
        customerSegments: [{ segment: "Test" }],
        valuePropositions: [{ proposition: "Test" }],
        channels: [{ channel: "Test" }],
        customerRelationships: [{ relationship: "Test" }],
        revenueStreams: [{ stream: "Test" }],
        keyResources: [{ resource: "Test" }],
        keyActivities: [{ activity: "Test" }],
        keyPartnerships: [{ partner: "Test" }],
        costStructure: [{ cost: "Test" }],
      });

      // Link SWOT to BMC
      await linkEntitiesTool({
        sourceEntityId: swot.id,
        targetEntityId: bmc.id,
        relationship: "validates",
      });

      const result = await exportProject({
        projectId: project.id,
        format: "markdown",
      });

      expect(result).toContain("### Linked Entities");
      expect(result).toContain("**Business Model Canvas**: Target Canvas (validates)");
    });

    it("should include Relationships Overview section in markdown export", async () => {
      const project = await createProject({ name: "Overview Test" });
      const swot = await createSwotAnalysis({
        projectId: project.id,
        name: "Source SWOT",
        strengths: [{ item: "Test" }],
        weaknesses: [{ item: "Test" }],
        opportunities: [{ item: "Test" }],
        threats: [{ item: "Test" }],
      });
      const bmc = await createBusinessModelCanvas({
        projectId: project.id,
        name: "Dest Canvas",
        customerSegments: [{ segment: "Test" }],
        valuePropositions: [{ proposition: "Test" }],
        channels: [{ channel: "Test" }],
        customerRelationships: [{ relationship: "Test" }],
        revenueStreams: [{ stream: "Test" }],
        keyResources: [{ resource: "Test" }],
        keyActivities: [{ activity: "Test" }],
        keyPartnerships: [{ partner: "Test" }],
        costStructure: [{ cost: "Test" }],
      });

      await linkEntitiesTool({
        sourceEntityId: swot.id,
        targetEntityId: bmc.id,
        relationship: "supports",
      });

      const result = await exportProject({
        projectId: project.id,
        format: "markdown",
      });

      expect(result).toContain("## Relationships Overview");
      expect(result).toContain("Source SWOT → Dest Canvas (supports)");
    });

    it("should handle entities with no links gracefully", async () => {
      const project = await createProject({ name: "No Links Test" });
      await createSwotAnalysis({
        projectId: project.id,
        name: "Standalone SWOT",
        strengths: [{ item: "Test" }],
        weaknesses: [{ item: "Test" }],
        opportunities: [{ item: "Test" }],
        threats: [{ item: "Test" }],
      });

      const jsonResult = await exportProject({
        projectId: project.id,
        format: "json",
      });

      const parsed = JSON.parse(jsonResult);
      expect(parsed.entities[0].linkedEntityDetails).toBeUndefined();

      const mdResult = await exportProject({
        projectId: project.id,
        format: "markdown",
      });

      expect(mdResult).toContain("## Relationships Overview");
      expect(mdResult).toContain("No entity relationships defined.");
      expect(mdResult).not.toContain("### Linked Entities");
    });
  });

  describe("listProjectEntities", () => {
    it("should list all entities in a project", async () => {
      const project = await createProject({ name: "Test" });

      await createSwotAnalysis({
        projectId: project.id,
        name: "SWOT",
        strengths: [{ item: "Test" }],
        weaknesses: [{ item: "Test" }],
        opportunities: [{ item: "Test" }],
        threats: [{ item: "Test" }],
      });

      await createBusinessModelCanvas({
        projectId: project.id,
        name: "BMC",
        customerSegments: [{ segment: "Test" }],
        valuePropositions: [{ proposition: "Test" }],
        channels: [{ channel: "Test" }],
        customerRelationships: [{ relationship: "Test" }],
        revenueStreams: [{ stream: "Test" }],
        keyResources: [{ resource: "Test" }],
        keyActivities: [{ activity: "Test" }],
        keyPartnerships: [{ partner: "Test" }],
        costStructure: [{ cost: "Test" }],
      });

      const result = await listProjectEntities({ projectId: project.id });

      expect(result).toHaveLength(2);
    });

    it("should filter by type", async () => {
      const project = await createProject({ name: "Test" });

      await createSwotAnalysis({
        projectId: project.id,
        name: "SWOT",
        strengths: [{ item: "Test" }],
        weaknesses: [{ item: "Test" }],
        opportunities: [{ item: "Test" }],
        threats: [{ item: "Test" }],
      });

      await createBusinessModelCanvas({
        projectId: project.id,
        name: "BMC",
        customerSegments: [{ segment: "Test" }],
        valuePropositions: [{ proposition: "Test" }],
        channels: [{ channel: "Test" }],
        customerRelationships: [{ relationship: "Test" }],
        revenueStreams: [{ stream: "Test" }],
        keyResources: [{ resource: "Test" }],
        keyActivities: [{ activity: "Test" }],
        keyPartnerships: [{ partner: "Test" }],
        costStructure: [{ cost: "Test" }],
      });

      const swotOnly = await listProjectEntities({
        projectId: project.id,
        type: "swot-analysis",
      });

      expect(swotOnly).toHaveLength(1);
      expect(swotOnly[0].type).toBe("swot-analysis");
    });
  });
});
