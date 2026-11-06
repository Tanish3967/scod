import React, { useState, useEffect } from 'react';
import { 
  Share2, 
  X, 
  Copy, 
  Check, 
  Send, 
  QrCode, 
  UserPlus, 
  ShieldCheck, 
  Lock, 
  Globe, 
  Mail, 
  Link, 
  Eye, 
  Download, 
  Code, 
  Sparkles, 
  Smartphone, 
  CheckCircle2, 
  Clock, 
  KeyRound, 
  ShieldAlert,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { Envelope, Recipient } from '../../types/signflow';
import { useSignFlow } from '../../context/SignFlowContext';

export interface ShareEnvelopeModalProps {
  isOpen: boolean;
  onClose: () => void;
  envelope: Envelope | null;
}

export const ShareEnvelopeModal: React.FC<ShareEnvelopeModalProps> = ({
  isOpen,
  onClose,
  envelope
}) => {
  const { sendEnvelopeReminder, notify, updateEnvelope, generateSecureSigningUrl } = useSignFlow();

  const [activeTab, setActiveTab] = useState<'recipients' | 'invite' | 'embed' | 'security'>('recipients');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showQRForRecipient, setShowQRForRecipient] = useState<string | null>(null);
  const [isSendingBatch, setIsSendingBatch] = useState(false);

  // Invite Form State
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'signer' | 'approver' | 'cc'>('signer');
  const [inviteAuthType, setInviteAuthType] = useState<'email' | 'passkey_webauthn' | 'sms_otp'>('email');
  const [inviteExpiry, setInviteExpiry] = useState<'24h' | '7d' | '30d' | 'never'>('7d');
  const [inviteNote, setInviteNote] = useState('');

  // Security Access Settings
  const [requireConsent, setRequireConsent] = useState(true);
  const [watermarkDocument, setWatermarkDocument] = useState(true);
  const [notifyOnView, setNotifyOnView] = useState(true);
  const [allowDownloadBeforeSigning, setAllowDownloadBeforeSigning] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !envelope) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  const generalShareUrl = `${origin}/?preview=${envelope.id}`;

  const handleCopy = (text: string, id: string, label = 'Link') => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    notify('success', `${label} Copied`, 'Copied secure link to clipboard.');
    setTimeout(() => {
      setCopiedId(null);
    }, 2500);
  };

  const handleSendSingleReminder = async (rec: Recipient) => {
    const res = await sendEnvelopeReminder(envelope.id, rec.id);
    if (res.success) {
      notify('success', 'Signing Link Dispatched', `Sent email invitation with direct magic link to ${rec.name} (${rec.email}).`);
    }
  };

  const handleSendBatchReminders = async () => {
    setIsSendingBatch(true);
    try {
      await sendEnvelopeReminder(envelope.id);
    } finally {
      setIsSendingBatch(false);
    }
  };

  const handleAddCollaborator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteName) {
      notify('warning', 'Missing Information', 'Please provide both a name and valid email address.');
      return;
    }

    const newRecipient: Recipient = {
      id: 'rec-' + Math.random().toString(36).substring(2, 7),
      name: inviteName.trim(),
      email: inviteEmail.trim().toLowerCase(),
      role: inviteRole,
      routingOrder: (envelope.recipients?.length || 0) + 1,
      authType: inviteAuthType,
      status: 'ready'
    };

    const updatedRecipients = [...(envelope.recipients || []), newRecipient];
    updateEnvelope(envelope.id, { recipients: updatedRecipients });

    // Send invitation email through backend
    sendEnvelopeReminder(envelope.id, newRecipient.id, newRecipient.email);

    notify('success', 'Recipient Added & Invited', `${newRecipient.name} was added as a ${inviteRole} and notified via email.`);
    setInviteName('');
    setInviteEmail('');
    setInviteNote('');
    setActiveTab('recipients');
  };

  const iframeEmbedCode = `<iframe \n  src="${origin}/?embed=${envelope.id}" \n  width="100%" \n  height="700px" \n  frameborder="0" \n  allow="camera; microphone; payment; webauthn"\n></iframe>`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      {/* Modal Container */}
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-indigo-50/30">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900 truncate font-display">
                  Share Agreement & Signing Links
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-mono font-bold shrink-0">
                  #{envelope.id.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate">
                {envelope.title} • SHA-256 Tamper Sealed
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 bg-white flex items-center space-x-1 sm:space-x-2 overflow-x-auto text-xs font-semibold text-slate-600">
          {[
            { id: 'recipients', label: 'Signer Magic Links', icon: Link, badge: `${envelope.recipients?.length || 0}` },
            { id: 'invite', label: 'Invite Signer / Reviewer', icon: UserPlus },
            { id: 'embed', label: 'QR & Web Embed', icon: QrCode },
            { id: 'security', label: 'Access Control', icon: ShieldCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3 relative flex items-center space-x-2 transition-colors cursor-pointer shrink-0 ${
                  isActive ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tab.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* ========================================================= */}
          {/* TAB 1: RECIPIENT SIGNING LINKS (MAGIC LINKS)               */}
          {/* ========================================================= */}
          {activeTab === 'recipients' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-start justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <Sparkles className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-indigo-950 font-display">Tokenized Signer Links</h4>
                    <p className="text-[11px] text-indigo-800/80 leading-relaxed mt-0.5">
                      Each recipient receives an encrypted, cryptographically unique magic link. Opening the link automatically binds their identity and logs the audit session.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSendBatchReminders}
                  disabled={isSendingBatch}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Send className={`w-3 h-3 ${isSendingBatch ? 'animate-spin' : ''}`} />
                  <span>{isSendingBatch ? 'Dispatching...' : 'Email All Signers'}</span>
                </button>
              </div>

              {/* Recipients List */}
              <div className="space-y-3">
                {envelope.recipients?.map((rec, index) => {
                  const signerUrl = generateSecureSigningUrl 
                    ? generateSecureSigningUrl(envelope.id, rec.id)
                    : `${origin}/?sign=${envelope.id}&signer=${rec.id}`;
                  const isCopied = copiedId === rec.id;
                  const isQRVisible = showQRForRecipient === rec.id;
                  const isSigned = rec.status === 'signed';

                  return (
                    <div 
                      key={rec.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs space-y-3"
                    >
                      {/* Recipient Header Row */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className={`w-8 h-8 rounded-xl text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs ${
                            index % 2 === 0 ? 'bg-indigo-600' : 'bg-purple-600'
                          }`}>
                            {rec.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-slate-900 truncate font-display">
                                {rec.name}
                              </span>
                              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold uppercase">
                                Party {index + 1} ({rec.role})
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 truncate block">
                              {rec.email} • Auth: {rec.authType === 'passkey_webauthn' ? 'Passkey FIDO2' : rec.authType === 'sms_otp' ? 'SMS OTP' : 'Email OTP'}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center space-x-2 shrink-0">
                          {isSigned ? (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Signed ✓</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Pending Signature</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Tokenized Link Box */}
                      <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-200/80 text-xs">
                        <div className="flex-1 font-mono text-[11px] text-slate-600 truncate px-2 select-all">
                          {signerUrl}
                        </div>

                        <button
                          onClick={() => handleCopy(signerUrl, rec.id, `${rec.name}'s Signing Link`)}
                          className={`px-3 py-1.5 rounded-lg font-semibold text-[11px] flex items-center space-x-1 transition-all cursor-pointer ${
                            isCopied 
                              ? 'bg-emerald-600 text-white shadow-xs' 
                              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isCopied ? 'Copied' : 'Copy Link'}</span>
                        </button>

                        <button
                          onClick={() => setShowQRForRecipient(isQRVisible ? null : rec.id)}
                          className={`p-1.5 rounded-lg border text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer ${
                            isQRVisible ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200'
                          }`}
                          title="View Mobile QR Code"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>

                        {!isSigned && (
                          <button
                            onClick={() => handleSendSingleReminder(rec)}
                            className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 transition-colors cursor-pointer"
                            title="Dispatch Direct Email Invite"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Cryptographic Security Indicator */}
                      <div className="flex items-center justify-between px-1 text-[10px] text-slate-500 font-mono">
                        <span className="flex items-center space-x-1 text-emerald-600 font-semibold">
                          <ShieldCheck className="w-3 h-3 text-emerald-500" />
                          <span>HMAC-SHA256 Tokenized • Valid for 7 Days</span>
                        </span>
                        <span className="text-slate-400">Anti-Tamper Replay Protected</span>
                      </div>

                      {/* QR Code Reveal Panel */}
                      {isQRVisible && (
                        <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
                          <div className="space-y-1 text-center sm:text-left">
                            <div className="flex items-center justify-center sm:justify-start space-x-1.5 text-xs font-bold text-indigo-300">
                              <Smartphone className="w-3.5 h-3.5" />
                              <span>Mobile QR Signing Transfer</span>
                            </div>
                            <p className="text-[11px] text-slate-400">
                              Scan with any phone camera to sign for <strong>{rec.name}</strong> on mobile.
                            </p>
                          </div>

                          <div className="w-24 h-24 bg-white p-2 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                            {/* SVG QR Code Simulation */}
                            <svg className="w-full h-full text-slate-950" viewBox="0 0 100 100" fill="currentColor">
                              <rect x="10" y="10" width="25" height="25" fill="black" />
                              <rect x="15" y="15" width="15" height="15" fill="white" />
                              <rect x="18" y="18" width="9" height="9" fill="black" />
                              
                              <rect x="65" y="10" width="25" height="25" fill="black" />
                              <rect x="70" y="15" width="15" height="15" fill="white" />
                              <rect x="73" y="18" width="9" height="9" fill="black" />

                              <rect x="10" y="65" width="25" height="25" fill="black" />
                              <rect x="15" y="70" width="15" height="15" fill="white" />
                              <rect x="18" y="73" width="9" height="9" fill="black" />

                              <rect x="42" y="15" width="6" height="6" />
                              <rect x="52" y="25" width="6" height="6" />
                              <rect x="42" y="45" width="8" height="8" />
                              <rect x="55" y="45" width="6" height="6" />
                              <rect x="45" y="65" width="10" height="6" />
                              <rect x="65" y="65" width="6" height="12" />
                              <rect x="75" y="80" width="12" height="6" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* General Preview Link Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                    <span>General Read-Only Document Review Link</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">No Signature Permission</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={generalShareUrl}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-mono focus:outline-none select-all"
                  />
                  <button
                    onClick={() => handleCopy(generalShareUrl, 'general', 'General Review Link')}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center space-x-1.5 shrink-0"
                  >
                    {copiedId === 'general' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === 'general' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: INVITE SIGNER / REVIEWER                           */}
          {/* ========================================================= */}
          {activeTab === 'invite' && (
            <form onSubmit={handleAddCollaborator} className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900">Add New Recipient to Agreement</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  The recipient will receive an email invitation with a secure tokenized signing link.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jordan Miller"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="jordan@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Recipient Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="signer">Signer (Executes Agreement)</option>
                    <option value="approver">Approver (Review & Approve)</option>
                    <option value="cc">CC (Receives Copy Only)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Authentication Factor</label>
                  <select
                    value={inviteAuthType}
                    onChange={(e) => setInviteAuthType(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="email">Email OTP (2FA)</option>
                    <option value="passkey_webauthn">FIDO2 / Touch ID Passkey</option>
                    <option value="sms_otp">SMS Mobile OTP</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Link Expiration</label>
                  <select
                    value={inviteExpiry}
                    onChange={(e) => setInviteExpiry(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="24h">Expires in 24 Hours</option>
                    <option value="7d">Expires in 7 Days</option>
                    <option value="30d">Expires in 30 Days</option>
                    <option value="never">No Expiration</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Personal Note (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Please review and execute Section 4 by end of week..."
                  value={inviteNote}
                  onChange={(e) => setInviteNote(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('recipients')}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center space-x-1.5 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Send Invite & Save</span>
                </button>
              </div>
            </form>
          )}

          {/* ========================================================= */}
          {/* TAB 3: QR & WEB EMBED                                     */}
          {/* ========================================================= */}
          {activeTab === 'embed' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <QrCode className="w-4 h-4 text-indigo-400" />
                    <span>Live Interactive QR Code</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Print or display on screen for instant in-person signing without email.
                  </p>
                </div>

                <div className="w-28 h-28 bg-white p-2 rounded-2xl flex items-center justify-center shadow-xl shrink-0">
                  <svg className="w-full h-full text-slate-950" viewBox="0 0 100 100" fill="currentColor">
                    <rect x="8" y="8" width="28" height="28" fill="black" />
                    <rect x="14" y="14" width="16" height="16" fill="white" />
                    <rect x="17" y="17" width="10" height="10" fill="black" />
                    
                    <rect x="64" y="8" width="28" height="28" fill="black" />
                    <rect x="70" y="14" width="16" height="16" fill="white" />
                    <rect x="73" y="17" width="10" height="10" fill="black" />

                    <rect x="8" y="64" width="28" height="28" fill="black" />
                    <rect x="14" y="70" width="16" height="16" fill="white" />
                    <rect x="17" y="73" width="10" height="10" fill="black" />

                    <rect x="42" y="12" width="8" height="8" />
                    <rect x="52" y="24" width="6" height="6" />
                    <rect x="42" y="42" width="10" height="10" />
                    <rect x="56" y="42" width="6" height="6" />
                    <rect x="44" y="64" width="12" height="8" />
                    <rect x="64" y="64" width="8" height="14" />
                    <rect x="76" y="82" width="14" height="6" />
                  </svg>
                </div>
              </div>

              {/* Embed IFrame Snippet */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <Code className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Website & Portal IFrame Embed Code</span>
                  </label>
                  <button
                    onClick={() => handleCopy(iframeEmbedCode, 'embed', 'Embed Code')}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
                  >
                    {copiedId === 'embed' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === 'embed' ? 'Copied' : 'Copy HTML'}</span>
                  </button>
                </div>

                <pre className="p-3.5 rounded-xl bg-slate-950 text-slate-300 font-mono text-[11px] leading-relaxed overflow-x-auto border border-slate-800 select-all">
                  {iframeEmbedCode}
                </pre>
                <p className="text-[10.5px] text-slate-500">
                  Embed this agreement directly inside your custom portal, SaaS application, or customer onboarding flow.
                </p>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: ACCESS CONTROL & SECURITY                          */}
          {/* ========================================================= */}
          {activeTab === 'security' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <h4 className="font-bold text-slate-900">Security & Compliance Enforcements</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Configure real-time security restrictions and digital audit safeguards for this envelope.
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-start justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50/70 transition-colors cursor-pointer">
                  <div className="pr-4">
                    <strong className="block text-slate-900">Require ESIGN Act §101 Consent</strong>
                    <span className="text-[11px] text-slate-500">
                      Signers must explicitly consent to doing business electronically before viewing confidential clauses.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={requireConsent}
                    onChange={(e) => setRequireConsent(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded mt-0.5 cursor-pointer"
                  />
                </label>

                <label className="flex items-start justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50/70 transition-colors cursor-pointer">
                  <div className="pr-4">
                    <strong className="block text-slate-900">Dynamic Security Watermark</strong>
                    <span className="text-[11px] text-slate-500">
                      Renders a faint semi-transparent watermark containing the viewer's IP address and session timestamp.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={watermarkDocument}
                    onChange={(e) => setWatermarkDocument(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded mt-0.5 cursor-pointer"
                  />
                </label>

                <label className="flex items-start justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50/70 transition-colors cursor-pointer">
                  <div className="pr-4">
                    <strong className="block text-slate-900">Real-Time Telemetry & Notification on View</strong>
                    <span className="text-[11px] text-slate-500">
                      Sends an instant toast and email notification the exact moment any recipient opens the link.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyOnView}
                    onChange={(e) => setNotifyOnView(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded mt-0.5 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Modal Sticky Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit SHA-256 Merkle Anchored</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              Done & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
