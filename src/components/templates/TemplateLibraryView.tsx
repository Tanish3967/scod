import React, { useState } from 'react';
import { 
  Copy, 
  Plus, 
  Users, 
  Send, 
  FileText, 
  ArrowRight, 
  Sparkles, 
  Filter, 
  Eye, 
  Trash2, 
  Check, 
  FileCheck,
  X 
} from 'lucide-react';
import { MOCK_TEMPLATES } from '../../data/mockTemplates';
import { useSignFlow } from '../../context/SignFlowContext';
import { BulkSendModal } from './BulkSendModal';
import { Template, AuthType } from '../../types/signflow';

export const TemplateLibraryView: React.FC = () => {
  const { createNewEnvelope, notify } = useSignFlow();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeBulkTemplate, setActiveBulkTemplate] = useState<Template | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [templates, setTemplates] = useState<Template[]>(MOCK_TEMPLATES);

  // Form states for creating new template
  const [newTmplName, setNewTmplName] = useState('');
  const [newTmplCategory, setNewTmplCategory] = useState<'Legal & Corporate' | 'Sales' | 'HR & Hiring' | 'Procurement' | 'Finance'>('Legal & Corporate');
  const [newTmplDesc, setNewTmplDesc] = useState('');
  const [newTmplRoles, setNewTmplRoles] = useState<{ roleName: string; description: string; defaultAuth: AuthType }[]>([
    { roleName: 'Primary Counterparty Signer', description: 'Authorized executive signatory', defaultAuth: 'email' },
    { roleName: 'Internal Legal Approver', description: 'General Counsel review', defaultAuth: 'sms_otp' }
  ]);

  const categories = ['All', 'Legal & Corporate', 'Sales', 'HR & Hiring', 'Procurement', 'Finance'];

  const filtered = templates.filter(t => {
    const matchesCat = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleUseTemplate = (tmpl: Template) => {
    createNewEnvelope({
      title: `${tmpl.name} (from Master Template)`,
      description: tmpl.description,
      tags: [tmpl.category, 'Template-Based'],
      documents: [tmpl.sampleDocument]
    });
    notify('success', 'Envelope Created from Template', `Loaded "${tmpl.name}" with pre-configured recipient roles.`);
  };

  const handleAddRoleRow = () => {
    setNewTmplRoles(prev => [...prev, { roleName: `Signer ${prev.length + 1}`, description: 'Secondary signatory', defaultAuth: 'sms_otp' }]);
  };

  const handleRemoveRoleRow = (idx: number) => {
    setNewTmplRoles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTmplName.trim()) return;

    const newTmpl: Template = {
      id: 'tmpl-' + (templates.length + 1),
      name: newTmplName,
      category: newTmplCategory,
      description: newTmplDesc || 'Standard enterprise agreement template with predefined field locations.',
      roles: newTmplRoles,
      usageCount: 0,
      lastUsed: 'Just now',
      defaultFieldsCount: 4,
      sampleDocument: {
        id: 'doc-' + Date.now(),
        name: `${newTmplName}.pdf`,
        size: '184 KB',
        fileType: 'pdf',
        sha256Hash: '9f82ab4102948bb109e248c8949102b4a18e0019283f9821',
        pages: [
          {
            pageNumber: 1,
            title: newTmplName,
            content: `Master Agreement Template for ${newTmplName}. Fully compliant with US ESIGN Act and EU eIDAS.`
          }
        ]
      }
    };

    setTemplates(prev => [newTmpl, ...prev]);
    setNewTmplName('');
    setNewTmplDesc('');
    setShowCreateModal(false);
    notify('success', 'Template Created', `Saved "${newTmpl.name}" to Master Template Library.`);
  };

  const handleDuplicateTemplate = (tmpl: Template) => {
    const dup: Template = {
      ...tmpl,
      id: 'tmpl-' + Date.now(),
      name: `${tmpl.name} (Copy)`,
      usageCount: 0
    };
    setTemplates(prev => [dup, ...prev]);
    notify('success', 'Template Duplicated', `Created clone of "${tmpl.name}".`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400">
            <Copy className="w-5 h-5" />
            <h2 className="text-lg font-display font-bold text-white tracking-tight">
              Master Agreement Template Library
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Standardized, reusable agreements with predefined roles, auto-fill merge fields, and conditional workflows.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create New Template</span>
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 text-xs">
        <div className="flex space-x-2 overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="w-full sm:w-56 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-3">
          <FileText className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-200">No Templates Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No agreement templates matched your search query "{searchQuery}".
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-400 text-xs font-semibold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

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
                <span className="text-[10px] text-slate-400 font-mono font-semibold">Used {tmpl.usageCount} times</span>
              </div>

              <h3 className="text-sm font-bold text-white">{tmpl.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{tmpl.description}</p>

              {/* Roles Breakdown */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Predefined Roles ({tmpl.roles.length}):</span>
                <div className="space-y-1">
                  {tmpl.roles.map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300">• {r.roleName}</span>
                      <span className="text-[10px] font-mono text-indigo-400 uppercase">{r.defaultAuth}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => handleUseTemplate(tmpl)}
                className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Use Template</span>
              </button>

              <button
                onClick={() => setPreviewTemplate(tmpl)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
                title="Preview Template"
              >
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
              </button>

              <button
                onClick={() => handleDuplicateTemplate(tmpl)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
                title="Duplicate Template"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveBulkTemplate(tmpl)}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors flex items-center space-x-1.5 cursor-pointer"
                title="CSV Bulk Send"
              >
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>Bulk</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bulk Send Modal */}
      {activeBulkTemplate && (
        <BulkSendModal
          isOpen={true}
          onClose={() => setActiveBulkTemplate(null)}
          templateName={activeBulkTemplate.name}
        />
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">{previewTemplate.name}</h3>
              </div>
              <button onClick={() => setPreviewTemplate(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs overflow-y-auto pr-1">
              <div>
                <span className="text-slate-400 block mb-1">Category & Usage</span>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-full bg-slate-800 text-indigo-300 font-mono text-[11px]">{previewTemplate.category}</span>
                  <span className="text-slate-400">Dispatched {previewTemplate.usageCount} times across organization</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Description</span>
                <p className="text-slate-200 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">{previewTemplate.description}</p>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Recipient Roles ({previewTemplate.roles.length})</span>
                <div className="space-y-2">
                  {previewTemplate.roles.map((r, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800 flex items-center justify-center font-bold text-[10px]">
                          {i + 1}
                        </span>
                        <div>
                          <span className="text-slate-200 font-semibold block">{r.roleName}</span>
                          <span className="text-[10px] text-slate-400">{r.description}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40 uppercase">
                        {r.defaultAuth}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  const t = previewTemplate;
                  setPreviewTemplate(null);
                  handleUseTemplate(t);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md flex items-center space-x-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Launch with Template</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Create Master Agreement Template</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} className="space-y-3 text-xs overflow-y-auto pr-1">
              <div>
                <label className="text-slate-300 block mb-1 font-medium">Template Name</label>
                <input
                  type="text"
                  placeholder="e.g. Master Consultant Agreement 2026"
                  value={newTmplName}
                  onChange={(e) => setNewTmplName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Category</label>
                  <select
                    value={newTmplCategory}
                    onChange={(e) => setNewTmplCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Legal & Corporate">Legal & Corporate</option>
                    <option value="Sales">Sales & Revenue</option>
                    <option value="HR & Hiring">HR & People Ops</option>
                    <option value="Procurement">Procurement & Vendors</option>
                    <option value="Finance">Finance & Tax</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Initial Roles Count</label>
                  <div className="flex items-center space-x-2 pt-1">
                    <span className="font-mono text-slate-300">{newTmplRoles.length} Roles Defined</span>
                    <button
                      type="button"
                      onClick={handleAddRoleRow}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold cursor-pointer"
                    >
                      + Add Role
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Description</label>
                <textarea
                  rows={2}
                  placeholder="Summary of legal purpose and execution requirements..."
                  value={newTmplDesc}
                  onChange={(e) => setNewTmplDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1.5 font-medium">Signer Roles Definition</label>
                <div className="space-y-2">
                  {newTmplRoles.map((r, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] text-slate-500">#{i + 1}</span>
                      <input
                        type="text"
                        value={r.roleName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewTmplRoles(prev => prev.map((item, idx) => idx === i ? { ...item, roleName: val } : item));
                        }}
                        className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                        placeholder="Role title"
                      />
                      <select
                        value={r.defaultAuth}
                        onChange={(e) => {
                          const val = e.target.value as AuthType;
                          setNewTmplRoles(prev => prev.map((item, idx) => idx === i ? { ...item, defaultAuth: val } : item));
                        }}
                        className="px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-[11px] focus:outline-none focus:border-indigo-500 font-mono"
                      >
                        <option value="email">Email Link</option>
                        <option value="sms_otp">SMS OTP</option>
                        <option value="idv_biometric">IDV Biometrics</option>
                        <option value="access_code">Access Code</option>
                      </select>
                      {newTmplRoles.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRoleRow(i)}
                          className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md cursor-pointer"
                >
                  Save Master Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
