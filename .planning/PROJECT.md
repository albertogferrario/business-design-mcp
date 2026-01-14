# Business Design MCP

## What This Is

An MCP server that provides business design framework tools to Claude Code. It enables AI-assisted creation and management of Business Model Canvas, Lean Canvas, SWOT Analysis, and other strategic frameworks with optional OpenAI Deep Research integration.

## Core Value

Simple npx installation for quick setup across any project.

## Requirements

### Validated

- ✓ MCP server with 25 tools for business frameworks — existing
- ✓ 7 framework types (Business Model Canvas, Lean Canvas, Value Proposition, SWOT, Persona, Competitive, Market Sizing) — existing
- ✓ Project management (create, list, update, delete, export) — existing
- ✓ Zod schema validation for all inputs — existing
- ✓ OpenAI Deep Research integration with retry logic — existing
- ✓ Export to JSON and Markdown formats — existing
- ✓ Home directory storage (`~/.business-design/`) for cross-project access — existing

### Active

- [ ] Simplify installation to `npx` one-liner (like `npx get-shit-done-cc`)
- [ ] Update README with simpler installation instructions

### Out of Scope

- Database backend — file-based storage is appropriate for the use case
- User authentication — MCP servers run locally, no auth needed
- Web UI — this is a CLI/MCP tool
- Project-local storage — home directory allows sharing across projects

## Context

This is a brownfield project with a working MCP server. The codebase analysis in `.planning/codebase/` documents the current architecture, conventions, and concerns.

Key existing patterns:
- Storage layer in `src/storage/index.ts` uses `BUSINESS_DESIGN_DATA_DIR` env var
- Default location is `~/.business-design/` (home directory, shared across projects)
- Installation currently via `npx github:albertogferrario/business-design-mcp`

User wants to align with the UX patterns from [glittercowboy/get-shit-done](https://github.com/glittercowboy/get-shit-done):
- Simple npx installation

## Constraints

- **Tech stack**: Must remain TypeScript/Node.js MCP server
- **Compatibility**: Must work with existing MCP clients (Claude Code)
- **Storage**: Keep home directory storage for cross-project sharing

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Keep home directory storage | Allows sharing business analysis across multiple projects | Confirmed |

---
*Last updated: 2026-01-14 after requirement change*
