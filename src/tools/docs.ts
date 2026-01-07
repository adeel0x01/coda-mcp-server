import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CodaClient } from '../api/client.js';
import { ListDocsSchema, GetDocSchema, CreateDocSchema, DeleteDocSchema } from '../schemas/docs.js';
import { logger } from '../utils/logger.js';

export function createDocTools(client: CodaClient) {
  return {
    list_docs: {
      handler: async (args: any) => {
        try {
          const params = ListDocsSchema.parse(args);
          logger.debug('Listing docs', params);
          const result = await client.listDocs(params);
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            }],
          };
        } catch (error: any) {
          logger.error('Error listing docs', { error: error.message });
          return {
            content: [{
              type: 'text' as const,
              text: `Error: ${error.message}`,
            }],
            isError: true,
          };
        }
      },
      definition: {
        name: 'coda_list_docs',
        description: 'List all accessible Coda documents. Supports filtering by ownership and search query.',
        inputSchema: {
          type: 'object',
          properties: {
            isOwner: {
              type: 'boolean',
              description: 'Filter for documents owned by the user',
            },
            query: {
              type: 'string',
              description: 'Search query to filter documents',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of documents to return (default: 25, max: 100)',
              default: 25,
            },
          },
        },
      } as Tool,
    },

    get_doc: {
      handler: async (args: any) => {
        try {
          const params = GetDocSchema.parse(args);
          logger.debug('Getting doc', params);
          const result = await client.getDoc(params.docId);
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            }],
          };
        } catch (error: any) {
          logger.error('Error getting doc', { error: error.message });
          return {
            content: [{
              type: 'text' as const,
              text: `Error: ${error.message}`,
            }],
            isError: true,
          };
        }
      },
      definition: {
        name: 'coda_get_doc',
        description: 'Get details of a specific Coda document by ID.',
        inputSchema: {
          type: 'object',
          properties: {
            docId: {
              type: 'string',
              description: 'Document ID or URL',
            },
          },
          required: ['docId'],
        },
      } as Tool,
    },

    create_doc: {
      handler: async (args: any) => {
        try {
          const params = CreateDocSchema.parse(args);
          logger.debug('Creating doc', params);
          const result = await client.createDoc(params);
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            }],
          };
        } catch (error: any) {
          logger.error('Error creating doc', { error: error.message });
          return {
            content: [{
              type: 'text' as const,
              text: `Error: ${error.message}`,
            }],
            isError: true,
          };
        }
      },
      definition: {
        name: 'coda_create_doc',
        description: 'Create a new Coda document. Requires Doc Maker permissions.',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Title for the new document',
            },
            sourceDoc: {
              type: 'string',
              description: 'Optional source document ID to copy from',
            },
            timezone: {
              type: 'string',
              description: 'Timezone for the document (e.g., "America/Los_Angeles")',
            },
            folderId: {
              type: 'string',
              description: 'Parent folder ID',
            },
          },
          required: ['title'],
        },
      } as Tool,
    },

    delete_doc: {
      handler: async (args: any) => {
        try {
          const params = DeleteDocSchema.parse(args);
          logger.debug('Deleting doc', params);
          await client.deleteDoc(params.docId);
          return {
            content: [{
              type: 'text' as const,
              text: `Successfully deleted document ${params.docId}`,
            }],
          };
        } catch (error: any) {
          logger.error('Error deleting doc', { error: error.message });
          return {
            content: [{
              type: 'text' as const,
              text: `Error: ${error.message}`,
            }],
            isError: true,
          };
        }
      },
      definition: {
        name: 'coda_delete_doc',
        description: 'Delete a Coda document (moves to trash).',
        inputSchema: {
          type: 'object',
          properties: {
            docId: {
              type: 'string',
              description: 'Document ID to delete',
            },
          },
          required: ['docId'],
        },
      } as Tool,
    },
  };
}
