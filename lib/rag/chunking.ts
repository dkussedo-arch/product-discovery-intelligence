const TARGET_CHUNK_TOKENS = 500
const CHARS_PER_TOKEN = 4
const CHUNK_SIZE = TARGET_CHUNK_TOKENS * CHARS_PER_TOKEN
const OVERLAP = 50 * CHARS_PER_TOKEN

import type { ArtifactSource, TextChunk } from '@/lib/types'

export function chunkText(
  text: string,
  artifactId: string,
  metadata: {
    title: string
    source: ArtifactSource
    sourceUrl?: string
    author?: string
    createdAt: string
  }
): TextChunk[] {
  const normalized = text.replace(/\r\n/g, '\n').trim()
  if (!normalized) {
    return []
  }

  const chunks: TextChunk[] = []
  let start = 0
  let index = 0

  while (start < normalized.length) {
    let end = Math.min(start + CHUNK_SIZE, normalized.length)

    if (end < normalized.length) {
      const paragraphBreak = normalized.lastIndexOf('\n\n', end)
      const sentenceBreak = normalized.lastIndexOf('. ', end)
      const breakAt = Math.max(paragraphBreak, sentenceBreak)
      if (breakAt > start + CHUNK_SIZE * 0.4) {
        end = breakAt + 1
      }
    }

    const slice = normalized.slice(start, end).trim()
    if (slice) {
      chunks.push({
        id: `${artifactId}-chunk-${index}`,
        artifactId,
        text: slice,
        metadata: { ...metadata, chunkIndex: index },
      })
      index += 1
    }

    if (end >= normalized.length) {
      break
    }
    start = Math.max(end - OVERLAP, start + 1)
  }

  return chunks
}
