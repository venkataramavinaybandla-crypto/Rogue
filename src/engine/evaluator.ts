import { Parser } from 'expr-eval';

// Restricted expr-eval parser with only authorized mathematical functions
const parser = new Parser({
  operators: {
    add: true,
    subtract: true,
    multiply: true,
    divide: true,
    power: true,
    remainder: true,
    comparison: true,
    logical: true,
    conditional: true,
  },
});

parser.functions = {
  min: Math.min,
  max: Math.max,
  log: Math.log,
  sqrt: Math.sqrt,
  pow: Math.pow,
  abs: Math.abs,
  ceil: Math.ceil,
  floor: Math.floor,
  round: Math.round,
};

export function normalizeExpression(expr: string | number): string {
  if (typeof expr === 'number') return String(expr);
  if (!expr || typeof expr !== 'string') return '0';

  return expr
    .replace(/&&/g, ' and ')
    .replace(/\|\|/g, ' or ')
    .replace(/===/g, ' == ')
    .replace(/!==/g, ' != ')
    .trim();
}

/**
 * Safe expression evaluator using restricted expr-eval parser.
 * Never calls eval().
 */
export function safeEvaluate(
  expr: string | number,
  scope: Record<string, number | boolean> = {}
): number | boolean {
  if (typeof expr === 'number') return expr;
  if (!expr || typeof expr !== 'string') return 0;

  const normalized = normalizeExpression(expr);
  if (!normalized) return 0;

  try {
    const parsed = parser.parse(normalized);
    const evalScope: Record<string, any> = { ...scope };

    // Fill missing symbols with 0
    for (const v of parsed.variables()) {
      if (!(v in evalScope)) {
        evalScope[v] = 0;
      }
    }

    const result = parsed.evaluate(evalScope);

    if (typeof result === 'boolean') return result;
    if (typeof result === 'number') return isFinite(result) ? result : 0;
    return 0;
  } catch {
    return 0;
  }
}
