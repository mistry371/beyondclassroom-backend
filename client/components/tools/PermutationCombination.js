'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shuffle } from 'lucide-react'

export default function PermutationCombination() {
  const [n, setN] = useState(5)
  const [r, setR] = useState(3)
  const [result, setResult] = useState(null)

  const factorial = (num) => {
    if (num <= 1) return 1
    let result = 1
    for (let i = 2; i <= num; i++) {
      result *= i
    }
    return result
  }

  const calculate = () => {
    const permutation = factorial(n) / factorial(n - r)
    const combination = factorial(n) / (factorial(r) * factorial(n - r))
    setResult({ permutation, combination })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-dark-100 to-dark rounded-2xl p-6 border border-white/10"
    >
      <div className="flex items-center gap-3 mb-6">
        <Shuffle className="h-8 w-8 text-secondary" />
        <h2 className="text-2xl font-bold text-white">Permutation & Combination</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-gray-400 text-sm mb-2 block">n (Total Items)</label>
          <input
            type="number"
            min="0"
            value={n}
            onChange={(e) => setN(Number(e.target.value))}
            className="w-full bg-dark-200 text-white px-4 py-3 rounded-lg text-center text-2xl"
          />
        </div>
        <div>
          <label className="text-gray-400 text-sm mb-2 block">r (Select Items)</label>
          <input
            type="number"
            min="0"
            value={r}
            onChange={(e) => setR(Number(e.target.value))}
            className="w-full bg-dark-200 text-white px-4 py-3 rounded-lg text-center text-2xl"
          />
        </div>
      </div>

      <button
        onClick={calculate}
        className="w-full bg-gradient-to-r from-secondary to-accent text-white py-3 rounded-lg font-semibold mb-6"
      >
        Calculate
      </button>

      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="bg-black/50 rounded-xl p-6 text-center">
            <div className="text-gray-400 mb-2">Permutation</div>
            <div className="text-sm text-gray-500 mb-2">ⁿPᵣ</div>
            <div className="text-3xl font-bold text-secondary">
              {result.permutation.toLocaleString()}
            </div>
            <div className="text-gray-500 text-xs mt-2">Order matters</div>
          </div>
          <div className="bg-black/50 rounded-xl p-6 text-center">
            <div className="text-gray-400 mb-2">Combination</div>
            <div className="text-sm text-gray-500 mb-2">ⁿCᵣ</div>
            <div className="text-3xl font-bold text-accent">
              {result.combination.toLocaleString()}
            </div>
            <div className="text-gray-500 text-xs mt-2">Order doesn't matter</div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
