import { create } from 'zustand'

export interface TaskNode {
  id: string
  name: string
  description: string
  plugin: string
  action: string
  inputs: Record<string, any>
  outputs: Record<string, any>
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'skipped' | 'waiting_approval'
  error_message?: string
  dependencies: string[]
  retry_count: number
}

export interface WorkspaceSummary {
  id: string
  name: string
  prompt: string
  status: string
  created_at: string
  tasks_count: number
  completed_tasks: number
}

export interface WorkspaceDetail extends WorkspaceSummary {
  tasks: TaskNode[]
  files: Array<{ name: string; path: string; size_bytes: number }>
}

export interface ExecutionLog {
  timestamp: string
  type: string
  workspace_id?: string
  task_id?: string
  status?: string
  message: string
}

interface UILStore {
  workspaces: WorkspaceSummary[]
  currentWorkspace: WorkspaceDetail | null
  executionLogs: ExecutionLog[]
  commandBarOpen: boolean
  isLoading: boolean
  error: string | null
  websocket: WebSocket | null

  setCommandBarOpen: (open: boolean) => void
  fetchWorkspaces: () => Promise<void>
  fetchWorkspaceDetails: (id: string) => Promise<void>
  submitPrompt: (prompt: string) => Promise<string>
  executeWorkspace: (id: string) => Promise<void>
  approveTask: (taskId: string) => Promise<void>
  deleteWorkspace: (id: string) => Promise<void>
  connectWebSocket: () => void
  disconnectWebSocket: () => void
  clearLogs: () => void
}

export const useUILStore = create<UILStore>((set, get) => ({
  workspaces: [],
  currentWorkspace: null,
  executionLogs: [],
  commandBarOpen: false,
  isLoading: false,
  error: null,
  websocket: null,

  setCommandBarOpen: (open) => set({ commandBarOpen: open }),

  fetchWorkspaces: async () => {
    set({ isLoading: true })
    try {
      const res = await fetch('/api/workspaces')
      const data = await res.json()
      set({ workspaces: data, isLoading: false })
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
    }
  },

  fetchWorkspaceDetails: async (id) => {
    try {
      const res = await fetch(`/api/workspaces/${id}`)
      if (!res.ok) throw new Error('Workspace not found')
      const data = await res.json()
      set({ currentWorkspace: data })
    } catch (err: any) {
      set({ error: err.message })
    }
  },

  submitPrompt: async (prompt) => {
    set({ isLoading: true })
    try {
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })
      if (!res.ok) throw new Error('Failed to generate workspace plan')
      const data = await res.json()
      await get().fetchWorkspaces()
      set({ isLoading: false })
      return data.workspace_id
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
      throw err
    }
  },

  executeWorkspace: async (id) => {
    try {
      await fetch('/api/workspaces/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspace_id: id })
      })
      // Local optimism
      if (get().currentWorkspace?.id === id) {
        set({
          currentWorkspace: {
            ...get().currentWorkspace!,
            status: 'executing'
          }
        })
      }
    } catch (err: any) {
      set({ error: err.message })
    }
  },

  approveTask: async (taskId) => {
    try {
      const res = await fetch('/api/workspaces/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: taskId })
      })
      if (res.ok && get().currentWorkspace) {
        const updatedTasks = get().currentWorkspace!.tasks.map(t => 
          t.id === taskId ? { ...t, status: 'pending' as const } : t
        )
        set({
          currentWorkspace: {
            ...get().currentWorkspace!,
            status: 'executing',
            tasks: updatedTasks
          }
        })
      }
    } catch (err: any) {
      set({ error: err.message })
    }
  },

  deleteWorkspace: async (id) => {
    try {
      const res = await fetch(`/api/workspaces/${id}`, { method: 'DELETE' })
      if (res.ok) {
        set({
          workspaces: get().workspaces.filter(w => w.id !== id),
          currentWorkspace: get().currentWorkspace?.id === id ? null : get().currentWorkspace
        })
      }
    } catch (err: any) {
      set({ error: err.message })
    }
  },

  connectWebSocket: () => {
    // Prevent duplicate sockets
    if (get().websocket) return

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/api/ws/logs`
    const ws = new WebSocket(wsUrl)

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        const logItem: ExecutionLog = {
          timestamp: new Date().toLocaleTimeString(),
          type: msg.type,
          workspace_id: msg.workspace_id,
          task_id: msg.task_id,
          status: msg.status,
          message: msg.message || `Event received: ${msg.type}`
        }

        set((state) => ({
          executionLogs: [logItem, ...state.executionLogs].slice(0, 100)
        }))

        // Trigger detail refetch on key events to sync state automatically
        const curr = get().currentWorkspace
        if (curr && (msg.workspace_id === curr.id || (msg.task_id && msg.task_id.startsWith(curr.id)))) {
          get().fetchWorkspaceDetails(curr.id)
        }
        // Sync lists
        get().fetchWorkspaces()

      } catch (e) {
        console.error('Error parsing websocket data', e)
      }
    }

    ws.onclose = () => {
      set({ websocket: null })
      // Auto-reconnect after 3 seconds
      setTimeout(() => get().connectWebSocket(), 3000)
    }

    set({ websocket: ws })
  },

  disconnectWebSocket: () => {
    const ws = get().websocket
    if (ws) {
      ws.close()
      set({ websocket: null })
    }
  },

  clearLogs: () => set({ executionLogs: [] })
}))
