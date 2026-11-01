import React, { useState } from 'react';
import { 
  GitFork, 
  Plus, 
  ArrowDown, 
  Users, 
  ShieldCheck, 
  Stamp, 
  Zap,
  Play,
  Download,
  FileCode,
  CheckCircle2,
  X,
  ArrowLeft,
  Save,
  AlertTriangle,
  RotateCcw,
  LogOut,
  Check,
  Layers,
  Sparkles,
  Trash2,
  Clock,
  Edit3,
  ChevronUp,
  ChevronDown,
  PlusCircle,
  GripVertical
} from 'lucide-react';
import { useSignFlow, AppView } from '../../context/SignFlowContext';
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

// Utility to clean existing leading sequence numbers from titles
export const getCleanTitle = (title: string): string => {
  return title.replace(/^\d+\.\s*/, '').trim();
};

const DEFAULT_INITIAL_NODES: WorkflowNode[] = [
  { id: 'n-1', type: 'trigger', title: 'Envelope Initiated', subtitle: 'Document uploaded with SHA-256 hash validation' },
  { id: 'n-2', type: 'signer', title: 'Client Signer Action', subtitle: 'Primary Signer (SMS OTP Auth Required)', roleAssigned: 'David Vance', reminderDays: 2 },
  { id: 'n-3', type: 'condition', title: 'Conditional Amount Gate', subtitle: 'Evaluate dynamic field: Total Contract Amount > $50,000', conditionRule: 'totalAmount > 50000' },
  { id: 'n-4', type: 'approver', title: 'Executive Approval Branch', subtitle: 'VP Finance Signoff (Elena Rostova)', roleAssigned: 'Elena Rostova (VP Finance)', reminderDays: 1 },
  { id: 'n-5', type: 'notary', title: 'Remote Notary Checkpoint', subtitle: 'State of Texas Commission #TX-298192', roleAssigned: 'Catherine Bell' },
  { id: 'n-6', type: 'complete', title: 'Cryptographic Seal & Fan-out', subtitle: 'Certificate of Completion appended + Webhook event dispatched' }
];

export const WorkflowCanvasBuilder: React.FC = () => {
  const { setActiveView, activeEnvelope, updateEnvelope, notify } = useSignFlow();

  const [initialNodesSnapshot, setInitialNodesSnapshot] = useState<WorkflowNode[]>(DEFAULT_INITIAL_NODES);
  const [nodes, setNodes] = useState<WorkflowNode[]>(DEFAULT_INITIAL_NODES);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Drag and Drop State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Modals & Active Edit/Insert Targets
  const [showAddModal, setShowAddModal] = useState(false);
  const [insertAtIndex, setInsertAtIndex] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingNode, setEditingNode] = useState<WorkflowNode | null>(null);
  const [showUnsavedExitModal, setShowUnsavedExitModal] = useState(false);
  const [pendingExitTarget, setPendingExitTarget] = useState<AppView>('prepare');

  // New Node Form State
  const [newNodeType, setNewNodeType] = useState<WorkflowNode['type']>('signer');
  const [newNodeTitle, setNewNodeTitle] = useState('');
  const [newNodeSubtitle, setNewNodeSubtitle] = useState('');
  const [newNodeRole, setNewNodeRole] = useState('Legal & Risk Counsel');
  const [newNodeRule, setNewNodeRule] = useState('totalAmount > 50000');
  const [newNodeReminder, setNewNodeReminder] = useState<number>(2);

  // Edit Node Form State
  const [editNodeType, setEditNodeType] = useState<WorkflowNode['type']>('signer');
  const [editNodeTitle, setEditNodeTitle] = useState('');
  const [editNodeSubtitle, setEditNodeSubtitle] = useState('');
  const [editNodeRole, setEditNodeRole] = useState('');
  const [editNodeRule, setEditNodeRule] = useState('');
  const [editNodeReminder, setEditNodeReminder] = useState<number>(2);

  // Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationActiveIndex, setSimulationActiveIndex] = useState<number | null>(null);

  // Open Add Step Modal at specific position
  const handleOpenAddModal = (targetIndex?: number) => {
    const defaultIdx = targetIndex !== undefined ? targetIndex : nodes.length - 1;
    setInsertAtIndex(defaultIdx);
    setNewNodeType('signer');
    setNewNodeTitle('Secondary Review Step');
    setNewNodeSubtitle('Approval checkpoint before execution');
    setNewNodeRole('Legal & Risk Counsel');
    setNewNodeRule('totalAmount > 50000');
    setNewNodeReminder(2);
    setShowAddModal(true);
  };

  // Quick Add Step Shortcut
  const handleQuickAddStep = (type: WorkflowNode['type'], targetIndex?: number) => {
    const targetIdx = targetIndex !== undefined ? targetIndex : nodes.length - 1;
    const presets: Record<WorkflowNode['type'], { title: string; subtitle: string; role: string; rule?: string }> = {
      signer: { title: 'Signer Verification', subtitle: 'Sequential recipient signature required (SMS OTP)', role: 'External Signer' },
      approver: { title: 'Executive Approval', subtitle: 'Internal management signoff & compliance check', role: 'VP Legal & Compliance' },
      condition: { title: 'Conditional Branch Gate', subtitle: 'Evaluate field rule: totalAmount > $25,000', role: '', rule: 'totalAmount > 25000' },
      notary: { title: 'Remote Online Notary Checkpoint', subtitle: 'State commissioned digital notary seal & live audio-video journal', role: 'Catherine Bell (Notary)' },
      webhook: { title: 'Webhook API Trigger', subtitle: 'POST envelope payload to CRM / ERP webhook listener', role: 'System API' },
      trigger: { title: 'Document Intake', subtitle: 'Document uploaded with SHA-256 validation', role: '' },
      complete: { title: 'Final Execution', subtitle: 'Certificate of Completion appended + Merkle lock', role: '' }
    };

    const preset = presets[type] || presets.signer;
    const newNode: WorkflowNode = {
      id: 'n-' + Date.now(),
      type,
      title: preset.title,
      subtitle: preset.subtitle,
      roleAssigned: preset.role || undefined,
      conditionRule: preset.rule,
      reminderDays: 2
    };

    setNodes(prev => {
      const next = [...prev];
      next.splice(targetIdx, 0, newNode);
      return next;
    });
    setHasUnsavedChanges(true);
    notify('success', 'Workflow Step Added', `Inserted Step ${targetIdx + 1}: ${newNode.title}. Sequence numbers auto-updated.`);
  };

  // Save New Node Handler
  const handleSaveNewNode = (e: React.FormEvent) => {
    e.preventDefault();
    const targetIdx = insertAtIndex !== null ? insertAtIndex : nodes.length - 1;
    const cleanTitle = getCleanTitle(newNodeTitle) || 'New Workflow Step';
    const newNode: WorkflowNode = {
      id: 'n-' + Date.now(),
      type: newNodeType,
      title: cleanTitle,
      subtitle: newNodeSubtitle || 'Automated execution step',
      roleAssigned: newNodeRole || undefined,
      conditionRule: newNodeType === 'condition' ? (newNodeRule || newNodeSubtitle) : undefined,
      reminderDays: newNodeReminder
    };

    setNodes(prev => {
      const next = [...prev];
      next.splice(targetIdx, 0, newNode);
      return next;
    });
    setHasUnsavedChanges(true);
    setShowAddModal(false);
    notify('success', 'Workflow Step Inserted', `Added Step ${targetIdx + 1}: ${cleanTitle}. All following steps re-sequenced.`);
  };

  // Open Edit Node Modal
  const handleOpenEditModal = (node: WorkflowNode) => {
    setEditingNode(node);
    setEditNodeType(node.type);
    setEditNodeTitle(getCleanTitle(node.title));
    setEditNodeSubtitle(node.subtitle);
    setEditNodeRole(node.roleAssigned || '');
    setEditNodeRule(node.conditionRule || '');
    setEditNodeReminder(node.reminderDays || 2);
    setShowEditModal(true);
  };

  // Save Edited Node Handler
  const handleSaveEditedNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNode) return;
    const cleanTitle = getCleanTitle(editNodeTitle) || editingNode.title;

    setNodes(prev => prev.map(n => {
      if (n.id === editingNode.id) {
        return {
          ...n,
          type: editNodeType,
          title: cleanTitle,
          subtitle: editNodeSubtitle,
          roleAssigned: editNodeRole || undefined,
          conditionRule: editNodeType === 'condition' ? (editNodeRule || editNodeSubtitle) : undefined,
          reminderDays: editNodeReminder
        };
      }
      return n;
    }));

    setHasUnsavedChanges(true);
    setShowEditModal(false);
    setEditingNode(null);
    notify('success', 'Step Updated', `Saved modifications to ${cleanTitle}.`);
  };

  // Reorder Step Up / Down
  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index <= 1) return; // cannot move above trigger
    if (direction === 'down' && index >= nodes.length - 2) return; // cannot move below complete

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    setNodes(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(index, 1);
      updated.splice(targetIndex, 0, moved);
      return updated;
    });
    setHasUnsavedChanges(true);
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (index === 0 || index === nodes.length - 1) {
      e.preventDefault();
      return;
    }
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    if (index === 0 || index === nodes.length - 1) return; // keep trigger and complete anchored
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragOverIndex === index) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const boundedTarget = Math.max(1, Math.min(nodes.length - 2, targetIndex));
    setNodes(prev => {
      const next = [...prev];
      const [movedItem] = next.splice(draggedIndex, 1);
      next.splice(boundedTarget, 0, movedItem);
      return next;
    });

    setHasUnsavedChanges(true);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Delete Step Handler
  const handleDeleteStep = (id: string) => {
    if (nodes.length <= 2) {
      notify('warning', 'Minimum Nodes Limit', 'Workflow requires at least trigger and completion checkpoints.');
      return;
    }
    setNodes(prev => prev.filter(n => n.id !== id));
    setHasUnsavedChanges(true);
    notify('info', 'Node Removed', 'Workflow graph updated & re-sequenced (Unsaved Changes).');
  };

  // Simulate Workflow
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
        notify('success', 'Workflow Simulation Completed!', `All ${nodes.length} pipeline steps verified with zero execution bottlenecks.`);
      }
    }, 600);
  };

  // Export Workflow Blueprint JSON
  const handleExportWorkflow = () => {
    const formattedNodes = nodes.map((node, idx) => ({
      ...node,
      sequenceOrder: idx + 1,
      title: `${idx + 1}. ${getCleanTitle(node.title)}`
    }));

    const payload = {
      workflowName: 'Enterprise Conditional Approval Matrix 2026',
      exportedAt: new Date().toISOString(),
      nodesCount: formattedNodes.length,
      pipelineNodes: formattedNodes
    };
    downloadJsonBundle('SignFlow-Workflow-Blueprint.json', payload);
    notify('success', 'Workflow Blueprint Exported', 'Saved workflow structure as JSON.');
  };

  // Preset Loader
  const handleLoadPreset = (presetName: string) => {
    if (presetName === 'nda') {
      const newPreset: WorkflowNode[] = [
        { id: 'n-1', type: 'trigger', title: 'NDA Intake Initiated', subtitle: 'Self-serve PowerForm intake with SHA-256 document hashing' },
        { id: 'n-2', type: 'signer', title: 'External Signer', subtitle: 'Counterparty Representative (Email OTP 2FA)', roleAssigned: 'Counterparty Contact', reminderDays: 2 },
        { id: 'n-3', type: 'approver', title: 'Internal Legal Signoff', subtitle: 'General Counsel Signature & Risk Validation', roleAssigned: 'Legal Team', reminderDays: 1 },
        { id: 'n-4', type: 'complete', title: 'Seal & Archive', subtitle: 'Store in Secure Vault with Certificate of Completion' }
      ];
      setNodes(newPreset);
      setHasUnsavedChanges(true);
      notify('success', 'Preset Loaded', 'Configured Fast-Track NDA Routing (Unsaved Changes).');
    } else if (presetName === 'po') {
      const newPreset: WorkflowNode[] = [
        { id: 'n-1', type: 'trigger', title: 'PO Generated', subtitle: 'ERP / NetSuite Trigger via Webhook' },
        { id: 'n-2', type: 'condition', title: 'Budget Check Gate', subtitle: 'Evaluate rule: PO Amount > $100,000', conditionRule: 'amount > 100000' },
        { id: 'n-3', type: 'approver', title: 'CFO Signature', subtitle: 'Executive Financial Signoff & Risk Review', roleAssigned: 'Chief Financial Officer' },
        { id: 'n-4', type: 'notary', title: 'State Notary Seal', subtitle: 'Remote Online Notary Required for Government POs', roleAssigned: 'Official Notary' },
        { id: 'n-5', type: 'complete', title: 'Executed & Dispatched', subtitle: 'Tamper-evident Merkle seal + Auto-invoice created' }
      ];
      setNodes(newPreset);
      setHasUnsavedChanges(true);
      notify('success', 'Preset Loaded', 'Configured High-Value Procurement PO Workflow (Unsaved Changes).');
    }
  };

  // Exit & Save Logic
  const handleRequestExit = (targetView: AppView = 'prepare') => {
    if (hasUnsavedChanges) {
      setPendingExitTarget(targetView);
      setShowUnsavedExitModal(true);
    } else {
      setActiveView(targetView);
    }
  };

  const handleSaveAndExit = (targetView?: AppView) => {
    const destination = targetView || pendingExitTarget || 'prepare';
    setInitialNodesSnapshot([...nodes]);
    setHasUnsavedChanges(false);
    setShowUnsavedExitModal(false);

    if (activeEnvelope) {
      updateEnvelope(activeEnvelope.id, {
        updatedAt: new Date().toISOString()
      });
    }

    notify('success', 'Workflow Saved Successfully', `Saved ${nodes.length}-step routing pipeline to active workspace.`);
    setActiveView(destination);
  };

  const handleExitWithoutSaving = (targetView?: AppView) => {
    const destination = targetView || pendingExitTarget || 'prepare';
    setNodes([...initialNodesSnapshot]);
    setHasUnsavedChanges(false);
    setShowUnsavedExitModal(false);
    notify('info', 'Workflow Changes Discarded', 'Exited workflow editor without saving modifications.');
    setActiveView(destination);
  };

  const handleSaveOnly = () => {
    setInitialNodesSnapshot([...nodes]);
    setHasUnsavedChanges(false);
    if (activeEnvelope) {
      updateEnvelope(activeEnvelope.id, {
        updatedAt: new Date().toISOString()
      });
    }
    notify('success', 'Workflow Changes Saved', 'Routing graph synchronized with active envelope.');
  };

  const getNodeIcon = (type: WorkflowNode['type']) => {
    switch (type) {
      case 'trigger': return Zap;
      case 'signer': return Users;
      case 'condition': return GitFork;
      case 'approver': return ShieldCheck;
      case 'notary': return Stamp;
      case 'webhook': return FileCode;
      case 'complete': return CheckCircle2;
    }
  };

  const getNodeConfig = (type: WorkflowNode['type'], isSimActive: boolean) => {
    if (isSimActive) {
      return {
        cardClass: 'border-2 border-emerald-500 bg-emerald-50/90 text-slate-900 ring-4 ring-emerald-500/20 scale-[1.02] shadow-lg',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
        avatarBg: 'bg-emerald-600 text-white shadow-xs',
        badgeText: 'SIMULATING...'
      };
    }
    switch (type) {
      case 'trigger':
        return {
          cardClass: 'border-2 border-slate-200 bg-white text-slate-900 hover:border-slate-300 shadow-xs',
          badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
          avatarBg: 'bg-slate-700 text-white shadow-xs',
          badgeText: 'Trigger Event'
        };
      case 'signer':
        return {
          cardClass: 'border-2 border-indigo-200/90 bg-indigo-50/30 text-slate-900 hover:border-indigo-300 shadow-xs',
          badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          avatarBg: 'bg-indigo-600 text-white shadow-xs',
          badgeText: 'Sequential Signer'
        };
      case 'condition':
        return {
          cardClass: 'border-2 border-amber-200/90 bg-amber-50/30 text-slate-900 hover:border-amber-300 shadow-xs',
          badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
          avatarBg: 'bg-amber-500 text-white shadow-xs',
          badgeText: 'Conditional Gate'
        };
      case 'approver':
        return {
          cardClass: 'border-2 border-purple-200/90 bg-purple-50/30 text-slate-900 hover:border-purple-300 shadow-xs',
          badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
          avatarBg: 'bg-purple-600 text-white shadow-xs',
          badgeText: 'Executive Approval'
        };
      case 'notary':
        return {
          cardClass: 'border-2 border-emerald-200/90 bg-emerald-50/30 text-slate-900 hover:border-emerald-300 shadow-xs',
          badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          avatarBg: 'bg-emerald-600 text-white shadow-xs',
          badgeText: 'RON Checkpoint'
        };
      case 'webhook':
        return {
          cardClass: 'border-2 border-cyan-200/90 bg-cyan-50/30 text-slate-900 hover:border-cyan-300 shadow-xs',
          badgeClass: 'bg-cyan-100 text-cyan-800 border-cyan-200',
          avatarBg: 'bg-cyan-600 text-white shadow-xs',
          badgeText: 'Webhook API'
        };
      case 'complete':
        return {
          cardClass: 'border-2 border-emerald-400 bg-emerald-50/50 text-slate-900 shadow-xs',
          badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          avatarBg: 'bg-emerald-600 text-white shadow-xs',
          badgeText: 'Cryptographic Seal'
        };
    }
  };

  return (
    <div className="space-y-6 pb-28 relative animate-fade-in select-none">
      {/* Top Header with Stitch Enterprise Theme & Save/Exit Controls */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            {/* Back Button to Studio */}
            <button
              onClick={() => handleRequestExit('prepare')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer flex items-center space-x-1.5 shadow-2xs text-xs font-semibold"
              title="Return to Document Studio"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit Editor</span>
            </button>

            <div className="h-5 w-px bg-slate-200" />

            <div className="flex items-center space-x-2 text-indigo-600">
              <GitFork className="w-5 h-5" />
              <h2 className="text-lg font-display font-bold text-slate-900 tracking-tight">
                Visual Conditional Routing & Workflow Orchestrator
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-2">
            <p className="text-xs text-slate-500">
              Build multi-party routing pipelines with automated branching rules, approval hierarchies, and drag-and-drop reordering.
            </p>

            {hasUnsavedChanges ? (
              <span className="inline-flex items-center space-x-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                <AlertTriangle className="w-3 h-3" />
                <span>Unsaved Changes</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Check className="w-3 h-3" />
                <span>Synced</span>
              </span>
            )}
          </div>
        </div>

        {/* Primary Action Button Cluster */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {/* Test & Simulate Button */}
          <button
            onClick={handleSimulateWorkflow}
            disabled={isSimulating}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 text-emerald-700 font-semibold text-xs border border-emerald-200 flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <Play className={`w-3.5 h-3.5 ${isSimulating ? 'animate-pulse text-emerald-600' : ''}`} />
            <span>{isSimulating ? 'Simulating...' : 'Test & Simulate'}</span>
          </button>

          {/* Export JSON Button */}
          <button
            onClick={handleExportWorkflow}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
            title="Export Workflow JSON Blueprint"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Insert Step Button */}
          <button
            onClick={() => handleOpenAddModal(nodes.length - 1)}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Step</span>
          </button>

          {/* Direct Save Button */}
          <button
            onClick={handleSaveOnly}
            className={`px-3.5 py-2 rounded-xl font-semibold text-xs flex items-center space-x-1.5 transition-all cursor-pointer ${
              hasUnsavedChanges
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>

          {/* Save & Exit Primary CTA */}
          <button
            onClick={() => handleSaveAndExit('prepare')}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Save & Exit</span>
          </button>

          {/* Exit Button */}
          <button
            onClick={() => handleRequestExit('prepare')}
            className="px-3 py-2 rounded-xl bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer flex items-center space-x-1 shadow-2xs"
            title="Exit Workflow Editor"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit</span>
          </button>
        </div>
      </div>

      {/* Quick Step Palette & Presets Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Step Palette Quick Actions */}
        <div className="lg:col-span-7 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center space-x-1.5 text-slate-800 font-semibold mr-1">
            <PlusCircle className="w-4 h-4 text-indigo-600" />
            <span>Quick Add Step:</span>
          </div>
          <button
            onClick={() => handleQuickAddStep('signer')}
            className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold border border-indigo-200/80 flex items-center space-x-1 transition-colors cursor-pointer shadow-2xs"
          >
            <Users className="w-3 h-3" />
            <span>+ Signer</span>
          </button>
          <button
            onClick={() => handleQuickAddStep('approver')}
            className="px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold border border-purple-200/80 flex items-center space-x-1 transition-colors cursor-pointer shadow-2xs"
          >
            <ShieldCheck className="w-3 h-3" />
            <span>+ Approver</span>
          </button>
          <button
            onClick={() => handleQuickAddStep('condition')}
            className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold border border-amber-200/80 flex items-center space-x-1 transition-colors cursor-pointer shadow-2xs"
          >
            <GitFork className="w-3 h-3" />
            <span>+ Condition Gate</span>
          </button>
          <button
            onClick={() => handleQuickAddStep('notary')}
            className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold border border-emerald-200/80 flex items-center space-x-1 transition-colors cursor-pointer shadow-2xs"
          >
            <Stamp className="w-3 h-3" />
            <span>+ Remote Notary</span>
          </button>
          <button
            onClick={() => handleQuickAddStep('webhook')}
            className="px-2.5 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-700 font-semibold border border-cyan-200/80 flex items-center space-x-1 transition-colors cursor-pointer shadow-2xs"
          >
            <FileCode className="w-3 h-3" />
            <span>+ Webhook API</span>
          </button>
        </div>

        {/* Preset Quick Loader */}
        <div className="lg:col-span-5 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-slate-700 font-medium">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Templates:</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleLoadPreset('nda')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-700 font-semibold text-[11px] border border-transparent transition-all cursor-pointer shadow-2xs"
            >
              Fast-Track NDA
            </button>
            <button
              onClick={() => handleLoadPreset('po')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-700 font-semibold text-[11px] border border-transparent transition-all cursor-pointer shadow-2xs"
            >
              Procurement PO &gt; $100k
            </button>
          </div>
        </div>
      </div>

      {/* Drag & Drop Instruction Banner */}
      <div className="px-4 py-2 rounded-xl bg-indigo-50/70 border border-indigo-200/70 text-indigo-900 text-xs flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <GripVertical className="w-4 h-4 text-indigo-600" />
          <span>
            <strong>Drag & Drop Reordering Enabled:</strong> Grab any step's grip handle <span className="font-mono bg-white px-1 py-0.5 rounded border border-indigo-200">⠿</span> to drag and reorder. Sequence numbers automatically adjust for all preceding and following steps.
          </span>
        </div>
        <span className="text-[10.5px] font-mono text-indigo-700 font-semibold bg-white/90 px-2 py-0.5 rounded-full border border-indigo-200">
          {nodes.length} Dynamic Nodes
        </span>
      </div>

      {/* Visual Flowchart Canvas */}
      <div className="p-8 sm:p-12 rounded-3xl bg-slate-50/80 border border-slate-200/80 shadow-xs flex flex-col items-center space-y-3 relative">
        {nodes.map((node, index) => {
          const isFirst = index === 0;
          const isTerminal = index === nodes.length - 1;
          const isDraggable = !isFirst && !isTerminal;
          const isSimActive = simulationActiveIndex === index;
          const isBeingDragged = draggedIndex === index;
          const isDropTarget = dragOverIndex === index;

          const NodeIcon = getNodeIcon(node.type);
          const config = getNodeConfig(node.type, isSimActive);
          const cleanTitle = getCleanTitle(node.title);

          return (
            <React.Fragment key={node.id}>
              {/* In-Line Step Insertion Connector (Between Nodes) */}
              {!isFirst && (
                <div className="group relative flex flex-col items-center py-1">
                  <div className={`w-0.5 h-7 transition-colors duration-300 ${isSimActive ? 'bg-emerald-500' : 'bg-slate-300 group-hover:bg-indigo-400'}`} />
                  
                  {/* Interactive In-line '+' Button on Arrow */}
                  <div className="absolute top-1/2 -translate-y-1/2 z-10 flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenAddModal(index)}
                      className="px-2.5 py-1 rounded-full bg-white hover:bg-indigo-600 hover:text-white text-indigo-700 border border-indigo-200 hover:border-indigo-600 shadow-sm transition-all duration-200 flex items-center space-x-1 text-[11px] font-bold cursor-pointer opacity-80 hover:opacity-100 hover:scale-105"
                      title={`Insert new workflow step between Step ${index} and Step ${index + 1}`}
                    >
                      <Plus className="w-3 h-3 stroke-[3]" />
                      <span className="hidden sm:inline">Add Step Here</span>
                    </button>
                  </div>

                  <ArrowDown className={`w-4 h-4 -mt-1 transition-colors duration-300 ${isSimActive ? 'text-emerald-500 animate-bounce' : 'text-slate-400 group-hover:text-indigo-500'}`} />
                </div>
              )}

              {/* Node Card with Drag & Drop */}
              <div 
                draggable={isDraggable}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={(e) => handleDragLeave(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`w-full max-w-xl p-5 rounded-2xl transition-all duration-200 shadow-xs flex items-center justify-between gap-3 select-none ${config.cardClass} ${
                  isBeingDragged ? 'opacity-30 border-dashed border-indigo-400 scale-[0.98]' : ''
                } ${
                  isDropTarget ? 'ring-4 ring-indigo-500/30 border-indigo-500 bg-indigo-50/70 scale-[1.02]' : ''
                }`}
              >
                {/* Drag Handle on the far left */}
                {isDraggable && (
                  <div 
                    className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-100/50 rounded-lg transition-colors shrink-0"
                    title="Drag to reorder step"
                  >
                    <GripVertical className="w-4 h-4" />
                  </div>
                )}

                <div className="flex items-start space-x-3.5 min-w-0 flex-1">
                  {/* Avatar Icon / Step Counter */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-transform ${config.avatarBg} ${isSimActive ? 'scale-110' : ''}`}>
                    <NodeIcon className="w-4 h-4" />
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      {/* DYNAMIC SEQUENCE NUMBERING (Always dynamically rendered based on 1-based index) */}
                      <span className="text-xs font-bold text-slate-900 font-sans">
                        {index + 1}. {cleanTitle}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase tracking-wider ${config.badgeClass}`}>
                        {config.badgeText}
                      </span>
                      {node.reminderDays && (
                        <span className="text-[10px] text-slate-400 flex items-center space-x-0.5">
                          <Clock className="w-3 h-3 inline text-slate-400" />
                          <span>{node.reminderDays}d reminder</span>
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-600 leading-snug">{node.subtitle}</p>

                    {/* Condition Branch Details */}
                    {node.type === 'condition' && (
                      <div className="pt-2 grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded-xl bg-white border border-emerald-200 text-emerald-800 shadow-2xs">
                          <strong className="block text-[11px] font-bold">Branch A: True (&gt; $50k)</strong>
                          <span className="text-[10px] text-slate-500">Route to VP Finance Approval</span>
                        </div>
                        <div className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 shadow-2xs">
                          <strong className="block text-[11px] font-bold">Branch B: False (≤ $50k)</strong>
                          <span className="text-[10px] text-slate-400">Fast-Track directly to Notary</span>
                        </div>
                      </div>
                    )}

                    {node.roleAssigned && (
                      <div className="pt-0.5">
                        <span className="text-[10.5px] font-mono text-slate-600 bg-white/80 px-2 py-0.5 rounded border border-slate-200/80 inline-block shadow-2xs">
                          Assigned: <strong className="text-slate-800">{node.roleAssigned}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Node Actions (Edit, Move Up/Down, Delete) */}
                <div className="flex items-center space-x-1 shrink-0 self-start">
                  {/* Reorder Up */}
                  {!isFirst && !isTerminal && index > 1 && (
                    <button
                      onClick={() => handleMoveStep(index, 'up')}
                      title="Move Step Up"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Reorder Down */}
                  {!isFirst && !isTerminal && index < nodes.length - 2 && (
                    <button
                      onClick={() => handleMoveStep(index, 'down')}
                      title="Move Step Down"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Edit Node */}
                  {!isTerminal && (
                    <button
                      onClick={() => handleOpenEditModal(node)}
                      title="Edit Workflow Step"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Delete Node */}
                  {node.type !== 'trigger' && node.type !== 'complete' && (
                    <button
                      disabled={nodes.length <= 2}
                      onClick={() => handleDeleteStep(node.id)}
                      title={nodes.length <= 2 ? 'Minimum 2 workflow nodes required (Trigger & Completion)' : 'Delete Step'}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        nodes.length <= 2
                          ? 'text-slate-300 cursor-not-allowed opacity-40'
                          : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}

        {/* Bottom Prominent "+ Add Step" Card */}
        <div className="w-full max-w-xl pt-4">
          <button
            onClick={() => handleOpenAddModal(nodes.length - 1)}
            className="w-full py-3.5 rounded-2xl border-2 border-dashed border-indigo-300 hover:border-indigo-500 bg-indigo-50/40 hover:bg-indigo-50/80 text-indigo-700 font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer group shadow-2xs"
          >
            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span>+ Add New Workflow Step to Pipeline</span>
          </button>
        </div>
      </div>

      {/* Sticky Floating Bottom Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/95 border border-slate-200/90 shadow-2xl backdrop-blur-md rounded-2xl px-6 py-3 flex items-center space-x-4 text-slate-700">
        <div className="flex items-center space-x-2 text-xs">
          <Layers className="w-4 h-4 text-indigo-600" />
          <span className="font-semibold text-slate-800">{nodes.length} Steps in Pipeline</span>
          <span className="text-slate-300">•</span>
          {hasUnsavedChanges ? (
            <span className="text-amber-600 font-bold flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>Unsaved Edits</span>
            </span>
          ) : (
            <span className="text-emerald-600 font-bold flex items-center space-x-1">
              <Check className="w-3.5 h-3.5" />
              <span>Saved</span>
            </span>
          )}
        </div>

        <div className="h-4 w-px bg-slate-200" />

        <div className="flex items-center space-x-2">
          {/* Add Step Shortcut */}
          <button
            onClick={() => handleOpenAddModal(nodes.length - 1)}
            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200 transition-colors cursor-pointer flex items-center space-x-1 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Step</span>
          </button>

          {hasUnsavedChanges ? (
            <button
              onClick={() => handleExitWithoutSaving('prepare')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer flex items-center space-x-1 shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Discard & Exit</span>
            </button>
          ) : (
            <button
              onClick={() => handleRequestExit('prepare')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer flex items-center space-x-1 shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit to Studio</span>
            </button>
          )}

          <button
            onClick={() => handleSaveAndExit('prepare')}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs flex items-center space-x-1.5 transition-transform hover:scale-105 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save & Exit to Studio</span>
          </button>

          <button
            onClick={() => handleSaveAndExit('dashboard')}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer shadow-2xs"
          >
            Dashboard
          </button>
        </div>
      </div>

      {/* Unsaved Changes Confirmation Modal */}
      {showUnsavedExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center space-x-3 text-amber-600">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Unsaved Workflow Changes</h3>
                <p className="text-xs text-slate-500">You have modified the pipeline configuration</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Would you like to save your <strong className="text-slate-900">{nodes.length} routing steps</strong> before exiting the workflow orchestrator?
            </p>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
              <p>• Initial Nodes: <span className="font-mono text-slate-800 font-semibold">{initialNodesSnapshot.length} steps</span></p>
              <p>• Current Nodes: <span className="font-mono text-indigo-600 font-bold">{nodes.length} steps</span></p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowUnsavedExitModal(false)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Keep Editing
              </button>

              <button
                type="button"
                onClick={() => handleExitWithoutSaving(pendingExitTarget)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition-colors cursor-pointer"
              >
                Exit Without Saving
              </button>

              <button
                type="button"
                onClick={() => handleSaveAndExit(pendingExitTarget)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center space-x-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save & Exit</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insert / Add Step Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-indigo-600">
                <PlusCircle className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900 font-display">Add Workflow Routing Step</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewNode} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-700 block mb-1 font-semibold">Node Type</label>
                <select
                  value={newNodeType}
                  onChange={(e) => setNewNodeType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs font-medium"
                >
                  <option value="signer">Sequential Signer Action (SMS / Email OTP)</option>
                  <option value="approver">Executive / Legal Approver Signoff</option>
                  <option value="condition">Conditional Rule / Branch Gate (If/Else)</option>
                  <option value="notary">Remote Online Notary (RON) Session</option>
                  <option value="webhook">Webhook / REST API Trigger</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-semibold">Step Position in Pipeline</label>
                <select
                  value={insertAtIndex !== null ? insertAtIndex : nodes.length - 1}
                  onChange={(e) => setInsertAtIndex(parseInt(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs font-medium"
                >
                  {nodes.map((n, idx) => (
                    <option key={n.id} value={idx}>
                      {idx === 0 ? 'Position 1: At Beginning (Before ' + getCleanTitle(n.title) + ')' : `Position ${idx + 1}: After Step ${idx} (${getCleanTitle(nodes[idx - 1].title)})`}
                    </option>
                  ))}
                  <option value={nodes.length - 1}>Before Terminal Seal (Step {nodes.length})</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-semibold">Step Title</label>
                <input
                  type="text"
                  value={newNodeTitle}
                  onChange={(e) => setNewNodeTitle(e.target.value)}
                  placeholder="e.g. Compliance Risk Signoff"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-semibold">Description / Condition Rule</label>
                <input
                  type="text"
                  value={newNodeSubtitle}
                  onChange={(e) => setNewNodeSubtitle(e.target.value)}
                  placeholder="e.g. Mandatory VP approval if liability exceeds threshold"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-semibold">Assigned Role / Person</label>
                <input
                  type="text"
                  value={newNodeRole}
                  onChange={(e) => setNewNodeRole(e.target.value)}
                  placeholder="e.g. Elena Rostova (VP Finance)"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
                >
                  Insert Step
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Step Modal */}
      {showEditModal && editingNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-indigo-600">
                <Edit3 className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900 font-display">Edit Workflow Step</h3>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedNode} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-700 block mb-1 font-semibold">Node Type</label>
                <select
                  value={editNodeType}
                  onChange={(e) => setEditNodeType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs font-medium"
                >
                  <option value="signer">Sequential Signer Action</option>
                  <option value="approver">Executive / Legal Approver</option>
                  <option value="condition">Conditional Rule / Branch Gate</option>
                  <option value="notary">Remote Online Notary (RON)</option>
                  <option value="webhook">Webhook / API Trigger</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-semibold">Step Title</label>
                <input
                  type="text"
                  value={editNodeTitle}
                  onChange={(e) => setEditNodeTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs font-semibold"
                  required
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-semibold">Description / Subtitle</label>
                <input
                  type="text"
                  value={editNodeSubtitle}
                  onChange={(e) => setEditNodeSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-semibold">Assigned Role</label>
                <input
                  type="text"
                  value={editNodeRole}
                  onChange={(e) => setEditNodeRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-semibold">Auto-Reminder Schedule</label>
                <select
                  value={editNodeReminder}
                  onChange={(e) => setEditNodeReminder(parseInt(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs"
                >
                  <option value={1}>Every 24 Hours (1 Day)</option>
                  <option value={2}>Every 48 Hours (2 Days)</option>
                  <option value={3}>Every 72 Hours (3 Days)</option>
                  <option value={7}>Weekly (7 Days)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
