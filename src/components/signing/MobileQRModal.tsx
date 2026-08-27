import React from 'react';
import { QrCode, Smartphone, X, Check, Shield } from 'lucide-react';

export const MobileQRModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  envelopeTitle: string;
}> = ({ isOpen, onClose, envelopeTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 text-center">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-left">
            <Smartphone className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Mobile Handoff</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300">
          Scan this QR code with your phone camera to review and sign on mobile touchscreen.
        </p>

        {/* QR Code Container */}
        <div className="p-4 bg-white rounded-2xl inline-block shadow-lg mx-auto">
          {/* Simulated High-Res SVG QR Code */}
          <svg className="w-44 h-44" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" fill="white" />
            {/* Corner Squares */}
            <rect x="10" y="10" width="25" height="25" fill="#0f172a" />
            <rect x="15" y="15" width="15" height="15" fill="white" />
            <rect x="18" y="18" width="9" height="9" fill="#4f46e5" />
            
            <rect x="65" y="10" width="25" height="25" fill="#0f172a" />
            <rect x="70" y="15" width="15" height="15" fill="white" />
            <rect x="73" y="18" width="9" height="9" fill="#4f46e5" />

            <rect x="10" y="65" width="25" height="25" fill="#0f172a" />
            <rect x="15" y="70" width="15" height="15" fill="white" />
            <rect x="18" y="73" width="9" height="9" fill="#4f46e5" />

            {/* Matrix dots */}
            <rect x="42" y="12" width="6" height="6" fill="#0f172a" />
            <rect x="52" y="12" width="6" height="6" fill="#0f172a" />
            <rect x="42" y="24" width="6" height="6" fill="#4f46e5" />
            <rect x="52" y="32" width="6" height="6" fill="#0f172a" />
            <rect x="20" y="42" width="6" height="6" fill="#0f172a" />
            <rect x="32" y="42" width="6" height="6" fill="#0f172a" />
            <rect x="44" y="44" width="12" height="12" fill="#0f172a" />
            <rect x="62" y="42" width="6" height="6" fill="#4f46e5" />
            <rect x="74" y="42" width="6" height="6" fill="#0f172a" />
            <rect x="42" y="65" width="6" height="6" fill="#0f172a" />
            <rect x="54" y="72" width="6" height="6" fill="#0f172a" />
            <rect x="68" y="68" width="8" height="8" fill="#4f46e5" />
            <rect x="80" y="78" width="6" height="6" fill="#0f172a" />
          </svg>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
          Secure Token: <span className="font-mono text-indigo-400">sf-mob-8891a-sec</span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
        >
          Done
        </button>
      </div>
    </div>
  );
};
