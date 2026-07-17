import 'server-only';
import ExcelJS from 'exceljs';

/**
 * Branded, styled XLSX exports (script inventory, change log).
 *
 * Plain CSV opens in Excel as unstyled, overflowing cells — merchants attach
 * these exports to audits, so they must read as a finished document: brand
 * header, sized columns, colored status cells, freeze panes and auto-filter.
 */

const BRAND_BLUE = 'FF1D4ED8'; // blue-700 — matches the app's Sentinel Light accent
const BRAND_BLUE_DARK = 'FF1E3A8A'; // blue-900
const HEADER_GRAY = 'FFF1F5F9'; // slate-100
const ZEBRA_GRAY = 'FFF8FAFC'; // slate-50
const BORDER_GRAY = 'FFCBD5E1'; // slate-300

const STATUS_FILLS: Record<string, { fill: string; font: string }> = {
  authorized: { fill: 'FFDCFCE7', font: 'FF166534' }, // green-100 / green-800
  pending: { fill: 'FFFEF3C7', font: 'FF92400E' }, // amber-100 / amber-800
  blocked: { fill: 'FFFEE2E2', font: 'FF991B1B' }, // red-100 / red-800
  critical: { fill: 'FFFEE2E2', font: 'FF991B1B' },
  warning: { fill: 'FFFEF3C7', font: 'FF92400E' },
  info: { fill: 'FFE0F2FE', font: 'FF075985' }, // sky-100 / sky-800
};

export type XlsxValue = string | number | boolean | Date | null | undefined;

export interface XlsxColumn {
  header: string;
  width: number;
  /** Render cell as a colored status chip (authorized/pending/blocked/critical/...). */
  statusColors?: boolean;
  /** Excel number format, e.g. 'yyyy-mm-dd hh:mm'. */
  numFmt?: string;
  wrap?: boolean;
}

export interface XlsxDocument {
  /** Brand shown in the title block — org name on white-label plans, else "ScriptProof". */
  brand: string;
  title: string;
  subtitle: string;
  sheetName: string;
  columns: XlsxColumn[];
  rows: XlsxValue[][];
}

export async function buildXlsx(doc: XlsxDocument): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = doc.brand;
  wb.created = new Date();

  const ws = wb.addWorksheet(doc.sheetName, {
    views: [{ state: 'frozen', ySplit: 4 }],
  });

  const colCount = doc.columns.length;
  ws.columns = doc.columns.map((c) => ({ width: c.width }));

  // Row 1 — brand banner
  ws.mergeCells(1, 1, 1, colCount);
  const brandCell = ws.getCell(1, 1);
  brandCell.value = doc.brand;
  brandCell.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
  brandCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND_BLUE_DARK } };
  brandCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  ws.getRow(1).height = 30;

  // Row 2 — document title
  ws.mergeCells(2, 1, 2, colCount);
  const titleCell = ws.getCell(2, 1);
  titleCell.value = doc.title;
  titleCell.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND_BLUE } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  ws.getRow(2).height = 22;

  // Row 3 — subtitle (site, period, generation timestamp)
  ws.mergeCells(3, 1, 3, colCount);
  const subCell = ws.getCell(3, 1);
  subCell.value = doc.subtitle;
  subCell.font = { size: 10, color: { argb: 'FF475569' } };
  subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_GRAY } };
  subCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  ws.getRow(3).height = 18;

  // Row 4 — column headers
  const headerRow = ws.getRow(4);
  doc.columns.forEach((col, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = col.header;
    cell.font = { bold: true, size: 10, color: { argb: 'FF0F172A' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_GRAY } };
    cell.border = {
      bottom: { style: 'medium', color: { argb: BRAND_BLUE } },
      right: { style: 'thin', color: { argb: BORDER_GRAY } },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
  });
  headerRow.height = 20;

  // Data rows — zebra striping, borders, status colors, date formats
  doc.rows.forEach((row, r) => {
    const excelRow = ws.getRow(5 + r);
    row.forEach((value, c) => {
      const col = doc.columns[c];
      const cell = excelRow.getCell(c + 1);
      cell.value = value === undefined ? null : value;
      cell.font = { size: 10, color: { argb: 'FF1E293B' } };
      cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: col?.wrap ?? false };
      cell.border = {
        bottom: { style: 'thin', color: { argb: BORDER_GRAY } },
        right: { style: 'thin', color: { argb: BORDER_GRAY } },
      };
      if (r % 2 === 1) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ZEBRA_GRAY } };
      }
      if (col?.numFmt && value instanceof Date) cell.numFmt = col.numFmt;
      if (col?.statusColors && typeof value === 'string') {
        const colors = STATUS_FILLS[value.toLowerCase()];
        if (colors) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.fill } };
          cell.font = { size: 10, bold: true, color: { argb: colors.font } };
        }
      }
    });
  });

  ws.autoFilter = {
    from: { row: 4, column: 1 },
    to: { row: 4 + doc.rows.length, column: colCount },
  };

  return Buffer.from(await wb.xlsx.writeBuffer());
}

/** `example.com-inventory-2026-07-15.xlsx` style attachment name. */
export function xlsxFilename(domain: string, kind: string): string {
  const safe = domain.replace(/[^a-z0-9.-]+/gi, '_');
  return `${safe}-${kind}-${new Date().toISOString().slice(0, 10)}.xlsx`;
}
