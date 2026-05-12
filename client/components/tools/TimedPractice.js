'use client'

import { useState, useEffect } from 'react'
import { Timer, Play, Pause, RotateCcw, Trophy } from 'lucide-react'

export default function TimedPractice() {
  const [difficulty, setDifficulty] = useState('easy')
  const [timeLimit, setTimeLimit] = useState(60)
  const [isActive, setIsActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [currentProblem, setCurrentProblem] = useState(null)
  const [answer, setAnswer] = useState('')
  const [score, setScore] = useState(0)
  const [attempted, setAttempted] = useState(0)

  useEffect(() => {
    let interval = null
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setIsActive(false)
    }
    return () => clearInterval(interval)
  }, [isActive, timeLeft])

  const generateProblem = () => {
    let problem, correctAnswer
    
    if (difficulty === 'easy') {
      const a = Math.floor(Math.random() * 20) + 1
      const b = Math.floor(Math.random() * 20) + 1
      const op = ['+', '-'][Math.floor(Math.random() * 2)]
      problem = `${a} ${op} ${b}`
      correctAnswer = op === '+' ? a + b : a - b
    } else if (difficulty === 'medium') {
      const a = Math.floor(Math.random() * 12) + 1
      const b = Math.floor(Math.random() * 12) + 1
      problem = `${a} × ${b}`
      correctAnswer = a * b
    } else {
      const a = Math.floor(Math.random() * 10) + 1
      const b = Math.floor(Math.random() * 10) + 1
      const c = Math.floor(Math.random() * 20) + 1
      problem = `${a}x + ${b} = ${c}`
      correctAnswer = ((c - b) / a).toFixed(2)
    }

    return { problem, correctAnswer }
  }

  const startPractice = () => {
    setIsActive(true)
    setTimeLeft(timeLimit)
    setScore(0)
    setAttempted(0)
    setCurrentProblem(generateProblem())
    setAnswer('')
  }

  const checkAnswer = () => {
    if (!currentProblem) return

    const userAnswer = parseFloat(answer)
    const correct = Math.abs(userAnswer - currentProblem.correctAnswer) < 0.01

    if (correct) {
      setScore(score + 1)
    }
    setAttempted(attempted + 1)
    setCurrentProblem(generateProblem())
    setAnswer('')
  }

  const reset = () => {
    setIsActive(false)
    setTimeLeft(timeLimit)
    setScore(0)
    setAttempted(0)
    setCurrentProblem(null)
    setAnswer('')
  }

  return (
    <div className="bg-gradient-to-br from-dark-100 to-dark-200 rounded-2xl p-8 border border-primary/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
          <Timer className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Timed Practice Trainer</h2>
          <p className="text-gray-400">Improve speed and accuracy</p>
        </div>
      </div>

      {!isActive && !currentProblem && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
            <div className="grid grid-cols-3 gap-3">
              {['easy', 'medium', 'hard'].map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`py-3 rounded-xl font-semibold capitalize transition-all ${
                    difficulty === level
                      ? 'bg-gradient-to-r from-primary to-secondary text-white'
                      : 'bg-white/5 text-gray-300'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Time Limit: {timeLimit} seconds
            </label>
            <input
              type="range"
              min="30"
              max="300"
              step="30"
              value={timeLimit}
              onChange={(e) => setTimeLimit(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <button
            onClick={startPractice}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-bold hover:opacity-90 flex items-center justify-center gap-2"
          >
            <Play className="h-5 w-5" />
            Start Practice
          </button>
        </div>
      )}

      {currentProblem && (
        <div className="space-y-6">
          {/* Timer */}
          <div className="bg-black/50 rounded-xl p-6 text-center">
            <div className="text-6xl font-bold text-orange-400 mb-2">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 mt-4">
              <div
                className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all"
                style={{ width: `${(timeLeft / timeLimit) * 100}%` }}
              />
            </div>
          </div>

          {/* Score */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
              <p className="text-gray-400 text-sm">Correct</p>
              <p className="text-3xl font-bold text-green-400">{score}</p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
              <p className="text-gray-400 text-sm">Attempted</p>
              <p className="text-3xl font-bold text-blue-400">{attempted}</p>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 text-center">
              <p className="text-gray-400 text-sm">Accuracy</p>
              <p className="text-3xl font-bold text-purple-400">
                {attempted > 0 ? Math.round((score / attempted) * 100) : 0}%
              </p>
            </div>
          </div>

          {/* Problem */}
          {isActive && (
            <>
              <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                <p className="text-4xl font-bold text-white mb-6">{currentProblem.problem}</p>
                <input
                  type="number"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                  placeholder="Your answer"
                  className="w-full max-w-xs px-6 py-4 bg-black/30 border border-white/20 rounded-xl text-white text-2xl text-center"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={checkAnswer}
                  disabled={!answer}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-xl font-bold hover:opacity-90 disabled:opacity-50"
                >
                  Submit Answer
                </button>
                <button
                  onClick={reset}
                  className="px-6 py-4 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
            </>
          )}

          {!isActive && timeLeft === 0 && (
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-8 text-center">
              <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Time's Up!</h3>
              <p className="text-gray-300 mb-4">
                You solved {score} out of {attempted} problems correctly
              </p>
              <button
                onClick={reset}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-xl font-bold hover:opacity-90"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
