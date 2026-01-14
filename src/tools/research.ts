import { z } from "zod";
import {
  setOpenAIApiKey,
  getOpenAIApiKey,
  executeDeepResearch,
  type DeepResearchModel,
} from "../openai/client.js";
import {
  generateResearchPrompt,
  SYSTEM_PROMPT,
  type FrameworkType,
  type ResearchContext,
} from "../openai/prompts.js";
import { parseResearchResult, type Citation } from "../openai/parser.js";
import { createEntity } from "../storage/index.js";
import type {
  MarketSizing,
  CompetitiveAnalysis,
  UserPersona,
  SwotAnalysis,
  BusinessModelCanvas,
  LeanCanvas,
  ValuePropositionCanvas,
} from "../schemas/index.js";

// Configure OpenAI API Key
export const configureOpenAISchema = z.object({
  apiKey: z.string().describe("OpenAI API key for Deep Research"),
});

export async function configureOpenAI(
  args: z.infer<typeof configureOpenAISchema>
): Promise<{ success: boolean; message: string }> {
  setOpenAIApiKey(args.apiKey);
  return {
    success: true,
    message: "OpenAI API key configured successfully",
  };
}

// Check OpenAI configuration
export async function checkOpenAIConfig(): Promise<{
  configured: boolean;
  source: string | null;
}> {
  const key = getOpenAIApiKey();
  if (!key) {
    return { configured: false, source: null };
  }
  return {
    configured: true,
    source: process.env.OPENAI_API_KEY ? "environment" : "runtime",
  };
}

// Deep Research Tool
export const deepResearchSchema = z.object({
  projectId: z.string().describe("Project to associate research with"),
  frameworkType: z
    .enum([
      "market-sizing",
      "competitive-analysis",
      "user-persona",
      "swot-analysis",
      "business-model-canvas",
      "lean-canvas",
      "value-proposition-canvas",
    ])
    .describe("Framework type to research"),
  context: z
    .object({
      businessDescription: z
        .string()
        .describe("Description of the business/product (required)"),
      industry: z.string().optional().describe("Industry sector"),
      geography: z.string().optional().describe("Target geography"),
      targetCustomers: z
        .string()
        .optional()
        .describe("Target customer description"),
      productOrService: z
        .string()
        .optional()
        .describe("Product or service details"),
      competitors: z
        .array(z.string())
        .optional()
        .describe("Known competitors to include"),
    })
    .describe("Research context"),
  model: z
    .enum(["o3-deep-research-2025-06-26", "o4-mini-deep-research-2025-06-26"])
    .default("o4-mini-deep-research-2025-06-26")
    .describe("Model to use (mini is faster and cheaper, default)"),
});

export interface DeepResearchResponse {
  frameworkType: FrameworkType;
  rawContent: string;
  parsedData: Record<string, unknown>;
  citations: Citation[];
  confidence: number;
  missingFields: string[];
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    estimatedCostUSD: number;
  };
}

export async function deepResearch(
  args: z.infer<typeof deepResearchSchema>
): Promise<DeepResearchResponse> {
  const userPrompt = generateResearchPrompt(
    args.frameworkType as FrameworkType,
    args.context as ResearchContext
  );

  const result = await executeDeepResearch({
    model: args.model as DeepResearchModel,
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
  });

  const parsed = parseResearchResult(
    args.frameworkType as FrameworkType,
    result.content,
    result.citations
  );

  // Estimate cost (rough approximation based on token usage)
  // Deep Research pricing varies, using approximate values
  const estimatedCostUSD = (result.usage.totalTokens / 1000) * 0.015;

  return {
    frameworkType: args.frameworkType as FrameworkType,
    rawContent: result.content,
    parsedData: parsed.data,
    citations: parsed.citations,
    confidence: parsed.confidence,
    missingFields: parsed.missingFields,
    usage: {
      inputTokens: result.usage.inputTokens,
      outputTokens: result.usage.outputTokens,
      totalTokens: result.usage.totalTokens,
      estimatedCostUSD: Math.round(estimatedCostUSD * 100) / 100,
    },
  };
}

// Populate Framework Tool
export const populateFrameworkSchema = z.object({
  projectId: z.string().describe("Project ID to create entity in"),
  frameworkType: z
    .enum([
      "market-sizing",
      "competitive-analysis",
      "user-persona",
      "swot-analysis",
      "business-model-canvas",
      "lean-canvas",
      "value-proposition-canvas",
    ])
    .describe("Framework type to populate"),
  name: z.string().describe("Name for the new entity"),
  description: z.string().optional().describe("Optional description"),
  researchData: z
    .record(z.unknown())
    .describe("Parsed research data from deep_research tool"),
  citations: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        url: z.string(),
        accessedAt: z.string(),
        relevantFields: z.array(z.string()),
      })
    )
    .describe("Citations from deep_research tool"),
  researchModel: z.string().optional().describe("Model used for research"),
  confidence: z.number().optional().describe("Confidence score from research"),
});

export interface PopulateFrameworkResponse {
  entityId: string;
  type: string;
  name: string;
  citationCount: number;
}

// Combined Research and Create Tool
export const researchAndCreateSchema = z.object({
  projectId: z.string().describe("Project to create entity in"),
  frameworkType: z
    .enum([
      "market-sizing",
      "competitive-analysis",
      "user-persona",
      "swot-analysis",
      "business-model-canvas",
      "lean-canvas",
      "value-proposition-canvas",
    ])
    .describe("Framework type to research and create"),
  name: z.string().describe("Name for the new entity"),
  description: z.string().optional().describe("Optional description"),
  context: z
    .object({
      businessDescription: z
        .string()
        .describe("Description of the business/product (required)"),
      industry: z.string().optional().describe("Industry sector"),
      geography: z.string().optional().describe("Target geography"),
      targetCustomers: z
        .string()
        .optional()
        .describe("Target customer description"),
      productOrService: z
        .string()
        .optional()
        .describe("Product or service details"),
      competitors: z
        .array(z.string())
        .optional()
        .describe("Known competitors to include"),
    })
    .describe("Research context"),
  model: z
    .enum(["o3-deep-research-2025-06-26", "o4-mini-deep-research-2025-06-26"])
    .default("o4-mini-deep-research-2025-06-26")
    .describe("Model to use (mini is faster and cheaper)"),
});

export interface ResearchAndCreateResponse {
  entity: {
    id: string;
    type: string;
    name: string;
  };
  research: {
    confidence: number;
    citationCount: number;
    missingFields: string[];
  };
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    estimatedCostUSD: number;
  };
}

export async function researchAndCreate(
  args: z.infer<typeof researchAndCreateSchema>
): Promise<ResearchAndCreateResponse> {
  // Execute deep research
  const researchResult = await deepResearch({
    projectId: args.projectId,
    frameworkType: args.frameworkType,
    context: args.context,
    model: args.model,
  });

  // Create entity with research data
  const entityResult = await populateFramework({
    projectId: args.projectId,
    frameworkType: args.frameworkType,
    name: args.name,
    description: args.description,
    researchData: researchResult.parsedData,
    citations: researchResult.citations,
    researchModel: args.model,
    confidence: researchResult.confidence,
  });

  // Return combined response
  return {
    entity: {
      id: entityResult.entityId,
      type: entityResult.type,
      name: entityResult.name,
    },
    research: {
      confidence: researchResult.confidence,
      citationCount: researchResult.citations.length,
      missingFields: researchResult.missingFields,
    },
    usage: researchResult.usage,
  };
}

export async function populateFramework(
  args: z.infer<typeof populateFrameworkSchema>
): Promise<PopulateFrameworkResponse> {
  const researchMetadata = {
    citations: args.citations,
    researchedAt: new Date().toISOString(),
    researchModel: args.researchModel,
    confidence: args.confidence,
  };

  let entity;

  switch (args.frameworkType) {
    case "market-sizing": {
      const data = args.researchData as {
        tam?: { value?: number; currency?: string; unit?: string };
        sam?: { value?: number; currency?: string; unit?: string };
        som?: { value?: number; currency?: string; unit?: string };
        growthRate?: { rate?: number; period?: string };
      };

      entity = await createEntity<MarketSizing>(args.projectId, {
        type: "market-sizing",
        name: args.name,
        description: args.description,
        tam: {
          value: data.tam?.value || 0,
          currency: data.tam?.currency || "USD",
          unit: (data.tam?.unit as "annual" | "monthly") || "annual",
        },
        sam: {
          value: data.sam?.value || 0,
          currency: data.sam?.currency || "USD",
          unit: (data.sam?.unit as "annual" | "monthly") || "annual",
        },
        som: {
          value: data.som?.value || 0,
          currency: data.som?.currency || "USD",
          unit: (data.som?.unit as "annual" | "monthly") || "annual",
        },
        growthRate: data.growthRate
          ? {
              rate: data.growthRate.rate || 0,
              period: data.growthRate.period || "annual",
            }
          : undefined,
        researchMetadata,
      });
      break;
    }

    case "competitive-analysis": {
      const data = args.researchData as {
        competitors?: Array<{
          name: string;
          strengths: string[];
          weaknesses: string[];
        }>;
        ourPosition?: {
          differentiators: string[];
          gaps: string[];
          opportunities: string[];
        };
      };

      entity = await createEntity<CompetitiveAnalysis>(args.projectId, {
        type: "competitive-analysis",
        name: args.name,
        description: args.description,
        competitors: (data.competitors || []).map((c) => ({
          name: c.name,
          strengths: c.strengths || [],
          weaknesses: c.weaknesses || [],
        })),
        ourPosition: data.ourPosition,
        researchMetadata,
      });
      break;
    }

    case "user-persona": {
      const data = args.researchData as {
        personas?: Array<{
          name: string;
          demographics: Record<string, string>;
          behavior: {
            goals: string[];
            frustrations: string[];
            motivations: string[];
          };
        }>;
      };

      // Create first persona (or multiple if needed)
      const firstPersona = data.personas?.[0];
      entity = await createEntity<UserPersona>(args.projectId, {
        type: "user-persona",
        name: firstPersona?.name || args.name,
        demographics: {
          age: firstPersona?.demographics?.age,
          occupation: firstPersona?.demographics?.occupation,
          location: firstPersona?.demographics?.location,
        },
        psychographics: {},
        behavior: {
          goals: firstPersona?.behavior?.goals || [],
          frustrations: firstPersona?.behavior?.frustrations || [],
          motivations: firstPersona?.behavior?.motivations || [],
        },
        researchMetadata,
      });
      break;
    }

    case "swot-analysis": {
      const data = args.researchData as {
        strengths?: Array<{ item: string }>;
        weaknesses?: Array<{ item: string }>;
        opportunities?: Array<{ item: string }>;
        threats?: Array<{ item: string }>;
      };

      entity = await createEntity<SwotAnalysis>(args.projectId, {
        type: "swot-analysis",
        name: args.name,
        description: args.description,
        strengths: data.strengths || [],
        weaknesses: data.weaknesses || [],
        opportunities: data.opportunities || [],
        threats: data.threats || [],
        researchMetadata,
      });
      break;
    }

    case "business-model-canvas": {
      const data = args.researchData as {
        customerSegments?: Array<{ segment: string }>;
        valuePropositions?: Array<{ proposition: string }>;
        channels?: Array<{ channel: string }>;
        customerRelationships?: Array<{ relationship: string }>;
        revenueStreams?: Array<{ stream: string }>;
        keyResources?: Array<{ resource: string }>;
        keyActivities?: Array<{ activity: string }>;
        keyPartnerships?: Array<{ partner: string }>;
        costStructure?: Array<{ cost: string }>;
      };

      entity = await createEntity<BusinessModelCanvas>(args.projectId, {
        type: "business-model-canvas",
        name: args.name,
        description: args.description,
        customerSegments: data.customerSegments || [],
        valuePropositions: data.valuePropositions || [],
        channels: data.channels || [],
        customerRelationships: data.customerRelationships || [],
        revenueStreams: data.revenueStreams || [],
        keyResources: data.keyResources || [],
        keyActivities: data.keyActivities || [],
        keyPartnerships: data.keyPartnerships || [],
        costStructure: data.costStructure || [],
        researchMetadata,
      });
      break;
    }

    case "lean-canvas": {
      const data = args.researchData as {
        problem?: Array<{ problem: string }>;
        customerSegments?: Array<{ segment: string }>;
        uniqueValueProposition?: { proposition: string };
        solution?: Array<{ feature: string }>;
        channels?: string[];
        revenueStreams?: Array<{ stream: string }>;
        costStructure?: Array<{ cost: string }>;
        keyMetrics?: Array<{ metric: string }>;
      };

      entity = await createEntity<LeanCanvas>(args.projectId, {
        type: "lean-canvas",
        name: args.name,
        description: args.description,
        problem: data.problem || [],
        customerSegments: data.customerSegments || [],
        uniqueValueProposition: data.uniqueValueProposition || {
          proposition: "",
        },
        solution: data.solution || [],
        channels: data.channels || [],
        revenueStreams: data.revenueStreams || [],
        costStructure: data.costStructure || [],
        keyMetrics: data.keyMetrics || [],
        researchMetadata,
      });
      break;
    }

    case "value-proposition-canvas": {
      const data = args.researchData as {
        customerProfile?: {
          customerJobs?: Array<{ job: string }>;
          pains?: Array<{ pain: string }>;
          gains?: Array<{ gain: string }>;
        };
        valueMap?: {
          productsAndServices?: Array<{ item: string }>;
          painRelievers?: Array<{ reliever: string }>;
          gainCreators?: Array<{ creator: string }>;
        };
      };

      entity = await createEntity<ValuePropositionCanvas>(args.projectId, {
        type: "value-proposition-canvas",
        name: args.name,
        description: args.description,
        customerProfile: {
          customerJobs: data.customerProfile?.customerJobs || [],
          pains: data.customerProfile?.pains || [],
          gains: data.customerProfile?.gains || [],
        },
        valueMap: {
          productsAndServices: data.valueMap?.productsAndServices || [],
          painRelievers: data.valueMap?.painRelievers || [],
          gainCreators: data.valueMap?.gainCreators || [],
        },
        researchMetadata,
      });
      break;
    }

    default:
      throw new Error(`Unknown framework type: ${args.frameworkType}`);
  }

  return {
    entityId: entity.id,
    type: entity.type,
    name: entity.name,
    citationCount: args.citations.length,
  };
}
