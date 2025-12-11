import { z } from "zod";
import { ResearchMetadataSchema } from "./citations.js";

// Base schema for all entities
export const BaseEntitySchema = z.object({
  id: z.string(),
  projectId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  researchMetadata: ResearchMetadataSchema.optional(),
});

// Business Model Canvas - Alexander Osterwalder's 9 blocks
export const BusinessModelCanvasSchema = z.object({
  ...BaseEntitySchema.shape,
  type: z.literal("business-model-canvas"),
  name: z.string(),
  description: z.string().optional(),

  // The 9 building blocks
  customerSegments: z.array(z.object({
    segment: z.string(),
    characteristics: z.string().optional(),
    size: z.string().optional(),
  })),

  valuePropositions: z.array(z.object({
    proposition: z.string(),
    customerPains: z.array(z.string()).optional(),
    customerGains: z.array(z.string()).optional(),
  })),

  channels: z.array(z.object({
    channel: z.string(),
    phase: z.enum(["awareness", "evaluation", "purchase", "delivery", "after-sales"]).optional(),
  })),

  customerRelationships: z.array(z.object({
    relationship: z.string(),
    type: z.enum(["personal", "dedicated", "self-service", "automated", "communities", "co-creation"]).optional(),
  })),

  revenueStreams: z.array(z.object({
    stream: z.string(),
    type: z.enum(["asset-sale", "usage-fee", "subscription", "licensing", "brokerage", "advertising"]).optional(),
    pricing: z.string().optional(),
  })),

  keyResources: z.array(z.object({
    resource: z.string(),
    type: z.enum(["physical", "intellectual", "human", "financial"]).optional(),
  })),

  keyActivities: z.array(z.object({
    activity: z.string(),
    type: z.enum(["production", "problem-solving", "platform"]).optional(),
  })),

  keyPartnerships: z.array(z.object({
    partner: z.string(),
    type: z.enum(["strategic-alliance", "coopetition", "joint-venture", "supplier"]).optional(),
    motivation: z.string().optional(),
  })),

  costStructure: z.array(z.object({
    cost: z.string(),
    type: z.enum(["fixed", "variable"]).optional(),
    priority: z.enum(["cost-driven", "value-driven"]).optional(),
  })),
});

// Lean Canvas - Ash Maurya's startup-focused adaptation
export const LeanCanvasSchema = z.object({
  ...BaseEntitySchema.shape,
  type: z.literal("lean-canvas"),
  name: z.string(),
  description: z.string().optional(),

  problem: z.array(z.object({
    problem: z.string(),
    existingAlternatives: z.string().optional(),
  })),

  customerSegments: z.array(z.object({
    segment: z.string(),
    earlyAdopters: z.string().optional(),
  })),

  uniqueValueProposition: z.object({
    proposition: z.string(),
    highLevelConcept: z.string().optional(),
  }),

  solution: z.array(z.object({
    feature: z.string(),
    description: z.string().optional(),
  })),

  channels: z.array(z.string()),

  revenueStreams: z.array(z.object({
    stream: z.string(),
    amount: z.string().optional(),
  })),

  costStructure: z.array(z.object({
    cost: z.string(),
    amount: z.string().optional(),
  })),

  keyMetrics: z.array(z.object({
    metric: z.string(),
    target: z.string().optional(),
  })),

  unfairAdvantage: z.string().optional(),
});

// Value Proposition Canvas - Detailed customer-value fit
export const ValuePropositionCanvasSchema = z.object({
  ...BaseEntitySchema.shape,
  type: z.literal("value-proposition-canvas"),
  name: z.string(),
  description: z.string().optional(),

  // Customer Profile (right side)
  customerProfile: z.object({
    customerJobs: z.array(z.object({
      job: z.string(),
      type: z.enum(["functional", "social", "emotional", "supporting"]).optional(),
      importance: z.enum(["critical", "important", "nice-to-have"]).optional(),
    })),

    pains: z.array(z.object({
      pain: z.string(),
      severity: z.enum(["extreme", "moderate", "light"]).optional(),
    })),

    gains: z.array(z.object({
      gain: z.string(),
      relevance: z.enum(["required", "expected", "desired", "unexpected"]).optional(),
    })),
  }),

  // Value Map (left side)
  valueMap: z.object({
    productsAndServices: z.array(z.object({
      item: z.string(),
      type: z.enum(["physical", "digital", "intangible", "financial"]).optional(),
    })),

    painRelievers: z.array(z.object({
      reliever: z.string(),
      addressedPain: z.string().optional(),
    })),

    gainCreators: z.array(z.object({
      creator: z.string(),
      addressedGain: z.string().optional(),
    })),
  }),

  fitScore: z.number().min(0).max(100).optional(),
});

// SWOT Analysis
export const SwotAnalysisSchema = z.object({
  ...BaseEntitySchema.shape,
  type: z.literal("swot-analysis"),
  name: z.string(),
  description: z.string().optional(),
  context: z.string().optional(),

  strengths: z.array(z.object({
    item: z.string(),
    impact: z.enum(["high", "medium", "low"]).optional(),
  })),

  weaknesses: z.array(z.object({
    item: z.string(),
    impact: z.enum(["high", "medium", "low"]).optional(),
    mitigation: z.string().optional(),
  })),

  opportunities: z.array(z.object({
    item: z.string(),
    timeframe: z.enum(["immediate", "short-term", "long-term"]).optional(),
    requiredAction: z.string().optional(),
  })),

  threats: z.array(z.object({
    item: z.string(),
    likelihood: z.enum(["high", "medium", "low"]).optional(),
    contingency: z.string().optional(),
  })),
});

// User Persona
export const UserPersonaSchema = z.object({
  ...BaseEntitySchema.shape,
  type: z.literal("user-persona"),
  name: z.string(),

  // Demographics
  demographics: z.object({
    age: z.string().optional(),
    gender: z.string().optional(),
    location: z.string().optional(),
    occupation: z.string().optional(),
    income: z.string().optional(),
    education: z.string().optional(),
    familyStatus: z.string().optional(),
  }),

  // Psychographics
  psychographics: z.object({
    personality: z.array(z.string()).optional(),
    values: z.array(z.string()).optional(),
    interests: z.array(z.string()).optional(),
    lifestyle: z.string().optional(),
  }),

  // Behavior
  behavior: z.object({
    goals: z.array(z.string()),
    frustrations: z.array(z.string()),
    motivations: z.array(z.string()),
    preferredChannels: z.array(z.string()).optional(),
    buyingBehavior: z.string().optional(),
  }),

  // Context
  quote: z.string().optional(),
  bio: z.string().optional(),
  scenario: z.string().optional(),
});

// Competitive Analysis
export const CompetitiveAnalysisSchema = z.object({
  ...BaseEntitySchema.shape,
  type: z.literal("competitive-analysis"),
  name: z.string(),
  description: z.string().optional(),

  competitors: z.array(z.object({
    name: z.string(),
    website: z.string().optional(),
    description: z.string().optional(),

    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),

    pricing: z.object({
      model: z.string().optional(),
      range: z.string().optional(),
    }).optional(),

    marketShare: z.string().optional(),
    targetAudience: z.string().optional(),

    features: z.array(z.object({
      feature: z.string(),
      rating: z.enum(["strong", "moderate", "weak", "absent"]).optional(),
    })).optional(),
  })),

  comparisonMatrix: z.array(z.object({
    criterion: z.string(),
    weight: z.number().optional(),
    scores: z.record(z.string(), z.number()).optional(),
  })).optional(),

  ourPosition: z.object({
    differentiators: z.array(z.string()),
    gaps: z.array(z.string()),
    opportunities: z.array(z.string()),
  }).optional(),
});

// Market Sizing (TAM, SAM, SOM)
export const MarketSizingSchema = z.object({
  ...BaseEntitySchema.shape,
  type: z.literal("market-sizing"),
  name: z.string(),
  description: z.string().optional(),

  // Total Addressable Market
  tam: z.object({
    value: z.number(),
    currency: z.string().default("USD"),
    unit: z.enum(["annual", "monthly"]).default("annual"),
    methodology: z.string().optional(),
    sources: z.array(z.string()).optional(),
    assumptions: z.array(z.string()).optional(),
  }),

  // Serviceable Addressable Market
  sam: z.object({
    value: z.number(),
    currency: z.string().default("USD"),
    unit: z.enum(["annual", "monthly"]).default("annual"),
    constraints: z.array(z.string()).optional(),
    targetSegments: z.array(z.string()).optional(),
  }),

  // Serviceable Obtainable Market
  som: z.object({
    value: z.number(),
    currency: z.string().default("USD"),
    unit: z.enum(["annual", "monthly"]).default("annual"),
    timeframe: z.string().optional(),
    captureStrategy: z.string().optional(),
    assumptions: z.array(z.string()).optional(),
  }),

  growthRate: z.object({
    rate: z.number(),
    period: z.string(),
    drivers: z.array(z.string()).optional(),
  }).optional(),
});

// Project container
export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  tags: z.array(z.string()).optional(),

  // References to contained entities
  entities: z.array(z.object({
    id: z.string(),
    type: z.enum([
      "business-model-canvas",
      "lean-canvas",
      "value-proposition-canvas",
      "swot-analysis",
      "user-persona",
      "competitive-analysis",
      "market-sizing",
    ]),
  })),
});

// Type exports
export type BusinessModelCanvas = z.infer<typeof BusinessModelCanvasSchema>;
export type LeanCanvas = z.infer<typeof LeanCanvasSchema>;
export type ValuePropositionCanvas = z.infer<typeof ValuePropositionCanvasSchema>;
export type SwotAnalysis = z.infer<typeof SwotAnalysisSchema>;
export type UserPersona = z.infer<typeof UserPersonaSchema>;
export type CompetitiveAnalysis = z.infer<typeof CompetitiveAnalysisSchema>;
export type MarketSizing = z.infer<typeof MarketSizingSchema>;
export type Project = z.infer<typeof ProjectSchema>;

export type EntityType =
  | BusinessModelCanvas
  | LeanCanvas
  | ValuePropositionCanvas
  | SwotAnalysis
  | UserPersona
  | CompetitiveAnalysis
  | MarketSizing;
