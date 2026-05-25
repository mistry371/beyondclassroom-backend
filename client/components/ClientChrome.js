'use client'

import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'

const AITutor = dynamic(() => import('@/components/AITutor'), { ssr: false })
const ScreenProtection = dynamic(() => import('@/components/ScreenProtection'), { ssr: false })

/** Load AITutor/ScreenProtection only where needed — faster admin & auth pages */
export default function ClientChrome() {
  const pathname = usePathname() || ''
  const skipHeavy =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/promoter')

  if (skipHeavy) return null

  return (
    <>
      <AITutor />
      <ScreenProtection />
    </>
  )
}
