'use client'

import { useState, memo, useCallback } from 'react'
import { Upload, ChevronDown } from 'lucide-react'

interface InputPanelProps {
  onAnalyze: (content: string) => void
  isAnalyzing: boolean
}

function InputPanel({ onAnalyze, isAnalyzing }: InputPanelProps) {
  const [content, setContent] = useState('')
  const [inputMethod, setInputMethod] = useState<'text' | 'file'>('text')

  const handleAnalyze = useCallback(() => {
    if (content.trim()) {
      onAnalyze(content)
    }
  }, [content, onAnalyze])

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        setContent(text)
      }
      reader.readAsText(file)
    }
  }, [])

  return (
    <div className="p-6 h-full flex flex-col">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Add Content</h2>

      {/* Input Method Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Input Type</label>
        <div className="flex gap-2">
          <button
            onClick={() => setInputMethod('text')}
            className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition ${
              inputMethod === 'text'
                ? 'border-purple-600 bg-purple-50 text-purple-600'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            Text
          </button>
          <button
            onClick={() => setInputMethod('file')}
            className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition ${
              inputMethod === 'file'
                ? 'border-purple-600 bg-purple-50 text-purple-600'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            File
          </button>
        </div>
      </div>

      {/* Text Input */}
      {inputMethod === 'text' && (
        <div className="mb-6 flex-1 flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-2">Paste content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste competitor landing pages, blog posts, feature lists, or any text data..."
            className="flex-1 p-4 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
          />
        </div>
      )}

      {/* File Upload */}
      {inputMethod === 'file' && (
        <div className="mb-6 flex-1 flex flex-col justify-center">
          <label className="block text-sm font-medium text-gray-700 mb-4">Upload file</label>
          <div className="flex-1 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-purple-600 hover:bg-purple-50 transition relative">
            <input
              type="file"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".txt,.md,.csv"
            />
            <div className="text-center pointer-events-none">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Drop files here</p>
              <p className="text-xs text-gray-500">or click to browse</p>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Button */}
      <button
        onClick={handleAnalyze}
        disabled={!content.trim() || isAnalyzing}
        className="w-full px-4 py-3 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
      >
        {isAnalyzing ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Analyzing...
          </>
        ) : (
          'Analyze Content'
        )}
      </button>

      {/* Character Count */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        {content.length} characters
      </div>
    </div>
  )
}

export default memo(InputPanel)
