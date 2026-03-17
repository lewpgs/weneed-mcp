#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  GetListItemsSchema,
  AddItemSchema,
  CheckItemSchema,
  UncheckItemSchema,
  RemoveItemSchema,
  SearchCatalogSchema,
  GetCategoriesSchema,
} from "./schemas.js";
import {
  getShoppingLists,
  getListItems,
  addItem,
  checkItem,
  uncheckItem,
  removeItem,
  searchCatalog,
  getCategories,
} from "./tools.js";

const server = new McpServer({
  name: "weneed-mcp",
  version: "0.1.0",
});

// --- Tools ---

server.tool(
  "get_shopping_lists",
  "Get all shopping lists the user has access to, including shared lists",
  {},
  async () => {
    try {
      const result = await getShoppingLists();
      return { content: [{ type: "text", text: result }] };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "get_list_items",
  "Get all active products/items in a specific shopping list",
  GetListItemsSchema.shape,
  async ({ listId }) => {
    try {
      const result = await getListItems(listId);
      return { content: [{ type: "text", text: result }] };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "add_item",
  "Add a product to a shopping list by name. Use search_catalog first to find exact product matches from the Coop catalog.",
  AddItemSchema.shape,
  async ({ listId, name, size, price, category, locale }) => {
    try {
      const result = await addItem(listId, name, size, price, category, locale ?? "de");
      return { content: [{ type: "text", text: result }] };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "check_item",
  "Mark an item as checked/bought in a shopping list",
  CheckItemSchema.shape,
  async ({ listId, itemId }) => {
    try {
      const result = await checkItem(listId, itemId);
      return { content: [{ type: "text", text: result }] };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "uncheck_item",
  "Uncheck a previously checked item in a shopping list",
  UncheckItemSchema.shape,
  async ({ listId, itemId }) => {
    try {
      const result = await uncheckItem(listId, itemId);
      return { content: [{ type: "text", text: result }] };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "remove_item",
  "Remove (deactivate) an item from a shopping list",
  RemoveItemSchema.shape,
  async ({ listId, itemId }) => {
    try {
      const result = await removeItem(listId, itemId);
      return { content: [{ type: "text", text: result }] };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "search_catalog",
  "Search the Coop product catalog by name. Returns matching products with IDs that can be used with add_item.",
  SearchCatalogSchema.shape,
  async ({ query, locale }) => {
    try {
      const result = await searchCatalog(query, locale ?? "de");
      return { content: [{ type: "text", text: result }] };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "get_categories",
  "Get product categories from the Coop catalog",
  GetCategoriesSchema.shape,
  async ({ locale }) => {
    try {
      const result = await getCategories(locale ?? "de");
      return { content: [{ type: "text", text: result }] };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }
);

// --- Start ---

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
