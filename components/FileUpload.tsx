'use client'

import { useCallback, useRef, useState } from 'react'
import {
  CheckCircle2,
  FileText,
  Loader2,
  Upload,
  XCircle,
} from 'lucide-react'

import { extractTextFromFile, getFileKind } from '@/lib/extract-file-text'
import {
  trackAiGenerationCompleted,
  trackAiGenerationStarted,
  trackFileUploaded,
} from '@/lib/analytics'
import { readAnthropicStream } from '@/lib/parse-anthropic-stream'
import { isSupabaseConfigured, uploadDocument } from '@/lib/supabase'
import type { DocumentAnalysisResult } from '@/lib/types'
import { cn } from '@/lib/utils'

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
const ACCEPTED_EXTENSIONS = '.pdf,.docx,.txt'
const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]

type ProcessingPhase = 'idle' | 'uploading' | 'extracting' | 'analyzing'

const CONFIDENCE_STYLES: Record<DocumentAnalysisResult['confidence'], string> = {
  HIGH: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200',
  MEDIUM: 'border-amber-500/40 bg-amber-500/15 text-amber-200',
  LOW: 'border-orange-500/40 bg-orange-500/15 text-orange-200',
}

function parseDocumentAnalysis(raw: string): DocumentAnalysisResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    const start = raw.indexOf('{')
    const end = raw.lastIndexOf('}')
    if (start === -1 || end === -1) {
      throw new Error('AI response did not contain valid JSON.')
    }
    parsed = JSON.parse(raw.slice(start, end + 1))
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('AI response did not contain valid JSON.')
  }

  const record = parsed as Record<string, unknown>
  if (typeof record.error === 'string') {
    throw new Error(record.error)
  }

  return {
    summary: typeof record.summary === 'string' ? record.summary : '',
    key_points: Array.isArray(record.key_points)
      ? record.key_points.filter((item): item is string => typeof item === 'string')
      : [],
    action_items: Array.isArray(record.action_items)
      ? record.action_items.filter((item): item is string => typeof item === 'string')
      : [],
    confidence:
      record.confidence === 'HIGH' ||
      record.confidence === 'MEDIUM' ||
      record.confidence === 'LOW'
        ? record.confidence
        : 'LOW',
    flags: Array.isArray(record.flags)
      ? record.flags.filter((item): item is string => typeof item === 'string')
      : [],
  }
}

function AnalysisResultPanel({ result }: { result: DocumentAnalysisResult }) {
  return (
    <div className="mt-6 space-y-4 rounded-xl border border-[var(--color-card-border)] bg-[#0d1219] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-[var(--color-accent)]">Analysis result</h3>
        <span
          className={cn(
            'rounded-full border px-2.5 py-0.5 text-xs font-medium',
            CONFIDENCE_STYLES[result.confidence]
          )}
        >
          {result.confidence} confidence
        </span>
      </div>

      {result.summary && (
        <p className="text-sm leading-relaxed text-[var(--color-muted)]">{result.summary}</p>
      )}

      {result.key_points.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
            Key points
          </h4>
          <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
            {result.key_points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
      )}

      {result.action_items.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
            Action items
          </h4>
          <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
            {result.action_items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {result.flags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {result.flags.map((flag) => (
            <span
              key={flag}
              className="rounded-lg border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 text-xs text-orange-200"
            >
              {flag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File is too large (${formatFileSize(file.size)}). Maximum size is 10 MB.`
  }

  const kind = getFileKind(file)
  if (!kind) {
    return 'Invalid file type. Please upload a PDF, DOCX, or TXT file.'
  }

  return null
}

export function FileUpload() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<ProcessingPhase>('idle')
  const [error, setError] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<DocumentAnalysisResult | null>(null)

  const isProcessing = phase !== 'idle'

  const resetState = useCallback(() => {
    setError(null)
    setAnalysis(null)
    setProgress(0)
    setUploadedFilename(null)
  }, [])

  const processFile = useCallback(
    async (file: File) => {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        setSelectedFile(null)
        setUploadedFilename(null)
        return
      }

      resetState()
      setSelectedFile(file)

      const fileKind = getFileKind(file)
      if (fileKind) {
        trackFileUploaded(file.size / 1024, fileKind)
      }

      setPhase('uploading')
      setProgress(5)

      let analyzeStartedAt: number | null = null

      try {
        if (isSupabaseConfigured()) {
          await uploadDocument(file, (pct) => {
            setProgress(Math.min(pct, 30))
          })
        } else {
          setProgress(30)
        }

        setUploadedFilename(file.name)
        setPhase('extracting')

        const text = await extractTextFromFile(file, (extractPct) => {
          setProgress(30 + Math.round(extractPct * 0.35))
        })

        setPhase('analyzing')
        setProgress(70)

        trackAiGenerationStarted('document_analysis')
        analyzeStartedAt = performance.now()

        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        })

        const result = await readAnthropicStream(response, () => {
          setProgress((current) => Math.min(current + 1, 95))
        })

        trackAiGenerationCompleted(
          'document_analysis',
          performance.now() - analyzeStartedAt,
          true
        )

        setAnalysis(parseDocumentAnalysis(result))
        setProgress(100)
      } catch (err) {
        if (analyzeStartedAt !== null) {
          trackAiGenerationCompleted(
            'document_analysis',
            performance.now() - analyzeStartedAt,
            false
          )
        }
        setError(err instanceof Error ? err.message : 'Failed to process file.')
        setUploadedFilename(null)
      } finally {
        setPhase('idle')
      }
    },
    [resetState]
  )

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0]
      if (!file || isProcessing) {
        return
      }
      void processFile(file)
    },
    [isProcessing, processFile]
  )

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (!isProcessing) {
      setIsDragging(true)
    }
  }

  const onDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
  }

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    if (isProcessing) {
      return
    }
    handleFiles(event.dataTransfer.files)
  }

  const phaseLabel: Record<ProcessingPhase, string> = {
    idle: '',
    uploading: 'Uploading file…',
    extracting: 'Extracting text…',
    analyzing: 'Analyzing with AI…',
  }

  return (
    <section className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-6 shadow-xl shadow-black/20">
      <div className="mb-5">
        <h2 className="text-lg font-medium">Analyze a discovery document</h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Upload a PDF, DOCX, or TXT file (max 10 MB). Text is extracted locally,
          then sent to Claude for analysis.
        </p>
      </div>

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            if (!isProcessing) {
              inputRef.current?.click()
            }
          }
        }}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => {
          if (!isProcessing) {
            inputRef.current?.click()
          }
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition',
          isDragging
            ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]/40'
            : 'border-[var(--color-card-border)] bg-[#0d1219] hover:border-[var(--color-accent)]/60',
          isProcessing && 'pointer-events-none opacity-60'
        )}
      >
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent-soft)]">
          <Upload className="h-6 w-6 text-[var(--color-accent)]" />
        </div>
        <p className="font-medium">
          Drag and drop your file here, or click to browse
        </p>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          PDF, DOCX, or TXT · up to 10 MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          className="hidden"
          disabled={isProcessing}
          onChange={(event) => {
            handleFiles(event.target.files)
            event.target.value = ''
          }}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={isProcessing}
          onClick={() => inputRef.current?.click()}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing…
            </>
          ) : (
            <>
              <FileText className="h-4 w-4" />
              Choose file & analyze
            </>
          )}
        </button>

        {selectedFile && !error && (
          <span className="text-sm text-[var(--color-muted)]">
            Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
          </span>
        )}
      </div>

      {uploadedFilename && !error && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>
            Uploaded <span className="font-medium">{uploadedFilename}</span>
          </span>
        </div>
      )}

      {isProcessing && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-[var(--color-muted)]">
              <Loader2 className="h-4 w-4 animate-spin text-[var(--color-accent)]" />
              {phaseLabel[phase]}
            </span>
            <span className="text-[var(--color-muted)]">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#0d1219]">
            <div
              className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
        >
          <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {analysis && <AnalysisResultPanel result={analysis} />}

      <p className="mt-4 text-xs text-[var(--color-muted)]">
        Accepted types:{' '}
        {ACCEPTED_MIME_TYPES.map((type) => type.split('/').pop()).join(', ')}
      </p>
    </section>
  )
}
