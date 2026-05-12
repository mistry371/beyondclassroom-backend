'use client'

import { useState } from 'react'
import { Code, ArrowRight } from 'lucide-react'

export default function EquationBuilder() {
  const [wordProblem, setWordProblem] = useState('')
  const [equation, setEquation] = useState(null)

  const problems = [
    {
      text: 'John has 5 apples. Mary gives him 3 more. How many does he have now?',
      equation: 'x = 5 + 3',
      solution: '8 apples',
      steps: ['Let x = total apples', 'x = starting apples + new apples', 'x = 5 + 3 = 8']
    },
    {
      text: 'A number multiplied by 3 equals 15. What is the number?',
      equation: '3x = 15',
      solution: 'x = 5',
      steps: ['Let x = unknown number', '3 times x equals 15', '3x = 15', 'x = 15 ÷ 3 = 5']
    },
    {
      text: 'Sarah has ₹100. She spends ₹35. How much is left?',
      equation: 'x = 100 - 35',
      solution: '₹65',
      steps: ['Let x = money left', 'x = starting money - spent', 'x = 100 - 35 = 65']
    },
    {
      text: 'A rectangle length is twice its width. Width is 5cm. Find length.',
      equation: 'L = 2 × 5',
      solution: '10 cm',
      steps: ['Let L = length', 'Length = 2 × width', 'L = 2 × 5 = 10']
    },
    {
      text: 'Total cost of 4 pens is ₹80. Find cost of one pen.',
      equation: '4x = 80',
      solution: 'x = ₹20',
      steps: ['Let x = cost of one pen', '4 pens cost ₹80', '4x = 80', 'x = 80 ÷ 4 = 20']
    }
  ]

  const [selectedProblem, setSelectedProblem] = useState(problems[0])

  return (
    <div className="bg-gradient-to-br from-dark-100 to-dark-200 rounded-2xl p-8 border border-primary/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl">
          <Code className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Equation Builder</h2>
          <p className="text-gray-400">Convert word problems to equations</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Problem Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select a Word Problem
          </label>
          <div className="space-y-2">
            {problems.map((problem, index) => (
              <button
                key={index}
                onClick={() => setSelectedProblem(problem)}
                className={`w-full text-left p-4 rounded-xl transition-all ${
                  selectedProblem === problem
                    ? 'bg-gradient-to-r from-primary/20 to-secondary/20 border-2 border-primary'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                <p className="text-white">{problem.text}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Solution */}
        {selectedProblem && (
          <div className="space-y-4">
            {/* Word Problem */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
              <h3 className="text-lg font-bold text-blue-400 mb-2">Word Problem</h3>
              <p className="text-white text-lg">{selectedProblem.text}</p>
            </div>

            {/* Steps */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-primary" />
                Translation Steps
              </h3>
              <div className="space-y-3">
                {selectedProblem.steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-gray-300 pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Equation */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
              <h3 className="text-lg font-bold text-green-400 mb-3">Mathematical Equation</h3>
              <div className="bg-black/30 rounded-lg p-4 text-center">
                <p className="text-3xl font-mono text-white">{selectedProblem.equation}</p>
              </div>
            </div>

            {/* Answer */}
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
              <h3 className="text-lg font-bold text-purple-400 mb-3">Final Answer</h3>
              <p className="text-2xl font-bold text-white text-center">{selectedProblem.solution}</p>
            </div>
          </div>
        )}

        <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
          <h4 className="text-white font-semibold mb-2">💡 Tips for Word Problems:</h4>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• Read the problem carefully</li>
            <li>• Identify what you need to find (use x)</li>
            <li>• Look for keywords: "total" = add, "left" = subtract</li>
            <li>• Write the equation step by step</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
