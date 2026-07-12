#!/usr/bin/env node
/**
 * Generate prompts/evaluation/rag-query-tests.promptfoo.yaml from evals/test-cases.json
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const jsonPath = resolve(root, 'evals/test-cases.json')
const yamlPath = resolve(root, 'prompts/evaluation/rag-query-tests.promptfoo.yaml')

const cases = JSON.parse(readFileSync(jsonPath, 'utf8'))

const lines = cases.map((tc) => {
  const criteria = {
    must_contain: tc.must_contain ?? [],
    must_not_contain: tc.must_not_contain ?? [],
    max_words: tc.max_words ?? null,
    automatic_fail_if_contains: tc.automatic_fail_if_contains ?? [],
  }
  const expected = JSON.stringify(criteria)
  const context = String(tc.retrieved_context ?? '').replace(/\r\n/g, '\n').trimEnd()
  const query = String(tc.user_query ?? '').trim()

  return [
    `- description: ${tc.id} — ${tc.name}`,
    '  vars:',
    `    query: ${JSON.stringify(query)}`,
    '    context: |',
    ...context.split('\n').map((line) => `      ${line}`),
    `    expected: '${expected.replace(/'/g, "''")}'`,
    '',
  ].join('\n')
})

writeFileSync(yamlPath, `${lines.join('\n').trimEnd()}\n`, 'utf8')
console.log(`Wrote ${cases.length} RAG query test cases to ${yamlPath}`)
