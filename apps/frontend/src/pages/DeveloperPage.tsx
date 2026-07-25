import React, { useState } from 'react'
import { Terminal, Code, Cpu, Play, Trash2, ArrowRight, Check } from 'lucide-react'
import { useUILStore } from '../store/store'

export default function DeveloperPage() {
  const { executionLogs, clearLogs } = useUILStore()
  const [cliInput, setCliInput] = useState('')
  const [cliLogs, setCliLogs] = useState<string[]>([
    'UIL Plugin Simulator v1.0.0 is active.',
    'Execute test actions or scaffold new plugins below.'
  ])

  const [pluginName, setPluginName] = useState('MyCustomService')
  const [scaffoldResult, setScaffoldResult] = useState<string | null>(null)

  const handleRunTestCmd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!cliInput.trim()) return

    const cmd = cliInput.trim().toLowerCase()
    let out = ''
    if (cmd === 'help') {
      out = 'Commands: help, clear, plugin list, system stats'
    } else if (cmd === 'clear') {
      setCliLogs([])
      setCliInput('')
      return
    } else if (cmd === 'plugin list') {
      out = 'Registered: files, calendar, email, tasks, terminal, browser'
    } else if (cmd === 'system stats') {
      out = 'SQLite: Connected | Vector Indices: 4 items | Threads active: 1'
    } else {
      out = `Command '${cliInput}' received. Simulating output... \nDone.`
    }

    setCliLogs(prev => [...prev, `> ${cliInput}`, out])
    setCliInput('')
  }

  const handleGenerateScaffold = () => {
    const code = `from uil_sdk import UILPlugin

plugin = UILPlugin(
    name="${pluginName}",
    description="Custom dynamic tasks generator integration for productivity flows."
)

@plugin.command("sync_tasks", description="Synchronizes task data with third-party webhooks")
def handle_sync_tasks(sync_url: str, priority: str = "medium"):
    # Perform custom requests or file writes
    return {
        "sync_url": sync_url,
        "completed_count": 5,
        "status": "success"
    }

if __name__ == "__main__":
    plugin.write_manifest_file("manifest.json")
`
    setScaffoldResult(code)
  }

  return (
    <div className="h-full flex divide-x divide-cyber-border overflow-hidden">
      
      {/* Left Column: Live Websocket logs and interactive CLI console */}
      <div className="w-1/2 flex flex-col justify-between overflow-hidden bg-[#090D16] p-6 space-y-6">
        
        {/* WebSocket execution stream */}
        <div className="flex-1 flex flex-col overflow-hidden space-y-3">
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Terminal size={16} className="text-indigo-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">WebSocket Execution Log</h3>
            </div>
            <button 
              onClick={clearLogs}
              className="text-[10px] text-gray-500 hover:text-red-400 flex items-center gap-1"
            >
              <Trash2 size={12} />
              <span>Clear logs</span>
            </button>
          </div>

          <div className="flex-1 bg-gray-950 border border-cyber-border rounded-xl p-4 font-mono text-[11px] text-gray-300 overflow-y-auto space-y-1.5 scrollbar-thin">
            {executionLogs.length === 0 ? (
              <span className="text-gray-600 block">Listening for real-time WebSocket telemetry...</span>
            ) : (
              executionLogs.map((log, index) => (
                <div key={index} className="flex gap-2">
                  <span className="text-gray-600 shrink-0">[{log.timestamp}]</span>
                  <span className={
                    log.type === 'task_update' && log.status === 'completed' ? 'text-emerald-400' :
                    log.status === 'failed' ? 'text-red-400' :
                    log.status === 'waiting_approval' ? 'text-amber-400' :
                    'text-indigo-400'
                  }>
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Dynamic CLI Simulator */}
        <div className="h-48 flex flex-col justify-between shrink-0 space-y-3 border-t border-cyber-border pt-4">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">CLI Playground</div>
          <div className="flex-1 bg-gray-950 rounded-xl p-3 border border-cyber-border font-mono text-[10px] text-gray-400 overflow-y-auto space-y-1">
            {cliLogs.map((line, idx) => (
              <pre key={idx} className="whitespace-pre-wrap">{line}</pre>
            ))}
          </div>
          <form onSubmit={handleRunTestCmd} className="flex gap-2">
            <input
              type="text"
              value={cliInput}
              onChange={(e) => setCliInput(e.target.value)}
              placeholder="Type test command (e.g. 'help')"
              className="flex-1 bg-gray-950 border border-cyber-border rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50"
            />
            <button 
              type="submit"
              className="px-3 bg-gray-900 border border-cyber-border hover:border-indigo-500 rounded-lg text-xs font-bold text-indigo-400"
            >
              Run
            </button>
          </form>
        </div>

      </div>

      {/* Right Column: SDK Templates Generator */}
      <div className="w-1/2 flex flex-col p-6 space-y-6 overflow-y-auto scrollbar-thin">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Plugin SDK Scaffolder</h3>
          <p className="text-[11px] text-gray-500 mt-1">Generate python boilerplates matching the UIL plugin sdk specification.</p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-gray-900 border border-cyber-border rounded-xl space-y-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Plugin Class Name</label>
              <input
                type="text"
                value={pluginName}
                onChange={(e) => setPluginName(e.target.value)}
                className="bg-gray-950 border border-cyber-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50"
              />
            </div>
            
            <button
              onClick={handleGenerateScaffold}
              className="w-full h-9 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-indigo-600/20"
            >
              <Code size={14} />
              <span>Generate Scaffold</span>
            </button>
          </div>

          {scaffoldResult && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Output: plugin.py</span>
                <span className="text-[9px] text-emerald-400 flex items-center gap-1 font-mono">
                  <Check size={12} />
                  <span>Syntax Valid</span>
                </span>
              </div>
              <pre className="text-[10px] font-mono p-4 bg-gray-950 border border-cyber-border rounded-xl text-gray-300 overflow-x-auto">
                {scaffoldResult}
              </pre>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
