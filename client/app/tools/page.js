'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import StepByStepSolver from '@/components/tools/StepByStepSolver'
import QuadraticSolverEnhanced from '@/components/tools/QuadraticSolverEnhanced'
import ConceptSimplifier from '@/components/tools/ConceptSimplifier'
import MistakeAnalyzer from '@/components/tools/MistakeAnalyzer'
import HintGenerator from '@/components/tools/HintGenerator'
import VisualGraphTool from '@/components/tools/VisualGraphTool'
import FractionVisualizer from '@/components/tools/FractionVisualizer'
import NumberLine from '@/components/tools/NumberLine'
import TimedPractice from '@/components/tools/TimedPractice'
import PracticeGenerator from '@/components/tools/PracticeGenerator'
import FormulaExplorer from '@/components/tools/FormulaExplorer'
import EquationBuilder from '@/components/tools/EquationBuilder'
import GeometryVisualizer from '@/components/tools/GeometryVisualizer'
import DailyChallenge from '@/components/tools/DailyChallenge'
import GraphingCalculator from '@/components/tools/GraphingCalculator'
import MatrixCalculator from '@/components/tools/MatrixCalculator'
import DerivativeCalculator from '@/components/tools/DerivativeCalculator'
import PercentageCalculator from '@/components/tools/PercentageCalculator'
import FractionCalculator from '@/components/tools/FractionCalculator'
import AreaCalculator from '@/components/tools/AreaCalculator'
import BasicCalculator from '@/components/tools/BasicCalculator'
import AdvancedCalculator from '@/components/tools/AdvancedCalculator'
import QuadraticSolver from '@/components/tools/QuadraticSolver'
import PrimeChecker from '@/components/tools/PrimeChecker'
import FactorialCalculator from '@/components/tools/FactorialCalculator'
import LCMGCDCalculator from '@/components/tools/LCMGCDCalculator'
import PermutationCombination from '@/components/tools/PermutationCombination'
import StatisticsCalculator from '@/components/tools/StatisticsCalculator'
import TrigonometryCalculator from '@/components/tools/TrigonometryCalculator'
import RatioCalculator from '@/components/tools/RatioCalculator'
import RootCalculator from '@/components/tools/RootCalculator'
import ExponentCalculator from '@/components/tools/ExponentCalculator'
import LinearEquationSolver from '@/components/tools/LinearEquationSolver'
import LogarithmCalculator from '@/components/tools/LogarithmCalculator'
import SequenceCalculator from '@/components/tools/SequenceCalculator'
import ProbabilityCalculator from '@/components/tools/ProbabilityCalculator'
import VectorCalculator from '@/components/tools/VectorCalculator'
import ComplexNumberCalculator from '@/components/tools/ComplexNumberCalculator'
import IntegralCalculator from '@/components/tools/IntegralCalculator'
import LimitCalculator from '@/components/tools/LimitCalculator'
import VolumeCalculator from '@/components/tools/VolumeCalculator'
import { Calculator, Grid3x3, TrendingUp, Percent, Divide, Square, Plus, Sigma, PieChart, Ruler, Triangle, Circle, Binary, Hash, Infinity, Zap, Target, Brain, Code, Sparkles, Star, Shuffle, BarChart3, Navigation, Dices, List, Box, Lightbulb, BookOpen, Timer, Minus, Trophy } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ToolsPage() {
  const [activeTool, setActiveTool] = useState('advanced-calc')
  const [category, setCategory] = useState('all')

  const tools = [
    // NEW: Learning Tools (Enhanced)
    { id: 'step-solver', name: 'Step-by-Step Solver', icon: Brain, component: StepByStepSolver, category: 'learning', grade: '6-10', desc: 'See every solving step', badge: 'NEW' },
    { id: 'quadratic-enhanced', name: 'Quadratic Solver Pro', icon: Sparkles, component: QuadraticSolverEnhanced, category: 'learning', grade: '8-10', desc: 'With hints & steps', badge: 'ENHANCED' },
    { id: 'concept-simplifier', name: 'Concept Simplifier', icon: Lightbulb, component: ConceptSimplifier, category: 'learning', grade: '5-10', desc: 'Complex concepts made simple', badge: 'NEW' },
    { id: 'mistake-analyzer', name: 'Mistake Analyzer', icon: Target, component: MistakeAnalyzer, category: 'learning', grade: '6-10', desc: 'Find and fix errors', badge: 'NEW' },
    { id: 'hint-generator', name: 'Hint Generator', icon: Lightbulb, component: HintGenerator, category: 'learning', grade: '6-10', desc: 'Progressive hints', badge: 'NEW' },
    { id: 'visual-graph', name: 'Visual Graph Tool', icon: TrendingUp, component: VisualGraphTool, category: 'learning', grade: '8-12', desc: 'Interactive graphing', badge: 'NEW' },
    { id: 'fraction-viz', name: 'Fraction Visualizer', icon: PieChart, component: FractionVisualizer, category: 'learning', grade: '5-8', desc: 'See fractions visually', badge: 'NEW' },
    { id: 'number-line', name: 'Number Line', icon: Minus, component: NumberLine, category: 'learning', grade: '5-8', desc: 'Interactive number line', badge: 'NEW' },
    { id: 'timed-practice', name: 'Timed Practice', icon: Timer, component: TimedPractice, category: 'learning', grade: '5-10', desc: 'Speed training', badge: 'NEW' },
    { id: 'practice-gen', name: 'Practice Generator', icon: Shuffle, component: PracticeGenerator, category: 'learning', grade: '5-10', desc: 'Unlimited problems', badge: 'NEW' },
    { id: 'formula-explorer', name: 'Formula Explorer', icon: BookOpen, component: FormulaExplorer, category: 'learning', grade: '8-12', desc: 'Formula reference', badge: 'NEW' },
    { id: 'equation-builder', name: 'Equation Builder', icon: Code, component: EquationBuilder, category: 'learning', grade: '6-10', desc: 'Word to equation', badge: 'NEW' },
    { id: 'geometry-viz', name: 'Geometry Visualizer', icon: Triangle, component: GeometryVisualizer, category: 'learning', grade: '6-10', desc: 'Interactive shapes', badge: 'NEW' },
    { id: 'daily-challenge', name: 'Daily Challenge', icon: Trophy, component: DailyChallenge, category: 'learning', grade: '6-12', desc: 'Daily problem', badge: 'NEW' },
    
    // Basic Math (5th-7th Grade) - 8 tools
    { id: 'advanced-calc', name: 'Advanced Calculator', icon: Calculator, component: AdvancedCalculator, category: 'basic', grade: '5-12', desc: 'Scientific calculator with keyboard', badge: 'NEW' },
    { id: 'percentage', name: 'Percentage', icon: Percent, component: PercentageCalculator, category: 'basic', grade: '5-7', desc: 'Calculate percentages easily' },
    { id: 'fraction', name: 'Fraction', icon: Divide, component: FractionCalculator, category: 'basic', grade: '5-7', desc: 'Fraction operations' },
    { id: 'ratio', name: 'Ratio & Proportion', icon: Divide, component: RatioCalculator, category: 'basic', grade: '6-8', desc: 'Simplify ratios' },
    { id: 'lcmgcd', name: 'LCM & GCD', icon: Hash, component: LCMGCDCalculator, category: 'basic', grade: '6-8', desc: 'Find LCM and GCD' },
    { id: 'prime', name: 'Prime Checker', icon: Star, component: PrimeChecker, category: 'basic', grade: '6-8', desc: 'Check if number is prime' },
    { id: 'factorial', name: 'Factorial', icon: Zap, component: FactorialCalculator, category: 'basic', grade: '7-9', desc: 'Calculate n!' },
    { id: 'exponent', name: 'Exponent', icon: TrendingUp, component: ExponentCalculator, category: 'basic', grade: '7-9', desc: 'Power calculations' },
    
    // Geometry (5th-10th Grade) - 4 tools
    { id: 'area', name: 'Area & Perimeter', icon: Square, component: AreaCalculator, category: 'geometry', grade: '5-8', desc: 'Calculate areas' },
    { id: 'volume', name: 'Volume Calculator', icon: Box, component: VolumeCalculator, category: 'geometry', grade: '7-10', desc: '3D shape volumes' },
    { id: 'root', name: 'Root Calculator', icon: Binary, component: RootCalculator, category: 'geometry', grade: '8-10', desc: 'Square root, cube root' },
    { id: 'trigonometry', name: 'Trigonometry', icon: Triangle, component: TrigonometryCalculator, category: 'geometry', grade: '9-12', desc: 'Sin, cos, tan' },
    
    // Algebra (8th-10th Grade) - 7 tools
    { id: 'quadratic', name: 'Quadratic Solver', icon: Plus, component: QuadraticSolver, category: 'algebra', grade: '8-10', desc: 'Solve quadratic equations' },
    { id: 'linear', name: 'Linear Equation Solver', icon: Plus, component: LinearEquationSolver, category: 'algebra', grade: '8-10', desc: 'Solve 2 variable systems' },
    { id: 'graphing', name: 'Graphing', icon: TrendingUp, component: GraphingCalculator, category: 'algebra', grade: '8-12', desc: 'Plot functions' },
    { id: 'logarithm', name: 'Logarithm', icon: TrendingUp, component: LogarithmCalculator, category: 'algebra', grade: '9-12', desc: 'Log calculations' },
    { id: 'sequence', name: 'Sequence & Series', icon: List, component: SequenceCalculator, category: 'algebra', grade: '9-12', desc: 'Arithmetic & geometric' },
    
    // Statistics (9th-12th Grade) - 4 tools
    { id: 'statistics', name: 'Statistics', icon: BarChart3, component: StatisticsCalculator, category: 'statistics', grade: '9-12', desc: 'Mean, median, mode' },
    { id: 'permutation', name: 'Permutation & Combination', icon: Shuffle, component: PermutationCombination, category: 'statistics', grade: '10-12', desc: 'nPr and nCr' },
    { id: 'probability', name: 'Probability', icon: Dices, component: ProbabilityCalculator, category: 'statistics', grade: '9-12', desc: 'Calculate probability' },
    
    // Calculus & Advanced (11th-12th Grade) - 7 tools
    { id: 'derivative', name: 'Derivative', icon: TrendingUp, component: DerivativeCalculator, category: 'calculus', grade: '11-12', desc: 'Find derivatives' },
    { id: 'integral', name: 'Integral', icon: Sigma, component: IntegralCalculator, category: 'calculus', grade: '11-12', desc: 'Integration' },
    { id: 'limit', name: 'Limit', icon: TrendingUp, component: LimitCalculator, category: 'calculus', grade: '11-12', desc: 'Calculate limits' },
    { id: 'matrix', name: 'Matrix', icon: Grid3x3, component: MatrixCalculator, category: 'advanced', grade: '11-12', desc: 'Matrix operations' },
    { id: 'vector', name: 'Vector', icon: Navigation, component: VectorCalculator, category: 'advanced', grade: '11-12', desc: 'Vector operations' },
    { id: 'complex', name: 'Complex Numbers', icon: Infinity, component: ComplexNumberCalculator, category: 'advanced', grade: '11-12', desc: 'Complex arithmetic' },
  ]

  const categories = [
    { id: 'all', name: 'All Tools', icon: Sparkles, count: tools.length },
    { id: 'learning', name: 'Learning Tools', icon: Brain, count: tools.filter(t => t.category === 'learning').length, badge: 'NEW' },
    { id: 'basic', name: 'Basic Math', icon: Calculator, count: tools.filter(t => t.category === 'basic').length },
    { id: 'algebra', name: 'Algebra', icon: Plus, count: tools.filter(t => t.category === 'algebra').length },
    { id: 'geometry', name: 'Geometry', icon: Triangle, count: tools.filter(t => t.category === 'geometry').length },
    { id: 'statistics', name: 'Statistics', icon: BarChart3, count: tools.filter(t => t.category === 'statistics').length },
    { id: 'calculus', name: 'Calculus', icon: TrendingUp, count: tools.filter(t => t.category === 'calculus').length },
    { id: 'advanced', name: 'Advanced', icon: Brain, count: tools.filter(t => t.category === 'advanced').length },
  ]

  const filteredTools = category === 'all' ? tools : tools.filter(t => t.category === category)
  const ActiveComponent = tools.find(t => t.id === activeTool)?.component

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-dark via-dark-100 to-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-secondary/20 backdrop-blur-xl border border-primary/30 rounded-full px-6 py-3 mb-6">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <span className="text-primary font-semibold">{tools.length} Premium Tools</span>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">14 NEW</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-black mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
                Mathematical Tools
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Comprehensive calculators for students from 5th to 12th standard
            </p>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((cat) => {
                const Icon = cat.icon
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                      category === cat.id
                        ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg scale-105'
                        : 'bg-dark-100 text-gray-300 hover:bg-dark-200'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {cat.name}
                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{cat.count}</span>
                    {cat.badge && (
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">
                        {cat.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-12 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-dark-100/50 backdrop-blur-xl rounded-2xl p-4 border border-white/10 sticky top-24">
                <h2 className="text-lg font-bold text-white mb-4">Select Tool</h2>
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                  {filteredTools.map((tool) => {
                    const Icon = tool.icon
                    return (
                      <button
                        key={tool.id}
                        onClick={() => setActiveTool(tool.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          activeTool === tool.id
                            ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg scale-105'
                            : 'bg-dark-200/50 text-gray-300 hover:bg-dark-200'
                        }`}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <div className="text-left flex-1">
                          <div className="font-medium text-sm flex items-center gap-2">
                            {tool.name}
                            {tool.badge && (
                              <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                                tool.badge === 'NEW' 
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {tool.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-xs opacity-75">Grade {tool.grade}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Tool Display */}
            <div className="lg:col-span-3">
              {ActiveComponent && <ActiveComponent />}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-black to-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-black text-white mb-4">Why Our Tools?</h2>
            <p className="text-gray-400 text-lg">Built for students, by experts</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: 'Instant Results', desc: 'Get answers in milliseconds', color: 'from-yellow-500 to-orange-500' },
              { icon: Target, title: 'Step-by-Step', desc: 'Learn how to solve problems', color: 'from-primary to-secondary' },
              { icon: Brain, title: 'Smart Learning', desc: 'Understand concepts deeply', color: 'from-secondary to-accent' },
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                  className="relative group"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity`}></div>
                  <div className="relative bg-dark-100/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                    <Icon className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-400">{feature.desc}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
