'use client'

import Link from 'next/link'
import { ArrowRight, Lightbulb, Database, Zap, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-primary text-lg">PDI</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted hover:text-primary transition">Features</a>
            <a href="#how-it-works" className="text-sm text-muted hover:text-primary transition">How it works</a>
            <Link href="/app" className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-blue-700 transition font-light text-sm">
              Try it free
            </Link>
          </div>

          <button 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border px-4 py-4 space-y-3">
            <a href="#features" className="block text-sm text-muted hover:text-primary transition py-2">Features</a>
            <a href="#how-it-works" className="block text-sm text-muted hover:text-primary transition py-2">How it works</a>
            <Link href="/app" className="block w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-blue-700 transition font-light text-sm text-center">
              Try it free
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 text-center">
        <div className="inline-block px-4 py-2 bg-accent-light border border-accent rounded-full mb-6">
          <span className="text-sm text-accent font-light">AI-native organizational memory for product teams</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-light text-primary mb-6 leading-tight text-balance">
          Stop losing <span className="font-semibold">discovery knowledge</span>
        </h1>

        <p className="text-lg text-muted max-w-2xl mx-auto mb-8 font-light leading-relaxed text-balance">
          Capture, connect, and surface the insights, assumptions, and decisions your team generates continuously. Turn discovery into organizational memory.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/app"
            className="px-8 py-3 bg-accent text-white rounded-lg hover:bg-blue-700 transition font-light text-base flex items-center justify-center gap-2 group"
          >
            Get started free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
          </Link>
          <a 
            href="#how-it-works"
            className="px-8 py-3 border border-border text-primary rounded-lg hover:bg-secondary transition font-light text-base"
          >
            Learn more
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mt-16 max-w-2xl mx-auto">
          <div>
            <div className="text-2xl font-semibold text-accent mb-1">10/10</div>
            <p className="text-xs text-muted font-light">Teams lose insights weekly</p>
          </div>
          <div>
            <div className="text-2xl font-semibold text-accent mb-1">95%</div>
            <p className="text-xs text-muted font-light">Make decisions with insufficient evidence</p>
          </div>
          <div>
            <div className="text-2xl font-semibold text-accent mb-1">70%</div>
            <p className="text-xs text-muted font-light">Find retrieval extremely difficult</p>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="bg-secondary py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-light text-primary mb-6 text-balance">
              You&apos;re doing discovery right. Systems are failing you.
            </h2>
            <p className="text-lg text-muted font-light leading-relaxed mb-6">
              Your team captures insights continuously — in Dovetail, Productboard, Notion, Confluence, Slack. But there&apos;s no system that connects research to decisions, preserves assumptions, or surfaces what you already know when the next question arises.
            </p>
            <p className="text-lg text-muted font-light leading-relaxed">
              The result: duplicate research, forgotten findings, high-stakes decisions made without evidence that exists somewhere — just nowhere accessible.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <h2 className="text-3xl md:text-4xl font-light text-primary mb-12 text-center text-balance">
          How PDI solves the knowledge continuity gap
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white border border-border rounded-xl p-6 hover:border-accent transition hover:shadow-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Database className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-primary mb-3">Knowledge Graph</h3>
            <p className="text-sm text-muted font-light leading-relaxed">
              Automatically extract and connect insights, assumptions, decisions, and experiments. See how each piece of discovery relates to others.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white border border-border rounded-xl p-6 hover:border-accent transition hover:shadow-lg">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-primary mb-3">Proactive Alerts</h3>
            <p className="text-sm text-muted font-light leading-relaxed">
              Surface conflicts, assumption expiries, duplicate experiments, and coverage gaps before they become $400k mistakes.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white border border-border rounded-xl p-6 hover:border-accent transition hover:shadow-lg">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Lightbulb className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-primary mb-3">AI Synthesis</h3>
            <p className="text-sm text-muted font-light leading-relaxed">
              Claude synthesizes your knowledge into evidence-backed answers, shows contradictions, identifies gaps, and suggests next questions.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-secondary py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-light text-primary mb-16 text-center text-balance">
            How it works
          </h2>

          <div className="max-w-3xl mx-auto space-y-8 md:space-y-12">
            {/* Step 1 */}
            <div className="flex gap-6 md:gap-8">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-semibold flex-shrink-0">
                  1
                </div>
                <div className="w-1 h-24 md:h-32 bg-border mt-4" />
              </div>
              <div className="pb-8 md:pb-12">
                <h3 className="text-lg font-semibold text-primary mb-2">Capture discoveries</h3>
                <p className="text-sm text-muted font-light leading-relaxed">
                  Document insights from customer research, assumptions underpinning decisions, roadmap choices, and experiment results. One source of truth for all discovery.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6 md:gap-8">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-semibold flex-shrink-0">
                  2
                </div>
                <div className="w-1 h-24 md:h-32 bg-border mt-4" />
              </div>
              <div className="pb-8 md:pb-12">
                <h3 className="text-lg font-semibold text-primary mb-2">PDI builds your graph</h3>
                <p className="text-sm text-muted font-light leading-relaxed">
                  AI extracts entities and their relationships — which insights support which assumptions, which assumptions inform which decisions. Your knowledge becomes visible and traversable.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6 md:gap-8">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-semibold flex-shrink-0">
                  3
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary mb-2">Alerts prevent mistakes</h3>
                <p className="text-sm text-muted font-light leading-relaxed">
                  PDI continuously monitors your knowledge state. Before you re-research a solved problem, duplicate an experiment, or base a decision on expired assumptions — PDI surfaces what you already know.
                </p>
              </div>
            </div>
          </div>

          {/* Diagram placeholder */}
          <div className="mt-16 md:mt-24 max-w-3xl mx-auto bg-background border border-border rounded-xl p-8 md:p-12">
            <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center border border-border">
              <div className="text-center">
                <Lightbulb className="w-12 h-12 text-muted/30 mx-auto mb-4" />
                <p className="text-sm text-muted font-light">Interactive knowledge graph visualization</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="bg-background border-t border-border py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-light text-primary mb-6 text-balance">
            Stop rediscovering the same problems
          </h2>
          <p className="text-lg text-muted font-light mb-10 text-balance max-w-2xl mx-auto">
            Give your team organizational memory. Make discovery knowledge compound instead of disappear.
          </p>
          <Link 
            href="/app"
            className="inline-flex px-8 py-4 bg-accent text-white rounded-lg hover:bg-blue-700 transition font-light text-base gap-2 group"
          >
            Get started — it&apos;s free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted font-light">
              © 2026 Product Discovery Intelligence. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-muted hover:text-primary transition">Privacy</a>
              <a href="#" className="text-sm text-muted hover:text-primary transition">Terms</a>
              <a href="#" className="text-sm text-muted hover:text-primary transition">Docs</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
