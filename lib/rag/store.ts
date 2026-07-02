import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

import sampleCorpus from '@/data/sample-corpus.json'
import { chunkText } from '@/lib/rag/chunking'
import { embedText } from '@/lib/rag/embeddings'
import type { Artifact, TextChunk } from '@/lib/types'

const DATA_DIR = join(process.cwd(), 'data')
const CORPUS_PATH = join(DATA_DIR, 'corpus.json')

function ensureDataDir(): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true })
  }
}

function loadArtifacts(): Artifact[] {
  ensureDataDir()

  if (existsSync(CORPUS_PATH)) {
    return JSON.parse(readFileSync(CORPUS_PATH, 'utf-8')) as Artifact[]
  }

  const seeded = sampleCorpus as Artifact[]
  writeFileSync(CORPUS_PATH, JSON.stringify(seeded, null, 2), 'utf-8')
  return seeded
}

function saveArtifacts(artifacts: Artifact[]): void {
  ensureDataDir()
  writeFileSync(CORPUS_PATH, JSON.stringify(artifacts, null, 2), 'utf-8')
}

export function listArtifacts(): Artifact[] {
  return loadArtifacts()
}

export function addArtifact(artifact: Omit<Artifact, 'id' | 'createdAt'>): Artifact {
  const artifacts = loadArtifacts()
  const record: Artifact = {
    ...artifact,
    id: `art-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  }
  artifacts.push(record)
  saveArtifacts(artifacts)
  return record
}

export function buildChunkIndex(): TextChunk[] {
  const artifacts = loadArtifacts()
  const chunks: TextChunk[] = []

  for (const artifact of artifacts) {
    const artifactChunks = chunkText(artifact.content, artifact.id, {
      title: artifact.title,
      source: artifact.source,
      sourceUrl: artifact.sourceUrl,
      author: artifact.author,
      createdAt: artifact.createdAt,
    })

    for (const chunk of artifactChunks) {
      chunks.push({
        ...chunk,
        embedding: embedText(chunk.text),
      })
    }
  }

  return chunks
}
