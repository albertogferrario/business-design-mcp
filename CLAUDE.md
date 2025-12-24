# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
npm run build      # Compile TypeScript to dist/
npm run dev        # Watch mode compilation
npm test           # Run all tests with Vitest
npm run test:watch # Run tests in watch mode
npx vitest run src/tools/canvas.test.ts  # Run single test file
```

## Architecture

This is an MCP (Model Context Protocol) server that provides business design framework tools. The server runs on stdio transport.

### Core Structure

- **`src/index.ts`** - MCP server entry point. Registers all tools using `server.tool()` with Zod schemas for validation.
- **`src/tools/`** - Tool implementations. Each file exports `create*`, `update*`, `get*`, `list*` functions plus their Zod schemas (`*Schema`).
- **`src/schemas/index.ts`** - Zod schemas defining all entity types (BusinessModelCanvas, LeanCanvas, SwotAnalysis, etc.).
- **`src/storage/index.ts`** - File-based persistence layer. Stores JSON in `.business-design/` directory (configurable via `BUSINESS_DESIGN_DATA_DIR` env var).
- **`src/openai/`** - OpenAI Deep Research integration for AI-powered market research.

### Data Model

Projects contain references to entities. Entity types:
- `business-model-canvas` - Osterwalder's 9 blocks
- `lean-canvas` - Ash Maurya's startup canvas
- `value-proposition-canvas` - Customer profile + value map
- `swot-analysis` - Strengths, weaknesses, opportunities, threats
- `user-persona` - Demographics, psychographics, behavior
- `competitive-analysis` - Competitor comparison
- `market-sizing` - TAM, SAM, SOM

### Testing

Tests use Vitest with a setup file (`src/test/setup.ts`) that creates an isolated temp directory for each test run via `BUSINESS_DESIGN_DATA_DIR`. The `resetDirectoryInit()` function resets storage initialization between tests.

### Adding New Tools

1. Create schema in `src/schemas/index.ts`
2. Add CRUD functions in `src/tools/<name>.ts` with Zod input schemas
3. Export from `src/tools/index.ts`
4. Register in `src/index.ts` using `server.tool()`
5. Add tests in `src/tools/<name>.test.ts`
