/**
 * evaluateFormula(formula, values):
 * - formula: a string that may contain placeholders like {{fieldId}}
 * - values: { [fieldId]: value }
 *
 * We replace each {{id}} with a JS-safe literal (JSON.stringify(value))
 * and then attempt to evaluate the resulting expression.
 *
 * **Important**: This uses runtime evaluation. In a production app you'd want
 * a proper expression parser or sandbox.
 */
export function evaluateFormula(formula: string | undefined, values: Record<string, any>): { ok: boolean; value: any; error?: string } {
  if (!formula) return { ok: true, value: "" };
  try {
    let expr = formula;
    // Replace {{id}} placeholders safely
    expr = expr.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
      const v = values[key];
      // JSON.stringify will quote strings and render numbers as literals
      return typeof v === "undefined" ? "null" : JSON.stringify(v);
    });

    // Basic safety: disallow "while", "for", "eval", "Function" keywords to reduce risk
    if (/(while|for|eval|Function|constructor)/i.test(expr)) {
      return { ok: false, value: "", error: "Unsafe expression" };
    }

    // Evaluate the expression. Allow Math, Date etc to be used from globals.
    // Wrap in parentheses so expressions like 1+2 work. Return null on failure.
    // eslint-disable-next-line no-new-func
    const fn = new Function(`return (${expr})`);
    const result = fn();
    return { ok: true, value: result };
  } catch (err: any) {
    return { ok: false, value: "", error: err?.message || "Eval error" };
  }
}
