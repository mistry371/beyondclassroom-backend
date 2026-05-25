'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSelector } from 'react-redux'
import { ArrowLeft, Users, TrendingUp, Award } from 'lucide-react'
import api from '@/utils/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function ExamAnalytics() {
  const router = useRouter()
  const params = useParams()
  const { user } = useSelector(s => s.auth)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/exams/admin/' + params.examId + '/analytics')
      .then(r => setData(r.data.analytics))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  if (loading) return <div className="min-h-screen bg-dark flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>

  const COLORS = ['#ef4444','#f97316','#eab308','#22c55e','#6366f1']

  return (
    <div className="min-h-screen bg-dark">
      <div className="bg-dark-100 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center gap-4">
          <button onClick={() => router.push('/admin/exams')} className="p-2 hover:bg-dark-200 rounded-lg"><ArrowLeft className="h-5 w-5 text-gray-400"/></button>
          <h1 className="text-2xl font-bold text-white">Exam Analytics</h1>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {!data || data.totalAttempts === 0 ? (
          <div className="text-center py-20 bg-dark-100/50 rounded-2xl border border-white/10">
            <Users className="h-16 w-16 text-gray-600 mx-auto mb-4"/>
            <p className="text-gray-400 text-xl">No attempts yet</p>
            <p className="text-gray-500 mt-2">Analytics will appear once students start taking this exam</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Attempts', value: data.totalAttempts, color: 'from-primary to-secondary' },
                { label: 'Avg Score', value: data.avgScore + '%', color: 'from-secondary to-accent' },
                { label: 'Pass Rate', value: data.passRate + '%', color: 'from-green-500 to-emerald-500' },
                { label: 'Highest Score', value: data.highestScore + '%', color: 'from-yellow-500 to-orange-500' },
              ].map((s,i) => (
                <div key={i} className="bg-dark-100/80 rounded-2xl border border-white/10 p-5">
                  <p className="text-3xl font-black text-white mb-1">{s.value}</p>
                  <p className="text-gray-400 text-sm">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-dark-100/80 rounded-2xl border border-white/10 p-6">
                <h3 className="text-white font-bold mb-4">Score Distribution</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.scoreDistribution}>
                    <XAxis dataKey="range" tick={{ fill: '#9ca3af', fontSize: 11 }}/>
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }}/>
                    <Tooltip contentStyle={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}/>
                    <Bar dataKey="count" radius={[4,4,0,0]}>
                      {(data.scoreDistribution||[]).map((_,i) => <Cell key={i} fill={COLORS[i]}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-dark-100/80 rounded-2xl border border-white/10 p-6">
                <h3 className="text-white font-bold mb-4">Section-wise Avg Score</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.sectionAnalysis}>
                    <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }}/>
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }}/>
                    <Tooltip contentStyle={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}/>
                    <Bar dataKey="avgScore" fill="#6366f1" radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-dark-100/80 rounded-2xl border border-white/10 p-6">
              <h3 className="text-white font-bold mb-4">Top Performers</h3>
              <div className="space-y-3">
                {(data.toppers||[]).map((t,i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-dark-200/40 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={"w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm " + (i===0?'bg-yellow-500 text-black':i===1?'bg-gray-400 text-black':i===2?'bg-amber-600 text-white':'bg-dark-200 text-gray-400')}>{i+1}</div>
                      <span className="text-white font-medium">{t.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-primary font-bold">{t.percentage}%</p>
                      <p className="text-gray-400 text-xs">{Math.floor(t.time/60)}m {t.time%60}s</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
