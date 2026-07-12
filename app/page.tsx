import { DiscoveryWorkspace } from '@/components/discovery-workspace'
import { FileUploadLazy } from '@/components/file-upload-lazy'
import { Github, Layers, Link2, Shield } from 'lucide-react'
import Link from 'next/link'

const LINKS = {
  github:
    'https://github.com/dkussedo-arch/Product-Discovery-Intelligence',
  aiStudio:
    'https://ai.studio/apps/7613e9c7-1cad-49f0-9a16-86f56fccd45f',
}

export default function HomePage() {
  return (
    <main>
      <header className="border-b border-[var(--color-card-border)] bg-[#0b0f14]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent-soft)] text-sm font-bold text-[var(--color-accent)]">
              PDI
            </div>
            <span className="font-medium">Product Discovery Intelligence</span>
          </div>
          <nav className="flex items-center gap-4 text-sm text-[var(--color-muted)]">
            <Link
              href="/studio"
              className="hidden hover:text-[var(--color-foreground)] sm:inline"
            >
              AI Studio UI
            </Link>
            <a
              href={LINKS.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:text-[var(--color-foreground)]"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 pt-10">
        <FileUploadLazy />
      </div>

      <DiscoveryWorkspace />

      <section className="mx-auto mt-16 max-w-6xl px-4 pb-16">
        <h2 className="mb-8 text-center text-2xl font-semibold">
          Stop paying the discovery tax
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: Link2,
              title: 'Connect evidence',
              body: 'Link research findings to assumptions and the decisions they informed — across Notion, Dovetail, Productboard, and Slack.',
            },
            {
              icon: Layers,
              title: 'Synthesize with provenance',
              body: 'Ask natural-language questions and get attributed answers with confidence levels and explicit evidence gaps.',
            },
            {
              icon: Shield,
              title: 'AI shows its work',
              body: 'Every claim cites source artifacts. Conflicts are surfaced, not hidden. Humans confirm — AI suggests.',
            },
          ].map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-5"
            >
              <Icon className="mb-3 h-5 w-5 text-[var(--color-accent)]" />
              <h3 className="font-medium">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[var(--color-card-border)] py-8 text-center text-xs text-[var(--color-muted)]">
        <p>
          Repo:{' '}
          <a href={LINKS.github} className="text-[var(--color-accent)] hover:underline">
            dkussedo-arch/Product-Discovery-Intelligence
          </a>
          {' · '}
          Frontend prototype:{' '}
          <a href={LINKS.aiStudio} className="text-[var(--color-accent)] hover:underline">
            Google AI Studio
          </a>
        </p>
      </footer>
    </main>
  )
}
