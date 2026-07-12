import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const envCandidates = ['.env.local', '.env', '.env.development.local'].map((name) =>
  resolve(root, name)
)

export function loadEnvLocal() {
  const envPath = envCandidates.find((candidate) => existsSync(candidate))
  if (!envPath) {
    console.warn(
      `No env file found. Create ${envCandidates.map((p) => p.replace(root + '\\', '')).join(' or ')} with ANTHROPIC_API_KEY.`
    )
    return
  }

  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}
