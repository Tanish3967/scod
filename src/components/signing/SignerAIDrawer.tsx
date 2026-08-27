import React, { useState } from 'react';
import { Sparkles, X, ShieldAlert, CheckCircle2, MessageSquare, Send, BookOpen, AlertCircle } from 'lucide-react';
import { generateSignerSummary, answerContractQuestion } from '../../utils/aiEngine';

export const SignerAIDrawer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  documentContent: string;
}> = ({ isOpen, onClose, documentTitle, documentContent }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'chat'>('summary');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string; citations?: any[] }[]>([
    {
      role: 'assistant',
      text: `Hello! I am your SignFlow Legal Assistant. Ask me any question about "${documentTitle}" (e.g. "What is my liability?", "When do I need to pay?"). All answers are strictly grounded in this contract.`
    }
  ]);
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const summary = generateSignerSummary(documentTitle, documentContent);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userText = query;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);

    setTimeout(() => {
      const response = answerContractQuestion(userText, documentTitle, documentContent);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: response.answer,
          citations: response.citations
        }
      ]);
    }, 400);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">Signer AI Copilot</h3>
            <p className="text-[10px] text-slate-400">Plain-Language Review & RAG Q&A</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-2 border-b border-slate-800 flex space-x-2 bg-slate-950/40">
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex items-center space-x-1.5 pb-2 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'summary'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Plain-English TL;DR</span>
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center space-x-1.5 pb-2 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'chat'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Ask Contract AI</span>
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'summary' ? (
          <div className="space-y-3.5 text-xs">
            {/* Legal Disclaimer */}
            <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/20 text-amber-300 text-[11px] flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="leading-snug">
                <strong>Disclaimer:</strong> This summary is an AI-generated reading aid and not formal legal advice. Always review the full text before signing.
              </p>
            </div>

            <p className="text-slate-300 text-[11px] leading-relaxed">
              {summary.overview}
            </p>

            {/* Key Takeaways */}
            <div className="space-y-2.5">
              {summary.keyTakeaways.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="flex items-center space-x-1.5 text-indigo-300 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>{item.heading}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{item.summary}</p>
                  <p className="text-[10px] text-slate-500 font-mono italic">Impact: {item.impact}</p>
                </div>
              ))}
            </div>

            {/* Signer Rights */}
            <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-1.5">
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider">
                Your Legal Protections
              </span>
              <ul className="space-y-1 text-[11px] text-slate-300">
                {summary.signerRights.map((r, i) => (
                  <li key={i} className="flex items-start space-x-1.5">
                    <span className="text-indigo-400">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full justify-between space-y-3">
            <div className="space-y-3 overflow-y-auto max-h-96 pr-1">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl text-xs ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white ml-6'
                      : 'bg-slate-950/80 border border-slate-800 text-slate-200 mr-4'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-800 space-y-1">
                      <span className="text-[9px] font-mono text-indigo-400 uppercase">
                        Source Citation (RAG Grounded):
                      </span>
                      {msg.citations.map((c, cIdx) => (
                        <div key={cIdx} className="p-1.5 rounded bg-slate-900 border border-slate-700/60 text-[10px] text-slate-300">
                          <p className="font-semibold text-slate-200">Page {c.page} • {c.clauseTitle}</p>
                          <p className="text-slate-400 italic text-[9px] mt-0.5">"{c.paragraph.slice(0, 100)}..."</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chat Footer if tab == chat */}
      {activeTab === 'chat' && (
        <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-950 flex items-center space-x-2">
          <input
            type="text"
            placeholder="Ask about liability, fees, terms..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      )}
    </div>
  );
};
