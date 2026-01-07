#!/usr/bin/env node

import { runServer } from './server.js';
import { logger } from './utils/logger.js';

/**
 * Main entry point for the Coda MCP server
 */
async function main() {
  // Get API token from environment
  const apiToken = process.env.CODA_API_TOKEN;

  if (!apiToken) {
    logger.error('CODA_API_TOKEN environment variable is required');
    logger.error('Get your API token from: https://coda.io/account');
    process.exit(1);
  }

  // Optional: Get custom base URL from environment
  const baseUrl = process.env.CODA_API_BASE_URL;

  try {
    // Start the server
    await runServer(apiToken, baseUrl);
  } catch (error: any) {
    logger.error('Failed to start server', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    logger.info('Received SIGINT, shutting down gracefully...');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    logger.info('Received SIGTERM, shutting down gracefully...');
    process.exit(0);
  });
}

main().catch((error) => {
  logger.error('Unhandled error in main', {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});
