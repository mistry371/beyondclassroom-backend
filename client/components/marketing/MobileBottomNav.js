'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Calculator, Radio, User } from 'lucide-react'

const items = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/courses', icon: BookOpen, label: 'Courses' },
  { href: '/tools', icon: Calculator, label: 'Tools' },
  { href: '/live', icon: Radio, label: 'Live' },
  { href: '/dashboard', icon: User, label: 'Account' },
]

export default function MobileBottomNav() {
  const pathname = usePathname()
  const hidden = pathname?.startsWith('/admin') || pathname?.startsWith('/learn') || pathname?.startsWith('/auth') || pathname?.startsWith('/promoter')

  if (hidden) return null

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-navy/95 backdrop-blur-xl border-t border-white/10 safe-area-pb">
      <div className="flex justify-around items-center h-16 px-2">
        {items.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/' && pathname?.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors ${active ? 'text-secondary' : 'text-white/60'}`}
            >
              <Icon className={`h-5 w-5 ${active ? 'text-secondary' : ''}`} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
