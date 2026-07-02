'use client'

import { memo } from 'react'
import { Search, Lightbulb, Target, CheckSquare, Beaker, ArrowRight } from 'lucide-react'

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

  const entityIcons = {
    insight: Lightbulb,
    assumption: Target,
    decision: CheckSquare,
    experiment: Beaker,
  }

  const entityColors = {
    insight: 'bg-blue-50 border-blue-200 text-blue-900',
    assumption: 'bg-purple-50 border-purple-200 text-purple-900',
    decision: 'bg-green-50 border-green-200 text-green-900',
    experiment: 'bg-orange-50 border-orange-200 text-orange-900',
  }

  const filteredEntities = results?.entities?.filter((e: any) =>
    searchQuery === '' || 
    e.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="sticky top-0 border-b border-border px-8 py-6 bg-white z-10">
        <h2 className="text-lg font-light text-primary mb-4">Knowledge Graph</h2>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search entities..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            disabled={emptyState}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {emptyState && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted" />
              </div>
              <h3 className="text-lg font-light text-primary mb-2">No analysis yet</h3>
              <p className="text-sm text-muted font-light">
                Capture insights, assumptions, decisions, and experiments in the left panel. PDI will build your knowledge graph and surface connections.
              </p>
            </div>
          </div>
        )}

        {isAnalyzing && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-3 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-muted font-light">Analyzing and building knowledge graph...</p>
            </div>
          </div>
        )}

        {!emptyState && !isAnalyzing && results && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Insights', count: results.entities?.filter((e: any) => e.type === 'insight').length || 0 },
                { label: 'Assumptions', count: results.entities?.filter((e: any) => e.type === 'assumption').length || 0 },
                { label: 'Decisions', count: results.entities?.filter((e: any) => e.type === 'decision').length || 0 },
                { label: 'Relationships', count: results.relationships?.length || 0 },
              ].map((stat) => (
                <div key={stat.label} className="bg-secondary rounded-lg p-3 text-center">
                  <div className="text-2xl font-light text-accent">{stat.count}</div>
                  <div className="text-xs text-muted font-light mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Entities */}
            {filteredEntities.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-primary">Extracted Entities ({filteredEntities.length})</h3>
                <div className="space-y-2.5">
                  {filteredEntities.map((entity: any) => {
                    const Icon = entityIcons[entity.type as keyof typeof entityIcons]
                    const colorClass = entityColors[entity.type as keyof typeof entityColors]
                    
                    return (
                      <div key={entity.id} className={`${colorClass} border rounded-lg p-4 hover:shadow-md transition`}>
                        <div className="flex items-start gap-3">
                          <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-light text-sm mb-1">{entity.title}</h4>
                            {entity.description && (
                              <p className="text-xs opacity-80 font-light leading-relaxed">{entity.description}</p>
                            )}
                            {entity.confidence && (
                              <div className="flex gap-1 mt-2">
                                <span className="text-xs px-2 py-1 bg-white/50 rounded font-light">
                                  {(entity.confidence * 100).toFixed(0)}% confidence
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Relationships */}
            {results.relationships?.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-primary">Connections ({results.relationships.length})</h3>
                <div className="space-y-2.5">
                  {results.relationships.slice(0, 5).map((rel: any, idx: number) => (
                    <div key={idx} className="bg-secondary rounded-lg p-3 text-xs font-light flex items-center gap-2">
                      <span className="text-muted truncate">{rel.source}</span>
                      <ArrowRight className="w-4 h-4 flex-shrink-0 text-accent" />
                      <span className="bg-accent/10 text-accent px-2 py-1 rounded font-light">{rel.type}</span>
                      <span className="text-muted truncate">{rel.target}</span>
                    </div>
                  ))}
                  {results.relationships?.length > 5 && (
                    <p className="text-xs text-muted font-light text-center py-2">
                      +{results.relationships.length - 5} more relationships
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(ResultsPanel)
