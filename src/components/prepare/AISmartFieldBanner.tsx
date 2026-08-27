import React, { useState } from 'react';
import { Sparkles, Check, RefreshCw, Wand2, ShieldCheck } from 'lucide-react';
import { useSignFlow } from '../../context/SignFlowContext';

export const AISmartFieldBanner: React.FC<{ envelopeId: string }> = ({ envelopeId }) => {
  const { runAISmartFieldPlacement, runAIRiskScan } = useSignFlow();
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedCount, setDetectedCount] = useState<number | null>(null);

  const handleAutoDetect = () => {
    setIsDetecting(true);
    setTimeout(() => {
      const count = runAISmartFieldPlacement(envelopeId);
      setDetectedCount(count);
      setIsDetecting(false);
    }, 600);
  };

  return (
    <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-purple-950/70 border-b border-indigo-500/20 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center space-x-2.5">
        <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
          <Sparkles className="w-4 h-4 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-white">AI Smart Field Placement & OCR Assistant</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
              98.2% Confidence
            </span>
          </div>
          <p className="text-[11px] text-slate-300">
            Automatically detect signature lines, initials, dates, and signee blanks across all uploaded document pages.
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => runAIRiskScan(envelopeId)}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium border border-slate-700 transition-colors flex items-center space-x-1.5"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
          <span>Pre-Send Risk Scan</span>
        </button>

        <button
          onClick={handleAutoDetect}
          disabled={isDetecting}
          className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all flex items-center space-x-1.5 hover:scale-[1.02] active:scale-[0.98]"
        >
          {isDetecting ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Scanning Geometry...</span>
            </>
          ) : detectedCount !== null ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-300" />
              <span>{detectedCount} Fields Placed!</span>
            </>
          ) : (
            <>
              <Wand2 className="w-3.5 h-3.5" />
              <span>1-Click Auto-Detect Fields</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
