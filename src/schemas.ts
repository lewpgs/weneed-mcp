import { z } from "zod";

export const GetListItemsSchema = z.object({
  listId: z.string().describe("The shopping list document ID"),
});

export const AddItemSchema = z.object({
  listId: z.string().describe("The shopping list document ID to add the item to"),
  name: z.string().describe("Name of the product to add"),
  size: z.string().optional().describe("Package size (e.g. 500g, 1L, 6-pack)"),
  price: z.string().optional().describe("Price (e.g. CHF 7.50)"),
  category: z.number().optional().describe(
    "Category ID: 1=Fruit & vegetables, 2=Bread & baked goods, 3=Dairy products & eggs, 4=Meat & fish, 5=Store cupboard/pantry, 6=Sweets & snacks, 7=Beverages, 8=Frozen food & ready meals, 9=Health & bodycare, 10=Household, 11=Tobacco goods, 12=Clothes & shoes, 13=Garden & DIY, 14=Pet supplies. Omit for uncategorized."
  ),
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
