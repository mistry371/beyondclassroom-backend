'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Infinity } from 'lucide-react'

export default function ComplexNumberCalculator() {
  const [a1, setA1] = useState('3')
  const [b1, setB1] = useState('4')
  const [a2, setA2] = useState('1')
  const [b2, setB2] = useState('2')
  const [result, setResult] = useState(null)

  const calculate = () => {
    const r1 = parseFloat(a1), i1 = parseFloat(b1)
    const r2 = parseFloat(a2), i2 = parseFloat(b2)

    const addReal = r1 + r2, addImag = i1 + i2
    const subReal = r1 - r2, subImag = i1 - i2
    const mulReal = r1 * r2 - i1 * i2, mulImag = r1 * i2 + i1 * r2
    const divDenom = r2 * r2 + i2 * i2
    const divReal = (r1 * r2 + i1 * i2) / divDenom
    const divImag = (i1 * r2 - r1 * i2) / divDenom
    const mag1 = Math.sqrt(r1 * r1 + i1 * i1)
    const mag2 = Math.sqrt(r2 * r2 + i2 * i2)
    const arg1 = Math.atan2(i1, r1) * (180 / Math.PI)
    const arg2 = Math.atan2(i2, r2) * (180 / Math.PI)

    setResult({
      addition: `${addReal.toFixed(2)} + ${addImag.toFixed(2)}i`,
      subtraction: `${subReal.toFixed(2)} + ${subImag.toFixed(2)}i`,
      multiplication: `${mulReal.toFixed(2)} + ${mulImag.toFixed(2)}i`,
      division: `${divReal.toFixed(2)} + ${divImag.toFixed(2)}i`,
      magnitude1: mag1.toFixed(4),
      magnitude2: mag2.toFixed(4),
      argument1: arg1.toFixed(2),
      argument2: arg2.toFixed(2),
      conjugate1: `${r1} - ${i1}i`,
      conjugate2: `${r2} - ${i2}i`
    })
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-dark-100 to-dark rounded-2xl p-6 border border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <Infinity className="h-8 w-8 text-violet-400" />
        <h2 className="text-2xl font-bold text-white">Complex Number Calculator</h2>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="text-gray-400 text-sm mb-2 block">Complex 1: a + bi</label>
          <div className="grid grid-cols-2 gap-2">
            <input type="number" value={a1} onChange={(e) => setA1(e.target.value)}
              className="bg-dark-200 text-white px-4 py-2 rounded-lg" placeholder="Real (a)" />
            <input type="number" value={b1} onChange={(e) => setB1(e.target.value)}
              className="bg-dark-200 text-white px-4 py-2 rounded-lg" placeholder="Imag (b)" />
          </div>
        </div>

        <div>
          <label className="text-gray-400 text-sm mb-2 block">Complex 2: c + di</label>
          <div className="grid grid-cols-2 gap-2">
            <input type="number" value={a2} onChange={(e) => setA2(e.target.value)}
              className="bg-dark-200 text-white px-4 py-2 rounded-lg" placeholder="Real (c)" />
            <input type="number" value={b2} onChange={(e) => setB2(e.target.value)}
              className="bg-dark-200 text-white px-4 py-2 rounded-lg" placeholder="Imag (d)" />
          </div>
        </div>
      </div>

      <button onClick={calculate}
        className="w-full bg-gradient-to-r from-violet-500 to-secondary text-white py-3 rounded-lg font-semibold mb-6">
        Calculate
      </button>

      {result && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-2 gap-3">
          {Object.entries(result).map(([key, value]) => (
            <div key={key} className="bg-black/50 rounded-xl p-4">
              <div className="text-gray-400 text-sm capitalize mb-1">{key.replace(/([A-Z])/g, ' $1')}</div>
              <div className="text-lg font-bold text-white">{value}</div>
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
