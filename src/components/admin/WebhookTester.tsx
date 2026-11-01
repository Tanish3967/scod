import React, { useState } from 'react';
import { Terminal, Send, CheckCircle2, RefreshCw, Key, Shield, Copy, Check } from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';

export const WebhookTester: React.FC = () => {
  const { webhooks, webhookLogs, triggerMockWebhook, envelopes, createWebhook, notify } = useSignFlow();

  const [newUrl, setNewUrl] = useState('https://api.acmeglobal.com/webhooks/signflow-events');
  const [newName, setNewName] = useState('Enterprise ERP Sync');
  const [selectedEvent, setSelectedEvent] = useState('envelope.completed');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;
    createWebhook(newUrl, newName, ['envelope.sent', 'envelope.signed', 'envelope.completed']);
  };

  const handleTestDispatch = () => {
    const targetEnv = envelopes[0];
    if (!targetEnv) return;
    triggerMockWebhook(selectedEvent, targetEnv);
    notify('success', 'Webhook Dispatched', `Fired "${selectedEvent}" to ${webhooks.length} active registered endpoints.`);
  };

  const handleCopyPayload = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-xs">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-slate-900 tracking-tight">
              Developer Webhooks & API Event Stream
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Real-time webhook fan-out with HMAC-SHA256 signature verification headers.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3 py-2 font-mono font-medium focus:bg-white focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="envelope.completed">envelope.completed</option>
            <option value="envelope.signed">envelope.signed</option>
            <option value="envelope.sent">envelope.sent</option>
            <option value="ai.risk_flag_raised">ai.risk_flag_raised</option>
          </select>

          <button
            onClick={handleTestDispatch}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs hover:shadow-md flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Trigger Test Event</span>
          </button>
        </div>
      </div>

      {/* Registered Webhooks & Add New */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Endpoints List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 font-display">Registered Webhook Endpoints</h3>

          <div className="space-y-3">
            {webhooks.map(wh => (
              <div
                key={wh.id}
                className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <h4 className="font-bold text-slate-900 font-display">{wh.name}</h4>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold">
                    HTTP 200 Active
                  </span>
                </div>

                <p className="font-mono text-[11px] text-indigo-700 truncate font-semibold">{wh.url}</p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  <div className="flex items-center space-x-1">
                    <Key className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono text-[10px]">Secret: {wh.secretKey.slice(0, 16)}...</span>
                  </div>
                  <div className="flex gap-1.5">
                    {wh.events.map(ev => (
                      <span key={ev} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[9.5px] border border-slate-200">
                        {ev}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Endpoint Form */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 font-display">Add Webhook Receiver</h3>
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="text-slate-700 block mb-1 font-semibold">Friendly Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-slate-700 block mb-1 font-semibold">Endpoint HTTPS URL</label>
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              Register Webhook Endpoint
            </button>
          </form>
        </div>
      </div>

      {/* Live Event Stream Logs */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 font-display">Live Event Stream Logs</h3>
          <span className="text-[10px] text-slate-500 font-mono">HMAC SHA-256 Validated</span>
        </div>

        <div className="space-y-3">
          {webhookLogs.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center text-slate-500 text-xs font-mono">
              No webhook events fired yet. Click "Trigger Test Event" above to dispatch a live payload.
            </div>
          ) : (
            webhookLogs.map(log => (
              <div
                key={log.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono text-[10px] font-bold">
                      {log.event}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">HTTP {log.statusCode} ({log.durationMs}ms)</span>
                    <button
                      onClick={() => handleCopyPayload(log.id, JSON.stringify(log.payload, null, 2))}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                      title="Copy JSON Payload"
                    >
                      {copiedId === log.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-slate-500 truncate">
                  X-SignFlow-Signature: <span className="text-slate-700 font-semibold">{log.signatureHmac}</span>
                </div>

                <pre className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-mono text-emerald-400 overflow-x-auto shadow-inner">
                  {JSON.stringify(log.payload, null, 2)}
                </pre>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
