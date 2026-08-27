import React, { useState, useRef, useEffect } from 'react';
import { 
  PenTool, 
  Type, 
  Upload, 
  Eraser, 
  Check, 
  X, 
  Sparkles,
  Palette
} from 'lucide-react';

export interface SignatureOutput {
  type: 'draw' | 'type' | 'upload';
  value: string;
  fontFamily?: string;
}

export const SignatureModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAdoptSignature: (signature: SignatureOutput) => void;
  signerName: string;
}> = ({ isOpen, onClose, onAdoptSignature, signerName }) => {
  const [tab, setTab] = useState<'draw' | 'type' | 'upload'>('draw');
  
  // Draw State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [inkColor, setInkColor] = useState('#1e3a8a'); // Deep Blue
  const [hasDrawn, setHasDrawn] = useState(false);

  // Type State
  const [typedName, setTypedName] = useState(signerName || 'Sarah Jenkins');
  const [selectedFont, setSelectedFont] = useState('Dancing Script');

  const fonts = [
    { name: 'Dancing Script', class: 'signature-font-dancing', label: 'Contemporary Script' },
    { name: 'Great Vibes', class: 'signature-font-greatvibes', label: 'Classic Calligraphy' },
    { name: 'Caveat', class: 'signature-font-caveat', label: 'Modern Casual Pen' },
    { name: 'Sacramento', class: 'signature-font-sacramento', label: 'Executive Flow' },
    { name: 'Alex Brush', class: 'signature-font-alexbrush', label: 'Formal Cursive' }
  ];

  // Upload State
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  useEffect(() => {
    if (tab === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = inkColor;
      }
    }
  }, [tab, inkColor]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasDrawn(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('clientX' in e ? e.clientX : e.touches[0].clientX) - rect.left;
    const y = ('clientY' in e ? e.clientY : e.touches[0].clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('clientX' in e ? e.clientX : e.touches[0].clientX) - rect.left;
    const y = ('clientY' in e ? e.clientY : e.touches[0].clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleAdopt = () => {
    if (tab === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dataUrl = canvas.toDataURL('image/png');
      onAdoptSignature({
        type: 'draw',
        value: hasDrawn ? dataUrl : `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="50"><text x="10" y="35" font-family="Dancing Script" font-size="28" fill="%231e3a8a">${encodeURIComponent(signerName)}</text></svg>`,
      });
    } else if (tab === 'type') {
      onAdoptSignature({
        type: 'type',
        value: typedName,
        fontFamily: selectedFont
      });
    } else if (tab === 'upload' && uploadedImage) {
      onAdoptSignature({
        type: 'upload',
        value: uploadedImage
      });
    }
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Adopt Your Electronic Signature</h3>
            <p className="text-xs text-slate-400">Compliant with US ESIGN Act §101 & EU eIDAS Regulation</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-4 flex space-x-2 border-b border-slate-800">
          <button
            onClick={() => setTab('draw')}
            className={`flex items-center space-x-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-all ${
              tab === 'draw'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span>Draw Signature</span>
          </button>

          <button
            onClick={() => setTab('type')}
            className={`flex items-center space-x-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-all ${
              tab === 'type'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Choose Styled Font</span>
          </button>

          <button
            onClick={() => setTab('upload')}
            className={`flex items-center space-x-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-all ${
              tab === 'upload'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Image</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {tab === 'draw' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400">Ink Color:</span>
                  <button
                    onClick={() => setInkColor('#1e3a8a')}
                    className={`w-5 h-5 rounded-full bg-blue-900 border-2 ${inkColor === '#1e3a8a' ? 'border-white ring-2 ring-blue-500' : 'border-transparent'}`}
                  />
                  <button
                    onClick={() => setInkColor('#0f172a')}
                    className={`w-5 h-5 rounded-full bg-slate-900 border-2 ${inkColor === '#0f172a' ? 'border-white ring-2 ring-slate-500' : 'border-transparent'}`}
                  />
                </div>

                <button
                  onClick={clearCanvas}
                  className="flex items-center space-x-1 text-xs text-slate-400 hover:text-rose-400"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  <span>Clear Pad</span>
                </button>
              </div>

              {/* Canvas Pad */}
              <div className="relative rounded-xl bg-white border-2 border-dashed border-slate-300 overflow-hidden shadow-inner flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={500}
                  height={180}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="cursor-crosshair w-full h-[180px] touch-none"
                />
                {!hasDrawn && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400 text-xs">
                    <PenTool className="w-6 h-6 mb-1 text-slate-300 opacity-60" />
                    <span>Draw your signature with mouse or touch screen</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'type' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Your Full Legal Name</label>
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-400 block">Select Style</label>
                <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto">
                  {fonts.map(font => (
                    <div
                      key={font.name}
                      onClick={() => setSelectedFont(font.name)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        selectedFont === font.name
                          ? 'bg-indigo-950/40 border-indigo-500 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <span className={`text-2xl text-blue-300 ${font.class}`}>
                          {typedName || 'SignFlow'}
                        </span>
                        <p className="text-[10px] text-slate-500 mt-1">{font.label}</p>
                      </div>
                      {selectedFont === font.name && <Check className="w-5 h-5 text-indigo-400" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'upload' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-indigo-500/50 transition-colors">
                {uploadedImage ? (
                  <div className="space-y-2">
                    <img src={uploadedImage} alt="Uploaded Signature" className="max-h-28 mx-auto bg-white p-2 rounded-lg" />
                    <p className="text-xs text-emerald-400">Signature Image Ready</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 mx-auto text-slate-500" />
                    <p className="text-xs text-slate-300 font-medium">Upload PNG or JPG of your signature</p>
                    <p className="text-[11px] text-slate-500">Transparent background recommended</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="text-xs text-slate-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Legal Consent Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-slate-500 leading-snug text-center sm:text-left">
            By clicking Adopt and Sign, I agree that this electronic signature is the legally binding equivalent of my handwritten signature.
          </p>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleAdopt}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
            >
              Adopt & Apply Signature
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
