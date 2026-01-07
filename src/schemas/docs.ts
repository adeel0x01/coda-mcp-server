import { z } from 'zod';

export const ListDocsSchema = z.object({
  isOwner: z.boolean().optional().describe('Filter for documents owned by the user'),
  query: z.string().optional().describe('Search query to filter documents'),
  limit: z.number().min(1).max(100).default(25).optional().describe('Maximum number of documents to return'),
});

export const GetDocSchema = z.object({
  docId: z.string().min(1).describe('Document ID or URL'),
});

export const CreateDocSchema = z.object({
  title: z.string().min(1).describe('Title for the new document'),
  sourceDoc: z.string().optional().describe('Optional source document ID to copy from'),
  timezone: z.string().optional().describe('Timezone for the document (e.g., "America/Los_Angeles")'),
  folderId: z.string().optional().describe('Parent folder ID'),
});

export const DeleteDocSchema = z.object({
  docId: z.string().min(1).describe('Document ID to delete'),
});
