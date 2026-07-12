'use client'

import dynamic from 'next/dynamic'

export const FileUploadLazy = dynamic(
  () => import('@/components/FileUpload').then((mod) => mod.FileUpload),
  { ssr: false }
)
