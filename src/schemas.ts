import { z } from "zod";

export const GetListItemsSchema = z.object({
  listId: z.string().describe("The shopping list document ID"),
});

export const AddItemSchema = z.object({
  listId: z.string().describe("The shopping list document ID to add the item to"),
  name: z.string().describe("Name of the product to add"),
  description: z.string().optional().default("").describe("Optional description or note for the item"),
  locale: z.string().optional().default("de").describe("Locale for the product name (de, en, fr, it)"),
});

export const CheckItemSchema = z.object({
  listId: z.string().describe("The shopping list document ID"),
  itemId: z.string().describe("The product document ID within the list"),
});

export const UncheckItemSchema = z.object({
  listId: z.string().describe("The shopping list document ID"),
  itemId: z.string().describe("The product document ID within the list"),
});

export const RemoveItemSchema = z.object({
  listId: z.string().describe("The shopping list document ID"),
  itemId: z.string().describe("The product document ID within the list"),
});

export const SearchCatalogSchema = z.object({
  query: z.string().describe("Search query for the Coop product catalog"),
  locale: z.string().optional().default("de").describe("Locale for results (de, en, fr, it)"),
});

export const GetCategoriesSchema = z.object({
  locale: z.string().optional().default("de").describe("Locale for category names (de, en, fr, it)"),
});
