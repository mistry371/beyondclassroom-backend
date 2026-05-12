'use client'

import { useState } from 'react'
import { AlertCircle, CheckCircle, XCircle, ArrowRight } from 'lucide-react'

export default function MistakeAnalyzer() {
  const [problem, setProblem] = useState('2x + 5 = 13')
  const [studentAnswer, setStudentAnswer] = useState('x = 9')
  const [analysis, setAnalysis] = useState(null)

  const analyzeMistake = () => {
    // Parse the problem
    const parts = problem.replace(/\s/g, '').split('=')
    if (parts.length !== 2) {
      alert('Invalid equation format')
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

    // Calculate correct answer
    const correctX = (rightValue - b) / a

    // Parse student answer
    const studentMatch = studentAnswer.match(/x\s*=\s*([+-]?\d+\.?\d*)/)
    if (!studentMatch) {
      alert('Invalid answer format. Use: x = number')
      return
    }
    const studentX = parseFloat(studentMatch[1])

    // Analyze the mistake
    const isCorrect = Math.abs(studentX - correctX) < 0.001
    
    let mistake = null
    let correctSteps = []
    let explanation = ''

    if (!isCorrect) {
      // Common mistakes
      if (Math.abs(studentX - (rightValue + b) / a) < 0.001) {
        mistake = 'Added instead of subtracting'
        explanation = `You added ${b} to ${rightValue} instead of subtracting it.`
      } else if (Math.abs(studentX - (rightValue - b) * a) < 0.001) {
        mistake = 'Multiplied instead of dividing'
        explanation = `You multiplied by ${a} instead of dividing.`
      } else if (Math.abs(studentX - rightValue) < 0.001) {
        mistake = 'Forgot to handle the constant term'
        explanation = `You forgot to subtract ${b} from both sides.`
      } else {
        mistake = 'Calculation error'
        explanation = 'There was an error in your calculations.'
      }

      // Show correct steps
      correctSteps = [
        { step: 'Original equation', content: `${a}x ${b >= 0 ? '+' : ''} ${b} = ${rightValue}` },
        { step: `Subtract ${b} from both sides`, content: `${a}x = ${rightValue - b}` },
        { step: `Divide both sides by ${a}`, content: `x = ${correctX}` }
      ]
    }

    setAnalysis({
      isCorrect,
      studentX,
      correctX,
      mistake,
      explanation,
      correctSteps
    })
  }

  return (
    <div className="bg-gradient-to-br from-dark-100 to-dark-200 rounded-2xl p-8 border border-primary/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl">
          <AlertCircle className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Mistake Analyzer</h2>
          <p className="text-gray-400">Find and fix your errors</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Problem</label>
          <input
            type="text"
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="2x + 5 = 13"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Your Answer</label>
          <input
            type="text"
            value={studentAnswer}
            onChange={(e) => setStudentAnswer(e.target.value)}
            placeholder="x = 9"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
          />
        </div>

        <button
          onClick={analyzeMistake}
          className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-4 rounded-xl font-bold hover:opacity-90"
        >
          Analyze My Answer
        </button>

        {analysis && (
          <div className="space-y-6">
            {/* Result */}
            <div className={`border rounded-xl p-6 ${
              analysis.isCorrect
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              <div className="flex items-center gap-3">
                {analysis.isCorrect ? (
                  <>
                    <CheckCircle className="h-8 w-8 text-green-400" />
                    <div>
                      <h3 className="text-xl font-bold text-white">Perfect! 🎉</h3>
                      <p className="text-green-400">Your answer is correct!</p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="h-8 w-8 text-red-400" />
                    <div>
                      <h3 className="text-xl font-bold text-white">Mistake Found</h3>
                      <p className="text-red-400">{analysis.mistake}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {!analysis.isCorrect && (
              <>
                {/* Error Explanation */}
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-orange-400 mb-3">What Went Wrong?</h4>
                  <p className="text-gray-300 text-lg mb-4">{analysis.explanation}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Your Answer:</p>
                      <p className="text-2xl font-bold text-red-400">x = {analysis.studentX}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Correct Answer:</p>
                      <p className="text-2xl font-bold text-green-400">x = {analysis.correctX}</p>
                    </div>
                  </div>
                </div>

                {/* Correct Steps */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <ArrowRight className="h-5 w-5 text-primary" />
                    Correct Solution Steps
                  </h4>
                  <div className="space-y-3">
                    {analysis.correctSteps.map((step, index) => (
                      <div key={index} className="flex items-start gap-3 bg-black/30 p-4 rounded-lg">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-primary font-semibold">{step.step}</p>
                          <p className="text-white text-xl font-mono">{step.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
          <h4 className="text-white font-semibold mb-2">💡 How to use:</h4>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• Enter the problem you're solving</li>
            <li>• Enter your answer</li>
            <li>• Click "Analyze" to find mistakes</li>
            <li>• Learn from the correct solution</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
