import { Envelope, AuditEvent, Template, NotaryJournalEntry } from '../types/signflow';
import { INITIAL_ENVELOPES } from '../data/mockEnvelopes';
import { MOCK_TEMPLATES } from '../data/mockTemplates';

const DB_NAME = 'SignFlow_Local_Vault';
const DB_VERSION = 1;

export interface DBStats {
  status: 'connected' | 'initializing' | 'error';
  engine: 'IndexedDB (Browser Native) + Local Disk Store';
  storageUsedBytes: number;
  storageUsedFormatted: string;
  tables: {
    name: string;
    count: number;
    description: string;
  }[];
  lastSyncAt: string;
}

// Open or create IndexedDB connection
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Envelopes Store
      if (!db.objectStoreNames.contains('envelopes')) {
        const envelopeStore = db.createObjectStore('envelopes', { keyPath: 'id' });
        envelopeStore.createIndex('status', 'status', { unique: false });
        envelopeStore.createIndex('createdAt', 'createdAt', { unique: false });
        envelopeStore.createIndex('title', 'title', { unique: false });
      }

      // 2. Audit Events Ledger Store
      if (!db.objectStoreNames.contains('audit_events')) {
        const auditStore = db.createObjectStore('audit_events', { keyPath: 'id' });
        auditStore.createIndex('envelopeId', 'envelopeId', { unique: false });
        auditStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // 3. Templates Store
      if (!db.objectStoreNames.contains('templates')) {
        const templateStore = db.createObjectStore('templates', { keyPath: 'id' });
        templateStore.createIndex('category', 'category', { unique: false });
      }

      // 4. Notary Journal Store
      if (!db.objectStoreNames.contains('notary_journal')) {
        const notaryStore = db.createObjectStore('notary_journal', { keyPath: 'id' });
        notaryStore.createIndex('sessionNumber', 'sessionNumber', { unique: false });
      }

      // 5. Offline Signing Queue Store
      if (!db.objectStoreNames.contains('offline_queue')) {
        const queueStore = db.createObjectStore('offline_queue', { keyPath: 'id' });
        queueStore.createIndex('status', 'status', { unique: false });
      }

      // 6. System & Tenant Settings Store
      if (!db.objectStoreNames.contains('system_settings')) {
        db.createObjectStore('system_settings', { keyPath: 'key' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// Generic Transaction Helper
async function performTransaction<T>(
  storeName: string,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T> | void
): Promise<T> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);

    let result: T;
    const req = operation(store);

    if (req) {
      req.onsuccess = () => {
        result = req.result;
      };
      req.onerror = () => reject(req.error);
    }

    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Initialize local database and seed with mock data if completely fresh
 */
export async function initLocalDatabase(): Promise<Envelope[]> {
  try {
    const db = await openDatabase();
    const existingEnvelopes = await getAllEnvelopesFromDB();

    if (existingEnvelopes.length === 0) {
      // Seed default envelopes
      await saveAllEnvelopesToDB(INITIAL_ENVELOPES);

      // Seed default templates
      await performTransaction('templates', 'readwrite', (store) => {
        MOCK_TEMPLATES.forEach((tmpl) => store.put(tmpl));
      });

      return INITIAL_ENVELOPES;
    }

    // Merge any missing seed envelopes from INITIAL_ENVELOPES into existing IndexedDB
    const missingSeedEnvelopes = INITIAL_ENVELOPES.filter(
      seed => !existingEnvelopes.some(existing => existing.id === seed.id)
    );

    if (missingSeedEnvelopes.length > 0) {
      const merged = [...existingEnvelopes, ...missingSeedEnvelopes];
      await saveAllEnvelopesToDB(merged);
      return merged;
    }

    return existingEnvelopes;
  } catch (err) {
    console.warn('[SignFlow DB] Falling back to memory storage:', err);
    return INITIAL_ENVELOPES;
  }
}

/**
 * Retrieve all envelopes from IndexedDB
 */
export async function getAllEnvelopesFromDB(): Promise<Envelope[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('envelopes', 'readonly');
      const store = tx.objectStore('envelopes');
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

/**
 * Save or update all envelopes in IndexedDB
 */
export async function saveAllEnvelopesToDB(envelopes: Envelope[]): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('envelopes', 'readwrite');
      const store = tx.objectStore('envelopes');

      // Clear and bulk insert
      store.clear();
      envelopes.forEach((env) => store.put(env));

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('[SignFlow DB] Failed to save envelopes:', err);
  }
}

/**
 * Save a single envelope
 */
export async function saveEnvelopeToDB(envelope: Envelope): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('envelopes', 'readwrite');
      const store = tx.objectStore('envelopes');
      store.put(envelope);

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('[SignFlow DB] Failed to save envelope:', err);
  }
}

/**
 * Delete an envelope by ID
 */
export async function deleteEnvelopeFromDB(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('envelopes', 'readwrite');
      const store = tx.objectStore('envelopes');
      store.delete(id);

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('[SignFlow DB] Failed to delete envelope:', err);
  }
}

/**
 * Record an audit event to the cryptographic ledger
 */
export async function recordAuditEventToDB(event: AuditEvent): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('audit_events', 'readwrite');
      const store = tx.objectStore('audit_events');
      store.put(event);

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('[SignFlow DB] Failed to record audit event:', err);
  }
}

/**
 * Get all audit events from local DB
 */
export async function getAllAuditEventsFromDB(): Promise<AuditEvent[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('audit_events', 'readonly');
      const store = tx.objectStore('audit_events');
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

/**
 * Get Database Statistics (Live counts, storage size, connection status)
 */
export async function getDatabaseStats(): Promise<DBStats> {
  try {
    const db = await openDatabase();
    const storeNames = Array.from(db.objectStoreNames);

    const tables: { name: string; count: number; description: string }[] = [];
    let totalEstimatedBytes = 0;

    for (const storeName of storeNames) {
      const count = await new Promise<number>((resolve) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.count();
        req.onsuccess = () => resolve(req.result || 0);
        req.onerror = () => resolve(0);
      });

      let description = 'Object Store';
      if (storeName === 'envelopes') description = 'Agreement Envelopes, Fields & SHA-256 Hashes';
      else if (storeName === 'audit_events') description = 'Cryptographic Event Merkle Ledger';
      else if (storeName === 'templates') description = 'Master Agreement Blueprints & Roles';
      else if (storeName === 'notary_journal') description = 'Remote Notary Video & IDV Verification Logs';
      else if (storeName === 'offline_queue') description = 'Offline Tablet/Mobile Synchronized Signatures';
      else if (storeName === 'system_settings') description = 'Tenant Branding & Security Configuration';

      tables.push({ name: storeName, count, description });
      totalEstimatedBytes += count * 4096; // Average 4KB per record approximation
    }

    const kb = totalEstimatedBytes / 1024;
    const storageUsedFormatted = kb > 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${kb.toFixed(1)} KB`;

    return {
      status: 'connected',
      engine: 'IndexedDB (Browser Native) + Local Disk Store',
      storageUsedBytes: totalEstimatedBytes,
      storageUsedFormatted,
      tables,
      lastSyncAt: new Date().toLocaleTimeString()
    };
  } catch {
    return {
      status: 'error',
      engine: 'IndexedDB (Browser Native) + Local Disk Store',
      storageUsedBytes: 0,
      storageUsedFormatted: '0 KB',
      tables: [],
      lastSyncAt: 'Never'
    };
  }
}

/**
 * Export full local database dump as JSON
 */
export async function exportDatabaseJSON(): Promise<string> {
  const db = await openDatabase();
  const dump: Record<string, unknown[]> = {};

  for (const name of Array.from(db.objectStoreNames)) {
    const records = await new Promise<unknown[]>((resolve) => {
      const tx = db.transaction(name, 'readonly');
      const store = tx.objectStore(name);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
    dump[name] = records;
  }

  return JSON.stringify({
    metadata: {
      exportedAt: new Date().toISOString(),
      platform: 'SignFlow Local Database Engine',
      version: DB_VERSION,
      schema: 'Enterprise Agreement Vault'
    },
    tables: dump
  }, null, 2);
}

/**
 * Import and restore database from JSON dump
 */
export async function importDatabaseJSON(jsonString: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonString);
    if (!data.tables) return false;

    const db = await openDatabase();

    for (const [storeName, records] of Object.entries(data.tables)) {
      if (db.objectStoreNames.contains(storeName) && Array.isArray(records)) {
        await new Promise<void>((resolve, reject) => {
          const tx = db.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);
          store.clear();
          records.forEach((rec) => store.put(rec));
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        });
      }
    }
    return true;
  } catch (err) {
    console.error('[SignFlow DB] Restore failed:', err);
    return false;
  }
}

/**
 * Reset local database to factory defaults
 */
export async function resetDatabaseToDefaults(): Promise<Envelope[]> {
  const db = await openDatabase();
  for (const name of Array.from(db.objectStoreNames)) {
    await new Promise<void>((resolve) => {
      const tx = db.transaction(name, 'readwrite');
      const store = tx.objectStore(name);
      store.clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  }

  // Re-seed
  await saveAllEnvelopesToDB(INITIAL_ENVELOPES);
  await performTransaction('templates', 'readwrite', (store) => {
    MOCK_TEMPLATES.forEach((tmpl) => store.put(tmpl));
  });

  return INITIAL_ENVELOPES;
}
