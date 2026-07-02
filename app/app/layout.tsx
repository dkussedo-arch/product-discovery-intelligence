'use client'

import { ReactNode } from 'react'
import DashboardNav from '@/components/dashboard-nav'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen flex flex-col bg-white">
      <DashboardNav />
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  )
}
