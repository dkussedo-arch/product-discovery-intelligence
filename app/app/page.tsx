'use client'

import { useState, useCallback } from 'react'
import InputPanel from '@/components/input-panel'
import ResultsPanel from '@/components/results-panel'
import OutputPanel from '@/components/output-panel'

interface AnalysisResult {
  artifacts: any[]
  entities: any[]
  relationships: any[]
  synthesis: string
}

export default function Dashboard() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<AnalysisResult | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const handleAnalyze = useCallback(async (content: string) => {
    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }, [])

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left Panel - Input */}
      <div className="w-80 border-r border-gray-200 flex flex-col overflow-y-auto bg-white">
        <InputPanel onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
      </div>

      {/* Center Panel - Results */}
      <div className="flex-1 border-r border-gray-200 overflow-y-auto bg-white">
        <ResultsPanel 
          results={results} 
          isAnalyzing={isAnalyzing}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* Right Panel - Output */}
      <div className="w-96 flex flex-col overflow-y-auto bg-gray-50 border-l border-gray-200">
        <OutputPanel results={results} isAnalyzing={isAnalyzing} />
      </div>
    </div>
  )
}
