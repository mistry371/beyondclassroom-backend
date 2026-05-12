'use client'

import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'

export default function NumberLine() {
  const [value, setValue] = useState(0)
  const [range, setRange] = useState(10)
  const [showFractions, setShowFractions] = useState(false)

  const numbers = []
  const step = showFractions ? 0.5 : 1
  for (let i = -range; i <= range; i += step) {
    numbers.push(i)
  }

  return (
    <div className="bg-gradient-to-br from-dark-100 to-dark-200 rounded-2xl p-8 border border-primary/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl">
          <Minus className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Interactive Number Line</h2>
          <p className="text-gray-400">Visualize numbers and operations</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Controls */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Current Value: {value}
            </label>
            <input
              type="range"
              min={-range}
              max={range}
              step={step}
              value={value}
              onChange={(e) => setValue(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Range: ±{range}
            </label>
            <input
              type="range"
              min="5"
              max="20"
              value={range}
              onChange={(e) => setRange(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={showFractions}
            onChange={(e) => setShowFractions(e.target.checked)}
            className="w-5 h-5"
          />
          <label className="text-gray-300">Show Fractions (0.5 steps)</label>
        </div>

        {/* Number Line */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 overflow-x-auto">
          <div className="relative min-w-max">
            {/* Line */}
            <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mb-8"></div>
            
            {/* Numbers */}
            <div className="flex justify-between items-start relative" style={{ minWidth: '800px' }}>
              {numbers.map((num) => (
                <div key={num} className="flex flex-col items-center relative">
                  {/* Tick */}
                  <div
                    className={`w-0.5 bg-white absolute -top-10 ${
                      num === value ? 'h-8' : num % 5 === 0 ? 'h-6' : 'h-4'
                    }`}
                  ></div>
                  
                  {/* Marker for current value */}
                  {num === value && (
                    <div className="absolute -top-16 animate-bounce">
                      <div className="w-6 h-6 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
                    </div>
                  )}
                  
                  {/* Number label */}
                  {(num % (showFractions ? 1 : 2) === 0 || num === value) && (
                    <span
                      className={`text-sm mt-2 ${
                        num === value
                          ? 'text-primary font-bold text-lg'
                          : num === 0
                          ? 'text-white font-semibold'
                          : num > 0
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}
                    >
                      {num}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Value Display */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 rounded-xl p-6 text-center">
          <p className="text-gray-400 mb-2">Current Position</p>
          <p className="text-5xl font-bold text-primary">{value}</p>
          <p className="text-gray-300 mt-2">
            {value > 0 ? `${value} units to the right of zero` :
             value < 0 ? `${Math.abs(value)} units to the left of zero` :
             'At zero (origin)'}
          </p>
        </div>

        <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
          <h4 className="text-white font-semibold mb-2">📏 Number Line Concepts:</h4>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• Positive numbers are to the right of zero</li>
            <li>• Negative numbers are to the left of zero</li>
            <li>• Distance from zero = absolute value</li>
            <li>• Moving right = adding, moving left = subtracting</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
