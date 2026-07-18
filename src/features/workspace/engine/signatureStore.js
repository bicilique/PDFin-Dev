// PDFin workspace — signature library persistence (IndexedDB, no dependency).
// Stores paraf images (bytes + metadata) on-device so users can reuse them
// across sessions without re-typing/re-uploading. Nothing leaves the browser.

const DB_NAME = "pdfin-signatures";
const DB_VERSION = 1;
const STORE = "signatures";

function hasIndexedDb() {
  return typeof indexedDB !== "undefined";
}

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withStore(mode, fn) {
  if (!hasIndexedDb()) return mode === "readonly" ? [] : undefined;
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const store = tx.objectStore(STORE);
      const result = fn(store);
      tx.oncomplete = () => resolve(result?.result ?? result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

export async function listSignatures() {
  const rows = await withStore("readonly", (store) => store.getAll());
  return (rows || []).slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export async function saveSignature({ bytes, type, aspect, label }) {
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    bytes, type, aspect, label: label || "",
    createdAt: Date.now(),
  };
  await withStore("readwrite", (store) => store.put(entry));
  return entry;
}

export async function deleteSignature(id) {
  await withStore("readwrite", (store) => store.delete(id));
}
