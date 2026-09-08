/**
 * Format a number as Indian Rupee currency string.
 */
export function formatRupees(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format raw number with Indian comma notation (no ₹ symbol).
 */
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-IN').format(amount);
}

/**
 * Parse spoken words to a number (basic NLP).
 * Handles Indian number system.
 */
export function parseSpokenAmount(text: string): number | null {
  const lower = text.toLowerCase().trim();

  const words: Record<string, number> = {
    zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5,
    six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
    sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
    thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
    hundred: 100, thousand: 1000, lakh: 100000, crore: 10000000,
  };

  // Try direct number parse first
  const stripped = lower.replace(/[^0-9.]/g, '');
  if (stripped && !isNaN(Number(stripped))) return Number(stripped);

  // Word-based parsing
  let result = 0;
  let current = 0;
  const parts = lower.split(/[\s,]+/);
  for (const part of parts) {
    if (part === 'and' || part === 'rupees' || part === 'rupee') continue;
    const val = words[part];
    if (val === undefined) continue;
    if (val === 100) { current = current === 0 ? 100 : current * 100; }
    else if (val >= 1000) { result += (current === 0 ? 1 : current) * val; current = 0; }
    else { current += val; }
  }
  result += current;
  return result > 0 ? result : null;
}
