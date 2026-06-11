'use client'

import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'

const ScreenProtection = dynamic(() => import('@/components/ScreenProtection'), { ssr: false })

export default function ClientChrome() {
  const pathname = usePathname() || ''
  const skipHeavy =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/promoter')

  if (skipHeavy) return null

  return <ScreenProtection />
}
