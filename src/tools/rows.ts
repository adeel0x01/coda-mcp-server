import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CodaClient } from '../api/client.js';
import {
  ListRowsSchema,
  GetRowSchema,
  InsertRowsSchema,
  UpsertRowsSchema,
  UpdateRowSchema,
  DeleteRowSchema,
  DeleteRowsSchema,
} from '../schemas/rows.js';
import { logger } from '../utils/logger.js';

export function createRowTools(client: CodaClient) {
  return {
    list_rows: {
      handler: async (args: any) => {
        try {
          const params = ListRowsSchema.parse(args);
          logger.debug('Listing rows', params);
          const { docId, tableIdOrName, ...listParams } = params;
          const result = await client.listRows(docId, tableIdOrName, listParams);
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            }],
          };
        } catch (error: any) {
          logger.error('Error listing rows', { error: error.message });
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
        name: 'coda_list_rows',
        description: 'List rows in a Coda table with optional filtering and pagination.',
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
            query: {
              type: 'string',
              description: 'Filter query to narrow results',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of rows to return (default: 25, max: 500)',
              default: 25,
            },
            pageToken: {
              type: 'string',
              description: 'Pagination token from previous response',
            },
            useColumnNames: {
              type: 'boolean',
              description: 'Use column names instead of IDs in response',
            },
            valueFormat: {
              type: 'string',
              enum: ['simple', 'simpleWithArrays', 'rich'],
              description: 'Format for cell values',
            },
            visibleOnly: {
              type: 'boolean',
              description: 'Only return visible rows',
            },
          },
          required: ['docId', 'tableIdOrName'],
        },
      } as Tool,
    },

    get_row: {
      handler: async (args: any) => {
        try {
          const params = GetRowSchema.parse(args);
          logger.debug('Getting row', params);
          const { docId, tableIdOrName, rowIdOrName, ...getParams } = params;
          const result = await client.getRow(docId, tableIdOrName, rowIdOrName, getParams);
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            }],
          };
        } catch (error: any) {
          logger.error('Error getting row', { error: error.message });
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
        name: 'coda_get_row',
        description: 'Get a specific row from a Coda table by ID or name.',
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
            rowIdOrName: {
              type: 'string',
              description: 'Row ID or name',
            },
            useColumnNames: {
              type: 'boolean',
              description: 'Use column names instead of IDs in response',
            },
            valueFormat: {
              type: 'string',
              enum: ['simple', 'simpleWithArrays', 'rich'],
              description: 'Format for cell values',
            },
          },
          required: ['docId', 'tableIdOrName', 'rowIdOrName'],
        },
      } as Tool,
    },

    insert_rows: {
      handler: async (args: any) => {
        try {
          const params = InsertRowsSchema.parse(args);
          logger.debug('Inserting rows', params);
          const { docId, tableIdOrName, rows, disableParsing } = params;
          const result = await client.insertRows(docId, tableIdOrName, {
            rows: rows as any,
            disableParsing,
          });
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify(result, null, 2) + '\n\nNote: This operation is asynchronous and will be processed within seconds.',
            }],
          };
        } catch (error: any) {
          logger.error('Error inserting rows', { error: error.message });
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
        name: 'coda_insert_rows',
        description: 'Insert new rows into a Coda table. Only works with base tables, not views. Returns a request ID as the operation is asynchronous.',
        inputSchema: {
          type: 'object',
          properties: {
            docId: {
              type: 'string',
              description: 'Document ID',
            },
            tableIdOrName: {
              type: 'string',
              description: 'Table ID or name (must be a base table, not a view)',
            },
            rows: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  cells: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        column: { type: 'string', description: 'Column ID or name' },
                        value: { description: 'Cell value' },
                      },
                      required: ['column', 'value'],
                    },
                  },
                },
                required: ['cells'],
              },
              description: 'Array of rows to insert',
            },
            disableParsing: {
              type: 'boolean',
              description: 'Disable automatic parsing of cell values',
            },
          },
          required: ['docId', 'tableIdOrName', 'rows'],
        },
      } as Tool,
    },

    upsert_rows: {
      handler: async (args: any) => {
        try {
          const params = UpsertRowsSchema.parse(args);
          logger.debug('Upserting rows', params);
          const { docId, tableIdOrName, rows, keyColumns, disableParsing } = params;
          const result = await client.upsertRows(docId, tableIdOrName, {
            rows: rows as any,
            keyColumns,
            disableParsing,
          });
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify(result, null, 2) + '\n\nNote: This operation is asynchronous. If multiple rows match the key columns, ALL will be updated.',
            }],
          };
        } catch (error: any) {
          logger.error('Error upserting rows', { error: error.message });
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
        name: 'coda_upsert_rows',
        description: 'Insert or update rows in a Coda table based on key columns. If rows with matching key column values exist, they will be updated; otherwise new rows are inserted. WARNING: If multiple rows match, ALL will be updated.',
        inputSchema: {
          type: 'object',
          properties: {
            docId: {
              type: 'string',
              description: 'Document ID',
            },
            tableIdOrName: {
              type: 'string',
              description: 'Table ID or name (must be a base table, not a view)',
            },
            rows: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  cells: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        column: { type: 'string', description: 'Column ID or name' },
                        value: { description: 'Cell value' },
                      },
                      required: ['column', 'value'],
                    },
                  },
                },
                required: ['cells'],
              },
              description: 'Array of rows to insert or update',
            },
            keyColumns: {
              type: 'array',
              items: { type: 'string' },
              description: 'Column IDs or names to use as keys for matching existing rows',
            },
            disableParsing: {
              type: 'boolean',
              description: 'Disable automatic parsing of cell values',
            },
          },
          required: ['docId', 'tableIdOrName', 'rows', 'keyColumns'],
        },
      } as Tool,
    },

    update_row: {
      handler: async (args: any) => {
        try {
          const params = UpdateRowSchema.parse(args);
          logger.debug('Updating row', params);
          const { docId, tableIdOrName, rowIdOrName, cells, disableParsing } = params;
          const result = await client.updateRow(docId, tableIdOrName, rowIdOrName, {
            row: { cells: cells as any },
            disableParsing,
          });
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify(result, null, 2) + '\n\nNote: This operation is asynchronous and will be processed within seconds.',
            }],
          };
        } catch (error: any) {
          logger.error('Error updating row', { error: error.message });
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
        name: 'coda_update_row',
        description: 'Update an existing row in a Coda table. Returns a request ID as the operation is asynchronous.',
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
            rowIdOrName: {
              type: 'string',
              description: 'Row ID or name to update',
            },
            cells: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  column: { type: 'string', description: 'Column ID or name' },
                  value: { description: 'New cell value' },
                },
                required: ['column', 'value'],
              },
              description: 'Array of cells to update',
            },
            disableParsing: {
              type: 'boolean',
              description: 'Disable automatic parsing of cell values',
            },
          },
          required: ['docId', 'tableIdOrName', 'rowIdOrName', 'cells'],
        },
      } as Tool,
    },

    delete_row: {
      handler: async (args: any) => {
        try {
          const params = DeleteRowSchema.parse(args);
          logger.debug('Deleting row', params);
          const result = await client.deleteRow(params.docId, params.tableIdOrName, params.rowIdOrName);
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify(result, null, 2) + '\n\nNote: This operation is asynchronous and will be processed within seconds.',
            }],
          };
        } catch (error: any) {
          logger.error('Error deleting row', { error: error.message });
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
        name: 'coda_delete_row',
        description: 'Delete a single row from a Coda table. Returns a request ID as the operation is asynchronous.',
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
            rowIdOrName: {
              type: 'string',
              description: 'Row ID or name to delete',
            },
          },
          required: ['docId', 'tableIdOrName', 'rowIdOrName'],
        },
      } as Tool,
    },

    delete_rows: {
      handler: async (args: any) => {
        try {
          const params = DeleteRowsSchema.parse(args);
          logger.debug('Deleting multiple rows', params);
          const { docId, tableIdOrName, rowIds } = params;
          const result = await client.deleteRows(docId, tableIdOrName, { rowIds });
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify(result, null, 2) + '\n\nNote: This operation is asynchronous and will be processed within seconds.',
            }],
          };
        } catch (error: any) {
          logger.error('Error deleting rows', { error: error.message });
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
        name: 'coda_delete_rows',
        description: 'Delete multiple rows from a Coda table by their IDs. Returns a request ID as the operation is asynchronous.',
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
            rowIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of row IDs to delete',
            },
          },
          required: ['docId', 'tableIdOrName', 'rowIds'],
        },
      } as Tool,
    },
  };
}
