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
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-xs">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-slate-900 tracking-tight">
              Conversational Contract Vault Q&A (RAG)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Grounded question answering strictly limited to retrieved authorized contract text. No hallucinations.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <span className="text-xs text-slate-500 font-medium">Vault Target:</span>
          <select
            value={selectedEnvId}
            onChange={(e) => setSelectedEnvId(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
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
        <span className="text-xs text-slate-400 font-medium">Sample Questions:</span>
        {suggestedQuestions.map(sq => (
          <button
            key={sq}
            onClick={() => handleSend(sq)}
            className="px-3 py-1.5 rounded-xl bg-indigo-50/70 hover:bg-indigo-100/80 border border-indigo-100 text-indigo-700 text-xs font-medium transition-colors cursor-pointer"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Chat History Box */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs min-h-[400px] flex flex-col justify-between space-y-4">
        <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
          {messages.map((msg, i) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={i}
                className={`p-4.5 rounded-2xl text-xs space-y-2 ${
                  isUser
                    ? 'bg-indigo-600 text-white ml-8 sm:ml-24 shadow-xs'
                    : 'bg-slate-50 border border-slate-100 text-slate-800 mr-8 sm:mr-24 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-bold text-[11px] uppercase tracking-wider ${
                    isUser ? 'text-indigo-200' : 'text-indigo-700 font-display'
                  }`}>
                    {isUser ? 'You' : 'SignFlow RAG Engine'}
                  </span>
                  {msg.confidence && (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      isUser 
                        ? 'text-white bg-indigo-700/80' 
                        : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                    }`}>
                      {Math.round(msg.confidence * 100)}% Confidence
                    </span>
                  )}
                </div>

                <p className="leading-relaxed text-[12.5px]">{msg.text}</p>

                {/* Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold flex items-center">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600 mr-1" />
                      Grounded In-Document Citations:
                    </span>
                    {msg.citations.map((cite, cIdx) => (
                      <div
                        key={cIdx}
                        className="p-3 rounded-xl bg-white border border-slate-200/80 text-[11px] text-slate-700 space-y-1 shadow-2xs"
                      >
                        <div className="flex items-center justify-between font-bold text-indigo-700">
                          <span>{cite.clauseTitle}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Page {cite.page}</span>
                        </div>
                        <p className="text-slate-600 italic text-[11px]">"{cite.paragraph}"</p>
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
          className="flex items-center space-x-2 pt-3 border-t border-slate-100"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Ask any question about ${targetEnv.title}...`}
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 shadow-2xs transition-colors"
          />
          <button
            type="submit"
            className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
