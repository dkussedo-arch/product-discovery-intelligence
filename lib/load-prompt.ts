import { readFile } from 'node:fs/promises'
import path from 'node:path'

export async function loadPrompt(name: string): Promise<string> {
  const promptPath = path.join(process.cwd(), 'prompts', `${name}.txt`)
  return readFile(promptPath, 'utf-8')
}
