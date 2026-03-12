'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3 } from 'lucide-react'

export default function StatisticsCalculator() {
  const [numbers, setNumbers] = useState('5, 10, 15, 20, 25')
  const [result, setResult] = useState(null)

  const calculate = () => {
    const nums = numbers.split(',').map(n => parseFloat(n.trim())).filter(n => !isNaN(n))
    
    if (nums.length === 0) return

    const sorted = [...nums].sort((a, b) => a - b)
    const sum = nums.reduce((a, b) => a + b, 0)
    const mean = sum / nums.length
    
    const variance = nums.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / nums.length
    const stdDev = Math.sqrt(variance)
    
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)]
    
    const mode = nums.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1
      return acc
    }, {})
    const maxFreq = Math.max(...Object.values(mode))
    const modes = Object.keys(mode).filter(key => mode[key] === maxFreq).map(Number)

    setResult({
      count: nums.length,
      sum: sum.toFixed(2),
      mean: mean.toFixed(2),
      median: median.toFixed(2),
      mode: modes.join(', '),
      stdDev: stdDev.toFixed(2),
      min: Math.min(...nums),
      max: Math.max(...nums),
      range: (Math.max(...nums) - Math.min(...nums)).toFixed(2)
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-dark-100 to-dark rounded-2xl p-6 border border-white/10"
    >
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="h-8 w-8 text-green-400" />
        <h2 className="text-2xl font-bold text-white">Statistics Calculator</h2>
      </div>

      <div className="mb-6">
        <label className="text-gray-400 text-sm mb-2 block">Enter Numbers (comma separated)</label>
        <textarea
          value={numbers}
          onChange={(e) => setNumbers(e.target.value)}
          className="w-full bg-dark-200 text-white px-4 py-3 rounded-lg font-mono"
          rows={3}
          placeholder="5, 10, 15, 20, 25"
        />
      </div>

      <button
        onClick={calculate}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg font-semibold mb-6"
      >
        Calculate Statistics
      </button>

      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-2 gap-3"
        >
          {Object.entries(result).map(([key, value]) => (
            <div key={key} className="bg-black/50 rounded-xl p-4">
              <div className="text-gray-400 text-sm capitalize mb-1">{key}</div>
              <div className="text-2xl font-bold text-white">{value}</div>
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
