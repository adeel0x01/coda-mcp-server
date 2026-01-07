import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { CodaClient } from "../api/client.js";
import {
  ListPagesSchema,
  GetPageSchema,
  CreatePageSchema,
  UpdatePageSchema,
  DeletePageSchema,
  GetPageContentSchema,
  DeletePageContentSchema,
} from "../schemas/pages.js";
import { logger } from "../utils/logger.js";

export function createPageTools(client: CodaClient) {
  return {
    list_pages: {
      handler: async (args: any) => {
        try {
          const params = ListPagesSchema.parse(args);
          logger.debug("Listing pages", params);
          const result = await client.listPages(params.docId, {
            limit: params.limit,
          });
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        } catch (error: any) {
          logger.error("Error listing pages", { error: error.message });
          return {
            content: [
              {
                type: "text" as const,
                text: `Error: ${error.message}`,
              },
            ],
            isError: true,
          };
        }
      },
      definition: {
        name: "coda_list_pages",
        description: "List all pages in a Coda document.",
        inputSchema: {
          type: "object",
          properties: {
            docId: {
              type: "string",
              description: "Document ID",
            },
            limit: {
              type: "number",
              description: "Maximum number of pages to return",
            },
          },
          required: ["docId"],
        },
      } as Tool,
    },

    get_page: {
      handler: async (args: any) => {
        try {
          const params = GetPageSchema.parse(args);
          logger.debug("Getting page", params);
          const result = await client.getPage(
            params.docId,
            params.pageIdOrName
          );
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        } catch (error: any) {
          logger.error("Error getting page", { error: error.message });
          return {
            content: [
              {
                type: "text" as const,
                text: `Error: ${error.message}`,
              },
            ],
            isError: true,
          };
        }
      },
      definition: {
        name: "coda_get_page",
        description: "Get details of a specific page in a Coda document.",
        inputSchema: {
          type: "object",
          properties: {
            docId: {
              type: "string",
              description: "Document ID",
            },
            pageIdOrName: {
              type: "string",
              description: "Page ID or name",
            },
          },
          required: ["docId", "pageIdOrName"],
        },
      } as Tool,
    },

    create_page: {
      handler: async (args: any) => {
        try {
          const params = CreatePageSchema.parse(args);
          logger.debug("Creating page", params);
          const { docId, ...createParams } = params;
          const result = await client.createPage(docId, createParams as any);
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        } catch (error: any) {
          logger.error("Error creating page", { error: error.message });
          return {
            content: [
              {
                type: "text" as const,
                text: `Error: ${error.message}`,
              },
            ],
            isError: true,
          };
        }
      },
      definition: {
        name: "coda_create_page",
        description:
          "Create a new page in a Coda document with optional initial content.",
        inputSchema: {
          type: "object",
          properties: {
            docId: {
              type: "string",
              description: "Document ID",
            },
            name: {
              type: "string",
              description: "Page name",
            },
            subtitle: {
              type: "string",
              description: "Page subtitle",
            },
            iconName: {
              type: "string",
              description: "Icon name for the page",
            },
            imageUrl: {
              type: "string",
              description: "Header image URL",
            },
            parentPageIdOrName: {
              type: "string",
              description: "Parent page ID or name for creating subpages",
            },
            pageContent: {
              type: "object",
              description: "Initial page content",
              properties: {
                type: {
                  type: "string",
                  enum: ["canvas"],
                  description: 'Content type (always "canvas")',
                },
                canvasContent: {
                  type: "object",
                  description: "Canvas content",
                  properties: {
                    format: {
                      type: "string",
                      enum: ["html", "markdown"],
                      description: "Content format",
                    },
                    content: {
                      type: "string",
                      description: "The actual content in HTML or Markdown",
                    },
                  },
                  required: ["format", "content"],
                },
              },
              required: ["canvasContent"],
            },
          },
          required: ["docId", "name"],
        },
      } as Tool,
    },

    update_page: {
      handler: async (args: any) => {
        try {
          const params = UpdatePageSchema.parse(args);
          logger.debug("Updating page", params);
          const { docId, pageIdOrName, ...updateParams } = params;
          const result = await client.updatePage(
            docId,
            pageIdOrName,
            updateParams as any
          );
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        } catch (error: any) {
          logger.error("Error updating page", { error: error.message });
          return {
            content: [
              {
                type: "text" as const,
                text: `Error: ${error.message}`,
              },
            ],
            isError: true,
          };
        }
      },
      definition: {
        name: "coda_update_page",
        description:
          "Update an existing page in a Coda document. Can update metadata (name, subtitle, etc.) and/or append/replace content.",
        inputSchema: {
          type: "object",
          properties: {
            docId: {
              type: "string",
              description: "Document ID",
            },
            pageIdOrName: {
              type: "string",
              description: "Page ID or name to update",
            },
            name: {
              type: "string",
              description: "New page name",
            },
            subtitle: {
              type: "string",
              description: "New page subtitle",
            },
            iconName: {
              type: "string",
              description: "New icon name",
            },
            imageUrl: {
              type: "string",
              description: "New header image URL",
            },
            isHidden: {
              type: "boolean",
              description: "Whether the page should be hidden",
            },
            contentUpdate: {
              type: "object",
              description: "Content to append, prepend, or replace",
              properties: {
                insertionMode: {
                  type: "string",
                  enum: ["append", "prepend", "replace"],
                  description:
                    'How to insert content: "append" to add to end, "prepend" to add to beginning, "replace" to replace all',
                },
                elementId: {
                  type: "string",
                  description:
                    "Canvas element ID where content should be inserted (optional)",
                },
                canvasContent: {
                  type: "object",
                  description: "Canvas content to insert",
                  properties: {
                    format: {
                      type: "string",
                      enum: ["html", "markdown"],
                      description: "Content format",
                    },
                    content: {
                      type: "string",
                      description: "The actual content in HTML or Markdown",
                    },
                  },
                  required: ["format", "content"],
                },
              },
              required: ["canvasContent"],
            },
          },
          required: ["docId", "pageIdOrName"],
        },
      } as Tool,
    },

    delete_page: {
      handler: async (args: any) => {
        try {
          const params = DeletePageSchema.parse(args);
          logger.debug("Deleting page", params);
          await client.deletePage(params.docId, params.pageIdOrName);
          return {
            content: [
              {
                type: "text" as const,
                text: `Successfully deleted page ${params.pageIdOrName}`,
              },
            ],
          };
        } catch (error: any) {
          logger.error("Error deleting page", { error: error.message });
          return {
            content: [
              {
                type: "text" as const,
                text: `Error: ${error.message}`,
              },
            ],
            isError: true,
          };
        }
      },
      definition: {
        name: "coda_delete_page",
        description: "Delete a page from a Coda document.",
        inputSchema: {
          type: "object",
          properties: {
            docId: {
              type: "string",
              description: "Document ID",
            },
            pageIdOrName: {
              type: "string",
              description: "Page ID or name to delete",
            },
          },
          required: ["docId", "pageIdOrName"],
        },
      } as Tool,
    },

    get_page_content: {
      handler: async (args: any) => {
        try {
          const params = GetPageContentSchema.parse(args);
          logger.debug("Getting page content", params);
          const { docId, pageIdOrName, ...queryParams } = params;
          const result = await client.getPageContent(
            docId,
            pageIdOrName,
            queryParams
          );
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        } catch (error: any) {
          logger.error("Error getting page content", { error: error.message });
          return {
            content: [
              {
                type: "text" as const,
                text: `Error: ${error.message}`,
              },
            ],
            isError: true,
          };
        }
      },
      definition: {
        name: "coda_get_page_content",
        description:
          "Get a list of content elements from a page. Returns structured content items with their IDs, types, and content.",
        inputSchema: {
          type: "object",
          properties: {
            docId: {
              type: "string",
              description: "Document ID",
            },
            pageIdOrName: {
              type: "string",
              description: "Page ID or name",
            },
            limit: {
              type: "number",
              description:
                "Maximum number of content items to return (1-500, default: 50)",
            },
            contentFormat: {
              type: "string",
              enum: ["plainText"],
              description:
                "The format to return content in (default: plainText)",
            },
          },
          required: ["docId", "pageIdOrName"],
        },
      } as Tool,
    },

    delete_page_content: {
      handler: async (args: any) => {
        try {
          const params = DeletePageContentSchema.parse(args);
          logger.debug("Deleting page content", params);
          const { docId, pageIdOrName, elementIds } = params;
          await client.deletePageContent(
            docId,
            pageIdOrName,
            elementIds ? { elementIds } : undefined
          );
          const message =
            elementIds && elementIds.length > 0
              ? `Successfully deleted ${elementIds.length} element(s) from page ${pageIdOrName}`
              : `Successfully deleted all content from page ${pageIdOrName}`;
          return {
            content: [
              {
                type: "text" as const,
                text: message,
              },
            ],
          };
        } catch (error: any) {
          logger.error("Error deleting page content", { error: error.message });
          return {
            content: [
              {
                type: "text" as const,
                text: `Error: ${error.message}`,
              },
            ],
            isError: true,
          };
        }
      },
      definition: {
        name: "coda_delete_page_content",
        description:
          "Delete content from a page. You can delete specific elements by providing their IDs, or delete all content from the page by omitting elementIds.",
        inputSchema: {
          type: "object",
          properties: {
            docId: {
              type: "string",
              description: "Document ID",
            },
            pageIdOrName: {
              type: "string",
              description: "Page ID or name",
            },
            elementIds: {
              type: "array",
              items: {
                type: "string",
              },
              description:
                "IDs of specific elements to delete. If omitted or empty, all content will be deleted.",
            },
          },
          required: ["docId", "pageIdOrName"],
        },
      } as Tool,
    },
  };
}
