'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Calculator, Delete, Clock, ChevronDown, ChevronUp } from 'lucide-react'

export default function AdvancedCalculator() {
  const [display, setDisplay] = useState('0')
  const [expression, setExpression] = useState('')
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [isRad, setIsRad] = useState(true)
  const [justCalculated, setJustCalculated] = useState(false)
  const calcRef = useRef(null)

  // Focus the calculator div on mount so keyboard events work
  useEffect(() => {
    calcRef.current?.focus()
  }, [])

  const toAngle = (val) => isRad ? val : val * (Math.PI / 180)

  const safeEval = (expr) => {
    // Replace display symbols with JS equivalents
    let e = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/π/g, Math.PI)
      .replace(/e(?![0-9])/g, Math.E)
      .replace(/sin\(/g, isRad ? 'Math.sin(' : `Math.sin(Math.PI/180*`)
      .replace(/cos\(/g, isRad ? 'Math.cos(' : `Math.cos(Math.PI/180*`)
      .replace(/tan\(/g, isRad ? 'Math.tan(' : `Math.tan(Math.PI/180*`)
      .replace(/asin\(/g, isRad ? 'Math.asin(' : `(180/Math.PI)*Math.asin(`)
      .replace(/acos\(/g, isRad ? 'Math.acos(' : `(180/Math.PI)*Math.acos(`)
      .replace(/atan\(/g, isRad ? 'Math.atan(' : `(180/Math.PI)*Math.atan(`)
      .replace(/log\(/g, 'Math.log10(')
      .replace(/ln\(/g, 'Math.log(')
      .replace(/sqrt\(/g, 'Math.sqrt(')
      .replace(/cbrt\(/g, 'Math.cbrt(')
      .replace(/abs\(/g, 'Math.abs(')
      .replace(/\^/g, '**')
      .replace(/(\d+)!/g, (_, n) => factorial(parseInt(n)))

    // eslint-disable-next-line no-new-func
    return Function('"use strict"; return (' + e + ')')()
  }

  const factorial = (n) => {
    if (n < 0) throw new Error('Negative factorial')
    if (n > 170) return Infinity
    let r = 1
    for (let i = 2; i <= n; i++) r *= i
    return r
  }

  const append = useCallback((val) => {
    setDisplay(prev => {
      if (justCalculated && /[0-9.(]/.test(val)) {
        setJustCalculated(false)
        setExpression('')
        return val
      }
      setJustCalculated(false)
      if (prev === '0' && /^[0-9]$/.test(val)) return val
      if (prev === 'Error') return val
      return prev + val
    })
  }, [justCalculated])

  const calculate = useCallback(() => {
    try {
      const expr = display
      const result = safeEval(expr)
      const formatted = Number.isInteger(result) ? result.toString() : parseFloat(result.toFixed(10)).toString()
      setHistory(h => [{ expr, result: formatted }, ...h.slice(0, 19)])
      setExpression(expr + ' =')
      setDisplay(formatted)
      setJustCalculated(true)
    } catch {
      setDisplay('Error')
      setJustCalculated(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [display, isRad])

  const clear = () => { setDisplay('0'); setExpression(''); setJustCalculated(false) }
  const backspace = () => {
    setDisplay(prev => prev.length <= 1 || prev === 'Error' ? '0' : prev.slice(0, -1))
  }
  const toggleSign = () => {
    setDisplay(prev => prev.startsWith('-') ? prev.slice(1) : prev === '0' ? '0' : '-' + prev)
  }
  const percent = () => {
    try { setDisplay(prev => (parseFloat(prev) / 100).toString()) } catch { setDisplay('Error') }
  }

  // Keyboard handler
  const handleKeyDown = useCallback((e) => {
    const k = e.key
    if (k >= '0' && k <= '9') { e.preventDefault(); append(k) }
    else if (k === '.') { e.preventDefault(); append('.') }
    else if (k === '+') { e.preventDefault(); append('+') }
    else if (k === '-') { e.preventDefault(); append('-') }
    else if (k === '*') { e.preventDefault(); append('×') }
    else if (k === '/') { e.preventDefault(); append('÷') }
    else if (k === '^') { e.preventDefault(); append('^') }
    else if (k === '(') { e.preventDefault(); append('(') }
    else if (k === ')') { e.preventDefault(); append(')') }
    else if (k === '%') { e.preventDefault(); percent() }
    else if (k === 'Enter' || k === '=') { e.preventDefault(); calculate() }
    else if (k === 'Backspace') { e.preventDefault(); backspace() }
    else if (k === 'Escape') { e.preventDefault(); clear() }
  }, [append, calculate])

  const btn = (label, onClick, cls = '') => (
    <button
      key={label}
      onClick={onClick}
      className={`flex items-center justify-center rounded-xl font-semibold text-sm transition-all active:scale-95 hover:brightness-110 select-none ${cls}`}
    >
      {label}
    </button>
  )

  const base = 'bg-dark-200 text-white h-12'
  const op = 'bg-secondary/80 text-white h-12'
  const fn = 'bg-primary/20 text-primary h-12 text-xs'
  const eq = 'bg-gradient-to-r from-primary to-secondary text-white h-12'
  const red = 'bg-red-600/80 text-white h-12'
  const orange = 'bg-orange-500/70 text-white h-12'

  return (
    <motion.div
      ref={calcRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-dark-100 to-dark rounded-2xl p-6 border border-white/10 outline-none focus:ring-2 focus:ring-primary/40"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Calculator className="h-7 w-7 text-primary" />
          <h2 className="text-2xl font-bold text-white">Advanced Calculator</h2>
        </div>
        <div className="flex items-center gap-2">
          {/* RAD / DEG toggle */}
          <button
            onClick={() => setIsRad(r => !r)}
            className="px-3 py-1 rounded-lg text-xs font-bold border border-white/20 text-white hover:bg-white/10 transition-all"
          >
            {isRad ? 'RAD' : 'DEG'}
          </button>
          {/* History toggle */}
          <button
            onClick={() => setShowHistory(h => !h)}
            className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold border border-white/20 text-gray-300 hover:bg-white/10 transition-all"
          >
            <Clock className="h-3.5 w-3.5" />
            {showHistory ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {/* History panel */}
      {showHistory && (
        <div className="bg-black/40 rounded-xl p-3 mb-4 max-h-40 overflow-y-auto space-y-1">
          {history.length === 0 ? (
            <p className="text-gray-500 text-xs text-center py-2">No history yet</p>
          ) : history.map((h, i) => (
            <button
              key={i}
              onClick={() => { setDisplay(h.result); setJustCalculated(true) }}
              className="w-full text-right hover:bg-white/5 rounded px-2 py-1 transition-all"
            >
              <div className="text-gray-400 text-xs">{h.expr}</div>
              <div className="text-white text-sm font-bold">= {h.result}</div>
            </button>
          ))}
        </div>
      )}

      {/* Display */}
      <div className="bg-black/60 rounded-xl px-4 py-3 mb-4">
        <div className="text-gray-400 text-xs min-h-[16px] truncate">{expression}</div>
        <div className="text-white text-3xl font-bold text-right truncate mt-1">{display}</div>
        <div className="text-gray-500 text-xs text-right mt-1">Keyboard supported · Press Esc to clear</div>
      </div>

      {/* Scientific buttons */}
      <div className="grid grid-cols-5 gap-2 mb-2">
        {btn('sin', () => append('sin('), fn)}
        {btn('cos', () => append('cos('), fn)}
        {btn('tan', () => append('tan('), fn)}
        {btn('asin', () => append('asin('), fn)}
        {btn('acos', () => append('acos('), fn)}

        {btn('log', () => append('log('), fn)}
        {btn('ln', () => append('ln('), fn)}
        {btn('√', () => append('sqrt('), fn)}
        {btn('∛', () => append('cbrt('), fn)}
        {btn('|x|', () => append('abs('), fn)}

        {btn('xʸ', () => append('^'), fn)}
        {btn('x²', () => append('^2'), fn)}
        {btn('x³', () => append('^3'), fn)}
        {btn('1/x', () => setDisplay(prev => { try { return (1 / safeEval(prev)).toString() } catch { return 'Error' } }), fn)}
        {btn('n!', () => append('!'), fn)}

        {btn('π', () => append('π'), fn)}
        {btn('e', () => append('e'), fn)}
        {btn('(', () => append('('), fn)}
        {btn(')', () => append(')'), fn)}
        {btn('EXP', () => append('e+'), fn)}
      </div>

      {/* Main buttons */}
      <div className="grid grid-cols-4 gap-2">
        {btn('AC', clear, red)}
        {btn('+/-', toggleSign, orange)}
        {btn('%', percent, orange)}
        {btn('÷', () => append('÷'), op)}

        {btn('7', () => append('7'), base)}
        {btn('8', () => append('8'), base)}
        {btn('9', () => append('9'), base)}
        {btn('×', () => append('×'), op)}

        {btn('4', () => append('4'), base)}
        {btn('5', () => append('5'), base)}
        {btn('6', () => append('6'), base)}
        {btn('−', () => append('-'), op)}

        {btn('1', () => append('1'), base)}
        {btn('2', () => append('2'), base)}
        {btn('3', () => append('3'), base)}
        {btn('+', () => append('+'), op)}

        {btn('0', () => append('0'), `${base} col-span-2`)}
        {btn('.', () => append('.'), base)}
        {btn('=', calculate, eq)}

        {/* Backspace full width */}
        <button
          onClick={backspace}
          className="col-span-4 flex items-center justify-center gap-2 bg-dark-200/60 text-gray-300 h-10 rounded-xl hover:bg-dark-200 transition-all text-sm font-medium"
        >
          <Delete className="h-4 w-4" />
          Backspace
        </button>
      </div>
    </motion.div>
  )
}
