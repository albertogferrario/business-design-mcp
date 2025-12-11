#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import {
  // Project management
  createProject,
  createProjectSchema,
  getProject,
  getProjectSchema,
  updateProject,
  updateProjectSchema,
  deleteProject,
  deleteProjectSchema,
  listProjects,
  deleteEntityTool,
  deleteEntitySchema,
  exportProject,
  exportProjectSchema,
  listProjectEntities,
  listProjectEntitiesSchema,
  // Business Model Canvas
  createBusinessModelCanvas,
  createBusinessModelCanvasSchema,
  updateBusinessModelCanvas,
  updateBusinessModelCanvasSchema,
  // Lean Canvas
  createLeanCanvas,
  createLeanCanvasSchema,
  updateLeanCanvas,
  updateLeanCanvasSchema,
  // Value Proposition Canvas
  createValuePropositionCanvas,
  createValuePropositionCanvasSchema,
  updateValuePropositionCanvas,
  updateValuePropositionCanvasSchema,
  // SWOT Analysis
  createSwotAnalysis,
  createSwotAnalysisSchema,
  updateSwotAnalysis,
  updateSwotAnalysisSchema,
  // User Persona
  createUserPersona,
  createUserPersonaSchema,
  updateUserPersona,
  updateUserPersonaSchema,
  // Competitive Analysis
  createCompetitiveAnalysis,
  createCompetitiveAnalysisSchema,
  updateCompetitiveAnalysis,
  updateCompetitiveAnalysisSchema,
  // Market Sizing
  createMarketSizing,
  createMarketSizingSchema,
  updateMarketSizing,
  updateMarketSizingSchema,
  // OpenAI Deep Research
  configureOpenAI,
  configureOpenAISchema,
  checkOpenAIConfig,
  deepResearch,
  deepResearchSchema,
  populateFramework,
  populateFrameworkSchema,
} from "./tools/index.js";

import { getEntity } from "./storage/index.js";

const server = new McpServer({
  name: "business-design",
  version: "1.0.0",
});

// ============================================================================
// PROJECT MANAGEMENT TOOLS
// ============================================================================

server.tool(
  "create_project",
  createProjectSchema.shape,
  { title: "Create a new business design project to organize your canvases, analyses, and personas" },
  async (args) => {
    const result = await createProject(createProjectSchema.parse(args));
    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  "get_project",
  getProjectSchema.shape,
  { title: "Get a project with all its entities (canvases, analyses, personas)" },
  async (args) => {
    const result = await getProject(getProjectSchema.parse(args));
    if (!result) {
      return {
        content: [{ type: "text" as const, text: "Project not found" }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  "update_project",
  updateProjectSchema.shape,
  { title: "Update project name, description, or tags" },
  async (args) => {
    const result = await updateProject(updateProjectSchema.parse(args));
    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  "delete_project",
  deleteProjectSchema.shape,
  { title: "Delete a project and all its entities" },
  async (args) => {
    const result = await deleteProject(deleteProjectSchema.parse(args));
    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  "list_projects",
  {},
  { title: "List all business design projects" },
  async () => {
    const result = await listProjects();
    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  "list_project_entities",
  listProjectEntitiesSchema.shape,
  { title: "List all entities in a project, optionally filtered by type" },
  async (args) => {
    const result = await listProjectEntities(listProjectEntitiesSchema.parse(args));
    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  "delete_entity",
  deleteEntitySchema.shape,
  { title: "Delete any entity (canvas, analysis, persona) by ID" },
  async (args) => {
    const result = await deleteEntityTool(deleteEntitySchema.parse(args));
    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  "export_project",
  exportProjectSchema.shape,
  { title: "Export a project to JSON or Markdown format" },
  async (args) => {
    const result = await exportProject(exportProjectSchema.parse(args));
    return {
      content: [{ type: "text" as const, text: result }],
    };
  }
);

server.tool(
  "get_entity",
  { entityId: z.string().describe("The entity ID to retrieve") },
  { title: "Get any entity by ID" },
  async (args) => {
    const result = await getEntity(args.entityId);
    if (!result) {
      return {
        content: [{ type: "text" as const, text: "Entity not found" }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

// ============================================================================
// BUSINESS MODEL CANVAS
// ============================================================================

server.tool(
  "create_business_model_canvas",
  createBusinessModelCanvasSchema.shape,
  { title: "Create a Business Model Canvas (Osterwalder's 9 blocks)" },
  async (args) => {
    const result = await createBusinessModelCanvas(createBusinessModelCanvasSchema.parse(args));
    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  "update_business_model_canvas",
  updateBusinessModelCanvasSchema.shape,
  { title: "Update an existing Business Model Canvas" },
  async (args) => {
    const result = await updateBusinessModelCanvas(updateBusinessModelCanvasSchema.parse(args));
    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

// ============================================================================
// LEAN CANVAS
// ============================================================================

server.tool(
  "create_lean_canvas",
  createLeanCanvasSchema.shape,
  { title: "Create a Lean Canvas (startup-focused adaptation)" },
  async (args) => {
    const result = await createLeanCanvas(createLeanCanvasSchema.parse(args));
    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  "update_lean_canvas",
  updateLeanCanvasSchema.shape,
  { title: "Update an existing Lean Canvas" },
  async (args) => {
    const result = await updateLeanCanvas(updateLeanCanvasSchema.parse(args));
    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

// ============================================================================
// VALUE PROPOSITION CANVAS
// ============================================================================

server.tool(
  "create_value_proposition_canvas",
  createValuePropositionCanvasSchema.shape,
  { title: "Create a Value Proposition Canvas (customer profile + value map)" },
  async (args) => {
    const result = await createValuePropositionCanvas(createValuePropositionCanvasSchema.parse(args));
    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  "update_value_proposition_canvas",
  updateValuePropositionCanvasSchema.shape,
  { title: "Update an existing Value Proposition Canvas" },
  async (args) => {
    const result = await updateValuePropositionCanvas(updateValuePropositionCanvasSchema.parse(args));
    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

// ============================================================================
// SWOT ANALYSIS
// ============================================================================

server.tool(
  "create_swot_analysis",
  createSwotAnalysisSchema.shape,
  { title: "Create a SWOT Analysis (strengths, weaknesses, opportunities, threats)" },
  async (args) => {
    const result = await createSwotAnalysis(createSwotAnalysisSchema.parse(args));
    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  "update_swot_analysis",
  updateSwotAnalysisSchema.shape,
  { title: "Update an existing SWOT Analysis" },
  async (args) => {
    const result = await updateSwotAnalysis(updateSwotAnalysisSchema.parse(args));
    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

// ============================================================================
// USER PERSONA
// ============================================================================

server.tool(
  "create_user_persona",
  createUserPersonaSchema.shape,
  { title: "Create a User Persona (demographics, behavior, goals)" },
  async (args) => {
    const result = await createUserPersona(createUserPersonaSchema.parse(args));
    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  "update_user_persona",
  updateUserPersonaSchema.shape,
  { title: "Update an existing User Persona" },
  async (args) => {
    const result = await updateUserPersona(updateUserPersonaSchema.parse(args));
    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

// ============================================================================
// COMPETITIVE ANALYSIS
// ============================================================================

server.tool(
  "create_competitive_analysis",
  createCompetitiveAnalysisSchema.shape,
  { title: "Create a Competitive Analysis (analyze competitors)" },
  async (args) => {
    const result = await createCompetitiveAnalysis(createCompetitiveAnalysisSchema.parse(args));
    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  "update_competitive_analysis",
  updateCompetitiveAnalysisSchema.shape,
  { title: "Update an existing Competitive Analysis" },
  async (args) => {
    const result = await updateCompetitiveAnalysis(updateCompetitiveAnalysisSchema.parse(args));
    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

// ============================================================================
// MARKET SIZING
// ============================================================================

server.tool(
  "create_market_sizing",
  createMarketSizingSchema.shape,
  { title: "Create a Market Sizing analysis (TAM, SAM, SOM)" },
  async (args) => {
    const result = await createMarketSizing(createMarketSizingSchema.parse(args));
    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  "update_market_sizing",
  updateMarketSizingSchema.shape,
  { title: "Update an existing Market Sizing analysis" },
  async (args) => {
    const result = await updateMarketSizing(updateMarketSizingSchema.parse(args));
    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

// ============================================================================
// OPENAI DEEP RESEARCH
// ============================================================================

server.tool(
  "configure_openai",
  configureOpenAISchema.shape,
  { title: "Configure OpenAI API key for Deep Research (alternative to OPENAI_API_KEY env var)" },
  async (args) => {
    const result = await configureOpenAI(configureOpenAISchema.parse(args));
    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  "check_openai_config",
  {},
  { title: "Check if OpenAI API key is configured" },
  async () => {
    const result = await checkOpenAIConfig();
    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  "deep_research",
  deepResearchSchema.shape,
  { title: "Execute OpenAI Deep Research to gather real market data for a framework" },
  async (args) => {
    const result = await deepResearch(deepResearchSchema.parse(args));
    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  "populate_framework",
  populateFrameworkSchema.shape,
  { title: "Create a framework entity from Deep Research results with citations" },
  async (args) => {
    const result = await populateFramework(populateFrameworkSchema.parse(args));
    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

// ============================================================================
// START SERVER
// ============================================================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Business Design MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
