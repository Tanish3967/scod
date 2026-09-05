import React from 'react';
import { 
  PenTool, 
  Type, 
  Calendar, 
  User, 
  Mail, 
  FileText, 
  CheckSquare, 
  Radio, 
  ListFilter, 
  Paperclip, 
  CreditCard, 
  Calculator, 
  Stamp,
  Sparkles,
  Info
} from 'lucide-react';
import { FieldType } from '../../types/signflow';

interface FieldTool {
  type: FieldType;
  label: string;
  icon: React.FC<{ className?: string }>;
  color: string;
  category: 'Standard' | 'Data Entry' | 'Special & Payment';
}

const FIELD_TOOLS: FieldTool[] = [
  { type: 'signature', label: 'Signature', icon: PenTool, color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10', category: 'Standard' },
  { type: 'initial', label: 'Initial', icon: Type, color: 'text-purple-400 border-purple-500/30 bg-purple-500/10', category: 'Standard' },
  { type: 'date_signed', label: 'Date Signed', icon: Calendar, color: 'text-sky-400 border-sky-500/30 bg-sky-500/10', category: 'Standard' },
  { type: 'name', label: 'Full Name', icon: User, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10', category: 'Standard' },
  
  { type: 'text', label: 'Text Field', icon: FileText, color: 'text-slate-300 border-slate-700 bg-slate-800/40', category: 'Data Entry' },
  { type: 'email', label: 'Email Address', icon: Mail, color: 'text-slate-300 border-slate-700 bg-slate-800/40', category: 'Data Entry' },
  { type: 'checkbox', label: 'Checkbox', icon: CheckSquare, color: 'text-slate-300 border-slate-700 bg-slate-800/40', category: 'Data Entry' },
  { type: 'radio', label: 'Radio Group', icon: Radio, color: 'text-slate-300 border-slate-700 bg-slate-800/40', category: 'Data Entry' },
  { type: 'dropdown', label: 'Dropdown', icon: ListFilter, color: 'text-slate-300 border-slate-700 bg-slate-800/40', category: 'Data Entry' },
  
  { type: 'attachment', label: 'Attachment Request', icon: Paperclip, color: 'text-amber-400 border-amber-500/30 bg-amber-500/10', category: 'Special & Payment' },
  { type: 'payment', label: 'Stripe Payment', icon: CreditCard, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10', category: 'Special & Payment' },
  { type: 'formula', label: 'Formula / Calc', icon: Calculator, color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10', category: 'Special & Payment' },
  { type: 'stamp', label: 'Notary Stamp/Seal', icon: Stamp, color: 'text-rose-400 border-rose-500/30 bg-rose-500/10', category: 'Special & Payment' }
];

export const FieldPalette: React.FC<{
  onAddField: (type: FieldType) => void;
  selectedRecipientId: string;
  recipientName: string;
}> = ({ onAddField, selectedRecipientId, recipientName }) => {
  return (
    <div className="w-72 bg-slate-900/90 border-r border-slate-800/80 p-4 shrink-0 flex flex-col justify-between h-full overflow-y-auto">
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Field Toolbox</h3>
            <span className="text-[10px] text-slate-500 font-mono">13 Types</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Placing fields for: <span className="font-semibold text-indigo-400">{recipientName}</span>
          </p>
        </div>

        {/* Categorized Tools */}
        {(['Standard', 'Data Entry', 'Special & Payment'] as const).map(category => {
          const tools = FIELD_TOOLS.filter(t => t.category === category);
          return (
            <div key={category} className="space-y-1.5">
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                {category}
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {tools.map(tool => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.type}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', tool.type);
                      }}
                      onClick={() => onAddField(tool.type)}
                      title={`Drag & drop onto canvas or click to add ${tool.label}`}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all text-left hover:scale-[1.01] active:scale-[0.99] cursor-grab active:cursor-grabbing ${tool.color}`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{tool.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-start space-x-2">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <p className="leading-snug">
          Click any field to add it to the active document page, or use <span className="text-indigo-300 font-semibold">AI Auto-Detect</span> to place all blanks automatically.
        </p>
      </div>
    </div>
  );
};
