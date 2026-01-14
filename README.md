# Business Design MCP Server

MCP server for business and project design frameworks. Create and manage Business Model Canvases, Lean Canvases, SWOT analyses, user personas, and more.

## Installation

```bash
npx business-design-mcp
```

### Claude Code

```bash
claude mcp add business-design -- npx -y business-design-mcp
```

### Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "business-design": {
      "command": "npx",
      "args": ["-y", "business-design-mcp"]
    }
  }
}
```

## Available Tools

### Project Management
- `create_project` - Create a new project to organize your business design artifacts
- `get_project` - Get project with all entities
- `update_project` - Update project metadata
- `delete_project` - Delete project and all entities
- `list_projects` - List all projects
- `list_project_entities` - List entities in a project (filter by type)
- `export_project` - Export to JSON or Markdown

### Business Model Canvas
- `create_business_model_canvas` - Osterwalder's 9 blocks: customer segments, value propositions, channels, customer relationships, revenue streams, key resources, key activities, key partnerships, cost structure
- `update_business_model_canvas` - Update existing canvas

### Lean Canvas
- `create_lean_canvas` - Ash Maurya's startup adaptation: problem, solution, unique value proposition, unfair advantage, customer segments, key metrics, channels, cost structure, revenue streams
- `update_lean_canvas` - Update existing canvas

### Value Proposition Canvas
- `create_value_proposition_canvas` - Customer profile (jobs, pains, gains) and value map (products/services, pain relievers, gain creators)
- `update_value_proposition_canvas` - Update existing canvas

### SWOT Analysis
- `create_swot_analysis` - Strengths, weaknesses, opportunities, threats with impact levels and action items
- `update_swot_analysis` - Update existing analysis

### User Personas
- `create_user_persona` - Demographics, psychographics, behavior (goals, frustrations, motivations), scenarios
- `update_user_persona` - Update existing persona

### Competitive Analysis
- `create_competitive_analysis` - Analyze competitors' strengths, weaknesses, pricing, market share, features
- `update_competitive_analysis` - Update existing analysis

### Market Sizing
- `create_market_sizing` - TAM, SAM, SOM with methodology and assumptions
- `update_market_sizing` - Update existing analysis

### Deep Research (AI-Powered)

Requires OpenAI API key (set `OPENAI_API_KEY` env var or use `configure_openai`).

- `research_and_create` - **Recommended**: Research and create any framework in one step
- `deep_research` - Run AI research (use with `populate_framework`)
- `populate_framework` - Create entity from research results
- `configure_openai` - Set API key at runtime
- `check_openai_config` - Verify API key configuration

## Data Storage

All data is stored locally in `~/.business-design/`:
- `projects/` - Project files
- `entities/` - Canvases, analyses, and personas

## Example Usage

```
> Create a project called "My Startup"

> Use AI to research and create a market sizing analysis for a B2B SaaS product

> Create user personas for technical buyers and end users

> Run a SWOT analysis for entering the market

> Export the project to markdown
```

## License

MIT
