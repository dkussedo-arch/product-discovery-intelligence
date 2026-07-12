import Link from 'next/link'

const AI_STUDIO_APP =
  'https://ai.studio/apps/7613e9c7-1cad-49f0-9a16-86f56fccd45f'

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <header className="border-b border-[var(--color-card-border)] bg-[#0b0f14]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)]">
              ← Home
            </Link>
            <span className="font-medium">AI Studio UI</span>
          </div>
          <a
            href={AI_STUDIO_APP}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-[var(--color-accent)] hover:underline"
          >
            Open in Google AI Studio
          </a>
        </div>
      </header>
      {children}
    </>
  )
}
