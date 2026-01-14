# Roadmap: Business Design MCP

## Overview

Simplify the business-design-mcp installation and storage experience. Move from home directory storage to project-local storage, and enable simple npx installation.

## Domain Expertise

None

## Phases

- [ ] **Phase 1: Project-Local Storage** - Change default storage to project directory
- [ ] **Phase 2: NPX Installation** - Enable simple npx installation
- [ ] **Phase 3: Documentation** - Update README and usage docs

## Phase Details

### Phase 1: Project-Local Storage
**Goal**: Store business design data in `.get-shit-done/` within project directory instead of `~/.business-design/`
**Depends on**: Nothing (first phase)
**Research**: Unlikely (internal storage layer modification)
**Plans**: TBD

Plans:
- [ ] 01-01: Update storage layer default path
- [ ] 01-02: Add fallback to home directory for backwards compatibility

### Phase 2: NPX Installation
**Goal**: Enable `npx business-design-mcp` or similar simple installation
**Depends on**: Phase 1
**Research**: Likely (npm publishing patterns, npx execution)
**Research topics**: npm package publishing, bin entry configuration, npx execution patterns
**Plans**: TBD

Plans:
- [ ] 02-01: Configure package.json for npm publishing
- [ ] 02-02: Test npx installation flow

### Phase 3: Documentation
**Goal**: Update README with simplified installation and usage instructions
**Depends on**: Phase 2
**Research**: Unlikely (documentation only)
**Plans**: TBD

Plans:
- [ ] 03-01: Rewrite README with new installation flow

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Project-Local Storage | 0/2 | Not started | - |
| 2. NPX Installation | 0/2 | Not started | - |
| 3. Documentation | 0/1 | Not started | - |
