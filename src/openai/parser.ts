import type { RawCitation } from "./client.js";
import type { FrameworkType } from "./prompts.js";

export interface Citation {
  id: string;
  title: string;
  url: string;
  accessedAt: string;
  relevantFields: string[];
}

export interface ParsedResearchResult {
  data: Record<string, unknown>;
  citations: Citation[];
  confidence: number;
  missingFields: string[];
  rawContent: string;
}

function generateCitationId(): string {
  return `cit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

function processCitations(rawCitations: RawCitation[]): Citation[] {
  const now = new Date().toISOString();
  const seen = new Set<string>();

  return rawCitations
    .filter((c) => {
      if (seen.has(c.url)) return false;
      seen.add(c.url);
      return true;
    })
    .map((c) => ({
      id: generateCitationId(),
      title: c.title,
      url: c.url,
      accessedAt: now,
      relevantFields: [],
    }));
}

// Extract numerical values with units
function extractNumber(text: string, patterns: RegExp[]): number | undefined {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let value = parseFloat(match[1].replace(/,/g, ""));
      const unit = match[2]?.toLowerCase();

      if (unit === "b" || unit === "billion") value *= 1_000_000_000;
      else if (unit === "m" || unit === "million") value *= 1_000_000;
      else if (unit === "k" || unit === "thousand") value *= 1_000;
      else if (unit === "t" || unit === "trillion") value *= 1_000_000_000_000;

      return value;
    }
  }
  return undefined;
}

// Extract percentage values
function extractPercentage(text: string): number | undefined {
  const match = text.match(/(\d+(?:\.\d+)?)\s*%/);
  return match ? parseFloat(match[1]) : undefined;
}

// Extract list items from markdown
function extractListItems(text: string, sectionHeader: string): string[] {
  const sectionPattern = new RegExp(
    `##?\\s*${sectionHeader}[^#]*?(?=##|$)`,
    "is"
  );
  const sectionMatch = text.match(sectionPattern);
  if (!sectionMatch) return [];

  const items: string[] = [];
  const listPattern = /[-*]\s+\*?\*?([^*\n]+)\*?\*?/g;
  let match;

  while ((match = listPattern.exec(sectionMatch[0])) !== null) {
    const item = match[1].trim();
    if (item.length > 0 && item.length < 200) {
      items.push(item);
    }
  }

  return items;
}

// Extract section content
function extractSection(text: string, sectionHeader: string): string {
  const sectionPattern = new RegExp(
    `##?\\s*(?:${sectionHeader})[:\\s]*([^#]*?)(?=##|$)`,
    "is"
  );
  const match = text.match(sectionPattern);
  return match && match[1] ? match[1].trim() : "";
}

export function parseMarketSizingResearch(
  content: string,
  rawCitations: RawCitation[]
): ParsedResearchResult {
  const citations = processCitations(rawCitations);
  const missingFields: string[] = [];

  // Currency patterns
  const currencyPatterns = [
    /\$\s*([\d,.]+)\s*(trillion|billion|million|t|b|m)?/i,
    /USD\s*([\d,.]+)\s*(trillion|billion|million|t|b|m)?/i,
    /([\d,.]+)\s*(trillion|billion|million)\s*(?:USD|\$|dollars)/i,
  ];

  // Extract TAM
  const tamSection = extractSection(content, "TAM|Total Addressable Market");
  const tamValue = extractNumber(tamSection || content, currencyPatterns);

  // Extract SAM
  const samSection = extractSection(content, "SAM|Serviceable Addressable Market");
  const samValue = extractNumber(samSection || "", currencyPatterns);

  // Extract SOM
  const somSection = extractSection(content, "SOM|Serviceable Obtainable Market");
  const somValue = extractNumber(somSection || "", currencyPatterns);

  // Extract growth rate
  const growthSection = extractSection(content, "Growth|CAGR|Market Growth");
  const growthRate = extractPercentage(growthSection || content);

  // Extract sources mentioned
  const sources = extractListItems(content, "Sources|References|Data Sources");

  // Track missing fields
  if (!tamValue) missingFields.push("tam.value");
  if (!samValue) missingFields.push("sam.value");
  if (!somValue) missingFields.push("som.value");

  // Calculate confidence based on data completeness
  let confidence = 100;
  if (!tamValue) confidence -= 30;
  if (!samValue) confidence -= 20;
  if (!somValue) confidence -= 20;
  if (!growthRate) confidence -= 10;
  if (citations.length === 0) confidence -= 20;

  const data = {
    tam: {
      value: tamValue,
      currency: "USD",
      unit: "annual",
      methodology: tamSection ? "Extracted from research" : undefined,
      sources: sources.length > 0 ? sources : undefined,
    },
    sam: {
      value: samValue,
      currency: "USD",
      unit: "annual",
    },
    som: {
      value: somValue,
      currency: "USD",
      unit: "annual",
    },
    growthRate: growthRate
      ? {
          rate: growthRate,
          period: "annual",
        }
      : undefined,
  };

  return {
    data,
    citations,
    confidence: Math.max(0, confidence),
    missingFields,
    rawContent: content,
  };
}

export function parseCompetitiveAnalysisResearch(
  content: string,
  rawCitations: RawCitation[]
): ParsedResearchResult {
  const citations = processCitations(rawCitations);
  const missingFields: string[] = [];

  // Extract competitor sections
  const competitorPattern = /##\s*(?:Competitor\s*\d+:?\s*)?([A-Za-z0-9\s]+?)(?:\n|$)/g;
  const competitors: Array<{
    name: string;
    strengths: string[];
    weaknesses: string[];
  }> = [];

  // Simple extraction of competitor names and their strengths/weaknesses
  const sections = content.split(/##\s+/);

  for (const section of sections) {
    if (section.length < 20) continue;

    const lines = section.split("\n");
    const header = lines[0]?.trim();

    // Skip non-competitor sections
    if (
      /TAM|SAM|SOM|Market|Our Position|Summary|Overview/i.test(header || "")
    ) {
      continue;
    }

    const sectionContent = section;
    const strengths = extractListItems(sectionContent, "Strengths");
    const weaknesses = extractListItems(sectionContent, "Weaknesses");

    if (strengths.length > 0 || weaknesses.length > 0) {
      competitors.push({
        name: header || "Unknown Competitor",
        strengths: strengths.slice(0, 5),
        weaknesses: weaknesses.slice(0, 5),
      });
    }
  }

  // Extract our position
  const differentiators = extractListItems(content, "Differentiators|Our Position");
  const gaps = extractListItems(content, "Gaps");
  const opportunities = extractListItems(content, "Opportunities");

  if (competitors.length === 0) missingFields.push("competitors");

  let confidence = 100;
  if (competitors.length === 0) confidence -= 40;
  if (competitors.length < 3) confidence -= 20;
  if (citations.length === 0) confidence -= 20;

  const data = {
    competitors: competitors.map((c) => ({
      name: c.name,
      strengths: c.strengths,
      weaknesses: c.weaknesses,
    })),
    ourPosition:
      differentiators.length > 0 || gaps.length > 0 || opportunities.length > 0
        ? {
            differentiators,
            gaps,
            opportunities,
          }
        : undefined,
  };

  return {
    data,
    citations,
    confidence: Math.max(0, confidence),
    missingFields,
    rawContent: content,
  };
}

export function parseUserPersonaResearch(
  content: string,
  rawCitations: RawCitation[]
): ParsedResearchResult {
  const citations = processCitations(rawCitations);
  const missingFields: string[] = [];

  // Extract personas
  const personas: Array<{
    name: string;
    demographics: Record<string, string>;
    behavior: {
      goals: string[];
      frustrations: string[];
      motivations: string[];
    };
  }> = [];

  // Split by persona headers
  const personaSections = content.split(/##\s*Persona\s*\d+/i);

  for (const section of personaSections) {
    if (section.length < 50) continue;

    // Extract name from first line
    const nameMatch = section.match(/^[:\s]*([A-Za-z\s"']+?)(?:\n|$)/);
    const name = nameMatch ? nameMatch[1].replace(/["':]/g, "").trim() : "Unnamed Persona";

    // Extract demographics
    const demographics: Record<string, string> = {};
    const ageMatch = section.match(/Age[:\s]+([^\n]+)/i);
    if (ageMatch) demographics.age = ageMatch[1].trim();

    const occupationMatch = section.match(/(?:Occupation|Job|Role)[:\s]+([^\n]+)/i);
    if (occupationMatch) demographics.occupation = occupationMatch[1].trim();

    const locationMatch = section.match(/(?:Location|Geography)[:\s]+([^\n]+)/i);
    if (locationMatch) demographics.location = locationMatch[1].trim();

    // Extract behavior
    const goals = extractListItems(section, "Goals");
    const frustrations = extractListItems(section, "Frustrations|Pain Points|Pains");
    const motivations = extractListItems(section, "Motivations|Drivers");

    if (goals.length > 0 || frustrations.length > 0) {
      personas.push({
        name,
        demographics,
        behavior: {
          goals: goals.slice(0, 5),
          frustrations: frustrations.slice(0, 5),
          motivations: motivations.slice(0, 5),
        },
      });
    }
  }

  if (personas.length === 0) missingFields.push("personas");

  let confidence = 100;
  if (personas.length === 0) confidence -= 50;
  if (personas.length < 2) confidence -= 20;
  if (citations.length === 0) confidence -= 15;

  return {
    data: { personas },
    citations,
    confidence: Math.max(0, confidence),
    missingFields,
    rawContent: content,
  };
}

export function parseSwotAnalysisResearch(
  content: string,
  rawCitations: RawCitation[]
): ParsedResearchResult {
  const citations = processCitations(rawCitations);
  const missingFields: string[] = [];

  const strengths = extractListItems(content, "Strengths").map((item) => ({
    item,
  }));
  const weaknesses = extractListItems(content, "Weaknesses").map((item) => ({
    item,
  }));
  const opportunities = extractListItems(content, "Opportunities").map(
    (item) => ({ item })
  );
  const threats = extractListItems(content, "Threats").map((item) => ({
    item,
  }));

  if (strengths.length === 0) missingFields.push("strengths");
  if (weaknesses.length === 0) missingFields.push("weaknesses");
  if (opportunities.length === 0) missingFields.push("opportunities");
  if (threats.length === 0) missingFields.push("threats");

  let confidence = 100;
  confidence -= missingFields.length * 20;
  if (citations.length === 0) confidence -= 10;

  return {
    data: {
      strengths,
      weaknesses,
      opportunities,
      threats,
    },
    citations,
    confidence: Math.max(0, confidence),
    missingFields,
    rawContent: content,
  };
}

export function parseBusinessModelCanvasResearch(
  content: string,
  rawCitations: RawCitation[]
): ParsedResearchResult {
  const citations = processCitations(rawCitations);
  const missingFields: string[] = [];

  const customerSegments = extractListItems(content, "Customer Segments").map(
    (segment) => ({ segment })
  );
  const valuePropositions = extractListItems(
    content,
    "Value Propositions?"
  ).map((proposition) => ({ proposition }));
  const channels = extractListItems(content, "Channels").map((channel) => ({
    channel,
  }));
  const customerRelationships = extractListItems(
    content,
    "Customer Relationships?"
  ).map((relationship) => ({ relationship }));
  const revenueStreams = extractListItems(content, "Revenue Streams?").map(
    (stream) => ({ stream })
  );
  const keyResources = extractListItems(content, "Key Resources").map(
    (resource) => ({ resource })
  );
  const keyActivities = extractListItems(content, "Key Activities").map(
    (activity) => ({ activity })
  );
  const keyPartnerships = extractListItems(
    content,
    "Key Partner(?:ship)?s?"
  ).map((partner) => ({ partner }));
  const costStructure = extractListItems(content, "Cost Structure").map(
    (cost) => ({ cost })
  );

  const fields = [
    { name: "customerSegments", value: customerSegments },
    { name: "valuePropositions", value: valuePropositions },
    { name: "channels", value: channels },
    { name: "revenueStreams", value: revenueStreams },
  ];

  for (const field of fields) {
    if (field.value.length === 0) missingFields.push(field.name);
  }

  let confidence = 100;
  confidence -= missingFields.length * 10;
  if (citations.length === 0) confidence -= 10;

  return {
    data: {
      customerSegments,
      valuePropositions,
      channels,
      customerRelationships,
      revenueStreams,
      keyResources,
      keyActivities,
      keyPartnerships,
      costStructure,
    },
    citations,
    confidence: Math.max(0, confidence),
    missingFields,
    rawContent: content,
  };
}

export function parseLeanCanvasResearch(
  content: string,
  rawCitations: RawCitation[]
): ParsedResearchResult {
  const citations = processCitations(rawCitations);
  const missingFields: string[] = [];

  const problems = extractListItems(content, "Problems?").map((problem) => ({
    problem,
  }));
  const customerSegments = extractListItems(content, "Customer Segments?").map(
    (segment) => ({ segment })
  );
  const solutions = extractListItems(content, "Solutions?").map((feature) => ({
    feature,
  }));
  const channels = extractListItems(content, "Channels");
  const revenueStreams = extractListItems(content, "Revenue Streams?").map(
    (stream) => ({ stream })
  );
  const costStructure = extractListItems(content, "Cost Structure").map(
    (cost) => ({ cost })
  );
  const keyMetrics = extractListItems(content, "Key Metrics|Metrics").map(
    (metric) => ({ metric })
  );

  // Extract UVP
  const uvpSection = extractSection(
    content,
    "Unique Value Proposition|UVP|Value Proposition"
  );
  const uvpLines = uvpSection.split("\n").filter((l) => l.trim().length > 10);

  if (problems.length === 0) missingFields.push("problem");
  if (customerSegments.length === 0) missingFields.push("customerSegments");

  let confidence = 100;
  confidence -= missingFields.length * 15;
  if (citations.length === 0) confidence -= 10;

  return {
    data: {
      problem: problems,
      customerSegments,
      uniqueValueProposition: {
        proposition: uvpLines[0] || "Value proposition not extracted",
      },
      solution: solutions,
      channels,
      revenueStreams,
      costStructure,
      keyMetrics,
    },
    citations,
    confidence: Math.max(0, confidence),
    missingFields,
    rawContent: content,
  };
}

export function parseValuePropositionCanvasResearch(
  content: string,
  rawCitations: RawCitation[]
): ParsedResearchResult {
  const citations = processCitations(rawCitations);
  const missingFields: string[] = [];

  // Customer Profile
  const customerJobs = extractListItems(
    content,
    "Customer Jobs|Jobs"
  ).map((job) => ({ job }));
  const pains = extractListItems(content, "Pains").map((pain) => ({ pain }));
  const gains = extractListItems(content, "Gains").map((gain) => ({ gain }));

  // Value Map
  const productsAndServices = extractListItems(
    content,
    "Products.*Services|Solutions"
  ).map((item) => ({ item }));
  const painRelievers = extractListItems(content, "Pain Relievers").map(
    (reliever) => ({ reliever })
  );
  const gainCreators = extractListItems(content, "Gain Creators").map(
    (creator) => ({ creator })
  );

  if (customerJobs.length === 0) missingFields.push("customerProfile.customerJobs");
  if (pains.length === 0) missingFields.push("customerProfile.pains");
  if (gains.length === 0) missingFields.push("customerProfile.gains");

  let confidence = 100;
  confidence -= missingFields.length * 15;
  if (citations.length === 0) confidence -= 10;

  return {
    data: {
      customerProfile: {
        customerJobs,
        pains,
        gains,
      },
      valueMap: {
        productsAndServices,
        painRelievers,
        gainCreators,
      },
    },
    citations,
    confidence: Math.max(0, confidence),
    missingFields,
    rawContent: content,
  };
}

export function parseResearchResult(
  framework: FrameworkType,
  content: string,
  rawCitations: RawCitation[]
): ParsedResearchResult {
  switch (framework) {
    case "market-sizing":
      return parseMarketSizingResearch(content, rawCitations);
    case "competitive-analysis":
      return parseCompetitiveAnalysisResearch(content, rawCitations);
    case "user-persona":
      return parseUserPersonaResearch(content, rawCitations);
    case "swot-analysis":
      return parseSwotAnalysisResearch(content, rawCitations);
    case "business-model-canvas":
      return parseBusinessModelCanvasResearch(content, rawCitations);
    case "lean-canvas":
      return parseLeanCanvasResearch(content, rawCitations);
    case "value-proposition-canvas":
      return parseValuePropositionCanvasResearch(content, rawCitations);
    default:
      return {
        data: {},
        citations: processCitations(rawCitations),
        confidence: 0,
        missingFields: ["unknown-framework"],
        rawContent: content,
      };
  }
}
