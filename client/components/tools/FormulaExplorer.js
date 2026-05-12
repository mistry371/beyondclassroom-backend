'use client'

import { useState } from 'react'
import { BookOpen, Search } from 'lucide-react'

export default function FormulaExplorer() {
  const [category, setCategory] = useState('algebra')
  const [searchTerm, setSearchTerm] = useState('')

  const formulas = {
    algebra: [
      {
        name: 'Quadratic Formula',
        formula: 'x = (-b ± √(b² - 4ac)) / 2a',
        use: 'Solve equations of form ax² + bx + c = 0',
        example: 'For x² - 5x + 6 = 0: a=1, b=-5, c=6 → x = 2 or x = 3',
        realWorld: 'Calculate projectile motion, optimize business profits'
      },
      {
        name: 'Slope Formula',
        formula: 'm = (y₂ - y₁) / (x₂ - x₁)',
        use: 'Find slope of line between two points',
        example: 'Points (1,2) and (3,6): m = (6-2)/(3-1) = 2',
        realWorld: 'Calculate road gradients, analyze trends in data'
      },
      {
        name: 'Distance Formula',
        formula: 'd = √((x₂-x₁)² + (y₂-y₁)²)',
        use: 'Find distance between two points',
        example: 'Between (0,0) and (3,4): d = √(9+16) = 5',
        realWorld: 'GPS navigation, measuring distances on maps'
      }
    ],
    geometry: [
      {
        name: 'Area of Circle',
        formula: 'A = πr²',
        use: 'Calculate area of circle',
        example: 'Circle with radius 5: A = π(5)² = 78.54',
        realWorld: 'Pizza size, garden planning, satellite coverage'
      },
      {
        name: 'Pythagorean Theorem',
        formula: 'a² + b² = c²',
        use: 'Find sides of right triangle',
        example: 'If a=3, b=4: c = √(9+16) = 5',
        realWorld: 'Construction, ladder safety, screen sizes'
      },
      {
        name: 'Volume of Cylinder',
        formula: 'V = πr²h',
        use: 'Calculate cylinder volume',
        example: 'Radius 3, height 10: V = π(3)²(10) = 282.74',
        realWorld: 'Water tanks, cans, pipes capacity'
      }
    ],
    trigonometry: [
      {
        name: 'Sine Rule',
        formula: 'a/sin(A) = b/sin(B) = c/sin(C)',
        use: 'Solve any triangle',
        example: 'Find unknown sides/angles in triangles',
        realWorld: 'Navigation, surveying, astronomy'
      },
      {
        name: 'Cosine Rule',
        formula: 'c² = a² + b² - 2ab·cos(C)',
        use: 'Find third side of triangle',
        example: 'When you know two sides and included angle',
        realWorld: 'Engineering, architecture, GPS'
      }
    ],
    statistics: [
      {
        name: 'Mean (Average)',
        formula: 'μ = Σx / n',
        use: 'Find average of numbers',
        example: 'Numbers 2,4,6,8: Mean = (2+4+6+8)/4 = 5',
        realWorld: 'Test scores, salaries, temperatures'
      },
      {
        name: 'Standard Deviation',
        formula: 'σ = √(Σ(x-μ)² / n)',
        use: 'Measure data spread',
        example: 'Shows how spread out data is from mean',
        realWorld: 'Quality control, risk analysis, research'
      }
    ]
  }

  const categories = Object.keys(formulas)
  const currentFormulas = formulas[category].filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.formula.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="bg-gradient-to-br from-dark-100 to-dark-200 rounded-2xl p-8 border border-primary/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
          <BookOpen className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Math Formula Explorer</h2>
          <p className="text-gray-400">Complete formula reference with examples</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search formulas..."
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-3 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-6 py-3 rounded-xl font-semibold capitalize transition-all ${
                category === cat
                  ? 'bg-gradient-to-r from-primary to-secondary text-white'
                  : 'bg-white/5 text-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Formulas */}
        <div className="space-y-4">
          {currentFormulas.map((formula, index) => (
            <div
              key={index}
              className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-primary/30 transition-all"
            >
              <h3 className="text-xl font-bold text-white mb-3">{formula.name}</h3>
              
              <div className="bg-black/30 rounded-lg p-4 mb-4">
                <p className="text-2xl font-mono text-primary text-center">{formula.formula}</p>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm font-semibold mb-1">What it does:</p>
                  <p className="text-gray-300">{formula.use}</p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm font-semibold mb-1">Example:</p>
                  <p className="text-gray-300">{formula.example}</p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm font-semibold mb-1">Real-world use:</p>
                  <p className="text-gray-300">{formula.realWorld}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {currentFormulas.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No formulas found matching "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  )
}
