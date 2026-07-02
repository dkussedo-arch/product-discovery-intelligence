export type ArtifactSource =
  | 'notion'
  | 'dovetail'
  | 'productboard'
  | 'slack'
  | 'confluence'
  | 'manual'

export interface Artifact {
  id: string
  title: string
  source: ArtifactSource
  sourceUrl?: string
  author?: string
  createdAt: string
  content: string
  tags?: string[]
}

export interface TextChunk {
  id: string
  artifactId: string
  text: string
  embedding?: number[]
  metadata: {
    title: string
    source: ArtifactSource
    sourceUrl?: string
    author?: string
    createdAt: string
    chunkIndex: number
  }
}

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'coverage_gap'

export interface Citation {
  id: number
  artifactId: string
  title: string
  source: ArtifactSource
  sourceUrl?: string
  excerpt: string
  retrievalScore: number
}

export interface SynthesisClaim {
  text: string
  confidence: ConfidenceLevel
  confidenceRationale: string
  citationIds: number[]
}

export interface SynthesisResult {
  query: string
  overview: string
  claims: SynthesisClaim[]
  conflicts?: string[]
  evidenceGaps?: string[]
  nextQuestions: string[]
  citations: Citation[]
  coverageState: 'sufficient' | 'limited' | 'gap'
}

export interface IngestRequest {
  title: string
  content: string
  source?: ArtifactSource
  sourceUrl?: string
  author?: string
  tags?: string[]
}
