import React, { useEffect, useState } from 'react'
import { Check, ShieldAlert, Cpu, ToggleLeft, ToggleRight, Sparkles, Sliders } from 'lucide-react'

export default function PluginsPage() {
  const [plugins, setPlugins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPlugins = async () => {
    try {
      const res = await fetch('/api/plugins')
      const data = await res.json()
      setPlugins(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlugins()
  }, [])

  const handleToggle = async (pluginId: string) => {
    try {
      await fetch(`/api/plugins/${pluginId}/toggle`, { method: 'POST' })
      // Sync list state
      fetchPlugins()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="h-full overflow-y-auto p-8 scrollbar-thin space-y-8">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Plugin Marketplace</h1>
        <p className="text-sm text-gray-400 mt-1">Manage core integrations, check capability schemas, and isolate sandbox scopes.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plugins.map((plugin) => (
            <div 
              key={plugin.id} 
              className="bg-gray-900 border border-cyber-border rounded-2xl p-6 flex flex-col justify-between hover:border-indigo-500/20 transition-all group"
            >
              <div className="space-y-4">
                {/* Plugin ID badge and toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-indigo-400 bg-indigo-600/10 px-2.5 py-0.5 rounded-full font-bold uppercase">
                    Core Plugin
                  </span>
                  
                  <button 
                    onClick={() => handleToggle(plugin.id)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {plugin.manifest?.enabled !== false ? (
                      <ToggleRight size={28} className="text-indigo-500" />
                    ) : (
                      <ToggleLeft size={28} className="text-gray-600" />
                    )}
                  </button>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                    {plugin.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{plugin.description}</p>
                </div>

                <div className="h-[1px] bg-cyber-border" />

                {/* Commands schemas checklist */}
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-gray-500 uppercase">Capabilities</div>
                  <div className="flex flex-wrap gap-1">
                    {plugin.commands.map((cmd: string) => (
                      <code key={cmd} className="text-[10px] font-mono bg-gray-950 px-2 py-0.5 rounded border border-cyber-border text-gray-400">
                        {cmd}()
                      </code>
                    ))}
                  </div>
                </div>
              </div>

              {/* Secure sandbox levels footer */}
              <div className="mt-6 pt-4 border-t border-cyber-border flex items-center justify-between text-[10px] text-gray-500">
                <div className="flex items-center gap-1">
                  <Cpu size={12} className="text-indigo-400" />
                  <span>SDK v1.0.0</span>
                </div>
                
                <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <span>Isolated Sandbox</span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  )
}
