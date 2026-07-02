# Google AI Studio integration

**Prototype:** https://ai.studio/apps/7613e9c7-1cad-49f0-9a16-86f56fccd45f  
**Backend repo:** https://github.com/dkussedo-arch/Product-Discovery-Intelligence

Google AI Studio cannot receive direct git pushes. Use this contract to connect your AI Studio frontend to this backend.

## Deploy backend first

1. Deploy this repo to Vercel (or run locally at `http://localhost:3000`)
2. Set `ANTHROPIC_API_KEY` in environment variables

## API contract for AI Studio frontend

### Query organizational memory

```
POST {BASE_URL}/api/query
Content-Type: application/json

{ "query": "What do we know about enterprise onboarding churn?" }
```

Response includes: `overview`, `claims`, `citations`, `conflicts`, `evidenceGaps`, `nextQuestions`, `coverageState`.

### Ingest an artifact

```
POST {BASE_URL}/api/ingest
Content-Type: application/json

{
  "title": "Q1 interview synthesis",
  "content": "…",
  "source": "notion",
  "sourceUrl": "https://…",
  "author": "PM name"
}
```

### List corpus

```
GET {BASE_URL}/api/ingest
```

## Wiring in AI Studio

1. Open your [AI Studio app](https://ai.studio/apps/7613e9c7-1cad-49f0-9a16-86f56fccd45f)
2. Replace inline Gemini-only logic with `fetch()` calls to the endpoints above
3. Keep Gemini in AI Studio for UI-only flows if desired; use this backend for grounded synthesis with citations

## CORS

If AI Studio hosts the UI on a different origin, configure CORS on the deployed API or proxy requests through your deployment.
