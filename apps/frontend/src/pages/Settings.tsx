import React, { useState } from 'react'
import { Sliders, Cpu, Database, Save, Check } from 'lucide-react'

export default function Settings() {
  const [llmProvider, setLlmProvider] = useState('mock')
  const [llmModel, setLlmModel] = useState('gpt-4-turbo')
  const [apiKey, setApiKey] = useState('')
  const [apiBase, setApiBase] = useState('')
  const [isSaved, setIsSaved] = useState(false)

  const handleSaveSettings = () => {
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
    // In a fully configured system, this would write config variables to backend or settings file
  }

  return (
    <div className="h-full overflow-y-auto p-8 scrollbar-thin max-w-2xl space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">System Settings</h1>
        <p className="text-sm text-gray-400 mt-1">Configure LLM orchestration providers, database locations, and developer tokens.</p>
      </div>

      <div className="space-y-6">
        
        {/* LLM Engine Config Section */}
        <div className="p-6 bg-gray-900 border border-cyber-border rounded-2xl space-y-4">
          <div className="flex items-center gap-2 border-b border-cyber-border pb-3">
            <Cpu size={16} className="text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Intent Router Settings</h3>
          </div>

          <div className="grid gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Provider</label>
              <select
                value={llmProvider}
                onChange={(e) => setLlmProvider(e.target.value)}
                className="bg-gray-950 border border-cyber-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50"
              >
                <option value="mock">Local Rules Engine (Zero Latency Heuristic Mock)</option>
                <option value="ollama">Ollama (Local LLM API)</option>
                <option value="openai">OpenAI (GPT API)</option>
                <option value="anthropic">Anthropic (Claude API)</option>
                <option value="lite-llm">LiteLLM Proxy Router</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Target Model</label>
              <input
                type="text"
                value={llmModel}
                onChange={(e) => setLlmModel(e.target.value)}
                className="bg-gray-950 border border-cyber-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50"
              />
            </div>

            {llmProvider !== 'mock' && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">API Access Token / Key</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="bg-gray-950 border border-cyber-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Base Endpoint URL</label>
                  <input
                    type="text"
                    value={apiBase}
                    onChange={(e) => setApiBase(e.target.value)}
                    placeholder={llmProvider === 'ollama' ? 'http://localhost:11434' : 'https://api.openai.com/v1'}
                    className="bg-gray-950 border border-cyber-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Database and File System config */}
        <div className="p-6 bg-gray-900 border border-cyber-border rounded-2xl space-y-4">
          <div className="flex items-center gap-2 border-b border-cyber-border pb-3">
            <Database size={16} className="text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Database & Storage Scopes</h3>
          </div>

          <div className="grid gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Relational Database Link</label>
              <input
                type="text"
                disabled
                value="sqlite:///apps/backend/uil.db"
                className="bg-gray-950 border border-cyber-border rounded-lg px-3 py-2 text-xs text-gray-500 font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Workspace File sandbox directory</label>
              <input
                type="text"
                disabled
                value="./workspaces"
                className="bg-gray-950 border border-cyber-border rounded-lg px-3 py-2 text-xs text-gray-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Save control panel button */}
        <div className="flex items-center justify-end">
          <button
            onClick={handleSaveSettings}
            className="h-10 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 transition-all"
          >
            {isSaved ? (
              <>
                <Check size={14} />
                <span>Settings Saved!</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>Commit Settings</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  )
}
