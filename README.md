# Website Analyzer MCP

Analyze any website directly from your AI coding assistant.

**Turn any website into a reusable design system.**  
Reverse-engineer websites into design rules your AI coding agent can understand.

Built with:
- MCP
- Playwright
- TypeScript

> Free / open source. This MCP does **not** call paid LLM APIs — it returns structured JSON (and optional template markdown) to your own Claude / Cursor / Gemini / Ollama client.

## Features

- Website page inspection
- DOM + CSS analysis
- Color / typography / spacing extraction
- Border radius & shadow detection
- Responsive analysis (mobile / tablet / desktop)
- Screenshot capture (up to 5 viewports)
- Design system tokens (structured JSON)
- Deterministic markdown documentation
- SSRF protection + robots.txt respect

## Supported MCP Clients

- Claude Code
- Cursor
- VS Code
- Claude Desktop
- Other MCP-compatible clients

## Installation

```bash
npm install
npx playwright install chromium
npm run build
```

Or run from source:

```bash
npx tsx src/index.ts
```

### Cursor / Claude Desktop config

```json
{
  "mcpServers": {
    "website-analyzer": {
      "command": "npx",
      "args": ["tsx", "/absolute/path/to/website-analyzer-mcp/src/index.ts"]
    }
  }
}
```

After `npm run build`:

```json
{
  "mcpServers": {
    "website-analyzer": {
      "command": "node",
      "args": ["/absolute/path/to/website-analyzer-mcp/dist/index.js"]
    }
  }
}
```

## Configuration

Copy `.env.example` or set environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `MAX_PAGES` | `20` | Crawl page cap (v0.2+) |
| `REQUEST_TIMEOUT` | `30000` | Navigation timeout (ms) |
| `MAX_DEPTH` | `2` | Crawl depth (v0.2+) |
| `SCREENSHOT` | `true` | Capture screenshots in `generate_docs` |
| `MOBILE_VIEW` / `TABLET_VIEW` / `DESKTOP_VIEW` | `true` | Which viewport bands to sample |
| `USER_AGENT` | `WebsiteAnalyzerMCP/1.0` | Request user agent |
| `RESPECT_ROBOTS_TXT` | `true` | Honor robots.txt Disallow |
| `WEBSITE_ANALYZER_OUTPUT` | package `output/` | Override default screenshot/output root |

## Tools (v0.1)

| Tool | Role |
|------|------|
| `inspect_page` | Structured DOM/page JSON |
| `capture_screenshot` | `mobile.png` / `tablet.png` / `desktop.png` + viewport PNGs |
| `analyze_design` | Colors, type, spacing, radius, shadows, layout, components → JSON |
| `analyze_responsive` | Breakpoint / media-query analysis (+ optional shots) |
| `generate_docs` | Writes `design.md`, `rule.md`, `component.md`, `layout.md`, `content.md`, `README.md` |

Prompt: `analyze_website_design` — guides the host LLM to interpret analyzer JSON.

## Usage

Ask your agent:

```text
Analyze https://example.com

Create:
- design.md
- rule.md
- component.md
- layout.md
- README.md
```

Preferred flow:

1. `inspect_page` / `analyze_design` / `analyze_responsive` → JSON for the LLM  
2. or `generate_docs` → deterministic files under `docs/<host>/`

## Security

- Blocks localhost / private IP / link-local / cloud metadata SSRF targets
- Optional robots.txt enforcement (`RESPECT_ROBOTS_TXT=true`)
- Timeouts and page caps via env

This tool is intended for legitimate website analysis. Respect website terms, robots.txt, rate limits, and applicable laws.

## Limitations (v0.1)

- Single URL / single page (no multi-page crawler yet — planned v0.2)
- Template docs are deterministic heuristics, not LLM-authored prose
- Cross-origin stylesheets may be incomplete

## Docker

```bash
docker compose build
docker compose run --rm website-analyzer-mcp
```

## Development

```bash
npm run typecheck
npm test
npm run smoke
npm run build
```

## Release / แจกจ่าย

CI/CD อยู่ที่ `.github/workflows/`:

- `ci.yml` — typecheck, build, test ทุก PR/push
- `release.yml` — เมื่อ push แท็ก `v*` จะ publish ไป:
  - **npm** (`npx website-analyzer-mcp`)
  - **GHCR** (`ghcr.io/<owner>/website-analyzer-mcp`)
  - **GitHub Releases**

คู่มือตั้งค่าครั้งแรก: [docs/RELEASE.md](docs/RELEASE.md)

หลัง publish แล้วผู้ใช้ติดตั้ง MCP ได้แบบนี้:

```json
{
  "mcpServers": {
    "website-analyzer": {
      "command": "npx",
      "args": ["-y", "website-analyzer-mcp"]
    }
  }
}
```

## License

MIT
