export type CsvValue = string | number | boolean | Date | null | undefined;

/** RFC 4180 field quoting: wrap when the value contains a quote, comma or newline. */
function csvCell(value: CsvValue): string {
  if (value === null || value === undefined) return '';
  const s = value instanceof Date ? value.toISOString() : String(value);
  return /[",\r\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

/** Serializes a header + rows into an RFC 4180 CSV document (CRLF line endings). */
export function toCsv(header: string[], rows: CsvValue[][]): string {
  return `${[header, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')}\r\n`;
}

/** `example.com-inventory-2026-07-15.csv` style attachment name. */
export function csvFilename(domain: string, kind: string): string {
  return `${domain}-${kind}-${new Date().toISOString().slice(0, 10)}.csv`;
}
