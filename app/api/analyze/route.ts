import { z } from 'zod'

// PDI-specific schemas for discovery entities
const DiscoveryEntitySchema = z.object({
  id: z.string(),
  type: z.enum(['insight', 'assumption', 'decision', 'experiment', 'problem']),
  title: z.string(),
  description: z.string(),
  confidence: z.number().min(0).max(1),
  tags: z.array(z.string()).optional(),
})

const RelationshipSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  type: z.enum(['evidence_for', 'evidence_against', 'informs', 'tests', 'updates', 'conflicts_with', 'addresses']),
  confidence: z.number().min(0).max(1),
  description: z.string().optional(),
})

const AlertSchema = z.object({
  id: z.string(),
  type: z.enum(['conflict', 'expiry', 'duplicate_risk', 'coverage_gap', 'unconsulted_research']),
  severity: z.enum(['high', 'medium', 'low']),
  title: z.string(),
  description: z.string(),
  affectedEntities: z.array(z.string()),
  suggestedAction: z.string().optional(),
})

function generateMockPDIAnalysis(content: string, entityType: string) {
  const entities = [
    {
      id: 'ent-001',
      type: entityType,
      title: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} from Analysis`,
      description: `Key finding extracted from your discovery content: "${content.substring(0, 100)}..."`,
      confidence: 0.92,
      tags: ['primary', 'research'],
    },
    {
      id: 'ent-002',
      type: entityType === 'insight' ? 'assumption' : 'decision',
      title: `Related ${entityType === 'insight' ? 'Assumption' : 'Decision'}`,
      description: 'This entity is connected to your primary discovery through semantic relationships.',
      confidence: 0.85,
      tags: ['secondary'],
    },
    {
      id: 'ent-003',
      type: entityType === 'insight' ? 'decision' : 'insight',
      title: `Supporting ${entityType === 'insight' ? 'Decision' : 'Insight'}`,
      description: 'Provides additional context and validation for your discovery.',
      confidence: 0.78,
      tags: ['supporting'],
    },
  ]

  const relationships = [
    {
      id: 'rel-001',
      source: 'ent-001',
      target: 'ent-002',
      type: 'evidence_for',
      confidence: 0.89,
      description: 'Primary evidence supporting this relationship',
    },
    {
      id: 'rel-002',
      source: 'ent-002',
      target: 'ent-003',
      type: 'informs',
      confidence: 0.92,
      description: 'This assumption informed the decision',
    },
    {
      id: 'rel-003',
      source: 'ent-001',
      target: 'ent-003',
      type: 'evidence_against',
      confidence: 0.35,
      description: 'Some conflicting evidence exists',
    },
  ]

  const alerts = []

  if (Math.random() > 0.5) {
    alerts.push({
      id: 'alert-001',
      type: 'coverage_gap',
      severity: 'medium',
      title: 'Evidence Gap Detected',
      description: 'Your assumptions may lack sufficient supporting evidence. Consider additional research.',
      affectedEntities: ['ent-002'],
      suggestedAction: 'Conduct 5-10 customer interviews to validate this assumption',
    })
  }

  if (Math.random() > 0.6) {
    alerts.push({
      id: 'alert-002',
      type: 'unconsulted_research',
      severity: 'high',
      title: 'Related Prior Research Found',
      description: 'You have existing research that may be directly relevant to this discovery.',
      affectedEntities: ['ent-001'],
      suggestedAction: 'Review previous research on this topic before proceeding',
    })
  }

  const synthesis = `Based on your ${entityType} entry, we've extracted key entities and mapped their relationships. Your discovery demonstrates understanding of the problem space. The evidence confidence levels suggest this is well-researched. We identified ${entities.length} connected entities and ${relationships.length} relationships that show how your insights, assumptions, and decisions interconnect. This knowledge will compound over time as you capture more discoveries.`

  const keyFindings = [
    `${entities.length} entities extracted showing interconnected knowledge`,
    'Strong semantic relationships identified between discovery artifacts',
    'Evidence confidence levels average 85% - indicating solid research foundation',
    'Your organization is building organizational memory with each entry',
  ]

  const gaps = [
    'Limited quantitative data to support the insights',
    'Geographic or demographic distribution not specified',
    'Timeline and recency of supporting research unclear',
  ]

  const nextQuestions = [
    'How will this learning impact your product roadmap?',
    'What additional evidence would strengthen or challenge this finding?',
    'Which team members should review and validate this discovery?',
    'How does this connect to other initiatives or decisions?',
  ]

  return {
    entities,
    relationships,
    synthesis,
    keyFindings,
    gaps,
    nextQuestions,
    alerts,
  }
}

export async function POST(request: Request) {
  try {
    const { content, entityType } = await request.json()

    if (!content || !entityType || content.trim().length === 0) {
      return Response.json(
        { error: 'Content and entityType are required' },
        { status: 400 }
      )
    }

    // Use mock analysis for demo purposes
    // In production, this would call Claude API to extract entities, relationships, and generate synthesis
    console.log('[v0] Generating PDI analysis for:', entityType)
    
    const mockResult = generateMockPDIAnalysis(content, entityType)

    const analysisResult = {
      ...mockResult,
    }

    return Response.json(analysisResult)
  } catch (error) {
    console.error('Analysis error:', error)
    return Response.json(
      { error: 'Failed to analyze content', details: String(error) },
      { status: 500 }
    )
  }
}
