import { z } from 'zod';

export const ListColumnsSchema = z.object({
  docId: z.string().min(1).describe('Document ID'),
  tableIdOrName: z.string().min(1).describe('Table ID or name'),
  limit: z.number().min(1).max(100).optional().describe('Maximum number of columns to return'),
});

export const GetColumnSchema = z.object({
  docId: z.string().min(1).describe('Document ID'),
  tableIdOrName: z.string().min(1).describe('Table ID or name'),
  columnIdOrName: z.string().min(1).describe('Column ID or name'),
});
