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
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400">
            <Terminal className="w-5 h-5" />
            <h2 className="text-lg font-display font-bold text-white tracking-tight">
              Developer Webhooks & API Event Stream
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Real-time webhook fan-out with HMAC-SHA256 signature verification headers.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 font-mono"
          >
            <option value="envelope.completed">envelope.completed</option>
            <option value="envelope.signed">envelope.signed</option>
            <option value="envelope.sent">envelope.sent</option>
            <option value="ai.risk_flag_raised">ai.risk_flag_raised</option>
          </select>

          <button
            onClick={handleTestDispatch}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5 transition-all"
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
          <h3 className="text-sm font-semibold text-white">Registered Webhook Endpoints</h3>

          <div className="space-y-3">
            {webhooks.map(wh => (
              <div
                key={wh.id}
                className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <h4 className="font-bold text-white">{wh.name}</h4>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800/40">
                    HTTP 200 Active
                  </span>
                </div>

                <p className="font-mono text-[11px] text-indigo-300 truncate">{wh.url}</p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <div className="flex items-center space-x-1">
                    <Key className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-mono text-[10px]">Secret: {wh.secretKey.slice(0, 16)}...</span>
                  </div>
                  <div className="flex gap-1">
                    {wh.events.map(ev => (
                      <span key={ev} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[9px]">
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
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 text-xs">
          <h3 className="text-sm font-semibold text-white">Add Webhook Receiver</h3>
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="text-slate-400 block mb-1">Friendly Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Endpoint HTTPS URL</label>
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
            >
              Register Webhook Endpoint
            </button>
          </form>
        </div>
      </div>

      {/* Live Event Stream Logs */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Live Event Stream Logs</h3>
          <span className="text-[10px] text-slate-500 font-mono">HMAC SHA-256 Validated</span>
        </div>

        <div className="space-y-3">
          {webhookLogs.length === 0 ? (
            <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center text-slate-500 text-xs font-mono">
              No webhook events fired yet. Click "Trigger Test Event" above to dispatch a live payload.
            </div>
          ) : (
            webhookLogs.map(log => (
              <div
                key={log.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800/40 font-mono text-[10px] font-bold">
                      {log.event}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{log.timestamp}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-emerald-400">HTTP {log.statusCode} ({log.durationMs}ms)</span>
                    <button
                      onClick={() => handleCopyPayload(log.id, JSON.stringify(log.payload, null, 2))}
                      className="p-1 rounded text-slate-400 hover:text-white"
                      title="Copy JSON Payload"
                    >
                      {copiedId === log.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-slate-500 truncate">
                  X-SignFlow-Signature: <span className="text-slate-300">{log.signatureHmac}</span>
                </div>

                <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300 overflow-x-auto">
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
