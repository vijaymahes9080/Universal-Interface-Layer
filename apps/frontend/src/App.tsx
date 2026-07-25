import React, { useEffect, useState } from 'react'
import { 
  LayoutDashboard, 
  Layers, 
  Cpu, 
  Workflow, 
  Network, 
  Settings as SettingsIcon, 
  Code, 
  Terminal, 
  Search, 
  Compass, 
  Zap, 
  Activity,
  Play,
  RotateCcw,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  FolderSync
} from 'lucide-react'
import { useUILStore } from './store/store'
import CommandBar from './components/CommandBar'
import Dashboard from './pages/Dashboard'
import WorkspaceDetail from './pages/WorkspaceDetail'
import Automation from './pages/Automation'
import KnowledgeGraphPage from './pages/KnowledgeGraphPage'
import PluginsPage from './pages/PluginsPage'
import DeveloperPage from './pages/DeveloperPage'
import Settings from './pages/Settings'
import { WorkflowBuilder } from './pages/WorkflowBuilder'

export default function App() {
  const { 
    workspaces, 
    currentWorkspace, 
    executionLogs, 
    commandBarOpen,
    setCommandBarOpen, 
    fetchWorkspaces,
    fetchWorkspaceDetails,
    connectWebSocket,
    disconnectWebSocket,
    deleteWorkspace
  } = useUILStore()

  const [activeTab, setActiveTab] = useState<'dashboard' | 'workspace' | 'automation' | 'graph' | 'plugins' | 'developer' | 'settings' | 'workflow-studio'>('dashboard')


  useEffect(() => {
    // 1. Initial pulls
    fetchWorkspaces()
    // 2. Open Websocket stream
    connectWebSocket()
    return () => disconnectWebSocket()
  }, [])

  // Keyboard shortcut listener for Command Bar (Ctrl + K or CMD + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setCommandBarOpen(!commandBarOpen)
      }
      if (e.key === 'Escape') {
        setCommandBarOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [commandBarOpen])

  const selectWorkspace = async (id: string) => {
    await fetchWorkspaceDetails(id)
    setActiveTab('workspace')
  }

  return (
    <div className="h-screen w-screen flex bg-cyber-bg text-gray-100 overflow-hidden select-none">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-gray-950 border-r border-cyber-border flex flex-col justify-between shrink-0">
        <div>
          {/* Logo Header */}
          <div className="h-16 flex items-center px-6 gap-3 border-b border-cyber-border">
            <div className="h-8 w-8 bg-gradient-to-tr from-cyber-primary to-cyber-secondary rounded-lg flex items-center justify-center font-bold text-lg text-white shadow-md shadow-indigo-500/20">
              U
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-wide text-white leading-none">UIL CORE</h1>
              <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Operating Layer</span>
            </div>
          </div>

          {/* Quick Search trigger button */}
          <div className="p-4">
            <button 
              onClick={() => setCommandBarOpen(true)}
              className="w-full h-10 px-3 bg-gray-900/60 hover:bg-gray-900 border border-cyber-border hover:border-indigo-500/30 rounded-lg flex items-center justify-between text-xs text-gray-400 group transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                <Search size={14} className="text-gray-500 group-hover:text-indigo-400" />
                <span>Command UIL...</span>
              </div>
              <kbd className="px-1.5 py-0.5 bg-gray-800 border border-cyber-border rounded text-[9px] font-mono text-gray-500 group-hover:text-gray-300">
                Ctrl K
              </kbd>
            </button>
          </div>

          {/* Primary Nav Links */}
          <nav className="px-3 space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600/10 text-indigo-400 border-l-2 border-indigo-500'
                  : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200'
              }`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('automation')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
                activeTab === 'automation'
                  ? 'bg-indigo-600/10 text-indigo-400 border-l-2 border-indigo-500'
                  : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200'
              }`}
            >
              <Workflow size={18} />
              <span>Automations</span>
            </button>

            <button
              onClick={() => setActiveTab('workflow-studio')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
                activeTab === 'workflow-studio'
                  ? 'bg-cyan-600/10 text-cyan-400 border-l-2 border-cyan-500'
                  : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200'
              }`}
            >
              <Zap size={18} className="text-cyan-400" />
              <span>Workflow Studio</span>
            </button>


            <button
              onClick={() => setActiveTab('graph')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
                activeTab === 'graph'
                  ? 'bg-indigo-600/10 text-indigo-400 border-l-2 border-indigo-500'
                  : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200'
              }`}
            >
              <Network size={18} />
              <span>Knowledge Graph</span>
            </button>

            <button
              onClick={() => setActiveTab('plugins')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
                activeTab === 'plugins'
                  ? 'bg-indigo-600/10 text-indigo-400 border-l-2 border-indigo-500'
                  : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200'
              }`}
            >
              <Compass size={18} />
              <span>Plugin Store</span>
            </button>

            <div className="h-[1px] bg-cyber-border my-4 mx-3" />

            {/* Active Workspaces Section */}
            <div className="px-3 mb-2 flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase tracking-widest">
              <span>Workspaces</span>
              <Layers size={12} />
            </div>

            <div className="max-h-48 overflow-y-auto space-y-0.5 scrollbar-thin px-1">
              {workspaces.length === 0 ? (
                <div className="text-center py-4 text-xs text-gray-600">No active sessions</div>
              ) : (
                workspaces.map((ws) => (
                  <div key={ws.id} className="group flex items-center justify-between rounded-md hover:bg-gray-900 px-2 py-1.5 transition-colors">
                    <button
                      onClick={() => selectWorkspace(ws.id)}
                      className={`flex-1 text-left text-xs truncate font-medium ${
                        currentWorkspace?.id === ws.id ? 'text-indigo-400' : 'text-gray-400 group-hover:text-gray-200'
                      }`}
                    >
                      {ws.name}
                    </button>
                    <button 
                      onClick={() => deleteWorkspace(ws.id)}
                      className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-0.5 text-gray-600 transition-all duration-150"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </nav>
        </div>

        {/* Lower System Tools */}
        <div className="p-3 border-t border-cyber-border bg-gray-950/40">
          <button
            onClick={() => setActiveTab('developer')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-md mb-1 transition-all ${
              activeTab === 'developer' ? 'bg-indigo-600/10 text-indigo-400' : 'text-gray-400 hover:bg-gray-900'
            }`}
          >
            <Code size={16} />
            <span>Developer Console</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-md transition-all ${
              activeTab === 'settings' ? 'bg-indigo-600/10 text-indigo-400' : 'text-gray-400 hover:bg-gray-900'
            }`}
          >
            <SettingsIcon size={16} />
            <span>Settings</span>
          </button>

          {/* System Status Tracker */}
          <div className="mt-4 pt-3 border-t border-cyber-border flex items-center justify-between text-[10px] text-gray-500 font-mono">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse"></span>
              <span>CORE SERVICE</span>
            </div>
            <span>PORT 8000</span>
          </div>
        </div>
      </aside>

      {/* Main Panel View Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-cyber-bg relative">
        <header className="h-16 border-b border-cyber-border flex items-center justify-between px-8 bg-gray-950/20 shrink-0">
          <div>
            {activeTab === 'dashboard' && <h2 className="text-lg font-bold text-white">Dashboard Overview</h2>}
            {activeTab === 'workspace' && <h2 className="text-lg font-bold text-white">Workspace: {currentWorkspace?.name}</h2>}
            {activeTab === 'automation' && <h2 className="text-lg font-bold text-white">Visual Automation Builder</h2>}
            {activeTab === 'graph' && <h2 className="text-lg font-bold text-white">Semantic Knowledge Graph</h2>}
            {activeTab === 'plugins' && <h2 className="text-lg font-bold text-white">Plugin Marketplace</h2>}
            {activeTab === 'developer' && <h2 className="text-lg font-bold text-white">Developer Command Station</h2>}
            {activeTab === 'settings' && <h2 className="text-lg font-bold text-white">System Settings</h2>}
          </div>
          
          {/* Real-time telemetry ticker */}
          <div className="flex items-center gap-4 text-xs">
            {executionLogs.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full font-mono text-[11px] text-indigo-400 max-w-sm truncate animate-pulse">
                <Activity size={12} className="animate-spin" />
                <span className="truncate">{executionLogs[0].message}</span>
              </div>
            )}
            <div className="h-4 w-[1px] bg-cyber-border"></div>
            <div className="text-gray-400 flex items-center gap-1.5 font-medium">
              <FolderSync size={14} className="text-indigo-400" />
              <span>UIL Monorepo</span>
            </div>
          </div>
        </header>

        {/* View Routing */}
        <section className="flex-1 overflow-hidden relative">
          {activeTab === 'dashboard' && <Dashboard onSelectWorkspace={selectWorkspace} />}
          {activeTab === 'workspace' && <WorkspaceDetail />}
          {activeTab === 'automation' && <Automation />}
          {activeTab === 'workflow-studio' && <WorkflowBuilder />}
          {activeTab === 'graph' && <KnowledgeGraphPage />}
          {activeTab === 'plugins' && <PluginsPage />}
          {activeTab === 'developer' && <DeveloperPage />}
          {activeTab === 'settings' && <Settings />}
        </section>

      </main>

      {/* Floating Command Bar Portal */}
      <CommandBar 
        isOpen={commandBarOpen} 
        onClose={() => setCommandBarOpen(false)} 
        onSelectWorkspace={selectWorkspace} 
      />

    </div>
  )
}
