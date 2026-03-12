'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Triangle } from 'lucide-react'

export default function TrigonometryCalculator() {
  const [angle, setAngle] = useState(30)
  const [unit, setUnit] = useState('degrees')
  const [result, setResult] = useState(null)

  const calculate = () => {
    const rad = unit === 'degrees' ? (angle * Math.PI) / 180 : angle
    
    setResult({
      sin: Math.sin(rad).toFixed(4),
      cos: Math.cos(rad).toFixed(4),
      tan: Math.tan(rad).toFixed(4),
      csc: (1 / Math.sin(rad)).toFixed(4),
      sec: (1 / Math.cos(rad)).toFixed(4),
      cot: (1 / Math.tan(rad)).toFixed(4)
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-dark-100 to-dark rounded-2xl p-6 border border-white/10"
    >
      <div className="flex items-center gap-3 mb-6">
        <Triangle className="h-8 w-8 text-accent" />
        <h2 className="text-2xl font-bold text-white">Trigonometry Calculator</h2>
      </div>

      <div className="mb-6">
        <label className="text-gray-400 text-sm mb-2 block">Angle</label>
        <input
          type="number"
          value={angle}
          onChange={(e) => setAngle(Number(e.target.value))}
          className="w-full bg-dark-200 text-white px-4 py-3 rounded-lg text-center text-2xl"
        />
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setUnit('degrees')}
          className={`flex-1 py-2 rounded-lg font-semibold ${
            unit === 'degrees' ? 'bg-pink-600 text-white' : 'bg-dark-200 text-gray-300'
          }`}
        >
          Degrees
        </button>
        <button
          onClick={() => setUnit('radians')}
          className={`flex-1 py-2 rounded-lg font-semibold ${
            unit === 'radians' ? 'bg-pink-600 text-white' : 'bg-dark-200 text-gray-300'
          }`}
        >
          Radians
        </button>
      </div>

      <button
        onClick={calculate}
        className="w-full bg-gradient-to-r from-accent to-rose-500 text-white py-3 rounded-lg font-semibold mb-6"
      >
        Calculate
      </button>

      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-2 gap-3"
        >
          {Object.entries(result).map(([key, value]) => (
            <div key={key} className="bg-black/50 rounded-xl p-4 text-center">
              <div className="text-gray-400 text-sm uppercase mb-1">{key}</div>
              <div className="text-2xl font-bold text-white">{value}</div>
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
