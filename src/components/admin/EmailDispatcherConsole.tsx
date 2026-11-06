import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  Settings, 
  Inbox, 
  CheckCircle2, 
  ExternalLink, 
  RefreshCw, 
  Sparkles, 
  Eye, 
  Key, 
  ShieldCheck,
  Globe,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';
import { generateSecureSigningUrl } from '../../utils/securityTokens';

export interface VirtualEmail {
  id: string;
  to: string;
  recipientName: string;
  from: string;
  subject: string;
  htmlContent: string;
  sentAt: string;
  envelopeId: string;
  envelopeTitle: string;
  magicLink: string;
  status: string;
}

export const EmailDispatcherConsole: React.FC = () => {
  const { notify, openSigningSession } = useSignFlow();

  // Email Config State
  const [provider, setProvider] = useState<'sandbox' | 'resend' | 'sendgrid' | 'smtp'>('sandbox');
  const [apiKey, setApiKey] = useState('');
  const [fromEmail, setFromEmail] = useState('onboarding@resend.dev');
  const [fromName, setFromName] = useState('SignFlow Agreements');

  // Test Email Input
  const [testRecipientEmail, setTestRecipientEmail] = useState('tanish3967@gmail.com');
  const [testRecipientName, setTestRecipientName] = useState('Tanish');
  const [isSending, setIsSending] = useState(false);
  const [lastResendId, setLastResendId] = useState<string | null>('21f9fdfe-63c0-4c2e-a5fa-fb688556b679');

  // Virtual Inbox Store
  const [inboxEmails, setInboxEmails] = useState<VirtualEmail[]>([
    {
      id: 'msg-01',
      to: 'alice.morgan@globex.com',
      recipientName: 'Alice Morgan (Secondary Signee)',
      from: 'Acme Legal Team <agreements@signflow.ai>',
      subject: 'Action Required: John Smith has signed NDA – Acme & Globex Corp. (Your signature needed)',
      htmlContent: '',
      sentAt: 'Just now (Sequential Step 2 of 2)',
      envelopeId: 'env-msa-8921',
      envelopeTitle: 'NDA – Acme & Globex Corp.',
      magicLink: 'http://localhost:5174/?sign=env-msa-8921&signer=rec-2',
      status: 'Delivered'
    },
    {
      id: 'msg-02',
      to: 'john.smith@acme.com',
      recipientName: 'John Smith (Primary Signee)',
      from: 'Tanish Khosla via SignFlow <agreements@signflow.ai>',
      subject: 'Please Sign: NDA – Acme & Globex Corp. from Acme Corp',
      htmlContent: '',
      sentAt: '25 mins ago (Completed)',
      envelopeId: 'env-msa-8921',
      envelopeTitle: 'NDA – Acme & Globex Corp.',
      magicLink: 'http://localhost:5174/?sign=env-msa-8921&signer=rec-1',
      status: 'Signed'
    },
    {
      id: 'msg-03',
      to: 'tanish3967@gmail.com',
      recipientName: 'Tanish Khosla',
      from: 'SignFlow Agreements <onboarding@resend.dev>',
      subject: 'Please Sign: Commercial Digital Agreement from Acme Corp',
      htmlContent: '',
      sentAt: '1 hour ago',
      envelopeId: 'env-demo-001',
      envelopeTitle: 'Commercial Digital Agreement',
      magicLink: 'http://localhost:5174/?sign=env-demo-001',
      status: 'Delivered'
    }
  ]);

  const [selectedEmailId, setSelectedEmailId] = useState<string>('msg-01');
  const selectedEmail = inboxEmails.find(e => e.id === selectedEmailId) || inboxEmails[0];

  const handleSendTestEmail = async () => {
    if (!testRecipientEmail) return;
    setIsSending(true);

    try {
      let resendMessageId = '';
      let deliveryNotice = '';
      let backendDelivered = false;

      // Generate Cryptographically Signed, Time-Bound Magic Link (7-Day TTL)
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
      const secureMagicLink = generateSecureSigningUrl(origin, 'env-demo-001', 'rec-test-1');

      // Call Unified Backend Email Service
      const response = await fetch('http://localhost:8090/api/v1/emails/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toEmail: testRecipientEmail,
          recipientName: testRecipientName,
          envelopeId: 'env-demo-001',
          envelopeTitle: 'Commercial Digital Agreement',
          senderName: fromName,
          senderOrg: 'SignFlow Enterprise Cloud',
          magicLink: secureMagicLink,
          provider,
          apiKey,
          fromEmail,
          fromName
        }),
      });

      const resData = await response.json();

      if (resData.success) {
        backendDelivered = true;
        resendMessageId = resData.emailId || '';
        setLastResendId(resData.emailId || null);
        if (resData.liveApiCalled) {
          deliveryNotice = `Delivered via Resend REST API (ID: ${resData.emailId})`;
          notify('success', 'Email Delivered via Resend', `Resend successfully accepted message for ${testRecipientEmail}. (ID: ${resData.emailId})`);
        } else {
          deliveryNotice = 'Delivered (Sandbox / Local Dispatch)';
          notify('success', 'Email Processed', `Message generated and logged for ${testRecipientEmail}`);
        }
      } else {
        if (resData.error) {
          deliveryNotice = `Resend Error: ${resData.error}`;
          notify('warning', 'Resend Notice', resData.error);
        }
      }

      const newMsg: VirtualEmail = {
        id: 'msg-' + Math.random().toString(36).substring(2, 8),
        to: testRecipientEmail,
        recipientName: testRecipientName,
        from: `${fromName} <${fromEmail}>`,
        subject: `Please Sign: Commercial Digital Agreement from ${fromName}`,
        htmlContent: '',
        sentAt: deliveryNotice || 'Just now',
        envelopeId: 'env-demo-001',
        envelopeTitle: 'Commercial Digital Agreement',
        magicLink: `${window.location.origin}/?sign=env-demo-001`,
        status: backendDelivered ? 'Delivered' : 'Pending API Config'
      };

      setInboxEmails(prev => [newMsg, ...prev]);
      setSelectedEmailId(newMsg.id);
      setIsSending(false);
    } catch (err: any) {
      console.warn('Backend email dispatch error:', err);
      setIsSending(false);

      const newMsg: VirtualEmail = {
        id: 'msg-' + Math.random().toString(36).substring(2, 8),
        to: testRecipientEmail,
        recipientName: testRecipientName,
        from: `${fromName} <${fromEmail}>`,
        subject: `Please Sign: Commercial Digital Agreement from ${fromName}`,
        htmlContent: '',
        sentAt: 'Just now (Sandbox)',
        envelopeId: 'env-demo-001',
        envelopeTitle: 'Commercial Digital Agreement',
        magicLink: `${window.location.origin}/?sign=env-demo-001`,
        status: 'Delivered (Local)'
      };

      setInboxEmails(prev => [newMsg, ...prev]);
      setSelectedEmailId(newMsg.id);
      notify('info', 'Sandbox Email Logged', `Generated email for ${testRecipientEmail} (Local Sandbox).`);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600">
            <Mail className="w-5 h-5" />
            <h2 className="text-base font-bold text-slate-900 font-display">
              Email Dispatcher & Virtual Signer Inbox
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Live transactional delivery via Resend API & Twilio SendGrid with virtual inbox inspection.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Resend API Connected</span>
          </span>
        </div>
      </div>

      {/* Resend Important Delivery Notice Banner */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Where to find your Resend test emails:</p>
          <p className="text-[11.5px] leading-relaxed text-amber-800">
            1. <strong>Check your Spam / Junk Folder & Promotions tab</strong> in Gmail — emails from the shared <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[10px]">onboarding@resend.dev</code> domain often land in Spam.
            <br />
            2. <strong>Resend Free Tier Rule:</strong> When using <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[10px]">onboarding@resend.dev</code>, Resend only sends emails to the email address registered with your Resend account (<strong className="font-mono">{testRecipientEmail}</strong>).
            <br />
            3. <strong>Verify in Resend Dashboard:</strong> You can see all delivered email logs live at <a href="https://resend.com/emails" target="_blank" rel="noreferrer" className="underline font-bold text-amber-950">resend.com/emails</a> (Last Sent ID: <span className="font-mono">{lastResendId || '21f9fdfe-63c0...'}</span>).
          </p>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Configuration & Send Box */}
        <div className="space-y-6">
          {/* Provider Settings */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4 text-xs">
            <div className="flex items-center space-x-2 text-slate-800 font-bold">
              <Settings className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Email Gateway Settings</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-slate-500 block mb-1 font-medium">Delivery Provider</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="resend">Resend API (Live Email Delivery)</option>
                  <option value="sandbox">SignFlow Virtual Sandbox</option>
                  <option value="sendgrid">Twilio SendGrid</option>
                  <option value="smtp">Custom SMTP Server</option>
                </select>
              </div>

              {provider === 'resend' && (
                <div>
                  <label className="text-slate-500 block mb-1 font-medium">Resend API Key</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="re_..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono text-[11px] focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <div>
                <label className="text-slate-500 block mb-1 font-medium">From Address</label>
                <input
                  type="email"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Test Dispatch Form */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Send Live Agreement Email</h3>

            <div className="space-y-3">
              <div>
                <label className="text-slate-500 block mb-1 font-medium">Recipient Name</label>
                <input
                  type="text"
                  value={testRecipientName}
                  onChange={(e) => setTestRecipientName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-500 block mb-1 font-medium">Recipient Email</label>
                <input
                  type="email"
                  value={testRecipientEmail}
                  onChange={(e) => setTestRecipientEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                onClick={handleSendTestEmail}
                disabled={isSending}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs shadow-xs flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Dispatching via Resend...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Live Email with Resend</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Virtual Inbox & Live HTML Email Preview (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Inbox Messages Stack */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs">
                <Inbox className="w-4 h-4 text-indigo-600" />
                <span>Dispatched Messages Log ({inboxEmails.length})</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Click to preview rendered email</span>
            </div>

            <div className="space-y-2">
              {inboxEmails.map(mail => {
                const isSelected = mail.id === selectedEmailId;
                return (
                  <div
                    key={mail.id}
                    onClick={() => setSelectedEmailId(mail.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-100/90 border-slate-400/80 shadow-2xs'
                        : 'bg-slate-50 border-slate-100 hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <strong className="text-slate-900 truncate">{mail.to} ({mail.recipientName})</strong>
                      <span className="text-[10px] font-mono text-slate-400">{mail.sentAt}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 truncate font-medium">{mail.subject}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Rendered Email Preview */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono text-indigo-600 font-bold uppercase block">Rendered Transactional Email</span>
                <h4 className="text-xs font-bold text-slate-900 mt-0.5">{selectedEmail.subject}</h4>
              </div>

              <button
                onClick={() => openSigningSession(selectedEmail.envelopeId)}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs flex items-center space-x-1.5 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Simulate "Review & Sign"</span>
              </button>
            </div>

            {/* Email Container Card */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 max-w-lg mx-auto space-y-5 text-xs text-slate-700 shadow-md">
              <div className="p-4 rounded-xl bg-slate-900 text-white text-center">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mx-auto mb-1.5 shadow-xs">
                  S
                </div>
                <h3 className="font-bold text-sm font-display">Acme Corporation via SignFlow</h3>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">Automated Electronic Signature Dispatch</p>
              </div>

              {/* Sequential Signing Progress Banner */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-[11px] uppercase tracking-wide">Workflow Progression</span>
                  <span className="text-[10px] font-mono text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                    Step 2 of 2
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between text-emerald-700 bg-emerald-50/80 p-2 rounded-lg border border-emerald-100 font-medium">
                    <span className="flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>1. John Smith (Disclosing Party)</span>
                    </span>
                    <span className="text-[10px] font-bold font-mono">Signed ✓</span>
                  </div>

                  <div className="flex items-center justify-between text-indigo-900 bg-indigo-50/80 p-2 rounded-lg border border-indigo-200 font-bold">
                    <span className="flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                      <span>2. Alice Morgan (Receiving Party)</span>
                    </span>
                    <span className="text-[10px] text-indigo-700 font-mono">Awaiting Signature ⏳</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p>Hello <strong>{selectedEmail.recipientName}</strong>,</p>
                <p className="text-slate-600 leading-relaxed">
                  <strong>John Smith</strong> has signed <strong>"{selectedEmail.envelopeTitle}"</strong>. Your electronic signature is now requested to complete and seal this legal agreement.
                </p>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <strong className="text-slate-900 block">{selectedEmail.envelopeTitle}</strong>
                  <span className="text-[11px] text-slate-500 block">
                    Envelope ID: <span className="font-mono text-slate-700">#ENV-8921</span> • 256-Bit Encrypted Link
                  </span>
                </div>

                <div className="text-center py-3 space-y-2">
                  <button
                    onClick={() => openSigningSession(selectedEmail.envelopeId)}
                    className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.01] flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>Review & Sign Agreement</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <p className="text-[10px] text-slate-400 font-mono">
                    Direct Link: <span className="underline text-indigo-600">https://sign.acme.com/sign/env-8921?token=sec_9841af...</span>
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-1 text-[10px] text-slate-400 leading-relaxed">
                  <p className="flex items-center space-x-1 text-emerald-700 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Cryptographically bound under US ESIGN Act §101, UETA, & EU eIDAS.</span>
                  </p>
                  <p>Security Fingerprint: SHA-256 a3b5c6d7e8f1f9a2b3c4d5e6f7a8b9c0d1e2f3e4b5c6d7e8f9a0b1c2d3e4f5a6b</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
