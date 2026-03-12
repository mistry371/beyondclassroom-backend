'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calculator } from 'lucide-react'

export default function QuadraticSolver() {
  const [a, setA] = useState(1)
  const [b, setB] = useState(-3)
  const [c, setC] = useState(2)
  const [roots, setRoots] = useState(null)

  const solve = () => {
    const discriminant = b * b - 4 * a * c
    
    if (discriminant > 0) {
      const root1 = (-b + Math.sqrt(discriminant)) / (2 * a)
      const root2 = (-b - Math.sqrt(discriminant)) / (2 * a)
      setRoots({
        type: 'real',
        root1: root1.toFixed(4),
        root2: root2.toFixed(4),
        discriminant
      })
    } else if (discriminant === 0) {
      const root = -b / (2 * a)
      setRoots({
        type: 'equal',
        root: root.toFixed(4),
        discriminant
      })
    } else {
      const realPart = (-b / (2 * a)).toFixed(4)
      const imagPart = (Math.sqrt(-discriminant) / (2 * a)).toFixed(4)
      setRoots({
        type: 'complex',
        realPart,
        imagPart,
        discriminant
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
        <Calculator className="h-8 w-8 text-orange-400" />
        <h2 className="text-2xl font-bold text-white">Quadratic Equation Solver</h2>
      </div>

      <div className="bg-black/50 rounded-xl p-4 mb-6 text-center">
        <div className="text-white text-2xl font-mono">
          <span className="text-orange-400">{a}</span>x² + 
          <span className="text-orange-400"> {b}</span>x + 
          <span className="text-orange-400"> {c}</span> = 0
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <label className="text-gray-400 text-sm mb-2 block">a (x²)</label>
          <input
            type="number"
            value={a}
            onChange={(e) => setA(Number(e.target.value))}
            className="w-full bg-dark-200 text-white px-4 py-3 rounded-lg text-center"
          />
        </div>
        <div>
          <label className="text-gray-400 text-sm mb-2 block">b (x)</label>
          <input
            type="number"
            value={b}
            onChange={(e) => setB(Number(e.target.value))}
            className="w-full bg-dark-200 text-white px-4 py-3 rounded-lg text-center"
          />
        </div>
        <div>
          <label className="text-gray-400 text-sm mb-2 block">c</label>
          <input
            type="number"
            value={c}
            onChange={(e) => setC(Number(e.target.value))}
            className="w-full bg-dark-200 text-white px-4 py-3 rounded-lg text-center"
          />
        </div>
      </div>

      <button
        onClick={solve}
        className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold mb-6"
      >
        Solve Equation
      </button>

      {roots && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black/50 rounded-xl p-6"
        >
          <div className="text-gray-400 mb-4">
            Discriminant (b² - 4ac) = {roots.discriminant}
          </div>

          {roots.type === 'real' && (
            <div className="space-y-3">
              <div className="text-white">
                <span className="text-gray-400">Root 1:</span>
                <span className="text-2xl font-bold ml-3">{roots.root1}</span>
              </div>
              <div className="text-white">
                <span className="text-gray-400">Root 2:</span>
                <span className="text-2xl font-bold ml-3">{roots.root2}</span>
              </div>
            </div>
          )}

          {roots.type === 'equal' && (
            <div className="text-white">
              <span className="text-gray-400">Equal Roots:</span>
              <span className="text-2xl font-bold ml-3">{roots.root}</span>
            </div>
          )}

          {roots.type === 'complex' && (
            <div className="space-y-3">
              <div className="text-white">
                <span className="text-gray-400">Root 1:</span>
                <span className="text-2xl font-bold ml-3">
                  {roots.realPart} + {roots.imagPart}i
                </span>
              </div>
              <div className="text-white">
                <span className="text-gray-400">Root 2:</span>
                <span className="text-2xl font-bold ml-3">
                  {roots.realPart} - {roots.imagPart}i
                </span>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
