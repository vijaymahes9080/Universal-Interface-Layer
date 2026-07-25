import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Sparkles, Terminal, ChevronRight, Zap, Loader2, X, Compass, ArrowRight } from 'lucide-react'
import { useUILStore } from '../store/store'

interface CommandBarProps {
  isOpen: boolean
  onClose: () => void
  onSelectWorkspace: (id: string) => void
}

const SUGGESTIONS = [
  { text: "Prepare for my MCA exam next week.", icon: Sparkles, desc: "Schedules revision blocks, generates study docs, sets reminders" },
  { text: "Launch my new startup concept.", icon: Zap, desc: "Performs market research, writes decks, structures corporate tasks" },
  { text: "Plan Europe vacation trip.", icon: Compass, desc: "Sets calendar travel dates, creates packing tasklists, lists flights" },
  { text: "Analyze codebase packages.", icon: Terminal, desc: "Runs terminal diagnostics, lists dependencies, logs results" }
]

export default function CommandBar({ isOpen, onClose, onSelectWorkspace }: CommandBarProps) {
  const [prompt, setPrompt] = useState('')
  const [isPlanning, setIsPlanning] = useState(false)
  const [generatedPlan, setGeneratedPlan] = useState<any | null>(null)
  
  const { submitPrompt, executeWorkspace } = useUILStore()

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return
    await startPlanning(prompt)
  }

  const startPlanning = async (text: string) => {
    setIsPlanning(true)
    setGeneratedPlan(null)
    try {
      // Calls planning API to generate DAG
      const wsId = await submitPrompt(text)
      
      // Pull details of compiled Workspace to render plan preview
      const detailsRes = await fetch(`/api/workspaces/${wsId}`)
      const details = await detailsRes.json()
      setGeneratedPlan(details)
    } catch (err) {
      console.error(err)
    } finally {
      setIsPlanning(false)
    }
  }

  const handleLaunchPlan = async () => {
    if (!generatedPlan) return
    await executeWorkspace(generatedPlan.id)
    onSelectWorkspace(generatedPlan.id)
    onClose()
    setGeneratedPlan(null)
    setPrompt('')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
          
          {/* Backdrop Blur overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-950/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, y: -20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: -20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-2xl bg-gray-900 border border-cyber-border rounded-2xl shadow-2xl shadow-indigo-950/50 flex flex-col overflow-hidden glow-indigo"
          >
            
            {/* Input Form Header */}
            <form onSubmit={handleSearchSubmit} className="h-16 flex items-center px-4 border-b border-cyber-border gap-3">
              <Search className="text-gray-400 shrink-0" size={20} />
              <input
                autoFocus
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="What objective would you like UIL to coordinate?"
                className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
                disabled={isPlanning}
              />
              {isPlanning && <Loader2 className="text-indigo-400 animate-spin shrink-0" size={18} />}
              <button 
                type="button" 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-300 p-1"
              >
                <X size={16} />
              </button>
            </form>

            <div className="flex-1 max-h-[380px] overflow-y-auto p-4 scrollbar-thin">
              
              {/* Recommendations/Suggestions View */}
              {!isPlanning && !generatedPlan && (
                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2">Suggestions</div>
                  <div className="grid gap-2">
                    {SUGGESTIONS.map((item, index) => {
                      const Icon = item.icon
                      return (
                        <button
                          key={index}
                          onClick={() => {
                            setPrompt(item.text)
                            startPlanning(item.text)
                          }}
                          className="w-full text-left p-3 hover:bg-gray-800/40 rounded-xl border border-transparent hover:border-cyber-border group flex items-start gap-3 transition-all duration-150"
                        >
                          <div className="h-8 w-8 rounded-lg bg-gray-800 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600/10 shrink-0">
                            <Icon size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-white group-hover:text-indigo-400 truncate">{item.text}</h4>
                            <p className="text-[11px] text-gray-400 truncate mt-0.5">{item.desc}</p>
                          </div>
                          <ChevronRight size={14} className="text-gray-600 group-hover:text-indigo-400 self-center shrink-0" />
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Planning state loader */}
              {isPlanning && (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                  <p className="text-sm font-semibold text-gray-200">Compiling multi-step execution DAG...</p>
                  <p className="text-xs text-gray-500">Orchestrating tasks, identifying parallel jobs, loading plugins</p>
                </div>
              )}

              {/* Generated execution DAG overview list */}
              {generatedPlan && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-cyber-border pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-indigo-400">{generatedPlan.name}</h3>
                      <p className="text-xs text-gray-400 mt-1">UIL parsed this objective into {generatedPlan.tasks.length} coordinated actions.</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {generatedPlan.tasks.map((task: any, index: number) => (
                      <div key={task.id} className="flex items-start gap-3 p-3 bg-gray-900 border border-cyber-border rounded-xl">
                        <span className="text-xs font-mono text-gray-500 w-5 text-right mt-0.5">{index + 1}.</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-white">{task.name}</h4>
                            <span className="text-[10px] font-mono px-2 py-0.5 bg-gray-800 border border-cyber-border text-indigo-400 rounded-md">
                              {task.plugin}.{task.action}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-1">{task.description}</p>
                          {Object.keys(task.inputs).length > 0 && (
                            <pre className="text-[10px] text-gray-500 mt-1.5 p-1.5 bg-gray-950/40 rounded border border-cyber-border overflow-x-auto font-mono">
                              {JSON.stringify(task.inputs, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Execute trigger Footer */}
                  <div className="mt-4 flex items-center justify-end gap-3 pt-3 border-t border-cyber-border">
                    <button
                      onClick={() => setGeneratedPlan(null)}
                      className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white"
                    >
                      Refactor Prompt
                    </button>
                    <button
                      onClick={handleLaunchPlan}
                      className="h-9 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                    >
                      <span>Execute Workflow</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>

                </div>
              )}

            </div>

            {/* Keyboard tips Footer */}
            <div className="h-10 bg-gray-950 border-t border-cyber-border px-4 flex items-center justify-between text-[10px] text-gray-500 font-medium">
              <span>Use arrows or mouse to browse suggestions</span>
              <span>ESC to cancel</span>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
