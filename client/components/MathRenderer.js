'use client'

import { useEffect, useRef } from 'react'

export default function MathRenderer({ formula, inline = false }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.MathJax) {
      window.MathJax.typesetPromise([containerRef.current]).catch((err) => console.error(err))
    }
  }, [formula])

  return (
    <span ref={containerRef} className={inline ? 'inline-block' : 'block my-4'}>
      {inline ? `\\(${formula}\\)` : `\\[${formula}\\]`}
    </span>
  )
}
