# Coding Conventions

**Analysis Date:** 2026-01-14

## Naming Patterns

**Files:**
- kebab-case for all source files: `value-prop.ts`, `canvas.ts`, `project.ts`
- *.test.ts alongside source files: `canvas.test.ts`
- index.ts for barrel exports

**Functions:**
- camelCase for all functions: `createProject`, `updateBusinessModelCanvas`
- Verb-first pattern: `create*`, `get*`, `update*`, `delete*`, `list*`
- No special prefix for async functions

**Variables:**
- camelCase for variables: `initializedDataDir`, `runtimeApiKey`
- UPPER_SNAKE_CASE for constants: `DEFAULT_RETRY_CONFIG`, `SYSTEM_PROMPT`
- No underscore prefix for private members

**Types:**
- PascalCase for interfaces and types: `Project`, `BusinessModelCanvas`
- PascalCase with Schema suffix for Zod: `createProjectSchema`, `BusinessModelCanvasSchema`
- No I prefix for interfaces

## Code Style

**Formatting:**
- 2-space indentation
- Double quotes for strings
- Semicolons required
- No trailing commas in single-line
- Trailing commas in multi-line

**TypeScript:**
- Strict mode enabled (`tsconfig.json`)
- ES2022 target
- NodeNext module resolution
- Explicit return types on exported functions

## Import Organization

**Order:**
1. External packages (zod, openai, @modelcontextprotocol/sdk)
2. Local imports from other directories (../schemas, ../storage)
3. Type imports (import type {...})

**Grouping:**
- Blank line between import groups
- Grouped by source path
- Type imports with `type` keyword: `import type { Project } from "../schemas/index.js"`

**Path Pattern:**
- ES modules with .js extension: `"../storage/index.js"`
- No path aliases (use relative paths)

## Error Handling

**Patterns:**
- Custom error classes with typed codes: `StorageError`, `OpenAIConfigError`
- Throw errors in business logic, catch at boundaries
- Generic `Error` for validation failures

**Error Types:**
- `StorageError`: NOT_FOUND, WRITE_FAILED, READ_FAILED, DELETE_FAILED
- `OpenAIConfigError`: API_KEY_MISSING, API_ERROR, RATE_LIMIT, PARSE_ERROR, TIMEOUT

**Examples:**
```typescript
throw new StorageError(`Project ${projectId} not found`, "NOT_FOUND");
throw new Error(`Unknown framework type: ${frameworkType}`);
```

## Logging

**Framework:**
- `console.error` for errors and startup messages
- No structured logging

**Patterns:**
- Log errors before re-throwing
- Log retry attempts with attempt number and delay

## Comments

**When to Comment:**
- Section dividers for tool groups in `src/index.ts`
- Explain non-obvious business logic
- Document API key configuration

**Style:**
```typescript
// ============================================================================
// PROJECT MANAGEMENT TOOLS
// ============================================================================

// Reset initialization (for testing)
export function resetDirectoryInit(): void { ... }
```

**JSDoc:**
- Not required for internal functions
- Schema `.describe()` provides documentation for tools

## Function Design

**Size:**
- Keep under 50 lines
- Extract helpers for complex logic

**Parameters:**
- Use options object for 4+ parameters
- Zod schema validation at entry point

**Return Values:**
- Explicit returns
- Return null for not-found (get operations)
- Return success/failure objects for mutations

## Module Design

**Exports:**
- Named exports for all functions and schemas
- Barrel exports from index.ts files
- No default exports

**Tool Files Pattern:**
```typescript
// 1. Imports
import { z } from "zod";
import { createEntity, getEntity } from "../storage/index.js";

// 2. Schema
export const createXSchema = z.object({...});

// 3. Function
export async function createX(args: z.infer<typeof createXSchema>) {...}
```

**Response Pattern:**
```typescript
// Helper functions in src/index.ts
function jsonResponse(data: unknown) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

function errorResponse(message: string) {
  return { content: [{ type: "text", text: JSON.stringify({ error: message }) }] };
}
```

---

*Convention analysis: 2026-01-14*
*Update when patterns change*
