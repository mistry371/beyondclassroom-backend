'use client'

import { useEffect, useState } from 'react'
import AnimatedCounter from './AnimatedCounter'

export default function LiveStatsBar() {
  const [liveCount, setLiveCount] = useState(48234)

  useEffect(() => {
    const t = setInterval(() => {
      setLiveCount((c) => c + Math.floor(Math.random() * 3))
    }, 12000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="bg-navy/95 border-b border-white/10 py-2.5 text-center text-white text-sm" role="status">
      <span className="inline-flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
        </span>
        <span>
          <strong className="text-secondary"><AnimatedCounter value={liveCount} /></strong> students learning now
        </span>
        <span className="hidden sm:inline text-white/50">·</span>
        <span className="hidden sm:inline text-white/80">Join 50,000+ achievers in Mathematics & French</span>
      </span>
    </div>
  )
}
