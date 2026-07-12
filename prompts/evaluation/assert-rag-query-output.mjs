/**
 * Promptfoo assertions for RAG synthesis query evals.
 * Expects context.vars.expected as JSON: must_contain, must_not_contain, max_words, automatic_fail_if_contains
 */
export default function assertRagQueryOutput(output, context) {
  let expected = {}
  try {
    expected = JSON.parse(context.vars?.expected ?? '{}')
  } catch {
    return { pass: false, score: 0, reason: 'Invalid expected fixture JSON' }
  }

  const text = String(output ?? '')
  const lower = text.toLowerCase()

  const requiredSections = [
    'SUMMARY',
    'EVIDENCE',
    'CONFLICTS',
    'KNOWLEDGE GAPS',
    'NEXT QUESTIONS',
    'SOURCES',
  ]
  for (const section of requiredSections) {
    if (!text.includes(section)) {
      return {
        pass: false,
        score: 0,
        reason: `Missing mandatory section: ${section}`,
      }
    }
  }

  for (const term of expected.automatic_fail_if_contains ?? []) {
    if (lower.includes(String(term).toLowerCase())) {
      return {
        pass: false,
        score: 0,
        reason: `AUTOMATIC FAIL: output contains forbidden term "${term}"`,
      }
    }
  }

  for (const term of expected.must_not_contain ?? []) {
    if (lower.includes(String(term).toLowerCase())) {
      return {
        pass: false,
        score: 0,
        reason: `Output must not contain: ${term}`,
      }
    }
  }

  for (const term of expected.must_contain ?? []) {
    if (!lower.includes(String(term).toLowerCase())) {
      return {
        pass: false,
        score: 0,
        reason: `Output must contain: ${term}`,
      }
    }
  }

  if (typeof expected.max_words === 'number' && expected.max_words > 0) {
    const words = text.trim().split(/\s+/).filter(Boolean).length
    if (words > expected.max_words) {
      return {
        pass: false,
        score: 0,
        reason: `Output exceeds ${expected.max_words} words (${words} words)`,
      }
    }
  }

  return { pass: true, score: 1, reason: 'All criteria met' }
}
