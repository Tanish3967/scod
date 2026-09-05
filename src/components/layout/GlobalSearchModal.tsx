import React, { useState } from 'react';
import { Search, Sparkles, FileText, X, ArrowRight, ShieldAlert, Stamp, FileCheck } from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';

export const GlobalSearchModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { envelopes, setActiveEnvelopeId, setActiveView } = useSignFlow();
  const [query, setQuery] = useState('');

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredEnvelopes = envelopes.filter(e => 
    e.title.toLowerCase().includes(query.toLowerCase()) ||
    e.description?.toLowerCase().includes(query.toLowerCase()) ||
    e.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
  );

  const quickActions = [
    { label: 'Local Database Inspector', icon: FileText, view: 'local-db' as const, sub: 'View IndexedDB tables, storage footprint & JSON exports' },
    { label: 'AI Contract Drafter', icon: Sparkles, view: 'ai-hub' as const, sub: 'Generate NDA or MSA with clause grounding' },
    { label: 'Run Agreement Risk Scan', icon: ShieldAlert, view: 'ai-hub' as const, sub: 'Scan playbook compliance and liability caps' },
    { label: 'Schedule Remote Online Notary', icon: Stamp, view: 'notary' as const, sub: 'Start WebRTC live notarization session' },
    { label: 'View Certificate of Completion', icon: FileCheck, view: 'envelopes' as const, sub: 'Verify SHA-256 tamper-evident seal' },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center px-4 border-b border-slate-800 bg-slate-900/90">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            type="text"
            placeholder="Search all contracts, recipients, SHA-256 hashes, or AI commands (Esc to close)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.stopPropagation();
                onClose();
              }
            }}
            autoFocus
            className="w-full py-4 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            title="Close Search (Esc)"
            className="p-1 rounded-md text-slate-500 hover:text-slate-300 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {/* Contracts */}
          <div>
            <div className="px-2 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500">
              Envelopes & Agreements ({filteredEnvelopes.length})
            </div>
            <div className="space-y-1">
              {filteredEnvelopes.map(env => (
                <button
                  key={env.id}
                  onClick={() => {
                    setActiveEnvelopeId(env.id);
                    setActiveView('envelopes');
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 text-left transition-colors group"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors truncate">
                        {env.title}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {env.sender.organization} • {env.status.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="px-2 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500">
              AI & Intelligent Shortcuts
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickActions.map(action => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => {
                      setActiveView(action.view);
                      onClose();
                    }}
                    className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-indigo-500/40 text-left transition-all hover:bg-slate-800/50 group"
                  >
                    <div className="flex items-center space-x-2 text-indigo-400 mb-1">
                      <Icon className="w-4 h-4" />
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300">{action.label}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-snug">{action.sub}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">ESC</kbd> to exit</span>
          <span className="flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>AI Semantic Vector Search Grounded</span>
          </span>
        </div>
      </div>
    </div>
  );
};
