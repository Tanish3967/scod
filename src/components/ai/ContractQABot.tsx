import React, { useState } from 'react';
import { MessageSquare, Sparkles, Send, BookOpen, ShieldCheck, CheckCircle2, FileText, ArrowRight } from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';
import { answerContractQuestion } from '../../utils/aiEngine';

export const ContractQABot: React.FC = () => {
  const { envelopes, activeEnvelope } = useSignFlow();
  const [selectedEnvId, setSelectedEnvId] = useState(activeEnvelope?.id || envelopes[0]?.id || '');
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{
    role: 'user' | 'assistant';
    text: string;
    citations?: { page: number; clauseTitle: string; paragraph: string; matchScore: number }[];
    confidence?: number;
  }[]>([
    {
      role: 'assistant',
      text: 'Welcome to Conversational Contract Vault Q&A. Ask any question about your signed agreements (e.g. "What is our limitation of liability?", "What are the payment terms?", "Who has governing law?"). I cite exact clauses and page numbers.',
      confidence: 1.0
    }
  ]);

  const targetEnv = envelopes.find(e => e.id === selectedEnvId) || envelopes[0];
  const doc = targetEnv?.documents[0];
  const docText = doc ? doc.pages.map(p => p.content).join('\n') : '';

  const suggestedQuestions = [
    'What is our aggregate limitation of liability cap?',
    'What are the payment and late fee terms?',
    'Which jurisdiction governs dispute resolution?',
    'What is the notice period for contract termination?'
  ];

  const handleSend = (questionText?: string) => {
    const q = questionText || query;
    if (!q.trim()) return;

    setQuery('');
    setMessages(prev => [...prev, { role: 'user', text: q }]);

    setTimeout(() => {
      const resp = answerContractQuestion(q, targetEnv.title, docText);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: resp.answer,
          citations: resp.citations,
          confidence: resp.confidence
        }
      ]);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Header & Target Selector */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400">
            <MessageSquare className="w-5 h-5" />
            <h2 className="text-lg font-display font-bold text-white tracking-tight">
              Conversational Contract Vault Q&A (RAG)
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Grounded question answering strictly limited to retrieved authorized contract text. No hallucinations.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Vault Target:</span>
          <select
            value={selectedEnvId}
            onChange={(e) => setSelectedEnvId(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            {envelopes.map(env => (
              <option key={env.id} value={env.id}>
                {env.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Suggested Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500">Sample Questions:</span>
        {suggestedQuestions.map(sq => (
          <button
            key={sq}
            onClick={() => handleSend(sq)}
            className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-300 text-xs transition-colors"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Chat History Box */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 min-h-[400px] flex flex-col justify-between space-y-4">
        <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
          {messages.map((msg, i) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={i}
                className={`p-4 rounded-2xl text-xs space-y-2 ${
                  isUser
                    ? 'bg-indigo-600 text-white ml-8 sm:ml-24 shadow-md'
                    : 'bg-slate-950/80 border border-slate-800 text-slate-200 mr-8 sm:mr-24 shadow-inner'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] uppercase tracking-wider text-indigo-300">
                    {isUser ? 'You' : 'SignFlow RAG Engine'}
                  </span>
                  {msg.confidence && (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/40">
                      {Math.round(msg.confidence * 100)}% Confidence
                    </span>
                  )}
                </div>

                <p className="leading-relaxed text-[12.5px]">{msg.text}</p>

                {/* Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center">
                      <BookOpen className="w-3 h-3 text-indigo-400 mr-1" />
                      Grounded In-Document Citations:
                    </span>
                    {msg.citations.map((cite, cIdx) => (
                      <div
                        key={cIdx}
                        className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 space-y-1"
                      >
                        <div className="flex items-center justify-between font-semibold text-indigo-300">
                          <span>{cite.clauseTitle}</span>
                          <span className="text-[10px] text-slate-500 font-mono">Page {cite.page}</span>
                        </div>
                        <p className="text-slate-400 italic text-[10.5px]">"{cite.paragraph}"</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2 pt-2 border-t border-slate-800"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Ask any question about ${targetEnv.title}...`}
            className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 shadow-inner"
          />
          <button
            type="submit"
            className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
