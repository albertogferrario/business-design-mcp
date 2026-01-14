# Roadmap: Business Design MCP

## Overview

AI-powered business design frameworks with deep research, intelligent suggestions, and model validation.

## Domain Expertise

None

## Milestones

- ✅ **v1.0 NPX Installation** - Phases 1-2 (shipped 2026-01-14)
- ✅ **v1.1 UX Improvements** - Phases 3-4 (shipped 2026-01-15)
- 🚧 **v1.2 AI Enhancements** - Phases 5-8 (in progress)

## Phases

<details>
<summary>✅ v1.0 NPX Installation (Phases 1-2) - SHIPPED 2026-01-14</summary>

### Phase 1: NPX Installation
**Goal**: Enable `npx business-design-mcp` installation
**Plans**: 1 plan

Plans:
- [x] 01-01: Configure package.json for npm publishing

### Phase 2: Documentation
**Goal**: Update README with simplified installation
**Plans**: 0 (done inline)

</details>

<details>
<summary>✅ v1.1 UX Improvements (Phases 3-4) - SHIPPED 2026-01-15</summary>

- [x] **Phase 3: Deep Research UX** - Streamline research → framework flow ✅
- [x] **Phase 4: Cross-framework Linking** - Connect entities across frameworks ✅

</details>

### 🚧 v1.2 AI Enhancements (In Progress)

**Milestone Goal:** Enhance AI capabilities for smarter research, suggestions, and validation.

- [ ] **Phase 5: Research Enhancement** - Improve deep research quality
- [ ] **Phase 6: AI-Powered Suggestions** - Canvas completion suggestions
- [ ] **Phase 7: Competitive Intelligence** - Enhanced competitor analysis
- [ ] **Phase 8: Smart Validation** - Business model coherence checks

## Phase Details

<details>
<summary>✅ v1.1 Phase Details (Phases 3-4)</summary>

### Phase 3: Deep Research UX
**Goal**: Reduce research-to-framework from 2 tool calls to 1
**Depends on**: Nothing
**Research**: Unlikely (internal refactoring)
**Plans**: 2

Current flow:
1. `deep_research` → returns parsed data + citations
2. `populate_framework` → creates entity from data

Target flow:
1. `research_and_create` → single tool that does both

Plans:
- [x] 03-01: Create combined research_and_create tool
- [x] 03-02: Update tool descriptions for better discoverability

Plan files: `.planning/phases/03-deep-research-ux/`

### Phase 4: Cross-framework Linking
**Goal**: Enable linking entities (persona → canvas, SWOT → competitive analysis)
**Depends on**: Nothing (parallel with Phase 3)
**Research**: Unlikely (schema extension)
**Plans**: TBD

Changes needed:
- Add `linkedEntities` field to BaseEntitySchema
- Create `link_entities` tool
- Create `get_linked_entities` tool
- Update export to include linked relationships

Plans:
- [x] 04-01: Add linking schema and storage ✅
- [x] 04-02: Create linking tools ✅
- [x] 04-03: Update export to show relationships ✅

Plan files: `.planning/phases/04-cross-framework-linking/`

</details>

### Phase 5: Research Enhancement
**Goal**: Improve deep research quality with better prompts and source handling
**Depends on**: Previous milestone complete
**Research**: Unlikely (internal improvements)
**Plans**: TBD

Plans:
- [ ] 05-01: TBD (run /gsd:plan-phase 5 to break down)

Plan files: `.planning/phases/05-research-enhancement/`

### Phase 6: AI-Powered Suggestions
**Goal**: Add AI-powered suggestions for canvas field completion
**Depends on**: Phase 5
**Research**: Likely (OpenAI/Claude API patterns)
**Research topics**: Current best practices for structured output, function calling patterns
**Plans**: TBD

Plans:
- [ ] 06-01: TBD (run /gsd:plan-phase 6 to break down)

Plan files: `.planning/phases/06-ai-suggestions/`

### Phase 7: Competitive Intelligence
**Goal**: AI-enhanced competitor analysis with web data
**Depends on**: Phase 6
**Research**: Likely (web scraping, data sources)
**Research topics**: Legal web scraping patterns, competitor data APIs
**Plans**: TBD

Plans:
- [ ] 07-01: TBD (run /gsd:plan-phase 7 to break down)

Plan files: `.planning/phases/07-competitive-intelligence/`

### Phase 8: Smart Validation
**Goal**: AI validation of business model coherence and completeness
**Depends on**: Phase 7
**Research**: Unlikely (internal logic)
**Plans**: TBD

Plans:
- [ ] 08-01: TBD (run /gsd:plan-phase 8 to break down)

Plan files: `.planning/phases/08-smart-validation/`

## Progress

**Execution Order:**
Phases execute sequentially: 5 → 6 → 7 → 8

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. NPX Installation | v1.0 | 1/1 | Complete | 2026-01-14 |
| 2. Documentation | v1.0 | - | Complete | 2026-01-14 |
| 3. Deep Research UX | v1.1 | 2/2 | Complete | 2026-01-15 |
| 4. Cross-framework Linking | v1.1 | 3/3 | Complete | 2026-01-15 |
| 5. Research Enhancement | v1.2 | 0/? | Not started | - |
| 6. AI-Powered Suggestions | v1.2 | 0/? | Not started | - |
| 7. Competitive Intelligence | v1.2 | 0/? | Not started | - |
| 8. Smart Validation | v1.2 | 0/? | Not started | - |
