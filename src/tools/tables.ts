import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CodaClient } from '../api/client.js';
import { ListTablesSchema, GetTableSchema, CreateTableSchema } from '../schemas/tables.js';
import { logger } from '../utils/logger.js';

export function createTableTools(client: CodaClient) {
  return {
    list_tables: {
      handler: async (args: any) => {
        try {
          const params = ListTablesSchema.parse(args);
          logger.debug('Listing tables', params);
          const { docId, ...listParams } = params;
          const result = await client.listTables(docId, listParams);
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            }],
          };
        } catch (error: any) {
          logger.error('Error listing tables', { error: error.message });
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
        name: 'coda_list_tables',
        description: 'List all tables and views in a Coda document.',
        inputSchema: {
          type: 'object',
          properties: {
            docId: {
              type: 'string',
              description: 'Document ID',
            },
            tableTypes: {
              type: 'array',
              items: { type: 'string' },
              description: 'Filter by table types (e.g., ["table", "view"])',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of tables to return',
            },
          },
          required: ['docId'],
        },
      } as Tool,
    },

    get_table: {
      handler: async (args: any) => {
        try {
          const params = GetTableSchema.parse(args);
          logger.debug('Getting table', params);
          const result = await client.getTable(params.docId, params.tableIdOrName);
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            }],
          };
        } catch (error: any) {
          logger.error('Error getting table', { error: error.message });
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
        name: 'coda_get_table',
        description: 'Get details of a specific table in a Coda document.',
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
          },
          required: ['docId', 'tableIdOrName'],
        },
      } as Tool,
    },

    create_table: {
      handler: async (args: any) => {
        try {
          const params = CreateTableSchema.parse(args);
          logger.debug('Creating table', params);
          const { docId, ...createParams } = params;
          const result = await client.createTable(docId, createParams);
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            }],
          };
        } catch (error: any) {
          logger.error('Error creating table', { error: error.message });
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
        name: 'coda_create_table',
        description: 'Create a new table in a Coda document. Note: API support for table creation may be limited.',
        inputSchema: {
          type: 'object',
          properties: {
            docId: {
              type: 'string',
              description: 'Document ID',
            },
            name: {
              type: 'string',
              description: 'Table name',
            },
            columns: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  type: { type: 'string' },
                },
                required: ['name'],
              },
              description: 'Initial columns for the table',
            },
          },
          required: ['docId', 'name', 'columns'],
        },
      } as Tool,
    },
  };
}
