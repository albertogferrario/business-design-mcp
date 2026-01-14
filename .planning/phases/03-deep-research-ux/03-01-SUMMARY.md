# Plan 03-01 Summary: Create Combined research_and_create Tool

## Objective

Combined `deep_research` and `populate_framework` into a single `research_and_create` tool to reduce the research-to-framework flow from 2 tool calls to 1.

## Completed Tasks

| Task | Description | Commit |
|------|-------------|--------|
| 1 | Add `researchAndCreateSchema` and `researchAndCreate` function in `src/tools/research.ts` | c94c989 |
| 2 | Export new schema and function from `src/tools/index.ts` | 717b3d1 |
| 3 | Register `research_and_create` tool in MCP server | 62ff56e |
| 4 | Add schema validation tests | 13a1bbb |

## Files Changed

| File | Change |
|------|--------|
| `src/tools/research.ts` | Added `researchAndCreateSchema` schema and `researchAndCreate` function (101 lines) |
| `src/tools/index.ts` | Added exports for new schema, function, and response type |
| `src/index.ts` | Registered `research_and_create` tool in MCP server |
| `src/tools/research.test.ts` | Added 7 test cases for schema validation |

## Implementation Details

The new `research_and_create` tool:
1. Accepts project ID, framework type, entity name, and research context
2. Executes deep research via OpenAI
3. Creates the entity with research metadata and citations
4. Returns a combined response with entity info, research metrics, and token usage

Response structure:
```typescript
{
  entity: { id, type, name },
  research: { confidence, citationCount, missingFields },
  usage: { inputTokens, outputTokens, totalTokens, estimatedCostUSD }
}
```

## Verification

- TypeScript compilation: PASS
- Test suite: 153 tests passing
- Build: SUCCESS

## Notes

- Existing `deep_research` and `populate_framework` tools remain for backwards compatibility
- Default model is `o4-mini-deep-research-2025-06-26` (faster and cheaper)
