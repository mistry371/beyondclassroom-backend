'use client'

import { useState } from 'react'
import { Calculator, ArrowRight, CheckCircle } from 'lucide-react'

export default function StepByStepSolver() {
  const [equation, setEquation] = useState('')
  const [steps, setSteps] = useState([])
  const [solution, setSolution] = useState(null)

  const solveEquation = () => {
    try {
      // Parse linear equation: ax + b = c
      const parts = equation.replace(/\s/g, '').split('=')
      if (parts.length !== 2) {
        alert('Please enter a valid equation (e.g., 2x + 5 = 13)')
        return
      }

      const leftSide = parts[0]
      const rightValue = parseFloat(parts[1])

      // Extract coefficient and constant from left side
      const match = leftSide.match(/([+-]?\d*\.?\d*)x([+-]\d+\.?\d*)?/)
      if (!match) {
        alert('Please enter a linear equation in the form: ax + b = c')
        return
      }

      let a = match[1] === '' || match[1] === '+' ? 1 : match[1] === '-' ? -1 : parseFloat(match[1])
      let b = match[2] ? parseFloat(match[2]) : 0

      const stepsList = []
      
      // Step 1: Show original equation
      stepsList.push({
        step: 'Original Equation',
        equation: `${a}x ${b >= 0 ? '+' : ''} ${b} = ${rightValue}`,
        explanation: 'This is our starting equation'
      })

      // Step 2: Move constant to right side
      if (b !== 0) {
        const newRight = rightValue - b
        stepsList.push({
          step: `Subtract ${b} from both sides`,
          equation: `${a}x = ${newRight}`,
          explanation: `${rightValue} - (${b}) = ${newRight}`
        })
        
        // Step 3: Divide by coefficient
        const x = newRight / a
        stepsList.push({
          step: `Divide both sides by ${a}`,
          equation: `x = ${x}`,
          explanation: `${newRight} ÷ ${a} = ${x}`
        })
        
        setSolution(x)
      } else {
        // No constant, just divide
        const x = rightValue / a
        stepsList.push({
          step: `Divide both sides by ${a}`,
          equation: `x = ${x}`,
          explanation: `${rightValue} ÷ ${a} = ${x}`
        })
        
        setSolution(x)
      }

      setSteps(stepsList)
    } catch (error) {
      alert('Error solving equation. Please check your input.')
    }
  }

  return (
    <div className="bg-gradient-to-br from-dark-100 to-dark-200 rounded-2xl p-8 border border-primary/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-primary to-secondary rounded-xl">
          <Calculator className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Step-by-Step Problem Solver</h2>
          <p className="text-gray-400">See every step of the solution process</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Enter Linear Equation (e.g., 2x + 5 = 13)
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={equation}
              onChange={(e) => setEquation(e.target.value)}
              placeholder="2x + 5 = 13"
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button
              onClick={solveEquation}
              className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:opacity-90 transition-all"
            >
              Solve
            </button>
          </div>
        </div>

        {steps.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-primary" />
              Solution Steps
            </h3>
            
            {steps.map((step, index) => (
              <div
                key={index}
                className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-primary/30 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-primary mb-2">{step.step}</h4>
                    <div className="text-2xl font-mono text-white mb-2">{step.equation}</div>
                    <p className="text-gray-400">{step.explanation}</p>
                  </div>
                </div>
              </div>
            ))}

            {solution !== null && (
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                  <div>
                    <h4 className="text-xl font-bold text-white">Final Answer</h4>
                    <p className="text-3xl font-bold text-green-400 mt-2">x = {solution}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
          <h4 className="text-white font-semibold mb-2">💡 How to use:</h4>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• Enter a linear equation in the form: ax + b = c</li>
            <li>• Example: 2x + 5 = 13 or 3x - 7 = 8</li>
            <li>• Click "Solve" to see step-by-step solution</li>
            <li>• Each step shows the reasoning behind the calculation</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
