'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calculator, ArrowRight, CheckCircle, Lightbulb, BookOpen } from 'lucide-react'

export default function QuadraticSolverEnhanced() {
  const [a, setA] = useState(1)
  const [b, setB] = useState(-5)
  const [c, setC] = useState(6)
  const [result, setResult] = useState(null)
  const [showSteps, setShowSteps] = useState(true)
  const [showHints, setShowHints] = useState(false)

  const solve = () => {
    const discriminant = b * b - 4 * a * c
    const steps = []
    
    // Step 1: Show equation
    steps.push({
      title: 'Original Equation',
      content: `${a}x² ${b >= 0 ? '+' : ''} ${b}x ${c >= 0 ? '+' : ''} ${c} = 0`,
      explanation: 'This is a quadratic equation in standard form ax² + bx + c = 0'
    })

    // Step 2: Identify coefficients
    steps.push({
      title: 'Identify Coefficients',
      content: `a = ${a}, b = ${b}, c = ${c}`,
      explanation: 'These are the coefficients we\'ll use in the quadratic formula'
    })

    // Step 3: Calculate discriminant
    steps.push({
      title: 'Calculate Discriminant',
      content: `Δ = b² - 4ac = (${b})² - 4(${a})(${c}) = ${b*b} - ${4*a*c} = ${discriminant}`,
      explanation: 'The discriminant tells us the nature of roots'
    })

    let roots = {}
    
    if (discriminant > 0) {
      // Two real roots
      const sqrtD = Math.sqrt(discriminant)
      const root1 = (-b + sqrtD) / (2 * a)
      const root2 = (-b - sqrtD) / (2 * a)
      
      steps.push({
        title: 'Apply Quadratic Formula',
        content: `x = (-b ± √Δ) / 2a = (${-b} ± √${discriminant}) / ${2*a}`,
        explanation: 'Since Δ > 0, we have two distinct real roots'
      })

      steps.push({
        title: 'Calculate Root 1',
        content: `x₁ = (${-b} + ${sqrtD.toFixed(2)}) / ${2*a} = ${root1.toFixed(4)}`,
        explanation: 'Using the positive square root'
      })

      steps.push({
        title: 'Calculate Root 2',
        content: `x₂ = (${-b} - ${sqrtD.toFixed(2)}) / ${2*a} = ${root2.toFixed(4)}`,
        explanation: 'Using the negative square root'
      })

      roots = {
        type: 'real',
        root1: root1.toFixed(4),
        root2: root2.toFixed(4),
        discriminant,
        message: 'Two distinct real roots'
      }
    } else if (discriminant === 0) {
      // One repeated root
      const root = -b / (2 * a)
      
      steps.push({
        title: 'Apply Quadratic Formula',
        content: `x = -b / 2a = ${-b} / ${2*a} = ${root.toFixed(4)}`,
        explanation: 'Since Δ = 0, we have one repeated root'
      })

      roots = {
        type: 'equal',
        root: root.toFixed(4),
        discriminant,
        message: 'One repeated real root'
      }
    } else {
      // Complex roots
      const realPart = -b / (2 * a)
      const imagPart = Math.sqrt(-discriminant) / (2 * a)
      
      steps.push({
        title: 'Apply Quadratic Formula',
        content: `x = (-b ± √Δ) / 2a = (${-b} ± √${discriminant}) / ${2*a}`,
        explanation: 'Since Δ < 0, we have complex roots'
      })

      steps.push({
        title: 'Simplify Complex Roots',
        content: `x = ${realPart.toFixed(4)} ± ${imagPart.toFixed(4)}i`,
        explanation: 'Complex roots come in conjugate pairs'
      })

      roots = {
        type: 'complex',
        realPart: realPart.toFixed(4),
        imagPart: imagPart.toFixed(4),
        discriminant,
        message: 'Two complex conjugate roots'
      }
    }

    setResult({ steps, roots })
  }

  const hints = [
    "Start by identifying the coefficients a, b, and c",
    "Calculate the discriminant: b² - 4ac",
    "If discriminant > 0: two real roots",
    "If discriminant = 0: one repeated root",
    "If discriminant < 0: complex roots",
    "Use the quadratic formula: x = (-b ± √Δ) / 2a"
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-dark-100 to-dark-200 rounded-2xl p-8 border border-primary/20"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
            <Calculator className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Enhanced Quadratic Solver</h2>
            <p className="text-gray-400">With step-by-step solution</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowHints(!showHints)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              showHints ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/5 text-gray-400'
            }`}
          >
            <Lightbulb className="h-5 w-5" />
          </button>
          <button
            onClick={() => setShowSteps(!showSteps)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              showSteps ? 'bg-primary/20 text-primary' : 'bg-white/5 text-gray-400'
            }`}
          >
            <BookOpen className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Hints Panel */}
      <AnimatePresence>
        {showHints && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6"
          >
            <h3 className="text-yellow-400 font-semibold mb-3 flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Solving Hints
            </h3>
            <ul className="space-y-2">
              {hints.map((hint, index) => (
                <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                  <span className="text-yellow-400 font-bold">{index + 1}.</span>
                  {hint}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Equation Display */}
      <div className="bg-black/50 rounded-xl p-6 mb-6 text-center">
        <div className="text-white text-3xl font-mono">
          <span className="text-orange-400">{a}</span>x² 
          <span className="text-orange-400"> {b >= 0 ? '+' : ''} {b}</span>x 
          <span className="text-orange-400"> {c >= 0 ? '+' : ''} {c}</span> = 0
        </div>
      </div>

      {/* Input Fields */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <label className="text-gray-300 text-sm mb-2 block font-medium">Coefficient a (x²)</label>
          <input
            type="number"
            value={a}
            onChange={(e) => setA(Number(e.target.value))}
            className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl text-center focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div>
          <label className="text-gray-300 text-sm mb-2 block font-medium">Coefficient b (x)</label>
          <input
            type="number"
            value={b}
            onChange={(e) => setB(Number(e.target.value))}
            className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl text-center focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div>
          <label className="text-gray-300 text-sm mb-2 block font-medium">Constant c</label>
          <input
            type="number"
            value={c}
            onChange={(e) => setC(Number(e.target.value))}
            className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl text-center focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      <button
        onClick={solve}
        className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-all mb-6"
      >
        Solve with Steps
      </button>

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Step-by-Step Solution */}
          {showSteps && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-primary" />
                Step-by-Step Solution
              </h3>
              
              {result.steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-primary mb-2">{step.title}</h4>
                      <div className="text-xl font-mono text-white mb-2 bg-black/30 p-3 rounded-lg">
                        {step.content}
                      </div>
                      <p className="text-gray-400 text-sm">{step.explanation}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Final Answer */}
          <div className={`border rounded-xl p-6 ${
            result.roots.type === 'complex' 
              ? 'bg-purple-500/10 border-purple-500/30'
              : 'bg-green-500/10 border-green-500/30'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className={`h-8 w-8 ${
                result.roots.type === 'complex' ? 'text-purple-400' : 'text-green-400'
              }`} />
              <div>
                <h4 className="text-xl font-bold text-white">Final Answer</h4>
                <p className="text-gray-400 text-sm">{result.roots.message}</p>
              </div>
            </div>

            <div className="space-y-3">
              {result.roots.type === 'real' && (
                <>
                  <div className="text-white">
                    <span className="text-gray-400">Root 1 (x₁):</span>
                    <span className="text-3xl font-bold ml-3 text-green-400">{result.roots.root1}</span>
                  </div>
                  <div className="text-white">
                    <span className="text-gray-400">Root 2 (x₂):</span>
                    <span className="text-3xl font-bold ml-3 text-green-400">{result.roots.root2}</span>
                  </div>
                </>
              )}

              {result.roots.type === 'equal' && (
                <div className="text-white">
                  <span className="text-gray-400">Repeated Root (x):</span>
                  <span className="text-3xl font-bold ml-3 text-green-400">{result.roots.root}</span>
                </div>
              )}

              {result.roots.type === 'complex' && (
                <>
                  <div className="text-white">
                    <span className="text-gray-400">Root 1 (x₁):</span>
                    <span className="text-2xl font-bold ml-3 text-purple-400">
                      {result.roots.realPart} + {result.roots.imagPart}i
                    </span>
                  </div>
                  <div className="text-white">
                    <span className="text-gray-400">Root 2 (x₂):</span>
                    <span className="text-2xl font-bold ml-3 text-purple-400">
                      {result.roots.realPart} - {result.roots.imagPart}i
                    </span>
                  </div>
                </>
              )}

              <div className="pt-3 border-t border-white/10">
                <span className="text-gray-400 text-sm">Discriminant (Δ):</span>
                <span className="text-white font-semibold ml-2">{result.roots.discriminant}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-primary/10 border border-primary/30 rounded-xl p-4">
        <h4 className="text-white font-semibold mb-2">📚 Quadratic Formula</h4>
        <div className="text-gray-300 text-sm space-y-1">
          <p>For equation ax² + bx + c = 0:</p>
          <p className="font-mono text-primary">x = (-b ± √(b² - 4ac)) / 2a</p>
          <p className="mt-2">Where Δ = b² - 4ac (discriminant)</p>
        </div>
      </div>
    </motion.div>
  )
}
