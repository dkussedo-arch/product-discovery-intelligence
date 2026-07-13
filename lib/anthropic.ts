import Anthropic from '@anthropic-ai/sdk'

import { CLAUDE_MODEL } from '@/lib/models'

export { CLAUDE_MODEL }

/** Factual / analytical tasks: synthesis, extraction, document analysis */
export const TEMPERATURE_ANALYTICAL = 0.2 as const

/** Conversational / exploratory tasks: chat */
export const TEMPERATURE_CONVERSATIONAL = 0.7 as const

function createAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY
  const heliconeKey = process.env.HELICONE_API_KEY?.trim()

  if (heliconeKey) {
    return new Anthropic({
      apiKey,
      baseURL: 'https://anthropic.helicone.ai',
      defaultHeaders: {
        'Helicone-Auth': `Bearer ${heliconeKey}`,
      },
    })
  }

  return new Anthropic({ apiKey })
}

export const anthropic = createAnthropicClient()
