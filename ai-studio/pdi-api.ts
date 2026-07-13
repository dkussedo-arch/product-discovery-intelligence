import type { IngestRequest, SynthesisResult } from './types'

/** Set to your deployed PDI URL when running inside Google AI Studio. */
export const PDI_API_BASE =
  (typeof import.meta !== 'undefined' &&
    (import.meta as { env?: { VITE_PDI_API_URL?: string } }).env?.VITE_PDI_API_URL) ||
  'https://product-discovery-intelligence.vercel.app'

/**
 * Optional API secret for cross-origin calls.
 * Must match PDI_API_SECRET on the server. Prefer injecting via AI Studio secrets —
 * do not hardcode production values in source.
 */
export const PDI_API_KEY =
  (typeof import.meta !== 'undefined' &&
    (import.meta as { env?: { VITE_PDI_API_KEY?: string } }).env?.VITE_PDI_API_KEY) ||
  ''

function apiUrl(path: string, base = PDI_API_BASE): string {
  return `${base.replace(/\/$/, '')}${path}`
}

function authHeaders(jsonBody = false): HeadersInit {
  const headers: Record<string, string> = {}
  if (jsonBody) {
    headers['Content-Type'] = 'application/json'
  }
  if (PDI_API_KEY.trim()) {
    headers.Authorization = `Bearer ${PDI_API_KEY.trim()}`
  }
  return headers
}

async function parseJson<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T & { error?: string }
  if (!response.ok) {
    throw new Error(
      payload && typeof payload === 'object' && 'error' in payload && payload.error
        ? payload.error
        : `Request failed (${response.status})`
    )
  }
  return payload
}

export async function queryMemory(
  query: string,
  apiBase = PDI_API_BASE
): Promise<SynthesisResult> {
  const response = await fetch(apiUrl('/api/query', apiBase), {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify({ query }),
  })
  return parseJson<SynthesisResult>(response)
}

export async function ingestArtifact(
  payload: IngestRequest,
  apiBase = PDI_API_BASE
): Promise<void> {
  const response = await fetch(apiUrl('/api/ingest', apiBase), {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify(payload),
  })
  await parseJson(response)
}

export async function listArtifactCount(apiBase = PDI_API_BASE): Promise<number> {
  const response = await fetch(apiUrl('/api/ingest', apiBase), {
    headers: authHeaders(),
  })
  const data = await parseJson<{ count: number }>(response)
  return data.count
}
