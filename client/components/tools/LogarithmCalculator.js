'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'

export default function LogarithmCalculator() {
  const [number, setNumber] = useState('100')
  const [base, setBase] = useState('10')
  const [result, setResult] = useState(null)

  const calculate = () => {
    const num = parseFloat(number)
    const b = parseFloat(base)

    if (num <= 0 || b <= 0 || b === 1) {
      setResult({ error: 'Invalid input: number and base must be positive, base ≠ 1' })
      return
    }

    const logResult = Math.log(num) / Math.log(b)
    const naturalLog = Math.log(num)
    const log10 = Math.log10(num)
    const log2 = Math.log2(num)

    setResult({
      main: logResult.toFixed(6),
      natural: naturalLog.toFixed(6),
      log10: log10.toFixed(6),
      log2: log2.toFixed(6),
      antilog: Math.pow(b, logResult).toFixed(6),
      properties: [
        `log₍${b}₎(${num}) = ${logResult.toFixed(6)}`,
        `ln(${num}) = ${naturalLog.toFixed(6)}`,
        `log₁₀(${num}) = ${log10.toFixed(6)}`,
        `log₂(${num}) = ${log2.toFixed(6)}`,
        `Antilog: ${b}^${logResult.toFixed(6)} = ${num}`
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
        <TrendingUp className="h-8 w-8 text-orange-400" />
        <h2 className="text-2xl font-bold text-white">Logarithm Calculator</h2>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="text-gray-400 text-sm mb-2 block">Number</label>
          <input
            type="number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="w-full bg-dark-200 text-white px-4 py-3 rounded-lg text-xl"
            placeholder="Enter number"
          />
        </div>

        <div>
          <label className="text-gray-400 text-sm mb-2 block">Base</label>
          <input
            type="number"
            value={base}
            onChange={(e) => setBase(e.target.value)}
            className="w-full bg-dark-200 text-white px-4 py-3 rounded-lg text-xl"
            placeholder="Enter base"
          />
        </div>

        <div className="flex gap-2">
          <button onClick={() => setBase('10')} className="flex-1 bg-dark-200 text-white py-2 rounded-lg">Base 10</button>
          <button onClick={() => setBase('2')} className="flex-1 bg-dark-200 text-white py-2 rounded-lg">Base 2</button>
          <button onClick={() => setBase(Math.E.toString())} className="flex-1 bg-dark-200 text-white py-2 rounded-lg">Base e</button>
        </div>
      </div>

      <button
        onClick={calculate}
        className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold mb-6"
      >
        Calculate Logarithm
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
              <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/50 rounded-xl p-6">
                <div className="text-gray-400 text-sm mb-2">log₍{base}₎({number}) =</div>
                <div className="text-4xl font-bold text-white">{result.main}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/50 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-1">Natural Log (ln)</div>
                  <div className="text-xl font-bold text-white">{result.natural}</div>
                </div>
                <div className="bg-black/50 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-1">Log Base 10</div>
                  <div className="text-xl font-bold text-white">{result.log10}</div>
                </div>
                <div className="bg-black/50 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-1">Log Base 2</div>
                  <div className="text-xl font-bold text-white">{result.log2}</div>
                </div>
                <div className="bg-black/50 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-1">Antilog</div>
                  <div className="text-xl font-bold text-white">{result.antilog}</div>
                </div>
              </div>

              <div className="bg-black/50 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-2">Properties:</div>
                {result.properties.map((prop, i) => (
                  <div key={i} className="text-white mb-1 font-mono text-sm">{prop}</div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
