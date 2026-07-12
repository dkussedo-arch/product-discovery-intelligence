#!/usr/bin/env node
/**
 * Run Promptfoo evals and enforce deploy gate:
 * - Minimum pass rate: 85% (hard block)
 * - World-class target: 95%+
 */
import { execSync } from 'node:child_process'
import { mkdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadEnvLocal } from './load-env-local.mjs'

loadEnvLocal()

const MIN_PASS_RATE = 0.85
const WORLD_CLASS_PASS_RATE = 0.95

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const config =
  process.argv[2] ?? 'prompts/evaluation/promptfooconfig.yaml'
const outputPath = resolve(root, 'prompts/evaluation/latest-results.json')

mkdirSync(resolve(root, 'prompts/evaluation'), { recursive: true })

console.log(`Running eval gate: ${config}`)
console.log(`Deploy rule: do NOT deploy below ${MIN_PASS_RATE * 100}% pass rate`)
console.log(`World-class target: ${WORLD_CLASS_PASS_RATE * 100}%+\n`)

try {
  execSync(`npx promptfoo eval --config "${config}" --output "${outputPath}"`, {
    cwd: root,
    stdio: 'inherit',
    env: process.env,
  })
} catch {
  console.error('\nPromptfoo eval command failed.')
  process.exit(1)
}

let results
try {
  results = JSON.parse(readFileSync(outputPath, 'utf-8'))
} catch (error) {
  console.error(`Could not read results from ${outputPath}:`, error)
  process.exit(1)
}

const stats = results.results?.stats ?? results.stats ?? {}
const successes = Number(stats.successes ?? 0)
const failures = Number(stats.failures ?? 0)
const errors = Number(stats.errors ?? 0)
const total = successes + failures + errors
const passRate = total > 0 ? successes / total : 0
const passPct = (passRate * 100).toFixed(1)

console.log('\n--- Eval gate summary ---')
console.log(`Pass rate: ${passPct}% (${successes}/${total} tests passed)`)
console.log(`Failures: ${failures} | Errors: ${errors}`)
console.log(`Results file: ${outputPath}`)

if (passRate < MIN_PASS_RATE) {
  console.error(
    `\nDEPLOY BLOCKED: ${passPct}% is below the ${MIN_PASS_RATE * 100}% minimum pass rate.`
  )
  console.error('Fix failing prompts or test cases before deploying.')
  process.exit(1)
}

if (passRate < WORLD_CLASS_PASS_RATE) {
  console.warn(
    `\nDeploy allowed, but ${passPct}% is below the ${WORLD_CLASS_PASS_RATE * 100}% world-class target.`
  )
  process.exit(0)
}

console.log(`\nWorld-class pass rate (${passPct}%). Safe to deploy.`)
process.exit(0)
