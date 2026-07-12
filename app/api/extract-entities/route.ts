import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { OPTIONS, withCors } from '@/lib/api-route'
import { anthropic, CLAUDE_MODEL, TEMPERATURE_ANALYTICAL } from '@/lib/anthropic'
import type { ExtractEntitiesRequest } from '@/lib/types'

export const runtime = 'nodejs'
export const maxDuration = 60

export { OPTIONS }

function isExtractEntitiesRequest(body: unknown): body is ExtractEntitiesRequest {
  return (
    typeof body === 'object' &&
    body !== null &&
    'text' in body &&
    typeof (body as ExtractEntitiesRequest).text === 'string'
  )
}

async function loadSystemPrompt(): Promise<string> {
  const promptPath = path.join(process.cwd(), 'prompts', 'entity-extraction.txt')
  return readFile(promptPath, 'utf-8')
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

  if (!isExtractEntitiesRequest(body) || !body.text.trim()) {
    return withCors(
      request,
      Response.json({ error: 'A non-empty text field is required.' }, { status: 400 })
    )
  }

  const text = body.text.trim()

  try {
    const system = await loadSystemPrompt()

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
      error instanceof Error ? error.message : 'Failed to extract entities from text.'
    console.error('[PDI] Entity extraction error:', message)
    return withCors(
      request,
      Response.json({ error: `Claude API request failed: ${message}` }, { status: 500 })
    )
  }
}
