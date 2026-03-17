import {
  ensureAuth,
  getDb,
  unwrapDoc,
  wrapForCreate,
  wrapFieldsForUpdate,
  callFunction,
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  increment,
} from "./firebase.js";
import type {
  ShoppingListData,
  ShoppingListProductData,
  CatalogProduct,
  CatalogSearchResponse,
  CatalogCategoriesResponse,
} from "./types.js";

// Collections
const LISTS = "v2_shoppingLists";
const PRODUCTS = "v2_shoppingListProducts";

// Cached catalog for matching items to icons/categories
let catalogCache: CatalogProduct[] | null = null;

async function getCatalog(): Promise<CatalogProduct[]> {
  if (catalogCache) return catalogCache;
  try {
    const result = await callFunction<unknown, Record<string, unknown>>(
      "catalogProducts_v2",
      { locale: "en" }
    );
    const list = (result as any).productList ?? (result as any).products ?? [];
    catalogCache = list as CatalogProduct[];
    return catalogCache;
  } catch {
    return [];
  }
}

function findCatalogMatch(
  catalog: CatalogProduct[],
  name: string
): CatalogProduct | null {
  const lower = name.toLowerCase().trim();
  const inputWords = lower.split(/\s+/).filter((w) => w.length > 0);
  // Exact match on any language name (case-insensitive)
  const exact = catalog.find((p) =>
    Object.values(p.name).some((n) => n.toLowerCase().trim() === lower)
  );
  if (exact) return exact;
  // Word-level match: a catalog name word matches an input word exactly
  const wordMatch = catalog.find((p) =>
    Object.values(p.name).some((n) => {
      const catalogWords = n.toLowerCase().trim().split(/\s+/).filter((w) => w.length > 0);
      if (!catalogWords.length) return false;
      return inputWords.some((iw) => catalogWords.some((cw) => cw === iw));
    })
  );
  return wordMatch ?? null;
}

function generateUUID(): string {
  const hex = "0123456789ABCDEF";
  const sections = [8, 4, 4, 4, 12];
  return sections
    .map((len) =>
      Array.from({ length: len }, () =>
        hex.charAt(Math.floor(Math.random() * 16))
      ).join("")
    )
    .join("-");
}

export async function getShoppingLists(): Promise<string> {
  const uid = await ensureAuth();
  const db = getDb();

  // Get lists where user is owner
  const ownedQuery = query(
    collection(db, LISTS),
    where("data.owner", "==", uid)
  );
  const ownedSnap = await getDocs(ownedQuery);

  // Get lists where user is participant
  const participantQuery = query(
    collection(db, LISTS),
    where("data.participants", "array-contains", uid)
  );
  const participantSnap = await getDocs(participantQuery);

  // Merge and deduplicate
  const seen = new Set<string>();
  const lists: Array<ShoppingListData & { id: string }> = [];

  for (const snap of [ownedSnap, participantSnap]) {
    for (const docSnap of snap.docs) {
      if (!seen.has(docSnap.id)) {
        seen.add(docSnap.id);
        lists.push(unwrapDoc<ShoppingListData>(docSnap));
      }
    }
  }

  const result = lists.map((list) => ({
    id: list.id,
    name: list.name,
    owner: list.owner,
    isOwner: list.owner === uid,
    participants: list.participants?.length ?? 0,
    uncheckedItems: list.numberOfUncheckedProducts,
  }));

  return JSON.stringify(result, null, 2);
}

export async function getListItems(listId: string): Promise<string> {
  await ensureAuth();
  const db = getDb();

  const productsQuery = query(
    collection(db, LISTS, listId, PRODUCTS),
    where("data.status", "==", "active")
  );
  const snap = await getDocs(productsQuery);

  const items = snap.docs.map((docSnap) => {
    const item = unwrapDoc<ShoppingListProductData>(docSnap);
    return {
      id: item.id,
      productId: item.productId,
      name: item.name,
      description: item.description,
      categoryId: item.categoryId,
      checked: item.checked,
      imageName: item.imageName,
    };
  });

  // Sort: unchecked first, then checked
  items.sort((a, b) => {
    if (a.checked === b.checked) return 0;
    return a.checked ? 1 : -1;
  });

  return JSON.stringify(items, null, 2);
}

export async function addItem(
  listId: string,
  name: string,
  description: string,
  locale: string
): Promise<string> {
  const uid = await ensureAuth();
  const db = getDb();

  // Try to find a matching catalog product for icon and category
  const catalog = await getCatalog();
  const catalogMatch = findCatalogMatch(catalog, name);

  const emptyLangs = { de: "", en: "", fr: "", it: "" };
  const productData = {
    productId: catalogMatch?.productId ?? generateUUID(),
    name: { de: name, en: name, fr: name, it: name },
    description: description || "",
    categoryId: catalogMatch ? Number(catalogMatch.categoryId) : 999,
    checked: false,
    status: "active",
    shoppingListId: listId,
    attachmentImage: null,
    lastCheckedAt: null,
    coopProduct: null,
    source: "user",
    synonyms: catalogMatch?.synonyms ?? emptyLangs,
    keywords: catalogMatch?.keywords ?? { ...emptyLangs },
    brands: catalogMatch?.brands ?? "",
    popularityIndex: catalogMatch?.popularityIndex ?? 999,
    imageName: catalogMatch?.imageName ?? "",
    type: catalogMatch?.type ?? "OTHER",
  };

  const docId = generateUUID();
  const wrapped = wrapForCreate(productData as unknown as Record<string, unknown>, uid);

  await setDoc(doc(db, LISTS, listId, PRODUCTS, docId), wrapped);

  // Update the list's productLastModified fields and unchecked count
  await updateDoc(doc(db, LISTS, listId), {
    "data.productLastModifiedAt": serverTimestamp(),
    "data.productLastModifiedBy": uid,
    "data.numberOfUncheckedProducts": increment(1),
  });

  return JSON.stringify(
    {
      id: docId,
      productId: productData.productId,
      name: productData.name,
      description: productData.description,
      checked: false,
    },
    null,
    2
  );
}

export async function checkItem(
  listId: string,
  itemId: string
): Promise<string> {
  const uid = await ensureAuth();
  const db = getDb();

  const updates = wrapFieldsForUpdate(
    { checked: true, lastCheckedAt: serverTimestamp() },
    uid
  );
  await updateDoc(doc(db, LISTS, listId, PRODUCTS, itemId), updates);

  return JSON.stringify({ success: true, itemId, checked: true });
}

export async function uncheckItem(
  listId: string,
  itemId: string
): Promise<string> {
  const uid = await ensureAuth();
  const db = getDb();

  const updates = wrapFieldsForUpdate({ checked: false }, uid);
  await updateDoc(doc(db, LISTS, listId, PRODUCTS, itemId), updates);

  return JSON.stringify({ success: true, itemId, checked: false });
}

export async function removeItem(
  listId: string,
  itemId: string
): Promise<string> {
  const uid = await ensureAuth();
  const db = getDb();

  const updates = wrapFieldsForUpdate(
    { status: "inactive", checked: false },
    uid
  );
  await updateDoc(doc(db, LISTS, listId, PRODUCTS, itemId), updates);

  // Update the list's productLastModified fields
  await updateDoc(doc(db, LISTS, listId), {
    "data.productLastModifiedAt": serverTimestamp(),
    "data.productLastModifiedBy": uid,
  });

  return JSON.stringify({ success: true, itemId, removed: true });
}

export async function searchCatalog(
  searchQuery: string,
  locale: string
): Promise<string> {
  const catalog = await getCatalog();
  const lower = searchQuery.toLowerCase();
  const matches = catalog.filter((p) =>
    Object.values(p.name).some((n) => n.toLowerCase().includes(lower))
  );

  const products = matches.slice(0, 20).map((p) => ({
    productId: p.productId,
    name: p.name,
    categoryId: p.categoryId,
    imageName: p.imageName,
    brands: p.brands,
  }));

  return JSON.stringify(products, null, 2);
}

export async function getCategories(locale: string): Promise<string> {
  const result = await callFunction<unknown, CatalogCategoriesResponse>(
    "catalogCategories_v2",
    { locale }
  );

  const categories = (result.categoryList ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    parentId: c.parentId,
  }));

  return JSON.stringify(categories, null, 2);
}
