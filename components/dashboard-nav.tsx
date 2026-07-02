'use client'

import { memo } from 'react'
import Link from 'next/link'
import { Compass, LogOut } from 'lucide-react'

function DashboardNav() {
  return (
    <nav className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6">
      <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
        <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
          <Compass className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-lg font-semibold text-gray-900">Product Discovery</h1>
      </Link>

      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
          <span className="text-sm font-semibold text-purple-600">U</span>
        </div>
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </nav>
  )
}

export default memo(DashboardNav)
