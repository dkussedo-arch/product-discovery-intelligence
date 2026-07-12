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

export interface ExtractEntitiesRequest {
  text: string
}

export interface AnalyzeRequest {
  text: string
}

export interface DocumentAnalysisResult {
  summary: string
  key_points: string[]
  action_items: string[]
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
  flags: string[]
  error?: string
}

export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  role: ChatRole
  content: string
}

export interface ChatRequest {
  messages: ChatMessage[]
}

export type EvaluationStatus =
  | 'SUPPORTED'
  | 'IMPLIED'
  | 'NOT_FOUND'
  | 'CONTRADICTED'

export interface EvaluatedClaim {
  id: string
  claim: string
  status: EvaluationStatus
  evidence?: string
  rationale?: string
  sources?: string[]
}

export interface EvaluationResult {
  title?: string
  evaluatedAt?: string
  claims: EvaluatedClaim[]
}
