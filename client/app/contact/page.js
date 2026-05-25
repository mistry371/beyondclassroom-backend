'use client'

import Navbar from '@/components/Navbar'
import { motion } from 'framer-motion'
import { Mail, Phone, MessageCircle, Users, Briefcase, Send, ExternalLink } from 'lucide-react'
import { useState } from 'react'

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', interest: 'General Support', message: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('Thanks! Our team will contact you shortly.')
    setFormData({ name: '', email: '', phone: '', interest: 'General Support', message: '' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-100 to-dark">
      <Navbar />
      <section className="py-16 border-b border-white/10 bg-gradient-to-r from-primary/15 to-secondary/10">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-bold text-white mb-4">Contact Us & Promote With Us</h1>
          <p className="text-gray-300 text-lg max-w-3xl">Partnerships, promoter onboarding, support, and growth inquiries - all in one place.</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12 grid lg:grid-cols-3 gap-6">
        <motion.div className="lg:col-span-1 space-y-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-dark-100/80 border border-white/10 rounded-2xl p-5"><Mail className="text-primary" /><p className="text-white mt-2 font-semibold">Email</p><p className="text-gray-300">support@beyondclassroom.in</p></div>
          <div className="bg-dark-100/80 border border-white/10 rounded-2xl p-5"><Phone className="text-secondary" /><p className="text-white mt-2 font-semibold">Call / WhatsApp</p><p className="text-gray-300">+91 90000 00000</p></div>
          <div className="bg-dark-100/80 border border-white/10 rounded-2xl p-5"><Users className="text-yellow-400" /><p className="text-white mt-2 font-semibold">Promoter Program</p><a href="/promoter/register" className="text-primary inline-flex items-center gap-1">Join Now <ExternalLink size={14} /></a></div>
          <div className="bg-dark-100/80 border border-white/10 rounded-2xl p-5"><Briefcase className="text-green-400" /><p className="text-white mt-2 font-semibold">Partnerships</p><p className="text-gray-300">School / institute tie-ups welcome</p></div>
        </motion.div>

        <motion.div className="lg:col-span-2 bg-dark-100/80 border border-white/10 rounded-2xl p-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl font-bold text-white mb-4">Send Inquiry</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="px-4 py-3 bg-dark border border-white/10 rounded-lg text-white" placeholder="Full Name" />
              <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="px-4 py-3 bg-dark border border-white/10 rounded-lg text-white" placeholder="Email" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="px-4 py-3 bg-dark border border-white/10 rounded-lg text-white" placeholder="Mobile Number" />
              <select value={formData.interest} onChange={(e) => setFormData({ ...formData, interest: e.target.value })} className="px-4 py-3 bg-dark border border-white/10 rounded-lg text-white"><option>General Support</option><option>Promoter Opportunity</option><option>Partnership Inquiry</option></select>
            </div>
            <textarea required rows={5} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg text-white" placeholder="Write your message" />
            <div className="flex gap-3">
              <button type="submit" className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-semibold inline-flex items-center gap-2"><Send size={16} /> Submit</button>
              <a href="https://wa.me/919000000000" target="_blank" rel="noreferrer" className="px-6 py-3 bg-green-500/20 border border-green-500/30 text-green-300 rounded-lg font-semibold inline-flex items-center gap-2"><MessageCircle size={16} /> WhatsApp</a>
            </div>
          </form>
        </motion.div>
      </section>
    </div>
  )
}
