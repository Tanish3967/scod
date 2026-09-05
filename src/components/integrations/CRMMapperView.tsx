import React, { useState } from 'react';
import { 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  RefreshCw, 
  Send, 
  Sliders, 
  Database, 
  Link as LinkIcon,
  Sparkles,
  Check,
  Plus,
  Trash2,
  Code,
  Zap,
  Globe,
  X
} from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';

interface FieldMapping {
  id: string;
  crmField: string;
  signFlowField: string;
  sampleVal: string;
  direction: 'inbound' | 'outbound' | 'bidirectional';
}

export const CRMMapperView: React.FC = () => {
  const { notify } = useSignFlow();

  const [selectedCRM, setSelectedCRM] = useState<'salesforce' | 'hubspot' | 'zapier' | 'workday'>('salesforce');
  const [triggerStage, setTriggerStage] = useState('Negotiation / Review');
  const [isTestingSync, setIsTestingSync] = useState(false);
  const [showAddMappingModal, setShowAddMappingModal] = useState(false);
  const [showPayloadInspector, setShowPayloadInspector] = useState(false);

  const [newCrmField, setNewCrmField] = useState('');
  const [newSignFlowField, setNewSignFlowField] = useState('Envelope.CustomTag');
  const [newSampleVal, setNewSampleVal] = useState('');

  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([
    { id: 'm-1', crmField: 'Opportunity.Amount', signFlowField: 'Envelope.TotalAmount', sampleVal: '$120,000.00', direction: 'inbound' },
    { id: 'm-2', crmField: 'Contact.Email', signFlowField: 'Recipient[1].Email', sampleVal: 'd.vance@deltacorp.com', direction: 'inbound' },
    { id: 'm-3', crmField: 'Account.LegalName', signFlowField: 'Document.CompanyName', sampleVal: 'Delta Enterprises LLC', direction: 'bidirectional' },
    { id: 'm-4', crmField: 'Opportunity.OwnerId', signFlowField: 'Envelope.SenderId', sampleVal: 'Alex Rivera (Sales VP)', direction: 'inbound' },
    { id: 'm-5', crmField: 'Opportunity.StageName', signFlowField: 'Envelope.Status', sampleVal: 'Closed Won', direction: 'outbound' }
  ]);

  const handleTestCRMSync = () => {
    setIsTestingSync(true);
    setTimeout(() => {
      setIsTestingSync(false);
      const crmTitle = selectedCRM === 'salesforce' ? 'Salesforce' : selectedCRM === 'hubspot' ? 'HubSpot' : selectedCRM === 'zapier' ? 'Zapier' : 'Workday';
      notify('success', `${crmTitle} Bi-Directional Webhook Verified!`, `Synced Opportunity #OPP-9481 (${fieldMappings.length} mapped fields). Attached Certificate of Completion to CRM record.`);
    }, 900);
  };

  const handleAddMapping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCrmField.trim()) return;

    const newMap: FieldMapping = {
      id: 'm-' + Date.now(),
      crmField: newCrmField,
      signFlowField: newSignFlowField,
      sampleVal: newSampleVal || 'Value-AutoMapped',
      direction: 'bidirectional'
    };

    setFieldMappings(prev => [...prev, newMap]);
    setNewCrmField('');
    setNewSampleVal('');
    setShowAddMappingModal(false);
    notify('success', 'CRM Field Mapped', `Mapped ${newMap.crmField} to ${newMap.signFlowField}`);
  };

  const handleDeleteMapping = (id: string) => {
    setFieldMappings(prev => prev.filter(m => m.id !== id));
    notify('info', 'Field Mapping Removed', 'Removed sync mapping row.');
  };

  const samplePayloadJson = JSON.stringify({
    event: "envelope.completed",
    timestamp: new Date().toISOString(),
    sourceCRM: selectedCRM,
    envelope: {
      id: "env-9481-delta",
      title: "Delta Enterprises Master Services Agreement 2026",
      status: "completed",
      isLocked: true,
      sha256MerkleRoot: "9f82ab4102948bb109e248c8949102b4a18e0019",
      certificateOfCompletionUrl: "https://sign.acme.com/cert/env-9481.pdf"
    },
    crmRecordUpdates: {
      dealStage: "Closed Won",
      executedAmount: "$120,000.00",
      signersCompleted: ["d.vance@deltacorp.com", "legal@acme.com"]
    }
  }, null, 2);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400">
            <Database className="w-5 h-5" />
            <h2 className="text-lg font-display font-bold text-white tracking-tight">
              CRM & ERP Bi-Directional Webhook Integration Hub
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Trigger envelope routing automatically from CRM pipeline stages and attach executed agreements back to deal records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {(['salesforce', 'hubspot', 'zapier', 'workday'] as const).map(crm => (
            <button
              key={crm}
              onClick={() => setSelectedCRM(crm)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                selectedCRM === crm
                  ? crm === 'salesforce' ? 'bg-blue-600 text-white shadow-md' :
                    crm === 'hubspot' ? 'bg-orange-600 text-white shadow-md' :
                    crm === 'zapier' ? 'bg-amber-600 text-white shadow-md' :
                    'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {crm}
            </button>
          ))}
        </div>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Stage Triggers */}
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">1. Automated Pipeline Stage Triggers</h3>
            <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-800/40">
              Webhook Active
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Trigger Stage in {selectedCRM.toUpperCase()}</label>
              <select
                value={triggerStage}
                onChange={(e) => setTriggerStage(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-medium focus:outline-none focus:border-indigo-500"
              >
                <option value="Proposal / Price Quote">Proposal / Price Quote (Draft NDA)</option>
                <option value="Negotiation / Review">Negotiation / Review (Auto-Draft MSA)</option>
                <option value="Contract Sent">Contract Sent (Dispatch Magic Links)</option>
                <option value="Closed Won">Closed Won (Auto-Archive Certificate & Stamp)</option>
              </select>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
              <div className="flex items-center space-x-2 text-slate-200 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Post-Signature Automation Rules</span>
              </div>
              <label className="flex items-center space-x-2 text-[11.5px] text-slate-300">
                <input type="checkbox" defaultChecked className="rounded text-indigo-600 bg-slate-900 border-slate-700" />
                <span>Update CRM Deal stage to "Closed Won" when all recipients complete</span>
              </label>
              <label className="flex items-center space-x-2 text-[11.5px] text-slate-300">
                <input type="checkbox" defaultChecked className="rounded text-indigo-600 bg-slate-900 border-slate-700" />
                <span>Attach signed PDF and Certificate of Completion to CRM Files</span>
              </label>
              <label className="flex items-center space-x-2 text-[11.5px] text-slate-300">
                <input type="checkbox" defaultChecked className="rounded text-indigo-600 bg-slate-900 border-slate-700" />
                <span>Write SHA-256 Merkle tamper digest to CRM custom field `SignFlow_Hash__c`</span>
              </label>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={handleTestCRMSync}
                disabled={isTestingSync}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                {isTestingSync ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing Bi-Directional Sync...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Test {selectedCRM.toUpperCase()} Sync</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowPayloadInspector(true)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Code className="w-3.5 h-3.5 text-indigo-400" />
                <span>Inspect Payload</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Field Mappings Table */}
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">2. Real-Time Field Mapping Schema</h3>
              <p className="text-xs text-slate-400">Map counterparty and deal attributes into agreement fields</p>
            </div>
            
            <button
              onClick={() => setShowAddMappingModal(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-400 text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Field</span>
            </button>
          </div>

          <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
            {fieldMappings.map((m) => (
              <div key={m.id} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs hover:border-slate-700 transition-colors">
                <div className="space-y-0.5 min-w-0">
                  <span className="font-mono text-[10px] text-slate-400 font-bold block">{m.crmField}</span>
                  <span className="font-semibold text-slate-200 truncate">{m.sampleVal}</span>
                </div>

                <div className="flex items-center space-x-1 text-slate-500 mx-2 shrink-0">
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                </div>

                <div className="text-right space-y-0.5 min-w-0">
                  <span className="font-mono text-[10px] text-indigo-400 font-bold block truncate">{m.signFlowField}</span>
                  <span className="text-[10px] text-emerald-400 font-medium">Mapped & Verified</span>
                </div>

                <button
                  onClick={() => handleDeleteMapping(m.id)}
                  className="p-1.5 ml-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                  title="Remove mapping"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Field Mapping Modal */}
      {showAddMappingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Add CRM Field Mapping</h3>
              <button onClick={() => setShowAddMappingModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMapping} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-medium">CRM Source Object & Field Name</label>
                <input
                  type="text"
                  placeholder="e.g. Account.BillingAddress, Lead.Company"
                  value={newCrmField}
                  onChange={(e) => setNewCrmField(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono text-[11px] focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">SignFlow Destination Target</label>
                <select
                  value={newSignFlowField}
                  onChange={(e) => setNewSignFlowField(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono text-[11px] focus:outline-none focus:border-indigo-500"
                >
                  <option value="Document.CompanyName">Document.CompanyName</option>
                  <option value="Document.BillingAddress">Document.BillingAddress</option>
                  <option value="Recipient[1].FullName">Recipient[1].FullName</option>
                  <option value="Recipient[1].Email">Recipient[1].Email</option>
                  <option value="Envelope.TotalAmount">Envelope.TotalAmount</option>
                  <option value="Envelope.CustomTag">Envelope.CustomTag</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Sample Value for Simulation</label>
                <input
                  type="text"
                  placeholder="e.g. 100 Enterprise Way, Suite 400"
                  value={newSampleVal}
                  onChange={(e) => setNewSampleVal(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddMappingModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md cursor-pointer"
                >
                  Save Mapping
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Webhook Payload Inspector Modal */}
      {showPayloadInspector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Code className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Live Webhook JSON Payload</h3>
              </div>
              <button onClick={() => setShowPayloadInspector(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              This payload is transmitted via HMAC-SHA256 signed POST webhook to your configured endpoint upon agreement execution.
            </p>

            <div className="flex-1 bg-slate-950 rounded-2xl p-4 overflow-auto font-mono text-[11px] text-emerald-400 leading-relaxed border border-slate-800">
              <pre>{samplePayloadJson}</pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowPayloadInspector(false)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
