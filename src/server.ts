import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { CodaClient } from './api/client.js';
import { createDocTools } from './tools/docs.js';
import { createPageTools } from './tools/pages.js';
import { createTableTools } from './tools/tables.js';
import { createColumnTools } from './tools/columns.js';
import { createRowTools } from './tools/rows.js';
import { logger } from './utils/logger.js';

export function createCodaMCPServer(apiToken: string, baseUrl?: string) {
  // Initialize Coda API client
  const client = new CodaClient(apiToken, baseUrl);

  // Create all tool handlers
  const docTools = createDocTools(client);
  const pageTools = createPageTools(client);
  const tableTools = createTableTools(client);
  const columnTools = createColumnTools(client);
  const rowTools = createRowTools(client);

  // Combine all tools
  const allTools = {
    ...docTools,
    ...pageTools,
    ...tableTools,
    ...columnTools,
    ...rowTools,
  };

  // Create MCP server
  const server = new Server(
    {
      name: 'coda-mcp-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register tool list handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: Object.values(allTools).map((tool) => tool.definition),
    };
  });

  // Register tool call handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const toolName = request.params.name;
    const args = request.params.arguments || {};

    logger.debug(`Tool called: ${toolName}`, args);

    // Find the tool handler
    const tool = Object.values(allTools).find(
      (t) => t.definition.name === toolName
    );

    if (!tool) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Error: Unknown tool: ${toolName}`,
          },
        ],
        isError: true,
      };
    }

    // Execute the tool handler
    try {
      return await tool.handler(args);
    } catch (error: any) {
      logger.error(`Error executing tool ${toolName}`, {
        error: error.message,
        stack: error.stack,
      });
      return {
        content: [
          {
            type: 'text' as const,
            text: `Error: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}

export async function runServer(apiToken: string, baseUrl?: string) {
  logger.info('Starting Coda MCP server...');

  const server = createCodaMCPServer(apiToken, baseUrl);

  // Connect stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  logger.info('Coda MCP server running on stdio');
}
