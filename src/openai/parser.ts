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
  warnings: string[];
  rawContent: string;
}

function generateCitationId(): string {
  return `cit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

// Section mapping for citation field association
interface SectionRange {
  start: number;
  end: number;
}

type FieldSections = Record<string, SectionRange>;

// Map a citation to fields based on its position in content
function mapCitationToFields(
  citation: RawCitation,
  fieldSections: FieldSections
): string[] {
  const relevantFields: string[] = [];

  for (const [fieldName, range] of Object.entries(fieldSections)) {
    // Citation falls within this section
    if (citation.startIndex >= range.start && citation.startIndex < range.end) {
      relevantFields.push(fieldName);
    }
  }

  return relevantFields;
}

function processCitations(
  rawCitations: RawCitation[],
  fieldSections?: FieldSections
): Citation[] {
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
      relevantFields: fieldSections ? mapCitationToFields(c, fieldSections) : [],
    }));
}

// Extract section positions from content for citation mapping
function extractSectionPositions(
  content: string,
  sectionPatterns: Record<string, string>
): FieldSections {
  const fieldSections: FieldSections = {};
  const contentLength = content.length;

  // Find all section positions
  interface SectionPos {
    field: string;
    start: number;
  }

  const positions: SectionPos[] = [];

  for (const [fieldName, patternStr] of Object.entries(sectionPatterns)) {
    const pattern = new RegExp(`##?\\s*(?:${patternStr})`, "i");
    const match = content.match(pattern);
    if (match && match.index !== undefined) {
      positions.push({ field: fieldName, start: match.index });
    }
  }

  // Sort by position
  positions.sort((a, b) => a.start - b.start);

  // Assign end positions (next section start or end of content)
  for (let i = 0; i < positions.length; i++) {
    const current = positions[i];
    const nextStart = i + 1 < positions.length ? positions[i + 1].start : contentLength;
    fieldSections[current.field] = { start: current.start, end: nextStart };
  }

  return fieldSections;
}

// Validation helpers for extracted data
function isReasonableMarketSize(value: number): boolean {
  // $1M to $100T is reasonable market size range
  return value >= 1_000_000 && value <= 100_000_000_000_000;
}

function isReasonableGrowthRate(rate: number): boolean {
  // -50% to 500% is reasonable CAGR range
  return rate >= -50 && rate <= 500;
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
  const missingFields: string[] = [];

  // Calculate section positions for citation mapping
  const sectionPatterns = {
    "tam": "TAM|Total Addressable Market",
    "sam": "SAM|Serviceable Addressable Market",
    "som": "SOM|Serviceable Obtainable Market",
    "growthRate": "Growth|CAGR|Market Growth",
  };
  const fieldSections = extractSectionPositions(content, sectionPatterns);

  // Process citations with section mapping
  const citations = processCitations(rawCitations, fieldSections);

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

  // Validation warnings
  const warnings: string[] = [];

  // Validate TAM >= SAM >= SOM relationship
  if (tamValue && samValue && tamValue < samValue) {
    warnings.push("Data inconsistency: TAM is smaller than SAM");
    confidence -= 15;
  }
  if (samValue && somValue && samValue < somValue) {
    warnings.push("Data inconsistency: SAM is smaller than SOM");
    confidence -= 15;
  }

  // Validate market size reasonableness
  if (tamValue && !isReasonableMarketSize(tamValue)) {
    warnings.push(`TAM value ${tamValue} outside reasonable range ($1M - $100T)`);
    confidence -= 10;
  }
  if (samValue && !isReasonableMarketSize(samValue)) {
    warnings.push(`SAM value ${samValue} outside reasonable range ($1M - $100T)`);
    confidence -= 10;
  }
  if (somValue && !isReasonableMarketSize(somValue)) {
    warnings.push(`SOM value ${somValue} outside reasonable range ($1M - $100T)`);
    confidence -= 10;
  }

  // Validate growth rate reasonableness
  if (growthRate !== undefined && !isReasonableGrowthRate(growthRate)) {
    warnings.push(`Growth rate ${growthRate}% outside reasonable range (-50% to 500%)`);
    confidence -= 5;
  }

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
    warnings,
    rawContent: content,
  };
}

export function parseCompetitiveAnalysisResearch(
  content: string,
  rawCitations: RawCitation[]
): ParsedResearchResult {
  const missingFields: string[] = [];

  // Build section mapping for competitors and our position
  // Find all competitor sections (## [Name] followed by ### Strengths/Weaknesses)
  const fieldSections: FieldSections = {};
  const competitorSectionPattern = /##\s+(?!Our\s+Position|Potential\s+Position|Summary|Overview|Market)([A-Za-z0-9\s&.-]+?)(?:\n)/gi;
  let competitorIndex = 0;
  let match;

  while ((match = competitorSectionPattern.exec(content)) !== null) {
    if (match.index !== undefined) {
      const competitorName = match[1].trim();
      // Find next ## section or end of content
      const nextSectionMatch = content.slice(match.index + match[0].length).match(/\n##\s+/);
      const endPos = nextSectionMatch
        ? match.index + match[0].length + nextSectionMatch.index!
        : content.length;

      fieldSections[`competitors[${competitorIndex}]`] = {
        start: match.index,
        end: endPos,
      };
      competitorIndex++;
    }
  }

  // Add our position section
  const ourPosMatch = content.match(/##\s*(?:Our\s+(?:Potential\s+)?Position)/i);
  if (ourPosMatch && ourPosMatch.index !== undefined) {
    fieldSections["ourPosition"] = {
      start: ourPosMatch.index,
      end: content.length,
    };
  }

  // Process citations with section mapping
  const citations = processCitations(rawCitations, fieldSections);

  // Extract competitor sections
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
      /TAM|SAM|SOM|Market|Our Position|Potential Position|Summary|Overview/i.test(header || "")
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

  // Validation warnings
  const warnings: string[] = [];

  // Warn if fewer than 3 competitors found
  if (competitors.length > 0 && competitors.length < 3) {
    warnings.push(`Only ${competitors.length} competitor(s) found; recommend at least 3 for thorough analysis`);
  }

  // Warn if any competitor has zero strengths or weaknesses
  for (const competitor of competitors) {
    if (competitor.strengths.length === 0) {
      warnings.push(`Competitor "${competitor.name}" has no strengths identified`);
    }
    if (competitor.weaknesses.length === 0) {
      warnings.push(`Competitor "${competitor.name}" has no weaknesses identified`);
    }
  }

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
    warnings,
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
    warnings: [],
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
    warnings: [],
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
    warnings: [],
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
    warnings: [],
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
    warnings: [],
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
        warnings: [],
        rawContent: content,
      };
  }
}
