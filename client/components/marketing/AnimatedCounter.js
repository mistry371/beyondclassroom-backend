'use client'

import { useEffect, useState, useRef } from 'react'

export default function AnimatedCounter({ value, suffix = '', duration = 2, className = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true) },
      { threshold: 0.2 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!started) return
    const end = typeof value === 'number' ? value : parseInt(value, 10)
    let start = 0
    const steps = duration * 60
    const increment = end / steps
    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 1000 / 60)
    return () => clearInterval(timer)
  }, [started, value, duration])

  const formatted = count >= 1000
    ? `${Math.floor(count / 1000)}K`
  : count

  return (
    <span ref={ref} className={className}>
      {count >= 1000 ? formatted : count}{suffix}
    </span>
  )
}
