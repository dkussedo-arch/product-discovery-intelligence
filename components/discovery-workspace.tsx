'use client'

import { useState } from 'react'
import {
  AlertTriangle,
  BookOpen,
  Brain,
  ChevronRight,
  ExternalLink,
  Loader2,
  Search,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react'

import { queryMemory } from '@/lib/pdi-api'
import {
  trackAiGenerationCompleted,
  trackAiGenerationStarted,
  trackUserRatedOutput,
} from '@/lib/analytics'
import type { SynthesisResult } from '@/lib/types'
import { cn } from '@/lib/utils'

const EXAMPLE_QUERIES = [
  'What do we know about why enterprise customers churn in the first 90 days?',
  'What assumptions are driving our Q1 roadmap?',
  'Have we already run experiments on SSO onboarding?',
]

const SOURCE_LABELS: Record<string, string> = {
  notion: 'Notion',
  dovetail: 'Dovetail',
  productboard: 'Productboard',
  slack: 'Slack',
  confluence: 'Confluence',
  manual: 'Manual',
}

function confidenceBadge(confidence: string) {
  const styles: Record<string, string> = {
    high: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    medium: 'bg-amber-500/15 text-amber-200 border-amber-500/30',
    low: 'bg-orange-500/15 text-orange-200 border-orange-500/30',
    coverage_gap: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  }
  return styles[confidence] ?? styles.medium
}

export function DiscoveryWorkspace() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SynthesisResult | null>(null)

  const runQuery = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) {
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    trackAiGenerationStarted('rag_query')
    const startedAt = performance.now()

    try {
      const synthesis = await queryMemory(trimmed)
      setResult(synthesis)
      trackAiGenerationCompleted('rag_query', performance.now() - startedAt, true)
    } catch (err) {
      trackAiGenerationCompleted('rag_query', performance.now() - startedAt, false)
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-10 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-card-border)] bg-[var(--color-card)] px-4 py-1.5 text-sm text-[var(--color-muted)]">
          <Brain className="h-4 w-4 text-[var(--color-accent)]" />
          Phase 1 — Organizational memory intelligence
        </div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Ask what your organization already knows
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-[var(--color-muted)]">
          I know we have answers somewhere. I just don&apos;t know where. PDI
          connects research, assumptions, and decisions across your discovery
          corpus — with citations you can verify in one click.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-4 shadow-xl shadow-black/20">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            void runQuery(query)
          }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-muted)]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="What do we know about…"
              className="h-12 w-full rounded-xl border border-[var(--color-card-border)] bg-[#0d1219] pl-11 pr-4 text-[var(--color-foreground)] outline-none ring-[var(--color-accent)] placeholder:text-[var(--color-muted)] focus:ring-2"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-6 font-medium text-white transition hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Synthesizing…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Query memory
              </>
            )}
          </button>
        </form>

        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLE_QUERIES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => {
                setQuery(example)
                void runQuery(example)
              }}
              className="rounded-lg border border-[var(--color-card-border)] px-3 py-1.5 text-left text-xs text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-foreground)]"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
        >
          {error}
        </div>
      )}

      {result && (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-medium">Synthesis</h2>
                <span
                  className={cn(
                    'rounded-full border px-2.5 py-0.5 text-xs capitalize',
                    result.coverageState === 'sufficient'
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                      : result.coverageState === 'gap'
                        ? 'border-slate-500/30 bg-slate-500/10 text-slate-300'
                        : 'border-amber-500/30 bg-amber-500/10 text-amber-200'
                  )}
                >
                  {result.coverageState.replace('_', ' ')} coverage
                </span>
              </div>
              <p className="whitespace-pre-wrap leading-relaxed text-[var(--color-muted)]">
                {result.overview}
              </p>
            </section>

            {result.claims.length > 0 && (
              <section className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-6">
                <h2 className="mb-4 text-lg font-medium">Key claims</h2>
                <ul className="space-y-4">
                  {result.claims.map((claim, index) => (
                    <li
                      key={`${claim.text.slice(0, 24)}-${index}`}
                      className="rounded-xl border border-[var(--color-card-border)] bg-[#0d1219] p-4"
                    >
                      <p className="text-sm leading-relaxed">{claim.text}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                        <span
                          className={cn(
                            'rounded-full border px-2 py-0.5 capitalize',
                            confidenceBadge(claim.confidence)
                          )}
                        >
                          {claim.confidence} confidence
                        </span>
                        <span className="text-[var(--color-muted)]">
                          {claim.confidenceRationale}
                        </span>
                        {claim.citationIds.length > 0 && (
                          <span className="text-[var(--color-muted)]">
                            Sources: [{claim.citationIds.join(', ')}]
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {result.conflicts && result.conflicts.length > 0 && (
              <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
                <div className="mb-3 flex items-center gap-2 text-amber-200">
                  <AlertTriangle className="h-4 w-4" />
                  <h2 className="text-lg font-medium">Conflicting evidence</h2>
                </div>
                <ul className="list-disc space-y-2 pl-5 text-sm text-amber-100/90">
                  {result.conflicts.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            )}

            {result.evidenceGaps && result.evidenceGaps.length > 0 && (
              <section className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-6">
                <h2 className="mb-3 text-lg font-medium">Evidence gaps</h2>
                <ul className="list-disc space-y-2 pl-5 text-sm text-[var(--color-muted)]">
                  {result.evidenceGaps.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            )}

            {result.nextQuestions.length > 0 && (
              <section className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-6">
                <h2 className="mb-3 text-lg font-medium">Next questions</h2>
                <ul className="space-y-2">
                  {result.nextQuestions.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-[var(--color-muted)]"
                    >
                      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="flex items-center gap-3 text-sm text-[var(--color-muted)]">
              <span>Was this helpful?</span>
              <button
                type="button"
                onClick={() => trackUserRatedOutput('thumbs_up')}
                className="rounded-lg border border-[var(--color-card-border)] p-2 hover:bg-white/5"
              >
                <ThumbsUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => trackUserRatedOutput('thumbs_down')}
                className="rounded-lg border border-[var(--color-card-border)] p-2 hover:bg-white/5"
              >
                <ThumbsDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          <aside className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-5">
            <div className="mb-4 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[var(--color-accent)]" />
              <h2 className="font-medium">Sources</h2>
            </div>
            {result.citations.length === 0 ? (
              <p className="text-sm text-[var(--color-muted)]">
                No sources matched this query.
              </p>
            ) : (
              <ul className="space-y-4">
                {result.citations.map((citation) => (
                  <li
                    key={citation.id}
                    className="rounded-xl border border-[var(--color-card-border)] bg-[#0d1219] p-3"
                  >
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <span className="text-xs font-medium text-[var(--color-accent)]">
                        [{citation.id}]
                      </span>
                      <span className="text-xs text-[var(--color-muted)]">
                        score {citation.retrievalScore}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{citation.title}</p>
                    <p className="mt-1 text-xs text-[var(--color-muted)]">
                      {SOURCE_LABELS[citation.source] ?? citation.source}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-[var(--color-muted)]">
                      {citation.excerpt}
                    </p>
                    {citation.sourceUrl && (
                      <a
                        href={citation.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs text-[var(--color-accent)] hover:underline"
                      >
                        Open source
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      )}
    </div>
  )
}
