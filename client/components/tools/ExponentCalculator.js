'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'

export default function ExponentCalculator() {
  const [base, setBase] = useState(2)
  const [exponent, setExponent] = useState(8)
  const [result, setResult] = useState(null)

  const calculate = () => {
    const power = Math.pow(base, exponent)
    const log = Math.log(base) / Math.log(exponent)
    setResult({ power, log: log.toFixed(4) })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-dark-100 to-dark rounded-2xl p-6 border border-white/10"
    >
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="h-8 w-8 text-primary" />
        <h2 className="text-2xl font-bold text-white">Exponent Calculator</h2>
      </div>

      <div className="bg-black/50 rounded-xl p-4 mb-6 text-center">
        <div className="text-white text-3xl font-mono">
          <span className="text-primary">{base}</span>
          <sup className="text-accent">{exponent}</sup>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-gray-400 text-sm mb-2 block">Base</label>
          <input
            type="number"
            value={base}
            onChange={(e) => setBase(Number(e.target.value))}
            className="w-full bg-dark-200 text-white px-4 py-3 rounded-lg text-center text-2xl"
          />
        </div>
        <div>
          <label className="text-gray-400 text-sm mb-2 block">Exponent</label>
          <input
            type="number"
            value={exponent}
            onChange={(e) => setExponent(Number(e.target.value))}
            className="w-full bg-dark-200 text-white px-4 py-3 rounded-lg text-center text-2xl"
          />
        </div>
      </div>

      <button
        onClick={calculate}
        className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-lg font-semibold mb-6"
      >
        Calculate
      </button>

      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className="bg-black/50 rounded-xl p-6 text-center">
            <div className="text-gray-400 mb-2">Result:</div>
            <div className="text-4xl font-bold text-white break-all">
              {result.power.toLocaleString()}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
