import { withCors } from '@/lib/cors'

/** Max JSON body size for AI / ingest routes (512 KiB). */
export const MAX_BODY_BYTES = 512 * 1024

const RATE_WINDOW_MS = 60_000
const RATE_LIMIT_AI = 30
const RATE_LIMIT_DEFAULT = 60

type RateBucket = { count: number; resetAt: number }

const rateBuckets = new Map<string, RateBucket>()

function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown'
  }
  return request.headers.get('x-real-ip')?.trim() || 'unknown'
}

function extractApiKey(request: Request): string | null {
  const headerKey = request.headers.get('x-api-key')?.trim()
  if (headerKey) {
    return headerKey
  }

  const auth = request.headers.get('authorization')
  if (!auth) {
    return null
  }

  const match = /^Bearer\s+(.+)$/i.exec(auth.trim())
  return match?.[1]?.trim() || null
}

function isSameOriginRequest(request: Request): boolean {
  const secFetchSite = request.headers.get('sec-fetch-site')
  if (secFetchSite === 'same-origin') {
    return true
  }

  const origin = request.headers.get('origin')
  if (!origin) {
    // Non-browser or same-origin navigation without Origin
    return secFetchSite === 'none' || !request.headers.get('referer')
  }

  try {
    const requestHost = new URL(request.url).host
    return new URL(origin).host === requestHost
  } catch {
    return false
  }
}

function checkRateLimit(
  request: Request,
  limit: number
): { ok: true } | { ok: false; retryAfterSec: number } {
  const key = `${clientIp(request)}:${request.method}:${new URL(request.url).pathname}`
  const now = Date.now()
  const existing = rateBuckets.get(key)

  if (!existing || now >= existing.resetAt) {
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return { ok: true }
  }

  if (existing.count >= limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    }
  }

  existing.count += 1
  return { ok: true }
}

function unauthorized(request: Request, message: string): Response {
  return withCors(
    request,
    Response.json({ error: message }, { status: 401 })
  )
}

function tooManyRequests(request: Request, retryAfterSec: number): Response {
  return withCors(
    request,
    new Response(JSON.stringify({ error: 'Rate limit exceeded. Try again shortly.' }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfterSec),
      },
    })
  )
}

function payloadTooLarge(request: Request): Response {
  return withCors(
    request,
    Response.json(
      { error: `Request body too large. Maximum size is ${MAX_BODY_BYTES} bytes.` },
      { status: 413 }
    )
  )
}

export type ApiGuardOptions = {
  /** Use the stricter AI route budget (default 30/min). */
  ai?: boolean
}

/**
 * Auth stub + rate limit + body-size checks for API routes.
 * Returns a Response to send immediately, or null to continue.
 */
export function guardApiRequest(
  request: Request,
  options: ApiGuardOptions = {}
): Response | null {
  const contentLength = request.headers.get('content-length')
  if (contentLength) {
    const size = Number(contentLength)
    if (Number.isFinite(size) && size > MAX_BODY_BYTES) {
      return payloadTooLarge(request)
    }
  }

  const limit = options.ai ? RATE_LIMIT_AI : RATE_LIMIT_DEFAULT
  const rate = checkRateLimit(request, limit)
  if (!rate.ok) {
    return tooManyRequests(request, rate.retryAfterSec)
  }

  const secret = process.env.PDI_API_SECRET?.trim()
  const sameOrigin = isSameOriginRequest(request)

  if (sameOrigin) {
    return null
  }

  if (!secret) {
    if (isProductionRuntime()) {
      return unauthorized(
        request,
        'Cross-origin API access requires PDI_API_SECRET. Set it on the server and send Authorization: Bearer <secret>.'
      )
    }
    return null
  }

  const provided = extractApiKey(request)
  if (provided && provided === secret) {
    return null
  }

  return unauthorized(
    request,
    'Unauthorized. Provide Authorization: Bearer <PDI_API_SECRET> or x-api-key.'
  )
}

/** Generic client-facing 500 — log details server-side only. */
export function internalErrorResponse(
  request: Request,
  logLabel: string,
  error: unknown,
  fallbackMessage: string
): Response {
  const detail = error instanceof Error ? error.message : fallbackMessage
  console.error(`[PDI] ${logLabel}:`, detail)
  return withCors(
    request,
    Response.json({ error: fallbackMessage }, { status: 500 })
  )
}
