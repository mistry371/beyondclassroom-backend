'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calculator, Delete } from 'lucide-react'

export default function BasicCalculator() {
  const [display, setDisplay] = useState('0')
  const [equation, setEquation] = useState('')

  const handleNumber = (num) => {
    setDisplay(display === '0' ? num : display + num)
  }

  const handleOperator = (op) => {
    setEquation(display + ' ' + op + ' ')
    setDisplay('0')
  }

  const calculate = () => {
    try {
      const result = eval(equation + display)
      setDisplay(result.toString())
      setEquation('')
    } catch (error) {
      setDisplay('Error')
    }
  }

  const clear = () => {
    setDisplay('0')
    setEquation('')
  }

  const buttons = [
    '7', '8', '9', '÷',
    '4', '5', '6', '×',
    '1', '2', '3', '-',
    '0', '.', '=', '+'
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-dark-100 to-dark rounded-2xl p-6 border border-white/10"
    >
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="h-8 w-8 text-primary" />
        <h2 className="text-2xl font-bold text-white">Basic Calculator</h2>
      </div>

      <div className="bg-black/50 rounded-xl p-4 mb-4">
        <div className="text-gray-400 text-sm mb-1">{equation}</div>
        <div className="text-white text-4xl font-bold text-right">{display}</div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        {buttons.map((btn) => (
          <button
            key={btn}
            onClick={() => {
              if (btn === '=') calculate()
              else if (['+', '-', '×', '÷'].includes(btn)) handleOperator(btn)
              else handleNumber(btn)
            }}
            className={`py-4 rounded-xl font-bold text-xl transition-all ${
              btn === '=' 
                ? 'bg-gradient-to-r from-primary to-secondary text-white col-span-1'
                : ['+', '-', '×', '÷'].includes(btn)
                ? 'bg-secondary text-white hover:bg-secondary'
                : 'bg-dark-200 text-white hover:bg-gray-600'
            }`}
          >
            {btn}
          </button>
        ))}
      </div>

      <button
        onClick={clear}
        className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
      >
        <Delete className="h-5 w-5" />
        Clear
      </button>
    </motion.div>
  )
}
