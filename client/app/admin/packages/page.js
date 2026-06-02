'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowUp, ArrowDown, CheckCircle, Edit, Eye, EyeOff, Package, Plus, Trash2, X } from 'lucide-react'
import api from '@/utils/api'
import { motion, AnimatePresence } from 'framer-motion'
import { showSuccess, showError } from '@/components/ui/Toast'

const emptyForm = {
  name: '',
  description: '',
  features: '',
  priceINR: '',
  priceUSD: '',
  validity: '',
  image: '',
  active: true,
  popular: false,
}

export default function AdminPackages() {
  const router = useRouter()
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedPkg, setSelectedPkg] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    setLoading(true)
    try {
      const res = await api.get('/packages/admin')
      setPackages(res.data.packages || [])
    } catch {
      // Fall back to static packages if API not yet implemented
      setPackages([])
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setSelectedPkg(null)
    setFormData(emptyForm)
    setError('')
    setShowModal(true)
  }

  const openEdit = (pkg) => {
    setSelectedPkg(pkg)
    setFormData({
      name: pkg.name || '',
      description: pkg.description || '',
      features: Array.isArray(pkg.features) ? pkg.features.join('\n') : (pkg.features || ''),
      priceINR: pkg.priceINR || pkg.inr || '',
      priceUSD: pkg.priceUSD || pkg.usd || '',
      validity: pkg.validity || '',
      image: pkg.image || '',
      active: pkg.active !== false,
      popular: pkg.popular || false,
    })
    setError('')
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...formData,
        features: formData.features.split('\n').map((f) => f.trim()).filter(Boolean),
        priceINR: Number(formData.priceINR),
        priceUSD: Number(formData.priceUSD),
      }
      if (selectedPkg) {
        await api.put(`/packages/admin/${selectedPkg._id}`, payload)
      } else {
        await api.post('/packages/admin', payload)
      }
      setShowModal(false)
      fetchPackages()
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this package? This cannot be undone.')) return
    try {
      await api.delete(`/packages/admin/${id}`)
      fetchPackages()
    } catch {
      showError('Delete failed')
    }
  }

  const handleToggleActive = async (pkg) => {
    try {
      await api.patch(`/packages/admin/${pkg._id}/toggle`)
      fetchPackages()
    } catch {
      showError('Toggle failed')
    }
  }

  const handleReorder = async (id, direction) => {
    try {
      await api.patch(`/packages/admin/${id}/reorder`, { direction })
      fetchPackages()
    } catch {
      showError('Reorder failed')
    }
  }

  return (
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <div className="bg-gradient-to-r from-dark-100 via-dark-100 to-dark-100 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/admin')} className="p-2 hover:bg-dark-200 rounded-lg transition-all">
                <ArrowLeft className="h-5 w-5 text-gray-400" />
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Package Management
                </h1>
                <p className="text-gray-400 mt-1">{packages.length} packages configured</p>
              </div>
            </div>
            <button
              onClick={openCreate}
              className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Add Package
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-xl font-semibold">No packages yet</p>
            <p className="text-gray-500 mt-2 mb-6">Create your first package to get started.</p>
            <button onClick={openCreate} className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-semibold">
              Create Package
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg, idx) => (
              <motion.div
                key={pkg._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-2xl border p-6 ${pkg.active !== false ? 'border-white/10' : 'border-red-500/20 opacity-60'}`}
              >
                {pkg.image && (
                  <div className="h-32 rounded-xl overflow-hidden mb-4 bg-dark-200">
                    <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">{pkg.name}</h3>
                    {pkg.popular && (
                      <span className="text-xs font-semibold text-accent">★ Most Popular</span>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${pkg.active !== false ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {pkg.active !== false ? 'Active' : 'Hidden'}
                  </span>
                </div>

                {pkg.description && (
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{pkg.description}</p>
                )}

                <div className="flex gap-4 mb-3 text-sm">
                  <span className="text-primary font-bold">₹{pkg.priceINR || pkg.inr || 0}</span>
                  <span className="text-gray-500">/ ${pkg.priceUSD || pkg.usd || 0}</span>
                  {pkg.validity && <span className="text-gray-500">· {pkg.validity}</span>}
                </div>

                {Array.isArray(pkg.features) && pkg.features.length > 0 && (
                  <ul className="space-y-1 mb-4">
                    {pkg.features.slice(0, 3).map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-gray-400">
                        <CheckCircle className="h-3.5 w-3.5 text-secondary flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                    {pkg.features.length > 3 && (
                      <li className="text-xs text-gray-500">+{pkg.features.length - 3} more features</li>
                    )}
                  </ul>
                )}

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => openEdit(pkg)}
                    className="flex-1 px-3 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-all flex items-center justify-center gap-1 text-sm"
                  >
                    <Edit className="h-4 w-4" /> Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(pkg)}
                    className="px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all"
                    title={pkg.active !== false ? 'Hide package' : 'Show package'}
                  >
                    {pkg.active !== false ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleReorder(pkg._id, 'up')}
                    disabled={idx === 0}
                    className="px-3 py-2 bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30 transition-all disabled:opacity-30"
                    title="Move up"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleReorder(pkg._id, 'down')}
                    disabled={idx === packages.length - 1}
                    className="px-3 py-2 bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30 transition-all disabled:opacity-30"
                    title="Move down"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(pkg._id)}
                    className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-dark-100 rounded-2xl border border-white/10 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {selectedPkg ? 'Edit Package' : 'Create Package'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                  <X className="h-6 w-6" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">Package Name *</label>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                    placeholder="e.g. Basic Package"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                    rows="2"
                    placeholder="Short description of this package"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">Features (one per line) *</label>
                  <textarea
                    required
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary font-mono text-sm"
                    rows="6"
                    placeholder="Class 1-8 Mathematics&#10;Structured Practice Papers&#10;Detailed Solutions&#10;Progress Tracking"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Price INR (₹) *</label>
                    <input
                      required
                      type="number"
                      min="0"
                      value={formData.priceINR}
                      onChange={(e) => setFormData({ ...formData, priceINR: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                      placeholder="999"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Price USD ($)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.priceUSD}
                      onChange={(e) => setFormData({ ...formData, priceUSD: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                      placeholder="15"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">Validity</label>
                  <input
                    value={formData.validity}
                    onChange={(e) => setFormData({ ...formData, validity: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                    placeholder="e.g. 1 month, 3 months, 1 year"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">Custom Image URL</label>
                  <input
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                    placeholder="/packages/Basic Package.png"
                  />
                </div>

                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="text-gray-300 text-sm">Active (visible to users)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.popular}
                      onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="text-gray-300 text-sm">Mark as Most Popular</span>
                  </label>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 bg-dark-200 text-white rounded-lg hover:bg-gray-600 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : selectedPkg ? 'Update Package' : 'Create Package'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
