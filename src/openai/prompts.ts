export interface ResearchContext {
  businessDescription: string;
  industry?: string;
  geography?: string;
  targetCustomers?: string;
  productOrService?: string;
  competitors?: string[];
}

export type FrameworkType =
  | "market-sizing"
  | "competitive-analysis"
  | "user-persona"
  | "swot-analysis"
  | "business-model-canvas"
  | "lean-canvas"
  | "value-proposition-canvas";

export const SYSTEM_PROMPT = `You are an expert business analyst and market researcher. Your task is to provide accurate, data-driven insights with proper citations.

Guidelines:
- Always cite sources for numerical data and statistics
- Use recent data (prefer sources from the last 2 years)
- Be specific with numbers (avoid vague terms like "large" or "significant")
- Acknowledge uncertainty when data is limited
- Structure your response clearly with headers and bullet points`;

export function generateResearchPrompt(
  framework: FrameworkType,
  context: ResearchContext
): string {
  const prompts: Record<FrameworkType, (ctx: ResearchContext) => string> = {
    "market-sizing": (ctx) => `
Research the market for: ${ctx.businessDescription}

Industry: ${ctx.industry || "Not specified - please identify"}
Geography: ${ctx.geography || "Global"}

Provide a comprehensive market sizing analysis:

## TAM (Total Addressable Market)
- Total market size in USD (annual revenue)
- Calculation methodology (top-down or bottom-up)
- Data sources with publication dates
- Key assumptions

## SAM (Serviceable Addressable Market)
- Target segments that can realistically be served
- Geographic or demographic constraints
- Estimated market size for target segments
- Percentage of TAM

## SOM (Serviceable Obtainable Market)
- Realistic market share achievable in 3-5 years
- Based on competitive landscape analysis
- Capture strategy considerations
- Percentage of SAM

## Market Growth
- CAGR (Compound Annual Growth Rate)
- Key growth drivers
- Market trends affecting growth
- Growth projections for next 5 years

Provide specific numbers with sources. Format currency in USD.
`,

    "competitive-analysis": (ctx) => `
Research competitors for: ${ctx.businessDescription}

Industry: ${ctx.industry || "Not specified - please identify"}
Known competitors to include: ${ctx.competitors?.join(", ") || "Research and identify top competitors"}

Analyze 5-10 major competitors. For each provide:

## Competitor Profile
- Company name
- Website URL
- Brief description (1-2 sentences)
- Founded year
- Funding status/amount (if startup)
- Employee count estimate

## Strengths (3-5 each)
- What they do well
- Competitive advantages

## Weaknesses (3-5 each)
- Areas of weakness
- Customer complaints

## Pricing
- Pricing model (subscription, usage-based, etc.)
- Price range or tiers
- Free tier availability

## Market Position
- Estimated market share (if available)
- Primary target audience
- Geographic focus

## Key Features
- Core product features
- Unique differentiators

After analyzing competitors, provide:

## Our Potential Position
- Key differentiators we could leverage
- Gaps in the market
- Opportunities to exploit
`,

    "user-persona": (ctx) => `
Research target customers for: ${ctx.businessDescription}

Target audience: ${ctx.targetCustomers || "Identify primary customer segments"}
Industry: ${ctx.industry || "Not specified"}

Create 2-3 detailed, research-backed user personas:

## Persona 1: [Name - e.g., "Enterprise Emma"]

### Demographics
- Age range (with market data support)
- Gender distribution in this segment
- Geographic location patterns
- Job titles and roles
- Income/budget range
- Education level

### Psychographics
- Personality traits common in this segment
- Core values and priorities
- Professional interests
- Lifestyle characteristics

### Behavior
- Primary goals (3-5)
- Key frustrations/pain points (3-5)
- Motivations and drivers (3-5)
- Preferred communication channels
- Information sources they trust
- Buying behavior and decision process
- Typical purchase timeline

### Context
- A day-in-the-life scenario
- Current solutions they use
- Quote that captures their mindset

Repeat for Persona 2 and 3.

Base personas on real market research, surveys, and demographic studies. Cite sources.
`,

    "swot-analysis": (ctx) => `
Conduct SWOT analysis for a business entering: ${ctx.businessDescription}

Industry: ${ctx.industry || "Not specified - please identify"}
Geography: ${ctx.geography || "Global"}

Provide research-backed analysis:

## Strengths (Internal, Positive)
For new entrants in this market, identify 5-7 potential strengths:
- Each strength with explanation
- Impact level: High/Medium/Low
- How to leverage it

## Weaknesses (Internal, Negative)
Common weaknesses for new entrants (5-7):
- Each weakness with explanation
- Impact level: High/Medium/Low
- Mitigation strategy

## Opportunities (External, Positive)
Market opportunities based on current trends (5-7):
- Each opportunity with market data
- Timeframe: Immediate/Short-term/Long-term
- Required actions to capture
- Potential impact

## Threats (External, Negative)
Market threats and risks (5-7):
- Each threat with context
- Likelihood: High/Medium/Low
- Contingency recommendations
- Early warning indicators

Support analysis with industry data, market reports, and trend analysis. Cite sources.
`,

    "business-model-canvas": (ctx) => `
Research market data for a Business Model Canvas: ${ctx.businessDescription}

Industry: ${ctx.industry || "Not specified - please identify"}
Target customers: ${ctx.targetCustomers || "Research primary segments"}

Provide research-backed insights for each canvas block:

## Customer Segments
- Primary customer segments in this market (with sizes)
- Segment characteristics and needs
- Which segments are underserved

## Value Propositions
- What customers in this market value most
- Unmet needs and pain points
- Successful value props from competitors

## Channels
- How competitors reach customers
- Most effective channels in this industry
- Channel costs and conversion rates (if available)

## Customer Relationships
- Relationship models that work in this market
- Customer expectations for support
- Retention strategies that work

## Revenue Streams
- Common pricing models in this industry
- Price points and willingness to pay
- Revenue mix (one-time vs recurring)

## Key Resources
- Critical resources needed to compete
- Industry-specific requirements
- Resource costs

## Key Activities
- Core activities for success
- Best practices in the industry
- Operational benchmarks

## Key Partnerships
- Common partnership models
- Strategic alliance opportunities
- Supplier landscape

## Cost Structure
- Typical cost drivers and ranges
- Industry benchmarks for margins
- Cost optimization opportunities

Cite sources for market data and benchmarks.
`,

    "lean-canvas": (ctx) => `
Research for a Lean Canvas: ${ctx.businessDescription}

Industry: ${ctx.industry || "Not specified - please identify"}
Product/Service: ${ctx.productOrService || ctx.businessDescription}

Provide research-backed insights:

## Problem (Top 3)
- Major problems customers face (with evidence)
- How severe each problem is
- Existing alternatives and their limitations
- Cost of the problem (time, money, frustration)

## Customer Segments
- Primary target segments with sizes
- Early adopter characteristics
- How to identify and reach early adopters

## Unique Value Proposition
- What makes solutions successful in this space
- Positioning opportunities
- High-level concept analogies (X for Y)

## Solution
- Key features that address the problems
- MVP scope recommendations
- What to build first

## Channels
- Effective customer acquisition channels
- Industry benchmarks for CAC
- Channel recommendations for startups

## Revenue Streams
- Viable pricing models
- Industry pricing benchmarks
- When to start charging

## Cost Structure
- Key cost drivers for startups in this space
- Typical burn rates
- Path to profitability benchmarks

## Key Metrics
- Important metrics for this business type
- Industry benchmarks for each metric
- What "good" looks like

## Unfair Advantage
- Barriers to entry in this market
- Potential defensibility factors
- What's hard to copy

Cite sources for benchmarks and market data.
`,

    "value-proposition-canvas": (ctx) => `
Research customer needs for a Value Proposition Canvas: ${ctx.businessDescription}

Target customers: ${ctx.targetCustomers || "Research primary segments"}
Industry: ${ctx.industry || "Not specified"}

## Customer Profile

### Customer Jobs
Research what customers are trying to accomplish:

Functional Jobs (tasks to complete):
- List 5-7 functional jobs with importance ranking
- Evidence of job importance

Social Jobs (how they want to be perceived):
- List 3-5 social jobs
- Why these matter

Emotional Jobs (feelings they want):
- List 3-5 emotional jobs
- Triggers and context

### Pains
Research customer frustrations:
- List 8-10 customer pains
- Severity for each: Extreme/Moderate/Light
- Evidence (reviews, surveys, research)
- Current workarounds

### Gains
Research desired outcomes:
- List 8-10 desired gains
- Relevance: Required/Expected/Desired/Unexpected
- What would delight customers
- Competitor gaps

## Value Map Insights

### Products & Services
- What solutions exist in the market
- Gaps in current offerings
- Feature comparison of top solutions

### Pain Relievers
- How successful products address pains
- Unaddressed pains (opportunities)
- Most valued pain relievers

### Gain Creators
- How products create gains
- Underserved gains (opportunities)
- Premium features that justify higher prices

## Fit Analysis
- Which customer jobs are best served by existing solutions
- Biggest opportunities for differentiation
- Recommended focus areas

Base on customer research, product reviews, and market analysis. Cite sources.
`,
  };

  return prompts[framework](context);
}
