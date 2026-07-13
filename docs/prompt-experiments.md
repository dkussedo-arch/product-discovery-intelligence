# Prompt experiments

How to iterate on PDI prompts safely using branches, Anthropic Workbench, and Promptfoo.

## Prompt design principles

Every prompt in `prompts/` follows these rules:

| Principle | How we apply it |
|-----------|-----------------|
| **Be specific** | Word limits, bullet counts, and section headings — e.g. "2–4 bullets under 20 words each" |
| **Show an example** | One perfect output example embedded in each prompt |
| **Constrain the format** | JSON for synthesis/extraction/document-analysis; markdown for analyze/chat — never open-ended |
| **Structured JSON output (Stage 6)** | JSON prompts enforce: no prose or fences; `{ "error": "reason here" }` on failure; required schema declared before task rules; mental JSON validation before responding |
| **Define failure behaviour** | Exact fallback text or JSON when the model cannot answer |
| **Chain-of-thought (accuracy)** | All prompts open with a 4-step internal reasoning block before the final formatted answer |
| **Critical rules (grounding)** | Factual prompts include a CRITICAL RULES block before task rules: context-only answers, exact NOT_FOUND phrase, no fabricated citations, uncertainty hedging, product-domain scope boundary |
| **Set the temperature** | `TEMPERATURE_ANALYTICAL` (0.2) for synthesis, analyze, extraction; `TEMPERATURE_CONVERSATIONAL` (0.7) for chat |

Temperature constants live in `lib/anthropic.ts`.

## Deploy gate (mandatory)

**Do NOT deploy until the eval pass rate is at least 85%.** World-class AI products target **95%+**.

```bash
# Install Promptfoo (once)
npm install -g promptfoo

# Run document analysis eval suite
npx promptfoo eval --config prompts/evaluation/promptfooconfig.yaml

# Enforce 85% deploy gate
pnpm eval:gate

# Browser dashboard: pass rate %, failure cases, latency per test
npx promptfoo view
```

Synthesis A/B evals: `npx promptfoo eval --config prompts/evaluation/promptfooconfig.synthesis.yaml`

See [`prompts/evaluation/README.md`](../prompts/evaluation/README.md) for full details.

The gate script runs Promptfoo, writes `prompts/evaluation/latest-results.json`, and **exits non-zero** if pass rate &lt; 85%.

| Threshold | Meaning |
|-----------|---------|
| **&lt; 85%** | Deploy blocked |
| **85–94%** | Deploy allowed; below world-class |
| **≥ 95%** | World-class — safe to deploy |

### Test cases

Canonical fixtures: `prompts/evaluation/test-cases.json` (10 cases). Promptfoo YAML is generated via `pnpm eval:sync`.

| ID | Category | Scenario |
|----|----------|----------|
| tc-001 | Golden path | Dovetail interview synthesis with actions |
| tc-002 | Golden path | Decision record with dissent |
| tc-003 | Incomplete info | Vague Slack thread — no quantification |
| tc-004 | Incomplete info | Productboard cluster — no fix documented |
| tc-005 | Off-topic | Team lunch → NOT_FOUND |
| tc-006 | Off-topic | IT password reset → NOT_FOUND |
| tc-007 | Hallucination | Unverified competitor assumption |
| tc-008 | Hallucination | Qualitative retention claim, no metrics |
| tc-009 | Long/formatted | Confluence markdown with table |
| tc-010 | Long/formatted | Noisy Slack thread |

Assertions live in `prompts/evaluation/assert-document-output.mjs` and support:

- `summary_contains`: string array
- `action_items_min`: number
- `should_flag_not_found`: boolean

Add cases to `prompts/evaluation/test-cases.json`, run `pnpm eval:sync`, then `pnpm eval:gate`.

## Workflow

### 1. Create a branch for each experiment

```bash
git checkout -b prompt/improve-summary-accuracy
```

Use the naming convention `prompt/<short-description>`.

### 2. Edit the prompt

Synthesis (summary) prompts live in:

- `prompts/synthesis.txt` — production baseline
- `prompts/synthesis-cot.txt` — chain-of-thought experiment variant

Other prompts:

| File | Used by |
|------|---------|
| `prompts/document-analysis.txt` | `POST /api/analyze` (structured JSON) |
| `prompts/analyze.txt` | Legacy markdown variant — not wired to production |
| `prompts/chat.txt` | `POST /api/chat` |
| `prompts/entity-extraction.txt` | `POST /api/extract-entities` |
| `prompts/synthesis.txt` | `lib/rag/synthesis.ts` → `POST /api/query` |

Edit the relevant file in Cursor. For synthesis experiments, either:

- Update `prompts/synthesis.txt` on your branch, or
- Point `lib/rag/synthesis.ts` at a variant (e.g. `synthesis-cot`) while testing.

### 3. Test in Anthropic Workbench first

1. Copy the system prompt from `prompts/synthesis.txt` (or your variant).
2. Paste a representative user message from `prompts/evaluation/synthesis.yaml`.
3. Confirm JSON shape, citation behaviour, and conflict surfacing before running evals.

### 4. Run Promptfoo evals

Requires `ANTHROPIC_API_KEY` in your environment.

```bash
pnpm eval:synthesis
# or: npx promptfoo eval --config prompts/evaluation/promptfooconfig.synthesis.yaml
```

This compares **baseline** (`prompts/synthesis.txt`) vs **chain-of-thought** (`prompts/synthesis-cot.txt`) on the test cases in `prompts/evaluation/synthesis.yaml`.

View results:

```bash
pnpm eval:view
# or: npx promptfoo view
```

Config: `prompts/evaluation/promptfooconfig.yaml` (document gate) · `prompts/evaluation/promptfooconfig.synthesis.yaml` (synthesis A/B)

### 5. Merge if results are better

```bash
git checkout main
git merge prompt/improve-summary-accuracy
git push origin main
```

The merge commit message should describe your actual Promptfoo score delta, e.g. `prompt: add chain-of-thought to improve accuracy by 12%`.

## Assertions

Default checks on every test:

- Valid JSON output
- Non-empty `overview` and `claims`
- Every claim includes `citationIds`

Test-specific checks include onboarding/SSO recall and conflict detection between research and roadmap sources.

## Adding test cases

Add rows to `prompts/evaluation/synthesis.yaml` using excerpts from `data/sample-corpus.json`. Keep queries aligned with real PDI usage patterns.
