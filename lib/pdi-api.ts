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

export interface PdiApiOptions {
  apiBase?: string
  /** Required for cross-origin calls when the server has PDI_API_SECRET set. */
  apiKey?: string
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

function buildHeaders(apiKey?: string, jsonBody = false): HeadersInit {
  const headers: Record<string, string> = {}
  if (jsonBody) {
    headers['Content-Type'] = 'application/json'
  }
  if (apiKey?.trim()) {
    headers.Authorization = `Bearer ${apiKey.trim()}`
  }
  return headers
}

async function apiFetch(
  path: string,
  init: RequestInit | undefined,
  options?: PdiApiOptions
): Promise<Response> {
  const base = resolveApiBase(options?.apiBase)
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

function normalizeOptions(
  apiBaseOrOptions?: string | PdiApiOptions
): PdiApiOptions {
  if (typeof apiBaseOrOptions === 'string' || apiBaseOrOptions === undefined) {
    return { apiBase: apiBaseOrOptions }
  }
  return apiBaseOrOptions
}

export async function queryMemory(
  query: string,
  apiBaseOrOptions?: string | PdiApiOptions
): Promise<SynthesisResult> {
  const options = normalizeOptions(apiBaseOrOptions)
  const response = await apiFetch(
    '/api/query',
    {
      method: 'POST',
      headers: buildHeaders(options.apiKey, true),
      body: JSON.stringify({ query }),
    },
    options
  )

  return parseJson<SynthesisResult>(response)
}

export async function ingestArtifact(
  payload: IngestRequest,
  apiBaseOrOptions?: string | PdiApiOptions
): Promise<{ artifact: ArtifactSummary & { content?: string } }> {
  const options = normalizeOptions(apiBaseOrOptions)
  const response = await apiFetch(
    '/api/ingest',
    {
      method: 'POST',
      headers: buildHeaders(options.apiKey, true),
      body: JSON.stringify(payload),
    },
    options
  )

  return parseJson(response)
}

export async function listArtifacts(
  apiBaseOrOptions?: string | PdiApiOptions
): Promise<IngestListResponse> {
  const options = normalizeOptions(apiBaseOrOptions)
  const response = await apiFetch(
    '/api/ingest',
    {
      method: 'GET',
      headers: buildHeaders(options.apiKey),
    },
    options
  )
  return parseJson(response)
}
