import { DocumentField, ConditionalRule, Envelope, DocumentPage } from '../types/signflow';

/**
 * Evaluates mathematical formula expressions containing field identifiers like [unit_price] or [field_id].
 * Safe AST evaluator without unsafe eval().
 */
export function evaluateFormula(
  formula: string, 
  fieldValues: Record<string, any>, 
  fields: DocumentField[] = []
): { value: number | null; error?: string } {
  if (!formula || !formula.trim()) return { value: null };

  try {
    let sanitized = formula;

    // Replace [field_id] or [fieldName] or [label] with numeric values
    const tokenRegex = /\[([^\]]+)\]/g;
    sanitized = sanitized.replace(tokenRegex, (match, tokenName) => {
      const cleanToken = tokenName.trim();
      
      // 1. Direct ID match
      if (fieldValues[cleanToken] !== undefined) {
        const val = parseFloat(String(fieldValues[cleanToken]).replace(/[^0-9.-]+/g, ''));
        return isNaN(val) ? '0' : String(val);
      }

      // 2. Match by fieldName or label in fields list
      const matchedField = fields.find(
        f => f.fieldName?.toLowerCase() === cleanToken.toLowerCase() ||
             f.id.toLowerCase() === cleanToken.toLowerCase() ||
             f.label.toLowerCase() === cleanToken.toLowerCase()
      );

      if (matchedField) {
        const rawVal = fieldValues[matchedField.id] ?? matchedField.value ?? '0';
        const val = parseFloat(String(rawVal).replace(/[^0-9.-]+/g, ''));
        return isNaN(val) ? '0' : String(val);
      }

      return '0';
    });

    // Support standard math functions: SUM(1, 2, 3), AVG(1, 2), MAX(), MIN(), ROUND()
    sanitized = sanitized.replace(/SUM\(([^)]+)\)/gi, (_, args) => {
      const nums = args.split(',').map((n: string) => parseFloat(n.trim()) || 0);
      return String(nums.reduce((acc: number, cur: number) => acc + cur, 0));
    });

    sanitized = sanitized.replace(/AVG\(([^)]+)\)/gi, (_, args) => {
      const nums = args.split(',').map((n: string) => parseFloat(n.trim()) || 0);
      if (nums.length === 0) return '0';
      return String(nums.reduce((acc: number, cur: number) => acc + cur, 0) / nums.length);
    });

    sanitized = sanitized.replace(/MAX\(([^)]+)\)/gi, (_, args) => {
      const nums = args.split(',').map((n: string) => parseFloat(n.trim()) || 0);
      return String(Math.max(...nums));
    });

    sanitized = sanitized.replace(/MIN\(([^)]+)\)/gi, (_, args) => {
      const nums = args.split(',').map((n: string) => parseFloat(n.trim()) || 0);
      return String(Math.min(...nums));
    });

    sanitized = sanitized.replace(/ROUND\(([^,]+),?\s*(\d+)?\)/gi, (_, expr, decimals) => {
      const val = parseFloat(expr) || 0;
      const dec = parseInt(decimals || '0', 10);
      return String(Number(val.toFixed(dec)));
    });

    // Safe mathematical evaluation using simple recursive descent / operator parser
    const computed = safeCalculate(sanitized);
    if (isNaN(computed) || !isFinite(computed)) {
      return { value: null, error: 'Calculation resulted in non-finite number' };
    }

    return { value: computed };
  } catch (err: any) {
    return { value: null, error: err.message || 'Formula syntax error' };
  }
}

/**
 * Safe expression calculator for basic arithmetic + - * / ( )
 */
function safeCalculate(expression: string): number {
  // Strip any disallowed characters for security
  const cleaned = expression.replace(/[^0-9+\-*/(). ]/g, '');
  if (!cleaned.trim()) return 0;

  // Tokenize
  const tokens = cleaned.match(/\d+(\.\d+)?|[+\-*/()]/g);
  if (!tokens) return 0;

  let pos = 0;

  function parseExpression(): number {
    let left = parseTerm();
    while (pos < tokens.length && (tokens[pos] === '+' || tokens[pos] === '-')) {
      const op = tokens[pos++];
      const right = parseTerm();
      if (op === '+') left += right;
      else left -= right;
    }
    return left;
  }

  function parseTerm(): number {
    let left = parseFactor();
    while (pos < tokens.length && (tokens[pos] === '*' || tokens[pos] === '/')) {
      const op = tokens[pos++];
      const right = parseFactor();
      if (op === '*') left *= right;
      else left = right !== 0 ? left / right : 0;
    }
    return left;
  }

  function parseFactor(): number {
    if (pos >= tokens.length) return 0;
    const token = tokens[pos++];
    if (token === '(') {
      const val = parseExpression();
      if (pos < tokens.length && tokens[pos] === ')') pos++;
      return val;
    }
    if (token === '-' && pos < tokens.length) {
      return -parseFactor();
    }
    const num = parseFloat(token);
    return isNaN(num) ? 0 : num;
  }

  return parseExpression();
}

/**
 * Format numeric value according to numberFormat token
 */
export function formatFieldValue(
  value: number | null | undefined, 
  format?: 'currency' | 'percent' | 'integer' | 'decimal', 
  currency: string = '$'
): string {
  if (value === null || value === undefined || isNaN(value)) return '';

  switch (format) {
    case 'currency':
      return `${currency}${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'percent':
      return `${(value * 100).toFixed(2)}%`;
    case 'integer':
      return Math.round(value).toLocaleString('en-US');
    case 'decimal':
      return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    default:
      return String(Number(value.toFixed(4)));
  }
}

/**
 * Checks whether a field should be shown, hidden, or required based on its conditional rules
 */
export function evaluateConditionalVisibility(
  field: DocumentField,
  allFieldValues: Record<string, any>
): { isVisible: boolean; isRequired: boolean; reason?: string } {
  if (!field.conditionalRules || field.conditionalRules.length === 0) {
    return { isVisible: true, isRequired: field.required };
  }

  let isVisible = true;
  let isRequired = field.required;

  for (const rule of field.conditionalRules) {
    const rawVal = allFieldValues[rule.triggerFieldId];
    const triggerVal = String(rawVal ?? '').toLowerCase().trim();
    const targetVal = String(rule.triggerValue ?? '').toLowerCase().trim();

    let ruleMatches = false;

    switch (rule.operator) {
      case 'equals':
        ruleMatches = triggerVal === targetVal;
        break;
      case 'not_equals':
        ruleMatches = triggerVal !== targetVal;
        break;
      case 'contains':
        ruleMatches = triggerVal.includes(targetVal);
        break;
      case 'is_checked':
        ruleMatches = rawVal === true || rawVal === 'true' || triggerVal === 'yes' || triggerVal === 'on';
        break;
      case 'is_not_checked':
        ruleMatches = rawVal === false || rawVal === 'false' || !rawVal || triggerVal === 'no' || triggerVal === 'off';
        break;
      case 'greater_than': {
        const numA = parseFloat(triggerVal);
        const numB = parseFloat(targetVal);
        ruleMatches = !isNaN(numA) && !isNaN(numB) && numA > numB;
        break;
      }
      case 'less_than': {
        const numA = parseFloat(triggerVal);
        const numB = parseFloat(targetVal);
        ruleMatches = !isNaN(numA) && !isNaN(numB) && numA < numB;
        break;
      }
    }

    if (rule.action === 'show') {
      isVisible = ruleMatches;
    } else if (rule.action === 'hide') {
      isVisible = !ruleMatches;
    } else if (rule.action === 'require' && ruleMatches) {
      isRequired = true;
    }
  }

  return { isVisible, isRequired };
}

/**
 * Helper to extract available formula variables from document fields
 */
export function getAvailableFormulaVariables(fields: DocumentField[]): { token: string; label: string; id: string }[] {
  return fields
    .filter(f => f.type === 'number' || f.type === 'formula' || f.type === 'payment' || f.type === 'text')
    .map(f => ({
      token: f.fieldName ? `[${f.fieldName}]` : `[${f.label.replace(/\s+/g, '_').toLowerCase()}]`,
      label: f.label,
      id: f.id
    }));
}

/**
 * Evaluates dynamic conditional schedule injections and cross-signer variable cascading (Pillar 2).
 */
export function evaluateDynamicDocumentAssembly(
  envelope: Envelope,
  fieldValues: Record<string, any>
): {
  injectedPages: DocumentPage[];
  activeRulesCount: number;
  cascadedFields: Record<string, any>;
  dynamicScheduleTitles: string[];
} {
  const injectedPages: DocumentPage[] = [];
  const cascadedFields: Record<string, any> = { ...fieldValues };
  const dynamicScheduleTitles: string[] = [];
  let activeRulesCount = 0;

  // 1. Cross-Signer Variable Cascading: map any filled values across shared field names
  envelope.fields.forEach(f => {
    if (f.fieldName && fieldValues[f.id] !== undefined) {
      cascadedFields[f.fieldName] = fieldValues[f.id];
    }
  });

  // 2. Dynamic Schedule 1: EU GDPR Data Processing Addendum (DPA) & Standard Contractual Clauses (SCC)
  // Triggered if any checkbox or text field relates to EU data, gdpr, or privacy
  const isGdprTriggered = Object.entries(fieldValues).some(([key, val]) => {
    const field = envelope.fields.find(f => f.id === key || f.fieldName === key);
    const label = (field?.label || key).toLowerCase();
    const isChecked = val === true || val === 'true' || val === 'yes' || val === 'on';
    return (label.includes('gdpr') || label.includes('eu data') || label.includes('privacy addendum') || label.includes('data processing')) && isChecked;
  });

  if (isGdprTriggered) {
    activeRulesCount++;
    dynamicScheduleTitles.push('Schedule A: GDPR Data Processing Addendum');
    injectedPages.push({
      pageNumber: (envelope.documents[0]?.pages?.length || 1) + injectedPages.length + 1,
      title: 'Schedule A: EU GDPR Data Processing Addendum (SCCs)',
      content: `### SCHEDULE A: DATA PROCESSING ADDENDUM (GDPR / eIDAS ALIGNED)\n\n**Data Residency Jurisdiction**: European Economic Area (EEA)\n**Data Exporter**: SignFlow Counterparty Signatory\n**Data Importer**: Platform Cloud Trust Infrastructure\n\n#### 1. SCOPE & PURPOSE OF DATA PROCESSING\nThis Addendum supplements the Principal Agreement pursuant to Article 28 of the Regulation (EU) 2016/679 (GDPR). The Importer shall process personal data solely on documented instructions from the Exporter and maintain ISO 27001 & SOC 2 Type II controls.\n\n#### 2. STANDARD CONTRACTUAL CLAUSES (MODULE 2: CONTROLLER-TO-PROCESSOR)\nThe parties hereby incorporate by reference Commission Implementing Decision (EU) 2021/914 Standard Contractual Clauses. Technical and organizational security measures include 256-bit AES cryptographic rest encryption and SHA-256 Merkle tamper sealing.\n\n---\n*Dynamic Living Agreement Schedule automatically injected via SignFlow Smart Contract Engine.*`
    });
  }

  // 3. Dynamic Schedule 2: Multi-Year Enterprise Discount & SLA Performance Schedule
  // Triggered if term >= 24 months, 2 years, or 3 years
  const termVal = cascadedFields['term_years'] || cascadedFields['contract_term'] || cascadedFields['term'] || '';
  const termNum = parseInt(String(termVal), 10);
  const isMultiYear = termNum >= 2 || String(termVal).toLowerCase().includes('3 year') || String(termVal).toLowerCase().includes('multi-year');

  if (isMultiYear) {
    activeRulesCount++;
    dynamicScheduleTitles.push('Schedule B: Multi-Year SLA Matrix');
    injectedPages.push({
      pageNumber: (envelope.documents[0]?.pages?.length || 1) + injectedPages.length + 1,
      title: 'Schedule B: Multi-Year Enterprise SLA & Discount Matrix',
      content: `### SCHEDULE B: MULTI-YEAR PERFORMANCE COMMITMENT & SLA CREDITS\n\n**Commitment Term**: ${termNum > 0 ? termNum : 3} Years Extended Horizon\n**Multi-Year Enterprise Discount**: 15% Annualized Service Credit Applied\n**Service Availability Guarantee**: 99.95% Monthly Uptime Commitment\n\n#### 1. SERVICE CREDIT FORMULA\nIf monthly availability falls below 99.95%, Client shall receive automated service credits equal to 10% of monthly fees for every 0.1% degradation, calculated automatically by the SignFlow Autopilot engine.\n\n---\n*Dynamic Living Agreement Schedule automatically injected via SignFlow Smart Contract Engine.*`
    });
  }

  return {
    injectedPages,
    activeRulesCount,
    cascadedFields,
    dynamicScheduleTitles
  };
}

