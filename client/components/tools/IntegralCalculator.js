'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sigma } from 'lucide-react'

export default function IntegralCalculator() {
  const [coefficient, setCoefficient] = useState('3')
  const [power, setPower] = useState('2')
  const [constant, setConstant] = useState('0')
  const [lowerLimit, setLowerLimit] = useState('0')
  const [upperLimit, setUpperLimit] = useState('2')
  const [result, setResult] = useState(null)

  const calculate = () => {
    const a = parseFloat(coefficient)
    const n = parseFloat(power)
    const c = parseFloat(constant)
    const lower = parseFloat(lowerLimit)
    const upper = parseFloat(upperLimit)

    if (n === -1) {
      setResult({ error: 'Power cannot be -1 (use logarithm)' })
      return
    }

    const newPower = n + 1
    const newCoeff = a / newPower
    const integral = `${newCoeff.toFixed(4)}x^${newPower.toFixed(2)} + ${c}x + C`
    
    const upperValue = newCoeff * Math.pow(upper, newPower) + c * upper
    const lowerValue = newCoeff * Math.pow(lower, newPower) + c * lower
    const definiteIntegral = upperValue - lowerValue

    setResult({
      indefinite: integral,
      definite: definiteIntegral.toFixed(6),
      upperValue: upperValue.toFixed(6),
      lowerValue: lowerValue.toFixed(6),
      steps: [
        `∫(${a}x^${n} + ${c})dx`,
        `= ${a}/(${n}+1) × x^(${n}+1) + ${c}x + C`,
        `= ${newCoeff.toFixed(4)}x^${newPower.toFixed(2)} + ${c}x + C`,
        ``,
        `Definite integral from ${lower} to ${upper}:`,
        `[${newCoeff.toFixed(4)}x^${newPower.toFixed(2)} + ${c}x]₍${lower}₎^${upper}`,
        `= ${upperValue.toFixed(6)} - ${lowerValue.toFixed(6)}`,
        `= ${definiteIntegral.toFixed(6)}`
      ]
    })
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-dark-100 to-dark rounded-2xl p-6 border border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <Sigma className="h-8 w-8 text-emerald-400" />
        <h2 className="text-2xl font-bold text-white">Integral Calculator</h2>
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

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Lower Limit</label>
            <input type="number" value={lowerLimit} onChange={(e) => setLowerLimit(e.target.value)}
              className="w-full bg-dark-200 text-white px-4 py-2 rounded-lg" />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Upper Limit</label>
            <input type="number" value={upperLimit} onChange={(e) => setUpperLimit(e.target.value)}
              className="w-full bg-dark-200 text-white px-4 py-2 rounded-lg" />
          </div>
        </div>
      </div>

      <button onClick={calculate}
        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-lg font-semibold mb-6">
        Calculate Integral
      </button>

      {result && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          {result.error ? (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
              <div className="text-red-400 font-semibold">{result.error}</div>
            </div>
          ) : (
            <>
              <div className="bg-black/50 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Indefinite Integral</div>
                <div className="text-xl font-bold text-white font-mono">{result.indefinite}</div>
              </div>
              <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/50 rounded-xl p-6">
                <div className="text-gray-400 text-sm mb-2">Definite Integral</div>
                <div className="text-4xl font-bold text-white">{result.definite}</div>
              </div>
              <div className="bg-black/50 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-2">Steps:</div>
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
