import React, { useEffect, useState } from 'react'
import { Network, Database, User, FileText, CheckSquare, Sparkles, Layers } from 'lucide-react'

interface GraphNode {
  id: string
  label: string
  type: string
  properties: Record<string, any>
  x?: number
  y?: number
}

interface GraphLink {
  id: string
  source: string
  target: string
  relation: string
  properties: Record<string, any>
}

export default function KnowledgeGraphPage() {
  const [nodes, setNodes] = useState<GraphNode[]>([])
  const [links, setLinks] = useState<GraphLink[]>([])
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchGraphData = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/graph')
      const data = await res.json()
      
      // Assign deterministic layout coordinates to nodes for stable SVG rendering
      // Group by type, space them out radially or in grid
      const types = Array.from(new Set(data.nodes.map((n: any) => n.type)))
      const layedNodes = data.nodes.map((node: any, idx: number) => {
        const typeIndex = types.indexOf(node.type)
        const totalInGroup = data.nodes.filter((n: any) => n.type === node.type).length
        const groupIndex = data.nodes.filter((n: any) => n.type === node.type).indexOf(node)
        
        // Calculate coordinates based on radial layout
        const angle = (2 * Math.PI * groupIndex) / (totalInGroup || 1) + (typeIndex * (Math.PI / 4))
        const radius = 100 + typeIndex * 70
        
        return {
          ...node,
          x: 400 + radius * Math.cos(angle),
          y: 280 + radius * Math.sin(angle)
        }
      })

      setNodes(layedNodes)
      setLinks(data.links)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchGraphData()
  }, [])

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'workspace': return '#6366F1' // indigo
      case 'task': return '#10B981' // emerald
      case 'person': return '#06B6D4' // cyan
      case 'document': return '#EC4899' // pink
      case 'concept': return '#F59E0B' // amber
      default: return '#9CA3AF'
    }
  }

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'workspace': return <Layers size={14} />
      case 'task': return <CheckSquare size={14} />
      case 'person': return <User size={14} />
      case 'document': return <FileText size={14} />
      case 'concept': return <Sparkles size={14} />
      default: return <Database size={14} />
    }
  }

  return (
    <div className="h-full flex divide-x divide-cyber-border overflow-hidden">
      
      {/* Visual SVG Canvas */}
      <div className="flex-1 bg-[#090D16] relative flex items-center justify-center overflow-hidden">
        {isLoading ? (
          <div className="text-center text-gray-500 flex flex-col items-center gap-2">
            <span className="h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
            <span>Plotting workspace nodes...</span>
          </div>
        ) : nodes.length === 0 ? (
          <div className="text-center text-gray-500">
            <Network size={40} className="mx-auto mb-2 text-gray-600" />
            <span>No nodes in knowledge graph. Run some workspaces to populate relationships.</span>
          </div>
        ) : (
          <svg className="w-full h-full select-none cursor-grab active:cursor-grabbing" viewBox="0 0 800 560">
            
            {/* Draw Links/Edges */}
            <g>
              {links.map((link) => {
                const srcNode = nodes.find(n => n.id === link.source)
                const tgtNode = nodes.find(n => n.id === link.target)
                if (!srcNode || !tgtNode) return null
                
                const midX = (srcNode.x! + tgtNode.x!) / 2
                const midY = (srcNode.y! + tgtNode.y!) / 2

                return (
                  <g key={link.id}>
                    <line
                      x1={srcNode.x}
                      y1={srcNode.y}
                      x2={tgtNode.x}
                      y2={tgtNode.y}
                      stroke="#1F2937"
                      strokeWidth={1.5}
                      strokeDasharray={link.relation === 'triggers' ? '4 4' : 'none'}
                    />
                    {/* Tiny link labels */}
                    <text
                      x={midX}
                      y={midY - 4}
                      fill="#4B5563"
                      fontSize={8}
                      fontWeight="bold"
                      textAnchor="middle"
                      className="bg-gray-950 px-1"
                    >
                      {link.relation}
                    </text>
                  </g>
                )
              })}
            </g>

            {/* Draw Nodes */}
            <g>
              {nodes.map((node) => {
                const color = getNodeColor(node.type)
                const isSelected = selectedNode?.id === node.id

                return (
                  <g 
                    key={node.id} 
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => setSelectedNode(node)}
                    className="cursor-pointer group"
                  >
                    {/* Highlight Ring */}
                    <circle
                      r={isSelected ? 22 : 18}
                      fill="transparent"
                      stroke={color}
                      strokeWidth={isSelected ? 3 : 1}
                      className="transition-all duration-150 group-hover:stroke-white"
                    />
                    
                    {/* Core Circle */}
                    <circle
                      r={14}
                      fill="#0B0F19"
                      stroke={color}
                      strokeWidth={2}
                    />

                    {/* Node text labels */}
                    <text
                      y={30}
                      fill={isSelected ? '#FFF' : '#9CA3AF'}
                      fontSize={10}
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      textAnchor="middle"
                      className="select-none transition-colors"
                    >
                      {node.label}
                    </text>
                  </g>
                )
              })}
            </g>
          </svg>
        )}

        {/* Refetch Trigger Widget */}
        <button 
          onClick={fetchGraphData}
          className="absolute bottom-4 right-4 h-8 px-3 bg-gray-900 border border-cyber-border hover:border-indigo-500 rounded-lg text-xs font-bold text-gray-300 hover:text-white transition-all"
        >
          Replot Canvas
        </button>
      </div>

      {/* RIGHT COLUMN: Node Inspector Panel */}
      <div className="w-80 bg-gray-950 border-l border-cyber-border flex flex-col p-6 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Semantic Inspector</h3>
          <p className="text-[11px] text-gray-500 mt-1">Audit variables and linkages on selected entities.</p>
        </div>

        {selectedNode ? (
          <div className="space-y-4 flex-1 overflow-y-auto scrollbar-thin">
            <div className="p-4 bg-gray-900/50 border border-cyber-border rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <div 
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: getNodeColor(selectedNode.type) }}
                >
                  {getNodeIcon(selectedNode.type)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-none">{selectedNode.label}</h4>
                  <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider mt-1 block">
                    Type: {selectedNode.type}
                  </span>
                </div>
              </div>
              
              <div className="h-[1px] bg-cyber-border" />

              <div className="space-y-2">
                <div className="text-[10px] font-bold text-gray-500 uppercase">Properties</div>
                <pre className="text-[11px] font-mono bg-gray-950 p-3 rounded-lg border border-cyber-border text-gray-400 overflow-x-auto">
                  {JSON.stringify(selectedNode.properties, null, 2)}
                </pre>
              </div>
            </div>

            {/* List neighboring connections */}
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Linked Contexts</div>
              <div className="space-y-1">
                {links
                  .filter(l => l.source === selectedNode.id || l.target === selectedNode.id)
                  .map((link) => {
                    const otherNodeId = link.source === selectedNode.id ? link.target : link.source
                    const otherNode = nodes.find(n => n.id === otherNodeId)
                    if (!otherNode) return null

                    return (
                      <div 
                        key={link.id} 
                        className="p-2.5 bg-gray-900/30 border border-cyber-border rounded-lg flex items-center justify-between text-xs cursor-pointer hover:border-indigo-500/20"
                        onClick={() => setSelectedNode(otherNode)}
                      >
                        <span className="text-gray-400">{link.relation}</span>
                        <span className="font-semibold text-white">{otherNode.label}</span>
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-600 text-xs">
            <Network size={32} className="mb-2" />
            <span>Select a node on the canvas to audit properties.</span>
          </div>
        )}
      </div>

    </div>
  )
}
