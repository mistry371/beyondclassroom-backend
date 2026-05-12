'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, X, Send, Minimize2, Maximize2, Sparkles } from 'lucide-react'

const QUICK_QUESTIONS = [
  'Explain fractions simply',
  'How to solve quadratic equations?',
  'What is calculus?',
  'Help me with algebra',
]

const AI_RESPONSES = {
  default: [
    "Great question! Let me break this down for you step by step. Mathematics is all about patterns and logic. Start with the basics and build up gradually.",
    "I understand this can be tricky! The key is to practice regularly. Try breaking the problem into smaller parts.",
    "Excellent! Here's a simple way to think about it: every math problem has a pattern. Once you find the pattern, the solution becomes clear.",
    "Let me help you with that! Remember, there's no shortcut to understanding — but there are smarter ways to learn.",
  ],
  fractions: "Fractions are just parts of a whole! Think of a pizza 🍕 cut into 8 slices. If you eat 3 slices, you've eaten 3/8 of the pizza. The bottom number (denominator) = total parts. The top number (numerator) = parts you have. To add fractions: make denominators equal first, then add numerators!",
  quadratic: "Quadratic equations have the form ax² + bx + c = 0. Use the quadratic formula: x = (-b ± √(b²-4ac)) / 2a. The discriminant (b²-4ac) tells you: if > 0, two real solutions; if = 0, one solution; if < 0, no real solutions. Try our Quadratic Solver tool for step-by-step solutions!",
  calculus: "Calculus has two main parts: 1️⃣ Derivatives — measure how fast something changes (slope of a curve). 2️⃣ Integrals — measure total accumulation (area under a curve). Think of derivatives as 'speedometer' and integrals as 'odometer'. Start with limits, then derivatives, then integrals!",
  algebra: "Algebra is about finding unknown values using equations! Key rules: 1) Whatever you do to one side, do to the other. 2) Combine like terms. 3) Isolate the variable. Example: 2x + 5 = 13 → 2x = 8 → x = 4. Practice with our Linear Equation Solver!",
}

function getAIResponse(message) {
  const lower = message.toLowerCase()
  if (lower.includes('fraction')) return AI_RESPONSES.fractions
  if (lower.includes('quadratic')) return AI_RESPONSES.quadratic
  if (lower.includes('calculus') || lower.includes('derivative') || lower.includes('integral')) return AI_RESPONSES.calculus
  if (lower.includes('algebra') || lower.includes('equation')) return AI_RESPONSES.algebra
  return AI_RESPONSES.default[Math.floor(Math.random() * AI_RESPONSES.default.length)]
}

export default function AITutor() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState([
    { id: 1, role: 'ai', text: "Hi! I'm your AI Math Tutor 🤖✨ Ask me anything about mathematics — from basic arithmetic to advanced calculus. I'm here to help!", time: null }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text) => {
    const msg = text || input.trim()
    if (!msg) return
    setInput('')

    const userMsg = { id: Date.now(), role: 'user', text: msg, time: null }
    setMessages(prev => [...prev, userMsg])
    setIsTyping(true)

    // Simulate AI thinking
    await new Promise(r => setTimeout(r, 800 + Math.random() * 700))

    const aiResponse = getAIResponse(msg)
    setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: aiResponse, time: null }])
    setIsTyping(false)
  }

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center hover:scale-110 transition-transform"
          >
            <Bot className="h-8 w-8 text-white" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-dark animate-pulse"></span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className={`fixed bottom-6 right-6 z-50 bg-gradient-to-br from-dark-100 to-dark rounded-2xl border border-white/10 shadow-2xl shadow-black/50 flex flex-col overflow-hidden transition-all ${isMinimized ? 'w-80 h-16' : 'w-96 h-[560px]'}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/20 to-secondary/20 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">AI Math Tutor</p>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-green-400 text-xs">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 hover:bg-white/10 rounded-lg transition-all">
                  {isMinimized ? <Maximize2 className="h-4 w-4 text-gray-400" /> : <Minimize2 className="h-4 w-4 text-gray-400" />}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-all">
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'ai' && (
                        <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                          <Sparkles className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-primary to-secondary text-white rounded-br-sm'
                          : 'bg-white/10 text-gray-200 rounded-bl-sm'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mr-2">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Questions */}
                <div className="px-4 pb-2 flex gap-2 overflow-x-auto flex-shrink-0">
                  {QUICK_QUESTIONS.map((q, i) => (
                    <button key={i} onClick={() => sendMessage(q)}
                      className="flex-shrink-0 px-3 py-1.5 bg-primary/20 text-primary text-xs rounded-full hover:bg-primary/30 transition-all border border-primary/30"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/10 flex-shrink-0">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                      placeholder="Ask me anything about math..."
                      className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary"
                    />
                    <button onClick={() => sendMessage()} disabled={!input.trim() || isTyping}
                      className="p-2.5 bg-gradient-to-r from-primary to-secondary rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                    >
                      <Send className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
