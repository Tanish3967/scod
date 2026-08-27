import React, { useState } from 'react';
import { Copy, Plus, Users, Send, FileText, ArrowRight, Sparkles, Filter } from 'lucide-react';
import { MOCK_TEMPLATES } from '../../data/mockTemplates';
import { useSignFlow } from '../../context/SignFlowContext';
import { BulkSendModal } from './BulkSendModal';
import { Template } from '../../types/signflow';

export const TemplateLibraryView: React.FC = () => {
  const { createNewEnvelope, notify } = useSignFlow();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeBulkTemplate, setActiveBulkTemplate] = useState<Template | null>(null);

  const categories = ['All', 'Legal & Corporate', 'Sales', 'HR & Hiring', 'Procurement'];

  const filtered = MOCK_TEMPLATES.filter(t => {
    if (selectedCategory === 'All') return true;
    return t.category === selectedCategory;
  });

  const handleUseTemplate = (tmpl: Template) => {
    createNewEnvelope({
      title: `${tmpl.name} (from Template)`,
      description: tmpl.description,
      tags: [tmpl.category, 'Template-Based'],
      documents: [tmpl.sampleDocument]
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400">
            <Copy className="w-5 h-5" />
            <h2 className="text-lg font-display font-bold text-white tracking-tight">
              Master Template Library
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Standardized, reusable agreements with predefined roles, auto-fill merge fields, and conditional workflows.
          </p>
        </div>

        <button
          onClick={() => notify('info', 'New Template Created', 'Launched template builder canvas')}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create New Template</span>
        </button>
      </div>

      {/* Categories */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2 text-xs overflow-x-auto">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(tmpl => (
          <div
            key={tmpl.id}
            className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-indigo-400 border border-slate-700 font-mono">
                  {tmpl.category}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Used {tmpl.usageCount} times</span>
              </div>

              <h3 className="text-sm font-bold text-white">{tmpl.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{tmpl.description}</p>

              {/* Roles Breakdown */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Predefined Roles:</span>
                <div className="space-y-1">
                  {tmpl.roles.map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300">• {r.roleName}</span>
                      <span className="text-[10px] font-mono text-slate-500">{r.defaultAuth}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => handleUseTemplate(tmpl)}
                className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors flex items-center justify-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Use Template</span>
              </button>

              <button
                onClick={() => setActiveBulkTemplate(tmpl)}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors flex items-center space-x-1.5"
                title="CSV Bulk Send"
              >
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>Bulk Send</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {activeBulkTemplate && (
        <BulkSendModal
          isOpen={true}
          onClose={() => setActiveBulkTemplate(null)}
          templateName={activeBulkTemplate.name}
        />
      )}
    </div>
  );
};
