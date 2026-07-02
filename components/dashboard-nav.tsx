'use client'

import { memo } from 'react'
import Link from 'next/link'
import { Lightbulb, LogOut } from 'lucide-react'

function DashboardNav() {
  return (
    <nav className="h-16 border-b border-border bg-white flex items-center justify-between px-6">
      <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-lg font-light text-primary">Product Discovery Intelligence</h1>
      </Link>

      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center">
          <span className="text-sm font-semibold text-accent">U</span>
        </div>
        <button className="p-2 text-muted hover:bg-secondary rounded-lg transition">
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </nav>
  )
}

export default memo(DashboardNav)
