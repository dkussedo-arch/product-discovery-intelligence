#!/usr/bin/env node
/**
 * Generate test-cases.promptfoo.yaml from prompts/evaluation/test-cases.json
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const evalDir = resolve(root, 'prompts/evaluation')
const jsonPath = resolve(evalDir, 'test-cases.json')
const yamlPath = resolve(evalDir, 'test-cases.promptfoo.yaml')

const cases = JSON.parse(readFileSync(jsonPath, 'utf8'))

const lines = cases.map((tc) => {
  const label = tc.name ?? tc.description ?? tc.id
  const expected = JSON.stringify(tc.expected ?? {})
  const input = String(tc.input ?? '').replace(/\r\n/g, '\n').trimEnd()

  return [
    `- description: ${tc.id} — ${label}`,
    '  vars:',
    '    input: |',
    ...input.split('\n').map((line) => `      ${line}`),
    `    expected: '${expected.replace(/'/g, "''")}'`,
    '',
  ].join('\n')
})

writeFileSync(yamlPath, `${lines.join('\n').trimEnd()}\n`, 'utf8')
console.log(`Wrote ${cases.length} test cases to ${yamlPath}`)
