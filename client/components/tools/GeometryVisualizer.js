'use client'

import { useState } from 'react'
import { Triangle, Circle as CircleIcon, Square } from 'lucide-react'

export default function GeometryVisualizer() {
  const [shape, setShape] = useState('triangle')
  const [side1, setSide1] = useState(5)
  const [side2, setSide2] = useState(5)
  const [side3, setSide3] = useState(5)
  const [radius, setRadius] = useState(5)

  const calculateTriangle = () => {
    const s = (side1 + side2 + side3) / 2
    const area = Math.sqrt(s * (s - side1) * (s - side2) * (s - side3))
    const perimeter = side1 + side2 + side3
    return { area: area.toFixed(2), perimeter: perimeter.toFixed(2) }
  }

  const calculateCircle = () => {
    const area = Math.PI * radius * radius
    const circumference = 2 * Math.PI * radius
    return { area: area.toFixed(2), circumference: circumference.toFixed(2) }
  }

  const calculateSquare = () => {
    const area = side1 * side1
    const perimeter = 4 * side1
    return { area: area.toFixed(2), perimeter: perimeter.toFixed(2) }
  }

  const renderTriangle = () => {
    const stats = calculateTriangle()
    return (
      <div className="space-y-6">
        <svg viewBox="0 0 200 200" className="w-full max-w-md mx-auto">
          <polygon
            points="100,30 30,170 170,170"
            fill="#3b82f6"
            fillOpacity="0.3"
            stroke="#3b82f6"
            strokeWidth="3"
          />
          <text x="100" y="20" textAnchor="middle" fill="#fff" fontSize="12">{side1}</text>
          <text x="50" y="180" textAnchor="middle" fill="#fff" fontSize="12">{side2}</text>
          <text x="150" y="180" textAnchor="middle" fill="#fff" fontSize="12">{side3}</text>
        </svg>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-gray-400 text-sm">Side 1</label>
            <input
              type="number"
              value={side1}
              onChange={(e) => setSide1(parseFloat(e.target.value) || 1)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm">Side 2</label>
            <input
              type="number"
              value={side2}
              onChange={(e) => setSide2(parseFloat(e.target.value) || 1)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm">Side 3</label>
            <input
              type="number"
              value={side3}
              onChange={(e) => setSide3(parseFloat(e.target.value) || 1)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm">Area</p>
            <p className="text-2xl font-bold text-blue-400">{stats.area}</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm">Perimeter</p>
            <p className="text-2xl font-bold text-green-400">{stats.perimeter}</p>
          </div>
        </div>
      </div>
    )
  }

  const renderCircle = () => {
    const stats = calculateCircle()
    return (
      <div className="space-y-6">
        <svg viewBox="0 0 200 200" className="w-full max-w-md mx-auto">
          <circle
            cx="100"
            cy="100"
            r={radius * 8}
            fill="#10b981"
            fillOpacity="0.3"
            stroke="#10b981"
            strokeWidth="3"
          />
          <line x1="100" y1="100" x2={100 + radius * 8} y2="100" stroke="#fff" strokeWidth="2" />
          <text x={100 + radius * 4} y="95" textAnchor="middle" fill="#fff" fontSize="12">r={radius}</text>
        </svg>
        
        <div>
          <label className="text-gray-400 text-sm mb-2 block">Radius: {radius}</label>
          <input
            type="range"
            min="1"
            max="10"
            value={radius}
            onChange={(e) => setRadius(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm">Area</p>
            <p className="text-2xl font-bold text-green-400">{stats.area}</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm">Circumference</p>
            <p className="text-2xl font-bold text-blue-400">{stats.circumference}</p>
          </div>
        </div>
      </div>
    )
  }

  const renderSquare = () => {
    const stats = calculateSquare()
    return (
      <div className="space-y-6">
        <svg viewBox="0 0 200 200" className="w-full max-w-md mx-auto">
          <rect
            x={100 - side1 * 5}
            y={100 - side1 * 5}
            width={side1 * 10}
            height={side1 * 10}
            fill="#f59e0b"
            fillOpacity="0.3"
            stroke="#f59e0b"
            strokeWidth="3"
          />
          <text x="100" y={100 - side1 * 5 - 10} textAnchor="middle" fill="#fff" fontSize="12">{side1}</text>
        </svg>
        
        <div>
          <label className="text-gray-400 text-sm mb-2 block">Side Length: {side1}</label>
          <input
            type="range"
            min="1"
            max="10"
            value={side1}
            onChange={(e) => setSide1(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm">Area</p>
            <p className="text-2xl font-bold text-orange-400">{stats.area}</p>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm">Perimeter</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.perimeter}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-dark-100 to-dark-200 rounded-2xl p-8 border border-primary/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
          <Triangle className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Geometry Visualizer</h2>
          <p className="text-gray-400">Interactive shapes with live calculations</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Shape Selection */}
        <div className="flex gap-3">
          <button
            onClick={() => setShape('triangle')}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              shape === 'triangle'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                : 'bg-white/5 text-gray-300'
            }`}
          >
            <Triangle className="h-5 w-5" />
            Triangle
          </button>
          <button
            onClick={() => setShape('circle')}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              shape === 'circle'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                : 'bg-white/5 text-gray-300'
            }`}
          >
            <CircleIcon className="h-5 w-5" />
            Circle
          </button>
          <button
            onClick={() => setShape('square')}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              shape === 'square'
                ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white'
                : 'bg-white/5 text-gray-300'
            }`}
          >
            <Square className="h-5 w-5" />
            Square
          </button>
        </div>

        {/* Shape Visualization */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-8">
          {shape === 'triangle' && renderTriangle()}
          {shape === 'circle' && renderCircle()}
          {shape === 'square' && renderSquare()}
        </div>

        <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
          <h4 className="text-white font-semibold mb-2">📐 Geometry Formulas:</h4>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• Triangle Area: √(s(s-a)(s-b)(s-c)) where s = (a+b+c)/2</li>
            <li>• Circle Area: πr²</li>
            <li>• Square Area: side²</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
