# Coda MCP Server

A Model Context Protocol (MCP) server for integrating with the Coda API. This server provides comprehensive read/write operations for managing Coda documents, pages, tables, rows, and columns.

## Features

- **23 MCP Tools** for complete Coda API coverage
- Document management (list, get, create, delete)
- Page operations (full CRUD with content management)
- Table operations (list, get, create)
- Column operations (list, get)
- Row operations (list, get, insert, upsert, update, delete)
- Built-in rate limiting (100 read/6s, 10 write/6s)
- Async operation handling
- TypeScript with full type safety
- Zod schema validation

## Prerequisites

- Node.js 18 or higher
- A Coda account with API access
- Coda API token (get yours at https://coda.io/account)

## Installation

1. Clone or download this repository:
```bash
cd coda-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Build the TypeScript code:
```bash
npm run build
```

## Configuration

### Get Your Coda API Token

1. Go to https://coda.io/account
2. Navigate to the "API Settings" section
3. Generate a new API token
4. Copy the token (you'll need it for configuration)

### Environment Variables

Create a `.env` file in the project root (or set environment variables directly):

```env
CODA_API_TOKEN=your_api_token_here
```

Optional:
```env
CODA_API_BASE_URL=https://coda.io/apis/v1  # Default value
LOG_LEVEL=info  # Options: error, warn, info, debug
```

## Usage

### With Claude Desktop

Add the following configuration to your Claude Desktop MCP settings file:

**macOS/Linux**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "coda": {
      "command": "node",
      "args": ["C:/Users/madee/Code/Hubmation/MCP/coda-mcp/dist/index.js"],
      "env": {
        "CODA_API_TOKEN": "your_api_token_here"
      }
    }
  }
}
```

Replace the path with the absolute path to your `dist/index.js` file.

### With MCP Inspector (for testing)

```bash
npm run inspector
```

This will open the MCP Inspector where you can test all tools interactively.

### Direct Usage

```bash
npm run dev
```

## Available Tools

### Document Tools (4)

1. **coda_list_docs** - List all accessible Coda documents
   - Parameters: `isOwner?`, `query?`, `limit?`

2. **coda_get_doc** - Get details of a specific document
   - Parameters: `docId`

3. **coda_create_doc** - Create a new document
   - Parameters: `title`, `sourceDoc?`, `timezone?`, `folderId?`

4. **coda_delete_doc** - Delete a document
   - Parameters: `docId`

### Page Tools (7)

5. **coda_list_pages** - List pages in a document
   - Parameters: `docId`, `limit?`

6. **coda_get_page** - Get page details
   - Parameters: `docId`, `pageIdOrName`

7. **coda_create_page** - Create a new page with optional initial content
   - Parameters: `docId`, `name`, `subtitle?`, `iconName?`, `imageUrl?`, `parentPageIdOrName?`, `pageContent?`
   - `pageContent` supports HTML/Markdown with structure: `{ canvasContent: { format: "html"|"markdown", content: "..." } }`

8. **coda_update_page** - Update page metadata and/or content
   - Parameters: `docId`, `pageIdOrName`, `name?`, `subtitle?`, `iconName?`, `imageUrl?`, `isHidden?`, `contentUpdate?`
   - `contentUpdate` supports append/prepend/replace modes: `{ insertionMode: "append"|"prepend"|"replace", elementId?: "...", canvasContent: { format: "html"|"markdown", content: "..." } }`

9. **coda_delete_page** - Delete a page
   - Parameters: `docId`, `pageIdOrName`

10. **coda_export_page_content** - Export page content (async operation)
    - Parameters: `docId`, `pageIdOrName`, `outputFormat?` (html/markdown)
    - Returns a `requestId` to check status and retrieve exported content

11. **coda_delete_page_content** - Delete all content from a page
    - Parameters: `docId`, `pageIdOrName`

### Table Tools (3)

12. **coda_list_tables** - List tables in a document
    - Parameters: `docId`, `tableTypes?`, `limit?`

13. **coda_get_table** - Get table details
    - Parameters: `docId`, `tableIdOrName`

14. **coda_create_table** - Create a new table
    - Parameters: `docId`, `name`, `columns`

### Column Tools (2)

15. **coda_list_columns** - List columns in a table
    - Parameters: `docId`, `tableIdOrName`, `limit?`

16. **coda_get_column** - Get column details
    - Parameters: `docId`, `tableIdOrName`, `columnIdOrName`

### Row Tools (7)

17. **coda_list_rows** - List rows with filtering and pagination
    - Parameters: `docId`, `tableIdOrName`, `query?`, `limit?`, `pageToken?`, `useColumnNames?`, `valueFormat?`

18. **coda_get_row** - Get a specific row
    - Parameters: `docId`, `tableIdOrName`, `rowIdOrName`, `useColumnNames?`, `valueFormat?`

19. **coda_insert_rows** - Insert new rows
    - Parameters: `docId`, `tableIdOrName`, `rows`, `disableParsing?`

20. **coda_upsert_rows** - Insert or update rows by key
    - Parameters: `docId`, `tableIdOrName`, `rows`, `keyColumns`, `disableParsing?`

21. **coda_update_row** - Update an existing row
    - Parameters: `docId`, `tableIdOrName`, `rowIdOrName`, `cells`, `disableParsing?`

22. **coda_delete_row** - Delete a single row
    - Parameters: `docId`, `tableIdOrName`, `rowIdOrName`

23. **coda_delete_rows** - Delete multiple rows
    - Parameters: `docId`, `tableIdOrName`, `rowIds`

## Examples

### List All Documents
```json
{
  "name": "coda_list_docs",
  "arguments": {
    "limit": 10
  }
}
```

### Insert Rows into a Table
```json
{
  "name": "coda_insert_rows",
  "arguments": {
    "docId": "abc123",
    "tableIdOrName": "MyTable",
    "rows": [
      {
        "cells": [
          { "column": "Name", "value": "John Doe" },
          { "column": "Email", "value": "john@example.com" }
        ]
      }
    ]
  }
}
```

### Upsert Rows (Insert or Update)
```json
{
  "name": "coda_upsert_rows",
  "arguments": {
    "docId": "abc123",
    "tableIdOrName": "Users",
    "keyColumns": ["Email"],
    "rows": [
      {
        "cells": [
          { "column": "Email", "value": "john@example.com" },
          { "column": "Name", "value": "John Smith" },
          { "column": "Status", "value": "Active" }
        ]
      }
    ]
  }
}
```

### Create Page with Content
```json
{
  "name": "coda_create_page",
  "arguments": {
    "docId": "abc123",
    "name": "New Page",
    "subtitle": "A page with initial content",
    "pageContent": {
      "canvasContent": {
        "format": "markdown",
        "content": "# Welcome\n\nThis is the initial page content."
      }
    }
  }
}
```

### Update Page Content (Append Mode)
```json
{
  "name": "coda_update_page",
  "arguments": {
    "docId": "abc123",
    "pageIdOrName": "Overview",
    "contentUpdate": {
      "insertionMode": "append",
      "canvasContent": {
        "format": "markdown",
        "content": "\n\n## New Section\n\nAppended content here."
      }
    }
  }
}
```

### Update Page Content (Prepend Mode)
```json
{
  "name": "coda_update_page",
  "arguments": {
    "docId": "abc123",
    "pageIdOrName": "Overview",
    "contentUpdate": {
      "insertionMode": "prepend",
      "canvasContent": {
        "format": "markdown",
        "content": "# Table of Contents\n\nThis is prepended to the beginning.\n\n"
      }
    }
  }
}
```

### Update Page Content with Element ID
```json
{
  "name": "coda_update_page",
  "arguments": {
    "docId": "abc123",
    "pageIdOrName": "Overview",
    "contentUpdate": {
      "insertionMode": "append",
      "elementId": "cl-lzqh0Q0poT",
      "canvasContent": {
        "format": "html",
        "content": "<p><b>This</b> is rich text</p>"
      }
    }
  }
}
```

### Export Page Content
```json
{
  "name": "coda_export_page_content",
  "arguments": {
    "docId": "abc123",
    "pageIdOrName": "Overview",
    "outputFormat": "markdown"
  }
}
```

### Delete Page Content
```json
{
  "name": "coda_delete_page_content",
  "arguments": {
    "docId": "abc123",
    "pageIdOrName": "Overview"
  }
}
```

## Important Notes

### Rate Limits
The Coda API has the following rate limits:
- Read operations: 100 requests per 6 seconds
- Write operations: 10 requests per 6 seconds

This server implements automatic rate limiting to stay within these bounds.

### Asynchronous Operations
Many write operations (insert, update, delete rows) are asynchronous and return immediately with a `requestId`. The actual operation is processed by Coda within seconds.

### Upsert Behavior
When using `coda_upsert_rows`, if multiple rows match the key columns, **ALL matching rows will be updated**. Ensure your key columns uniquely identify rows to avoid unintended updates.

### Base Tables vs Views
Row insert/upsert operations only work with base tables, not views. Attempting to insert into a view will result in an error.

## Development

### Build
```bash
npm run build
```

### Watch Mode
```bash
npm run watch
```

### Test with Inspector
```bash
npm run inspector
```

## Project Structure

```
coda-mcp/
├── src/
│   ├── index.ts              # Entry point
│   ├── server.ts             # MCP server setup
│   ├── api/
│   │   ├── client.ts         # Coda API HTTP client
│   │   ├── types.ts          # TypeScript interfaces
│   │   └── errors.ts         # Error handling
│   ├── tools/
│   │   ├── docs.ts           # Document tools
│   │   ├── pages.ts          # Page tools
│   │   ├── tables.ts         # Table tools
│   │   ├── columns.ts        # Column tools
│   │   └── rows.ts           # Row tools
│   ├── schemas/
│   │   └── *.ts              # Zod validation schemas
│   └── utils/
│       └── logger.ts         # Logging utility
├── dist/                      # Compiled JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

## Troubleshooting

### "CODA_API_TOKEN environment variable is required"
Make sure you've set the `CODA_API_TOKEN` environment variable either in your `.env` file or in your MCP configuration.

### "Invalid or expired API token"
Your API token may be invalid or expired. Generate a new one at https://coda.io/account

### "Rate limit exceeded"
You're making too many requests. The server has built-in rate limiting, but if you're using multiple clients, you may exceed the limits. Wait a few seconds and try again.

### "Permission denied"
Your API token doesn't have permission to perform this operation. Check your Coda account permissions and ensure your token has the necessary scopes.

## API Reference

For complete Coda API documentation, visit: https://coda.io/developers/apis/v1

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Support

For issues related to:
- This MCP server: Open an issue in this repository
- Coda API: Visit https://coda.io/developers
- MCP protocol: Visit https://modelcontextprotocol.io
