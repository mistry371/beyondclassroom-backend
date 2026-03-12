'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Box } from 'lucide-react'

export default function VolumeCalculator() {
  const [shape, setShape] = useState('cube')
  const [dimension1, setDimension1] = useState('5')
  const [dimension2, setDimension2] = useState('4')
  const [dimension3, setDimension3] = useState('3')
  const [result, setResult] = useState(null)

  const calculate = () => {
    const d1 = parseFloat(dimension1)
    const d2 = parseFloat(dimension2)
    const d3 = parseFloat(dimension3)

    let volume, surfaceArea, formula

    switch (shape) {
      case 'cube':
        volume = Math.pow(d1, 3)
        surfaceArea = 6 * Math.pow(d1, 2)
        formula = `V = a³ = ${d1}³`
        break
      case 'cuboid':
        volume = d1 * d2 * d3
        surfaceArea = 2 * (d1 * d2 + d2 * d3 + d3 * d1)
        formula = `V = l×w×h = ${d1}×${d2}×${d3}`
        break
      case 'sphere':
        volume = (4 / 3) * Math.PI * Math.pow(d1, 3)
        surfaceArea = 4 * Math.PI * Math.pow(d1, 2)
        formula = `V = (4/3)πr³ = (4/3)π×${d1}³`
        break
      case 'cylinder':
        volume = Math.PI * Math.pow(d1, 2) * d2
        surfaceArea = 2 * Math.PI * d1 * (d1 + d2)
        formula = `V = πr²h = π×${d1}²×${d2}`
        break
      case 'cone':
        volume = (1 / 3) * Math.PI * Math.pow(d1, 2) * d2
        surfaceArea = Math.PI * d1 * (d1 + Math.sqrt(Math.pow(d2, 2) + Math.pow(d1, 2)))
        formula = `V = (1/3)πr²h = (1/3)π×${d1}²×${d2}`
        break
      default:
        volume = 0
        surfaceArea = 0
        formula = ''
    }

    setResult({
      volume: volume.toFixed(4),
      surfaceArea: surfaceArea.toFixed(4),
      formula: formula,
      unit: 'cubic units'
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-dark-100 to-dark rounded-2xl p-6 border border-white/10"
    >
      <div className="flex items-center gap-3 mb-6">
        <Box className="h-8 w-8 text-primary" />
        <h2 className="text-2xl font-bold text-white">Volume Calculator</h2>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="text-gray-400 text-sm mb-2 block">Select Shape</label>
          <select
            value={shape}
            onChange={(e) => setShape(e.target.value)}
            className="w-full bg-dark-200 text-white px-4 py-3 rounded-lg"
          >
            <option value="cube">Cube</option>
            <option value="cuboid">Cuboid (Rectangular Prism)</option>
            <option value="sphere">Sphere</option>
            <option value="cylinder">Cylinder</option>
            <option value="cone">Cone</option>
          </select>
        </div>

        {shape === 'cube' && (
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Side (a)</label>
            <input
              type="number"
              value={dimension1}
              onChange={(e) => setDimension1(e.target.value)}
              className="w-full bg-dark-200 text-white px-4 py-3 rounded-lg"
              placeholder="Side length"
            />
          </div>
        )}

        {shape === 'cuboid' && (
          <>
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Length (l)</label>
              <input
                type="number"
                value={dimension1}
                onChange={(e) => setDimension1(e.target.value)}
                className="w-full bg-dark-200 text-white px-4 py-3 rounded-lg"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Width (w)</label>
              <input
                type="number"
                value={dimension2}
                onChange={(e) => setDimension2(e.target.value)}
                className="w-full bg-dark-200 text-white px-4 py-3 rounded-lg"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Height (h)</label>
              <input
                type="number"
                value={dimension3}
                onChange={(e) => setDimension3(e.target.value)}
                className="w-full bg-dark-200 text-white px-4 py-3 rounded-lg"
              />
            </div>
          </>
        )}

        {shape === 'sphere' && (
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Radius (r)</label>
            <input
              type="number"
              value={dimension1}
              onChange={(e) => setDimension1(e.target.value)}
              className="w-full bg-dark-200 text-white px-4 py-3 rounded-lg"
              placeholder="Radius"
            />
          </div>
        )}

        {(shape === 'cylinder' || shape === 'cone') && (
          <>
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Radius (r)</label>
              <input
                type="number"
                value={dimension1}
                onChange={(e) => setDimension1(e.target.value)}
                className="w-full bg-dark-200 text-white px-4 py-3 rounded-lg"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Height (h)</label>
              <input
                type="number"
                value={dimension2}
                onChange={(e) => setDimension2(e.target.value)}
                className="w-full bg-dark-200 text-white px-4 py-3 rounded-lg"
              />
            </div>
          </>
        )}
      </div>

      <button
        onClick={calculate}
        className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-lg font-semibold mb-6"
      >
        Calculate Volume
      </button>

      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className="bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/50 rounded-xl p-6">
            <div className="text-gray-400 text-sm mb-2">Volume</div>
            <div className="text-4xl font-bold text-white mb-1">{result.volume}</div>
            <div className="text-gray-400 text-sm">{result.unit}</div>
          </div>

          <div className="bg-black/50 rounded-xl p-4">
            <div className="text-gray-400 text-sm mb-1">Surface Area</div>
            <div className="text-2xl font-bold text-white">{result.surfaceArea}</div>
          </div>

          <div className="bg-black/50 rounded-xl p-4">
            <div className="text-gray-400 text-sm mb-2">Formula:</div>
            <div className="text-white font-mono text-sm">{result.formula}</div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
