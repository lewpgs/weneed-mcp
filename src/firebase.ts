import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  type Auth,
  type UserCredential,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  type Firestore,
  type DocumentData,
  type QueryDocumentSnapshot,
  serverTimestamp,
  type FieldValue,
} from "firebase/firestore";
import {
  getFunctions,
  httpsCallable,
  type Functions,
} from "firebase/functions";
import type { FirestoreWrapper } from "./types.js";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyC-xCc41xfBqInud6rCYC27OGQqcANk5jg",
  authDomain: "coop-shoppinglist-prod1.firebaseapp.com",
  projectId: "coop-shoppinglist-prod1",
  storageBucket: "coop-shoppinglist-prod1.appspot.com",
  messagingSenderId: "162667317917",
  appId: "1:162667317917:web:6882cb0aebbb7a52e1a274",
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let functions: Functions | null = null;
let userCredential: UserCredential | null = null;

function getApp(): FirebaseApp {
  if (!app) {
    app = initializeApp(FIREBASE_CONFIG);
  }
  return app;
}

function getAuthInstance(): Auth {
  if (!auth) {
    auth = getAuth(getApp());
  }
  return auth;
}

export function getDb(): Firestore {
  if (!db) {
    db = getFirestore(getApp());
  }
  return db;
}

export function getFunctionsInstance(): Functions {
  if (!functions) {
    functions = getFunctions(getApp(), "production");
  }
  return functions;
}

export async function ensureAuth(): Promise<string> {
  if (userCredential?.user) {
    return userCredential.user.uid;
  }

  const email = process.env.WENEED_EMAIL;
  const password = process.env.WENEED_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Missing WENEED_EMAIL or WENEED_PASSWORD environment variables. " +
        "Set them to your WeNeed account credentials."
    );
  }

  userCredential = await signInWithEmailAndPassword(
    getAuthInstance(),
    email,
    password
  );
  return userCredential.user.uid;
}

export function unwrapDoc<T>(
  doc: QueryDocumentSnapshot<DocumentData>
): T & { id: string } {
  const raw = doc.data() as FirestoreWrapper<T>;
  return {
    ...(raw.data as T & object),
    id: doc.id,
  };
}

function getSource(): string {
  return "weneed-mcp";
}

export function wrapForCreate<T extends Record<string, unknown>>(
  data: T,
  userId: string
): FirestoreWrapper<T> {
  const now = serverTimestamp();
  return {
    data,
    origin: {
      createdAt: now as unknown as FieldValue,
      createdBy: userId,
      source: getSource(),
    },
    activity: {
      lastModifiedAt: now as unknown as FieldValue,
      lastModifiedBy: userId,
    },
  } as unknown as FirestoreWrapper<T>;
}

export function wrapFieldsForUpdate(
  fields: Record<string, unknown>,
  userId: string
): Record<string, unknown> {
  const prefixed: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    prefixed[`data.${key}`] = value;
  }
  prefixed["activity.lastModifiedAt"] = serverTimestamp();
  prefixed["activity.lastModifiedBy"] = userId;
  return prefixed;
}

export async function callFunction<TReq, TRes>(
  name: string,
  data?: TReq
): Promise<TRes> {
  await ensureAuth();
  const fn = httpsCallable<TReq, TRes>(getFunctionsInstance(), name);
  const result = await fn(data as TReq);
  return result.data;
}

// Re-export Firestore utilities for use in tools
export {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
};
