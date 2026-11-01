import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calculator, 
  Sliders, 
  Sparkles, 
  Layers, 
  HelpCircle, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle,
  Eye,
  CheckCircle2,
  ListPlus,
  Hash,
  Type
} from 'lucide-react';
import { DocumentField, ConditionalRule, ConditionalOperator, ConditionalAction, FieldType } from '../../types/signflow';
import { evaluateFormula, formatFieldValue, getAvailableFormulaVariables } from '../../utils/fieldFormulas';
import { generateUUID } from '../../utils/cryptoUtils';

interface FieldPropertiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  field: DocumentField | null;
  allFields: DocumentField[];
  onSaveField: (updatedField: DocumentField) => void;
}

export const FieldPropertiesModal: React.FC<FieldPropertiesModalProps> = ({
  isOpen,
  onClose,
  field,
  allFields,
  onSaveField
}) => {
  if (!isOpen || !field) return null;

  const [activeTab, setActiveTab] = useState<'general' | 'formula' | 'conditional' | 'options'>('general');
  
  // Local editable state
  const [label, setLabel] = useState(field.label || '');
  const [fieldName, setFieldName] = useState(field.fieldName || field.label.replace(/\s+/g, '_').toLowerCase());
  const [type, setType] = useState<FieldType>(field.type || 'text');
  const [required, setRequired] = useState(field.required ?? true);
  const [placeholder, setPlaceholder] = useState(field.placeholder || '');
  const [defaultValue, setDefaultValue] = useState(field.defaultValue || '');
  
  // Formula state
  const [isCalculated, setIsCalculated] = useState(field.type === 'formula' || !!field.calculationFormula);
  const [formula, setFormula] = useState(field.calculationFormula || field.formulaExpression || '');
  const [numberFormat, setNumberFormat] = useState<'currency' | 'percent' | 'integer' | 'decimal'>(field.numberFormat || 'currency');
  const [currency, setCurrency] = useState(field.currency || '$');

  // Options state for dropdown/radio
  const [options, setOptions] = useState<string[]>(field.options || ['Option 1', 'Option 2', 'Option 3']);
  const [newOptionText, setNewOptionText] = useState('');

  // Conditional rules state
  const [rules, setRules] = useState<ConditionalRule[]>(field.conditionalRules || []);

  // Available variables
  const availableVars = getAvailableFormulaVariables(allFields.filter(f => f.id !== field.id));

  // Live preview evaluation
  const previewValues = allFields.reduce((acc, f) => {
    acc[f.id] = f.value || f.defaultValue || (f.type === 'number' ? '10' : '5');
    if (f.fieldName) acc[f.fieldName] = acc[f.id];
    return acc;
  }, {} as Record<string, any>);

  const formulaTestResult = evaluateFormula(formula, previewValues, allFields);

  const handleSave = () => {
    const updated: DocumentField = {
      ...field,
      label,
      fieldName: fieldName.trim().replace(/\s+/g, '_').toLowerCase(),
      type: isCalculated ? 'formula' : type,
      required,
      placeholder,
      defaultValue,
      calculationFormula: isCalculated ? formula : undefined,
      formulaExpression: isCalculated ? formula : undefined,
      isReadOnlyCalculated: isCalculated,
      numberFormat: (isCalculated || type === 'number' || type === 'payment') ? numberFormat : undefined,
      currency: currency || '$',
      options: (type === 'dropdown' || type === 'radio') ? options : undefined,
      conditionalRules: rules.length > 0 ? rules : undefined
    };

    onSaveField(updated);
    onClose();
  };

  const addRule = () => {
    const otherField = allFields.find(f => f.id !== field.id);
    if (!otherField) return;

    const newRule: ConditionalRule = {
      id: 'rule-' + generateUUID().slice(0, 6),
      triggerFieldId: otherField.id,
      operator: otherField.type === 'checkbox' ? 'is_checked' : 'equals',
      triggerValue: 'Yes',
      action: 'show'
    };
    setRules([...rules, newRule]);
  };

  const removeRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const updateRule = (id: string, updates: Partial<ConditionalRule>) => {
    setRules(rules.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const addOption = () => {
    if (!newOptionText.trim()) return;
    setOptions([...options, newOptionText.trim()]);
    setNewOptionText('');
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const insertVariableIntoFormula = (token: string) => {
    setFormula(prev => prev + (prev && !prev.endsWith(' ') ? ' ' : '') + token + ' ');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Field Properties & Logic
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Field ID: #{field.id} • Assigned: {field.recipientId}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-slate-100 bg-white gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'general'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>General</span>
          </button>

          <button
            onClick={() => setActiveTab('formula')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'formula'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Calculations & Formulas</span>
            {isCalculated && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('conditional')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'conditional'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Conditional Logic</span>
            {rules.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-indigo-100 text-indigo-700 font-bold">
                {rules.length}
              </span>
            )}
          </button>

          {(type === 'dropdown' || type === 'radio') && (
            <button
              onClick={() => setActiveTab('options')}
              className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'options'
                  ? 'border-indigo-600 text-indigo-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ListPlus className="w-3.5 h-3.5" />
              <span>Options List</span>
            </button>
          )}
        </div>

        {/* Tab Contents */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5 text-xs text-slate-800">
          {/* TAB 1: GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 block">Display Label</label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g. Unit Price ($)"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 block">
                    Variable Token Name <span className="text-[10px] text-slate-400 font-mono">(for formulas)</span>
                  </label>
                  <input
                    type="text"
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    placeholder="e.g. unit_price"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 block">Field Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as FieldType)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="text">Text Input</option>
                    <option value="number">Numeric Number</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="radio">Radio Buttons</option>
                    <option value="dropdown">Dropdown Select</option>
                    <option value="date_signed">Date Signed</option>
                    <option value="signature">Signature Pad</option>
                    <option value="initial">Initials</option>
                    <option value="formula">Calculated Formula</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 block">Placeholder Text</label>
                  <input
                    type="text"
                    value={placeholder}
                    onChange={(e) => setPlaceholder(e.target.value)}
                    placeholder="e.g. Enter amount..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div>
                  <p className="font-semibold text-slate-900">Mandatory Required Field</p>
                  <p className="text-[11px] text-slate-500">Signer cannot complete agreement without filling this field</p>
                </div>
                <input
                  type="checkbox"
                  checked={required}
                  onChange={(e) => setRequired(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 2: FORMULAS & CALCULATIONS */}
          {activeTab === 'formula' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Make this a Calculated Field</p>
                    <p className="text-[11px] text-slate-500">Automatically evaluates live math formulas based on other field entries</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isCalculated}
                  onChange={(e) => setIsCalculated(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              {isCalculated && (
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 flex items-center justify-between">
                      <span>Formula Expression</span>
                      <span className="text-[10px] text-indigo-600 font-mono font-normal">Supports +, -, *, /, (), SUM(), AVG(), ROUND()</span>
                    </label>
                    <textarea
                      value={formula}
                      onChange={(e) => setFormula(e.target.value)}
                      rows={3}
                      placeholder="e.g. [unit_price] * [quantity] * (1 + [tax_rate])"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs focus:outline-none border border-slate-800"
                    />
                  </div>

                  {/* Variable Token Palette */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 block text-[11px]">Insert Available Field Variable Tokens:</label>
                    <div className="flex flex-wrap gap-1.5">
                      {availableVars.length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic">No other numeric fields placed on this document yet.</p>
                      ) : (
                        availableVars.map((v) => (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => insertVariableIntoFormula(v.token)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 border border-slate-200 font-mono text-[11px] text-slate-700 transition-colors cursor-pointer"
                          >
                            + {v.token} ({v.label})
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Math Operator Shortcut Buttons */}
                  <div className="flex items-center space-x-1.5 pt-1">
                    {['+', '-', '*', '/', '(', ')', 'ROUND(', ', 2)'].map((op) => (
                      <button
                        key={op}
                        type="button"
                        onClick={() => insertVariableIntoFormula(op)}
                        className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono text-xs font-bold cursor-pointer"
                      >
                        {op}
                      </button>
                    ))}
                  </div>

                  {/* Number Formatting */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-700 block">Number Format</label>
                      <select
                        value={numberFormat}
                        onChange={(e) => setNumberFormat(e.target.value as any)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="currency">Currency ($1,250.00)</option>
                        <option value="decimal">Decimal (1,250.00)</option>
                        <option value="integer">Integer (1,250)</option>
                        <option value="percent">Percentage (12.50%)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-700 block">Currency Symbol</label>
                      <input
                        type="text"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        placeholder="$"
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Live Formula Preview Box */}
                  <div className="p-3.5 rounded-xl bg-slate-900 text-white space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Live Evaluation Test</span>
                      {formulaTestResult.error ? (
                        <span className="text-[10px] text-rose-400 font-semibold">Error: {formulaTestResult.error}</span>
                      ) : (
                        <span className="text-[10px] text-emerald-400 font-semibold">Valid Formula ✓</span>
                      )}
                    </div>
                    <p className="text-xl font-bold font-mono text-emerald-400">
                      {formatFieldValue(formulaTestResult.value, numberFormat, currency) || '$0.00'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CONDITIONAL LOGIC */}
          {activeTab === 'conditional' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <p className="font-bold text-slate-900">Conditional Display Rules</p>
                  <p className="text-[11px] text-slate-500">Show, hide, or require this field dynamically when other fields match conditions</p>
                </div>

                <button
                  type="button"
                  onClick={addRule}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Rule</span>
                </button>
              </div>

              {rules.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 text-center text-slate-400 space-y-2">
                  <Layers className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="font-semibold text-slate-600">No Conditional Rules Active</p>
                  <p className="text-[11px]">This field is always visible to the designated signer.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {rules.map((rule, idx) => (
                    <div key={rule.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                          Rule #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeRule(rule.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center text-xs">
                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 block mb-1">Action</label>
                          <select
                            value={rule.action}
                            onChange={(e) => updateRule(rule.id, { action: e.target.value as ConditionalAction })}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900"
                          >
                            <option value="show">Show Field</option>
                            <option value="hide">Hide Field</option>
                            <option value="require">Make Required</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 block mb-1">When Field</label>
                          <select
                            value={rule.triggerFieldId}
                            onChange={(e) => updateRule(rule.id, { triggerFieldId: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900"
                          >
                            {allFields.filter(f => f.id !== field.id).map(f => (
                              <option key={f.id} value={f.id}>{f.label} ({f.type})</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 block mb-1">Operator</label>
                          <select
                            value={rule.operator}
                            onChange={(e) => updateRule(rule.id, { operator: e.target.value as ConditionalOperator })}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900"
                          >
                            <option value="equals">Equals</option>
                            <option value="not_equals">Does Not Equal</option>
                            <option value="is_checked">Is Checked</option>
                            <option value="is_not_checked">Is Not Checked</option>
                            <option value="greater_than">Greater Than</option>
                            <option value="less_than">Less Than</option>
                            <option value="contains">Contains</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 block mb-1">Value</label>
                          <input
                            type="text"
                            value={rule.triggerValue}
                            onChange={(e) => updateRule(rule.id, { triggerValue: e.target.value })}
                            placeholder="e.g. Yes or 100"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: OPTIONS (Dropdown / Radio) */}
          {activeTab === 'options' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newOptionText}
                  onChange={(e) => setNewOptionText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addOption()}
                  placeholder="Type new option text..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={addOption}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer"
                >
                  Add Option
                </button>
              </div>

              <div className="space-y-2">
                {options.map((opt, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-medium text-slate-800">{opt}</span>
                    <button
                      type="button"
                      onClick={() => removeOption(i)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end space-x-3 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all hover:scale-[1.02] cursor-pointer flex items-center space-x-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Apply Field Properties</span>
          </button>
        </div>
      </div>
    </div>
  );
};
