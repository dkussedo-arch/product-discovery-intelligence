import type { ArtifactSource, IngestRequest, SynthesisResult } from '@/lib/types'

export interface ArtifactSummary {
  id: string
  title: string
  source: ArtifactSource
  createdAt: string
  tags?: string[]
}

export interface IngestListResponse {
  count: number
  artifacts: ArtifactSummary[]
}

function resolveApiBase(explicitBase?: string): string {
  if (explicitBase?.trim()) {
    return explicitBase.trim().replace(/\/$/, '')
  }

  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  return process.env.NEXT_PUBLIC_PDI_API_URL?.replace(/\/$/, '') ?? ''
}

async function apiFetch(
  path: string,
  init: RequestInit | undefined,
  apiBase?: string
): Promise<Response> {
  const base = resolveApiBase(apiBase)
  const url = `${base}${path}`

  try {
    return await fetch(url, init)
  } catch {
    const onLocalDev =
      typeof window !== 'undefined' && base === window.location.origin
    throw new Error(
      onLocalDev
        ? 'Cannot connect to the API. Start the dev server from the repo root: npx.cmd pnpm run dev'
        : `Cannot connect to ${base}. Check the API base URL and that the backend is running.`
    )
  }
}

async function parseJson<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T & { error?: string }
  if (!response.ok) {
    throw new Error(
      typeof payload === 'object' &&
        payload !== null &&
        'error' in payload &&
        payload.error
        ? payload.error
        : `Request failed (${response.status})`
    )
  }
  return payload
}

export async function queryMemory(
  query: string,
  apiBase?: string
): Promise<SynthesisResult> {
  const response = await apiFetch(
    '/api/query',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    },
    apiBase
  )

  return parseJson<SynthesisResult>(response)
}

export async function ingestArtifact(
  payload: IngestRequest,
  apiBase?: string
): Promise<{ artifact: ArtifactSummary & { content?: string } }> {
  const response = await apiFetch(
    '/api/ingest',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    apiBase
  )

  return parseJson(response)
}

export async function listArtifacts(
  apiBase?: string
): Promise<IngestListResponse> {
  const response = await apiFetch('/api/ingest', { method: 'GET' }, apiBase)
  return parseJson(response)
}
