'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Calculator } from 'lucide-react'

export default function DerivativeCalculator() {
  const [expression, setExpression] = useState('x^3 + 2*x^2 - 5*x + 1')
  const [derivative, setDerivative] = useState('')
  const [steps, setSteps] = useState([])

  const calculateDerivative = () => {
    try {
      const result = computeDerivative(expression)
      setDerivative(result.derivative)
      setSteps(result.steps)
    } catch (error) {
      alert('Error calculating derivative. Check your expression.')
    }
  }

  const computeDerivative = (expr) => {
    const steps = []
    
    // Simple polynomial derivative calculator
    const terms = expr.split('+').map(t => t.trim())
    const derivativeTerms = []

    terms.forEach(term => {
      if (term.includes('x^')) {
        const match = term.match(/(-?\d*)\*?x\^(\d+)/)
        if (match) {
          const coef = match[1] === '' || match[1] === '-' ? (match[1] === '-' ? -1 : 1) : parseInt(match[1])
          const power = parseInt(match[2])
          const newCoef = coef * power
          const newPower = power - 1
          
          steps.push(`d/dx(${coef}x^${power}) = ${newCoef}x^${newPower}`)
          
          if (newPower === 0) {
            derivativeTerms.push(`${newCoef}`)
          } else if (newPower === 1) {
            derivativeTerms.push(`${newCoef}x`)
          } else {
            derivativeTerms.push(`${newCoef}x^${newPower}`)
          }
        }
      } else if (term.includes('x')) {
        const match = term.match(/(-?\d*)\*?x/)
        if (match) {
          const coef = match[1] === '' || match[1] === '-' ? (match[1] === '-' ? -1 : 1) : parseInt(match[1])
          steps.push(`d/dx(${coef}x) = ${coef}`)
          derivativeTerms.push(`${coef}`)
        }
      } else {
        const num = parseFloat(term)
        if (!isNaN(num)) {
          steps.push(`d/dx(${num}) = 0`)
        }
      }
    })

    return {
      derivative: derivativeTerms.join(' + ').replace(/\+ -/g, '- '),
      steps
    }
  }

  const examples = [
    'x^3 + 2*x^2 - 5*x + 1',
    'x^4 - 3*x^2 + 2*x',
    '5*x^3 + x^2 - 7*x + 3'
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="h-8 w-8 text-primary" />
        <h2 className="text-2xl font-bold text-gray-900">Derivative Calculator</h2>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enter polynomial expression:
        </label>
        <input
          type="text"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          placeholder="e.g., x^3 + 2*x^2 - 5*x + 1"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary font-mono"
        />
      </div>

      <button
        onClick={calculateDerivative}
        className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all mb-6 flex items-center justify-center gap-2"
      >
        <Calculator className="h-5 w-5" />
        Calculate Derivative
      </button>

      {derivative && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Result:</h3>
            <p className="text-2xl font-mono text-primary">{derivative}</p>
          </div>

          {steps.length > 0 && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Steps:</h3>
              <div className="space-y-2">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-primary font-semibold">{index + 1}.</span>
                    <code className="text-sm font-mono">{step}</code>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      <div className="mt-6">
        <p className="text-sm font-medium text-gray-700 mb-2">Try these examples:</p>
        <div className="flex flex-wrap gap-2">
          {examples.map((ex, index) => (
            <button
              key={index}
              onClick={() => setExpression(ex)}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 font-mono"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
