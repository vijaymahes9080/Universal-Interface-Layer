import React, { useState, useEffect } from 'react'
import { 
  Play, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Calendar as CalendarIcon, 
  CheckSquare, 
  Network, 
  Save, 
  ChevronRight, 
  Loader2, 
  FolderOpen,
  ArrowRight
} from 'lucide-react'
import { useUILStore } from '../store/store'

export default function WorkspaceDetail() {
  const { currentWorkspace, executeWorkspace, approveTask, fetchWorkspaceDetails } = useUILStore()
  const [activeTab, setActiveTab] = useState<'notes' | 'files' | 'calendar' | 'tasks'>('notes')
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState('')
  const [isSavingFile, setIsSavingFile] = useState(false)

  // Calendar and task logs created by plugins
  const [calendarEvents, setCalendarEvents] = useState<any[]>([])
  const [todoTasks, setTodoTasks] = useState<any[]>([])

  useEffect(() => {
    if (currentWorkspace) {
      // Pull plugin details from execution outputs
      const calEvts: any[] = []
      const todos: any[] = []
      
      currentWorkspace.tasks.forEach(t => {
        if (t.plugin === 'calendar' && t.action === 'create_event' && t.status === 'completed' && t.outputs.event) {
          calEvts.push(t.outputs.event)
        }
        if (t.plugin === 'tasks' && t.action === 'create_task' && t.status === 'completed' && t.outputs.task) {
          todos.push(t.outputs.task)
        }
      })
      setCalendarEvents(calEvts)
      setTodoTasks(todos)

      // Auto-load first file if exists
      if (currentWorkspace.files.length > 0 && !selectedFile) {
        handleOpenFile(currentWorkspace.files[0].path)
      }
    }
  }, [currentWorkspace])

  if (!currentWorkspace) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500">
        <FolderOpen size={48} className="text-gray-600 mb-3" />
        <p className="text-sm">No workspace selected.</p>
        <p className="text-xs text-gray-600 mt-1">Press Ctrl+K or use the presets in Dashboard to launch.</p>
      </div>
    )
  }

  const handleOpenFile = async (filePath: string) => {
    setSelectedFile(filePath)
    try {
      const res = await fetch(`/api/workspaces/${currentWorkspace.id}`)
      const details = await res.json()
      
      // Call read file API
      const fileRes = await fetch(`/api/workspaces/file?path=${filePath}`)
      // Wait, we can implement read_file route or call base plugin read logic. Let's make an endpoint or read in memory.
      // Alternatively, let's write a file reader helper in routes.py or mock the content retrieval.
      // Let's implement `/api/workspaces/file` in routes.py later or fetch it here.
      // Let's call /api/workspaces/{workspace_id} which returns files, or request file read:
      const readRes = await fetch(`/api/workspaces/read-file?workspace_id=${currentWorkspace.id}&path=${filePath}`)
      if (readRes.ok) {
        const data = await readRes.json()
        setFileContent(data.content || '')
      } else {
        setFileContent('# Failed to load file.')
      }
    } catch (e) {
      setFileContent('# Empty File.')
    }
  }

  const handleSaveFile = async () => {
    if (!selectedFile) return
    setIsSavingFile(true)
    try {
      await fetch('/api/workspaces/write-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspace_id: currentWorkspace.id,
          path: selectedFile,
          content: fileContent
        })
      })
      // Sync workspace files
      await fetchWorkspaceDetails(currentWorkspace.id)
    } catch (e) {
      console.error(e)
    } finally {
      setIsSavingFile(false)
    }
  }

  const runAllTasks = () => {
    executeWorkspace(currentWorkspace.id)
  }

  return (
    <div className="h-full flex divide-x divide-cyber-border overflow-hidden">
      
      {/* LEFT COLUMN: Dag Task checklist */}
      <div className="w-1/2 flex flex-col justify-between bg-gray-950/20 overflow-y-auto scrollbar-thin p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Execution Pipeline</h3>
              <p className="text-[11px] text-gray-500 mt-1">Structured steps executed by plugin sandboxes.</p>
            </div>
            
            {currentWorkspace.status === 'idle' && (
              <button
                onClick={runAllTasks}
                className="h-8 px-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 transition-all"
              >
                <Play size={12} />
                <span>Run Pipeline</span>
              </button>
            )}

            {currentWorkspace.status === 'executing' && (
              <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-mono animate-pulse">
                <Loader2 size={14} className="animate-spin" />
                <span>Running...</span>
              </div>
            )}
          </div>

          {/* Checklist Nodes */}
          <div className="space-y-3">
            {currentWorkspace.tasks.map((task) => {
              const isWaiting = task.status === 'waiting_approval'
              return (
                <div 
                  key={task.id} 
                  className={`p-4 border rounded-xl flex flex-col gap-3 transition-all duration-200 ${
                    task.status === 'completed' ? 'bg-emerald-950/5 border-emerald-900/20' :
                    task.status === 'executing' ? 'bg-indigo-950/5 border-indigo-500/30 animate-pulse' :
                    isWaiting ? 'bg-amber-950/10 border-amber-500/40 glow-cyan' :
                    task.status === 'failed' ? 'bg-red-950/5 border-red-900/20' :
                    'bg-gray-900/40 border-cyber-border'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 shrink-0">
                        {task.status === 'completed' && <CheckCircle2 size={16} className="text-emerald-500" />}
                        {task.status === 'executing' && <Loader2 size={16} className="text-indigo-400 animate-spin" />}
                        {isWaiting && <AlertTriangle size={16} className="text-amber-500 animate-bounce" />}
                        {task.status === 'failed' && <AlertTriangle size={16} className="text-red-500" />}
                        {task.status === 'pending' && <Clock size={16} className="text-gray-600" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{task.name}</h4>
                        <p className="text-[11px] text-gray-400 mt-0.5">{task.description}</p>
                      </div>
                    </div>

                    <span className="text-[9px] font-mono px-2 py-0.5 bg-gray-800 border border-cyber-border text-gray-400 rounded">
                      {task.plugin}
                    </span>
                  </div>

                  {/* Safety approval panel if blocked */}
                  {isWaiting && (
                    <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-lg flex items-center justify-between text-xs gap-3">
                      <div className="text-amber-400 font-medium">
                        This action requires administrator authorization to execute.
                      </div>
                      <button
                        onClick={() => approveTask(task.id)}
                        className="h-8 px-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-md flex items-center gap-1 shrink-0 shadow-lg shadow-amber-600/20 transition-all"
                      >
                        <span>Approve</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  )}

                  {/* Error messaging panel */}
                  {task.status === 'failed' && task.error_message && (
                    <div className="p-2.5 bg-red-950/20 border border-red-500/20 rounded-lg font-mono text-[10px] text-red-400 break-all">
                      Error: {task.error_message}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Outputs and Files Tabs */}
      <div className="w-1/2 flex flex-col bg-gray-950/10 overflow-hidden">
        
        {/* Tabs switcher bar */}
        <div className="h-12 border-b border-cyber-border flex items-center justify-between px-6 bg-gray-950/30">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('notes')}
              className={`text-xs font-bold tracking-wide pb-1.5 transition-colors border-b-2 ${
                activeTab === 'notes' ? 'text-indigo-400 border-indigo-500' : 'text-gray-500 hover:text-gray-300 border-transparent'
              }`}
            >
              Notes Editor
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`text-xs font-bold tracking-wide pb-1.5 transition-colors border-b-2 ${
                activeTab === 'files' ? 'text-indigo-400 border-indigo-500' : 'text-gray-500 hover:text-gray-300 border-transparent'
              }`}
            >
              Files ({currentWorkspace.files.length})
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`text-xs font-bold tracking-wide pb-1.5 transition-colors border-b-2 ${
                activeTab === 'calendar' ? 'text-indigo-400 border-indigo-500' : 'text-gray-500 hover:text-gray-300 border-transparent'
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`text-xs font-bold tracking-wide pb-1.5 transition-colors border-b-2 ${
                activeTab === 'tasks' ? 'text-indigo-400 border-indigo-500' : 'text-gray-500 hover:text-gray-300 border-transparent'
              }`}
            >
              Tasks ({todoTasks.length})
            </button>
          </div>
        </div>

        {/* Dynamic tab contents */}
        <div className="flex-1 overflow-hidden p-6 relative">
          
          {/* Notes Workspace Monaco-like Editor */}
          {activeTab === 'notes' && (
            <div className="h-full flex flex-col space-y-4">
              {selectedFile ? (
                <>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="font-mono text-gray-500">{selectedFile}</span>
                    <button
                      onClick={handleSaveFile}
                      disabled={isSavingFile}
                      className="px-3 py-1.5 bg-gray-900 border border-cyber-border rounded hover:border-indigo-500 flex items-center gap-1.5 text-white font-bold"
                    >
                      {isSavingFile ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Save size={12} className="text-indigo-400" />
                      )}
                      <span>Save Changes</span>
                    </button>
                  </div>
                  <textarea
                    value={fileContent}
                    onChange={(e) => setFileContent(e.target.value)}
                    className="flex-1 bg-gray-900/60 border border-cyber-border rounded-xl p-4 font-mono text-xs text-gray-200 placeholder-gray-500 focus:outline-none resize-none focus:border-indigo-500/40"
                  />
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 text-xs">
                  <FileText size={32} className="mb-2" />
                  <span>No note file open. Select a file in the Files tab to start editing.</span>
                </div>
              )}
            </div>
          )}

          {/* Filesystem Browser */}
          {activeTab === 'files' && (
            <div className="space-y-4">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Sandboxed Workspace Root</div>
              {currentWorkspace.files.length === 0 ? (
                <div className="p-8 border border-dashed border-cyber-border text-center text-xs text-gray-500 rounded-xl">
                  No files generated yet. Complete file actions to output documents.
                </div>
              ) : (
                <div className="grid gap-2">
                  {currentWorkspace.files.map((file) => (
                    <button
                      key={file.path}
                      onClick={() => {
                        handleOpenFile(file.path)
                        setActiveTab('notes')
                      }}
                      className={`p-3 bg-gray-900 border text-left rounded-xl flex items-center justify-between group transition-colors ${
                        selectedFile === file.path ? 'border-indigo-500' : 'border-cyber-border hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText size={16} className="text-indigo-400" />
                        <div>
                          <span className="text-xs font-bold text-white group-hover:text-indigo-400 block">{file.name}</span>
                          <span className="text-[10px] text-gray-500 block mt-0.5">{file.path}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {Math.round(file.size_bytes / 10.24) / 100} KB
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Calendar list logs */}
          {activeTab === 'calendar' && (
            <div className="space-y-4">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Schedules created by Calendar plugin</div>
              {calendarEvents.length === 0 ? (
                <div className="p-8 border border-dashed border-cyber-border text-center text-xs text-gray-500 rounded-xl">
                  No events logged. Complete calendar scheduling blocks to view items.
                </div>
              ) : (
                <div className="space-y-3">
                  {calendarEvents.map((evt) => (
                    <div key={evt.id} className="p-4 bg-gray-900 border border-cyber-border rounded-xl flex items-start gap-3">
                      <CalendarIcon size={18} className="text-indigo-400 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-white">{evt.title}</h4>
                        <div className="text-[10px] text-gray-500 font-mono mt-1">
                          Starts: {new Date(evt.start_time).toLocaleString()} | Dur: {evt.duration_minutes}m
                        </div>
                        {evt.description && <p className="text-[11px] text-gray-400 mt-1.5">{evt.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Checkoff tracker list */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Tasks created by Task plugin</div>
              {todoTasks.length === 0 ? (
                <div className="p-8 border border-dashed border-cyber-border text-center text-xs text-gray-500 rounded-xl">
                  No task lists created. Complete task manager steps to view items.
                </div>
              ) : (
                <div className="space-y-2">
                  {todoTasks.map((todo) => (
                    <div 
                      key={todo.id} 
                      className="p-3.5 bg-gray-900 border border-cyber-border rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckSquare size={16} className={todo.completed ? 'text-emerald-500' : 'text-gray-600'} />
                        <span className={`text-xs font-semibold ${todo.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                          {todo.title}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                        todo.priority === 'high' ? 'bg-red-500/10 text-red-400' : 'bg-gray-800 text-gray-400'
                      }`}>
                        {todo.priority}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

    </div>
  )
}
