'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { List } from 'lucide-react'

export default function SequenceCalculator() {
  const [type, setType] = useState('arithmetic')
  const [firstTerm, setFirstTerm] = useState('2')
  const [difference, setDifference] = useState('3')
  const [nthTerm, setNthTerm] = useState('10')
  const [result, setResult] = useState(null)

  const calculate = () => {
    const a = parseFloat(firstTerm)
    const d = parseFloat(difference)
    const n = parseInt(nthTerm)

    if (n <= 0) {
      setResult({ error: 'n must be positive' })
      return
    }

    if (type === 'arithmetic') {
      const nth = a + (n - 1) * d
      const sum = (n / 2) * (2 * a + (n - 1) * d)
      const sequence = Array.from({ length: Math.min(n, 10) }, (_, i) => a + i * d)

      setResult({
        nthTerm: nth.toFixed(4),
        sum: sum.toFixed(4),
        sequence: sequence.map(x => x.toFixed(2)).join(', ') + (n > 10 ? '...' : ''),
        formula: `aₙ = a + (n-1)d = ${a} + (${n}-1)×${d}`,
        sumFormula: `Sₙ = n/2 × (2a + (n-1)d) = ${n}/2 × (2×${a} + (${n}-1)×${d})`
      })
    } else {
      const nth = a * Math.pow(d, n - 1)
      const sum = d === 1 ? a * n : a * (1 - Math.pow(d, n)) / (1 - d)
      const sequence = Array.from({ length: Math.min(n, 10) }, (_, i) => a * Math.pow(d, i))

      setResult({
        nthTerm: nth.toFixed(4),
        sum: sum.toFixed(4),
        sequence: sequence.map(x => x.toFixed(2)).join(', ') + (n > 10 ? '...' : ''),
        formula: `aₙ = a × rⁿ⁻¹ = ${a} × ${d}^${n-1}`,
        sumFormula: d === 1 ? `Sₙ = a × n = ${a} × ${n}` : `Sₙ = a(1-rⁿ)/(1-r) = ${a}(1-${d}^${n})/(1-${d})`
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-dark-100 to-dark rounded-2xl p-6 border border-white/10"
    >
      <div className="flex items-center gap-3 mb-6">
        <List className="h-8 w-8 text-teal-400" />
        <h2 className="text-2xl font-bold text-white">Sequence & Series Calculator</h2>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="text-gray-400 text-sm mb-2 block">Sequence Type</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setType('arithmetic')}
              className={`py-2 rounded-lg font-semibold ${
                type === 'arithmetic' ? 'bg-gradient-to-r from-teal-500 to-primary text-white' : 'bg-dark-200 text-gray-300'
              }`}
            >
              Arithmetic
            </button>
            <button
              onClick={() => setType('geometric')}
              className={`py-2 rounded-lg font-semibold ${
                type === 'geometric' ? 'bg-gradient-to-r from-teal-500 to-primary text-white' : 'bg-dark-200 text-gray-300'
              }`}
            >
              Geometric
            </button>
          </div>
        </div>

        <div>
          <label className="text-gray-400 text-sm mb-2 block">First Term (a)</label>
          <input
            type="number"
            value={firstTerm}
            onChange={(e) => setFirstTerm(e.target.value)}
            className="w-full bg-dark-200 text-white px-4 py-3 rounded-lg"
            placeholder="First term"
          />
        </div>

        <div>
          <label className="text-gray-400 text-sm mb-2 block">
            {type === 'arithmetic' ? 'Common Difference (d)' : 'Common Ratio (r)'}
          </label>
          <input
            type="number"
            value={difference}
            onChange={(e) => setDifference(e.target.value)}
            className="w-full bg-dark-200 text-white px-4 py-3 rounded-lg"
            placeholder={type === 'arithmetic' ? 'Difference' : 'Ratio'}
          />
        </div>

        <div>
          <label className="text-gray-400 text-sm mb-2 block">Term Number (n)</label>
          <input
            type="number"
            value={nthTerm}
            onChange={(e) => setNthTerm(e.target.value)}
            className="w-full bg-dark-200 text-white px-4 py-3 rounded-lg"
            placeholder="Which term?"
          />
        </div>
      </div>

      <button
        onClick={calculate}
        className="w-full bg-gradient-to-r from-teal-500 to-primary text-white py-3 rounded-lg font-semibold mb-6"
      >
        Calculate
      </button>

      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          {result.error ? (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
              <div className="text-red-400 font-semibold">{result.error}</div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/50 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-1">nth Term</div>
                  <div className="text-3xl font-bold text-teal-400">{result.nthTerm}</div>
                </div>
                <div className="bg-black/50 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-1">Sum of n Terms</div>
                  <div className="text-3xl font-bold text-primary">{result.sum}</div>
                </div>
              </div>

              <div className="bg-black/50 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-2">Sequence (first 10 terms):</div>
                <div className="text-white font-mono">{result.sequence}</div>
              </div>

              <div className="bg-black/50 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-2">Formulas:</div>
                <div className="text-white mb-1 text-sm">{result.formula}</div>
                <div className="text-white text-sm">{result.sumFormula}</div>
              </div>
            </>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
