import { z } from 'zod';

/**
 * Remove control characters from user input. Null bytes and other control chars can break
 * Postgres text columns or serve no purpose. When `keepBreaks` is true, tab/newline/carriage
 * return are preserved (for multi-line fields).
 */
function stripControl(input: string, keepBreaks: boolean): string {
  let out = '';
  for (const ch of input) {
    const code = ch.codePointAt(0) ?? 0;
    const isControl = code <= 0x1f || code === 0x7f;
    const isAllowedBreak = keepBreaks && (code === 0x09 || code === 0x0a || code === 0x0d);
    if (isControl && !isAllowedBreak) continue;
    out += ch;
  }
  return out;
}

/**
 * Multi-line free text: strips dangerous control chars (incl. null bytes), keeps line breaks,
 * trims, and bounds length. Use for textareas (reflection, gratitude).
 */
export const safeText = (max: number) =>
  z
    .string()
    .max(max)
    .transform((s) => stripControl(s, true).trim());

/**
 * Single-line free text: strips ALL control chars (incl. newlines), collapses whitespace,
 * trims, and bounds length. Pass `min` for required fields (validated after cleaning).
 * Use for titles, names, notes, short fields.
 */
export const safeLine = (max: number, min = 0) =>
  z
    .string()
    .max(max)
    .transform((s) => stripControl(s, false).replace(/\s+/g, ' ').trim())
    .pipe(z.string().min(min).max(max));
