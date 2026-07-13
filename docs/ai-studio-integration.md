# Google AI Studio integration

**Prototype:** https://ai.studio/apps/7613e9c7-1cad-49f0-9a16-86f56fccd45f  
**Backend repo:** https://github.com/dkussedo-arch/Product-Discovery-Intelligence  
**Wired UI in repo:** `/studio` route + `ai-studio/` export folder

## Option A — Use `/studio` (recommended)

Deploy this repo and open `https://your-deployment.vercel.app/studio`.

- Calls `POST /api/query` and `POST /api/ingest` via `lib/pdi-api.ts`
- Includes ingest form, API base URL, and API secret fields for cross-origin testing

## Option B — Paste into Google AI Studio

1. Deploy the backend (Vercel) with `ANTHROPIC_API_KEY` and `PDI_API_SECRET`
2. Copy `ai-studio/types.ts`, `ai-studio/pdi-api.ts`, and `ai-studio/App.tsx` into your [AI Studio app](https://ai.studio/apps/7613e9c7-1cad-49f0-9a16-86f56fccd45f)
3. Set `PDI_API_BASE` (and optionally `PDI_API_KEY` / `VITE_PDI_API_KEY`) in `pdi-api.ts` to your deployment URL and secret

See [`ai-studio/README.md`](../ai-studio/README.md) for details.

## CORS

API routes expose CORS headers for:

- `https://ai.studio`
- `https://aistudio.google.com`
- `*.ai.studio` subdomains
- `localhost:3000`

Add more origins with `ALLOWED_CORS_ORIGINS` (comma-separated).

## Environment variables

```env
ANTHROPIC_API_KEY=          # required for synthesis
HELICONE_API_KEY=           # optional — LLM observability via Helicone
PDI_API_SECRET=             # required for cross-origin API access in production
NEXT_PUBLIC_PDI_API_URL=    # optional default API base for clients
ALLOWED_CORS_ORIGINS=       # optional extra CORS origins
```

Same-origin requests from this Next.js app do not need `PDI_API_SECRET`. Cross-origin clients (e.g. AI Studio) must send `Authorization: Bearer <PDI_API_SECRET>` or `x-api-key: <PDI_API_SECRET>`.

## API contract

### Query organizational memory

```
POST {BASE_URL}/api/query
Content-Type: application/json
Authorization: Bearer <PDI_API_SECRET>   # required for cross-origin

{ "query": "What do we know about enterprise onboarding churn?" }
```

### Ingest an artifact

```
POST {BASE_URL}/api/ingest
Content-Type: application/json
Authorization: Bearer <PDI_API_SECRET>   # required for cross-origin

{
  "title": "Q1 interview synthesis",
  "content": "…",
  "source": "notion"
}
```

### List corpus

```
GET {BASE_URL}/api/ingest
Authorization: Bearer <PDI_API_SECRET>   # required for cross-origin
```
