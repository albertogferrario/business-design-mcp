---
phase: 05-research-enhancement
plan: 01
subsystem: api
tags: [openai, deep-research, parsing, prompts, validation]

# Dependency graph
requires:
  - phase: 04
    provides: project export with linked entities
provides:
  - Enhanced research prompts with structured output guidance
  - Citation-to-field mapping for market-sizing and competitive-analysis
  - Data validation with warnings for extracted values
affects: [research-tools, populate-framework]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Section position extraction for citation mapping
    - Validation warnings with confidence adjustment

key-files:
  created: []
  modified:
    - src/openai/prompts.ts
    - src/openai/parser.ts

key-decisions:
  - "Keep validation rules reasonable: $1M-$100T for market sizes, -50% to 500% for growth rates"
  - "Citation mapping based on character position in content"
  - "Warnings added to all parsers (empty for frameworks without specific validation)"

patterns-established:
  - "extractSectionPositions for content section detection"
  - "Validation warnings reduce confidence but preserve data"

# Metrics
duration: 8min
completed: 2026-01-15
---

# Phase 5 Plan 1: Research Enhancement Summary

**Enhanced deep research prompts with structured output guidance, citation field mapping, and data validation warnings**

## Performance

- **Duration:** 8 min
- **Started:** 2026-01-15T00:54:00Z
- **Completed:** 2026-01-15T01:05:00Z
- **Tasks:** 3
- **Files modified:** 2

## Accomplishments

- SYSTEM_PROMPT now includes structured output requirements with citation format guidance
- Market-sizing and competitive-analysis prompts include explicit format hints
- Citations mapped to relevant fields based on position in research content
- ParsedResearchResult interface extended with warnings array
- Market sizing validates TAM >= SAM >= SOM relationships with confidence adjustment
- Competitive analysis warns when fewer than 3 competitors or missing strengths/weaknesses

## Task Commits

Each task was committed atomically:

1. **Task 1: Enhance research prompts with structured output guidance** - `8272111` (feat)
2. **Task 2: Improve citation-to-field mapping in parser** - `51e9ffb` (feat)
3. **Task 3: Add data validation for extracted values** - `b4c6668` (feat)

## Files Created/Modified

- `src/openai/prompts.ts` - Enhanced SYSTEM_PROMPT with citation format, updated market-sizing and competitive-analysis prompts with format hints
- `src/openai/parser.ts` - Added section position extraction, citation field mapping, validation helpers, and warnings field

## Decisions Made

- Validation ranges are generous to avoid false positives: $1M-$100T for market sizes, -50% to 500% for CAGR
- Citation mapping uses character position matching (startIndex within section range)
- Empty warnings array for frameworks without specific validation (backward compatible)
- Confidence penalty: 15% for TAM/SAM/SOM inconsistency, 10% for unreasonable values, 5% for growth rate

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Research enhancement foundation complete
- Ready for next plan (if applicable) or next phase
- All 184 tests passing, build succeeds

---
*Phase: 05-research-enhancement*
*Completed: 2026-01-15*
