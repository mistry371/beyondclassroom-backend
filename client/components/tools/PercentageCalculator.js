'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Percent } from 'lucide-react'

export default function PercentageCalculator() {
  const [value, setValue] = useState(50)
  const [total, setTotal] = useState(100)
  const [percentage, setPercentage] = useState(50)

  const calculatePercentage = () => {
    const result = (value / total) * 100
    setPercentage(result.toFixed(2))
  }

  const calculateValue = () => {
    const result = (percentage / 100) * total
    setValue(result.toFixed(2))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-dark-100 to-dark rounded-2xl p-6 border border-white/10"
    >
      <div className="flex items-center gap-3 mb-6">
        <Percent className="h-8 w-8 text-green-400" />
        <h2 className="text-2xl font-bold text-white">Percentage Calculator</h2>
      </div>

      <div className="space-y-6">
        <div className="bg-black/50 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">What is X% of Y?</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Percentage</label>
              <input
                type="number"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                className="w-full bg-dark-200 text-white px-4 py-2 rounded-lg"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Of Total</label>
              <input
                type="number"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                className="w-full bg-dark-200 text-white px-4 py-2 rounded-lg"
              />
            </div>
          </div>
          <button
            onClick={calculateValue}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 rounded-lg font-semibold"
          >
            Calculate Value
          </button>
          <div className="mt-4 text-center">
            <span className="text-gray-400">Result: </span>
            <span className="text-2xl font-bold text-white">{value}</span>
          </div>
        </div>

        <div className="bg-black/50 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">X is what % of Y?</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Value</label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-dark-200 text-white px-4 py-2 rounded-lg"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Of Total</label>
              <input
                type="number"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                className="w-full bg-dark-200 text-white px-4 py-2 rounded-lg"
              />
            </div>
          </div>
          <button
            onClick={calculatePercentage}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 rounded-lg font-semibold"
          >
            Calculate Percentage
          </button>
          <div className="mt-4 text-center">
            <span className="text-gray-400">Result: </span>
            <span className="text-2xl font-bold text-white">{percentage}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
