'use client'

import { useState } from 'react'
import { Lightbulb, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function HintGenerator() {
  const [problem, setProblem] = useState('3x + 7 = 22')
  const [currentHint, setCurrentHint] = useState(0)
  const [showSolution, setShowSolution] = useState(false)
  const [hints, setHints] = useState(null)

  const generateHints = () => {
    try {
      const parts = problem.replace(/\s/g, '').split('=')
      if (parts.length !== 2) {
        alert('Invalid equation')
        return
      }

      const leftSide = parts[0]
      const rightValue = parseFloat(parts[1])
      const match = leftSide.match(/([+-]?\d*\.?\d*)x([+-]\d+\.?\d*)?/)
      
      if (!match) {
        alert('Please enter a linear equation')
        return
      }

      let a = match[1] === '' || match[1] === '+' ? 1 : match[1] === '-' ? -1 : parseFloat(match[1])
      let b = match[2] ? parseFloat(match[2]) : 0
      const answer = (rightValue - b) / a

      const hintsList = [
        {
          level: 'Hint 1 - Think',
          text: 'What operation would help you isolate the variable x?',
          detail: 'Look at the constant term on the left side'
        },
        {
          level: 'Hint 2 - Direction',
          text: `You need to get rid of ${b} from the left side`,
          detail: `What's the opposite operation of ${b >= 0 ? 'adding' : 'subtracting'} ${Math.abs(b)}?`
        },
        {
          level: 'Hint 3 - Action',
          text: `Subtract ${b} from both sides of the equation`,
          detail: `This gives you: ${a}x = ${rightValue - b}`
        },
        {
          level: 'Hint 4 - Final Step',
          text: `Now divide both sides by ${a}`,
          detail: `${rightValue - b} ÷ ${a} = ?`
        }
      ]

      setHints({
        list: hintsList,
        answer,
        equation: `${a}x ${b >= 0 ? '+' : ''} ${b} = ${rightValue}`
      })
      setCurrentHint(0)
      setShowSolution(false)
    } catch (error) {
      alert('Error generating hints')
    }
  }

  const nextHint = () => {
    if (currentHint < hints.list.length - 1) {
      setCurrentHint(currentHint + 1)
    }
  }

  return (
    <div className="bg-gradient-to-br from-dark-100 to-dark-200 rounded-2xl p-8 border border-primary/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
          <Lightbulb className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Hint Generator</h2>
          <p className="text-gray-400">Get progressive hints without spoilers</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Enter Problem (Linear Equation)
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="3x + 7 = 22"
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
            />
            <button
              onClick={generateHints}
              className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-semibold hover:opacity-90"
            >
              Get Hints
            </button>
          </div>
        </div>

        {hints && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Problem Display */}
            <div className="bg-black/50 rounded-xl p-6 text-center">
              <p className="text-gray-400 mb-2">Problem:</p>
              <p className="text-white text-3xl font-mono">{hints.equation}</p>
            </div>

            {/* Hints */}
            <div className="space-y-4">
              <AnimatePresence>
                {hints.list.slice(0, currentHint + 1).map((hint, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-yellow-400 mb-2">{hint.level}</h4>
                        <p className="text-white text-lg mb-2">{hint.text}</p>
                        <p className="text-gray-400">{hint.detail}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {currentHint < hints.list.length - 1 && (
                <button
                  onClick={nextHint}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-4 rounded-xl font-bold hover:opacity-90"
                >
                  Show Next Hint ({currentHint + 1}/{hints.list.length})
                </button>
              )}
              
              <button
                onClick={() => setShowSolution(!showSolution)}
                className="flex-1 bg-white/10 border border-white/20 text-white py-4 rounded-xl font-bold hover:bg-white/20 flex items-center justify-center gap-2"
              >
                {showSolution ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                {showSolution ? 'Hide' : 'Show'} Solution
              </button>
            </div>

            {/* Solution */}
            <AnimatePresence>
              {showSolution && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-green-500/10 border border-green-500/30 rounded-xl p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="h-8 w-8 text-green-400" />
                    <h4 className="text-xl font-bold text-white">Complete Solution</h4>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 mb-2">Final Answer:</p>
                    <p className="text-5xl font-bold text-green-400">x = {hints.answer}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
          <h4 className="text-white font-semibold mb-2">💡 How it works:</h4>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• Enter your math problem</li>
            <li>• Get hints one at a time</li>
            <li>• Try to solve before next hint</li>
            <li>• Reveal solution only when needed</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
