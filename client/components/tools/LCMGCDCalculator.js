'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Hash } from 'lucide-react'

export default function LCMGCDCalculator() {
  const [num1, setNum1] = useState(12)
  const [num2, setNum2] = useState(18)
  const [result, setResult] = useState(null)

  const gcd = (a, b) => b === 0 ? a : gcd(b, a % b)
  const lcm = (a, b) => (a * b) / gcd(a, b)

  const calculate = () => {
    const gcdResult = gcd(num1, num2)
    const lcmResult = lcm(num1, num2)
    setResult({ gcd: gcdResult, lcm: lcmResult })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-dark-100 to-dark rounded-2xl p-6 border border-white/10"
    >
      <div className="flex items-center gap-3 mb-6">
        <Hash className="h-8 w-8 text-primary" />
        <h2 className="text-2xl font-bold text-white">LCM & GCD Calculator</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-gray-400 text-sm mb-2 block">First Number</label>
          <input
            type="number"
            value={num1}
            onChange={(e) => setNum1(Number(e.target.value))}
            className="w-full bg-dark-200 text-white px-4 py-3 rounded-lg text-center text-2xl"
          />
        </div>
        <div>
          <label className="text-gray-400 text-sm mb-2 block">Second Number</label>
          <input
            type="number"
            value={num2}
            onChange={(e) => setNum2(Number(e.target.value))}
            className="w-full bg-dark-200 text-white px-4 py-3 rounded-lg text-center text-2xl"
          />
        </div>
      </div>

      <button
        onClick={calculate}
        className="w-full bg-gradient-to-r from-secondary to-primary text-white py-3 rounded-lg font-semibold mb-6"
      >
        Calculate LCM & GCD
      </button>

      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="bg-black/50 rounded-xl p-6 text-center">
            <div className="text-gray-400 mb-2">GCD</div>
            <div className="text-4xl font-bold text-primary">{result.gcd}</div>
            <div className="text-gray-500 text-sm mt-2">Greatest Common Divisor</div>
          </div>
          <div className="bg-black/50 rounded-xl p-6 text-center">
            <div className="text-gray-400 mb-2">LCM</div>
            <div className="text-4xl font-bold text-primary">{result.lcm}</div>
            <div className="text-gray-500 text-sm mt-2">Least Common Multiple</div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
