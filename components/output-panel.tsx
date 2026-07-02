'use client'

import { memo } from 'react'
import { Sparkles, AlertTriangle, AlertCircle, HelpCircle, CheckCircle2, TrendingUp } from 'lucide-react'

interface OutputPanelProps {
  results: any | null
  isAnalyzing: boolean
}

function OutputPanel({ results, isAnalyzing }: OutputPanelProps) {
  const emptyState = !results && !isAnalyzing

  return (
    <div className="h-full flex flex-col bg-white border-l border-border">
      {/* Header */}
      <div className="sticky top-0 border-b border-border px-8 py-6 bg-white z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-light text-primary">AI Synthesis</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
        {emptyState && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 rounded-full bg-accent-light/20 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-light text-primary mb-2">Waiting for analysis</h3>
              <p className="text-sm text-muted font-light">
                PDI will synthesize your discoveries into actionable insights, surface conflicts, and suggest next questions.
              </p>
            </div>
          </div>
        )}

        {isAnalyzing && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-3 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-muted font-light">Claude is synthesizing your knowledge graph...</p>
            </div>
          </div>
        )}

        {!emptyState && !isAnalyzing && results && (
          <>
            {/* Proactive Alerts */}
            {results.alerts?.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-primary">Alerts</h3>
                <div className="space-y-2.5">
                  {results.alerts.map((alert: any) => {
                    const alertConfig = {
                      conflict: {
                        icon: AlertTriangle,
                        bg: 'bg-red-50 border-red-200',
                        text: 'text-red-900',
                        badge: 'bg-red-100 text-red-700',
                      },
                      expiry: {
                        icon: AlertCircle,
                        bg: 'bg-orange-50 border-orange-200',
                        text: 'text-orange-900',
                        badge: 'bg-orange-100 text-orange-700',
                      },
                      duplicate_risk: {
                        icon: AlertCircle,
                        bg: 'bg-yellow-50 border-yellow-200',
                        text: 'text-yellow-900',
                        badge: 'bg-yellow-100 text-yellow-700',
                      },
                      coverage_gap: {
                        icon: HelpCircle,
                        bg: 'bg-blue-50 border-blue-200',
                        text: 'text-blue-900',
                        badge: 'bg-blue-100 text-blue-700',
                      },
                      unconsulted_research: {
                        icon: CheckCircle2,
                        bg: 'bg-green-50 border-green-200',
                        text: 'text-green-900',
                        badge: 'bg-green-100 text-green-700',
                      },
                    }
                    const config = alertConfig[alert.type as keyof typeof alertConfig]
                    const Icon = config.icon

                    return (
                      <div key={alert.id} className={`${config.bg} border rounded-lg p-4`}>
                        <div className="flex items-start gap-3">
                          <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.text}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`font-light text-sm ${config.text}`}>{alert.title}</h4>
                              <span className={`text-xs px-2 py-1 rounded font-light ${config.badge}`}>
                                {alert.severity}
                              </span>
                            </div>
                            <p className={`text-xs font-light leading-relaxed opacity-85 ${config.text}`}>
                              {alert.description}
                            </p>
                            {alert.suggestedAction && (
                              <p className={`text-xs mt-2 font-light italic opacity-75 ${config.text}`}>
                                → {alert.suggestedAction}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Synthesis */}
            {results.synthesis && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  Synthesis
                </h3>
                <div className="bg-accent-light/5 border border-accent-light rounded-lg p-4">
                  <p className="text-sm text-primary font-light leading-relaxed">
                    {results.synthesis}
                  </p>
                </div>
              </div>
            )}

            {/* Key Findings */}
            {results.keyFindings?.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-primary">Key Findings</h3>
                <div className="space-y-2.5">
                  {results.keyFindings.map((finding: string, idx: number) => (
                    <div key={idx} className="bg-secondary rounded-lg p-3.5 border border-border/50">
                      <div className="flex gap-3">
                        <TrendingUp className="w-4 h-4 flex-shrink-0 text-accent mt-0.5" />
                        <p className="text-xs text-primary font-light leading-relaxed">{finding}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gaps */}
            {results.gaps?.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-primary">Evidence Gaps</h3>
                <div className="space-y-2.5">
                  {results.gaps.map((gap: string, idx: number) => (
                    <div key={idx} className="bg-orange-50/30 border border-orange-100 rounded-lg p-3.5">
                      <div className="flex gap-3">
                        <HelpCircle className="w-4 h-4 flex-shrink-0 text-orange-600 mt-0.5" />
                        <p className="text-xs text-orange-900 font-light leading-relaxed">{gap}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Questions */}
            {results.nextQuestions?.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-primary">Next Questions</h3>
                <div className="space-y-2.5">
                  {results.nextQuestions.map((question: string, idx: number) => (
                    <div key={idx} className="bg-blue-50/30 border border-blue-100 rounded-lg p-3.5">
                      <p className="text-xs text-blue-900 font-light leading-relaxed">
                        <span className="font-semibold">?</span> {question}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default memo(OutputPanel)
