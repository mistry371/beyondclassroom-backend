'use client'

import { useState, useMemo } from 'react'
import Navbar from '@/components/Navbar'
import { TOOLS_META, TOOL_CATEGORIES } from '@/data/toolDefinitions'
import { TOOL_COMPONENTS } from '@/lib/toolRegistry'
import { Sparkles, Zap, Target, Brain } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ToolsPage() {
  const [activeTool, setActiveTool] = useState('advanced-calc')
  const [category, setCategory] = useState('all')

  const filteredTools = category === 'all' ? TOOLS_META : TOOLS_META.filter((t) => t.category === category)
  const ActiveComponent = TOOL_COMPONENTS[activeTool]

  const features = useMemo(
    () => [
      { icon: Zap, title: 'Instant Results', desc: 'Get answers in milliseconds', color: 'from-yellow-500 to-orange-500' },
      { icon: Target, title: 'Step-by-Step', desc: 'Learn how to solve problems', color: 'from-primary to-secondary' },
      { icon: Brain, title: 'Smart Learning', desc: 'Understand concepts deeply', color: 'from-secondary to-accent' },
    ],
    []
  )

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />

      <section className="py-20 bg-gradient-to-br from-dark via-dark-100 to-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-secondary/20 backdrop-blur-xl border border-primary/30 rounded-full px-6 py-3 mb-6">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <span className="text-primary font-semibold">{TOOLS_META.length} Premium Tools</span>
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
            <div className="flex flex-wrap justify-center gap-3">
              {TOOL_CATEGORIES.map((cat) => {
                const Icon = cat.icon
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-transform gpu-accelerated ${
                      category === cat.id
                        ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg scale-105'
                        : 'bg-dark-100 text-gray-300 hover:bg-dark-200'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {cat.name}
                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{cat.count}</span>
                    {cat.badge && (
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">{cat.badge}</span>
                    )}
                  </button>
                )
              })}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-12 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-dark-100/50 backdrop-blur-xl rounded-2xl p-4 border border-white/10 sticky top-24">
                <h2 className="text-lg font-bold text-white mb-4">Select Tool</h2>
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 scroll-smooth-touch">
                  {filteredTools.map((tool) => {
                    const Icon = tool.icon
                    return (
                      <button
                        key={tool.id}
                        onClick={() => setActiveTool(tool.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-transform gpu-accelerated ${
                          activeTool === tool.id
                            ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg scale-[1.02]'
                            : 'bg-dark-200/50 text-gray-300 hover:bg-dark-200'
                        }`}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <div className="text-left flex-1">
                          <div className="font-medium text-sm flex items-center gap-2">
                            {tool.name}
                            {tool.badge && (
                              <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                                tool.badge === 'NEW' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
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
            <div className="lg:col-span-3">
              {ActiveComponent ? <ActiveComponent /> : null}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-black to-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl font-black text-white mb-4">Why Our Tools?</h2>
            <p className="text-gray-400 text-lg">Built for students, by experts</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative group gpu-accelerated"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity`} />
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
