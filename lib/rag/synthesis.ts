import { anthropic, CLAUDE_MODEL, TEMPERATURE_ANALYTICAL } from '@/lib/anthropic'
import { loadPrompt } from '@/lib/load-prompt'

import type { Citation, SynthesisResult } from '@/lib/types'

function parseJsonObject(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    const start = text.indexOf('{')
    const end = text.lastIndexOf('}')
    if (start === -1 || end === -1) {
      throw new Error('AI response did not contain JSON.')
    }
    return JSON.parse(text.slice(start, end + 1))
  }
}

function coverageGapResponse(query: string): SynthesisResult {
  return {
    query,
    overview:
      'I cannot find this information in the provided document. This is a coverage gap — not a search failure.',
    claims: [],
    evidenceGaps: [
      'No artifacts in the connected corpus address this topic directly.',
    ],
    nextQuestions: [
      'What customer interviews or feedback exist on this topic that have not been ingested?',
      'Which assumptions underpin this question, and are they documented?',
    ],
    citations: [],
    coverageState: 'gap',
  }
}

export async function synthesizeAnswer(
  query: string,
  context: string,
  citations: Citation[]
): Promise<SynthesisResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured.')
  }

  if (!context.trim()) {
    return coverageGapResponse(query)
  }

  const system = await loadPrompt('synthesis')

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    temperature: TEMPERATURE_ANALYTICAL,
    system,
    messages: [
      {
        role: 'user',
        content: `User question: ${query}

Retrieved organizational context:
${context}

Available citation IDs for reference: ${citations.map((c) => c.id).join(', ') || 'none'}`,
      },
    ],
  })

  const text =
    response.content[0]?.type === 'text' ? response.content[0].text : ''
  const parsed = parseJsonObject(text) as Partial<SynthesisResult>

  return {
    query,
    overview: parsed.overview ?? 'No overview generated.',
    claims: parsed.claims ?? [],
    conflicts: parsed.conflicts,
    evidenceGaps: parsed.evidenceGaps,
    nextQuestions: parsed.nextQuestions ?? [],
    citations,
    coverageState: parsed.coverageState ?? 'limited',
  }
}
