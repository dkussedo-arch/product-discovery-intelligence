# Product Discovery Intelligence

**An AI-native organizational memory platform for product teams.**

Unite fragmented discovery knowledge — research, assumptions, and decisions — into an active, auditable memory layer that compounds instead of disappearing. This console or platform is designed to build a durable product discovery graph, connecting unstructured customer research evidence directly to live roadmap decisions.

| Resource | Link |
|----------|------|
| **GitHub** | [dkussedo-arch/Product-Discovery-Intelligence](https://github.com/dkussedo-arch/Product-Discovery-Intelligence) |
| **Frontend prototype (Google AI Studio)** | [AI Studio app](https://ai.studio/apps/7613e9c7-1cad-49f0-9a16-86f56fccd45f) |

## What this repo is

This repository contains the **Phase 1 engineering build** for PDI:

- RAG query interface: natural language in → attributed synthesis out
- Sample discovery corpus (Dovetail, Notion, Productboard, Slack, Confluence)
- Citation panel with confidence levels and evidence gaps
- Artifact ingest API for adding documents

Product strategy and AI architecture are documented in:

- [`PDI_Product_Brief.md`](./PDI_Product_Brief.md)
- [`PDI_AI_Approach_Document.md`](./PDI_AI_Approach_Document.md)

## Google AI Studio + this repo

The [Google AI Studio app](https://ai.studio/apps/7613e9c7-1cad-49f0-9a16-86f56fccd45f) is the **frontend prototype** surface. This repo is the **production codebase** with a Next.js app and API routes.

To connect them:

1. In AI Studio, use **Get code** / export and align API calls to `POST /api/query` and `POST /api/ingest`
2. Deploy this repo (e.g. Vercel) and point the AI Studio frontend at your deployment URL
3. Or continue UI iteration in AI Studio while backend logic lives here

## Quick start

```bash
pnpm install
cp .env.example .env.local
# Add ANTHROPIC_API_KEY to .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and try:

> What do we know about why enterprise customers churn in the first 90 days?

## API

### `POST /api/query`

```json
{ "query": "What assumptions are driving our Q1 roadmap?" }
```

Returns a synthesis with claims, citations, conflicts, evidence gaps, and next questions.

### `POST /api/ingest`

```json
{
  "title": "Interview synthesis",
  "content": "…",
  "source": "notion",
  "sourceUrl": "https://…",
  "author": "PM name",
  "tags": ["onboarding"]
}
```

### `GET /api/ingest`

Lists ingested artifacts.

## Phase 1 scope (per AI Approach doc)

- [x] Chunking + retrieval pipeline (hybrid lexical + embedding)
- [x] Claude synthesis with citations and confidence
- [x] Sample corpus + ingest API
- [ ] Notion OAuth connector (Phase 1 stretch)
- [ ] Qdrant + Neo4j knowledge graph (Phase 2)

## Deploy

```bash
pnpm build
```

Set these on your hosting provider (Vercel, etc.):

- `ANTHROPIC_API_KEY` (required)
- `PDI_API_SECRET` (required for cross-origin / AI Studio clients)
- `HELICONE_API_KEY` (optional)
- `ALLOWED_CORS_ORIGINS` (optional)

---

*Research repositories become graveyards. PDI makes discovery knowledge compound.*
