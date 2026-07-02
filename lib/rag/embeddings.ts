export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2)
}

export function embedText(text: string): number[] {
  const tokens = tokenize(text)
  const vector = new Array(256).fill(0)

  for (const token of tokens) {
    let hash = 0
    for (let i = 0; i < token.length; i += 1) {
      hash = (hash * 31 + token.charCodeAt(i)) >>> 0
    }
    const index = hash % 256
    vector[index] += 1
  }

  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0))
  if (magnitude === 0) {
    return vector
  }

  return vector.map((value) => value / magnitude)
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i]
  }
  return dot
}

export function lexicalScore(query: string, text: string): number {
  const queryTokens = new Set(tokenize(query))
  if (queryTokens.size === 0) {
    return 0
  }

  const textTokens = tokenize(text)
  let hits = 0
  for (const token of textTokens) {
    if (queryTokens.has(token)) {
      hits += 1
    }
  }

  return hits / (textTokens.length + queryTokens.size)
}
