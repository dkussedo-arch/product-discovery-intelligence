'use client'

import { memo } from 'react'
import { Sparkles } from 'lucide-react'

interface OutputPanelProps {
  results: any | null
  isAnalyzing: boolean
}

function OutputPanel({ results, isAnalyzing }: OutputPanelProps) {
  const emptyState = !results && !isAnalyzing

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50">
      {/* Header */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">AI Insights</h2>
        </div>
        <p className="text-sm text-gray-600">
          Synthesized analysis and recommendations
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {emptyState && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 font-medium">No analysis yet</p>
              <p className="text-xs text-gray-500 mt-1">
                Analyze content to see AI insights
              </p>
            </div>
          </div>
        )}

        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-10 h-10 rounded-full border-2 border-gray-200 border-t-purple-600 animate-spin mb-4" />
            <p className="text-sm text-gray-700 font-medium">Synthesizing insights...</p>
            <div className="mt-4 space-y-2 w-full">
              <div className="h-3 bg-white rounded animate-pulse" />
              <div className="h-3 bg-white rounded animate-pulse w-5/6" />
              <div className="h-3 bg-white rounded animate-pulse w-4/6" />
            </div>
          </div>
        )}

        {results && (
          <div className="space-y-6">
            {/* Summary Section */}
            {results.synthesis && (
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-600" />
                  Executive Summary
                </h3>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {results.synthesis}
                </p>
              </div>
            )}

            {/* Key Findings */}
            {results.keyFindings && results.keyFindings.length > 0 && (
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-600" />
                  Key Findings
                </h3>
                <ul className="space-y-3">
                  {results.keyFindings.map((finding: string, idx: number) => (
                    <li key={idx} className="flex gap-3 text-sm text-gray-700">
                      <span className="text-purple-600 font-bold mt-0.5">•</span>
                      <span>{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Competitive Positioning */}
            {results.positioning && (
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-600" />
                  Competitive Positioning
                </h3>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {results.positioning}
                </p>
              </div>
            )}

            {/* Market Gaps */}
            {results.gaps && results.gaps.length > 0 && (
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-600" />
                  Market Gaps Identified
                </h3>
                <ul className="space-y-2">
                  {results.gaps.map((gap: string, idx: number) => (
                    <li
                      key={idx}
                      className="text-sm text-gray-700 p-3 bg-amber-50 rounded border border-amber-200"
                    >
                      {gap}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {results.recommendations && results.recommendations.length > 0 && (
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-600" />
                  Recommendations
                </h3>
                <ol className="space-y-3">
                  {results.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="flex gap-3 text-sm text-gray-700">
                      <span className="font-bold text-purple-600 min-w-max">{idx + 1}.</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Stats */}
            {results.stats && (
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-600" />
                  Analysis Stats
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(results.stats).map(([key, value]: [string, any]) => (
                    <div key={key} className="p-3 bg-gray-50 rounded">
                      <p className="text-xs text-gray-600 capitalize">{key}</p>
                      <p className="text-lg font-bold text-gray-900">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(OutputPanel)
