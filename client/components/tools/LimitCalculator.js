'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'

export default function LimitCalculator() {
  const [coefficient, setCoefficient] = useState('1')
  const [power, setPower] = useState('2')
  const [constant, setConstant] = useState('3')
  const [limitPoint, setLimitPoint] = useState('2')
  const [result, setResult] = useState(null)

  const calculate = () => {
    const a = parseFloat(coefficient)
    const n = parseFloat(power)
    const c = parseFloat(constant)
    const x = parseFloat(limitPoint)

    const limitValue = a * Math.pow(x, n) + c
    const leftLimit = a * Math.pow(x - 0.0001, n) + c
    const rightLimit = a * Math.pow(x + 0.0001, n) + c
    const exists = Math.abs(leftLimit - rightLimit) < 0.01

    setResult({
      limit: limitValue.toFixed(6),
      leftLimit: leftLimit.toFixed(6),
      rightLimit: rightLimit.toFixed(6),
      exists: exists ? 'Yes' : 'No',
      function: `f(x) = ${a}x^${n} + ${c}`,
      evaluation: `lim(x→${x}) ${a}x^${n} + ${c} = ${limitValue.toFixed(6)}`,
      steps: [
        `Function: f(x) = ${a}x^${n} + ${c}`,
        `Limit point: x → ${x}`,
        `Direct substitution:`,
        `f(${x}) = ${a}(${x})^${n} + ${c}`,
        `= ${a * Math.pow(x, n)} + ${c}`,
        `= ${limitValue.toFixed(6)}`,
        ``,
        `Left limit: ${leftLimit.toFixed(6)}`,
        `Right limit: ${rightLimit.toFixed(6)}`,
        `Limit exists: ${exists ? 'Yes' : 'No'}`
      ]
    })
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-dark-100 to-dark rounded-2xl p-6 border border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="h-8 w-8 text-amber-400" />
        <h2 className="text-2xl font-bold text-white">Limit Calculator</h2>
      </div>

      <div className="space-y-4 mb-6">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <div className="text-primary text-sm">Function: ax^n + c</div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Coefficient (a)</label>
            <input type="number" value={coefficient} onChange={(e) => setCoefficient(e.target.value)}
              className="w-full bg-dark-200 text-white px-4 py-2 rounded-lg" />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Power (n)</label>
            <input type="number" value={power} onChange={(e) => setPower(e.target.value)}
              className="w-full bg-dark-200 text-white px-4 py-2 rounded-lg" />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Constant (c)</label>
            <input type="number" value={constant} onChange={(e) => setConstant(e.target.value)}
              className="w-full bg-dark-200 text-white px-4 py-2 rounded-lg" />
          </div>
        </div>

        <div>
          <label className="text-gray-400 text-sm mb-2 block">Limit Point (x →)</label>
          <input type="number" value={limitPoint} onChange={(e) => setLimitPoint(e.target.value)}
            className="w-full bg-dark-200 text-white px-4 py-3 rounded-lg text-xl" />
        </div>
      </div>

      <button onClick={calculate}
        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-lg font-semibold mb-6">
        Calculate Limit
      </button>

      {result && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50 rounded-xl p-6">
            <div className="text-gray-400 text-sm mb-2">Limit Value</div>
            <div className="text-4xl font-bold text-white">{result.limit}</div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-black/50 rounded-xl p-4">
              <div className="text-gray-400 text-sm mb-1">Left Limit</div>
              <div className="text-xl font-bold text-white">{result.leftLimit}</div>
            </div>
            <div className="bg-black/50 rounded-xl p-4">
              <div className="text-gray-400 text-sm mb-1">Right Limit</div>
              <div className="text-xl font-bold text-white">{result.rightLimit}</div>
            </div>
            <div className="bg-black/50 rounded-xl p-4">
              <div className="text-gray-400 text-sm mb-1">Exists?</div>
              <div className="text-xl font-bold text-white">{result.exists}</div>
            </div>
          </div>

          <div className="bg-black/50 rounded-xl p-4">
            <div className="text-gray-400 text-sm mb-2">Steps:</div>
            {result.steps.map((step, i) => (
              <div key={i} className="text-white mb-1 font-mono text-sm">{step}</div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
