import React, { useState, useCallback, useEffect } from 'react'
import { 
  ReactFlow, 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  Connection,
  Edge
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Play, Plus, Save, Download, Trash2, HelpCircle } from 'lucide-react'

const initialNodes = [
  {
    id: 'trigger-1',
    type: 'input',
    data: { label: '📅 Trigger: Daily at 8:00 AM' },
    position: { x: 250, y: 25 },
    style: { background: '#111827', color: '#FFF', border: '1px solid #6366F1', borderRadius: '12px', padding: '10px' }
  },
  {
    id: 'action-1',
    data: { label: '📧 Plugin: Email Draft summaries' },
    position: { x: 250, y: 150 },
    style: { background: '#111827', color: '#FFF', border: '1px solid #1F2937', borderRadius: '12px', padding: '10px' }
  },
  {
    id: 'action-2',
    data: { label: '📅 Plugin: Calendar revision block' },
    position: { x: 100, y: 280 },
    style: { background: '#111827', color: '#FFF', border: '1px solid #1F2937', borderRadius: '12px', padding: '10px' }
  },
  {
    id: 'action-3',
    data: { label: '💻 Plugin: Execute shell checks' },
    position: { x: 400, y: 280 },
    style: { background: '#111827', color: '#FFF', border: '1px solid #1F2937', borderRadius: '12px', padding: '10px' }
  }
]

const initialEdges = [
  { id: 'e1-2', source: 'trigger-1', target: 'action-1', animated: true, style: { stroke: '#6366F1' } },
  { id: 'e2-3', source: 'action-1', target: 'action-2', style: { stroke: '#4B5563' } },
  { id: 'e2-4', source: 'action-1', target: 'action-3', style: { stroke: '#4B5563' } }
]

export default function Automation() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [ruleName, setRuleName] = useState('Daily Sync and Schedule Compiler')
  const [triggerType, setTriggerType] = useState('schedule')

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge({ ...params, style: { stroke: '#6366F1' } }, eds)),
    [setEdges]
  )

  const handleSaveWorkflow = async () => {
    try {
      const templateTasks = nodes.filter(n => n.id !== 'trigger-1').map(n => ({
        id: n.id,
        name: n.data.label,
        description: `Visual automation item step: ${n.id}`,
        plugin: n.id.includes('action-2') ? 'calendar' : n.id.includes('action-3') ? 'terminal' : 'email',
        action: n.id.includes('action-2') ? 'create_event' : n.id.includes('action-3') ? 'run_command' : 'draft_email',
        inputs: {},
        dependencies: edges.filter(e => e.target === n.id).map(e => e.source)
      }))

      const payload = {
        name: ruleName,
        trigger_type: triggerType,
        trigger_config: { interval_seconds: 3600 },
        task_graph_template: templateTasks
      }

      await fetch('/api/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      alert('Workflow saved and registered with UIL scheduler successfully!')
    } catch (e) {
      console.error(e)
    }
  }

  const handleAddNode = () => {
    const id = `action-${nodes.length + 1}`
    const newNode = {
      id,
      data: { label: `📦 New Plugin Action node` },
      position: { x: Math.random() * 400 + 50, y: Math.random() * 200 + 100 },
      style: { background: '#111827', color: '#FFF', border: '1px solid #1F2937', borderRadius: '12px', padding: '10px' }
    }
    setNodes((nds) => nds.concat(newNode))
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      
      {/* Top action controls bar */}
      <div className="h-14 border-b border-cyber-border bg-gray-950/20 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={ruleName}
            onChange={(e) => setRuleName(e.target.value)}
            className="bg-transparent border-b border-transparent hover:border-gray-700 focus:border-indigo-500 font-bold text-sm text-white focus:outline-none py-1 w-64"
          />
          <div className="h-4 w-[1px] bg-cyber-border"></div>
          <select
            value={triggerType}
            onChange={(e) => setTriggerType(e.target.value)}
            className="bg-gray-900 border border-cyber-border rounded px-2 py-1 text-xs text-gray-300 focus:outline-none"
          >
            <option value="schedule">Trigger: Schedule Interval</option>
            <option value="file_change">Trigger: File Created</option>
            <option value="webhook">Trigger: Incoming Webhook</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleAddNode}
            className="h-8 px-3 bg-gray-900 border border-cyber-border hover:border-indigo-500 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all text-white"
          >
            <Plus size={14} className="text-indigo-400" />
            <span>Add Block</span>
          </button>
          
          <button
            onClick={handleSaveWorkflow}
            className="h-8 px-3 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all text-white shadow-lg shadow-indigo-600/20"
          >
            <Save size={14} />
            <span>Save Workflow</span>
          </button>
        </div>
      </div>

      {/* Visual Canvas drawing board */}
      <div className="flex-1 bg-[#090D16] relative overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Controls />
          <MiniMap nodeStrokeColor="#6366F1" nodeColor="#111827" maskColor="rgba(11, 15, 25, 0.7)" />
          <Background color="#1F2937" gap={16} />
        </ReactFlow>
      </div>

    </div>
  )
}
