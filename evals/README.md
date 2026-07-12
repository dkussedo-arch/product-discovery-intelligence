# RAG synthesis query evals

Canonical fixtures for **natural-language query synthesis** (TC-001 … TC-010).

| File | Purpose |
|------|---------|
| `test-cases.json` | Full fixtures: `knowledge_graph_context`, `must_contain`, `must_not_contain`, grading notes |
| `../prompts/synthesis-query.txt` | Production system prompt (6 non-negotiable rules) |
| `../prompts/evaluation/promptfooconfig.rag-query.yaml` | Promptfoo config |
| `../prompts/evaluation/rag-query-tests.promptfoo.yaml` | Generated — run `pnpm eval:sync:rag` |

## Run

```bash
pnpm eval:sync:rag
pnpm eval:gate:rag
pnpm eval:view
```

Document-analysis evals (upload JSON extraction) live separately in `prompts/evaluation/test-cases.json`.
