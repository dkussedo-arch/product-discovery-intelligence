import {
  cosineSimilarity,
  embedText,
  lexicalScore,
} from '@/lib/rag/embeddings'
import { buildChunkIndex } from '@/lib/rag/store'
import type { Citation, TextChunk } from '@/lib/types'

export interface RetrievedChunk {
  chunk: TextChunk
  score: number
}

export function retrieveRelevantChunks(
  query: string,
  topK = 8
): RetrievedChunk[] {
  const queryEmbedding = embedText(query)
  const chunks = buildChunkIndex()

  if (chunks.length === 0) {
    return []
  }

  const scored = chunks.map((chunk) => {
    const dense = chunk.embedding
      ? cosineSimilarity(queryEmbedding, chunk.embedding)
      : 0
    const sparse = lexicalScore(query, chunk.text)
    const score = dense * 0.65 + sparse * 0.35
    return { chunk, score }
  })

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .filter((item) => item.score > 0.02)
}

export function toCitations(results: RetrievedChunk[]): Citation[] {
  const seen = new Set<string>()
  const citations: Citation[] = []

  for (const { chunk, score } of results) {
    if (seen.has(chunk.artifactId)) {
      continue
    }
    seen.add(chunk.artifactId)

    citations.push({
      id: citations.length + 1,
      artifactId: chunk.artifactId,
      title: chunk.metadata.title,
      source: chunk.metadata.source,
      sourceUrl: chunk.metadata.sourceUrl,
      excerpt: chunk.text.slice(0, 280).trim() + (chunk.text.length > 280 ? '…' : ''),
      retrievalScore: Math.round(score * 100) / 100,
    })
  }

  return citations
}

export function buildContextBlock(results: RetrievedChunk[]): string {
  return results
    .map(({ chunk, score }, index) => {
      return `[Source ${index + 1}] id=${chunk.artifactId} title="${chunk.metadata.title}" source=${chunk.metadata.source} score=${score.toFixed(3)}
${chunk.text}`
    })
    .join('\n\n---\n\n')
}
