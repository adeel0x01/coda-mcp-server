import { z } from 'zod';

const CellSchema = z.object({
  column: z.string().describe('Column ID or name'),
  value: z.any().describe('Cell value'),
});

const RowDataSchema = z.object({
  cells: z.array(CellSchema).describe('Array of cells with column and value'),
});

export const ListRowsSchema = z.object({
  docId: z.string().min(1).describe('Document ID'),
  tableIdOrName: z.string().min(1).describe('Table ID or name'),
  query: z.string().optional().describe('Filter query'),
  limit: z.number().min(1).max(500).default(25).optional().describe('Maximum number of rows to return'),
  pageToken: z.string().optional().describe('Pagination token from previous response'),
  useColumnNames: z.boolean().optional().describe('Use column names instead of IDs in response'),
  valueFormat: z.enum(['simple', 'simpleWithArrays', 'rich']).optional().describe('Format for cell values'),
  visibleOnly: z.boolean().optional().describe('Only return visible rows'),
});

export const GetRowSchema = z.object({
  docId: z.string().min(1).describe('Document ID'),
  tableIdOrName: z.string().min(1).describe('Table ID or name'),
  rowIdOrName: z.string().min(1).describe('Row ID or name'),
  useColumnNames: z.boolean().optional().describe('Use column names instead of IDs in response'),
  valueFormat: z.enum(['simple', 'simpleWithArrays', 'rich']).optional().describe('Format for cell values'),
});

export const InsertRowsSchema = z.object({
  docId: z.string().min(1).describe('Document ID'),
  tableIdOrName: z.string().min(1).describe('Table ID or name (must be base table, not a view)'),
  rows: z.array(RowDataSchema).describe('Array of rows to insert'),
  disableParsing: z.boolean().optional().describe('Disable automatic parsing of cell values'),
});

export const UpsertRowsSchema = z.object({
  docId: z.string().min(1).describe('Document ID'),
  tableIdOrName: z.string().min(1).describe('Table ID or name (must be base table, not a view)'),
  rows: z.array(RowDataSchema).describe('Array of rows to insert or update'),
  keyColumns: z.array(z.string()).min(1).describe('Column IDs/names to match for updates'),
  disableParsing: z.boolean().optional().describe('Disable automatic parsing of cell values'),
});

export const UpdateRowSchema = z.object({
  docId: z.string().min(1).describe('Document ID'),
  tableIdOrName: z.string().min(1).describe('Table ID or name'),
  rowIdOrName: z.string().min(1).describe('Row ID or name to update'),
  cells: z.array(CellSchema).describe('Array of cells to update'),
  disableParsing: z.boolean().optional().describe('Disable automatic parsing of cell values'),
});

export const DeleteRowSchema = z.object({
  docId: z.string().min(1).describe('Document ID'),
  tableIdOrName: z.string().min(1).describe('Table ID or name'),
  rowIdOrName: z.string().min(1).describe('Row ID or name to delete'),
});

export const DeleteRowsSchema = z.object({
  docId: z.string().min(1).describe('Document ID'),
  tableIdOrName: z.string().min(1).describe('Table ID or name'),
  rowIds: z.array(z.string()).min(1).describe('Array of row IDs to delete'),
});
