'use client'

import { useState } from 'react'
import { Shuffle, CheckCircle, XCircle } from 'lucide-react'

export default function PracticeGenerator() {
  const [topic, setTopic] = useState('addition')
  const [problems, setProblems] = useState([])
  const [answers, setAnswers] = useState({})
  const [checked, setChecked] = useState(false)

  const topics = {
    addition: { name: 'Addition', range: 50 },
    subtraction: { name: 'Subtraction', range: 50 },
    multiplication: { name: 'Multiplication', range: 12 },
    division: { name: 'Division', range: 12 },
    fractions: { name: 'Fractions', range: 10 },
    decimals: { name: 'Decimals', range: 10 }
  }

  const generateProblems = (count = 10) => {
    const newProblems = []
    const range = topics[topic].range

    for (let i = 0; i < count; i++) {
      let problem, answer

      switch (topic) {
        case 'addition':
          const a1 = Math.floor(Math.random() * range) + 1
          const b1 = Math.floor(Math.random() * range) + 1
          problem = `${a1} + ${b1}`
          answer = a1 + b1
          break
        case 'subtraction':
          const a2 = Math.floor(Math.random() * range) + 1
          const b2 = Math.floor(Math.random() * a2) + 1
          problem = `${a2} - ${b2}`
          answer = a2 - b2
          break
        case 'multiplication':
          const a3 = Math.floor(Math.random() * range) + 1
          const b3 = Math.floor(Math.random() * range) + 1
          problem = `${a3} × ${b3}`
          answer = a3 * b3
          break
        case 'division':
          const b4 = Math.floor(Math.random() * range) + 1
          const a4 = b4 * (Math.floor(Math.random() * range) + 1)
          problem = `${a4} ÷ ${b4}`
          answer = a4 / b4
          break
        case 'fractions':
          const n = Math.floor(Math.random() * 10) + 1
          const d = Math.floor(Math.random() * 10) + 1
          problem = `Simplify: ${n}/${d}`
          const gcd = (a, b) => b === 0 ? a : gcd(b, a % b)
          const divisor = gcd(n, d)
          answer = `${n/divisor}/${d/divisor}`
          break
        case 'decimals':
          const d1 = (Math.random() * 10).toFixed(2)
          const d2 = (Math.random() * 10).toFixed(2)
          problem = `${d1} + ${d2}`
          answer = (parseFloat(d1) + parseFloat(d2)).toFixed(2)
          break
      }

      newProblems.push({ id: i, problem, answer: answer.toString() })
    }

    setProblems(newProblems)
    setAnswers({})
    setChecked(false)
  }

  const checkAnswers = () => {
    setChecked(true)
  }

  const score = checked
    ? problems.filter(p => answers[p.id]?.toString() === p.answer).length
    : 0

  return (
    <div className="bg-gradient-to-br from-dark-100 to-dark-200 rounded-2xl p-8 border border-primary/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
          <Shuffle className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Practice Generator</h2>
          <p className="text-gray-400">Unlimited practice problems</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Topic Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Select Topic</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(topics).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setTopic(key)}
                className={`py-3 rounded-xl font-semibold transition-all ${
                  topic === key
                    ? 'bg-gradient-to-r from-primary to-secondary text-white'
                    : 'bg-white/5 text-gray-300'
                }`}
              >
                {value.name}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => generateProblems(10)}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-xl font-bold hover:opacity-90 flex items-center justify-center gap-2"
        >
          <Shuffle className="h-5 w-5" />
          Generate 10 Problems
        </button>

        {problems.length > 0 && (
          <>
            {/* Problems */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {problems.map((problem) => (
                <div
                  key={problem.id}
                  className={`bg-white/5 border rounded-xl p-4 ${
                    checked
                      ? answers[problem.id]?.toString() === problem.answer
                        ? 'border-green-500/50 bg-green-500/10'
                        : 'border-red-500/50 bg-red-500/10'
                      : 'border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 font-semibold">#{problem.id + 1}</span>
                    <span className="text-white text-lg flex-1">{problem.problem} =</span>
                    {checked && (
                      answers[problem.id]?.toString() === problem.answer ? (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-400" />
                      )
                    )}
                  </div>
                  <input
                    type="text"
                    value={answers[problem.id] || ''}
                    onChange={(e) => setAnswers({ ...answers, [problem.id]: e.target.value })}
                    disabled={checked}
                    placeholder="Your answer"
                    className="w-full mt-2 px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white disabled:opacity-50"
                  />
                  {checked && answers[problem.id]?.toString() !== problem.answer && (
                    <p className="text-green-400 text-sm mt-2">Correct: {problem.answer}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Check Button */}
            {!checked ? (
              <button
                onClick={checkAnswers}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 rounded-xl font-bold hover:opacity-90"
              >
                Check Answers
              </button>
            ) : (
              <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-6 text-center">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Score: {score}/{problems.length}
                </h3>
                <p className="text-gray-300 mb-4">
                  {Math.round((score / problems.length) * 100)}% Correct
                </p>
                <button
                  onClick={() => generateProblems(10)}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3 rounded-xl font-bold hover:opacity-90"
                >
                  Generate New Problems
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
