import { synthesizeAnswer } from '@/lib/rag/synthesis'
import {
  buildContextBlock,
  retrieveRelevantChunks,
  toCitations,
} from '@/lib/rag/retrieval'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: Request): Promise<Response> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: 'AI service is not configured. Set ANTHROPIC_API_KEY.' },
      { status: 503 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Request body must be valid JSON.' }, { status: 400 })
  }

  const query =
    typeof body === 'object' &&
    body !== null &&
    'query' in body &&
    typeof (body as { query: unknown }).query === 'string'
      ? (body as { query: string }).query.trim()
      : ''

  if (!query) {
    return Response.json({ error: 'A query string is required.' }, { status: 400 })
  }

  try {
    const retrieved = retrieveRelevantChunks(query)
    const citations = toCitations(retrieved)
    const context = buildContextBlock(retrieved)
    const result = await synthesizeAnswer(query, context, citations)

    return Response.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Query failed.'
    console.error('[PDI] Query error:', message)
    return Response.json({ error: 'Failed to process query. Please try again.' }, { status: 500 })
  }
}
