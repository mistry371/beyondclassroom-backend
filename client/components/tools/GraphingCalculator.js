'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Calculator, Trash2, Plus } from 'lucide-react'

export default function GraphingCalculator() {
  const canvasRef = useRef(null)
  const [functions, setFunctions] = useState(['x^2', 'sin(x)'])
  const [newFunction, setNewFunction] = useState('')
  const [scale, setScale] = useState(20)

  useEffect(() => {
    drawGraph()
  }, [functions, scale])

  const drawGraph = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.fillStyle = '#f9fafb'
    ctx.fillRect(0, 0, width, height)

    // Draw grid
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1

    for (let x = 0; x < width; x += scale) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    for (let y = 0; y < height; y += scale) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Draw axes
    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 2

    ctx.beginPath()
    ctx.moveTo(0, height / 2)
    ctx.lineTo(width, height / 2)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(width / 2, 0)
    ctx.lineTo(width / 2, height)
    ctx.stroke()

    // Draw functions
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']
    
    functions.forEach((func, index) => {
      ctx.strokeStyle = colors[index % colors.length]
      ctx.lineWidth = 3
      ctx.beginPath()

      let firstPoint = true
      for (let px = 0; px < width; px++) {
        const x = (px - width / 2) / scale
        try {
          const y = evaluateFunction(func, x)
          const py = height / 2 - y * scale

          if (isFinite(y) && py >= 0 && py <= height) {
            if (firstPoint) {
              ctx.moveTo(px, py)
              firstPoint = false
            } else {
              ctx.lineTo(px, py)
            }
          } else {
            firstPoint = true
          }
        } catch (e) {
          firstPoint = true
        }
      }
      ctx.stroke()
    })
  }

  const evaluateFunction = (func, x) => {
    try {
      const sanitized = func
        .replace(/\^/g, '**')
        .replace(/sin/g, 'Math.sin')
        .replace(/cos/g, 'Math.cos')
        .replace(/tan/g, 'Math.tan')
        .replace(/sqrt/g, 'Math.sqrt')
        .replace(/log/g, 'Math.log')
        .replace(/abs/g, 'Math.abs')
      
      return eval(sanitized.replace(/x/g, `(${x})`))
    } catch (e) {
      return NaN
    }
  }

  const addFunction = () => {
    if (newFunction.trim()) {
      setFunctions([...functions, newFunction])
      setNewFunction('')
    }
  }

  const removeFunction = (index) => {
    setFunctions(functions.filter((_, i) => i !== index))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="h-8 w-8 text-primary" />
        <h2 className="text-2xl font-bold text-gray-900">Graphing Calculator</h2>
      </div>

      <div className="mb-6">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="w-full border-2 border-gray-200 rounded-lg"
        />
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newFunction}
            onChange={(e) => setNewFunction(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addFunction()}
            placeholder="Enter function (e.g., x^2, sin(x), x^3-2*x)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={addFunction}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add
          </button>
        </div>

        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Zoom:</label>
          <input
            type="range"
            min="10"
            max="50"
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm text-gray-600">{scale}x</span>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Functions:</p>
          {functions.map((func, index) => (
            <div key={index} className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][index % 5] }}
              />
              <code className="flex-1 text-sm font-mono">{func}</code>
              <button
                onClick={() => removeFunction(index)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
