import React, { useEffect, useState } from 'react'
import { 
  Play, 
  RotateCcw, 
  Activity, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Layout, 
  Zap, 
  Layers, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useUILStore } from '../store/store'

interface DashboardProps {
  onSelectWorkspace: (id: string) => void
}

const MOCK_CHART_DATA = [
  { time: '09:00', executions: 4, latency: 120 },
  { time: '10:00', executions: 8, latency: 110 },
  { time: '11:00', executions: 12, latency: 95 },
  { time: '12:00', executions: 9, latency: 105 },
  { time: '13:00', executions: 15, latency: 88 },
  { time: '14:00', executions: 22, latency: 70 },
  { time: '15:00', executions: 18, latency: 75 }
]

export default function Dashboard({ onSelectWorkspace }: DashboardProps) {
  const { workspaces, submitPrompt, fetchWorkspaces } = useUILStore()
  const [auditLogs, setAuditLogs] = useState<any[]>([])

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/logs')
      const data = await res.json()
      setAuditLogs(data.slice(0, 5))
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchWorkspaces()
    fetchAuditLogs()
    // Poll logs every 5 seconds to show active execution stats
    const interval = setInterval(() => {
      fetchWorkspaces()
      fetchAuditLogs()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleLaunchQuickAction = async (promptText: string) => {
    try {
      const id = await submitPrompt(promptText)
      onSelectWorkspace(id)
    } catch (e) {
      console.error(e)
    }
  }

  // Calculate quick indicators
  const total = workspaces.length
  const completed = workspaces.filter(w => w.status === 'completed').length
  const active = workspaces.filter(w => w.status === 'executing' || w.status === 'waiting_approval').length

  return (
    <div className="h-full overflow-y-auto p-8 scrollbar-thin space-y-8">
      
      {/* 1. Welcoming Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">System Console</h1>
          <p className="text-sm text-gray-400 mt-1">Intelligent automation orchestrator & plugin dashboard.</p>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 border border-cyber-border rounded-lg text-xs font-semibold">
          <ShieldCheck size={16} className="text-indigo-400" />
          <span>Zero-Trust Sandbox Enabled</span>
        </div>
      </div>

      {/* 2. Key Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 bg-gray-900 border border-cyber-border rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden group hover:border-indigo-500/20 transition-colors">
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase tracking-wider">
            <span>Workspaces</span>
            <Layers size={18} className="text-indigo-400" />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold text-white">{total}</span>
            <span className="text-xs text-gray-500 ml-2">orchestrated sessions</span>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-600 opacity-20"></div>
        </div>

        <div className="p-6 bg-gray-900 border border-cyber-border rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden group hover:border-emerald-500/20 transition-colors">
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase tracking-wider">
            <span>Completed</span>
            <CheckCircle2 size={18} className="text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold text-white">{completed}</span>
            <span className="text-xs text-gray-500 ml-2">successful cycles</span>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600 opacity-20"></div>
        </div>

        <div className="p-6 bg-gray-900 border border-cyber-border rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden group hover:border-cyan-500/20 transition-colors">
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase tracking-wider">
            <span>Active Runs</span>
            <Activity size={18} className="text-cyan-400 animate-pulse" />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold text-white">{active}</span>
            <span className="text-xs text-gray-500 ml-2">running DAG loops</span>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-500 to-cyan-600 opacity-20"></div>
        </div>

        <div className="p-6 bg-gray-900 border border-cyber-border rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden group hover:border-pink-500/20 transition-colors">
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase tracking-wider">
            <span>Engine Speed</span>
            <Zap size={18} className="text-pink-400" />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold text-white">88ms</span>
            <span className="text-xs text-gray-500 ml-2">average planning latency</span>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-pink-500 to-pink-600 opacity-20"></div>
        </div>
      </div>

      {/* 3. Main Data Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Section: Executions Latency Chart */}
        <div className="lg:col-span-2 p-6 bg-gray-900 border border-cyber-border rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-wide">Dynamic Orchestration Latency</h3>
            <span className="text-[10px] text-gray-500 font-mono">Telemetry Real-Time</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_CHART_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorExec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis dataKey="time" stroke="#4B5563" fontSize={10} tickLine={false} />
                <YAxis stroke="#4B5563" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', color: '#FFF', fontSize: 12, borderRadius: 8 }}
                />
                <Area type="monotone" dataKey="executions" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorExec)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Section: Quick Trigger Prompts */}
        <div className="p-6 bg-gray-900 border border-cyber-border rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Orchestration Presets</h3>
            <p className="text-xs text-gray-400 mt-1">Spin up structured execution workflows instantly.</p>
            
            <div className="space-y-2 mt-4">
              <button
                onClick={() => handleLaunchQuickAction("Prepare for my MCA exam next week.")}
                className="w-full p-3 bg-gray-950/40 hover:bg-gray-800/40 border border-cyber-border rounded-xl text-left flex items-center justify-between group transition-all"
              >
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-indigo-400">MCA Exam Preparation</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">Syllabus docs, calendars, checksheets</p>
                </div>
                <ArrowRight size={14} className="text-gray-600 group-hover:text-indigo-400 transition-colors" />
              </button>

              <button
                onClick={() => handleLaunchQuickAction("Launch my business concept startup.")}
                className="w-full p-3 bg-gray-950/40 hover:bg-gray-800/40 border border-cyber-border rounded-xl text-left flex items-center justify-between group transition-all"
              >
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-indigo-400">Startup Planner</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">Pitch templates, research indices</p>
                </div>
                <ArrowRight size={14} className="text-gray-600 group-hover:text-indigo-400 transition-colors" />
              </button>

              <button
                onClick={() => handleLaunchQuickAction("Plan a Europe vacation trip.")}
                className="w-full p-3 bg-gray-950/40 hover:bg-gray-800/40 border border-cyber-border rounded-xl text-left flex items-center justify-between group transition-all"
              >
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-indigo-400">Travel Itinerary</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">Packing guide, calendar blocked dates</p>
                </div>
                <ArrowRight size={14} className="text-gray-600 group-hover:text-indigo-400 transition-colors" />
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-cyber-border text-center">
            <span className="text-[10px] text-gray-500">Press <kbd className="px-1 py-0.5 bg-gray-800 border border-cyber-border rounded">Ctrl K</kbd> to enter custom triggers</span>
          </div>
        </div>

      </div>

      {/* 4. Recent Security Audit Trail */}
      <div className="p-6 bg-gray-900 border border-cyber-border rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white tracking-wide">Security Sandbox & Audit Trail</h3>
          <span className="text-[10px] text-gray-500 font-mono">Live logs update</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-gray-400">
            <thead className="text-[10px] uppercase font-bold text-gray-500 border-b border-cyber-border">
              <tr>
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Component</th>
                <th className="pb-3">Action</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Sandbox Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-600">No audits recorded in this session.</td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="py-3 font-mono text-[10px] text-gray-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 font-semibold text-white">{log.component}</td>
                    <td className="py-3">{log.action}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        log.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 truncate max-w-xs text-gray-500 font-mono text-[11px]">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
