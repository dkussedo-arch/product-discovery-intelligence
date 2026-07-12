/**
 * Promptfoo assertion — expects `expected` var as JSON string from test case.
 * @param {string} output - Model response
 * @param {object} context - Promptfoo context; context.vars.expected
 */
export default function assertDocumentOutput(output, context) {
  const NOT_FOUND_PHRASE = 'I cannot find this information in the provided document.'

  let expected = {}
  try {
    expected = JSON.parse(context.vars?.expected ?? '{}')
  } catch {
    return { pass: false, score: 0, reason: 'Invalid expected fixture JSON' }
  }

  let parsed
  try {
    parsed = JSON.parse(output)
  } catch {
    return { pass: false, score: 0, reason: 'Output is not valid JSON' }
  }

  if (parsed.error) {
    if (expected.should_flag_not_found) {
      return { pass: true, score: 1, reason: 'Error response acceptable for not-found case' }
    }
    return { pass: false, score: 0, reason: `Unexpected error: ${parsed.error}` }
  }

  if (expected.should_flag_not_found) {
    const summary = String(parsed.summary ?? '')
    const flags = Array.isArray(parsed.flags) ? parsed.flags : []
    const flagged =
      summary.includes(NOT_FOUND_PHRASE) ||
      flags.some(
        (flag) =>
          String(flag).toUpperCase().includes('NOT_FOUND') ||
          String(flag).toLowerCase().includes('not find')
      ) ||
      parsed.confidence === 'LOW'

    return {
      pass: flagged,
      score: flagged ? 1 : 0,
      reason: flagged
        ? 'Correctly flagged missing or irrelevant content'
        : 'Expected NOT_FOUND flag or phrase in summary/flags',
    }
  }

  const summary = String(parsed.summary ?? '').toLowerCase()

  if (Array.isArray(expected.summary_contains)) {
    for (const term of expected.summary_contains) {
      if (!summary.includes(String(term).toLowerCase())) {
        return {
          pass: false,
          score: 0,
          reason: `Summary missing required term: ${term}`,
        }
      }
    }
  }

  if (typeof expected.action_items_min === 'number') {
    const items = Array.isArray(parsed.action_items) ? parsed.action_items : []
    if (items.length < expected.action_items_min) {
      return {
        pass: false,
        score: 0,
        reason: `Expected at least ${expected.action_items_min} action item(s), got ${items.length}`,
      }
    }
  }

  if (!parsed.summary || typeof parsed.summary !== 'string') {
    return { pass: false, score: 0, reason: 'Missing summary field' }
  }

  return { pass: true, score: 1, reason: 'All expectations met' }
}
