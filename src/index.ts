#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Helper types for tool registration
type ToolContent = { type: "text"; text: string };
type ToolResponse = { content: ToolContent[]; isError?: boolean };

function jsonResponse(data: unknown): ToolResponse {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
  };
}

function errorResponse(message: string): ToolResponse {
  return {
    content: [{ type: "text", text: message }],
    isError: true,
  };
}

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
  researchAndCreate,
  researchAndCreateSchema,
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
  async (args) => jsonResponse(await createProject(createProjectSchema.parse(args)))
);

server.tool(
  "get_project",
  getProjectSchema.shape,
  { title: "Get a project with all its entities (canvases, analyses, personas)" },
  async (args) => {
    const result = await getProject(getProjectSchema.parse(args));
    return result ? jsonResponse(result) : errorResponse("Project not found");
  }
);

server.tool(
  "update_project",
  updateProjectSchema.shape,
  { title: "Update project name, description, or tags" },
  async (args) => jsonResponse(await updateProject(updateProjectSchema.parse(args)))
);

server.tool(
  "delete_project",
  deleteProjectSchema.shape,
  { title: "Delete a project and all its entities" },
  async (args) => jsonResponse(await deleteProject(deleteProjectSchema.parse(args)))
);

server.tool(
  "list_projects",
  {},
  { title: "List all business design projects" },
  async () => jsonResponse(await listProjects())
);

server.tool(
  "list_project_entities",
  listProjectEntitiesSchema.shape,
  { title: "List all entities in a project, optionally filtered by type" },
  async (args) => jsonResponse(await listProjectEntities(listProjectEntitiesSchema.parse(args)))
);

server.tool(
  "delete_entity",
  deleteEntitySchema.shape,
  { title: "Delete any entity (canvas, analysis, persona) by ID" },
  async (args) => jsonResponse(await deleteEntityTool(deleteEntitySchema.parse(args)))
);

server.tool(
  "export_project",
  exportProjectSchema.shape,
  { title: "Export a project to JSON or Markdown format" },
  async (args) => {
    const result = await exportProject(exportProjectSchema.parse(args));
    return { content: [{ type: "text" as const, text: result }] };
  }
);

server.tool(
  "get_entity",
  { entityId: z.string().describe("The entity ID to retrieve") },
  { title: "Get any entity by ID" },
  async (args) => {
    const result = await getEntity(args.entityId);
    return result ? jsonResponse(result) : errorResponse("Entity not found");
  }
);

// ============================================================================
// BUSINESS MODEL CANVAS
// ============================================================================

server.tool(
  "create_business_model_canvas",
  createBusinessModelCanvasSchema.shape,
  { title: "Create a Business Model Canvas (Osterwalder's 9 blocks)" },
  async (args) => jsonResponse(await createBusinessModelCanvas(createBusinessModelCanvasSchema.parse(args)))
);

server.tool(
  "update_business_model_canvas",
  updateBusinessModelCanvasSchema.shape,
  { title: "Update an existing Business Model Canvas" },
  async (args) => jsonResponse(await updateBusinessModelCanvas(updateBusinessModelCanvasSchema.parse(args)))
);

// ============================================================================
// LEAN CANVAS
// ============================================================================

server.tool(
  "create_lean_canvas",
  createLeanCanvasSchema.shape,
  { title: "Create a Lean Canvas (startup-focused adaptation)" },
  async (args) => jsonResponse(await createLeanCanvas(createLeanCanvasSchema.parse(args)))
);

server.tool(
  "update_lean_canvas",
  updateLeanCanvasSchema.shape,
  { title: "Update an existing Lean Canvas" },
  async (args) => jsonResponse(await updateLeanCanvas(updateLeanCanvasSchema.parse(args)))
);

// ============================================================================
// VALUE PROPOSITION CANVAS
// ============================================================================

server.tool(
  "create_value_proposition_canvas",
  createValuePropositionCanvasSchema.shape,
  { title: "Create a Value Proposition Canvas (customer profile + value map)" },
  async (args) => jsonResponse(await createValuePropositionCanvas(createValuePropositionCanvasSchema.parse(args)))
);

server.tool(
  "update_value_proposition_canvas",
  updateValuePropositionCanvasSchema.shape,
  { title: "Update an existing Value Proposition Canvas" },
  async (args) => jsonResponse(await updateValuePropositionCanvas(updateValuePropositionCanvasSchema.parse(args)))
);

// ============================================================================
// SWOT ANALYSIS
// ============================================================================

server.tool(
  "create_swot_analysis",
  createSwotAnalysisSchema.shape,
  { title: "Create a SWOT Analysis (strengths, weaknesses, opportunities, threats)" },
  async (args) => jsonResponse(await createSwotAnalysis(createSwotAnalysisSchema.parse(args)))
);

server.tool(
  "update_swot_analysis",
  updateSwotAnalysisSchema.shape,
  { title: "Update an existing SWOT Analysis" },
  async (args) => jsonResponse(await updateSwotAnalysis(updateSwotAnalysisSchema.parse(args)))
);

// ============================================================================
// USER PERSONA
// ============================================================================

server.tool(
  "create_user_persona",
  createUserPersonaSchema.shape,
  { title: "Create a User Persona (demographics, behavior, goals)" },
  async (args) => jsonResponse(await createUserPersona(createUserPersonaSchema.parse(args)))
);

server.tool(
  "update_user_persona",
  updateUserPersonaSchema.shape,
  { title: "Update an existing User Persona" },
  async (args) => jsonResponse(await updateUserPersona(updateUserPersonaSchema.parse(args)))
);

// ============================================================================
// COMPETITIVE ANALYSIS
// ============================================================================

server.tool(
  "create_competitive_analysis",
  createCompetitiveAnalysisSchema.shape,
  { title: "Create a Competitive Analysis (analyze competitors)" },
  async (args) => jsonResponse(await createCompetitiveAnalysis(createCompetitiveAnalysisSchema.parse(args)))
);

server.tool(
  "update_competitive_analysis",
  updateCompetitiveAnalysisSchema.shape,
  { title: "Update an existing Competitive Analysis" },
  async (args) => jsonResponse(await updateCompetitiveAnalysis(updateCompetitiveAnalysisSchema.parse(args)))
);

// ============================================================================
// MARKET SIZING
// ============================================================================

server.tool(
  "create_market_sizing",
  createMarketSizingSchema.shape,
  { title: "Create a Market Sizing analysis (TAM, SAM, SOM)" },
  async (args) => jsonResponse(await createMarketSizing(createMarketSizingSchema.parse(args)))
);

server.tool(
  "update_market_sizing",
  updateMarketSizingSchema.shape,
  { title: "Update an existing Market Sizing analysis" },
  async (args) => jsonResponse(await updateMarketSizing(updateMarketSizingSchema.parse(args)))
);

// ============================================================================
// OPENAI DEEP RESEARCH
// ============================================================================

server.tool(
  "configure_openai",
  configureOpenAISchema.shape,
  { title: "Configure OpenAI API key for Deep Research (alternative to OPENAI_API_KEY env var)" },
  async (args) => jsonResponse(await configureOpenAI(configureOpenAISchema.parse(args)))
);

server.tool(
  "check_openai_config",
  {},
  { title: "Check if OpenAI API key is configured" },
  async () => jsonResponse(await checkOpenAIConfig())
);

server.tool(
  "deep_research",
  deepResearchSchema.shape,
  { title: "Execute OpenAI Deep Research to gather real market data for a framework" },
  async (args) => jsonResponse(await deepResearch(deepResearchSchema.parse(args)))
);

server.tool(
  "populate_framework",
  populateFrameworkSchema.shape,
  { title: "Create a framework entity from Deep Research results with citations" },
  async (args) => jsonResponse(await populateFramework(populateFrameworkSchema.parse(args)))
);

server.tool(
  "research_and_create",
  researchAndCreateSchema.shape,
  { title: "Research a framework using AI Deep Research and create entity in one step" },
  async (args) => jsonResponse(await researchAndCreate(researchAndCreateSchema.parse(args)))
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
