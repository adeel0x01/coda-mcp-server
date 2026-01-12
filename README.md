# Coda MCP Server

A Model Context Protocol (MCP) server for integrating with the Coda API. Provides comprehensive read/write operations for managing Coda documents, pages, tables, rows, and columns.

## Features

- **22 MCP Tools** for complete Coda API coverage
- Document, page, table, column, and row operations
- Built-in rate limiting and async operation handling
- Full TypeScript support with Zod validation

## Configuration

### Get Your Coda API Token

1. Go to https://coda.io/account
2. Navigate to "API Settings"
3. Generate a new API token

## Usage

Use with any MCP-compatible client like Claude/Cursor/VS Code. Add the following configuration to your MCP settings:

```json
{
  "mcpServers": {
    "coda": {
      "command": "npx",
      "args": ["-y", "coda-mcp-server"],
      "env": {
        "CODA_API_TOKEN": "your_api_token_here"
      }
    }
  }
}
```

Replace `your_api_token_here` with the token you generated.

## Available Tools

### Documents (4 tools)

- `coda_list_docs` - List all accessible documents
- `coda_get_doc` - Get document details
- `coda_create_doc` - Create a new document
- `coda_delete_doc` - Delete a document

### Pages (7 tools)

- `coda_list_pages` - List pages in a document
- `coda_get_page` - Get page details
- `coda_create_page` - Create a new page with optional content (HTML/Markdown)
- `coda_update_page` - Update page metadata and/or content (append/prepend/replace)
- `coda_delete_page` - Delete a page
- `coda_get_page_content` - Get structured page content elements
- `coda_delete_page_content` - Delete page content (all or specific elements)

### Tables (2 tools)

- `coda_list_tables` - List tables in a document
- `coda_get_table` - Get table details

### Columns (2 tools)

- `coda_list_columns` - List columns in a table
- `coda_get_column` - Get column details

### Rows (7 tools)

- `coda_list_rows` - List rows with filtering and pagination
- `coda_get_row` - Get a specific row
- `coda_insert_rows` - Insert new rows
- `coda_upsert_rows` - Insert or update rows by key columns
- `coda_update_row` - Update an existing row
- `coda_delete_row` - Delete a single row
- `coda_delete_rows` - Delete multiple rows

## Important Notes

### Rate Limits

- Read operations: 100 requests per 6 seconds
- Write operations: 10 requests per 6 seconds

### Async Operations

Many write operations return a `requestId` immediately. The actual operation is processed by Coda within seconds.

### Upsert Behavior

When using `coda_upsert_rows`, if multiple rows match the key columns, **all matching rows will be updated**.

## Development

### Local Setup

1. **Prerequisite**:

   - Node.js v18+
   - npm v9+

2. **Clone the repository**:

```bash
git clone <repo>
cd coda-mcp-server
```

3. **Install dependencies**:

```bash
npm install
```

4. **Build the project**:

```bash
npm run build
```

### Testing

```bash
npm run inspector  # Opens MCP Inspector
```

## API Reference

Full Coda API documentation: https://coda.io/developers/apis/v1

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Support

For issues related to:

- This MCP server: Open an issue in this repository
- Coda API: Visit https://coda.io/developers
- MCP protocol: Visit https://modelcontextprotocol.io
