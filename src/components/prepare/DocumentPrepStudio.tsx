import React, { useState } from 'react';
import { 
  Send, 
  Eye, 
  Save, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  ArrowLeft,
  Share2,
  ShieldCheck
} from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';
import { FieldType, DocumentField } from '../../types/signflow';
import { FieldPalette } from './FieldPalette';
import { AISmartFieldBanner } from './AISmartFieldBanner';
import { RecipientConfigPanel } from './RecipientConfigPanel';
import { DocumentViewerCanvas } from './DocumentViewerCanvas';

export const DocumentPrepStudio: React.FC = () => {
  const { 
    activeEnvelope, 
    updateEnvelope, 
    sendEnvelope, 
    addFieldToEnvelope, 
    updateFieldInEnvelope, 
    removeFieldFromEnvelope, 
    setActiveView,
    openSigningSession
  } = useSignFlow();

  const [activePage, setActivePage] = useState(1);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>(
    activeEnvelope?.recipients[0]?.id || 'rec-default'
  );
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [showSendModal, setShowSendModal] = useState(false);

  if (!activeEnvelope) {
    return (
      <div className="p-12 text-center text-slate-400">
        <FileText className="w-12 h-12 mx-auto text-slate-600 mb-3" />
        <h3 className="text-base font-semibold text-slate-200">No Envelope Selected</h3>
        <p className="text-xs text-slate-500 mt-1">Select an agreement from the Envelopes Vault or create a new one.</p>
        <button
          onClick={() => setActiveView('envelopes')}
          className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
        >
          Go to Envelopes Vault
        </button>
      </div>
    );
  }

  const handleAddField = (type: FieldType) => {
    const isPayment = type === 'payment';
    const isStamp = type === 'stamp';

    const newField: Omit<DocumentField, 'id'> = {
      type,
      label: type.replace('_', ' ').toUpperCase(),
      recipientId: selectedRecipientId,
      page: activePage,
      x: 15,
      y: 40 + (activeEnvelope.fields.length * 6) % 40,
      width: isPayment ? 65 : isStamp ? 35 : 36,
      height: isPayment ? 14 : isStamp ? 18 : 8,
      required: true,
      paymentAmount: isPayment ? 5000 : undefined,
      currency: isPayment ? 'USD' : undefined
    };

    addFieldToEnvelope(activeEnvelope.id, newField);
  };

  const currentRecipient = activeEnvelope.recipients.find(r => r.id === selectedRecipientId) || activeEnvelope.recipients[0];

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-slate-950 overflow-hidden">
      {/* Top Header of Document Studio */}
      <div className="h-14 border-b border-slate-800 bg-slate-950/90 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveView('envelopes')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                aria-label="Agreement Title"
                value={activeEnvelope.title}
                onChange={(e) => updateEnvelope(activeEnvelope.id, { title: e.target.value })}
                className="bg-transparent text-sm font-bold text-white focus:outline-none focus:border-b border-indigo-500 max-w-sm sm:max-w-md"
              />
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono uppercase">
                {activeEnvelope.status}
              </span>
            </div>
            <p className="text-[10px] text-slate-500">
              {activeEnvelope.documents[0]?.name} • SHA-256 Verified
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => openSigningSession(activeEnvelope.id)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium flex items-center space-x-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
            <span>Signer Preview</span>
          </button>

          <button
            onClick={() => setShowSendModal(true)}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5 transition-all hover:scale-[1.02]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Envelope</span>
          </button>
        </div>
      </div>

      {/* AI Smart Field Auto-Detect Banner */}
      <AISmartFieldBanner envelopeId={activeEnvelope.id} />

      {/* 3-Column Studio: Field Palette | Document Canvas | Recipient Config */}
      <div className="flex-1 flex overflow-hidden">
        <FieldPalette
          onAddField={handleAddField}
          selectedRecipientId={selectedRecipientId}
          recipientName={currentRecipient?.name || 'Signer'}
        />

        <DocumentViewerCanvas
          pages={activeEnvelope.documents[0]?.pages || []}
          fields={activeEnvelope.fields}
          recipients={activeEnvelope.recipients}
          activePage={activePage}
          onPageChange={setActivePage}
          onUpdateField={(fieldId, updates) => updateFieldInEnvelope(activeEnvelope.id, fieldId, updates)}
          onRemoveField={(fieldId) => removeFieldFromEnvelope(activeEnvelope.id, fieldId)}
          selectedFieldId={selectedFieldId}
          onSelectFieldId={setSelectedFieldId}
        />

        <RecipientConfigPanel
          recipients={activeEnvelope.recipients}
          onUpdateRecipients={(recipients) => updateEnvelope(activeEnvelope.id, { recipients })}
          selectedRecipientId={selectedRecipientId}
          onSelectRecipientId={setSelectedRecipientId}
        />
      </div>

      {/* Send Envelope Confirmation Modal */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center space-x-3 text-indigo-400">
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <Send className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Ready to Dispatch Envelope?</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Agreement <strong className="text-white">"{activeEnvelope.title}"</strong> will be sent to{' '}
              <strong className="text-white">{activeEnvelope.recipients.length} recipient(s)</strong> with encrypted email notifications and tamper-evident audit logging.
            </p>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Total Fields Configured:</span>
                <span className="font-mono text-slate-200">{activeEnvelope.fields.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Compliance Level:</span>
                <span className="font-mono text-emerald-400">ESIGN / eIDAS Tier 2/3</span>
              </div>
              <div className="flex justify-between">
                <span>SHA-256 Hash Chain:</span>
                <span className="font-mono text-slate-300">Synchronized</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowSendModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  sendEnvelope(activeEnvelope.id);
                  setShowSendModal(false);
                }}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
              >
                Confirm & Send Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
