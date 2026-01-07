import { z } from 'zod';

export const ListTablesSchema = z.object({
  docId: z.string().min(1).describe('Document ID'),
  tableTypes: z.array(z.string()).optional().describe('Filter by table types (e.g., ["table", "view"])'),
  limit: z.number().min(1).max(100).optional().describe('Maximum number of tables to return'),
});

export const GetTableSchema = z.object({
  docId: z.string().min(1).describe('Document ID'),
  tableIdOrName: z.string().min(1).describe('Table ID or name'),
});

export const CreateTableSchema = z.object({
  docId: z.string().min(1).describe('Document ID'),
  name: z.string().min(1).describe('Table name'),
  columns: z.array(z.object({
    name: z.string().describe('Column name'),
    type: z.string().optional().describe('Column type'),
  })).describe('Initial columns for the table'),
});
