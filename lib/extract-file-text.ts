import mammoth from 'mammoth'

function textFromPdfItem(item: unknown): string {
  if (
    typeof item === 'object' &&
    item !== null &&
    'str' in item &&
    typeof (item as { str: unknown }).str === 'string'
  ) {
    return (item as { str: string }).str
  }
  return ''
}

async function extractPdfText(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist')

  GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString()

  const buffer = await file.arrayBuffer()
  const pdf = await getDocument({ data: buffer }).promise
  const pages: string[] = []

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const content = await page.getTextContent()
    const pageText = content.items
      .map((item) => textFromPdfItem(item))
      .join(' ')
      .trim()

    if (pageText) {
      pages.push(pageText)
    }

    onProgress?.(Math.round((pageNum / pdf.numPages) * 100))
  }

  return pages.join('\n\n')
}

async function extractDocxText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer: buffer })
  return result.value.trim()
}

async function extractTxtText(file: File): Promise<string> {
  return (await file.text()).trim()
}

export type SupportedFileKind = 'pdf' | 'docx' | 'txt'

export function getFileKind(file: File): SupportedFileKind | null {
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()

  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    return 'pdf'
  }

  if (
    type ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    name.endsWith('.docx')
  ) {
    return 'docx'
  }

  if (type === 'text/plain' || name.endsWith('.txt')) {
    return 'txt'
  }

  return null
}

export async function extractTextFromFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  const kind = getFileKind(file)

  if (!kind) {
    throw new Error('Unsupported file type.')
  }

  let text: string

  switch (kind) {
    case 'pdf':
      text = await extractPdfText(file, onProgress)
      break
    case 'docx':
      onProgress?.(50)
      text = await extractDocxText(file)
      onProgress?.(100)
      break
    case 'txt':
      onProgress?.(50)
      text = await extractTxtText(file)
      onProgress?.(100)
      break
  }

  if (!text.trim()) {
    throw new Error('No readable text was found in this file.')
  }

  return text
}
