import React, { useState } from 'react';
import { 
  GitFork, 
  Plus, 
  ArrowDown, 
  Users, 
  ShieldCheck, 
  Stamp, 
  FileCheck, 
  Sliders, 
  Trash2,
  Sparkles,
  Zap,
  Play,
  Download,
  FileCode,
  CheckCircle2,
  Clock,
  Edit3,
  X
} from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';
import { downloadJsonBundle } from '../../utils/downloadUtils';

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'signer' | 'condition' | 'approver' | 'notary' | 'webhook' | 'complete';
  title: string;
  subtitle: string;
  conditionRule?: string;
  roleAssigned?: string;
  reminderDays?: number;
}

export const WorkflowCanvasBuilder: React.FC = () => {
  const { notify } = useSignFlow();

  const [nodes, setNodes] = useState<WorkflowNode[]>([
    { id: 'n-1', type: 'trigger', title: '1. Envelope Initiated', subtitle: 'Document uploaded with SHA-256 validation' },
    { id: 'n-2', type: 'signer', title: '2. Client Signer Action', subtitle: 'First Signer (SMS OTP Auth Required)', roleAssigned: 'David Vance', reminderDays: 2 },
    { id: 'n-3', type: 'condition', title: '3. Conditional Amount Gate', subtitle: 'Evaluate field: Amount > $50,000', conditionRule: 'totalAmount > 50000' },
    { id: 'n-4', type: 'approver', title: '4. Executive Approval Branch', subtitle: 'VP Finance (Elena Rostova)', roleAssigned: 'Elena Rostova (VP Finance)', reminderDays: 1 },
    { id: 'n-5', type: 'notary', title: '5. Remote Notary Checkpoint', subtitle: 'State of Texas Commission #TX-298192', roleAssigned: 'Catherine Bell' },
    { id: 'n-6', type: 'complete', title: '6. Cryptographic Seal & Fan-out', subtitle: 'Certificate of Completion + Webhook Event' }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNode, setEditingNode] = useState<WorkflowNode | null>(null);
  const [newNodeType, setNewNodeType] = useState<WorkflowNode['type']>('signer');
  const [newNodeTitle, setNewNodeTitle] = useState('');
  const [newNodeSubtitle, setNewNodeSubtitle] = useState('');
  const [newNodeRole, setNewNodeRole] = useState('Legal & Risk Counsel');

  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationActiveIndex, setSimulationActiveIndex] = useState<number | null>(null);

  const handleOpenAddModal = () => {
    setNewNodeTitle(`${nodes.length}. Secondary Review Step`);
    setNewNodeSubtitle('Approval checkpoint before execution');
    setShowAddModal(true);
  };

  const handleSaveNewNode = (e: React.FormEvent) => {
    e.preventDefault();
    const newNode: WorkflowNode = {
      id: 'n-' + Date.now(),
      type: newNodeType,
      title: newNodeTitle || `${nodes.length}. New Workflow Step`,
      subtitle: newNodeSubtitle || 'Automated execution step',
      roleAssigned: newNodeRole,
      reminderDays: 2
    };

    // Insert before the terminal complete node
    setNodes(prev => [...prev.slice(0, prev.length - 1), newNode, prev[prev.length - 1]]);
    setShowAddModal(false);
    notify('success', 'Workflow Step Inserted', `Added ${newNode.title} to pipeline canvas.`);
  };

  const handleDeleteStep = (id: string) => {
    if (nodes.length <= 2) {
      notify('warning', 'Minimum Nodes Limit', 'Workflow requires at least trigger and completion checkpoints.');
      return;
    }
    setNodes(prev => prev.filter(n => n.id !== id));
    notify('info', 'Node Removed', 'Workflow graph updated.');
  };

  const handleSimulateWorkflow = () => {
    setIsSimulating(true);
    setSimulationActiveIndex(0);

    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current < nodes.length) {
        setSimulationActiveIndex(current);
      } else {
        clearInterval(interval);
        setIsSimulating(false);
        setSimulationActiveIndex(null);
        notify('success', 'Workflow Simulation Completed!', 'All 6 pipeline steps verified with zero execution bottlenecks.');
      }
    }, 600);
  };

  const handleExportWorkflow = () => {
    const payload = {
      workflowName: 'Enterprise Conditional Approval Matrix 2026',
      exportedAt: new Date().toISOString(),
      nodesCount: nodes.length,
      pipelineNodes: nodes
    };
    downloadJsonBundle('SignFlow-Workflow-Blueprint.json', payload);
    notify('success', 'Workflow Blueprint Exported', 'Saved workflow structure as JSON.');
  };

  const handleLoadPreset = (presetName: string) => {
    if (presetName === 'nda') {
      setNodes([
        { id: 'n-1', type: 'trigger', title: '1. NDA Triggered', subtitle: 'Self-serve PowerForm intake' },
        { id: 'n-2', type: 'signer', title: '2. External Signer', subtitle: 'Counterparty Representative', roleAssigned: 'Counterparty Contact' },
        { id: 'n-3', type: 'approver', title: '3. Internal Legal Signoff', subtitle: 'General Counsel Signature', roleAssigned: 'Legal Team' },
        { id: 'n-4', type: 'complete', title: '4. Seal & Archive', subtitle: 'Store in Vault with Certificate' }
      ]);
      notify('success', 'Preset Loaded', 'Configured Fast-Track NDA Routing.');
    } else if (presetName === 'po') {
      setNodes([
        { id: 'n-1', type: 'trigger', title: '1. PO Generated', subtitle: 'ERP / NetSuite Trigger' },
        { id: 'n-2', type: 'condition', title: '2. Budget Check', subtitle: 'PO Amount > $100,000', conditionRule: 'amount > 100000' },
        { id: 'n-3', type: 'approver', title: '3. CFO Signature', subtitle: 'Executive Financial Signoff', roleAssigned: 'Chief Financial Officer' },
        { id: 'n-4', type: 'notary', title: '4. State Notary Seal', subtitle: 'Required for Government POs', roleAssigned: 'Official Notary' },
        { id: 'n-5', type: 'complete', title: '5. Executed & Dispatched', subtitle: 'Auto-invoice created in QuickBooks' }
      ]);
      notify('success', 'Preset Loaded', 'Configured High-Value Procurement PO Workflow.');
    }
  };

  const getNodeColor = (type: WorkflowNode['type'], isSimActive: boolean) => {
    if (isSimActive) {
      return 'border-emerald-400 bg-emerald-950/80 text-emerald-200 ring-4 ring-emerald-500/30 scale-105';
    }
    switch (type) {
      case 'trigger': return 'border-slate-700 bg-slate-900 text-slate-200';
      case 'signer': return 'border-indigo-500/50 bg-indigo-950/30 text-indigo-300';
      case 'condition': return 'border-amber-500/50 bg-amber-950/30 text-amber-300';
      case 'approver': return 'border-purple-500/50 bg-purple-950/30 text-purple-300';
      case 'notary': return 'border-emerald-500/50 bg-emerald-950/30 text-emerald-300';
      case 'webhook': return 'border-cyan-500/50 bg-cyan-950/30 text-cyan-300';
      case 'complete': return 'border-emerald-500 bg-emerald-950/50 text-emerald-200';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400">
            <GitFork className="w-5 h-5" />
            <h2 className="text-lg font-display font-bold text-white tracking-tight">
              Visual Conditional Routing & Workflow Orchestrator
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Build complex multi-party routing pipelines with automated branching rules, approval hierarchies, and notary checkpoints.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleSimulateWorkflow}
            disabled={isSimulating}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-emerald-400 font-semibold text-xs border border-emerald-500/30 flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Play className={`w-3.5 h-3.5 ${isSimulating ? 'animate-pulse' : ''}`} />
            <span>{isSimulating ? 'Simulating Pipeline...' : 'Test & Run Simulation'}</span>
          </button>

          <button
            onClick={handleExportWorkflow}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Export Workflow JSON"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-lg shadow-amber-600/30 flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Insert Step</span>
          </button>
        </div>
      </div>

      {/* Preset Quick Loader */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
        <div className="flex items-center space-x-2 text-slate-300 font-medium">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Workflow Presets:</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleLoadPreset('nda')}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] transition-colors cursor-pointer"
          >
            Fast-Track NDA
          </button>
          <button
            onClick={() => handleLoadPreset('po')}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] transition-colors cursor-pointer"
          >
            Procurement PO &gt; $100k
          </button>
        </div>
      </div>

      {/* Visual Flowchart Canvas */}
      <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col items-center space-y-4">
        {nodes.map((node, index) => {
          const isTerminal = index === nodes.length - 1;
          const isSimActive = simulationActiveIndex === index;

          return (
            <React.Fragment key={node.id}>
              {/* Node Card */}
              <div className={`w-full max-w-lg p-4 rounded-2xl border-2 transition-all duration-300 shadow-md flex items-center justify-between gap-3 ${getNodeColor(node.type, isSimActive)}`}>
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white">{node.title}</span>
                    {node.type === 'condition' && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 uppercase">
                        Dynamic Rule
                      </span>
                    )}
                    {node.type === 'notary' && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase">
                        RON Checkpoint
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 truncate">{node.subtitle}</p>
                  {node.roleAssigned && (
                    <span className="text-[10px] font-mono text-slate-400">Assigned: {node.roleAssigned}</span>
                  )}
                </div>

                <div className="flex items-center space-x-1">
                  {node.type !== 'trigger' && node.type !== 'complete' && (
                    <button
                      disabled={nodes.length <= 2}
                      onClick={() => handleDeleteStep(node.id)}
                      title={nodes.length <= 2 ? 'Minimum 2 workflow nodes required (Trigger & Completion)' : 'Delete Step'}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        nodes.length <= 2
                          ? 'text-slate-600 opacity-40 cursor-not-allowed'
                          : 'text-slate-500 hover:text-rose-400 hover:bg-slate-800'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Connecting Down Arrow */}
              {!isTerminal && (
                <div className="flex flex-col items-center text-slate-600">
                  <div className={`w-0.5 h-6 transition-colors duration-300 ${isSimActive ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                  <ArrowDown className={`w-4 h-4 -mt-1 transition-colors duration-300 ${isSimActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Add Step Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Insert Workflow Routing Step</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewNode} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-medium">Node Type</label>
                <select
                  value={newNodeType}
                  onChange={(e) => setNewNodeType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="signer">Sequential Signer Action</option>
                  <option value="approver">Executive / Legal Approver</option>
                  <option value="condition">Conditional Rule / Branch Gate</option>
                  <option value="notary">Remote Online Notary (RON)</option>
                  <option value="webhook">Webhook / API Trigger</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Step Title</label>
                <input
                  type="text"
                  value={newNodeTitle}
                  onChange={(e) => setNewNodeTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Description / Condition Rule</label>
                <input
                  type="text"
                  value={newNodeSubtitle}
                  onChange={(e) => setNewNodeSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Assigned Role</label>
                <input
                  type="text"
                  value={newNodeRole}
                  onChange={(e) => setNewNodeRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md cursor-pointer"
                >
                  Insert Step
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
