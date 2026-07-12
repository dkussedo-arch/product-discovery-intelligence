#!/usr/bin/env node
import { execSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadEnvLocal } from './load-env-local.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
loadEnvLocal()

const args = process.argv.slice(2)
if (args.length === 0) {
  console.error('Usage: node scripts/run-promptfoo.mjs <promptfoo args...>')
  process.exit(1)
}

execSync(`npx promptfoo ${args.map((a) => `"${a.replace(/"/g, '\\"')}"`).join(' ')}`, {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
})
