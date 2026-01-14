# Testing Patterns

**Analysis Date:** 2026-01-14

## Test Framework

**Runner:**
- Vitest 2.1.x
- Config: `vitest.config.ts` in project root

**Assertion Library:**
- Vitest built-in expect
- Matchers: toBe, toEqual, toHaveLength, toBeDefined, toBeNull, toContain

**Run Commands:**
```bash
npm test                              # Run all tests
npm run test:watch                    # Watch mode
npx vitest run src/tools/canvas.test.ts  # Single file
npm run test:coverage                 # Coverage report
```

## Test File Organization

**Location:**
- *.test.ts alongside source files (co-located)
- No separate tests/ directory

**Naming:**
- `[name].test.ts` for all tests
- No distinction between unit/integration in filename

**Structure:**
```
src/
  tools/
    canvas.ts
    canvas.test.ts
    project.ts
    project.test.ts
  storage/
    index.ts
    storage.test.ts
  openai/
    parser.ts
    parser.test.ts
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect, beforeEach } from "vitest";

describe("Project Management Tools", () => {
  describe("createProject", () => {
    it("should create a project with all fields", async () => {
      // arrange
      const input = { name: "Test", description: "A test" };

      // act
      const result = await createProject(input);

      // assert
      expect(result.id).toBeDefined();
      expect(result.name).toBe("Test");
    });

    it("should create a project with minimal fields", async () => {
      // test code
    });
  });
});
```

**Patterns:**
- Nested `describe()` blocks by feature and function
- Use `beforeEach` for per-test setup
- Explicit arrange/act/assert comments in complex tests

## Mocking

**Framework:**
- Vitest built-in mocking (vi)
- Module mocking via `vi.mock()` at top of test file

**Patterns:**
```typescript
import { vi } from "vitest";

// Mock module
vi.mock("../openai/client.js", () => ({
  setOpenAIApiKey: vi.fn(),
  getOpenAIApiKey: vi.fn(() => null),
  executeDeepResearch: vi.fn(),
}));

// Use in test
const mockFn = vi.mocked(getOpenAIApiKey);
expect(mockFn).toHaveBeenCalled();
```

**What to Mock:**
- External API calls (OpenAI)
- Environment variables (process.env)

**What NOT to Mock:**
- Internal pure functions
- Storage layer (uses isolated temp directories)

## Fixtures and Factories

**Test Data:**
```typescript
// Inline factory
const createTestInput = () => ({
  name: "Test Project",
  description: "A test project",
  tags: ["test", "demo"],
});

// Use in test
const result = await createProject(createTestInput());
```

**Data Isolation:**
- Unique temp directory per test run
- Environment variable: `BUSINESS_DESIGN_DATA_DIR`
- Setup in `src/test/setup.ts`

## Coverage

**Requirements:**
- No enforced coverage target
- Coverage tracked for awareness

**Configuration:**
```typescript
// vitest.config.ts
coverage: {
  provider: "v8",
  reporter: ["text", "json", "html"],
  include: ["src/**/*.ts"],
  exclude: ["src/**/*.test.ts", "src/index.ts"],
}
```

**View Coverage:**
```bash
npm run test:coverage
# Opens coverage/index.html
```

## Test Types

**Unit Tests:**
- Test single function in isolation
- Mock external dependencies
- Fast: each test <100ms
- Examples: `project.test.ts`, `canvas.test.ts`

**Integration Tests:**
- Test multiple modules together
- Use real storage (isolated temp directory)
- Examples: `storage.test.ts` with actual file operations

**E2E Tests:**
- Not currently implemented
- MCP integration tested manually

## Common Patterns

**Async Testing:**
```typescript
it("should handle async operation", async () => {
  const result = await asyncFunction();
  expect(result).toBe("expected");
});
```

**Error Testing:**
```typescript
it("should return null for non-existent", async () => {
  const result = await getProject({ projectId: "non-existent" });
  expect(result).toBeNull();
});

it("should return failure message", async () => {
  const result = await deleteProject({ projectId: "non-existent" });
  expect(result.success).toBe(false);
  expect(result.message).toContain("not found");
});
```

**Schema Validation Testing:**
```typescript
describe("createProjectSchema", () => {
  it("validates required fields", () => {
    const result = createProjectSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts valid input", () => {
    const result = createProjectSchema.safeParse({ name: "Test" });
    expect(result.success).toBe(true);
  });
});
```

**Export Format Testing:**
```typescript
it("should export as JSON", async () => {
  const result = await exportProject({ projectId, format: "json" });
  const parsed = JSON.parse(result);
  expect(parsed.project.name).toBe("Test");
});

it("should export as Markdown", async () => {
  const result = await exportProject({ projectId, format: "markdown" });
  expect(result).toContain("# Test Project");
});
```

## Test Setup

**Global Setup (`src/test/setup.ts`):**
```typescript
import { beforeEach, afterAll } from "vitest";
import { join } from "path";
import { tmpdir } from "os";
import { mkdir, rm } from "fs/promises";
import { resetDirectoryInit } from "../storage/index.js";

const TEST_DATA_DIR = join(tmpdir(), `business-design-test-${Date.now()}`);

beforeEach(async () => {
  process.env.BUSINESS_DESIGN_DATA_DIR = TEST_DATA_DIR;
  resetDirectoryInit();
  await rm(TEST_DATA_DIR, { recursive: true, force: true });
  await mkdir(TEST_DATA_DIR, { recursive: true });
});

afterAll(async () => {
  await rm(TEST_DATA_DIR, { recursive: true, force: true });
});
```

**Sequential Execution:**
- Tests run sequentially (not in parallel)
- Configured: `fileParallelism: false` in `vitest.config.ts`
- Prevents storage conflicts between tests

---

*Testing analysis: 2026-01-14*
*Update when test patterns change*
