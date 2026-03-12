'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Navigation } from 'lucide-react'

export default function VectorCalculator() {
  const [v1x, setV1x] = useState('3')
  const [v1y, setV1y] = useState('4')
  const [v2x, setV2x] = useState('1')
  const [v2y, setV2y] = useState('2')
  const [result, setResult] = useState(null)

  const calculate = () => {
    const a1 = parseFloat(v1x)
    const a2 = parseFloat(v1y)
    const b1 = parseFloat(v2x)
    const b2 = parseFloat(v2y)

    const magnitude1 = Math.sqrt(a1 * a1 + a2 * a2)
    const magnitude2 = Math.sqrt(b1 * b1 + b2 * b2)
    const dotProduct = a1 * b1 + a2 * b2
    const angle = Math.acos(dotProduct / (magnitude1 * magnitude2)) * (180 / Math.PI)

    setResult({
      addition: `(${(a1 + b1).toFixed(2)}, ${(a2 + b2).toFixed(2)})`,
      subtraction: `(${(a1 - b1).toFixed(2)}, ${(a2 - b2).toFixed(2)})`,
      magnitude1: magnitude1.toFixed(4),
      magnitude2: magnitude2.toFixed(4),
      dotProduct: dotProduct.toFixed(4),
      angle: angle.toFixed(2),
      unit1: `(${(a1 / magnitude1).toFixed(4)}, ${(a2 / magnitude1).toFixed(4)})`,
      unit2: `(${(b1 / magnitude2).toFixed(4)}, ${(b2 / magnitude2).toFixed(4)})`
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-dark-100 to-dark rounded-2xl p-6 border border-white/10"
    >
      <div className="flex items-center gap-3 mb-6">
        <Navigation className="h-8 w-8 text-indigo-400" />
        <h2 className="text-2xl font-bold text-white">Vector Calculator</h2>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="text-gray-400 text-sm mb-2 block">Vector 1 (x, y)</label>
          <div className="grid grid-cols-2 gap-2">
            <input type="number" value={v1x} onChange={(e) => setV1x(e.target.value)}
              className="bg-dark-200 text-white px-4 py-2 rounded-lg" placeholder="x" />
            <input type="number" value={v1y} onChange={(e) => setV1y(e.target.value)}
              className="bg-dark-200 text-white px-4 py-2 rounded-lg" placeholder="y" />
          </div>
        </div>

        <div>
          <label className="text-gray-400 text-sm mb-2 block">Vector 2 (x, y)</label>
          <div className="grid grid-cols-2 gap-2">
            <input type="number" value={v2x} onChange={(e) => setV2x(e.target.value)}
              className="bg-dark-200 text-white px-4 py-2 rounded-lg" placeholder="x" />
            <input type="number" value={v2y} onChange={(e) => setV2y(e.target.value)}
              className="bg-dark-200 text-white px-4 py-2 rounded-lg" placeholder="y" />
          </div>
        </div>
      </div>

      <button onClick={calculate}
        className="w-full bg-gradient-to-r from-indigo-500 to-secondary text-white py-3 rounded-lg font-semibold mb-6">
        Calculate
      </button>

      {result && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-2 gap-3">
          <div className="bg-black/50 rounded-xl p-4">
            <div className="text-gray-400 text-sm mb-1">Addition</div>
            <div className="text-lg font-bold text-white">{result.addition}</div>
          </div>
          <div className="bg-black/50 rounded-xl p-4">
            <div className="text-gray-400 text-sm mb-1">Subtraction</div>
            <div className="text-lg font-bold text-white">{result.subtraction}</div>
          </div>
          <div className="bg-black/50 rounded-xl p-4">
            <div className="text-gray-400 text-sm mb-1">|V1|</div>
            <div className="text-xl font-bold text-white">{result.magnitude1}</div>
          </div>
          <div className="bg-black/50 rounded-xl p-4">
            <div className="text-gray-400 text-sm mb-1">|V2|</div>
            <div className="text-xl font-bold text-white">{result.magnitude2}</div>
          </div>
          <div className="bg-black/50 rounded-xl p-4">
            <div className="text-gray-400 text-sm mb-1">Dot Product</div>
            <div className="text-xl font-bold text-white">{result.dotProduct}</div>
          </div>
          <div className="bg-black/50 rounded-xl p-4">
            <div className="text-gray-400 text-sm mb-1">Angle (°)</div>
            <div className="text-xl font-bold text-white">{result.angle}</div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
