# Architecture

**Analysis Date:** 2026-01-14

## Pattern Overview

**Overall:** MCP Server - Tool-based Server Architecture

**Key Characteristics:**
- Single-process Node.js application
- No HTTP server (uses stdio transport for MCP communication)
- Stateless tool execution
- File-based JSON persistence
- External API integration (OpenAI Deep Research)

## Layers

**Server Layer (`src/index.ts`):**
- Purpose: Tool registration and dispatching
- Contains: MCP server setup, tool definitions, response formatting
- Depends on: Tool layer
- Used by: MCP clients (Claude Code)

**Tool/Business Logic Layer (`src/tools/`):**
- Purpose: Business logic for each framework type
- Contains: CRUD operations, research integration
- Depends on: Validation layer, Storage layer, OpenAI layer
- Used by: Server layer

**Validation Layer (`src/schemas/`):**
- Purpose: Input validation and type definitions
- Contains: Zod schemas for all entity types
- Depends on: Nothing (pure definitions)
- Used by: Tool layer

**Storage Layer (`src/storage/`):**
- Purpose: File I/O and persistence
- Contains: Project/entity CRUD, JSON serialization
- Depends on: Node.js fs/promises
- Used by: Tool layer

**Integration Layer (`src/openai/`):**
- Purpose: External API communication
- Contains: OpenAI client, prompts, response parsing
- Depends on: openai package
- Used by: Tool layer (research tools)

## Data Flow

**Standard Entity Operation:**

1. Client calls tool via MCP (e.g., `create_business_model_canvas`)
2. `src/index.ts`: Tool handler validates input with Zod schema
3. `src/tools/<framework>.ts`: Business logic executes
4. `src/storage/index.ts`: Writes JSON to `~/.business-design/`
5. `src/index.ts`: `jsonResponse()` formats and returns result

**Deep Research Flow:**

1. Client calls `deep_research` tool
2. `src/tools/research.ts`: Generates research prompt
3. `src/openai/client.ts`: Calls OpenAI Deep Research API with retry logic
4. `src/openai/parser.ts`: Extracts structured data and citations
5. Client receives research data for `populate_framework`

**State Management:**
- File-based: All state lives in `~/.business-design/` directory
- Projects stored in `projects/{id}.json`
- Entities stored in `entities/{id}.json`
- No persistent in-memory state

## Key Abstractions

**Service Pattern:**
- Purpose: Encapsulate business logic per domain
- Examples: `src/tools/canvas.ts`, `src/tools/project.ts`, `src/tools/research.ts`
- Pattern: Exported async functions with Zod schema validation

**Entity Type System:**
- Purpose: Type-safe business design frameworks
- Examples: BusinessModelCanvas, LeanCanvas, SwotAnalysis
- Pattern: Union type with type literal discriminator

**Generic Storage:**
- Purpose: Type-safe CRUD for any entity
- Examples: `createEntity<T>()`, `getEntity<T>()`, `updateEntity<T>()`
- Pattern: Generic functions with TypeScript type parameters

## Entry Points

**Primary Entry:**
- Location: `src/index.ts`
- Triggers: CLI execution via `business-design-mcp` command
- Responsibilities: MCP server setup, tool registration, stdio transport

**Tool Export Hub:**
- Location: `src/tools/index.ts`
- Triggers: Imported by `src/index.ts`
- Responsibilities: Re-export all tool functions and schemas

## Error Handling

**Strategy:** Custom error classes with typed codes, caught at tool handler level

**Patterns:**
- `StorageError` with codes: NOT_FOUND, WRITE_FAILED, READ_FAILED, DELETE_FAILED
- `OpenAIConfigError` with codes: API_KEY_MISSING, API_ERROR, RATE_LIMIT, PARSE_ERROR, TIMEOUT
- Generic `Error` for validation failures
- `jsonResponse()` and `errorResponse()` helpers for MCP formatting

## Cross-Cutting Concerns

**Logging:**
- `console.error` for errors and startup messages
- No structured logging framework

**Validation:**
- Zod schemas at API boundary
- Runtime type checking on all inputs

**Configuration:**
- Environment variables for API keys and data directory
- Runtime configuration via `configure_openai` tool

---

*Architecture analysis: 2026-01-14*
*Update when major patterns change*
