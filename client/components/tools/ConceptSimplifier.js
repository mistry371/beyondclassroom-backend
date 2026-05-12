'use client'

import { useState } from 'react'
import { BookOpen, Lightbulb, Pizza, Apple } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ConceptSimplifier() {
  const [selectedConcept, setSelectedConcept] = useState('fractions')

  const concepts = {
    fractions: {
      title: 'Fractions',
      icon: Pizza,
      simple: 'A fraction is a part of a whole thing',
      analogy: 'Imagine a pizza cut into 8 equal slices. If you eat 3 slices, you ate 3/8 (three-eighths) of the pizza.',
      visual: '🍕 = 8 slices, You ate 🍕🍕🍕 = 3/8',
      example: 'If you have ₹100 and spend ₹25, you spent 25/100 = 1/4 of your money',
      tips: ['Top number = parts you have', 'Bottom number = total parts', 'Bigger bottom = smaller pieces']
    },
    decimals: {
      title: 'Decimals',
      icon: Apple,
      simple: 'Decimals are another way to write fractions',
      analogy: 'Think of money! ₹10.50 means 10 rupees and 50 paise. The dot separates whole rupees from parts.',
      visual: '₹10.50 = 10 whole rupees + 0.50 (half rupee)',
      example: '0.5 = 5/10 = 1/2 (half), 0.25 = 25/100 = 1/4 (quarter)',
      tips: ['Numbers after dot are parts', 'One place = tenths', 'Two places = hundredths']
    },
    percentages: {
      title: 'Percentages',
      icon: Lightbulb,
      simple: 'Percent means "out of 100"',
      analogy: 'If you score 80% in a test, you got 80 marks out of 100. Like filling 80 squares in a 100-square grid.',
      visual: '80% = 80/100 = 0.80',
      example: '50% off means half price. ₹100 item becomes ₹50',
      tips: ['% = divide by 100', '100% = everything', '50% = half']
    },
    algebra: {
      title: 'Algebra (Variables)',
      icon: BookOpen,
      simple: 'Letters (like x) represent unknown numbers',
      analogy: 'Like a mystery box 📦. You know "box + 5 = 13", so the box must contain 8.',
      visual: 'x + 5 = 13 → x = 8',
      example: 'If 3 chocolates cost ₹x and total is ₹30, then x = ₹10 per chocolate',
      tips: ['x is just a number we don\'t know yet', 'Solve to find what x equals', 'Same rules as normal math']
    },
    equations: {
      title: 'Equations',
      icon: BookOpen,
      simple: 'An equation is like a balanced scale',
      analogy: 'Both sides must be equal, like a seesaw. Whatever you do to one side, do to the other to keep balance.',
      visual: '⚖️ Left side = Right side',
      example: 'x + 3 = 7 → subtract 3 from both sides → x = 4',
      tips: ['Both sides are equal', 'Keep it balanced', 'Opposite operations cancel out']
    },
    exponents: {
      title: 'Exponents (Powers)',
      icon: Lightbulb,
      simple: 'Exponents mean multiply a number by itself',
      analogy: '2³ means 2 × 2 × 2. Like stacking 3 boxes, each doubling the size.',
      visual: '2³ = 2 × 2 × 2 = 8',
      example: '10² = 10 × 10 = 100 (that\'s why we say "10 squared")',
      tips: ['Small number on top = how many times', '2² = 4, 2³ = 8, 2⁴ = 16', 'Anything⁰ = 1']
    },
    negative: {
      title: 'Negative Numbers',
      icon: Apple,
      simple: 'Numbers less than zero',
      analogy: 'Like temperature or money. -5°C is 5 degrees below zero. -₹100 means you owe ₹100.',
      visual: '←-3, -2, -1, 0, 1, 2, 3→',
      example: 'If you have ₹50 and spend ₹70, you\'re at -₹20 (owe ₹20)',
      tips: ['Negative = below zero', 'Two negatives make positive', '-(-5) = +5']
    },
    ratios: {
      title: 'Ratios',
      icon: Pizza,
      simple: 'Ratios compare two quantities',
      analogy: 'Recipe says 2 cups flour : 1 cup water. For every 2 cups flour, use 1 cup water.',
      visual: '2:1 means 2 parts to 1 part',
      example: 'Class has 15 boys and 10 girls. Ratio = 15:10 = 3:2',
      tips: ['Shows relationship', 'Can be simplified', 'Order matters']
    }
  }

  const concept = concepts[selectedConcept]
  const Icon = concept.icon

  return (
    <div className="bg-gradient-to-br from-dark-100 to-dark-200 rounded-2xl p-8 border border-primary/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
          <BookOpen className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Concept Simplifier</h2>
          <p className="text-gray-400">Complex concepts in simple words</p>
        </div>
      </div>

      {/* Concept Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {Object.entries(concepts).map(([key, c]) => (
          <button
            key={key}
            onClick={() => setSelectedConcept(key)}
            className={`p-4 rounded-xl font-semibold transition-all ${
              selectedConcept === key
                ? 'bg-gradient-to-r from-primary to-secondary text-white scale-105'
                : 'bg-dark-200/50 text-gray-300 hover:bg-dark-200'
            }`}
          >
            {c.title}
          </button>
        ))}
      </div>

      {/* Concept Explanation */}
      <motion.div
        key={selectedConcept}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Simple Explanation */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <Icon className="h-8 w-8 text-blue-400" />
            <h3 className="text-xl font-bold text-white">{concept.title}</h3>
          </div>
          <p className="text-2xl text-blue-300 font-semibold">{concept.simple}</p>
        </div>

        {/* Real-World Analogy */}
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
          <h4 className="text-lg font-bold text-purple-400 mb-3 flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Real-World Analogy
          </h4>
          <p className="text-gray-300 text-lg leading-relaxed">{concept.analogy}</p>
        </div>

        {/* Visual Representation */}
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
          <h4 className="text-lg font-bold text-green-400 mb-3">Visual Representation</h4>
          <p className="text-2xl text-white font-mono bg-black/30 p-4 rounded-lg text-center">
            {concept.visual}
          </p>
        </div>

        {/* Example */}
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6">
          <h4 className="text-lg font-bold text-orange-400 mb-3">Example</h4>
          <p className="text-gray-300 text-lg">{concept.example}</p>
        </div>

        {/* Quick Tips */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
          <h4 className="text-lg font-bold text-yellow-400 mb-3">Quick Tips 💡</h4>
          <ul className="space-y-2">
            {concept.tips.map((tip, index) => (
              <li key={index} className="text-gray-300 flex items-start gap-2">
                <span className="text-yellow-400 font-bold">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </div>
  )
}
