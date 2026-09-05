import React, { useState, useRef, useEffect } from 'react';
import { 
  PenTool, 
  Type, 
  Upload, 
  Eraser, 
  Check, 
  X, 
  Sparkles, 
  Palette, 
  RotateCcw, 
  Bookmark, 
  ShieldCheck, 
  Stamp, 
  Layers, 
  Sliders, 
  Download,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { CustomSignature } from '../../types/signflow';
import { useSignFlow } from '../../context/SignFlowContext';

export interface CustomSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySignature: (signature: CustomSignature) => void;
  defaultName?: string;
  defaultInitials?: string;
  targetRole?: string;
}

const DEFAULT_FONTS = [
  { id: 'dancing', name: 'Dancing Script', class: 'signature-font-dancing', label: 'Contemporary Script', style: 'Modern & Fluid' },
  { id: 'greatvibes', name: 'Great Vibes', class: 'signature-font-greatvibes', label: 'Classic Calligraphy', style: 'Flourished & Formal' },
  { id: 'caveat', name: 'Caveat', class: 'signature-font-caveat', label: 'Modern Casual Pen', style: 'Authentic & Expressive' },
  { id: 'sacramento', name: 'Sacramento', class: 'signature-font-sacramento', label: 'Executive Flow', style: 'Delicate & Sleek' },
  { id: 'alexbrush', name: 'Alex Brush', class: 'signature-font-alexbrush', label: 'Formal Cursive', style: 'Traditional Legal' }
];

const INK_COLORS = [
  { id: 'indigo', name: 'Deep Indigo', hex: '#4f46e5', bg: 'bg-indigo-600' },
  { id: 'slate', name: 'Midnight Slate', hex: '#0f172a', bg: 'bg-slate-900' },
  { id: 'blue', name: 'Royal Blue', hex: '#1d4ed8', bg: 'bg-blue-700' },
  { id: 'emerald', name: 'Emerald', hex: '#047857', bg: 'bg-emerald-700' },
  { id: 'burgundy', name: 'Burgundy', hex: '#991b1b', bg: 'bg-red-800' }
];

export const CustomSignatureModal: React.FC<CustomSignatureModalProps> = ({
  isOpen,
  onClose,
  onApplySignature,
  defaultName = 'John Smith',
  defaultInitials = 'JS',
  targetRole = 'Disclosing Party'
}) => {
  const { notify } = useSignFlow();

  const [activeTab, setActiveTab] = useState<'draw' | 'type' | 'upload' | 'stamp' | 'vault'>('draw');
  
  // Draw State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [inkColor, setInkColor] = useState('#4f46e5');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [strokeHistory, setStrokeHistory] = useState<ImageData[]>([]);

  // Type State
  const [typedName, setTypedName] = useState(defaultName);
  const [typedInitials, setTypedInitials] = useState(defaultInitials);
  const [selectedFont, setSelectedFont] = useState('Dancing Script');

  // Upload State
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Stamp State
  const [stampText, setStampText] = useState('ACME CORP • VERIFIED');
  const [stampDepartment, setStampDepartment] = useState('LEGAL & COMPLIANCE');

  // Vault / Saved Signatures
  const [saveToVault, setSaveToVault] = useState(true);
  const [savedSignatures, setSavedSignatures] = useState<CustomSignature[]>([
    {
      id: 'sig-saved-1',
      name: 'John Smith (Executive Cursive)',
      type: 'type',
      value: 'John Smith',
      fontFamily: 'Dancing Script',
      inkColor: '#4f46e5',
      initials: 'JS',
      isDefault: true,
      createdAt: '2026-05-18'
    },
    {
      id: 'sig-saved-2',
      name: 'Alice Morgan (Formal Signature)',
      type: 'type',
      value: 'Alice Morgan',
      fontFamily: 'Great Vibes',
      inkColor: '#991b1b',
      initials: 'AM',
      isDefault: false,
      createdAt: '2026-05-19'
    }
  ]);

  // Initialize Canvas
  useEffect(() => {
    if (activeTab === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = inkColor;
      }
    }
  }, [activeTab, inkColor, strokeWidth]);

  if (!isOpen) return null;

  // Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasDrawn(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save history for undo
    setStrokeHistory(prev => [...prev.slice(-9), ctx.getImageData(0, 0, canvas.width, canvas.height)]);

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
    setStrokeHistory([]);
  };

  const handleUndo = () => {
    if (strokeHistory.length === 0) {
      clearCanvas();
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const previousState = strokeHistory[strokeHistory.length - 1];
    setStrokeHistory(prev => prev.slice(0, -1));
    ctx.putImageData(previousState, 0, 0);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        notify('success', 'Image Uploaded', 'Custom signature graphic loaded.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApply = () => {
    let signatureObj: CustomSignature;

    if (activeTab === 'draw') {
      const canvas = canvasRef.current;
      const dataUrl = canvas && hasDrawn 
        ? canvas.toDataURL('image/png') 
        : `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="60"><text x="10" y="40" font-family="Dancing Script" font-size="32" fill="${encodeURIComponent(inkColor)}">${encodeURIComponent(typedName || defaultName)}</text></svg>`;

      signatureObj = {
        id: `sig_${Date.now()}`,
        name: `${typedName || defaultName} (Drawn)`,
        type: 'draw',
        value: dataUrl,
        inkColor,
        initials: typedInitials || defaultInitials,
        createdAt: new Date().toISOString()
      };
    } else if (activeTab === 'type') {
      signatureObj = {
        id: `sig_${Date.now()}`,
        name: `${typedName} (${selectedFont})`,
        type: 'type',
        value: typedName || defaultName,
        fontFamily: selectedFont,
        inkColor,
        initials: typedInitials || defaultInitials,
        createdAt: new Date().toISOString()
      };
    } else if (activeTab === 'upload' && uploadedImage) {
      signatureObj = {
        id: `sig_${Date.now()}`,
        name: `${typedName || defaultName} (Uploaded)`,
        type: 'upload',
        value: uploadedImage,
        initials: typedInitials || defaultInitials,
        createdAt: new Date().toISOString()
      };
    } else if (activeTab === 'stamp') {
      signatureObj = {
        id: `sig_${Date.now()}`,
        name: `${stampText} Stamp`,
        type: 'stamp',
        value: `${stampText} • ${stampDepartment}`,
        inkColor,
        initials: typedInitials || defaultInitials,
        createdAt: new Date().toISOString()
      };
    } else {
      signatureObj = savedSignatures[0];
    }

    if (saveToVault) {
      setSavedSignatures(prev => [signatureObj, ...prev]);
    }

    onApplySignature(signatureObj);
    notify('success', 'Signature Added to Document', `Applied "${signatureObj.name}" to agreement.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-2xs">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900 font-display">Create Custom Signature</h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100">
                  {targetRole}
                </span>
              </div>
              <p className="text-xs text-slate-400">Design, draw, style, or upload legally-binding electronic signatures</p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 flex space-x-2 border-b border-slate-100 bg-white overflow-x-auto text-xs font-semibold">
          {[
            { id: 'draw', label: 'Draw Pad', icon: PenTool },
            { id: 'type', label: 'Type Calligraphy', icon: Type },
            { id: 'upload', label: 'Upload Image', icon: Upload },
            { id: 'stamp', label: 'Official Stamp / Seal', icon: Stamp },
            { id: 'vault', label: 'Saved Signatures', icon: Bookmark, badge: savedSignatures.length }
          ].map(tabItem => {
            const Icon = tabItem.icon;
            return (
              <button
                key={tabItem.id}
                onClick={() => setActiveTab(tabItem.id as any)}
                className={`flex items-center space-x-1.5 pb-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tabItem.id
                    ? 'border-indigo-600 text-indigo-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tabItem.label}</span>
                {tabItem.badge !== undefined && (
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 text-[10px]">
                    {tabItem.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* 1. DRAW PAD TAB */}
          {activeTab === 'draw' && (
            <div className="space-y-4">
              {/* Controls bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80 text-xs">
                {/* Ink Color Palette */}
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500 font-medium">Ink Color:</span>
                  <div className="flex items-center space-x-1.5">
                    {INK_COLORS.map(color => (
                      <button
                        key={color.id}
                        onClick={() => setInkColor(color.hex)}
                        className={`w-6 h-6 rounded-full ${color.bg} transition-all cursor-pointer flex items-center justify-center ${
                          inkColor === color.hex ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110 shadow-xs' : 'opacity-80 hover:opacity-100'
                        }`}
                        title={color.name}
                      >
                        {inkColor === color.hex && <Check className="w-3 h-3 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stroke Width Selector */}
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500 font-medium">Stroke:</span>
                  <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5">
                    {[
                      { width: 2, label: 'Fine' },
                      { width: 3.5, label: 'Medium' },
                      { width: 5, label: 'Bold' }
                    ].map(s => (
                      <button
                        key={s.label}
                        onClick={() => setStrokeWidth(s.width)}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                          strokeWidth === s.width ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Undo & Clear */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={handleUndo}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer flex items-center space-x-1"
                    title="Undo stroke"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Undo</span>
                  </button>

                  <button
                    onClick={clearCanvas}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer flex items-center space-x-1"
                    title="Clear pad"
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              {/* Interactive Canvas */}
              <div className="relative rounded-2xl bg-white border-2 border-dashed border-slate-300 overflow-hidden shadow-inner flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={580}
                  height={200}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="cursor-crosshair w-full h-[200px] touch-none"
                />

                {!hasDrawn && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400 text-xs">
                    <PenTool className="w-8 h-8 mb-1.5 text-slate-300 animate-bounce" />
                    <span className="font-semibold text-slate-600">Draw your custom signature here</span>
                    <span className="text-[11px] text-slate-400 mt-0.5">Use your mouse, trackpad, or touchscreen</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. TYPE CALLIGRAPHY TAB */}
          {activeTab === 'type' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Full Name / Signature Text</label>
                  <input
                    type="text"
                    value={typedName}
                    onChange={(e) => setTypedName(e.target.value)}
                    placeholder="e.g. John Smith"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Initials</label>
                  <input
                    type="text"
                    value={typedInitials}
                    onChange={(e) => setTypedInitials(e.target.value.toUpperCase().slice(0, 4))}
                    placeholder="JS"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500 text-center"
                  />
                </div>
              </div>

              {/* Ink Color Selector for Type */}
              <div className="flex items-center space-x-2 pt-1 text-xs">
                <span className="text-slate-500 font-medium">Color:</span>
                <div className="flex items-center space-x-1.5">
                  {INK_COLORS.map(color => (
                    <button
                      key={color.id}
                      onClick={() => setInkColor(color.hex)}
                      className={`w-5 h-5 rounded-full ${color.bg} transition-all cursor-pointer ${
                        inkColor === color.hex ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110 shadow-xs' : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Font Style Cards Grid */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {DEFAULT_FONTS.map(font => (
                  <div
                    key={font.id}
                    onClick={() => setSelectedFont(font.name)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedFont === font.name
                        ? 'bg-indigo-50/40 border-indigo-500 shadow-xs ring-2 ring-indigo-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <span 
                        style={{ color: inkColor }}
                        className={`text-2xl block tracking-wide ${font.class}`}
                      >
                        {typedName || 'John Smith'}
                      </span>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                        <span className="font-semibold text-slate-600">{font.name}</span>
                        <span>•</span>
                        <span>{font.style}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span 
                        style={{ color: inkColor }}
                        className={`text-lg font-bold ${font.class} px-2 py-0.5 rounded bg-slate-100`}
                      >
                        {typedInitials || 'JS'}
                      </span>
                      {selectedFont === font.name && (
                        <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. UPLOAD IMAGE TAB */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500/50 rounded-2xl p-8 text-center bg-slate-50/60 transition-colors">
                {uploadedImage ? (
                  <div className="space-y-3">
                    <img 
                      src={uploadedImage} 
                      alt="Uploaded Custom Signature" 
                      className="max-h-32 mx-auto bg-white p-3 rounded-xl border border-slate-200 shadow-xs" 
                    />
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-xs text-emerald-600 font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>High-Resolution Signature Ready</span>
                      </span>
                      <button
                        onClick={() => setUploadedImage(null)}
                        className="text-xs text-rose-600 hover:underline font-medium cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-2xs">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Upload Signature Scan or PNG Image</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Supports transparent PNG, JPG, SVG with automatic paper contrast filter</p>
                    </div>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. OFFICIAL STAMP / SEAL TAB */}
          {activeTab === 'stamp' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Company / Authority Name</label>
                  <input
                    type="text"
                    value={stampText}
                    onChange={(e) => setStampText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Department / Jurisdiction</label>
                  <input
                    type="text"
                    value={stampDepartment}
                    onChange={(e) => setStampDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Stamp Preview Card */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center">
                <div 
                  style={{ borderColor: inkColor, color: inkColor }}
                  className="w-56 h-28 rounded-xl border-2 border-dashed p-3 flex flex-col justify-between items-center text-center font-mono relative bg-white shadow-xs"
                >
                  <span className="text-[9px] font-bold uppercase tracking-widest">{stampText}</span>
                  <div className="w-8 h-8 rounded-full border border-current flex items-center justify-center my-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="text-[8px] leading-tight opacity-80">
                    <p>{stampDepartment}</p>
                    <p>OFFICIAL SEAL • {new Date().toISOString().split('T')[0]}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. SAVED SIGNATURES VAULT TAB */}
          {activeTab === 'vault' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold text-slate-800">Your Saved Profile Signatures</span>
                <span className="text-[11px] text-slate-400">{savedSignatures.length} saved</span>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {savedSignatures.map(sig => (
                  <div
                    key={sig.id}
                    onClick={() => {
                      onApplySignature(sig);
                      notify('success', 'Saved Signature Applied', `Loaded "${sig.name}"`);
                      onClose();
                    }}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-xs font-bold text-slate-900">{sig.name}</p>
                        {sig.isDefault && (
                          <span className="px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-bold border border-emerald-100">
                            Default
                          </span>
                        )}
                      </div>

                      {sig.type === 'draw' || sig.type === 'upload' ? (
                        <img src={sig.value} alt="Signature" className="h-8 max-w-xs object-contain" />
                      ) : (
                        <span 
                          style={{ color: sig.inkColor || '#4f46e5' }}
                          className={`text-xl block ${
                            sig.fontFamily === 'Dancing Script' ? 'signature-font-dancing' :
                            sig.fontFamily === 'Great Vibes' ? 'signature-font-greatvibes' :
                            sig.fontFamily === 'Caveat' ? 'signature-font-caveat' :
                            sig.fontFamily === 'Sacramento' ? 'signature-font-sacramento' :
                            'signature-font-alexbrush'
                          }`}
                        >
                          {sig.value}
                        </span>
                      )}
                    </div>

                    <button
                      className="px-3 py-1 rounded-xl bg-indigo-600 group-hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
                    >
                      Use
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer & Legal Consent */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-slate-600">
            <input
              type="checkbox"
              id="saveSignatureVault"
              checked={saveToVault}
              onChange={(e) => setSaveToVault(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="saveSignatureVault" className="cursor-pointer text-[11px] text-slate-500">
              Save this custom signature to my account library
            </label>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleApply}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Adopt & Apply Custom Signature</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
