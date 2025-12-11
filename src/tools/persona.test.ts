import { describe, it, expect, beforeEach } from "vitest";
import {
  createUserPersona,
  updateUserPersona,
  getUserPersona,
  listUserPersonas,
} from "./persona.js";
import { createProject } from "../storage/index.js";

describe("User Persona", () => {
  let projectId: string;

  beforeEach(async () => {
    const project = await createProject("Test Project");
    projectId = project.id;
  });

  it("should create a complete user persona", async () => {
    const persona = await createUserPersona({
      projectId,
      name: "Tech-Savvy Sarah",
      demographics: {
        age: "28-35",
        gender: "Female",
        location: "San Francisco Bay Area",
        occupation: "Product Manager",
        income: "$120k-150k",
        education: "MBA",
        familyStatus: "Married, no kids",
      },
      psychographics: {
        personality: ["Analytical", "Detail-oriented", "Early adopter"],
        values: ["Efficiency", "Innovation", "Work-life balance"],
        interests: ["Tech podcasts", "Productivity tools", "Yoga"],
        lifestyle: "Urban professional, health-conscious",
      },
      behavior: {
        goals: [
          "Ship products faster",
          "Reduce manual work",
          "Get promoted to Senior PM",
        ],
        frustrations: [
          "Too many meetings",
          "Data scattered across tools",
          "Slow approval processes",
        ],
        motivations: [
          "Career growth",
          "Making impact",
          "Learning new skills",
        ],
        preferredChannels: ["LinkedIn", "Product Hunt", "Twitter/X"],
        buyingBehavior: "Researches extensively, seeks peer recommendations",
      },
      quote: "I need tools that work as fast as I think",
      bio: "Sarah is a rising star PM at a Series B startup. She manages a team of 5 and is responsible for the core product roadmap.",
      scenario: "Sarah discovers our tool while looking for ways to automate her weekly reporting. She tries the free trial during a busy sprint and immediately sees value in the time saved.",
    });

    expect(persona.id).toBeDefined();
    expect(persona.type).toBe("user-persona");
    expect(persona.name).toBe("Tech-Savvy Sarah");
    expect(persona.demographics.occupation).toBe("Product Manager");
    expect(persona.psychographics?.personality).toHaveLength(3);
    expect(persona.behavior.goals).toHaveLength(3);
    expect(persona.quote).toBeDefined();
  });

  it("should create a minimal user persona", async () => {
    const persona = await createUserPersona({
      projectId,
      name: "Basic User",
      demographics: {
        occupation: "Developer",
      },
      behavior: {
        goals: ["Get work done"],
        frustrations: ["Slow tools"],
        motivations: ["Efficiency"],
      },
    });

    expect(persona.id).toBeDefined();
    expect(persona.demographics.age).toBeUndefined();
    expect(persona.quote).toBeUndefined();
  });

  it("should update a user persona", async () => {
    const created = await createUserPersona({
      projectId,
      name: "Original Persona",
      demographics: { occupation: "Original" },
      behavior: {
        goals: ["Original goal"],
        frustrations: ["Original frustration"],
        motivations: ["Original motivation"],
      },
    });

    const updated = await updateUserPersona({
      entityId: created.id,
      name: "Updated Persona",
      quote: "New quote",
      demographics: {
        occupation: "Updated occupation",
        age: "30-40",
      },
    });

    expect(updated.name).toBe("Updated Persona");
    expect(updated.quote).toBe("New quote");
    expect(updated.demographics.occupation).toBe("Updated occupation");
    expect(updated.demographics.age).toBe("30-40");
    expect(updated.behavior.goals[0]).toBe("Original goal");
  });

  it("should throw when updating non-existent persona", async () => {
    await expect(
      updateUserPersona({
        entityId: "non-existent",
        name: "Test",
      })
    ).rejects.toThrow("User Persona non-existent not found");
  });

  it("should get a user persona by ID", async () => {
    const created = await createUserPersona({
      projectId,
      name: "Test Persona",
      demographics: { occupation: "Test" },
      behavior: {
        goals: ["Test"],
        frustrations: ["Test"],
        motivations: ["Test"],
      },
    });

    const retrieved = await getUserPersona(created.id);

    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(created.id);
    expect(retrieved?.name).toBe("Test Persona");
  });

  it("should list user personas in a project", async () => {
    const basePersona = {
      demographics: { occupation: "Test" },
      behavior: {
        goals: ["Test"],
        frustrations: ["Test"],
        motivations: ["Test"],
      },
    };

    await createUserPersona({ projectId, name: "Persona 1", ...basePersona });
    await createUserPersona({ projectId, name: "Persona 2", ...basePersona });

    const personas = await listUserPersonas(projectId);

    expect(personas).toHaveLength(2);
  });
});
