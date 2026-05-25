'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { Settings, ArrowLeft, Save, Globe, Mail, CreditCard, Palette, Zap } from 'lucide-react'
import api from '@/utils/api'
import { motion } from 'framer-motion'

export default function AdminSettings() {
  const router = useRouter()
  const { user } = useSelector(state => state.auth)
  const [settings, setSettings] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  useEffect(() => {
    fetchSettings()
  }, [user])

  const fetchSettings = async () => {
    try {
      const res = await api.get('/admin/settings')
      setSettings(res.data.settings)
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/admin/settings/bulk', {
        settings: settings.map(s => ({ key: s.key, value: s.value }))
      })
      alert('Settings saved successfully!')
    } catch (error) {
      alert(error.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key, value) => {
    setSettings(settings.map(s => s.key === key ? { ...s, value } : s))
  }

  const getSettingsByCategory = (category) => {
    return settings.filter(s => s.category === category)
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'features', label: 'Features', icon: Zap },
    { id: 'theme', label: 'Theme', icon: Palette },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark">
      <div className="bg-gradient-to-r from-dark-100 via-dark-100 to-dark-100 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/admin')} className="p-2 hover:bg-dark-200 rounded-lg transition-all">
                <ArrowLeft className="h-5 w-5 text-gray-400" />
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Platform Settings
                </h1>
                <p className="text-gray-400 mt-1">Configure your platform</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
              <div className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-primary to-secondary text-white'
                        : 'text-gray-400 hover:bg-dark-200/50'
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <div className="space-y-6">
                {getSettingsByCategory(activeTab).map((setting) => (
                  <div key={setting.key} className="border-b border-white/5 pb-6 last:border-0">
                    <label className="block text-white font-medium mb-2">
                      {setting.displayName}
                    </label>
                    <p className="text-gray-400 text-sm mb-3">{setting.description}</p>
                    
                    {setting.type === 'boolean' ? (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={setting.value === 'true'}
                          onChange={(e) => updateSetting(setting.key, e.target.checked ? 'true' : 'false')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-dark-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    ) : setting.type === 'number' ? (
                      <input
                        type="number"
                        value={setting.value}
                        onChange={(e) => updateSetting(setting.key, e.target.value)}
                        className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                      />
                    ) : setting.type === 'color' || setting.key.includes('color') ? (
                      <div className="flex gap-3">
                        <input
                          type="color"
                          value={setting.value}
                          onChange={(e) => updateSetting(setting.key, e.target.value)}
                          className="h-10 w-20 bg-dark-200 border border-white/10 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={setting.value}
                          onChange={(e) => updateSetting(setting.key, e.target.value)}
                          className="flex-1 px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                        />
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={setting.value}
                        onChange={(e) => updateSetting(setting.key, e.target.value)}
                        className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
