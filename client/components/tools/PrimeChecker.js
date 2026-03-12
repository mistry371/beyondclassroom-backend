'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

export default function PrimeChecker() {
  const [number, setNumber] = useState(17)
  const [result, setResult] = useState(null)

  const isPrime = (n) => {
    if (n <= 1) return false
    if (n <= 3) return true
    if (n % 2 === 0 || n % 3 === 0) return false
    for (let i = 5; i * i <= n; i += 6) {
      if (n % i === 0 || n % (i + 2) === 0) return false
    }
    return true
  }

  const getFactors = (n) => {
    const factors = []
    for (let i = 1; i <= n; i++) {
      if (n % i === 0) factors.push(i)
    }
    return factors
  }

  const check = () => {
    const prime = isPrime(number)
    const factors = getFactors(number)
    setResult({ isPrime: prime, factors })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-dark-100 to-dark rounded-2xl p-6 border border-white/10"
    >
      <div className="flex items-center gap-3 mb-6">
        <Star className="h-8 w-8 text-yellow-400" />
        <h2 className="text-2xl font-bold text-white">Prime Number Checker</h2>
      </div>

      <div className="mb-6">
        <label className="text-gray-400 text-sm mb-2 block">Enter Number</label>
        <input
          type="number"
          value={number}
          onChange={(e) => setNumber(Number(e.target.value))}
          className="w-full bg-dark-200 text-white px-4 py-4 rounded-lg text-center text-3xl"
        />
      </div>

      <button
        onClick={check}
        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-lg font-semibold mb-6"
      >
        Check Prime
      </button>

      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className={`rounded-xl p-6 text-center ${result.isPrime ? 'bg-green-500/20 border border-green-500/50' : 'bg-red-500/20 border border-red-500/50'}`}>
            <div className="text-4xl font-bold text-white mb-2">
              {result.isPrime ? '✓ PRIME' : '✗ NOT PRIME'}
            </div>
            <div className="text-gray-300">
              {result.isPrime ? `${number} is a prime number` : `${number} is not a prime number`}
            </div>
          </div>

          <div className="bg-black/50 rounded-xl p-6">
            <div className="text-gray-400 mb-3">Factors:</div>
            <div className="flex flex-wrap gap-2">
              {result.factors.map((factor, i) => (
                <span key={i} className="bg-dark-200 text-white px-3 py-1 rounded-lg">
                  {factor}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
