import { DocumentField, ConditionalRule } from '../types/signflow';

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
