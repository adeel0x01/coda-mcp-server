import { z } from "zod";

// Canvas content schema for page content
const CanvasContentSchema = z.object({
  format: z.enum(["html", "markdown"]).describe("Content format"),
  content: z.string().describe("The actual content in HTML or Markdown"),
});

const PageContentSchema = z.object({
  type: z
    .literal("canvas")
    .default("canvas")
    .optional()
    .describe('Content type (always "canvas")'),
  canvasContent: CanvasContentSchema.describe("Canvas content object"),
});

const ContentUpdateSchema = z.object({
  insertionMode: z
    .enum(["append", "prepend", "replace"])
    .optional()
    .describe("How to insert content: append, prepend, or replace"),
  elementId: z
    .string()
    .optional()
    .describe("Canvas element ID where content should be inserted"),
  canvasContent: CanvasContentSchema.describe("Canvas content to insert"),
});

export const ListPagesSchema = z.object({
  docId: z.string().min(1).describe("Document ID"),
  limit: z
    .number()
    .min(1)
    .max(100)
    .optional()
    .describe("Maximum number of pages to return"),
});

export const GetPageSchema = z.object({
  docId: z.string().min(1).describe("Document ID"),
  pageIdOrName: z.string().min(1).describe("Page ID or name"),
});

export const CreatePageSchema = z.object({
  docId: z.string().min(1).describe("Document ID"),
  name: z.string().min(1).describe("Page name"),
  subtitle: z.string().optional().describe("Page subtitle"),
  iconName: z.string().optional().describe("Icon name for the page"),
  imageUrl: z.string().optional().describe("Header image URL"),
  parentPageIdOrName: z
    .string()
    .optional()
    .describe("Parent page ID or name for creating subpages"),
  pageContent: PageContentSchema.optional().describe("Initial page content"),
});

export const UpdatePageSchema = z.object({
  docId: z.string().min(1).describe("Document ID"),
  pageIdOrName: z.string().min(1).describe("Page ID or name to update"),
  name: z.string().optional().describe("New page name"),
  subtitle: z.string().optional().describe("New page subtitle"),
  iconName: z.string().optional().describe("New icon name"),
  imageUrl: z.string().optional().describe("New header image URL"),
  isHidden: z.boolean().optional().describe("Whether the page is hidden"),
  contentUpdate: ContentUpdateSchema.optional().describe(
    "Content to append or replace"
  ),
});

export const DeletePageSchema = z.object({
  docId: z.string().min(1).describe("Document ID"),
  pageIdOrName: z.string().min(1).describe("Page ID or name to delete"),
});

export const GetPageContentSchema = z.object({
  docId: z.string().min(1).describe("Document ID"),
  pageIdOrName: z.string().min(1).describe("Page ID or name"),
  limit: z
    .number()
    .min(1)
    .max(500)
    .optional()
    .describe("Maximum number of content items to return (default: 50)"),
  contentFormat: z
    .enum(["plainText"])
    .optional()
    .describe("The format to return content in (default: plainText)"),
});

export const DeletePageContentSchema = z.object({
  docId: z.string().min(1).describe("Document ID"),
  pageIdOrName: z.string().min(1).describe("Page ID or name"),
  elementIds: z
    .array(z.string())
    .optional()
    .describe(
      "IDs of specific elements to delete. If omitted or empty, all content will be deleted."
    ),
});
