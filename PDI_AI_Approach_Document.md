# AI Approach Document
## Product Discovery Intelligence
**An AI-Native Organizational Memory Platform for Product Teams**

---

> **Version:** 1.1 · **Date:** July 2026 · **Status:** Production-Ready — For Engineering and Stakeholder Review
> **Author:** Product & AI Strategy · **Classification:** Internal — Confidential
> **Intended Readers:** ML Engineers · Backend Engineers · CPO · Product Design Lead · Investors
> **Revision note (v1.1):** Incorporates stress-test findings on graph liability, Slack ingestion risk, monitoring alert fatigue, production safety requirements, and RAG-first build sequencing.

---

## Document Purpose

This document defines the technical and strategic approach for integrating AI into Product Discovery Intelligence (PDI). It is the authoritative reference for how AI is built, evaluated, and iterated on in this product. It is written to a standard where a new engineer joining the team can read it and understand not only what is being built, but why every significant architectural and model decision was made. Where recommendations are provisional and depend on data or decisions not yet resolved, that proviso is stated explicitly.

---

## Product Context

| Field | Value |
|---|---|
| **Product name** | Product Discovery Intelligence (PDI) |
| **Product type** | B2B SaaS platform — AI-native, subscription |
| **One-line description** | Organisational memory platform that connects research, assumptions, and decisions for product teams — so discovery knowledge compounds instead of disappearing |
| **Primary user** | Senior Product Manager or Product Lead at a B2B SaaS company with 50–1,200 employees, making high-stakes roadmap decisions weekly without a reliable system for accessing what their organisation already knows |
| **Core problem** | Product teams generate discovery continuously across 6–8 disconnected tools (Dovetail, Productboard, Notion, Miro, Confluence, Slack, Jira, Linear) but have no system that connects research to decisions, preserves assumptions, or makes prior learning findable when the next relevant question arises — forcing teams to repeatedly re-research solved problems and re-build context that was never truly lost, only permanently inaccessible |
| **Build stage** | 0 → 1 (greenfield build — no legacy AI system exists) |
| **Team size** | Small: 1 PM · 4–6 engineers (2 backend/infra, 2 ML/NLP, 1–2 frontend) · 1 ML Data Scientist · 1 Designer · 2 Customer Success |
| **Primary AI patterns** | RAG (Retrieval-Augmented Generation) · Knowledge Graph Construction · Proactive Monitoring · Synthesis Pipeline |

---

## Section 1 — The AI Problem Statement

### Why AI — Not Just Software

The problem PDI solves is not a workflow problem. It is an intelligence problem. Every existing tool in the discovery stack — Dovetail, Productboard, Notion, Confluence — already stores artifacts. The failure is not in storage. It is in connection, persistence, and surfacing.

A deterministic system — better search, smarter tagging, improved folder structure — cannot solve this. Keyword search fails for non-obvious queries. Tagging systems degrade when team composition changes. Folder structure cannot represent the relationship between a customer interview, the assumption it informed, and the roadmap decision that depended on that assumption. These relationships are rarely made explicit at the time of creation. They live in the unstructured reasoning that surrounds the artifact, not in the artifact itself.

The capability gap that makes AI necessary is threefold:

**First, relationship inference across heterogeneous, unstructured documents.** The link between *this interview finding* and *that roadmap decision* is not a hyperlink. It is a semantic relationship embedded in how one document uses language from another, how one decision echoes reasoning from a prior one, how an assumption in a Notion page maps to language in a Miro board from six months earlier. No deterministic system can infer this. A fine-tuned LLM running over a vector index of the organisation's full discovery corpus can — at a quality level that is production-viable as of 2026.

**Second, natural language synthesis over large, heterogeneous corpora.** The question *"What do we know about why enterprise customers churn in the first 90 days?"* requires spanning Dovetail interview notes, a Productboard feedback cluster, a Confluence decision record, and a Slack thread from Q3 last year — synthesising them into a coherent, attributed, uncertainty-aware answer. No search engine, no knowledge management tool, and no BI dashboard can do this. A retrieval-augmented generation system grounded in the organisation's own documents can.

**Third, proactive monitoring over an evolving knowledge state.** The most expensive failures in the research are not cases where teams searched and found nothing. They are cases where teams did not know to search — because they did not know that contradicting evidence existed, that an assumption had expired, or that a prior experiment had already answered the question they were about to test. This requires an AI layer that continuously monitors the state of the knowledge graph and surfaces conditions proactively, without waiting to be asked. This is an ambient intelligence capability. It cannot be built without AI.

### The Counterfactual

Without the AI layer, PDI is a slightly better Notion — a structured documentation tool with good search. That product already exists and already fails to solve the problem. Research confirms this: 70% of product professionals find retrieval from their existing documentation tools difficult or very difficult, despite most of them already using purpose-built repositories. The AI layer is not an enhancement to PDI. It is the product. Removing it leaves no differentiated value proposition.

---

## Section 2 — AI Pattern and Architecture

### Primary Pattern: Hybrid RAG + Knowledge Graph + Proactive Monitor

PDI does not use a single AI architecture. It uses three interconnected patterns that share an underlying knowledge corpus and complement each other's limitations.

**RAG (Retrieval-Augmented Generation)** handles natural language query and on-demand synthesis. It is the user-facing pattern — the interface through which a PM asks *"What do we know about X?"* and receives a synthesised, attributed answer.

**Knowledge Graph Construction** handles the extraction and relationship-mapping that makes RAG meaningful over discovery-specific entities. Without it, RAG retrieves documents. With it, RAG retrieves connected knowledge — not just "here is an interview transcript" but "here is the insight from that transcript, connected to the assumption it informed, linked to the decision that relied on that assumption."

**Proactive Monitoring** handles the ambient intelligence layer — the pattern that does not wait to be queried. It continuously evaluates the knowledge graph for conditions (conflicts, expiries, coverage gaps) and surfaces notifications when those conditions are met. This is the pattern that prevents the $400,000 feature mistake: not by answering a query about prior research, but by alerting the team before the roadmap decision is made.

### Build Sequence: RAG-First Validation (Non-Negotiable)

The full seven-step pipeline described below is the **target architecture**, not the **launch architecture**. PDI must validate the core value hypothesis — that product teams find cross-corpus synthesis over their own discovery more useful than current alternatives — before incurring knowledge-graph cost and risk.

**Phase 1 ships a three-step system only:**

1. Ingest source artifacts → chunk → embed → store in Qdrant
2. Hybrid retrieval (dense + sparse + RRF)
3. Natural language synthesis with strict source attribution, uncertainty states, and visible provenance metadata

This RAG-only system requires no Neo4j, no entity extraction pipeline, and no relationship inference. Two engineers can deliver it in six weeks. It cannot deliver proactive monitoring, assumption lifecycle tracking, decision provenance, or cross-artifact relationship surfacing — but it produces attributed synthesis over the organisation's full discovery corpus.

**Decision rule:** If the RAG-only system achieves ≥75% query success rate with a design partner, build the knowledge graph on top of that foundation with customer data to train against. If it fails, iterate on retrieval and synthesis before adding graph complexity on top of a broken foundation. A bad synthesis in a seven-step pipeline could be caused by retrieval, chunking, the synthesis prompt, entity extraction, a corrupted graph edge, or an integration flaw — making root-cause diagnosis significantly harder than in a three-step pipeline.

### Full Data Pipeline

The following describes the complete flow from raw source artifact to user-facing intelligence output. Each step is described with its input, transformation, output, and the AI vs. deterministic boundary decision.

---

**Step 1 — Source Integration and Ingestion** *(Deterministic)*

The ingestion layer connects to source systems via REST APIs, OAuth2, and webhooks. Target integrations at launch: Notion, Dovetail, Productboard, Miro, Confluence, Slack, Linear, Jira. For each source, a connector pulls new and modified content on a configurable schedule (default: every 15 minutes for active sources, hourly for archival sources). Raw content is stored in an append-only raw artifact store (PostgreSQL + S3 for large binary assets). The ingestion layer is entirely deterministic. No AI is applied at this step. The reason: AI-based filtering at ingestion creates irreversible information loss. Everything is ingested; filtering decisions are made downstream where they can be revised without re-ingesting.

**Slack ingestion defaults to off.** Slack requires a separate, explicit opt-in at a higher administrative level than standard integration setup. The opt-in screen must describe specifically what kinds of content will be processed and require admin confirmation. A kill switch must allow Slack ingestion to be suspended immediately, with a 24-hour data purge option, without disrupting other integrations. This is built before any customer requests it — not as a reactive feature.

*Input:* Raw API responses from source tools
*Output:* Normalised artifact records with provenance metadata (source, author, timestamp, parent object, URL)
*Technology:* Custom connector framework in Python; Celery for async job scheduling; PostgreSQL for artifact metadata; S3 for raw content storage

---

**Step 2 — Normalisation and Chunking** *(Deterministic + lightweight ML)*

Source content arrives in radically different formats: Notion page JSON, Dovetail transcript XML, Productboard CSV exports, Miro board SVG with embedded text, Slack message JSON arrays. The normalisation layer produces a unified content representation: plain text content, structural metadata (headings, lists, tables), and source provenance. Content is chunked into segments of 400–600 tokens with 50-token overlap. Chunk boundaries are determined by structural signals (heading breaks, paragraph boundaries) rather than hard token counts, to preserve semantic coherence. A lightweight sentence boundary detection model (SpaCy `en_core_web_sm`) handles ambiguous cases. Visual artifacts (Miro boards, Figma exports) go through an OCR step (Tesseract + layout-aware post-processing) to extract embedded text before chunking.

*Input:* Raw normalised artifact records
*Output:* Chunked text segments with structural metadata and source provenance
*Technology:* SpaCy for boundary detection; Tesseract for OCR; custom chunking logic in Python

---

**Step 3 — Embedding and Vector Indexing** *(AI — embedding model)*

Each text chunk is passed through an embedding model to produce a dense vector representation. The embedding model selected is **`text-embedding-3-large` (OpenAI, 3,072 dimensions)** or **Voyage AI `voyage-3-large`** as an alternative with strong domain performance on technical and knowledge management text. The choice between these two is a trade-off: OpenAI offers tighter integration with the Claude/GPT frontier model ecosystem; Voyage offers better retrieval quality on specialised domain text in independent benchmarks. This decision should be validated empirically in the first four weeks of implementation by running both models against a held-out set of PDI-relevant queries before committing to infrastructure.

Embeddings are stored in **Qdrant** (self-hosted, versioned collections). Qdrant is chosen over Pinecone or Weaviate for the following reasons: self-hosting is a hard requirement for enterprise customers who cannot send discovery data to third-party vector database providers; Qdrant offers production-grade self-hosted deployment with strong payload filtering; Qdrant's collection versioning allows embedding model upgrades without search downtime.

*Input:* Chunked text segments
*Output:* 3,072-dimensional float32 embedding vectors stored in Qdrant with chunk metadata payload
*Technology:* `text-embedding-3-large` (OpenAI API) or `voyage-3-large` (Voyage AI); Qdrant self-hosted; async embedding pipeline with rate-limiting and retry logic

---

**Step 4 — Entity Extraction and Knowledge Graph Construction** *(AI — frontier reasoning model)*

Entity extraction is the highest-leverage and highest-risk AI step in the pipeline. It is the step that transforms the system from a sophisticated search engine into an intelligence layer. The extraction pipeline runs over each normalised artifact and produces structured entity records in five types:

- **Customer Problems** — discrete pain points, needs, or jobs-to-be-done expressed by customers or inferred from research
- **Insights** — synthesised observations derived from research artifacts (the "so what" that sits above raw data)
- **Assumptions** — explicit beliefs underpinning product decisions (format: "We believe [X] because [evidence]. We will know this is true if [signal].")
- **Experiments** — defined tests of assumptions, with hypothesis, methodology, results, and current status
- **Decisions** — product or strategy choices made at a point in time, including options considered and rationale for the choice made

Entity extraction uses **Claude claude-sonnet-4-6** (Anthropic) as the primary model for this step. The rationale: frontier reasoning quality is required because entity extraction from unstructured discovery documents is a high-ambiguity, high-stakes task — extracting a false assumption or mis-attributing an insight to the wrong decision is worse than extracting nothing. Claude claude-sonnet-4-6 offers the best balance of instruction-following precision, structured output generation, and cost for this task as of June 2026. Claude claude-opus-4-6 is reserved for the synthesis step (Section 2, Step 6) where longer context and deeper reasoning are required.

Relationship extraction runs as a second pass over extracted entity pairs. Relationship types:
- `evidence_for` / `evidence_against` — Insight → Assumption
- `informs` — Assumption → Decision
- `tests` — Experiment → Assumption
- `updates` — newer Insight → prior Insight (temporal supersession)
- `conflicts_with` — Insight A → Insight B (explicit contradiction)

All inferred relationships are tagged with a **calibrated confidence score** (0.0–1.0), not a model self-reported certainty score used without calibration.

**Calibrated confidence layer (required before graph relationships surface in production UI):** After entity extraction, run a lightweight discriminative model (fine-tuned BERT-class, not a frontier LLM) trained on human-labelled PDI relationship data to produce calibrated probability estimates with a known relationship to actual precision. Until approximately 500 labelled relationship pairs exist, use a **conservative fixed display threshold of 0.85** — not 0.65. Model self-reported confidence on implicit semantic relationships is poorly calibrated; a 0.65 threshold on an uncalibrated score is not a meaningful safety mechanism. Show fewer relationships. Lose less trust.

Relationships below the display threshold are stored for pipeline improvement but not surfaced in the UI by default.

*Input:* Normalised artifact text + provenance metadata
*Output:* Structured entity records in PostgreSQL; relationship edges in a Neo4j graph database
*Technology:* Claude claude-sonnet-4-6 via Anthropic API (structured output mode); PostgreSQL for entity storage; Neo4j for the graph layer; custom confidence calibration layer

**Why Neo4j over a relational graph or pure vector approach:** The knowledge graph traversal patterns required by PDI — "find all assumptions that depend on a specific customer insight" or "surface all decisions that would be affected if Assumption A is invalidated" — are native graph traversal queries (Cypher). Implementing these in SQL requires recursive CTEs that degrade at scale. Implementing them in vector space loses the structured relationship semantics that make the graph useful for provenance tracking. Neo4j is the right tool for this specific access pattern.

---

**Step 5 — Retrieval Layer (Hybrid Search)** *(AI + deterministic)*

When a user submits a query, the retrieval layer executes a hybrid search combining dense vector retrieval and sparse keyword retrieval. Dense retrieval surfaces semantically related content; sparse retrieval ensures exact-match terms (product names, feature names, participant codes) are not missed by the embedding model.

The hybrid retrieval implementation uses **Reciprocal Rank Fusion (RRF)** to merge dense and sparse result lists, with a default alpha of 0.6 (favouring dense). This value is a provisional default — it should be tuned against a labelled query-relevance dataset built from early customer queries in the first eight weeks of production use.

Graph traversal augments vector retrieval: for each top-k retrieved chunk, the system traverses one hop in the Neo4j knowledge graph to retrieve connected entities (e.g., if a retrieved chunk mentions an assumption, the connected decisions and supporting insights are also included in the context window, even if they did not appear in the vector search results).

*Input:* User natural language query
*Output:* Ranked list of relevant chunks + connected graph entities, with provenance metadata
*Technology:* Qdrant hybrid search (dense + sparse); Neo4j graph traversal; RRF fusion layer; BM25 sparse index (Qdrant native)

---

**Step 6 — Synthesis and Response Generation** *(AI — frontier model)*

The synthesis engine takes the retrieved context (chunks + graph entities) and generates a structured, attributed response. The model for this step is **Claude claude-opus-4-6** (Anthropic), chosen for its 200K context window, superior long-document reasoning, and strict instruction-following when given complex structured output requirements.

The synthesis prompt enforces five non-negotiable constraints:
1. Every claim in the output must cite at least one source artifact (by ID and URL)
2. Conflicting evidence must be surfaced explicitly, not resolved silently
3. Evidence gaps must be named — the response must distinguish between "we have no evidence on this" and "the evidence is mixed"
4. Confidence level must be stated for each major claim (High / Medium / Low, with a one-sentence rationale)
5. The response must include a "Next questions" section identifying what the organisation should investigate next given the current knowledge state

**Provenance metadata block (first-class UI element, not a collapsed footnote):** Every synthesis response includes a visible structured summary at the top:

> *This synthesis is based on N artifacts from M source systems. Evidence date range: [oldest] – [newest]. Relationship confidence distribution: [summary].*

This shifts the user's cognitive model from "PDI told me X" to "PDI synthesised X from N sources, the most recent being last month" — producing appropriate epistemic humility.

**Knowledge staleness as a first-class signal:** Synthesis must not treat a three-year-old interview transcript and a two-week-old experiment result with equal evidentiary weight. Apply a recency scoring function that down-weights older artifacts — configurable per knowledge type (customer problems decay faster than validated assumptions, which decay faster than documented decisions). Surface the "as of" date of the most relevant evidence in every synthesis response.

The synthesis prompt is versioned in the prompt registry and changes to it go through the same evaluation gate as model changes. A change to the synthesis prompt is architecturally equivalent to a model update.

*Input:* Retrieved context (chunks + graph entities + provenance metadata) + user query
*Output:* Structured synthesis with inline citations, confidence levels, conflict surface, evidence gaps, and next questions
*Technology:* Claude claude-opus-4-6 via Anthropic API (streaming); custom structured output parser; citation resolution layer that maps model-generated source references to original artifact URLs

---

**Step 7 — Proactive Monitoring** *(AI + deterministic rules engine)*

The monitoring layer runs as a background job on a configurable schedule (default: hourly for active initiatives, daily for archived ones). It evaluates the knowledge graph against a set of trigger conditions and generates notifications when conditions are met.

Trigger conditions implemented at launch:

| Trigger | Condition | AI vs. Deterministic |
|---|---|---|
| Assumption conflict | New insight has `conflicts_with` edge to an assumption with status `validated` or `active` | Deterministic (graph query) + AI classification of conflict severity |
| Assumption expiry | An assumption has not been updated in N days and its `expiry_window` has elapsed | Deterministic |
| Unconsulted prior research | A new initiative has been created in an area where >3 existing insights exist and none have been linked | Deterministic (graph query) |
| Convergent evidence gap | Multiple sources reference the same customer problem but no Insight entity has been synthesised from them | AI (entity clustering detection) |
| Duplicate experiment risk | A proposed experiment matches >0.85 cosine similarity with a prior experiment in the graph | Vector similarity (deterministic threshold) |

Notifications are delivered in-product (Signal Feed surface) and optionally via Slack or email. Notification content is generated by a lighter, faster model — **Claude Haiku** — since these are short, structured outputs and latency matters more than reasoning depth.

**Notification engagement model (required before Phase 3 ships):** Instrument notification-to-action conversion per user and per notification type. When a user's conversion rate on a notification type drops below threshold (indicating habituation), automatically reduce frequency for that user — do not wait for manual notification settings changes. Users evaluate notification streams emotionally, not statistically: three irrelevant notifications in a row produces a "this is noise" label that makes the next genuinely critical alert invisible. An un-actioned monitoring layer firing three times daily will be disabled by week six; an adaptive layer that learns what each user responds to retains value.

*Technology:* Celery beat scheduler; Neo4j Cypher queries for graph triggers; Qdrant similarity queries for duplicate detection; Claude Haiku for notification content generation

---

## Section 3 — Data Strategy

### Source Systems and Data Modalities

PDI ingests five distinct data modalities across its integration surface:

| Modality | Source tools | Volume estimate | Quality challenges |
|---|---|---|---|
| Long-form structured text | Dovetail transcripts, Confluence pages, Notion docs | High (MBs per org per month) | Highly variable structure; some orgs use templates, most don't |
| Short-form conversational text | Slack messages, Jira comments, Linear updates | Very high (thousands per day for active orgs) | Low signal-to-noise; requires filtering for discovery-relevant content |
| Structured tabular data | Productboard feedback, Airtable databases, Jira issue exports | Medium | Schema varies per customer configuration |
| Semi-structured visual content | Miro boards, FigJam exports | Low-medium | Text embedded in SVG/canvas; requires OCR and layout reconstruction |
| Unstructured audio/video references | Zoom recordings referenced in Dovetail | Low | Transcripts exist in Dovetail; raw media is not ingested |

### Minimum Viable Data Requirements

The AI system produces useful output above the following minimums. Below these thresholds, the platform should surface a clear "insufficient data" state rather than attempting to synthesise from inadequate inputs:

- **At least 3 integrated source systems** before the knowledge graph produces meaningful cross-tool connections
- **At least 50 artifacts ingested** before entity extraction produces a sufficient entity density for graph traversal to add value over raw search
- **At least 10 explicitly tagged Insights or Assumptions** (human-created or AI-extracted with >0.8 confidence) before the Proactive Monitoring layer produces non-trivial notifications

These thresholds are provisional estimates derived from system design reasoning, not from empirical measurement. They should be validated against real customer data in the first 60 days of production use and codified as onboarding milestones.

### Degradation Handling

The system must handle data quality degradation gracefully and visibly, never silently:

**Sparse knowledge graphs:** When an organisation has fewer than the minimum viable artifacts, the query interface surfaces a "Coverage low — here is what we found, and here is what is missing" response format rather than generating a confident synthesis from thin evidence.

**Very small corpora (<50 artifacts):** Early-stage customers will query before the graph is viable. When the corpus is so small that almost every document appears in almost every response, the system must detect this condition and surface it explicitly — e.g., "This synthesis cites 42 of your 48 total artifacts; organisational coverage on this topic is still thin." Without this guard, a new PM receives a confident synthesis citing 80% of the entire discovery history for a single claim and mistakenly believes they have comprehensive organisational knowledge.

**Contradictory source data:** When entity extraction surfaces conflicting facts in the same corpus (e.g., two documents assert different customer problem priorities), the conflict is recorded as a `conflicts_with` relationship in the knowledge graph and surfaced explicitly in any synthesis that draws on both sources. The model is explicitly prompted not to resolve contradictions by choosing a side — it must present both versions with their sources.

**Low-quality OCR output:** Visual artifacts processed through OCR receive a quality confidence score. Artifacts with OCR confidence below 0.70 are stored but flagged in the provenance metadata. Synthesis responses that draw on low-confidence OCR content include an explicit note: "This citation comes from a visual artifact with low extraction confidence — verify the original."

**API availability failures:** When a source system API is unavailable, the last successfully ingested state is retained and the knowledge graph freshness indicator reflects the time since last successful sync. The UI surfaces per-source sync status so PMs know which integrations are stale.

---

## Section 4 — Failure Mode Analysis

Silent failures are prioritised over loud failures throughout this section. A silent failure — one that looks correct but is wrong — is categorically more dangerous in a knowledge management product than a loud one, because it erodes trust in the platform's intelligence without giving the user information that would allow them to correct it.

The three highest-probability production failure modes — graph liability, Slack citation harm, and monitoring alert fatigue — are documented first. These represent the most likely paths to irreversible customer trust loss.

---

### Failure Mode 1 — The Knowledge Graph Becomes a Liability Before It Becomes an Asset (Silent, Severity: Critical)

**What goes wrong:** False relationships in the knowledge graph compound multiplicatively, not additively. Entity extraction from unstructured PM documents has an inherent false positive rate. If the model incorrectly infers that Assumption A is supported by Interview B, every future synthesis traversing either node carries that corrupted link. Graph degradation accelerates with node count because traversal paths multiply.

**Why it occurs in this system specifically:** Discovery documents are written informally. PMs do not write "This assumption is based on Interview #23." Relationship inference from proximity, shared vocabulary, and temporal co-occurrence is probabilistic and produces false positives — especially when documents share terminology without genuine semantic connection.

**Practical consequence:** By ~6 months of real ingestion (500–800 documents), the graph may contain enough false relationships that synthesis responses are plausible-sounding but structurally unreliable. Users cannot identify which specific claims are wrong because provenance chains look correct. They simply notice occasional misleading output and stop trusting the platform — the highest-impact trust failure in the product.

**Severity:** Critical. A false relationship propagates through every downstream query that traverses that edge.

**Mitigation (revised — addresses cause, not symptom):**
- Replace model self-reported confidence with a **calibrated confidence layer** (see Step 4). Until ~500 labelled relationship pairs exist, use display threshold **0.85**, not 0.65.
- Prioritise relationship inference **precision over recall** — better to miss a true link than assert a false one.
- Human confirmation required before any inferred relationship is elevated to `validated` status.
- "Why is this connected?" explainability surface on every displayed relationship.
- Red-team evaluation harness with adversarial document pairs on every model update.
- **Do not ship graph-augmented retrieval until RAG-only query success rate is validated** (see Build Sequence: RAG-First Validation).

---

### Failure Mode 2 — Slack Ingestion Produces a Politically Toxic Knowledge Graph (Silent, Severity: Critical)

**What goes wrong:** A synthesis accurately cites a real Slack message in a context where that citation is professionally or legally problematic — e.g., candid internal commentary surfaced six months later to a different audience.

**Why it occurs in this system specifically:** Product teams make their most candid, contextually rich statements about customer problems and internal decisions in Slack — exactly why Slack is high-signal. Those same messages frequently contain language that a content classifier cannot reliably distinguish from discovery-relevant candid analysis when both are expressed in the same informal register. Channel-level opt-in and lightweight classifiers are necessary but insufficient.

**Severity:** Critical. This is not a security breach — it is an **irreversibility problem**. Once a synthesis containing a sensitive citation is delivered to an unintended stakeholder, the damage cannot be undone. One customer cancellation and the story spreads.

**Mitigation (revised):**
- **Slack ingestion defaults to off** with separate admin-level opt-in and explicit content description (see Step 1).
- Kill switch with immediate suspension and 24-hour purge option.
- Direct messages and private channels excluded by default with no option to include.
- Users can flag inappropriate citations; flagged citations removed from retrievable index.
- Synthesis provenance block makes Slack-sourced evidence visibly identifiable before users act on claims.

---

### Failure Mode 3 — The Proactive Monitoring Layer Trains Users to Ignore It (Silent, Severity: Critical)

**What goes wrong:** The monitoring layer fires correctly but is not read. Users do not evaluate notification streams statistically — three irrelevant notifications in a row produces a "this is noise" cognitive label, even if seven relevant ones follow.

**Why it occurs in this system specifically:** Proactive AI notifications follow a documented adoption curve: initial engagement → alert fatigue → habitual dismissal. A false positive rate target of <20% (1 in 5 irrelevant) feels worse in practice than the number suggests. A team that learns to dismiss assumption conflict notifications will dismiss the one that would have prevented a $400,000 feature mistake.

**Severity:** Critical for product differentiation. Monitoring is architecturally the most important and experientially the most fragile component — the feature that makes PDI more than a better search tool.

**Mitigation (revised):**
- **Notification engagement model** with per-user, per-type adaptive throttling (see Step 7).
- Track **notification-to-action conversion rate** as a launch-gate metric — not just false positive rate.
- Reduce frequency automatically when engagement drops; do not rely on users configuring settings.
- Phase 3 must not ship monitoring without engagement instrumentation in place.

---

### Failure Mode 4 — Hallucinated Entity Relationships (Silent, Severity: Critical)

**What goes wrong:** The entity extraction model infers a relationship between two entities that does not exist in the source material — for example, asserting that an assumption was informed by a specific customer interview when no such connection is present in the text.

**Relationship to Failure Mode 1:** This is the atomic error that Failure Mode 1 describes at scale. Individual hallucinated edges become graph-wide liability as the corpus grows.

**Mitigation:** See Failure Mode 1. Additionally: human-in-the-loop confirmation for all extracted entities in Phase 2 until extraction precision exceeds 92% per entity type on the validation set.

---

### Failure Mode 5 — Stale Assumption Surfaced as Current (Silent, Severity: Critical)

**What goes wrong:** An assumption that was invalidated by new evidence continues to appear in briefings and query responses as a standing, active assumption, because the invalidation was not captured in the knowledge graph.

**Why it occurs in this system specifically:** Assumption invalidation rarely produces an explicit artifact. A PM discusses in a Slack thread that "the original assumption was wrong" but does not update the Notion page where the assumption was documented. The ingestion layer captures the Slack thread, but the entity extraction model does not connect the Slack content to the existing assumption entity — because the Slack message refers to the assumption informally, without using the language the model used when it created the assumption entity.

**Severity:** Critical. This failure mode is identical to the problem the platform is designed to prevent. A platform that creates a new version of the same problem — authoritative-looking stale information — causes more harm than no platform.

**Mitigation:**
- The monitoring layer runs a daily job that specifically looks for Slack and comment content using language that signals assumption status changes ("turns out," "we were wrong," "the data shows otherwise," "invalidated," "doesn't hold"). Candidate invalidation signals are surfaced to the assumption owner for confirmation.
- Assumptions in the register display a "Last evidence reviewed" timestamp. Assumptions that have not been reviewed within their configured expiry window are displayed with an amber `Expiring` status rather than a confident `Validated` status.
- Synthesis responses that draw on assumptions in `Expiring` or `Unreviewed` status include an explicit caveat: "This relies on an assumption that has not been reviewed in N days."
- Human confirmation is required to move an assumption from `Expiring` back to `Validated`. The AI cannot self-certify assumption validity.

---

### Failure Mode 6 — Low-Relevance Retrieval (Silent, Severity: High)

**What goes wrong:** The retrieval layer returns documents that are topically adjacent to the query but not semantically relevant to the specific question, producing a synthesis that sounds authoritative but answers a slightly different question than the one asked.

**Why it occurs in this system specifically:** Discovery documents frequently use the same vocabulary for different customer problems. "Onboarding friction" might refer to technical setup friction in one quarter and communication friction with new users in another. An embedding model trained on general text may not distinguish these without fine-tuning on discovery-domain vocabulary.

**Severity:** High. The PM receives a confident-sounding answer to the wrong question.

**Mitigation:**
- Implement query decomposition: before retrieval, a classification step determines whether the query is seeking a specific artifact, a synthesised view of a topic, or a proactive gap analysis — and routes to the appropriate retrieval strategy.
- Implement re-ranking using **Cohere Rerank** or **Voyage AI Rerank** as a second-pass filter over retrieved chunks before synthesis. Re-ranking is a different model from the embedding model and provides an orthogonal relevance signal.
- Every synthesis response includes a "Sources used" section at the bottom listing all artifacts cited. If a user marks a response as unhelpful and the sources are visibly irrelevant, this creates a labelled negative training example for retrieval improvement.
- Query success rate (user confirms response was helpful within 30 seconds) is a core product metric. A drop in this metric of more than 5 percentage points triggers an engineering investigation of the retrieval layer, not just the synthesis model.

---

### Failure Mode 7 — Over-Confident Synthesis Without Sufficient Evidence (Silent, Severity: High)

**What goes wrong:** The synthesis model generates a fluent, well-structured response that presents conclusions confidently despite the retrieved context being thin, contradictory, or not directly relevant to the query.

**Why it occurs in this system specifically:** Frontier language models are optimised for helpfulness, which includes generating confident-sounding outputs. When the retrieved context is insufficient, the model may fill gaps with plausible-sounding reasoning that is not grounded in the organisation's actual discovery.

**Severity:** High. A PM who trusts an over-confident synthesis may skip further research that the knowledge state does not actually support skipping.

**Mitigation:**
- The synthesis prompt explicitly forbids high-confidence answers when the retrieved context contains fewer than three distinct source artifacts or when the retrieval confidence scores are below 0.6. In these cases, the model is instructed to return a "Coverage gap" response rather than a confident synthesis.
- Confidence levels (High / Medium / Low) are required for every major claim in the synthesis output, with a one-sentence rationale. A synthesis with no low-confidence claims from thin evidence is a model behaviour failure, not a quality indicator.
- System-level hallucination rate (claims in synthesis not attributable to any retrieved artifact) is measured monthly via human evaluation on a random sample of 50 queries and reported to the product team. Target: <1% hallucination rate at launch.

---

### Failure Mode 8 — Loud Failures — Integration Downtime (Visible, Severity: Medium)

**What goes wrong:** A source system API is unavailable, rate-limited, or changes its schema, causing the ingestion pipeline to fail and knowledge graph freshness to degrade.

**Why it occurs in this system specifically:** The platform depends on the API stability of 8–10 external tools, each of which evolves independently. Dovetail, Notion, and Productboard have all broken API compatibility on minor version updates in the past 24 months.

**Severity:** Medium. This is a loud failure — the user sees a "last synced N hours ago" indicator — but it degrades trust in the platform even if the failure is external.

**Mitigation:**
- Per-integration health monitoring with automatic alerting to the engineering team within 5 minutes of a failed sync.
- An integration abstraction layer that buffers against API schema changes by translating new API responses against a versioned internal schema — schema mismatches trigger an alert rather than a silent data corruption.
- Freshness indicators are displayed per-source in the UI so users know which integrations are stale before trusting a synthesis.

---

### Edge Cases That Produce Bad or Harmful Output

These are not model hallucinations — they are cases where technically correct extraction or synthesis produces organisational harm.

| Edge case | Mechanism | Required handling |
|---|---|---|
| **Deliberately implicit assumptions** | Senior PMs maintain undocumented assumptions to avoid forced conversations. Entity extraction surfaces them in the Assumption Register, forcing conversations the team deliberately avoided — including politically sensitive headcount, pivot, or competitive intelligence topics. | Contributor consent layer (see Production Safety). Flag extracted assumptions from informal sources as `inferred — unconfirmed` until owner validates. Never auto-publish sensitive inferred assumptions to workspace-wide surfaces. |
| **Terminated employee's work cited authoritatively** | HR revokes source-system access; PDI retains all artifacts. Synthesis cites departed PM's research with same confidence as current team members. | Contributor status metadata on artifacts (`active` / `departed` / `disputed`). Synthesis down-weights or flags citations from departed contributors when reliability is contested. |
| **Parallel squads researching the same problem** | Squad A (preliminary) and Squad B (validated) work in parallel without coordination. Cross-project retrieval synthesises both into apparent internal contradiction without weighting recency or methodological quality. | Recency and validation-status weighting in synthesis. Surface parallel research tracks explicitly rather than false organisational uncertainty. |
| **Post-hoc evidence synthesis for decided outcomes** | In performative discovery cultures, PDI is used to generate post-hoc evidence summaries for decisions already made — functioning as a confirmation bias engine, not exploration. | Provenance block + explicit "evidence date range" metadata. Optional query intent classification flagging confirmation-seeking patterns for PM self-awareness (not blocking). |
| **Corpus below 50 artifacts** | Almost every document retrieved for every query. Synthesis appears highly relevant because context perfectly matches query, but cites majority of entire organisational history. | Small-corpus detection with explicit coverage ratio in provenance block (see Degradation Handling). |

---

### Production Safety Requirements

The following are **launch prerequisites** for production-safe AI, not optional enhancements:

| Requirement | Implementation | Phase |
|---|---|---|
| **Calibrated confidence** | Discriminative calibrator on relationship scores; 0.85 display threshold until ~500 labelled pairs | Phase 2 (before graph UI) |
| **Contributor consent and visibility** | Before indexing: notify contributor that content from [source] will build the knowledge graph and show what will be extracted. Indexing visibility improves source quality and is an ethical requirement. | Phase 1 (Notion) / Phase 2 (all sources) |
| **Knowledge staleness model** | Recency scoring by knowledge type; "as of" dates on synthesis | Phase 1 (basic) / Phase 2 (full) |
| **Synthesis provenance metadata block** | Visible top-of-response: N artifacts, M sources, date range, confidence distribution | Phase 1 |
| **Notification engagement model** | Per-user adaptive throttling based on notification-to-action conversion | Phase 3 (before monitoring ships) |
| **Slack kill switch** | Default off; admin opt-in; immediate suspend + 24h purge | Phase 2 (before Slack ships) |

---

## Section 5 — Human–AI Interaction Design

### The Trust Boundary

The AI in PDI is an evidence surface, not a decision engine. This distinction is not aspirational — it is a design constraint derived directly from user research. Ninety percent of research participants expressed trust in AI that shows its work. Ninety percent expressed distrust in AI that delivers confident outputs without transparent provenance. The following boundaries encode this distinction in the product.

### Operations Requiring Explicit Human Confirmation

The following AI-initiated actions require explicit human confirmation before they are persisted to the knowledge graph. The AI may surface and recommend; humans decide and confirm:

| AI Action | Confirmation Required From | Why |
|---|---|---|
| Indexing an artifact into the knowledge graph | Original contributor or workspace admin | Consent and visibility improve source quality; extraction without consent is an organisational harm distinct from technical inaccuracy |
| Elevating an inferred relationship to `validated` status | Assumption or insight owner | Inferred relationships carry uncertainty; validated status implies human review |
| Invalidating or modifying an existing assumption | PM who owns the assumption | Assumptions are high-stakes; automatic invalidation could corrupt a live decision foundation |
| Creating a new Decision record from conversational content | Decision owner | Decisions must be deliberately owned; auto-creation creates accountability ambiguity |
| Merging two similar insight entities identified as duplicates | Research lead or PM | Merging destroys provenance; incorrect merges are hard to reverse |
| Archiving an initiative and its associated knowledge | Workspace admin | Archiving reduces future retrievability; must be intentional |

### Communicating Uncertainty to Users

The platform communicates four uncertainty states in its interface:

- **High confidence** — synthesis draws on 5+ source artifacts with consistent evidence. Displayed without qualification.
- **Medium confidence** — synthesis draws on 2–4 source artifacts or evidence is directionally consistent but not definitive. Displayed with a one-sentence qualification: "Based on limited evidence — see sources."
- **Low confidence** — synthesis draws on 1 source artifact or evidence is contradictory. Displayed with an explicit caveat and a prompt to conduct further research.
- **Coverage gap** — no relevant artifacts found. Displayed as a named gap, not as an empty response: "We have no evidence on this question. This is a gap in your organisation's discovery knowledge."

The distinction between "low confidence" and "coverage gap" is intentional. Most knowledge management tools return empty results for coverage gaps, which the user interprets as "the platform couldn't find anything" (a tool failure) rather than "we genuinely don't know this" (a knowledge gap). PDI names the gap explicitly because a named knowledge gap is an actionable product management input; an empty search result is not.

### Provenance and Source Attribution

Every synthesised output includes:

1. **Provenance summary block** — visible at top: artifact count, source system count, evidence date range, relationship confidence distribution (not collapsed)
2. **Inline citations** — each claim in the synthesis is superscripted with a source reference number
3. **Source panel** — a collapsible sidebar listing all artifacts cited, with title, author, date, contributor status, and a direct link to the original artifact in the source tool
4. **Relationship trail** — for synthesised claims that draw on graph traversal (e.g., "this assumption was informed by this insight which came from this interview"), a visual chain showing the reasoning path is available on click
5. **Confidence breakdown** — for each cited source, the retrieval confidence score is available in the source panel for power users

The UI design principle: provenance should be one click away, never more. A PM who wants to verify a claim should be able to reach the original source artifact in under three seconds.

### The Trust-Building Arc

**Session 1:** The platform focuses on retrieval and citation, not synthesis. A new user's first experience is a search that surfaces prior research they didn't know existed — concrete, verifiable, undeniably useful. No complex inference, no assumption about the graph's richness.

**Sessions 2–5:** As the user runs more queries, the synthesis quality improves as the retrieval layer learns what "helpful" means from their interaction patterns (which sources they click through, which responses they mark as useful). The assumption register becomes visible as the PM creates their first two or three assumptions.

**Month 1:** The proactive monitoring layer begins delivering notifications. The first notification that surfaces genuinely contradicting evidence the user did not know about is the trust-crystallising moment — the point at which the platform demonstrates intelligence rather than just retrieval.

**Month 3+:** The knowledge graph has sufficient density that the "Discovery Briefing" surface (the PM's view when opening a new initiative) delivers a synthesised view of what the organisation already knows. At this point, the PM's default behaviour before starting discovery is to check the briefing — not because they were trained to, but because it repeatedly saved them time.

---

## Section 6 — Evaluation Framework

### Evaluation Philosophy

PDI requires two distinct evaluation layers that must not be conflated: **intrinsic AI quality metrics** (is the AI output accurate?) and **downstream outcome metrics** (is the product improving the user's discovery practice?). Optimising only for intrinsic quality can produce a highly accurate AI that users do not engage with. Optimising only for downstream outcomes without intrinsic quality measurement produces a product that appears to work until a critical failure erodes trust.

### Intrinsic AI Quality Metrics

| Metric | Definition | Measurement Method | Launch Gate | Owner |
|---|---|---|---|---|
| Entity extraction precision | % of extracted entities that are correctly identified (verified by human annotation) | Human evaluation on 100 random artifact sample per month | ≥ 90% | ML Engineer |
| Entity extraction recall | % of ground-truth entities that the model successfully extracts | Human evaluation on annotated test set | ≥ 80% | ML Engineer |
| Relationship inference accuracy | % of inferred graph relationships verified as correct by human review | Human evaluation on 50 random inferred relationships per month | ≥ 85% | ML Engineer |
| Hallucination rate | % of synthesis claims not attributable to any retrieved source artifact | Human evaluation on 50 random query-response pairs per month | < 1% | ML Lead |
| Source attribution completeness | % of synthesis claims that include at least one valid source citation | Automated (citation resolver checks every response) | 100% | Backend Engineer |
| Query success rate | % of queries where user confirms response was helpful within 30 seconds | In-product feedback (thumbs up/down) | ≥ 75% | PM |
| Notification-to-action conversion | % of proactive notifications that lead to a user action within 7 days | In-product event tracking per notification type | ≥ 40% at GA | PM |
| P95 query response latency | 95th percentile end-to-end latency from query submission to first synthesis token | APM instrumentation | < 8 seconds | Backend Engineer |

### Downstream Outcome Metrics

These metrics are measured via quarterly in-product survey and product usage analytics:

| Metric | Measurement Method | Target at Month 6 |
|---|---|---|
| Reduction in duplicate research events | Self-reported via in-product survey; cross-referenced with "prior research flagged before new initiative" usage events | 60% of customers report reduction |
| Faster time-to-decision | Self-reported via quarterly NPS follow-up | 50% of customers report improvement |
| New team member ramp time | Self-reported by managers in quarterly survey | 70% of customers report faster onboarding |
| Assumption register active use | % of active initiatives with ≥ 1 assumption tracked in the register | ≥ 50% of initiatives |
| Pre-initiative briefing view rate | % of new initiatives where a PM views the Discovery Briefing before beginning active research | ≥ 1 view per initiative |
| Monthly Active User ratio | MAU / licensed user count | ≥ 70% |

### Evaluation Infrastructure

**Test Set Construction**

The evaluation test set is built from real customer data, with explicit consent and anonymisation. The initial test set (built before launch with design partners) consists of:

- 200 artifact-entity annotation pairs (human-labelled ground truth for extraction evaluation)
- 50 manually constructed query-expected-answer pairs covering the full range of query types (specific artifact retrieval, topic synthesis, gap identification, assumption status queries)
- 20 adversarial pairs (documents sharing vocabulary without genuine relationship, for relationship inference red-teaming)
- 10 known edge cases derived from the failure mode analysis (contradictory evidence, sparse knowledge graphs, expired assumptions, implicit assumptions, departed contributors, parallel squad research, post-hoc confirmation queries, small-corpus over-citation)

The test set is version-controlled in the repository alongside the model code. It grows with every identified failure mode.

**Shadow Mode Deployment**

Before any model update (embedding model, extraction model, synthesis model) is deployed to production, the new version runs in shadow mode for a minimum of 72 hours — processing the same real queries as the production system without serving the results to users. Shadow mode outputs are scored against the current production system using the intrinsic quality metrics and reviewed by the ML lead before promotion.

**Regression Suite**

Every model or prompt update must clear the full regression suite (the 200-item test set) before deployment. A regression is defined as any metric dropping more than 2 percentage points from the previous production baseline. Regressions block deployment and require investigation before re-attempting.

**Promptfoo deploy gate (automated)**

Do **not** deploy prompt or model changes until the Promptfoo eval pass rate is **≥ 85%**. World-class AI products target **95%+**. The repository enforces this via `pnpm eval:gate`, which runs structured test cases in `prompts/evaluation/test-cases.json` (e.g., tc-001 good document, tc-002 not-found flag) and exits non-zero if the pass rate falls below 85%.

**In-Product Feedback Loop**

Every synthesised response includes a lightweight quality signal — a thumbs-up/down with an optional free-text comment. Negative feedback (thumbs-down) is automatically routed to a review queue where it is triaged within 48 hours. Patterns in negative feedback are added to the regression suite within two weeks.

---

## Section 7 — Build Roadmap

### Phase Sequencing Principle

Each phase ends with an evaluation gate. The system must clear measurable quality thresholds before moving to the next phase. A phase is not "feature complete" — it is "evaluation-complete." Scope can be reduced to clear the gate; quality thresholds cannot be lowered.

---

### Phase 1 — Minimum Viable Intelligence (Weeks 1–8)

**Objective:** Build and validate a **RAG-only three-step system** — ingest → hybrid retrieve → attributed synthesis — on one integration (Notion), for one design partner. No knowledge graph.

**Deliverables:**
- Notion integration with incremental sync (Step 1 complete)
- Chunking and embedding pipeline with Qdrant storage (Steps 2–3 complete)
- Hybrid retrieval (dense + sparse + RRF)
- RAG query interface: natural language in, attributed synthesis out (Step 6, simplified — no graph augmentation)
- **Provenance metadata block** on every synthesis (artifact count, sources, date range)
- **Basic recency down-weighting** in synthesis prompt
- Contributor visibility notice before Notion indexing
- Source attribution: every synthesis claim links to an original Notion page
- Minimal web UI: query box, response surface with citations, provenance block

**Intentionally excluded from Phase 1:**
- Knowledge graph construction (Neo4j, entity extraction) — deferred to Phase 2
- Proactive monitoring — deferred to Phase 3
- Slack and all integrations except Notion

**Rationale for exclusions:** Validate that cross-corpus synthesis produces output a PM finds genuinely useful — more useful than searching Notion directly — before incurring graph cost, graph liability risk, and multi-integration complexity. Phase 1 is an evaluation instrument, not a feature-complete product.

**Evaluation gate (must clear before Phase 2):**
- Query success rate ≥ 70% on design partner queries (measured with in-product feedback over 2 weeks)
- Source attribution completeness: 100%
- Hallucination rate < 2% (initial threshold — will tighten in Phase 2)
- Provenance block present on 100% of synthesis responses
- Design partner provides qualitative confirmation that output is more useful than their current Notion search

**Primary risk:** RAG over unstructured PM documents produces synthesis that is topically relevant but insufficiently specific. Mitigation: higher-chunk-resolution configuration (200-token chunks with 100-token overlap) and prompt iteration via Promptfoo before adding graph complexity.

---

### Phase 2 — Knowledge Graph and Multi-Source Intelligence (Weeks 9–20)

**Objective:** Add entity extraction, the Neo4j knowledge graph, and three additional integrations (Dovetail, Productboard, Slack). Deliver the Assumption Register as a first-class product surface.

**Deliverables:**
- Entity extraction pipeline (Claude claude-sonnet-4-6, five entity types)
- **Calibrated confidence layer** for relationship scores; 0.85 display threshold until labelled data sufficient
- Relationship inference and Neo4j graph construction
- Graph-augmented retrieval (vector search + graph traversal fusion)
- Dovetail and Productboard integrations
- **Slack integration with kill switch** (default off, admin opt-in, purge capability) — only after calibrated confidence and citation flagging are in place
- Assumption Register UI: create, view, link to evidence, track status
- Multi-source synthesis: query responses that cite across multiple source systems
- Contributor consent flow for all indexed sources

**Evaluation gate (must clear before Phase 3):**
- Entity extraction precision ≥ 90%, recall ≥ 80% (on design partner annotated test set)
- Relationship inference accuracy ≥ 85%
- Query success rate ≥ 75% (raised from Phase 1 gate)
- Hallucination rate < 1%
- At least one design partner demonstrates active use of the Assumption Register (≥5 assumptions tracked)

**Primary risk:** Entity extraction produces plausible-sounding but incorrect entities from informal PM documents (e.g., misclassifying a discussion of a feature as an Insight about a customer problem). Mitigation: Begin Phase 2 with human-in-the-loop entity review — all extracted entities are presented to the PM for confirmation before being written to the graph. Remove the confirmation gate only for entity types where extraction precision exceeds 92% on the validation set.

---

### Phase 3 — Proactive Intelligence and Scale (Weeks 21–36)

**Objective:** Add the proactive monitoring layer, expand to 8 integrations (adding Miro, Confluence, Linear, Jira), and prepare for general availability with multi-tenant production infrastructure.

**Deliverables:**
- Proactive monitoring layer (all five trigger conditions in Section 2, Step 7)
- Signal Feed UI surface
- Miro, Confluence, Linear, Jira integrations
- OCR pipeline for visual artifact extraction (Miro boards, Figma exports)
- Multi-tenant infrastructure with data isolation, SOC 2 controls, and per-customer encryption
- Enterprise-grade access controls and permission mapping from source tools

**Evaluation gate (general availability launch gate):**
- All intrinsic quality metrics in Section 6 at or above their stated launch thresholds
- Proactive monitoring false positive rate < 20%
- **Notification-to-action conversion rate ≥ 40%** (adaptive throttling active)
- P95 query latency < 8 seconds under simulated load of 100 concurrent users
- Integration setup time (3 source systems) < 30 minutes for a non-technical user
- At least two design partners express willingness to convert to paid contracts at the proposed pricing tier

---

## Section 8 — Risks and Open Questions

### Risk 1 — Technical: Relationship Inference Quality at Scale

**Probability:** High. **Impact:** Critical.

**Trigger condition:** As the knowledge graph grows beyond 10,000 artifact nodes, false positive relationship density increases and synthesis traversing corrupted edges produces plausible but structurally unreliable output — often before individual inference accuracy metrics detect degradation.

**What to do if it materialises:** Halt cross-initiative graph traversal. Raise display threshold to 0.90. Implement domain-specific fine-tuning using labelled relationship data from human-in-the-loop confirmation. Prioritise precision over recall. Consider rolling back to RAG-only retrieval for affected workspaces while graph is audited. See Failure Mode 1.

---

### Risk 2 — Data: Customer Data Quality Variability

**Probability:** High. **Impact:** Medium-High.

**Trigger condition:** Early enterprise customers have years of discovery artifacts in inconsistent formats, with poor internal tagging, overlapping terminology, and no structured assumption management. The knowledge graph built from this corpus produces low-quality entity extraction and confused relationship inference, and the customer concludes the platform "doesn't work for us."

**What to do if it materialises:** Invest in a dedicated onboarding service for enterprise customers (already planned as Professional Services revenue in the PRD). Do not oversell AI quality on messy historical corpora. Position Phase 1 of enterprise onboarding as "AI-assisted knowledge archaeology" — a service that uses the platform's entity extraction to help the customer understand and clean their own prior discovery. This turns a liability (messy data) into a value-add service.

---

### Risk 3 — Adoption: The Platform Remains a Query Tool, Not Organisational Memory

**Probability:** Medium. **Impact:** High.

**Trigger condition:** Users adopt the natural language query interface but do not engage with the Assumption Register, Decision Record, or proactive monitoring surfaces. The platform becomes a better search tool rather than an organisational memory system, and retention suffers because search is a commodity.

**What to do if it materialises:** Resequence the onboarding flow to lead with the Assumption Register and Proactive Monitoring before introducing free-form query. The query interface is the most immediately satisfying feature but the least differentiated long-term. Assumption tracking and proactive conflict detection are the behaviours that create compounding value — they must be installed early, not discovered after the user is already habituated to a query-only workflow.

---

### Risk 4 — Regulatory: Enterprise Data Residency and AI Model Privacy

**Probability:** Medium. **Impact:** High for enterprise segment specifically.

**Trigger condition:** An enterprise prospect (or existing customer) discloses a requirement that customer discovery data cannot be processed by any third-party AI API — including Anthropic's Claude models — because it contains sensitive customer research, competitive intelligence, or personal data of research participants.

**What to do if it materialises:** The architecture must support a **private deployment option** where the synthesis and extraction models run on the customer's own infrastructure (on-premise or private cloud VPC). This requires the AI layer to be decoupled from the API-based model assumption — the same synthesis prompt must be executable against a self-hosted model (e.g., Llama 3.3 70B or Mistral Large via Ollama or vLLM). Plan for this architectural requirement in Phase 2 even if no customer has requested it yet — retrofitting model provider abstraction is significantly more expensive than building it in from the start.

---

### Open Questions — Decisions That Must Be Resolved in the First Four Weeks

**OQ-1 (Data): Which embedding model?**
The choice between `text-embedding-3-large` (OpenAI) and `voyage-3-large` (Voyage AI) determines the foundational retrieval quality of the entire system. This must be validated empirically against a representative set of PDI-specific queries — not assumed from general benchmarks. Run a 2-week head-to-head evaluation with the design partner's actual Notion documents before committing to infrastructure.

**OQ-2 (Architecture): Should entity extraction run in real-time or as a batch pipeline?**
Real-time extraction means every new artifact is processed immediately — users see new entities appear minutes after a source document is updated. Batch extraction is cheaper, more controllable, and easier to debug, but introduces a delay between artifact creation and knowledge graph availability. For the Phase 1 MVP, batch is the right default. For Phase 2, the answer depends on how frequently design partners create new artifacts and how time-sensitive their retrieval needs are. Measure this in Phase 1 rather than assuming.

**OQ-3 (Trust): What is the right default confidence threshold for displaying inferred relationships?**
The interim proposal is **0.85 on calibrated scores** until ~500 labelled relationship pairs exist — not 0.65 on model self-reported certainty. Uncalibrated model confidence is poorly correlated with actual precision on implicit semantic relationships. This threshold should be validated empirically by showing design partners relationships at varying confidence levels and measuring useful-to-incorrect ratio. Lower thresholds only after the calibrated layer is trained and validated.

**OQ-4 (Compliance): Does the Anthropic API Terms of Service for Claude models conflict with any design partner's data policies?**
Anthropic's API terms include data processing terms that most enterprise customers will require a review of before allowing production customer data to be sent through the API. This legal review must happen in the first four weeks — not after a design partner's security team raises it as a blocker. If the review reveals a conflict, the private deployment option (Risk 4) becomes a Phase 2 priority rather than a Phase 3 consideration.

**OQ-5 (Product): What is the minimum assumption register state that makes the proactive monitoring layer genuinely useful?**
The monitoring layer alerts on assumption conflicts and expiries. If the assumption register is empty or sparsely populated when Phase 3 ships, the monitoring layer will produce no alerts — and users will conclude it doesn't work. The design partner onboarding in Phases 1 and 2 must be explicitly designed to populate the assumption register to the minimum viable density for monitoring to produce meaningful signal before Phase 3 launches. Measure the assumption density threshold in Phase 2 design partner usage.

---

## Appendix — Technology Decisions Summary

| Component | Selected Technology | Alternatives Considered | Decision Rationale |
|---|---|---|---|
| Ingestion scheduling | Celery + Redis | Prefect, Airflow | Celery is simpler for the current team size; revisit at scale |
| Vector database | Qdrant (self-hosted) | Pinecone, Weaviate, pgvector | Self-hosting required for enterprise data residency; Qdrant is the strongest self-hosted option |
| Embedding model | `text-embedding-3-large` (provisional) | `voyage-3-large` | Provisional — requires empirical validation in Week 1 |
| Entity extraction model | Claude claude-sonnet-4-6 | GPT-4o, Gemini 1.5 Pro | Best structured output precision for ambiguous unstructured text; evaluate quarterly |
| Synthesis model | Claude claude-opus-4-6 | GPT-4o, Gemini 1.5 Pro | 200K context window; superior instruction-following for complex attribution constraints |
| Notification generation | Claude Haiku | GPT-4o-mini | Speed and cost — notifications are short, structured, low-reasoning tasks |
| Graph database | Neo4j | PostgreSQL with recursive CTEs, Amazon Neptune | Native Cypher for graph traversal; self-hostable; well-supported Python client |
| Relationship confidence | Calibrated BERT-class discriminator (target) | Model self-reported scores only | Uncalibrated LLM confidence is not a safety mechanism; 0.85 interim threshold |
| Re-ranking | Cohere Rerank or Voyage AI Rerank | Cross-encoder (local) | Evaluated quarterly; avoid single-vendor lock-in at the retrieval layer |
| Observability | LangSmith or Weights & Biases | MLflow, Arize | LangSmith for prompt versioning and trace inspection; W&B for training metrics if fine-tuning begins |

---

*This document defines the AI architecture, evaluation framework, and build roadmap for Product Discovery Intelligence as of July 2026 (v1.1). It will be updated at each phase gate as empirical findings from design partner usage replace provisional assumptions. The version history is maintained in the linked decision record.*

*Next review: End of Phase 1 (Week 8) · Owner: ML Lead + Product Manager · Classification: Internal — Confidential*
