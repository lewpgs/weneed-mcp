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
} from "./firebase.js";
import type {
  ShoppingListData,
  ShoppingListProductData,
  CatalogSearchResponse,
  CatalogCategoriesResponse,
} from "./types.js";

// Collections
const LISTS = "v2_shoppingLists";
const PRODUCTS = "v2_shoppingListProducts";

function generateId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 20; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
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

  const nameObj: Record<string, string> = { de: "", en: "", fr: "", it: "" };
  nameObj[locale] = name;

  const productData: Omit<ShoppingListProductData, "lastCheckedAt"> = {
    productId: generateId(),
    name: nameObj,
    description: description || "",
    categoryId: null,
    checked: false,
    status: "active",
    shoppingListId: listId,
    attachmentImage: null,
    source: "weneed-mcp",
    synonyms: null,
    keywords: null,
    brands: null,
    popularityIndex: null,
    imageName: null,
    type: "OTHER",
  };

  const docId = generateId();
  const wrapped = wrapForCreate(productData as unknown as Record<string, unknown>, uid);

  await setDoc(doc(db, LISTS, listId, PRODUCTS, docId), wrapped);

  // Update the list's productLastModified fields
  await updateDoc(doc(db, LISTS, listId), {
    "data.productLastModifiedAt": serverTimestamp(),
    "data.productLastModifiedBy": uid,
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
  const result = await callFunction<unknown, CatalogSearchResponse>(
    "catalogProducts_v2",
    { query: searchQuery, locale }
  );

  const products = (result.products ?? []).map((p) => ({
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
