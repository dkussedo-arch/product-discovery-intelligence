import Anthropic from '@anthropic-ai/sdk'

import { CLAUDE_MODEL } from '@/lib/models'

export { CLAUDE_MODEL }

/** Factual / analytical tasks: synthesis, extraction, document analysis */
export const TEMPERATURE_ANALYTICAL = 0.2 as const

/** Conversational / exploratory tasks: chat */
export const TEMPERATURE_CONVERSATIONAL = 0.7 as const

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: 'https://anthropic.helicone.ai',
  defaultHeaders: {
    'Helicone-Auth': `Bearer ${process.env.HELICONE_API_KEY}`,
  },
})
