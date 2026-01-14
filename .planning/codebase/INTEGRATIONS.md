# External Integrations

**Analysis Date:** 2026-01-14

## APIs & External Services

**OpenAI Deep Research API:**
- Purpose: AI-powered market research and data gathering
- SDK/Client: `openai` ^4.73.0 (`src/openai/client.ts`)
- Auth: API key via `OPENAI_API_KEY` env var OR runtime configuration
- Models Supported:
  - `o3-deep-research-2025-06-26`
  - `o4-mini-deep-research-2025-06-26` (default, faster and cheaper)
- Features:
  - Deep Research with web search preview tool
  - Citation extraction from URL annotations
  - Token usage tracking
- Error Handling:
  - Retry mechanism with exponential backoff (max 3 retries)
  - Rate limit handling (429 status)
  - Network error handling (ECONNRESET, ETIMEDOUT, ENOTFOUND)

**Email/SMS:**
- Not applicable (no email/SMS integrations)

**External APIs:**
- Not applicable (only OpenAI integration)

## Data Storage

**Databases:**
- Not applicable (file-based storage only)

**File Storage:**
- Local filesystem JSON storage
- Location: `~/.business-design/` (configurable via `BUSINESS_DESIGN_DATA_DIR`)
- Structure:
  - `projects/{projectId}.json` - Project metadata
  - `entities/{entityId}.json` - Business design entities
- Client: Node.js `fs/promises` (`src/storage/index.ts`)

**Caching:**
- Not applicable (no caching layer)

## Authentication & Identity

**Auth Provider:**
- Not applicable (no user authentication)

**API Key Management:**
- OpenAI API key stored in module-level variable
- Configuration methods:
  1. Environment variable: `OPENAI_API_KEY`
  2. Runtime via `configure_openai` tool (`src/tools/research.ts`)
- Validation: On first API call (lazy validation)

## Monitoring & Observability

**Error Tracking:**
- Not applicable (no error tracking service)

**Analytics:**
- Not applicable (no analytics)

**Logs:**
- `console.error` for errors and startup messages
- No external logging service

## CI/CD & Deployment

**Hosting:**
- Distributed as npm package via GitHub
- Installation: `npx -y github:albertogferrario/business-design-mcp`
- Runs locally as MCP server on user's machine

**CI Pipeline:**
- GitHub Actions (`.github/workflows/ci.yml`)
- Workflows:
  - Build and test on push/PR to master
  - Node.js 18, 20, 22 matrix testing
  - Coverage reports via codecov/codecov-action@v4

## Environment Configuration

**Development:**
- Required env vars: None (OpenAI key optional until research used)
- Optional env vars:
  - `OPENAI_API_KEY` - OpenAI API access
  - `BUSINESS_DESIGN_DATA_DIR` - Custom data directory
- Secrets location: Not persisted (env vars or runtime config)

**Staging:**
- Not applicable (local development only)

**Production:**
- Runs on user's machine as MCP server
- Data stored in user's home directory
- No server-side production environment

## Webhooks & Callbacks

**Incoming:**
- Not applicable (no webhooks)

**Outgoing:**
- Not applicable (no outgoing webhooks)

## Data Export Formats

**JSON Export:**
- Full project with all entities
- Structured data for programmatic access

**Markdown Export:**
- Human-readable format
- Suitable for documentation and sharing

---

*Integration audit: 2026-01-14*
*Update when adding/removing external services*
