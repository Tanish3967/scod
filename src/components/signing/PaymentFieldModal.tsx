import React, { useState } from 'react';
import { CreditCard, Lock, CheckCircle2, X, ShieldCheck, Building2 } from 'lucide-react';

export const PaymentFieldModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirmPayment: (details: { last4: string; brand: string; amount: number }) => void;
  amount: number;
  currency?: string;
}> = ({ isOpen, onClose, onConfirmPayment, amount, currency = 'USD' }) => {
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('884');
  const [nameOnCard, setNameOnCard] = useState('Sarah Jenkins');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onConfirmPayment({
        last4: '4242',
        brand: 'Visa',
        amount
      });
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Contract Retainer Payment</h3>
              <p className="text-xs text-slate-400">Powered by Stripe Connect (PCI-DSS Level 1)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block">Total Due Upon Signing</span>
              <span className="text-2xl font-display font-bold text-white">${amount.toLocaleString()}</span>
              <span className="text-xs text-slate-400 font-mono ml-1.5">{currency}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/40 font-mono">
                Secure Escrow
              </span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Name on Card</label>
              <input
                type="text"
                value={nameOnCard}
                onChange={(e) => setNameOnCard(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Card Details</label>
              <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="bg-transparent text-slate-200 w-full focus:outline-none font-mono"
                />
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">VISA</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Expiry Date</label>
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">CVC Code</label>
                <input
                  type="text"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isProcessing ? 'Authorizing Payment...' : `Authorize & Pay $${amount.toLocaleString()}`}</span>
            </button>
          </div>

          <div className="flex items-center justify-center space-x-2 text-[10px] text-slate-500 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-Bit SSL Encrypted • Funds released per agreement milestones</span>
          </div>
        </form>
      </div>
    </div>
  );
};
