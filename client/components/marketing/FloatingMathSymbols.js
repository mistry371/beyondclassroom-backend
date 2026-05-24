'use client'

import { motion } from 'framer-motion'

const symbols = ['∑', 'π', '∫', '√', '∞', 'θ', 'Δ', '÷', '×', 'λ', 'α', 'β']

export default function FloatingMathSymbols({ count = 12 }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {symbols.slice(0, count).map((sym, i) => (
        <motion.span
          key={i}
          className="absolute text-2xl md:text-4xl font-bold text-white/10 select-none"
          style={{
            left: `${(i * 17 + 5) % 90}%`,
            top: `${(i * 23 + 10) % 85}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.08, 0.2, 0.08],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 5 + (i % 3),
            repeat: Infinity,
            delay: i * 0.4,
          }}
        >
          {sym}
        </motion.span>
      ))}
    </div>
  )
}
