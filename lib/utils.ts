export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Convierte valores de precio en numero soportando formatos ARS (puntos como miles, coma decimal).
export function safeNum(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const str = String(value)
    .replace(/\s+/g, '')
    .replace(/(ARS|\$|\.)/gi, '')
    .replace(/,/g, '.')
    .replace(/[^\d.]/g, '');

  const num = parseFloat(str);
  return Number.isFinite(num) ? num : null;
}

export function cleanText(value?: string | null): string {
  if (!value) return '';
  return value.replace(/\s+/g, ' ').trim();
}

export function parseCsvUrls(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => {
      // Remove BOM and trim
      const cleaned = line.replace(/^\uFEFF/, '').trim();
      // If it's a CSV with commas, take first column, otherwise take the whole line
      const url = cleaned.includes(',') ? cleaned.split(',')[0] : cleaned;
      return cleanText(url);
    })
    .filter((url) => url.startsWith('http://') || url.startsWith('https://'));
}

export function toCsv(rows: Record<string, unknown>[], headers?: string[]): string {
  if (!rows.length) return '';
  const cols = headers || Object.keys(rows[0]);
  const escape = (val: unknown) => {
    const str = val === undefined || val === null ? '' : String(val);
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [cols.join(',')];
  for (const row of rows) {
    lines.push(cols.map((col) => escape((row as Record<string, unknown>)[col])).join(','));
  }
  return lines.join('\n');
}

export function isoNow(): string {
  return new Date().toISOString();
}
