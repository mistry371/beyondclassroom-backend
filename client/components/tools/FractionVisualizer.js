'use client'

import { useState } from 'react'
import { PieChart, Divide } from 'lucide-react'

export default function FractionVisualizer() {
  const [numerator, setNumerator] = useState(3)
  const [denominator, setDenominator] = useState(8)
  const [viewMode, setViewMode] = useState('pie')

  const renderPieChart = () => {
    const filled = Math.min(numerator, denominator)
    const slices = []
    const anglePerSlice = 360 / denominator

    for (let i = 0; i < denominator; i++) {
      const startAngle = i * anglePerSlice - 90
      const endAngle = (i + 1) * anglePerSlice - 90
      const isFilled = i < filled

      const x1 = 50 + 45 * Math.cos((startAngle * Math.PI) / 180)
      const y1 = 50 + 45 * Math.sin((startAngle * Math.PI) / 180)
      const x2 = 50 + 45 * Math.cos((endAngle * Math.PI) / 180)
      const y2 = 50 + 45 * Math.sin((endAngle * Math.PI) / 180)

      const largeArc = anglePerSlice > 180 ? 1 : 0

      slices.push(
        <path
          key={i}
          d={`M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z`}
          fill={isFilled ? '#3b82f6' : '#1f2937'}
          stroke="#fff"
          strokeWidth="0.5"
        />
      )
    }

    return (
      <svg viewBox="0 0 100 100" className="w-full max-w-md mx-auto">
        {slices}
      </svg>
    )
  }

  const renderBarChart = () => {
    const bars = []
    const barWidth = 80 / denominator

    for (let i = 0; i < denominator; i++) {
      const isFilled = i < numerator
      bars.push(
        <rect
          key={i}
          x={10 + i * barWidth}
          y="20"
          width={barWidth - 1}
          height="60"
          fill={isFilled ? '#3b82f6' : '#1f2937'}
          stroke="#fff"
          strokeWidth="0.5"
        />
      )
    }

    return (
      <svg viewBox="0 0 100 100" className="w-full max-w-2xl mx-auto">
        {bars}
      </svg>
    )
  }

  const simplify = () => {
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b)
    const divisor = gcd(numerator, denominator)
    return {
      num: numerator / divisor,
      den: denominator / divisor
    }
  }

  const simplified = simplify()
  const decimal = (numerator / denominator).toFixed(4)
  const percentage = ((numerator / denominator) * 100).toFixed(2)

  return (
    <div className="bg-gradient-to-br from-dark-100 to-dark-200 rounded-2xl p-8 border border-primary/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
          <PieChart className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Fraction Visualizer</h2>
          <p className="text-gray-400">See fractions as visual diagrams</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Fraction Display */}
        <div className="bg-black/50 rounded-xl p-8 text-center">
          <div className="inline-flex flex-col items-center">
            <span className="text-6xl font-bold text-blue-400">{numerator}</span>
            <div className="w-full h-1 bg-white my-2"></div>
            <span className="text-6xl font-bold text-blue-400">{denominator}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Numerator (Top)
            </label>
            <input
              type="number"
              value={numerator}
              onChange={(e) => setNumerator(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-center"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Denominator (Bottom)
            </label>
            <input
              type="number"
              value={denominator}
              onChange={(e) => setDenominator(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-center"
            />
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-3">
          <button
            onClick={() => setViewMode('pie')}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              viewMode === 'pie'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-white/5 text-gray-300'
            }`}
          >
            Pie Chart
          </button>
          <button
            onClick={() => setViewMode('bar')}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              viewMode === 'bar'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-white/5 text-gray-300'
            }`}
          >
            Bar Chart
          </button>
        </div>

        {/* Visualization */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-8">
          {viewMode === 'pie' ? renderPieChart() : renderBarChart()}
        </div>

        {/* Information */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm mb-1">Simplified</p>
            <p className="text-2xl font-bold text-blue-400">
              {simplified.num}/{simplified.den}
            </p>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm mb-1">Decimal</p>
            <p className="text-2xl font-bold text-green-400">{decimal}</p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm mb-1">Percentage</p>
            <p className="text-2xl font-bold text-purple-400">{percentage}%</p>
          </div>
        </div>

        <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
          <h4 className="text-white font-semibold mb-2">🍕 Understanding Fractions:</h4>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• Blue parts = numerator (parts you have)</li>
            <li>• Total parts = denominator (whole divided into)</li>
            <li>• {numerator}/{denominator} means {numerator} out of {denominator} parts</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
