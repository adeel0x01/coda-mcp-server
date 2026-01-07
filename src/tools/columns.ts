import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CodaClient } from '../api/client.js';
import { ListColumnsSchema, GetColumnSchema } from '../schemas/columns.js';
import { logger } from '../utils/logger.js';

export function createColumnTools(client: CodaClient) {
  return {
    list_columns: {
      handler: async (args: any) => {
        try {
          const params = ListColumnsSchema.parse(args);
          logger.debug('Listing columns', params);
          const { docId, tableIdOrName, ...listParams } = params;
          const result = await client.listColumns(docId, tableIdOrName, listParams);
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            }],
          };
        } catch (error: any) {
          logger.error('Error listing columns', { error: error.message });
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
        name: 'coda_list_columns',
        description: 'List all columns in a Coda table.',
        inputSchema: {
          type: 'object',
          properties: {
            docId: {
              type: 'string',
              description: 'Document ID',
            },
            tableIdOrName: {
              type: 'string',
              description: 'Table ID or name',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of columns to return',
            },
          },
          required: ['docId', 'tableIdOrName'],
        },
      } as Tool,
    },

    get_column: {
      handler: async (args: any) => {
        try {
          const params = GetColumnSchema.parse(args);
          logger.debug('Getting column', params);
          const result = await client.getColumn(params.docId, params.tableIdOrName, params.columnIdOrName);
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            }],
          };
        } catch (error: any) {
          logger.error('Error getting column', { error: error.message });
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
        name: 'coda_get_column',
        description: 'Get details of a specific column in a Coda table, including formula and format information.',
        inputSchema: {
          type: 'object',
          properties: {
            docId: {
              type: 'string',
              description: 'Document ID',
            },
            tableIdOrName: {
              type: 'string',
              description: 'Table ID or name',
            },
            columnIdOrName: {
              type: 'string',
              description: 'Column ID or name',
            },
          },
          required: ['docId', 'tableIdOrName', 'columnIdOrName'],
        },
      } as Tool,
    },
  };
}
