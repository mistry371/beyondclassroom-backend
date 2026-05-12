'use client'

import { useState } from 'react'
import { TrendingUp, Plus, Trash2 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function VisualGraphTool() {
  const [equations, setEquations] = useState([
    { id: 1, equation: 'y = 2x + 1', color: '#3b82f6', visible: true }
  ])
  const [newEquation, setNewEquation] = useState('')

  const generateData = (eq) => {
    const data = []
    try {
      for (let x = -10; x <= 10; x += 0.5) {
        const expr = eq.equation.split('=')[1].trim()
        const y = eval(expr.replace(/x/g, `(${x})`))
        if (isFinite(y) && Math.abs(y) < 100) {
          data.push({ x, [eq.id]: y })
        }
      }
    } catch (error) {
      console.error('Invalid equation')
    }
    return data
  }

  const mergeData = () => {
    const allX = []
    for (let x = -10; x <= 10; x += 0.5) {
      allX.push(x)
    }

    return allX.map(x => {
      const point = { x }
      equations.filter(eq => eq.visible).forEach(eq => {
        try {
          const expr = eq.equation.split('=')[1].trim()
          const y = eval(expr.replace(/x/g, `(${x})`))
          if (isFinite(y) && Math.abs(y) < 100) {
            point[eq.id] = y
          }
        } catch (error) {
          // Skip invalid equations
        }
      })
      return point
    })
  }

  const addEquation = () => {
    if (!newEquation.includes('=')) {
      alert('Equation must contain =')
      return
    }
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']
    setEquations([
      ...equations,
      {
        id: Date.now(),
        equation: newEquation,
        color: colors[equations.length % colors.length],
        visible: true
      }
    ])
    setNewEquation('')
  }

  const toggleEquation = (id) => {
    setEquations(equations.map(eq =>
      eq.id === id ? { ...eq, visible: !eq.visible } : eq
    ))
  }

  const deleteEquation = (id) => {
    setEquations(equations.filter(eq => eq.id !== id))
  }

  const data = mergeData()

  return (
    <div className="bg-gradient-to-br from-dark-100 to-dark-200 rounded-2xl p-8 border border-primary/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
          <TrendingUp className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Visual Graph Tool</h2>
          <p className="text-gray-400">Plot equations and see graphs instantly</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Add Equation */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Add Equation</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={newEquation}
              onChange={(e) => setNewEquation(e.target.value)}
              placeholder="y = 2*x + 1"
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
            />
            <button
              onClick={addEquation}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:opacity-90 flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Add
            </button>
          </div>
        </div>

        {/* Equations List */}
        <div className="space-y-2">
          {equations.map((eq) => (
            <div
              key={eq.id}
              className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-4"
            >
              <input
                type="checkbox"
                checked={eq.visible}
                onChange={() => toggleEquation(eq.id)}
                className="w-5 h-5"
              />
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: eq.color }}
              />
              <span className="flex-1 text-white font-mono">{eq.equation}</span>
              <button
                onClick={() => deleteEquation(eq.id)}
                className="p-2 hover:bg-red-500/20 rounded-lg text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Graph */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="x"
                stroke="#9ca3af"
                label={{ value: 'x', position: 'insideBottomRight', offset: -5 }}
              />
              <YAxis
                stroke="#9ca3af"
                label={{ value: 'y', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              {equations.filter(eq => eq.visible).map((eq) => (
                <Line
                  key={eq.id}
                  type="monotone"
                  dataKey={eq.id}
                  stroke={eq.color}
                  strokeWidth={2}
                  dot={false}
                  name={eq.equation}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
          <h4 className="text-white font-semibold mb-2">📊 Supported Functions:</h4>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• Linear: y = 2*x + 1</li>
            <li>• Quadratic: y = x*x - 4</li>
            <li>• Cubic: y = x*x*x</li>
            <li>• Use * for multiplication, / for division</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
