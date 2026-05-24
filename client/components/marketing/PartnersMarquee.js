'use client'

import { partners } from '@/data/marketingContent'
import { Building2 } from 'lucide-react'

export default function PartnersMarquee() {
  const doubled = [...partners, ...partners]

  return (
    <div className="relative overflow-hidden py-6">
      <div className="flex animate-marquee gap-8 w-max items-center">
        {doubled.map((name, i) => (
          <div
            key={i}
            className="flex-shrink-0 flex items-center gap-3 px-6 py-4 bg-white rounded-xl border border-primary/10 shadow-sm"
          >
            <Building2 className="h-6 w-6 text-primary" />
            <span className="font-semibold text-ink whitespace-nowrap">{name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
