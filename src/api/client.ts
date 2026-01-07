import fetch, { Response } from "node-fetch";
import { createErrorFromResponse } from "./errors.js";
import type {
  CodaDoc,
  CodaPage,
  CodaTable,
  CodaColumn,
  CodaRow,
  CodaListResponse,
  CodaMutationResponse,
  CodaWhoAmI,
} from "./types.js";

/**
 * Rate limiter for API requests
 */
class RateLimiter {
  private readQueue: number[] = [];
  private writeQueue: number[] = [];

  private readonly READ_LIMIT = 100; // requests per window
  private readonly WRITE_LIMIT = 10; // requests per window
  private readonly WINDOW_MS = 6000; // 6 seconds

  private cleanQueue(queue: number[]): void {
    const cutoff = Date.now() - this.WINDOW_MS;
    while (queue.length > 0 && queue[0]! < cutoff) {
      queue.shift();
    }
  }

  async waitForSlot(isWrite: boolean = false): Promise<void> {
    const queue = isWrite ? this.writeQueue : this.readQueue;
    const limit = isWrite ? this.WRITE_LIMIT : this.READ_LIMIT;

    while (true) {
      this.cleanQueue(queue);

      if (queue.length < limit) {
        queue.push(Date.now());
        return;
      }

      // Wait 100ms before checking again
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
}

/**
 * Coda API HTTP client
 */
export class CodaClient {
  private baseUrl: string;
  private apiToken: string;
  private rateLimiter: RateLimiter;

  constructor(apiToken: string, baseUrl: string = "https://coda.io/apis/v1") {
    this.apiToken = apiToken;
    this.baseUrl = baseUrl;
    this.rateLimiter = new RateLimiter();
  }

  /**
   * Make HTTP request to Coda API
   */
  private async request<T>(
    method: string,
    endpoint: string,
    body?: any,
    params?: Record<string, any>
  ): Promise<T> {
    const isWrite = method !== "GET";
    await this.rateLimiter.waitForSlot(isWrite);

    const url = new URL(`${this.baseUrl}${endpoint}`);

    // Add query parameters
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiToken}`,
      "Content-Type": "application/json",
    };

    const options: any = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    let response: Response;

    try {
      response = await fetch(url.toString(), options);
    } catch (error: any) {
      throw new Error(`Network error: ${error.message}`);
    }

    // Handle successful responses
    if (response.ok) {
      // 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      // 202 Accepted (async operations)
      if (response.status === 202) {
        const requestId = response.headers.get("X-Request-Id");
        return { requestId } as T;
      }

      const data = await response.json();
      return data as T;
    }

    // Handle errors
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorData = (await response.json()) as any;
      if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // Use default error message if can't parse JSON
    }

    throw createErrorFromResponse(response.status, errorMessage, response);
  }

  // ========== Utility Methods ==========

  /**
   * Test API connection and get current user info
   */
  async whoami(): Promise<CodaWhoAmI> {
    return this.request<CodaWhoAmI>("GET", "/whoami");
  }

  // ========== Document Operations ==========

  async listDocs(params?: {
    isOwner?: boolean;
    query?: string;
    sourceDoc?: string;
    limit?: number;
  }): Promise<CodaListResponse<CodaDoc>> {
    return this.request<CodaListResponse<CodaDoc>>(
      "GET",
      "/docs",
      undefined,
      params
    );
  }

  async getDoc(docId: string): Promise<CodaDoc> {
    return this.request<CodaDoc>("GET", `/docs/${docId}`);
  }

  async createDoc(params: {
    title: string;
    sourceDoc?: string;
    timezone?: string;
    folderId?: string;
  }): Promise<CodaDoc> {
    return this.request<CodaDoc>("POST", "/docs", params);
  }

  async deleteDoc(docId: string): Promise<void> {
    return this.request<void>("DELETE", `/docs/${docId}`);
  }

  // ========== Page Operations ==========

  async listPages(
    docId: string,
    params?: { limit?: number }
  ): Promise<CodaListResponse<CodaPage>> {
    return this.request<CodaListResponse<CodaPage>>(
      "GET",
      `/docs/${docId}/pages`,
      undefined,
      params
    );
  }

  async getPage(docId: string, pageIdOrName: string): Promise<CodaPage> {
    return this.request<CodaPage>(
      "GET",
      `/docs/${docId}/pages/${pageIdOrName}`
    );
  }

  async createPage(
    docId: string,
    params: {
      name: string;
      subtitle?: string;
      iconName?: string;
      imageUrl?: string;
      parentPageIdOrName?: string;
      pageContent?: {
        type?: "canvas";
        canvasContent: {
          format: "html" | "markdown";
          content: string;
        };
      };
    }
  ): Promise<CodaPage> {
    return this.request<CodaPage>("POST", `/docs/${docId}/pages`, params);
  }

  async updatePage(
    docId: string,
    pageIdOrName: string,
    params: {
      name?: string;
      subtitle?: string;
      iconName?: string;
      imageUrl?: string;
      isHidden?: boolean;
      contentUpdate?: {
        insertionMode?: "append" | "prepend" | "replace";
        elementId?: string;
        canvasContent: {
          format: "html" | "markdown";
          content: string;
        };
      };
    }
  ): Promise<CodaPage> {
    return this.request<CodaPage>(
      "PUT",
      `/docs/${docId}/pages/${pageIdOrName}`,
      params
    );
  }

  async deletePage(docId: string, pageIdOrName: string): Promise<void> {
    return this.request<void>("DELETE", `/docs/${docId}/pages/${pageIdOrName}`);
  }

  async getPageContent(
    docId: string,
    pageIdOrName: string,
    params?: {
      limit?: number;
      contentFormat?: "plainText";
    }
  ): Promise<CodaListResponse<any>> {
    return this.request<CodaListResponse<any>>(
      "GET",
      `/docs/${docId}/pages/${pageIdOrName}/content`,
      undefined,
      params
    );
  }

  async deletePageContent(
    docId: string,
    pageIdOrName: string,
    body?: {
      elementIds?: string[];
    }
  ): Promise<void> {
    return this.request<void>(
      "DELETE",
      `/docs/${docId}/pages/${pageIdOrName}/content`,
      body
    );
  }

  // ========== Table Operations ==========

  async listTables(
    docId: string,
    params?: {
      tableTypes?: string[];
      limit?: number;
    }
  ): Promise<CodaListResponse<CodaTable>> {
    return this.request<CodaListResponse<CodaTable>>(
      "GET",
      `/docs/${docId}/tables`,
      undefined,
      params
    );
  }

  async getTable(docId: string, tableIdOrName: string): Promise<CodaTable> {
    return this.request<CodaTable>(
      "GET",
      `/docs/${docId}/tables/${tableIdOrName}`
    );
  }

  // Note: Table creation via API is limited - requires page context
  async createTable(
    docId: string,
    params: {
      name: string;
      columns: { name: string; type?: string }[];
    }
  ): Promise<CodaTable> {
    return this.request<CodaTable>("POST", `/docs/${docId}/tables`, params);
  }

  // ========== Column Operations ==========

  async listColumns(
    docId: string,
    tableIdOrName: string,
    params?: {
      limit?: number;
    }
  ): Promise<CodaListResponse<CodaColumn>> {
    return this.request<CodaListResponse<CodaColumn>>(
      "GET",
      `/docs/${docId}/tables/${tableIdOrName}/columns`,
      undefined,
      params
    );
  }

  async getColumn(
    docId: string,
    tableIdOrName: string,
    columnIdOrName: string
  ): Promise<CodaColumn> {
    return this.request<CodaColumn>(
      "GET",
      `/docs/${docId}/tables/${tableIdOrName}/columns/${columnIdOrName}`
    );
  }

  // ========== Row Operations ==========

  async listRows(
    docId: string,
    tableIdOrName: string,
    params?: {
      query?: string;
      limit?: number;
      pageToken?: string;
      useColumnNames?: boolean;
      valueFormat?: "simple" | "simpleWithArrays" | "rich";
      visibleOnly?: boolean;
    }
  ): Promise<CodaListResponse<CodaRow>> {
    return this.request<CodaListResponse<CodaRow>>(
      "GET",
      `/docs/${docId}/tables/${tableIdOrName}/rows`,
      undefined,
      params
    );
  }

  async getRow(
    docId: string,
    tableIdOrName: string,
    rowIdOrName: string,
    params?: {
      useColumnNames?: boolean;
      valueFormat?: "simple" | "simpleWithArrays" | "rich";
    }
  ): Promise<CodaRow> {
    return this.request<CodaRow>(
      "GET",
      `/docs/${docId}/tables/${tableIdOrName}/rows/${rowIdOrName}`,
      undefined,
      params
    );
  }

  async insertRows(
    docId: string,
    tableIdOrName: string,
    params: {
      rows: { cells: { column: string; value: any }[] }[];
      keyColumns?: string[];
      disableParsing?: boolean;
    }
  ): Promise<CodaMutationResponse> {
    return this.request<CodaMutationResponse>(
      "POST",
      `/docs/${docId}/tables/${tableIdOrName}/rows`,
      params
    );
  }

  async upsertRows(
    docId: string,
    tableIdOrName: string,
    params: {
      rows: { cells: { column: string; value: any }[] }[];
      keyColumns: string[];
      disableParsing?: boolean;
    }
  ): Promise<CodaMutationResponse> {
    return this.request<CodaMutationResponse>(
      "POST",
      `/docs/${docId}/tables/${tableIdOrName}/rows`,
      params
    );
  }

  async updateRow(
    docId: string,
    tableIdOrName: string,
    rowIdOrName: string,
    params: {
      row: { cells: { column: string; value: any }[] };
      disableParsing?: boolean;
    }
  ): Promise<CodaMutationResponse> {
    return this.request<CodaMutationResponse>(
      "PUT",
      `/docs/${docId}/tables/${tableIdOrName}/rows/${rowIdOrName}`,
      params
    );
  }

  async deleteRow(
    docId: string,
    tableIdOrName: string,
    rowIdOrName: string
  ): Promise<CodaMutationResponse> {
    return this.request<CodaMutationResponse>(
      "DELETE",
      `/docs/${docId}/tables/${tableIdOrName}/rows/${rowIdOrName}`
    );
  }

  async deleteRows(
    docId: string,
    tableIdOrName: string,
    params: {
      rowIds: string[];
    }
  ): Promise<CodaMutationResponse> {
    return this.request<CodaMutationResponse>(
      "DELETE",
      `/docs/${docId}/tables/${tableIdOrName}/rows`,
      params
    );
  }
}
