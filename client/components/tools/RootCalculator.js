'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Radical } from 'lucide-react'

export default function RootCalculator() {
  const [number, setNumber] = useState(64)
  const [root, setRoot] = useState(2)
  const [result, setResult] = useState(null)

  const calculate = () => {
    const answer = Math.pow(number, 1 / root)
    setResult(answer.toFixed(6))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-dark-100 to-dark rounded-2xl p-6 border border-white/10"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="h-8 w-8 text-secondary text-2xl">√</div>
        <h2 className="text-2xl font-bold text-white">Root Calculator</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-gray-400 text-sm mb-2 block">Number</label>
          <input
            type="number"
            value={number}
            onChange={(e) => setNumber(Number(e.target.value))}
            className="w-full bg-dark-200 text-white px-4 py-3 rounded-lg text-center text-2xl"
          />
        </div>
        <div>
          <label className="text-gray-400 text-sm mb-2 block">Root (n)</label>
          <input
            type="number"
            value={root}
            onChange={(e) => setRoot(Number(e.target.value))}
            className="w-full bg-dark-200 text-white px-4 py-3 rounded-lg text-center text-2xl"
          />
        </div>
      </div>

      <button
        onClick={calculate}
        className="w-full bg-gradient-to-r from-secondary to-accent text-white py-3 rounded-lg font-semibold mb-6"
      >
        Calculate √
      </button>

      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black/50 rounded-xl p-6 text-center"
        >
          <div className="text-gray-400 mb-2">
            <sup>{root}</sup>√{number} =
          </div>
          <div className="text-4xl font-bold text-white">{result}</div>
        </motion.div>
      )}
    </motion.div>
  )
}
