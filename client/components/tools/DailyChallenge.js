'use client'

import { useState, useEffect } from 'react'
import { Trophy, Calendar, Star } from 'lucide-react'

export default function DailyChallenge() {
  const [challenge, setChallenge] = useState(null)
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState(null)
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    generateDailyChallenge()
    const savedStreak = localStorage.getItem('mathStreak')
    if (savedStreak) setStreak(parseInt(savedStreak))
  }, [])

  const generateDailyChallenge = () => {
    const date = new Date()
    const seed = date.getDate() + date.getMonth() * 31
    
    const challenges = [
      {
        type: 'algebra',
        problem: 'Solve: 3x + 7 = 22',
        answer: '5',
        hint: 'Subtract 7 from both sides, then divide by 3',
        difficulty: 'Medium'
      },
      {
        type: 'geometry',
        problem: 'A circle has radius 7cm. Find its area (use π = 3.14)',
        answer: '153.86',
        hint: 'Area = πr²',
        difficulty: 'Easy'
      },
      {
        type: 'arithmetic',
        problem: 'Calculate: 15% of 240',
        answer: '36',
        hint: '15% = 15/100, multiply by 240',
        difficulty: 'Easy'
      },
      {
        type: 'word-problem',
        problem: 'A train travels 120 km in 2 hours. What is its speed in km/h?',
        answer: '60',
        hint: 'Speed = Distance ÷ Time',
        difficulty: 'Medium'
      },
      {
        type: 'logic',
        problem: 'If 2x + 3 = 11, what is the value of 4x?',
        answer: '16',
        hint: 'First find x, then multiply by 4',
        difficulty: 'Hard'
      }
    ]

    const todayChallenge = challenges[seed % challenges.length]
    setChallenge(todayChallenge)
    setResult(null)
    setAnswer('')
  }

  const checkAnswer = () => {
    if (!challenge) return

    const userAnswer = answer.trim()
    const isCorrect = Math.abs(parseFloat(userAnswer) - parseFloat(challenge.answer)) < 0.1

    if (isCorrect) {
      const newStreak = streak + 1
      setStreak(newStreak)
      localStorage.setItem('mathStreak', newStreak.toString())
      setResult({ correct: true, message: 'Excellent! You solved today\'s challenge! 🎉' })
    } else {
      setResult({ correct: false, message: 'Not quite right. Try again!' })
    }
  }

  if (!challenge) return null

  return (
    <div className="bg-gradient-to-br from-dark-100 to-dark-200 rounded-2xl p-8 border border-primary/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Daily Challenge</h2>
            <p className="text-gray-400">Solve today's problem</p>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-2 text-yellow-400">
            <Star className="h-5 w-5 fill-current" />
            <span className="text-2xl font-bold">{streak}</span>
          </div>
          <p className="text-gray-400 text-sm">Day Streak</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Challenge Info */}
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-yellow-400" />
              <span className="text-yellow-400 font-semibold">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              challenge.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
              challenge.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {challenge.difficulty}
            </span>
          </div>

          <div className="bg-black/30 rounded-lg p-6 mb-4">
            <p className="text-white text-xl text-center">{challenge.problem}</p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-blue-400 text-sm">💡 Hint: {challenge.hint}</p>
          </div>
        </div>

        {/* Answer Input */}
        {!result?.correct && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Your Answer</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                placeholder="Enter your answer"
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
              />
              <button
                onClick={checkAnswer}
                className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-semibold hover:opacity-90"
              >
                Submit
              </button>
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={`border rounded-xl p-6 ${
            result.correct
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            <p className={`text-lg font-semibold ${
              result.correct ? 'text-green-400' : 'text-red-400'
            }`}>
              {result.message}
            </p>
            {result.correct && (
              <div className="mt-4 text-center">
                <p className="text-gray-300 mb-2">Correct Answer: {challenge.answer}</p>
                <p className="text-yellow-400 font-semibold">Come back tomorrow for a new challenge!</p>
              </div>
            )}
            {!result.correct && (
              <button
                onClick={() => setResult(null)}
                className="mt-4 px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
              >
                Try Again
              </button>
            )}
          </div>
        )}

        <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
          <h4 className="text-white font-semibold mb-2">🏆 Challenge Rules:</h4>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• New challenge every day</li>
            <li>• Build your streak by solving daily</li>
            <li>• Use hints if you're stuck</li>
            <li>• Come back tomorrow for more!</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
