import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import z from "zod";
import packageJson from "../package.json";
import { getPageContent } from "./helpers";
import {
  getRow,
  listColumns,
  listDocs,
  listPages,
  listRows,
  listTables,
  resolveBrowserLink,
} from "./client/sdk.gen";

export const server = new McpServer({
  name: "coda",
  version: packageJson.version,
});

server.tool(
  "coda_list_documents",
  "List or search available documents",
  {
    query: z.string().optional().describe("The query to search for documents by - optional"),
  },
  async ({ query }): Promise<CallToolResult> => {
    try {
      const resp = await listDocs({ query: { query }, throwOnError: true });

      return { content: [{ type: "text", text: JSON.stringify(resp.data) }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Failed to list documents: ${error}` }], isError: true };
    }
  },
);

server.tool(
  "coda_list_pages",
  "List pages in the current document with pagination",
  {
    docId: z.string().describe("The ID of the document to list pages from"),
    limit: z.number().int().positive().optional().describe("The number of pages to return - optional, defaults to 25"),
    nextPageToken: z
      .string()
      .optional()
      .describe(
        "The token need to get the next page of results, returned from a previous call to this tool - optional",
      ),
  },
  async ({ docId, limit, nextPageToken }): Promise<CallToolResult> => {
    try {
      const listLimit = nextPageToken ? undefined : limit;

      const resp = await listPages({
        path: { docId },
        query: { limit: listLimit, pageToken: nextPageToken ?? undefined },
        throwOnError: true,
      });

      return {
        content: [{ type: "text", text: JSON.stringify(resp.data) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Failed to list pages: ${error}` }],
        isError: true,
      };
    }
  },
);


server.tool(
  "coda_get_page_content",
  "Get the content of a page as markdown",
  {
    docId: z.string().describe("The ID of the document that contains the page to get the content of"),
    pageIdOrName: z.string().describe("The ID or name of the page to get the content of"),
  },
  async ({ docId, pageIdOrName }): Promise<CallToolResult> => {
    try {
      const content = await getPageContent(docId, pageIdOrName);

      if (content === undefined) {
        throw new Error("Unknown error has occurred");
      }

      return { content: [{ type: "text", text: content }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Failed to get page content: ${error}` }], isError: true };
    }
  },
);

server.tool(
  "coda_peek_page",
  "Peek into the beginning of a page and return a limited number of lines",
  {
    docId: z.string().describe("The ID of the document that contains the page to peek into"),
    pageIdOrName: z.string().describe("The ID or name of the page to peek into"),
    numLines: z
      .number()
      .int()
      .positive()
      .describe("The number of lines to return from the start of the page - usually 30 lines is enough"),
  },
  async ({ docId, pageIdOrName, numLines }): Promise<CallToolResult> => {
    try {
      const content = await getPageContent(docId, pageIdOrName);

      if (!content) {
        throw new Error("Unknown error has occurred");
      }

      const preview = content.split(/\r?\n/).slice(0, numLines).join("\n");

      return { content: [{ type: "text", text: preview }] };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Failed to peek page: ${error}` }],
        isError: true,
      };
    }
  },
);


server.tool(
  "coda_resolve_link",
  "Resolve metadata given a browser link to a Coda object",
  {
    url: z.string().describe("The URL to resolve"),
  },
  async ({ url }): Promise<CallToolResult> => {
    try {
      const resp = await resolveBrowserLink({
        query: { url },
        throwOnError: true,
      });

      return { content: [{ type: "text", text: JSON.stringify(resp.data) }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Failed to resolve link: ${error}` }], isError: true };
    }
  },
);

server.tool(
  "coda_list_tables",
  "List tables in a document",
  {
    docId: z.string().describe("The ID of the document to list tables from"),
    limit: z.number().int().positive().optional().describe("The number of tables to return - optional, defaults to 25"),
    nextPageToken: z
      .string()
      .optional()
      .describe(
        "The token needed to get the next page of results, returned from a previous call to this tool - optional",
      ),
  },
  async ({ docId, limit, nextPageToken }): Promise<CallToolResult> => {
    try {
      const listLimit = nextPageToken ? undefined : limit;

      const resp = await listTables({
        path: { docId },
        query: { limit: listLimit, pageToken: nextPageToken ?? undefined },
        throwOnError: true,
      });

      return { content: [{ type: "text", text: JSON.stringify(resp.data) }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Failed to list tables: ${error}` }], isError: true };
    }
  },
);

server.tool(
  "coda_list_columns",
  "List columns in a table",
  {
    docId: z.string().describe("The ID of the document"),
    tableIdOrName: z.string().describe("The ID or name of the table"),
    limit: z.number().int().positive().optional().describe("The number of columns to return - optional"),
    nextPageToken: z
      .string()
      .optional()
      .describe(
        "The token needed to get the next page of results, returned from a previous call to this tool - optional",
      ),
  },
  async ({ docId, tableIdOrName, limit, nextPageToken }): Promise<CallToolResult> => {
    try {
      const listLimit = nextPageToken ? undefined : limit;

      const resp = await listColumns({
        path: { docId, tableIdOrName },
        query: { limit: listLimit, pageToken: nextPageToken ?? undefined },
        throwOnError: true,
      });

      return { content: [{ type: "text", text: JSON.stringify(resp.data) }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Failed to list columns: ${error}` }], isError: true };
    }
  },
);

server.tool(
  "coda_list_rows",
  "List rows in a table with optional filtering and sorting",
  {
    docId: z.string().describe("The ID of the document"),
    tableIdOrName: z.string().describe("The ID or name of the table"),
    query: z.string().optional().describe('Filter rows by column value, e.g. "Column Name":"value" - optional'),
    sortBy: z
      .enum(["createdAt", "natural", "updatedAt"])
      .optional()
      .describe("Sort order for returned rows - optional"),
    useColumnNames: z
      .boolean()
      .optional()
      .default(true)
      .describe("Use column names instead of column IDs in the output - defaults to true"),
    limit: z.number().int().positive().optional().describe("The number of rows to return - optional"),
    nextPageToken: z
      .string()
      .optional()
      .describe(
        "The token needed to get the next page of results, returned from a previous call to this tool - optional",
      ),
  },
  async ({ docId, tableIdOrName, query, sortBy, useColumnNames, limit, nextPageToken }): Promise<CallToolResult> => {
    try {
      const listLimit = nextPageToken ? undefined : limit;

      const resp = await listRows({
        path: { docId, tableIdOrName },
        query: {
          query: query ?? undefined,
          sortBy: sortBy ?? undefined,
          useColumnNames,
          limit: listLimit,
          pageToken: nextPageToken ?? undefined,
        },
        throwOnError: true,
      });

      return { content: [{ type: "text", text: JSON.stringify(resp.data) }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Failed to list rows: ${error}` }], isError: true };
    }
  },
);

server.tool(
  "coda_get_row",
  "Get a single row from a table",
  {
    docId: z.string().describe("The ID of the document"),
    tableIdOrName: z.string().describe("The ID or name of the table"),
    rowIdOrName: z.string().describe("The ID or name of the row"),
    useColumnNames: z
      .boolean()
      .optional()
      .default(true)
      .describe("Use column names instead of column IDs in the output - defaults to true"),
  },
  async ({ docId, tableIdOrName, rowIdOrName, useColumnNames }): Promise<CallToolResult> => {
    try {
      const resp = await getRow({
        path: { docId, tableIdOrName, rowIdOrName },
        query: { useColumnNames },
        throwOnError: true,
      });

      return { content: [{ type: "text", text: JSON.stringify(resp.data) }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Failed to get row: ${error}` }], isError: true };
    }
  },
);

