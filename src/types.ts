import type { FieldValue, Timestamp } from "firebase/firestore";

export interface FirestoreWrapper<T> {
  data: T;
  origin: {
    createdAt: Timestamp | FieldValue;
    createdBy: string;
    source: string;
  };
  activity: {
    lastModifiedAt: Timestamp | FieldValue;
    lastModifiedBy: string;
  };
}

export interface ShoppingListData {
  name: string;
  owner: string;
  participants: string[] | null;
  productLastModifiedAt: Timestamp | null;
  productLastModifiedBy: string | null;
  numberOfUncheckedProducts: number;
}

export interface ShoppingListProductData {
  productId: string;
  name: Record<string, string>; // { de: "...", en: "...", fr: "...", it: "..." }
  description: string;
  categoryId: string | number | null;
  checked: boolean;
  status: "active" | "inactive";
  shoppingListId: string;
  attachmentImage: string | null;
  lastCheckedAt: Timestamp | null;
  source: string | null;
  synonyms: Record<string, string> | null;
  keywords: Record<string, string> | null;
  brands: string | null;
  popularityIndex: number | null;
  imageName: string | null;
  type: string | null;
}

export interface CatalogProduct {
  productId: string;
  name: Record<string, string>;
  categoryId: string;
  imageName: string | null;
  synonyms: Record<string, string> | null;
  keywords: Record<string, string> | null;
  brands: string | null;
  popularityIndex: number | null;
  type: string | null;
}

export interface Category {
  id: string;
  name: Record<string, string>;
  parentId: string | null;
}

export interface CatalogSearchResponse {
  products: CatalogProduct[];
}

export interface CatalogCategoriesResponse {
  categoryList: Category[];
}
