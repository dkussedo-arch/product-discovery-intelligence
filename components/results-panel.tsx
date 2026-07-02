'use client'

import { memo } from 'react'
import { Search } from 'lucide-react'

interface ResultsPanelProps {
  results: any | null
  isAnalyzing: boolean
  searchQuery: string
  onSearchChange: (query: string) => void
}

function ResultsPanel({
  results,
  isAnalyzing,
  searchQuery,
  onSearchChange,
}: ResultsPanelProps) {
  const emptyState = !results && !isAnalyzing

  return (
    <div className="h-full flex flex-col p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Analysis Results</h2>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search entities, relationships..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            disabled={emptyState}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {emptyState && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No content analyzed yet</h3>
              <p className="text-gray-600">
                Add content in the left panel to get started with analysis
              </p>
            </div>
          </div>
        )}

        {isAnalyzing && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full border-2 border-gray-200 border-t-purple-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Analyzing your content...</p>
              <p className="text-sm text-gray-500 mt-1">This may take a few moments</p>
            </div>
          </div>
        )}

        {results && (
          <div className="space-y-8">
            {/* Entities Section */}
            {results.entities && results.entities.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Entities Detected</h3>
                <div className="space-y-3">
                  {results.entities
                    .filter((entity: any) =>
                      !searchQuery ||
                      entity.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      entity.type?.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .slice(0, 20)
                    .map((entity: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{entity.name}</p>
                            <p className="text-sm text-gray-500">{entity.type}</p>
                          </div>
                          {entity.confidence && (
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-600">
                                {Math.round(entity.confidence * 100)}%
                              </p>
                            </div>
                          )}
                        </div>
                        {entity.description && (
                          <p className="text-sm text-gray-600 mt-2">{entity.description}</p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Relationships Section */}
            {results.relationships && results.relationships.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Relationships</h3>
                <div className="space-y-3">
                  {results.relationships
                    .filter((rel: any) =>
                      !searchQuery ||
                      rel.source?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      rel.target?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      rel.type?.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .slice(0, 15)
                    .map((relationship: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition"
                      >
                        <p className="text-sm text-gray-600">
                          <span className="font-medium text-gray-900">{relationship.source}</span>
                          <span className="text-gray-400 mx-2">→</span>
                          <span className="font-semibold text-purple-600">{relationship.type}</span>
                          <span className="text-gray-400 mx-2">→</span>
                          <span className="font-medium text-gray-900">{relationship.target}</span>
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Empty state for results */}
            {(!results.entities || results.entities.length === 0) &&
              (!results.relationships || results.relationships.length === 0) && (
                <div className="text-center py-12">
                  <p className="text-gray-600">No entities or relationships found</p>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(ResultsPanel)
