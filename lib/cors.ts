const DEFAULT_ORIGINS = [
  'https://ai.studio',
  'https://aistudio.google.com',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
]

function parseAllowedOrigins(): string[] {
  const extra = process.env.ALLOWED_CORS_ORIGINS?.split(',').map((o) => o.trim()).filter(Boolean) ?? []
  return [...DEFAULT_ORIGINS, ...extra]
}

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) {
    return false
  }

  const allowed = parseAllowedOrigins()
  if (allowed.includes(origin)) {
    return true
  }

  try {
    const { hostname } = new URL(origin)
    return (
      hostname.endsWith('.ai.studio') ||
      hostname === 'ai.studio' ||
      hostname.endsWith('aistudio.google.com')
    )
  } catch {
    return false
  }
}

export function corsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get('origin')
  if (!origin || !isAllowedOrigin(origin)) {
    return {}
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

export function withCors(request: Request, response: Response): Response {
  const headers = new Headers(response.headers)
  for (const [key, value] of Object.entries(corsHeaders(request))) {
    headers.set(key, value)
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

export function corsPreflightResponse(request: Request): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request),
  })
}
