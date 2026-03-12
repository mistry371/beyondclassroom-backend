'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

export default function FactorialCalculator() {
  const [number, setNumber] = useState(5)
  const [result, setResult] = useState(null)

  const factorial = (n) => {
    if (n < 0) return null
    if (n === 0 || n === 1) return 1
    let result = 1
    for (let i = 2; i <= n; i++) {
      result *= i
    }
    return result
  }

  const calculate = () => {
    const fact = factorial(number)
    const steps = []
    for (let i = number; i >= 1; i--) {
      steps.push(i)
    }
    setResult({ value: fact, steps })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-dark-100 to-dark rounded-2xl p-6 border border-white/10"
    >
      <div className="flex items-center gap-3 mb-6">
        <Zap className="h-8 w-8 text-orange-400" />
        <h2 className="text-2xl font-bold text-white">Factorial Calculator</h2>
      </div>

      <div className="mb-6">
        <label className="text-gray-400 text-sm mb-2 block">Enter Number (n!)</label>
        <input
          type="number"
          min="0"
          max="20"
          value={number}
          onChange={(e) => setNumber(Number(e.target.value))}
          className="w-full bg-dark-200 text-white px-4 py-4 rounded-lg text-center text-3xl"
        />
        <div className="text-gray-500 text-sm mt-2 text-center">Maximum: 20</div>
      </div>

      <button
        onClick={calculate}
        className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold mb-6"
      >
        Calculate {number}!
      </button>

      {result && result.value !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className="bg-black/50 rounded-xl p-6 text-center">
            <div className="text-gray-400 mb-2">{number}! =</div>
            <div className="text-4xl font-bold text-white break-all">
              {result.value.toLocaleString()}
            </div>
          </div>

          <div className="bg-black/50 rounded-xl p-6">
            <div className="text-gray-400 mb-3">Calculation:</div>
            <div className="text-white text-center font-mono">
              {result.steps.join(' × ')} = {result.value.toLocaleString()}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
