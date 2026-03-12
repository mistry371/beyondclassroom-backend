'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'

export default function LinearEquationSolver() {
  const [a1, setA1] = useState('2')
  const [b1, setB1] = useState('3')
  const [c1, setC1] = useState('8')
  const [a2, setA2] = useState('3')
  const [b2, setB2] = useState('-2')
  const [c2, setC2] = useState('1')
  const [result, setResult] = useState(null)

  const solve = () => {
    const A1 = parseFloat(a1)
    const B1 = parseFloat(b1)
    const C1 = parseFloat(c1)
    const A2 = parseFloat(a2)
    const B2 = parseFloat(b2)
    const C2 = parseFloat(c2)

    const determinant = A1 * B2 - A2 * B1

    if (determinant === 0) {
      setResult({ error: 'No unique solution (parallel or coincident lines)' })
      return
    }

    const x = (C1 * B2 - C2 * B1) / determinant
    const y = (A1 * C2 - A2 * C1) / determinant

    setResult({
      x: x.toFixed(4),
      y: y.toFixed(4),
      determinant: determinant.toFixed(4),
      steps: [
        `Equation 1: ${A1}x + ${B1}y = ${C1}`,
        `Equation 2: ${A2}x + ${B2}y = ${C2}`,
        `Determinant: ${A1}×${B2} - ${A2}×${B1} = ${determinant}`,
        `x = (${C1}×${B2} - ${C2}×${B1}) / ${determinant} = ${x.toFixed(4)}`,
        `y = (${A1}×${C2} - ${A2}×${C1}) / ${determinant} = ${y.toFixed(4)}`
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
        <Plus className="h-8 w-8 text-primary" />
        <h2 className="text-2xl font-bold text-white">Linear Equation Solver</h2>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="text-gray-400 text-sm mb-2 block">Equation 1: a₁x + b₁y = c₁</label>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="number"
              value={a1}
              onChange={(e) => setA1(e.target.value)}
              className="bg-dark-200 text-white px-4 py-2 rounded-lg"
              placeholder="a₁"
            />
            <input
              type="number"
              value={b1}
              onChange={(e) => setB1(e.target.value)}
              className="bg-dark-200 text-white px-4 py-2 rounded-lg"
              placeholder="b₁"
            />
            <input
              type="number"
              value={c1}
              onChange={(e) => setC1(e.target.value)}
              className="bg-dark-200 text-white px-4 py-2 rounded-lg"
              placeholder="c₁"
            />
          </div>
        </div>

        <div>
          <label className="text-gray-400 text-sm mb-2 block">Equation 2: a₂x + b₂y = c₂</label>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="number"
              value={a2}
              onChange={(e) => setA2(e.target.value)}
              className="bg-dark-200 text-white px-4 py-2 rounded-lg"
              placeholder="a₂"
            />
            <input
              type="number"
              value={b2}
              onChange={(e) => setB2(e.target.value)}
              className="bg-dark-200 text-white px-4 py-2 rounded-lg"
              placeholder="b₂"
            />
            <input
              type="number"
              value={c2}
              onChange={(e) => setC2(e.target.value)}
              className="bg-dark-200 text-white px-4 py-2 rounded-lg"
              placeholder="c₂"
            />
          </div>
        </div>
      </div>

      <button
        onClick={solve}
        className="w-full bg-gradient-to-r from-secondary to-primary text-white py-3 rounded-lg font-semibold mb-6"
      >
        Solve System
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
                  <div className="text-gray-400 text-sm mb-1">x value</div>
                  <div className="text-3xl font-bold text-primary">{result.x}</div>
                </div>
                <div className="bg-black/50 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-1">y value</div>
                  <div className="text-3xl font-bold text-secondary">{result.y}</div>
                </div>
              </div>

              <div className="bg-black/50 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-2">Solution Steps:</div>
                {result.steps.map((step, i) => (
                  <div key={i} className="text-white mb-1 font-mono text-sm">{step}</div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
