'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { ArrowLeft, Shield, AlertTriangle, Ban } from 'lucide-react'
import api from '@/utils/api'
import { motion } from 'framer-motion'

export default function AdminSecurity() {
  const router = useRouter()
  const { user } = useSelector(state => state.auth)
  const [securityData, setSecurityData] = useState({
    failedLogins: [],
    blockedIPs: [],
    suspiciousActivity: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      router.push('/')
      return
    }
    fetchSecurityData()
  }, [user])

  const fetchSecurityData = async () => {
    try {
      const res = await api.get('/admin/security')
      setSecurityData(res.data || securityData)
    } catch (error) {
      console.error('Failed to fetch security data:', error)
    } finally {
      setLoading(false)
    }
  }

  const blockIP = async (ip) => {
    try {
      await api.post('/admin/security/block-ip', { ip })
      alert('IP blocked successfully')
      fetchSecurityData()
    } catch (error) {
      alert('Failed to block IP')
    }
  }

  const unblockIP = async (ip) => {
    try {
      await api.post('/admin/security/unblock-ip', { ip })
      alert('IP unblocked successfully')
      fetchSecurityData()
    } catch (error) {
      alert('Failed to unblock IP')
    }
  }

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
                  Security Management
                </h1>
                <p className="text-gray-400 mt-1">Monitor and manage platform security</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Failed Logins */}
          <div className="bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              Failed Login Attempts
            </h2>
            <div className="space-y-3">
              {securityData.failedLogins?.slice(0, 5).map((attempt, index) => (
                <div key={index} className="bg-dark-200/30 p-3 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white text-sm">{attempt.email}</p>
                      <p className="text-gray-400 text-xs">IP: {attempt.ip}</p>
                    </div>
                    <button
                      onClick={() => blockIP(attempt.ip)}
                      className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30"
                    >
                      Block IP
                    </button>
                  </div>
                  <p className="text-gray-500 text-xs mt-2">
                    {new Date(attempt.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Blocked IPs */}
          <div className="bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Ban className="h-5 w-5 text-red-400" />
              Blocked IP Addresses
            </h2>
            <div className="space-y-3">
              {securityData.blockedIPs?.map((ip, index) => (
                <div key={index} className="bg-dark-200/30 p-3 rounded-lg flex justify-between items-center">
                  <p className="text-white text-sm">{ip.address}</p>
                  <button
                    onClick={() => unblockIP(ip.address)}
                    className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-xs hover:bg-green-500/30"
                  >
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Suspicious Activity */}
        <div className="bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Suspicious Activity
          </h2>
          <div className="space-y-3">
            {securityData.suspiciousActivity?.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-dark-200/30 p-4 rounded-lg"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-white font-medium">{activity.type}</p>
                    <p className="text-gray-400 text-sm">{activity.description}</p>
                  </div>
                  <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
                    {activity.severity}
                  </span>
                </div>
                <p className="text-gray-500 text-xs">
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
