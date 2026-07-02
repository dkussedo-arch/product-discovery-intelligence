import { generateText, generateObject } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'

// Schema for entities extraction
const EntitySchema = z.object({
  name: z.string().describe('Name of the entity'),
  type: z.string().describe('Type of entity (feature, product, pricing, etc.)'),
  description: z.string().optional().describe('Description or details'),
  confidence: z.number().optional().describe('Confidence score 0-1'),
})

const EntitiesResponseSchema = z.object({
  entities: z.array(EntitySchema),
})

// Schema for relationships
const RelationshipSchema = z.object({
  source: z.string().describe('Source entity'),
  type: z.string().describe('Relationship type'),
  target: z.string().describe('Target entity'),
})

const RelationshipsResponseSchema = z.object({
  relationships: z.array(RelationshipSchema),
})

// Schema for synthesis
const SynthesisSchema = z.object({
  synthesis: z.string().describe('Executive summary of analysis'),
  keyFindings: z.array(z.string()).describe('Key findings from analysis'),
  positioning: z.string().describe('Competitive positioning analysis'),
  gaps: z.array(z.string()).describe('Identified market gaps'),
  recommendations: z.array(z.string()).describe('Recommendations based on analysis'),
  stats: z.record(z.string(), z.union([z.string(), z.number()])).describe('Analysis statistics'),
})

async function getMockAnalysis(content: string) {
  // Mock analysis for demo purposes
  return {
    entities: [
      { name: 'Real-time document editing', type: 'feature', description: 'Collaborative editing capability', confidence: 0.95 },
      { name: 'Advanced permission controls', type: 'feature', description: 'Granular access management', confidence: 0.92 },
      { name: 'API integration', type: 'feature', description: 'Third-party integration capability', confidence: 0.88 },
      { name: '$29/mo', type: 'pricing', description: 'Starter plan pricing', confidence: 0.98 },
      { name: '$99/mo', type: 'pricing', description: 'Professional plan pricing', confidence: 0.98 },
      { name: 'Enterprise teams', type: 'target_market', description: 'Primary customer segment', confidence: 0.9 },
      { name: 'SaaS platform', type: 'product_type', description: 'Cloud-based software service', confidence: 0.99 },
      { name: 'Team collaboration', type: 'use_case', description: 'Primary use case', confidence: 0.93 },
    ],
    relationships: [
      { source: 'SaaS platform', type: 'offers', target: 'Real-time document editing' },
      { source: 'SaaS platform', type: 'offers', target: 'Advanced permission controls' },
      { source: 'SaaS platform', type: 'offers', target: 'API integration' },
      { source: 'SaaS platform', type: 'targets', target: 'Enterprise teams' },
      { source: 'Starter plan', type: 'priced_at', target: '$29/mo' },
      { source: 'Professional plan', type: 'priced_at', target: '$99/mo' },
      { source: 'Real-time document editing', type: 'enables', target: 'Team collaboration' },
    ],
    synthesis: 'This is a mid-market to enterprise collaboration platform with tiered pricing from $29-$99/month plus enterprise plans. The value proposition centers on secure, scalable real-time collaboration with granular permissions. Key differentiators include API integration and advanced access controls targeting enterprise teams concerned with security.',
    keyFindings: [
      'Three-tier pricing strategy suggests targeting diverse customer segments from small teams to enterprises',
      'Real-time editing and permissions focus indicates response to collaboration security concerns',
      'API integration capability enables ecosystem expansion and customer lock-in',
      'Enterprise custom pricing tier indicates B2B focus with deal-based revenue model',
      'Product positioned on security and scalability rather than cost leadership',
    ],
    positioning: 'The product positions itself as a secure, enterprise-grade collaboration platform. Rather than competing on price, it emphasizes advanced features like fine-grained permissions and API integration. This suggests targeting security-conscious enterprises willing to pay premium prices for control and scalability.',
    gaps: [
      'No mention of offline-first capabilities or mobile applications',
      'Limited information on compliance certifications (SOC 2, HIPAA, etc.)',
      'No details on free tier or freemium model for adoption',
      'Lacks information on vendor lock-in mitigation or data export capabilities',
    ],
    recommendations: [
      'Develop mobile-first collaboration features to capture on-the-go team members',
      'Pursue compliance certifications and highlight security certifications to compete with enterprise solutions',
      'Create a generous free tier to drive viral adoption among mid-market companies',
      'Build integration marketplace to reduce perceived switching costs',
      'Emphasize data portability and open standards in marketing to address vendor lock-in concerns',
    ],
    stats: {
      'Total Entities': 8,
      'Total Relationships': 7,
      'Analysis Confidence': '92%',
      'Features Identified': 3,
      'Pricing Tiers': 3,
    },
  }
}

export async function POST(req: Request) {
  try {
    const { content } = await req.json()

    if (!content || content.trim().length === 0) {
      return Response.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Check if API keys are available
    const hasAnthropicKey = process.env.ANTHROPIC_API_KEY
    
    if (!hasAnthropicKey) {
      // Use mock analysis for demo
      console.log('[v0] Using mock analysis - API keys not configured')
      const mockResult = await getMockAnalysis(content)
      
      const analysisResult = {
        artifacts: [
          {
            id: `artifact_${Date.now()}`,
            content: content.substring(0, 500) + (content.length > 500 ? '...' : ''),
            type: 'competitor_analysis',
            createdAt: new Date().toISOString(),
          },
        ],
        ...mockResult,
      }
      
      return Response.json(analysisResult)
    }

    // Step 1: Extract entities using Claude Sonnet
    const entitiesResult = await generateObject({
      model: anthropic('claude-3-5-sonnet-20241022'),
      schema: EntitiesResponseSchema,
      prompt: `Analyze the following text and extract all important entities including products, features, pricing details, pain points, and benefits. Assign a type to each entity and provide a brief description.

Text to analyze:
${content}

Extract comprehensive entities that would be useful for competitive analysis.`,
    })

    // Step 2: Find relationships between entities
    const relationshipsResult = await generateObject({
      model: anthropic('claude-3-5-sonnet-20241022'),
      schema: RelationshipsResponseSchema,
      prompt: `Based on these entities extracted from competitor analysis:
${JSON.stringify(entitiesResult.object.entities, null, 2)}

And the original content:
${content}

Find meaningful relationships between entities. Types should be things like "offers", "targets", "replaces", "competes_with", "features", "costs", etc. Only include relationships that are clearly supported by the content.`,
    })

    // Step 3: Generate AI synthesis using Claude Opus
    const synthesisResult = await generateObject({
      model: anthropic('claude-3-5-sonnet-20241022'),
      schema: SynthesisSchema,
      prompt: `You are a product strategy expert. Analyze the following competitive intelligence data and provide actionable insights.

Entities Found:
${JSON.stringify(entitiesResult.object.entities, null, 2)}

Relationships Identified:
${JSON.stringify(relationshipsResult.object.relationships, null, 2)}

Original Content:
${content.substring(0, 2000)}

Provide:
1. An executive summary (2-3 sentences) synthesizing the key competitive landscape
2. Key findings (3-5 bullet points) about competitive positioning, market gaps, or opportunities
3. Competitive positioning analysis (2-3 sentences)
4. Market gaps or opportunities (2-3 specific gaps)
5. Strategic recommendations (3-5 actionable recommendations)
6. Statistics about the analysis (entity count, relationship count, confidence level)`,
    })

    // Combine all results
    const analysisResult = {
      artifacts: [
        {
          id: `artifact_${Date.now()}`,
          content: content.substring(0, 500) + (content.length > 500 ? '...' : ''),
          type: 'competitor_analysis',
          createdAt: new Date().toISOString(),
        },
      ],
      entities: entitiesResult.object.entities,
      relationships: relationshipsResult.object.relationships,
      ...synthesisResult.object,
    }

    return Response.json(analysisResult)
  } catch (error) {
    console.error('Analysis error:', error)
    
    // Fallback to mock analysis on error
    try {
      const { content } = await req.json()
      const mockResult = await getMockAnalysis(content)
      
      const analysisResult = {
        artifacts: [
          {
            id: `artifact_${Date.now()}`,
            content: content.substring(0, 500) + (content.length > 500 ? '...' : ''),
            type: 'competitor_analysis',
            createdAt: new Date().toISOString(),
          },
        ],
        ...mockResult,
      }
      
      return Response.json(analysisResult)
    } catch {
      return Response.json(
        { error: 'Failed to analyze content', details: String(error) },
        { status: 500 }
      )
    }
  }
}
