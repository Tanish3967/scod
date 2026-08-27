import React, { useState } from 'react';
import { 
  DocumentField, 
  DocumentPage, 
  Recipient, 
  FieldType 
} from '../../types/signflow';
import { 
  Trash2, 
  Move, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  CheckCircle2,
  Lock,
  CreditCard,
  Stamp,
  Calendar,
  PenTool,
  Type,
  User,
  FileText
} from 'lucide-react';

export const DocumentViewerCanvas: React.FC<{
  pages: DocumentPage[];
  fields: DocumentField[];
  recipients: Recipient[];
  activePage: number;
  onPageChange: (page: number) => void;
  onUpdateField: (fieldId: string, updates: Partial<DocumentField>) => void;
  onRemoveField: (fieldId: string) => void;
  selectedFieldId: string | null;
  onSelectFieldId: (fieldId: string | null) => void;
}> = ({
  pages,
  fields,
  recipients,
  activePage,
  onPageChange,
  onUpdateField,
  onRemoveField,
  selectedFieldId,
  onSelectFieldId
}) => {
  const [zoomLevel, setZoomLevel] = useState(100);

  const currentPage = pages.find(p => p.pageNumber === activePage) || pages[0];
  const pageFields = fields.filter(f => f.page === activePage);

  const getFieldIcon = (type: FieldType) => {
    switch (type) {
      case 'signature': return PenTool;
      case 'initial': return Type;
      case 'date_signed': return Calendar;
      case 'name': return User;
      case 'payment': return CreditCard;
      case 'stamp': return Stamp;
      default: return FileText;
    }
  };

  const getRecipientColor = (recipientId: string) => {
    const idx = recipients.findIndex(r => r.id === recipientId);
    if (idx === 0) return 'border-indigo-500 bg-indigo-950/80 text-indigo-300';
    if (idx === 1) return 'border-purple-500 bg-purple-950/80 text-purple-300';
    if (idx === 2) return 'border-emerald-500 bg-emerald-950/80 text-emerald-300';
    return 'border-sky-500 bg-sky-950/80 text-sky-300';
  };

  return (
    <div className="flex-1 bg-slate-950 flex flex-col justify-between overflow-hidden relative">
      {/* Top Toolbar for Canvas (Zoom & Pages) */}
      <div className="h-11 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-4 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center space-x-3">
          <span className="font-semibold text-slate-200 truncate max-w-xs">
            {currentPage.title}
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 font-mono text-[11px]">
            Page {activePage} of {pages.length}
          </span>
        </div>

        {/* Pagination & Zoom */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 bg-slate-950/70 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => onPageChange(Math.max(1, activePage - 1))}
              disabled={activePage <= 1}
              className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px]">{activePage} / {pages.length}</span>
            <button
              onClick={() => onPageChange(Math.min(pages.length, activePage + 1))}
              disabled={activePage >= pages.length}
              className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center space-x-1 bg-slate-950/70 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setZoomLevel(Math.max(75, zoomLevel - 15))}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 font-mono text-[10px]">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(Math.min(130, zoomLevel + 15))}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Document Body Canvas */}
      <div className="flex-1 overflow-auto p-6 flex justify-center items-start">
        <div
          style={{ width: `${Math.round(680 * (zoomLevel / 100))}px`, minHeight: '850px' }}
          className="bg-white text-slate-900 rounded-lg shadow-2xl p-8 sm:p-12 relative border border-slate-300 select-none transition-all duration-150"
        >
          {/* Document Content Rendering */}
          <div className="prose prose-slate max-w-none text-xs leading-relaxed space-y-4 font-serif">
            {currentPage.content.split('\n\n').map((paragraph, idx) => {
              if (paragraph.startsWith('### ')) {
                return <h3 key={idx} className="text-base font-sans font-bold text-slate-950 uppercase tracking-tight border-b pb-2">{paragraph.replace('### ', '')}</h3>;
              }
              if (paragraph.startsWith('#### ')) {
                return <h4 key={idx} className="text-xs font-sans font-bold text-slate-900 uppercase mt-3">{paragraph.replace('#### ', '')}</h4>;
              }
              if (paragraph.startsWith('- ')) {
                return (
                  <ul key={idx} className="list-disc pl-4 space-y-1 font-sans text-slate-800">
                    {paragraph.split('\n').map((li, lIdx) => (
                      <li key={lIdx}>{li.replace('- ', '')}</li>
                    ))}
                  </ul>
                );
              }
              return <p key={idx} className="text-slate-800 font-sans leading-normal text-[11.5px]">{paragraph}</p>;
            })}
          </div>

          {/* Render Interactive Placed Fields Overlay */}
          {pageFields.map((field) => {
            const isSelected = field.id === selectedFieldId;
            const recipient = recipients.find(r => r.id === field.recipientId) || recipients[0];
            const Icon = getFieldIcon(field.type);
            const colorClass = getRecipientColor(field.recipientId);

            return (
              <div
                key={field.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectFieldId(field.id);
                }}
                style={{
                  top: `${field.y}%`,
                  left: `${field.x}%`,
                  width: `${field.width}%`,
                  height: `${field.height}%`
                }}
                className={`absolute rounded-md border-2 p-1.5 cursor-move flex flex-col justify-between transition-all group shadow-sm ${colorClass} ${
                  isSelected ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900 z-30 scale-[1.02]' : 'z-20 hover:brightness-110'
                }`}
              >
                <div className="flex items-center justify-between pointer-events-none">
                  <div className="flex items-center space-x-1 text-[10px] font-bold">
                    <Icon className="w-3 h-3 shrink-0" />
                    <span className="truncate">{field.label}</span>
                  </div>
                  {field.aiSuggested && (
                    <span className="p-0.5 rounded bg-indigo-500/20 text-indigo-400" title={`AI Confidence: ${Math.round((field.aiConfidence || 0.95) * 100)}%`}>
                      <Sparkles className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[9px] opacity-80 pointer-events-none mt-1">
                  <span className="truncate">{recipient?.name || 'Signer'}</span>
                  {field.required && <span className="text-rose-400 font-bold">*Required</span>}
                </div>

                {/* Quick Field Controls on Selection */}
                {isSelected && (
                  <div className="absolute -top-7 right-0 flex items-center space-x-1 bg-slate-900 p-1 rounded-md shadow-lg border border-slate-700 pointer-events-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveField(field.id);
                      }}
                      className="p-1 rounded text-rose-400 hover:bg-slate-800"
                      title="Delete Field"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
