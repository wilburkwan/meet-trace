import { isRecordingDb } from "./recording";

// Recording slices live in IndexedDB until the file is saved: memory stays
// flat during long meetings, and a crash leaves them for recovery.
const STORE = "chunks";

const settle = <T,>(request: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

export const openRecordingDb = (name: string): Promise<IDBDatabase> => {
  const request = indexedDB.open(name, 1);
  request.onupgradeneeded = () => request.result.createObjectStore(STORE, { autoIncrement: true });
  return settle(request);
};

/**
 * Resolves once the slice is committed, not merely queued: the recorder page
 * closes right after stopping, which would otherwise drop the last slice.
 */
export const appendChunk = (db: IDBDatabase, chunk: Blob): Promise<void> =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, "readwrite", { durability: "strict" });
    transaction.objectStore(STORE).add(chunk);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error ?? new Error("Write aborted"));
  });

const isBlob = (value: unknown): value is Blob => value instanceof Blob;

/** Every stored slice, in recording order. */
export const readChunks = async (name: string): Promise<Blob[]> => {
  const db = await openRecordingDb(name);
  try {
    return (await settle(db.transaction(STORE, "readonly").objectStore(STORE).getAll())).filter(isBlob);
  } finally {
    db.close();
  }
};

/** Deletes a saved recording. If another page still has it open, deletion finishes once it closes. */
export const deleteRecordingDb = (name: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(name);
    request.onsuccess = () => resolve();
    request.onblocked = () => resolve();
    request.onerror = () => reject(request.error);
  });

/** Recordings still waiting to be saved. */
export const listRecordingDbs = async (): Promise<string[]> =>
  (await indexedDB.databases()).map((info) => info.name).filter(isRecordingDb);
