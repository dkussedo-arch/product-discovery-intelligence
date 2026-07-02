import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-lg font-light text-primary">Product Discovery</div>
          <Link
            href="/app"
            className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-blue-700 transition font-light"
          >
            Try it free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl sm:text-7xl font-light text-primary mb-8 leading-tight">
            Discover what your competitors don&apos;t
          </h1>
          <p className="text-lg text-muted mb-12 font-light leading-relaxed max-w-2xl mx-auto">
            Transform raw market data into actionable insights with AI-powered analysis. Uncover hidden patterns, identify opportunities, and stay ahead of the market.
          </p>
          <div className="flex gap-4 justify-center flex-col sm:flex-row">
            <Link
              href="/app"
              className="px-8 py-3 bg-accent text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 font-light"
            >
              Try it free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button className="px-8 py-3 border border-border text-primary rounded-lg hover:bg-secondary transition font-light">
              Watch demo
            </button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-secondary">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-light text-primary mb-4 text-center">
            How it works
          </h2>
          <p className="text-lg text-muted text-center mb-16 font-light">
            Three simple steps to competitive intelligence
          </p>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center mx-auto mb-6 text-lg font-light">
                1
              </div>
              <h3 className="text-xl font-light text-primary mb-3">Paste Content</h3>
              <p className="text-muted font-light">
                Share competitor information, landing pages, or market data
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center mx-auto mb-6 text-lg font-light">
                2
              </div>
              <h3 className="text-xl font-light text-primary mb-3">AI Analysis</h3>
              <p className="text-muted font-light">
                Extract entities and relationships with advanced AI in seconds
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center mx-auto mb-6 text-lg font-light">
                3
              </div>
              <h3 className="text-xl font-light text-primary mb-3">Get Insights</h3>
              <p className="text-muted font-light">
                Receive strategic recommendations and market positioning analysis
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-light text-primary mb-4 text-center">
            Trusted by product leaders
          </h2>
          <p className="text-lg text-muted text-center mb-16 font-light">
            See why teams use Product Discovery to make smarter decisions
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="p-8 border border-border rounded-2xl hover:shadow-lg transition">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
              <p className="text-muted font-light mb-6 italic">
                &quot;This tool has completely changed how we approach competitive analysis. What used to take days now takes minutes.&quot;
              </p>
              <div>
                <p className="font-light text-primary">Sarah Chen</p>
                <p className="text-sm text-muted font-light">VP Product, TechCorp</p>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="p-8 border border-border rounded-2xl hover:shadow-lg transition">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
              <p className="text-muted font-light mb-6 italic">
                &quot;The AI insights are incredibly accurate. We&apos;ve identified three major market gaps we never would have seen manually.&quot;
              </p>
              <div>
                <p className="font-light text-primary">Marcus Rodriguez</p>
                <p className="text-sm text-muted font-light">Product Manager, StartupXYZ</p>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="p-8 border border-border rounded-2xl hover:shadow-lg transition">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
              <p className="text-muted font-light mb-6 italic">
                &quot;The relationship mapping feature gives us insights that no other tool provides. It&apos;s invaluable for strategy.&quot;
              </p>
              <div>
                <p className="font-light text-primary">Jessica Park</p>
                <p className="text-sm text-muted font-light">Head of Strategy, InnovateLabs</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-secondary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-light text-primary mb-6">
            Ready to discover more?
          </h2>
          <p className="text-lg text-muted font-light mb-8">
            Get started with Product Discovery Intelligence today
          </p>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 px-8 py-3 bg-accent text-white rounded-lg hover:bg-blue-700 transition font-light"
          >
            Get started free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted font-light">
          <p>&copy; 2025 Product Discovery Intelligence. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
