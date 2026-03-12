'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Dices } from 'lucide-react'

export default function ProbabilityCalculator() {
  const [favorable, setFavorable] = useState('3')
  const [total, setTotal] = useState('10')
  const [result, setResult] = useState(null)

  const calculate = () => {
    const f = parseFloat(favorable)
    const t = parseFloat(total)

    if (f < 0 || t <= 0 || f > t) {
      setResult({ error: 'Invalid input: 0 ≤ favorable ≤ total' })
      return
    }

    const probability = f / t
    const percentage = (probability * 100).toFixed(2)
    const odds = f === 0 ? 'Impossible' : f === t ? 'Certain' : `${f}:${t - f}`
    const complement = 1 - probability

    setResult({
      probability: probability.toFixed(6),
      percentage: percentage,
      odds: odds,
      complement: complement.toFixed(6),
      complementPercent: (complement * 100).toFixed(2),
      fraction: `${f}/${t}`,
      info: [
        `Probability = Favorable / Total = ${f} / ${t}`,
        `P(Event) = ${probability.toFixed(6)} or ${percentage}%`,
        `P(Not Event) = ${complement.toFixed(6)} or ${(complement * 100).toFixed(2)}%`,
        `Odds = ${odds}`,
        `Decimal: ${probability.toFixed(6)}`
      ]
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-dark-100 to-dark rounded-2xl p-6 border border-white/10"
    >
      <div className="flex items-center gap-3 mb-6">
        <Dices className="h-8 w-8 text-accent" />
        <h2 className="text-2xl font-bold text-white">Probability Calculator</h2>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="text-gray-400 text-sm mb-2 block">Favorable Outcomes</label>
          <input
            type="number"
            value={favorable}
            onChange={(e) => setFavorable(e.target.value)}
            className="w-full bg-dark-200 text-white px-4 py-3 rounded-lg text-xl"
            placeholder="Number of favorable outcomes"
          />
        </div>

        <div>
          <label className="text-gray-400 text-sm mb-2 block">Total Possible Outcomes</label>
          <input
            type="number"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            className="w-full bg-dark-200 text-white px-4 py-3 rounded-lg text-xl"
            placeholder="Total number of outcomes"
          />
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <div className="text-primary text-sm">
            Example: Rolling a die and getting 1, 2, or 3 → Favorable = 3, Total = 6
          </div>
        </div>
      </div>

      <button
        onClick={calculate}
        className="w-full bg-gradient-to-r from-accent to-secondary text-white py-3 rounded-lg font-semibold mb-6"
      >
        Calculate Probability
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
              <div className="bg-gradient-to-r from-accent/20 to-secondary/20 border border-pink-500/50 rounded-xl p-6">
                <div className="text-gray-400 text-sm mb-2">Probability</div>
                <div className="text-4xl font-bold text-white mb-2">{result.percentage}%</div>
                <div className="text-gray-400 text-sm">({result.probability})</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/50 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-1">Fraction</div>
                  <div className="text-2xl font-bold text-white">{result.fraction}</div>
                </div>
                <div className="bg-black/50 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-1">Odds</div>
                  <div className="text-2xl font-bold text-white">{result.odds}</div>
                </div>
                <div className="bg-black/50 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-1">Complement</div>
                  <div className="text-xl font-bold text-white">{result.complementPercent}%</div>
                </div>
                <div className="bg-black/50 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-1">Decimal</div>
                  <div className="text-xl font-bold text-white">{result.probability}</div>
                </div>
              </div>

              <div className="bg-black/50 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-2">Explanation:</div>
                {result.info.map((line, i) => (
                  <div key={i} className="text-white mb-1 text-sm">{line}</div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
