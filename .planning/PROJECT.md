# Business Design MCP

## What This Is

An MCP server that provides business design framework tools to Claude Code. It enables AI-assisted creation and management of Business Model Canvas, Lean Canvas, SWOT Analysis, and other strategic frameworks with optional OpenAI Deep Research integration.

## Core Value

Simple project-local storage that keeps all business research alongside the code it informs.

## Requirements

### Validated

- ✓ MCP server with 25 tools for business frameworks — existing
- ✓ 7 framework types (Business Model Canvas, Lean Canvas, Value Proposition, SWOT, Persona, Competitive, Market Sizing) — existing
- ✓ Project management (create, list, update, delete, export) — existing
- ✓ Zod schema validation for all inputs — existing
- ✓ OpenAI Deep Research integration with retry logic — existing
- ✓ Export to JSON and Markdown formats — existing

### Active

- [ ] Simplify installation to `npx` one-liner (like `npx get-shit-done-cc`)
- [ ] Store data in project folder (`.get-shit-done/` or similar) instead of `~/.business-design/`
- [ ] Update README with simpler installation instructions

### Out of Scope

- Database backend — file-based storage is appropriate for the use case
- User authentication — MCP servers run locally, no auth needed
- Web UI — this is a CLI/MCP tool

## Context

This is a brownfield project with a working MCP server. The codebase analysis in `.planning/codebase/` documents the current architecture, conventions, and concerns.

Key existing patterns:
- Storage layer in `src/storage/index.ts` uses `BUSINESS_DESIGN_DATA_DIR` env var
- Default location is `~/.business-design/` (home directory)
- Installation currently via `npx github:albertogferrario/business-design-mcp`

User wants to align with the UX patterns from [glittercowboy/get-shit-done](https://github.com/glittercowboy/get-shit-done):
- Simple npx installation
- Project-local data storage

## Constraints

- **Tech stack**: Must remain TypeScript/Node.js MCP server
- **Compatibility**: Must work with existing MCP clients (Claude Code)
- **Backwards compatible**: Existing `~/.business-design/` data should still work (or migration path)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Project-local storage default | Keeps research with code it informs, like `.planning/` pattern | — Pending |
| Keep home directory as fallback | Backwards compatibility for existing users | — Pending |

---
*Last updated: 2026-01-14 after initialization*
