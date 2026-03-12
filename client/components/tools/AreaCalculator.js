'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Square, Circle, Triangle } from 'lucide-react'

export default function AreaCalculator() {
  const [shape, setShape] = useState('square')
  const [dimensions, setDimensions] = useState({ side: 5, radius: 5, base: 5, height: 5 })
  const [result, setResult] = useState(null)

  const calculate = () => {
    let area
    switch (shape) {
      case 'square':
        area = dimensions.side * dimensions.side
        break
      case 'rectangle':
        area = dimensions.length * dimensions.width
        break
      case 'circle':
        area = Math.PI * dimensions.radius * dimensions.radius
        break
      case 'triangle':
        area = 0.5 * dimensions.base * dimensions.height
        break
    }
    setResult(area.toFixed(2))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-dark-100 to-dark rounded-2xl p-6 border border-white/10"
    >
      <div className="flex items-center gap-3 mb-6">
        <Square className="h-8 w-8 text-primary" />
        <h2 className="text-2xl font-bold text-white">Area Calculator</h2>
      </div>

      <div className="flex gap-2 mb-6">
        {['square', 'rectangle', 'circle', 'triangle'].map((s) => (
          <button
            key={s}
            onClick={() => setShape(s)}
            className={`flex-1 py-2 rounded-lg font-semibold capitalize ${
              shape === s ? 'bg-blue-600 text-white' : 'bg-dark-200 text-gray-300'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-4 mb-6">
        {shape === 'square' && (
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Side Length</label>
            <input
              type="number"
              value={dimensions.side}
              onChange={(e) => setDimensions({ ...dimensions, side: Number(e.target.value) })}
              className="w-full bg-dark-200 text-white px-4 py-3 rounded-lg"
            />
          </div>
        )}

        {shape === 'rectangle' && (
          <>
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Length</label>
              <input
                type="number"
                value={dimensions.length || 5}
                onChange={(e) => setDimensions({ ...dimensions, length: Number(e.target.value) })}
                className="w-full bg-dark-200 text-white px-4 py-3 rounded-lg"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Width</label>
              <input
                type="number"
                value={dimensions.width || 3}
                onChange={(e) => setDimensions({ ...dimensions, width: Number(e.target.value) })}
                className="w-full bg-dark-200 text-white px-4 py-3 rounded-lg"
              />
            </div>
          </>
        )}

        {shape === 'circle' && (
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Radius</label>
            <input
              type="number"
              value={dimensions.radius}
              onChange={(e) => setDimensions({ ...dimensions, radius: Number(e.target.value) })}
              className="w-full bg-dark-200 text-white px-4 py-3 rounded-lg"
            />
          </div>
        )}

        {shape === 'triangle' && (
          <>
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Base</label>
              <input
                type="number"
                value={dimensions.base}
                onChange={(e) => setDimensions({ ...dimensions, base: Number(e.target.value) })}
                className="w-full bg-dark-200 text-white px-4 py-3 rounded-lg"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Height</label>
              <input
                type="number"
                value={dimensions.height}
                onChange={(e) => setDimensions({ ...dimensions, height: Number(e.target.value) })}
                className="w-full bg-dark-200 text-white px-4 py-3 rounded-lg"
              />
            </div>
          </>
        )}
      </div>

      <button
        onClick={calculate}
        className="w-full bg-gradient-to-r from-secondary to-primary text-white py-3 rounded-lg font-semibold mb-4"
      >
        Calculate Area
      </button>

      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black/50 rounded-xl p-6 text-center"
        >
          <div className="text-gray-400 mb-2">Area:</div>
          <div className="text-4xl font-bold text-white">{result}</div>
          <div className="text-gray-400 mt-2">square units</div>
        </motion.div>
      )}
    </motion.div>
  )
}
