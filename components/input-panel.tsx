'use client'

import { useState, memo, useCallback } from 'react'
import { AlertCircle, Lightbulb, Target, CheckSquare, Beaker } from 'lucide-react'

interface InputPanelProps {
  onAnalyze: (content: string, entityType: string) => void
  isAnalyzing: boolean
}

function InputPanel({ onAnalyze, isAnalyzing }: InputPanelProps) {
  const [content, setContent] = useState('')
  const [entityType, setEntityType] = useState<'insight' | 'assumption' | 'decision' | 'experiment'>('insight')

  const handleAnalyze = useCallback(() => {
    if (content.trim()) {
      onAnalyze(content, entityType)
      setContent('')
    }
  }, [content, entityType, onAnalyze])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey && !isAnalyzing) {
      handleAnalyze()
    }
  }

  const entityConfig = {
    insight: {
      label: 'Customer Insight',
      description: 'What you learned from research',
      placeholder: 'Share what you discovered from customer interviews, surveys, or user research...',
      icon: Lightbulb,
      color: 'bg-blue-50 border-blue-200 focus-within:ring-blue-500',
    },
    assumption: {
      label: 'Product Assumption',
      description: 'What you believe and why',
      placeholder: 'State your assumption, the evidence behind it, and how you\'ll validate it...',
      icon: Target,
      color: 'bg-purple-50 border-purple-200 focus-within:ring-purple-500',
    },
    decision: {
      label: 'Product Decision',
      description: 'Roadmap choices and rationale',
      placeholder: 'Document what decision was made, why, and what alternatives were considered...',
      icon: CheckSquare,
      color: 'bg-green-50 border-green-200 focus-within:ring-green-500',
    },
    experiment: {
      label: 'Experiment',
      description: 'Tests of your assumptions',
      placeholder: 'Describe your hypothesis, methodology, and results...',
      icon: Beaker,
      color: 'bg-orange-50 border-orange-200 focus-within:ring-orange-500',
    },
  }

  const config = entityConfig[entityType]
  const Icon = config.icon

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="sticky top-0 border-b border-border px-6 py-4 bg-white z-10">
        <h2 className="text-sm font-semibold text-primary mb-4">Capture Discovery</h2>
        
        {/* Entity Type Selector */}
        <div className="space-y-2">
          {(Object.keys(entityConfig) as Array<keyof typeof entityConfig>).map((type) => (
            <label key={type} className="flex items-center gap-3 cursor-pointer p-2.5 rounded-lg hover:bg-secondary transition">
              <input
                type="radio"
                value={type}
                checked={entityType === type}
                onChange={(e) => setEntityType(e.target.value as any)}
                className="w-4 h-4 text-accent"
                disabled={isAnalyzing}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-light text-primary">{entityConfig[type].label}</div>
                <div className="text-xs text-muted">{entityConfig[type].description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col p-6 gap-4 overflow-y-auto">
        {/* Input Box */}
        <div className={`flex-1 flex flex-col ${config.color} border-2 rounded-xl p-4 transition focus-within:ring-2`}>
          <div className="flex items-center gap-2 mb-3">
            <Icon className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">{config.label}</span>
          </div>
          
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={config.placeholder}
            disabled={isAnalyzing}
            className="flex-1 bg-transparent text-primary text-sm resize-none outline-none placeholder-muted/60 font-light"
          />
          
          <div className="text-xs text-muted mt-3 pt-3 border-t border-current/10">
            {content.length} characters · Ctrl+Enter to analyze
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={handleAnalyze}
            disabled={!content.trim() || isAnalyzing}
            className="w-full px-4 py-3 bg-accent text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-light text-sm flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              `Analyze ${config.label}`
            )}
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-accent-light/10 border border-accent-light rounded-lg p-3.5">
          <div className="flex gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-accent mt-0.5" />
            <div className="text-xs text-muted font-light leading-relaxed">
              PDI connects your insights to assumptions, assumptions to decisions, and surfaces conflicts. Every piece strengthens your organizational memory.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(InputPanel)
