# Technology Stack

**Analysis Date:** 2026-01-14

## Languages

**Primary:**
- TypeScript 5.5 - All application code (`package.json`, `tsconfig.json`)

**Secondary:**
- JavaScript - Generated output (`dist/`)

## Runtime

**Environment:**
- Node.js >= 18 - Required runtime (`package.json` engines field)
- ES2022 target (`tsconfig.json`)
- No browser runtime (MCP server only)

**Package Manager:**
- npm 10.x
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- MCP SDK `@modelcontextprotocol/sdk` ^1.0.0 - Server framework for MCP tools, stdio transport (`src/index.ts`)

**Testing:**
- Vitest 2.1.x - Test runner with coverage support (`vitest.config.ts`)
- @vitest/coverage-v8 - v8 coverage provider

**Build/Dev:**
- TypeScript 5.5 - Compilation to JavaScript
- tsc - TypeScript compiler

## Key Dependencies

**Critical:**
- `@modelcontextprotocol/sdk` ^1.0.0 - MCP server and stdio transport (`src/index.ts`)
- `openai` ^4.73.0 - Deep Research API client (`src/openai/client.ts`)
- `zod` ^3.23.0 - Input validation for all tools (`src/schemas/index.ts`)

**Infrastructure:**
- Node.js built-ins - fs/promises, path, os for file operations (`src/storage/index.ts`)

## Configuration

**Environment:**
- `OPENAI_API_KEY` - OpenAI API access (optional, can set at runtime)
- `BUSINESS_DESIGN_DATA_DIR` - Custom data directory (default: `~/.business-design/`)

**Build:**
- `tsconfig.json` - TypeScript configuration (ES2022, strict mode, NodeNext modules)
- `vitest.config.ts` - Test runner configuration

## Platform Requirements

**Development:**
- macOS/Linux/Windows (any platform with Node.js 18+)
- No external dependencies

**Production:**
- Runs as MCP server via stdio transport
- Installed via `npx github:albertogferrario/business-design-mcp`
- Can integrate with Claude Code desktop application

---

*Stack analysis: 2026-01-14*
*Update after major dependency changes*
