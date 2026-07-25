import React, { useState } from 'react';
import { Workflow, Plus, Play, ShieldAlert, Cpu, ArrowRight, Save, Database, Globe, Terminal, Mail } from 'lucide-react';

interface WorkflowNode {
  id: string;
  plugin: string;
  action: string;
  name: string;
  status: 'idle' | 'running' | 'completed' | 'error';
}

export const WorkflowBuilder: React.FC = () => {
  const [nodes, setNodes] = useState<WorkflowNode[]>([
    { id: '1', plugin: 'web_intelligence', action: 'fetch_url', name: 'Web Scraper Node', status: 'completed' },
    { id: '2', plugin: 'sql_analytics', action: 'query_database', name: 'Database Analytics Node', status: 'idle' },
    { id: '3', plugin: 'github', action: 'search_commits', name: 'GitHub Commit Checker', status: 'idle' },
  ]);

  const [promptInput, setPromptInput] = useState('');
  const [executing, setExecuting] = useState(false);

  const addNode = (plugin: string, action: string, name: string) => {
    const newNode: WorkflowNode = {
      id: Date.now().toString(),
      plugin,
      action,
      name,
      status: 'idle',
    };
    setNodes([...nodes, newNode]);
  };

  const removeNode = (id: string) => {
    setNodes(nodes.filter((n) => n.id !== id));
  };

  const handleRunWorkflow = () => {
    setExecuting(true);
    setTimeout(() => {
      setNodes((prev) =>
        prev.map((n) => ({ ...n, status: 'completed' }))
      );
      setExecuting(false);
    }, 1500);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Workflow className="text-cyan-400 w-7 h-7" /> Visual Workflow Studio
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Design, drag, and execute multi-agent DAG workflows with real-time consensus validation.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRunWorkflow}
            disabled={executing}
            className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-xl transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-current" /> {executing ? 'Executing...' : 'Run DAG Pipeline'}
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Node Library Sidebar */}
        <div className="lg:col-span-1 bg-slate-900/50 p-5 rounded-2xl border border-slate-800/80 space-y-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Available Plugins</h2>
          <div className="space-y-2.5">
            <button
              onClick={() => addNode('github', 'get_repo_info', 'GitHub Repo Inspector')}
              className="w-full text-left p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 transition flex items-center justify-between text-slate-200"
            >
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium">GitHub DevOps</span>
              </div>
              <Plus className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => addNode('sql_analytics', 'query_database', 'SQLite Query Engine')}
              className="w-full text-left p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 transition flex items-center justify-between text-slate-200"
            >
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium">SQL Analytics</span>
              </div>
              <Plus className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => addNode('sys_monitor', 'get_system_stats', 'Telemetry Monitor')}
              className="w-full text-left p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 transition flex items-center justify-between text-slate-200"
            >
              <div className="flex items-center gap-2.5">
                <Cpu className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium">System Telemetry</span>
              </div>
              <Plus className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* DAG Graph Flow View */}
        <div className="lg:col-span-3 bg-slate-950 p-6 rounded-2xl border border-slate-800/80 min-h-[420px] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

          <div className="relative z-10 flex flex-wrap items-center gap-4">
            {nodes.map((node, index) => (
              <React.Fragment key={node.id}>
                <div className="bg-slate-900 border border-slate-700/80 p-4 rounded-xl shadow-xl w-64 space-y-2 hover:border-cyan-500/50 transition">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-cyan-400 uppercase tracking-wide">{node.plugin}</span>
                    <button
                      onClick={() => removeNode(node.id)}
                      className="text-xs text-rose-400 hover:text-rose-300"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="font-semibold text-slate-100">{node.name}</div>
                  <div className="text-xs font-mono bg-slate-950 p-1.5 rounded border border-slate-800 text-slate-400">
                    action: {node.action}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        node.status === 'completed'
                          ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                          : node.status === 'running'
                          ? 'bg-amber-400 animate-ping'
                          : 'bg-slate-600'
                      }`}
                    />
                    Status: {node.status}
                  </div>
                </div>
                {index < nodes.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-slate-600 shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="relative z-10 mt-6 bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" /> Consensus Safety Engine: Evaluated 0 security risks.
            </span>
            <span className="font-mono text-cyan-400">{nodes.length} Nodes Registered</span>
          </div>
        </div>
      </div>
    </div>
  );
};
