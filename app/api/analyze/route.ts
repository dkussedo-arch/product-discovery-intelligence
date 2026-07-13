import { OPTIONS, withCors } from '@/lib/api-route'
import { anthropic, CLAUDE_MODEL, TEMPERATURE_ANALYTICAL } from '@/lib/anthropic'
import { loadPrompt } from '@/lib/load-prompt'
import type { AnalyzeRequest } from '@/lib/types'

export const runtime = 'nodejs'
export const maxDuration = 60

export { OPTIONS }

function isAnalyzeRequest(body: unknown): body is AnalyzeRequest {
  return (
    typeof body === 'object' &&
    body !== null &&
    'text' in body &&
    typeof (body as AnalyzeRequest).text === 'string'
  )
}

export async function POST(request: Request): Promise<Response> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return withCors(
      request,
      Response.json(
        { error: 'AI service is not configured. Set ANTHROPIC_API_KEY.' },
        { status: 503 }
      )
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return withCors(
      request,
      Response.json({ error: 'Request body must be valid JSON.' }, { status: 400 })
    )
  }

  if (!isAnalyzeRequest(body) || !body.text.trim()) {
    return withCors(
      request,
      Response.json({ error: 'A non-empty text field is required.' }, { status: 400 })
    )
  }

  const text = body.text.trim()

  try {
    const system = await loadPrompt('document-analysis')

    const stream = anthropic.messages.stream({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      temperature: TEMPERATURE_ANALYTICAL,
      system,
      messages: [{ role: 'user', content: text }],
    })

    return withCors(
      request,
      new Response(stream.toReadableStream(), {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      })
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to analyze document text.'
    console.error('[PDI] Analyze error:', message)
    return withCors(
      request,
      Response.json({ error: `Claude API request failed: ${message}` }, { status: 500 })
    )
  }
}
