# Roadmap: Business Design MCP

## Overview

v1.1 improvements focusing on Deep Research UX streamlining and cross-framework entity linking.

## Domain Expertise

None

## Milestones

- ✅ **v1.0 NPX Installation** - Phases 1-2 (shipped 2026-01-14)
- 🚧 **v1.1 UX Improvements** - Phases 3-4 (in progress)

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

### 🚧 v1.1 UX Improvements

- [ ] **Phase 3: Deep Research UX** - Streamline research → framework flow
- [ ] **Phase 4: Cross-framework Linking** - Connect entities across frameworks

## Phase Details

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
- [ ] 03-01: Create combined research_and_create tool
- [ ] 03-02: Update tool descriptions for better discoverability

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
- [ ] 04-01: Add linking schema and storage
- [ ] 04-02: Create linking tools
- [ ] 04-03: Update export to show relationships

## Progress

**Execution Order:**
Phases 3 and 4 can run in parallel.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. NPX Installation | 1/1 | Complete | 2026-01-14 |
| 2. Documentation | - | Complete | 2026-01-14 |
| 3. Deep Research UX | 0/2 | Planned | - |
| 4. Cross-framework Linking | 0/3 | Not started | - |
