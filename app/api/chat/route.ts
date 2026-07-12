import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { OPTIONS, withCors } from '@/lib/api-route'
import { anthropic, CLAUDE_MODEL, TEMPERATURE_CONVERSATIONAL } from '@/lib/anthropic'
import type { ChatMessage, ChatRequest } from '@/lib/types'

export const runtime = 'nodejs'
export const maxDuration = 60

export { OPTIONS }

function isChatMessage(value: unknown): value is ChatMessage {
  return (
    typeof value === 'object' &&
    value !== null &&
    'role' in value &&
    'content' in value &&
    ((value as ChatMessage).role === 'user' ||
      (value as ChatMessage).role === 'assistant') &&
    typeof (value as ChatMessage).content === 'string' &&
    (value as ChatMessage).content.trim().length > 0
  )
}

function isChatRequest(body: unknown): body is ChatRequest {
  if (
    typeof body !== 'object' ||
    body === null ||
    !('messages' in body) ||
    !Array.isArray((body as ChatRequest).messages)
  ) {
    return false
  }

  const { messages } = body as ChatRequest
  if (messages.length === 0 || !isChatMessage(messages[messages.length - 1])) {
    return false
  }

  return messages.every(isChatMessage) && messages[messages.length - 1].role === 'user'
}

async function loadSystemPrompt(): Promise<string> {
  const promptPath = path.join(process.cwd(), 'prompts', 'chat.txt')
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

  if (!isChatRequest(body)) {
    return withCors(
      request,
      Response.json(
        {
          error:
            'A non-empty messages array is required. The last message must be from the user.',
        },
        { status: 400 }
      )
    )
  }

  const messages = body.messages.map((message) => ({
    role: message.role,
    content: message.content.trim(),
  }))

  try {
    const system = await loadSystemPrompt()

    const stream = anthropic.messages.stream({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      temperature: TEMPERATURE_CONVERSATIONAL,
      system,
      messages,
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
      error instanceof Error ? error.message : 'Failed to generate chat response.'
    console.error('[PDI] Chat error:', message)
    return withCors(
      request,
      Response.json({ error: `Claude API request failed: ${message}` }, { status: 500 })
    )
  }
}
