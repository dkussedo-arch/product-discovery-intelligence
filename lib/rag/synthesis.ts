import Anthropic from '@anthropic-ai/sdk'

import type { Citation, SynthesisResult } from '@/lib/types'

const SYNTHESIS_MODEL = 'claude-sonnet-4-6'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

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
      'We have no relevant evidence in your discovery corpus for this question. This is a coverage gap — not a search failure.',
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

  const response = await anthropic.messages.create({
    model: SYNTHESIS_MODEL,
    max_tokens: 4096,
    temperature: 0.2,
    system: `You are the intelligence layer for Product Discovery Intelligence (PDI), an organizational memory platform for product teams.

Rules:
1. Ground every claim in the provided source excerpts only.
2. Cite sources using [n] notation matching Source numbers in the context.
3. Surface conflicting evidence explicitly — never resolve conflicts silently.
4. Name evidence gaps when the corpus is thin.
5. Assign confidence (high | medium | low) per major claim with a one-sentence rationale.
6. You are an evidence surface, not a decision engine — do not prescribe product decisions.

Return ONLY valid JSON with this shape:
{
  "overview": "2-4 paragraph synthesis",
  "claims": [{ "text": "...", "confidence": "high|medium|low", "confidenceRationale": "...", "citationIds": [1,2] }],
  "conflicts": ["optional list of contradictions found"],
  "evidenceGaps": ["optional list of what is missing"],
  "nextQuestions": ["2-4 suggested follow-up investigations"],
  "coverageState": "sufficient|limited|gap"
}`,
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
