'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Divide, Plus, Minus, X } from 'lucide-react'

export default function FractionCalculator() {
  const [num1, setNum1] = useState(1)
  const [den1, setDen1] = useState(2)
  const [num2, setNum2] = useState(1)
  const [den2, setDen2] = useState(3)
  const [operation, setOperation] = useState('add')
  const [result, setResult] = useState(null)

  const gcd = (a, b) => b === 0 ? a : gcd(b, a % b)

  const simplify = (num, den) => {
    const divisor = gcd(Math.abs(num), Math.abs(den))
    return { num: num / divisor, den: den / divisor }
  }

  const calculate = () => {
    let resNum, resDen

    switch (operation) {
      case 'add':
        resNum = num1 * den2 + num2 * den1
        resDen = den1 * den2
        break
      case 'subtract':
        resNum = num1 * den2 - num2 * den1
        resDen = den1 * den2
        break
      case 'multiply':
        resNum = num1 * num2
        resDen = den1 * den2
        break
      case 'divide':
        resNum = num1 * den2
        resDen = den1 * num2
        break
    }

    const simplified = simplify(resNum, resDen)
    setResult(simplified)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-dark-100 to-dark rounded-2xl p-6 border border-white/10"
    >
      <div className="flex items-center gap-3 mb-6">
        <Divide className="h-8 w-8 text-secondary" />
        <h2 className="text-2xl font-bold text-white">Fraction Calculator</h2>
      </div>

      <div className="grid grid-cols-3 gap-4 items-center mb-6">
        <div className="text-center">
          <input
            type="number"
            value={num1}
            onChange={(e) => setNum1(Number(e.target.value))}
            className="w-full bg-dark-200 text-white text-center py-2 rounded-lg mb-2"
          />
          <div className="h-0.5 bg-white/30 mb-2"></div>
          <input
            type="number"
            value={den1}
            onChange={(e) => setDen1(Number(e.target.value))}
            className="w-full bg-dark-200 text-white text-center py-2 rounded-lg"
          />
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => setOperation('add')}
            className={`p-2 rounded-lg ${operation === 'add' ? 'bg-cyan-600' : 'bg-dark-200'}`}
          >
            <Plus className="h-5 w-5 text-white mx-auto" />
          </button>
          <button
            onClick={() => setOperation('subtract')}
            className={`p-2 rounded-lg ${operation === 'subtract' ? 'bg-cyan-600' : 'bg-dark-200'}`}
          >
            <Minus className="h-5 w-5 text-white mx-auto" />
          </button>
          <button
            onClick={() => setOperation('multiply')}
            className={`p-2 rounded-lg ${operation === 'multiply' ? 'bg-cyan-600' : 'bg-dark-200'}`}
          >
            <X className="h-5 w-5 text-white mx-auto" />
          </button>
          <button
            onClick={() => setOperation('divide')}
            className={`p-2 rounded-lg ${operation === 'divide' ? 'bg-cyan-600' : 'bg-dark-200'}`}
          >
            <Divide className="h-5 w-5 text-white mx-auto" />
          </button>
        </div>

        <div className="text-center">
          <input
            type="number"
            value={num2}
            onChange={(e) => setNum2(Number(e.target.value))}
            className="w-full bg-dark-200 text-white text-center py-2 rounded-lg mb-2"
          />
          <div className="h-0.5 bg-white/30 mb-2"></div>
          <input
            type="number"
            value={den2}
            onChange={(e) => setDen2(Number(e.target.value))}
            className="w-full bg-dark-200 text-white text-center py-2 rounded-lg"
          />
        </div>
      </div>

      <button
        onClick={calculate}
        className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-lg font-semibold mb-4"
      >
        Calculate
      </button>

      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black/50 rounded-xl p-6 text-center"
        >
          <div className="text-gray-400 mb-2">Result:</div>
          <div className="text-4xl font-bold text-white">
            {result.num}
          </div>
          <div className="h-1 bg-gradient-to-r from-primary to-secondary my-2"></div>
          <div className="text-4xl font-bold text-white">
            {result.den}
          </div>
          <div className="text-gray-400 mt-4">
            = {(result.num / result.den).toFixed(4)}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
