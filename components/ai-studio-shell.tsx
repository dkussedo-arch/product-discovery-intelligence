'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  AlertTriangle,
  BookOpen,
  Database,
  ExternalLink,
  Loader2,
  Plus,
  Search,
  Settings2,
  Sparkles,
} from 'lucide-react'

import { ingestArtifact, listArtifacts, queryMemory } from '@/lib/pdi-api'
import {
  trackAiGenerationCompleted,
  trackAiGenerationStarted,
} from '@/lib/analytics'
import type { ArtifactSource, SynthesisResult } from '@/lib/types'
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

const SOURCE_OPTIONS: ArtifactSource[] = [
  'notion',
  'dovetail',
  'productboard',
  'slack',
  'confluence',
  'manual',
]

interface AiStudioShellProps {
  defaultApiBase?: string
  showApiConfig?: boolean
}

function confidenceClass(confidence: string): string {
  const styles: Record<string, string> = {
    high: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
    medium: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
    low: 'border-orange-500/30 bg-orange-500/10 text-orange-200',
  }
  return styles[confidence] ?? styles.medium
}

export function AiStudioShell({
  defaultApiBase = '',
  showApiConfig = true,
}: AiStudioShellProps) {
  const [apiBase, setApiBase] = useState(defaultApiBase)
  const [apiKey, setApiKey] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SynthesisResult | null>(null)
  const [corpusCount, setCorpusCount] = useState<number | null>(null)
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>(
    'checking'
  )
  const [apiStatusMessage, setApiStatusMessage] = useState<string | null>(null)

  const [ingestTitle, setIngestTitle] = useState('')
  const [ingestContent, setIngestContent] = useState('')
  const [ingestSource, setIngestSource] = useState<ArtifactSource>('manual')
  const [ingestAuthor, setIngestAuthor] = useState('')
  const [ingesting, setIngesting] = useState(false)
  const [ingestMessage, setIngestMessage] = useState<string | null>(null)

  const apiOptions = useCallback(
    () => ({
      apiBase: apiBase || undefined,
      apiKey: apiKey || undefined,
    }),
    [apiBase, apiKey]
  )

  const refreshCorpus = useCallback(async () => {
    try {
      const data = await listArtifacts(apiOptions())
      setCorpusCount(data.count)
      setApiStatus('connected')
      setApiStatusMessage(null)
    } catch (err) {
      setCorpusCount(null)
      setApiStatus('error')
      setApiStatusMessage(
        err instanceof Error
          ? err.message
          : 'Cannot connect to the API. Start the dev server: npx.cmd pnpm run dev'
      )
    }
  }, [apiOptions])

  useEffect(() => {
    void refreshCorpus()
  }, [refreshCorpus])

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
      const synthesis = await queryMemory(trimmed, apiOptions())
      setResult(synthesis)
      trackAiGenerationCompleted('rag_query', performance.now() - startedAt, true)
    } catch (err) {
      trackAiGenerationCompleted('rag_query', performance.now() - startedAt, false)
      setError(err instanceof Error ? err.message : 'Query failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleIngest = async () => {
    if (!ingestTitle.trim() || !ingestContent.trim() || ingesting) {
      return
    }

    setIngesting(true)
    setIngestMessage(null)
    setError(null)

    try {
      await ingestArtifact(
        {
          title: ingestTitle.trim(),
          content: ingestContent.trim(),
          source: ingestSource,
          author: ingestAuthor.trim() || undefined,
        },
        apiOptions()
      )
      setIngestTitle('')
      setIngestContent('')
      setIngestAuthor('')
      setIngestMessage('Artifact ingested — corpus updated.')
      await refreshCorpus()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ingest failed.')
    } finally {
      setIngesting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      {apiStatus === 'checking' && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card)] px-4 py-3 text-sm text-[var(--color-muted)]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Connecting to API…
        </div>
      )}

      {apiStatus === 'error' && apiStatusMessage && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
        >
          {apiStatusMessage}
        </div>
      )}

      {showApiConfig && (
        <div className="mb-6 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Settings2 className="h-4 w-4 text-[var(--color-accent)]" />
            API connection (for AI Studio cross-origin)
          </div>
          <input
            value={apiBase}
            onChange={(event) => setApiBase(event.target.value)}
            placeholder="https://your-pdi-deployment.vercel.app (leave empty for same origin)"
            className="h-10 w-full rounded-lg border border-[var(--color-card-border)] bg-[#0d1219] px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          />
          <input
            type="password"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder="API secret (required for cross-origin when PDI_API_SECRET is set)"
            autoComplete="off"
            className="mt-2 h-10 w-full rounded-lg border border-[var(--color-card-border)] bg-[#0d1219] px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          />
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            On localhost, leave both empty — the studio uses the same dev server.
            For Google AI Studio (cross-origin), set your deployed PDI URL and matching
            PDI_API_SECRET.
            {corpusCount !== null && (
              <span className="ml-2 inline-flex items-center gap-1">
                <Database className="h-3 w-3" />
                {corpusCount} artifacts in corpus
              </span>
            )}
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-4">
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
              className="h-12 w-full rounded-xl border border-[var(--color-card-border)] bg-[#0d1219] pl-11 pr-4 outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-6 font-medium text-white disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Synthesizing…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                POST /api/query
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
              className="rounded-lg border border-[var(--color-card-border)] px-3 py-1.5 text-left text-xs text-[var(--color-muted)] hover:border-[var(--color-accent)]"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      <details className="mt-4 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-4">
        <summary className="cursor-pointer text-sm font-medium">
          Ingest artifact → POST /api/ingest
        </summary>
        <div className="mt-4 space-y-3">
          <input
            value={ingestTitle}
            onChange={(event) => setIngestTitle(event.target.value)}
            placeholder="Title"
            className="h-10 w-full rounded-lg border border-[var(--color-card-border)] bg-[#0d1219] px-3 text-sm"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              value={ingestSource}
              onChange={(event) =>
                setIngestSource(event.target.value as ArtifactSource)
              }
              className="h-10 rounded-lg border border-[var(--color-card-border)] bg-[#0d1219] px-3 text-sm"
            >
              {SOURCE_OPTIONS.map((source) => (
                <option key={source} value={source}>
                  {SOURCE_LABELS[source]}
                </option>
              ))}
            </select>
            <input
              value={ingestAuthor}
              onChange={(event) => setIngestAuthor(event.target.value)}
              placeholder="Author (optional)"
              className="h-10 rounded-lg border border-[var(--color-card-border)] bg-[#0d1219] px-3 text-sm"
            />
          </div>
          <textarea
            value={ingestContent}
            onChange={(event) => setIngestContent(event.target.value)}
            placeholder="Paste research notes, decision record, or interview synthesis…"
            rows={5}
            className="w-full rounded-lg border border-[var(--color-card-border)] bg-[#0d1219] px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => void handleIngest()}
            disabled={ingesting || !ingestTitle.trim() || !ingestContent.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent-soft)] px-4 py-2 text-sm text-[var(--color-accent)] disabled:opacity-50"
          >
            {ingesting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Ingest
          </button>
          {ingestMessage && (
            <p className="text-sm text-emerald-300">{ingestMessage}</p>
          )}
        </div>
      </details>

      {error && (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
        >
          {error}
        </div>
      )}

      {result && (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="space-y-5">
            <section className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-medium">Synthesis</h2>
                <span className="rounded-full border border-[var(--color-card-border)] px-2 py-0.5 text-xs capitalize">
                  {result.coverageState} coverage
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-muted)]">
                {result.overview}
              </p>
            </section>

            {result.claims.length > 0 && (
              <section className="space-y-3">
                {result.claims.map((claim, index) => (
                  <div
                    key={`${claim.text.slice(0, 20)}-${index}`}
                    className="rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-4 text-sm"
                  >
                    <p>{claim.text}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span
                        className={cn(
                          'rounded-full border px-2 py-0.5 capitalize',
                          confidenceClass(claim.confidence)
                        )}
                      >
                        {claim.confidence}
                      </span>
                      <span className="text-[var(--color-muted)]">
                        {claim.confidenceRationale}
                      </span>
                    </div>
                  </div>
                ))}
              </section>
            )}

            {result.conflicts && result.conflicts.length > 0 && (
              <section className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                <div className="mb-2 flex items-center gap-2 text-amber-200">
                  <AlertTriangle className="h-4 w-4" />
                  <h3 className="text-sm font-medium">Conflicts</h3>
                </div>
                <ul className="list-disc space-y-1 pl-5 text-sm text-amber-100/90">
                  {result.conflicts.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
              <BookOpen className="h-4 w-4 text-[var(--color-accent)]" />
              Citations
            </div>
            <ul className="space-y-3">
              {result.citations.map((citation) => (
                <li
                  key={citation.id}
                  className="rounded-lg border border-[var(--color-card-border)] bg-[#0d1219] p-3 text-xs"
                >
                  <p className="font-medium text-[var(--color-accent)]">
                    [{citation.id}] {citation.title}
                  </p>
                  <p className="mt-1 text-[var(--color-muted)]">
                    {SOURCE_LABELS[citation.source] ?? citation.source}
                  </p>
                  <p className="mt-2 leading-relaxed text-[var(--color-muted)]">
                    {citation.excerpt}
                  </p>
                  {citation.sourceUrl && (
                    <a
                      href={citation.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-[var(--color-accent)]"
                    >
                      Open
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      )}
    </div>
  )
}
