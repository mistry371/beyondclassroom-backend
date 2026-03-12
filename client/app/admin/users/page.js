'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { 
  Users, Search, Plus, Edit, Trash2, Ban, CheckCircle, 
  ArrowLeft, Filter, Download 
} from 'lucide-react'
import api from '@/utils/api'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminUsers() {
  const router = useRouter()
  const { user } = useSelector(state => state.auth)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    status: 'active'
  })

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      router.push('/')
      return
    }
    fetchUsers()
  }, [user, search, roleFilter])

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (roleFilter) params.append('role', roleFilter)
      
      const res = await api.get(`/admin/users?${params}`)
      setUsers(res.data.users)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedUser(null)
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'user',
      status: 'active'
    })
    setShowModal(true)
  }

  const handleEdit = (user) => {
    setSelectedUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      status: user.status || 'active'
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (selectedUser) {
        await api.put(`/admin/users/${selectedUser._id}`, formData)
      } else {
        await api.post('/admin/users', formData)
      }
      setShowModal(false)
      fetchUsers()
    } catch (error) {
      alert(error.response?.data?.message || 'Operation failed')
    }
  }

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    
    try {
      await api.delete(`/admin/users/${userId}`)
      fetchUsers()
    } catch (error) {
      alert(error.response?.data?.message || 'Delete failed')
    }
  }

  const handleToggleStatus = async (userId) => {
    try {
      await api.post(`/admin/users/${userId}/toggle-status`)
      fetchUsers()
    } catch (error) {
      alert(error.response?.data?.message || 'Status toggle failed')
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
      {/* Header */}
      <div className="bg-gradient-to-r from-dark-100 via-dark-100 to-dark-100 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="p-2 hover:bg-dark-200 rounded-lg transition-all"
              >
                <ArrowLeft className="h-5 w-5 text-gray-400" />
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  User Management
                </h1>
                <p className="text-gray-400 mt-1">{users.length} total users</p>
              </div>
            </div>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add User
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-200/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-dark-200/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-secondary/20 text-secondary' 
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.status === 'active' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {user.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 hover:bg-primary/20 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4 text-primary" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user._id)}
                          className="p-2 hover:bg-orange-500/20 rounded-lg transition-all"
                          title={user.status === 'active' ? 'Suspend' : 'Activate'}
                        >
                          {user.status === 'active' ? (
                            <Ban className="h-4 w-4 text-orange-400" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-dark-100 rounded-2xl border border-white/10 p-6 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                {selectedUser ? 'Edit User' : 'Create User'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                {!selectedUser && (
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                      required={!selectedUser}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
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
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-all"
                  >
                    {selectedUser ? 'Update' : 'Create'}
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
