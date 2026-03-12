'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Divide } from 'lucide-react'

export default function RatioCalculator() {
  const [a, setA] = useState(4)
  const [b, setB] = useState(6)
  const [result, setResult] = useState(null)

  const gcd = (x, y) => y === 0 ? x : gcd(y, x % y)

  const simplify = () => {
    const divisor = gcd(a, b)
    const simplified = { a: a / divisor, b: b / divisor }
    const decimal = (a / b).toFixed(4)
    const percentage = ((a / b) * 100).toFixed(2)
    setResult({ ...simplified, decimal, percentage })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-dark-100 to-dark rounded-2xl p-6 border border-white/10"
    >
      <div className="flex items-center gap-3 mb-6">
        <Divide className="h-8 w-8 text-indigo-400" />
        <h2 className="text-2xl font-bold text-white">Ratio Calculator</h2>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <input
          type="number"
          value={a}
          onChange={(e) => setA(Number(e.target.value))}
          className="flex-1 bg-dark-200 text-white px-4 py-3 rounded-lg text-center text-2xl"
        />
        <span className="text-white text-2xl">:</span>
        <input
          type="number"
          value={b}
          onChange={(e) => setB(Number(e.target.value))}
          className="flex-1 bg-dark-200 text-white px-4 py-3 rounded-lg text-center text-2xl"
        />
      </div>

      <button
        onClick={simplify}
        className="w-full bg-gradient-to-r from-indigo-500 to-secondary text-white py-3 rounded-lg font-semibold mb-6"
      >
        Simplify Ratio
      </button>

      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className="bg-black/50 rounded-xl p-6 text-center">
            <div className="text-gray-400 mb-2">Simplified Ratio:</div>
            <div className="text-4xl font-bold text-white">
              {result.a} : {result.b}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/50 rounded-xl p-4 text-center">
              <div className="text-gray-400 text-sm mb-1">Decimal</div>
              <div className="text-2xl font-bold text-white">{result.decimal}</div>
            </div>
            <div className="bg-black/50 rounded-xl p-4 text-center">
              <div className="text-gray-400 text-sm mb-1">Percentage</div>
              <div className="text-2xl font-bold text-white">{result.percentage}%</div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
