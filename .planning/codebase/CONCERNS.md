# Codebase Concerns

**Analysis Date:** 2026-01-14

## Tech Debt

**Tool handlers lack error boundaries:**
- Issue: All 25 tool handlers in `src/index.ts` call schema.parse() and async functions without try-catch
- Files: `src/index.ts` (lines 97-325)
- Why: Quick implementation pattern, relying on MCP SDK error handling
- Impact: Unhandled errors may not be properly communicated to clients
- Fix approach: Wrap each handler in try-catch with `errorResponse()` fallback

**Untyped error throws in business logic:**
- Issue: Generic `Error` thrown instead of typed exceptions
- Files: `src/tools/project.ts` (line 53), `src/tools/canvas.ts`, `src/tools/lean.ts`, `src/tools/competitive.ts`, `src/tools/swot.ts`, `src/tools/persona.ts`, `src/tools/market.ts`, `src/tools/value-prop.ts`, `src/tools/research.ts` (line 424)
- Why: Faster to implement than custom error classes
- Impact: Cannot differentiate between validation errors, not-found errors, and data errors
- Fix approach: Create typed error classes similar to `StorageError`

## Known Bugs

**None identified during analysis.**

The codebase is relatively clean with no obvious bugs found.

## Security Considerations

**Unsafe JSON.parse without validation:**
- Risk: Direct `JSON.parse()` calls without schema validation after file read
- Files: `src/storage/index.ts` (lines 97, 152, 205)
- Current mitigation: TypeScript type assertions, ENOENT handling
- Recommendations: Add Zod validation after JSON.parse for corrupted file detection

**Weak ID generation:**
- Risk: `Math.random()` used for ID generation (`src/storage/index.ts` lines 59-61)
- Current mitigation: Combined with timestamp for reasonable uniqueness
- Recommendations: Use `crypto.randomUUID()` for cryptographic randomness

**API key stored in memory:**
- Risk: OpenAI API key stored in module-level variable (`src/openai/client.ts` lines 3-11)
- Current mitigation: None (designed behavior for runtime configuration)
- Recommendations: Document security implications in README

## Performance Bottlenecks

**None significant.**

File-based storage is appropriate for the use case. No N+1 queries or inefficient patterns detected.

## Fragile Areas

**Type assertion bypass in populateFramework:**
- Files: `src/tools/research.ts` (lines 207-410)
- Why fragile: `researchData` typed as `z.record(z.unknown())` then cast to specific shapes
- Common failures: Silent defaults (0 for numbers, [] for arrays) if data format changes
- Safe modification: Add explicit schema validation before type assertion
- Test coverage: Partial coverage, mocked research data

**Error handling inconsistency in storage layer:**
- Files: `src/storage/index.ts`
- Why fragile: Mixed patterns - some return null, others throw, others return false
- Common failures: Callers must handle multiple return types
- Safe modification: Standardize on Either pattern or consistent throw/null
- Test coverage: Good coverage but patterns vary

## Scaling Limits

**File-based storage:**
- Current capacity: Suitable for individual/small team use
- Limit: Performance degrades with hundreds of entities per project
- Symptoms at limit: Slow list operations, file system limits
- Scaling path: Migrate to SQLite or similar embedded database

## Dependencies at Risk

**None identified.**

All dependencies are actively maintained:
- @modelcontextprotocol/sdk - Anthropic maintained
- openai - OpenAI maintained
- zod - Active community

## Missing Critical Features

**No .env.example file:**
- Problem: Environment variables not documented
- Current workaround: Users must read source code
- Blocks: Easy onboarding
- Implementation complexity: Low (create file with variable names)

## Test Coverage Gaps

**Error boundary behavior:**
- What's not tested: How tool handlers behave when exceptions are thrown
- Risk: Error responses may not be properly formatted for MCP clients
- Priority: Medium
- Difficulty to test: Need to inject failures into business logic

**Full Deep Research flow:**
- What's not tested: End-to-end OpenAI API call with real responses
- Risk: API format changes could break parsing
- Priority: Low (external API, difficult to test)
- Difficulty to test: Requires API key and costs money

---

## Positive Notes

The codebase has solid strengths:
- Comprehensive Zod schema validation at API boundaries
- Well-structured TypeScript with strict mode enabled
- Good test coverage with co-located test files
- Clear separation of concerns (tools, storage, integrations)
- Retry logic with exponential backoff for API calls
- No hardcoded secrets in source code

---

*Concerns audit: 2026-01-14*
*Update as issues are fixed or new ones discovered*
