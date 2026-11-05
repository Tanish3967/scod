import fs from 'fs';
import path from 'path';

export interface StoredDocument {
  id: string;
  envelopeId: string;
  name: string;
  fileExtension: string;
  storageKey: string;
  size: number;
  sha256: string;
  pageCount: number;
  uploadedAt: string;
}

export interface StoredAuditEvent {
  id: string;
  envelopeId: string;
  eventType: string;
  actorName: string;
  actorEmail: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  payloadHash: string;
  previousEventHash?: string;
  merkleRootHash?: string;
}

export interface DatabaseSchema {
  version: number;
  envelopes: Record<string, any>;
  documents: Record<string, StoredDocument>;
  auditEvents: StoredAuditEvent[];
  docusignMappings: Record<string, {
    signflowEnvelopeId: string;
    accountId: string;
    clientUserIdMap: Record<string, string>; // clientUserId -> recipientId
  }>;
}

export class JsonFileDatabase {
  private dbPath: string;
  private data: DatabaseSchema;
  private isWriting: boolean = false;
  private pendingWrite: boolean = false;

  constructor(customPath?: string) {
    let resolvedPath = customPath || path.resolve(process.cwd(), 'services/unified-backend/data/db/signflow_db.json');
    if (!fs.existsSync(path.dirname(resolvedPath))) {
      try {
        fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
      } catch {
        resolvedPath = path.resolve(process.cwd(), 'data/db/signflow_db.json');
        fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
      }
    }
    this.dbPath = resolvedPath;
    this.data = this.loadSync();
  }

  private loadSync(): DatabaseSchema {
    if (fs.existsSync(this.dbPath)) {
      try {
        const raw = fs.readFileSync(this.dbPath, 'utf-8');
        return JSON.parse(raw);
      } catch (err) {
        console.warn('[Database] Failed to read db file, initializing with empty state:', err);
      }
    }
    const initial: DatabaseSchema = {
      version: 1,
      envelopes: {},
      documents: {},
      auditEvents: [],
      docusignMappings: {}
    };
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(initial, null, 2), 'utf-8');
    } catch {}
    return initial;
  }

  private async flush(): Promise<void> {
    if (this.isWriting) {
      this.pendingWrite = true;
      return;
    }
    this.isWriting = true;
    const tempPath = this.dbPath + '.tmp';
    try {
      const serialized = JSON.stringify(this.data, null, 2);
      await fs.promises.writeFile(tempPath, serialized, 'utf-8');
      await fs.promises.rename(tempPath, this.dbPath);
    } catch (err) {
      console.error('[Database] Flush error:', err);
    } finally {
      this.isWriting = false;
      if (this.pendingWrite) {
        this.pendingWrite = false;
        this.flush();
      }
    }
  }

  // Envelope operations
  public getEnvelope(id: string): any | undefined {
    return this.data.envelopes[id];
  }

  public listEnvelopes(): any[] {
    return Object.values(this.data.envelopes);
  }

  public async saveEnvelope(envelope: any): Promise<void> {
    this.data.envelopes[envelope.id] = {
      ...envelope,
      updatedAt: new Date().toISOString()
    };
    await this.flush();
  }

  public async deleteEnvelope(id: string): Promise<boolean> {
    if (this.data.envelopes[id]) {
      delete this.data.envelopes[id];
      await this.flush();
      return true;
    }
    return false;
  }

  // Document operations
  public async saveDocument(doc: StoredDocument): Promise<void> {
    this.data.documents[doc.id] = doc;
    await this.flush();
  }

  public getDocument(id: string): StoredDocument | undefined {
    return this.data.documents[id];
  }

  public listDocumentsForEnvelope(envelopeId: string): StoredDocument[] {
    return Object.values(this.data.documents).filter(d => d.envelopeId === envelopeId);
  }

  // Audit event operations
  public async addAuditEvent(event: StoredAuditEvent): Promise<void> {
    this.data.auditEvents.push(event);
    await this.flush();
  }

  public listAuditEvents(envelopeId?: string): StoredAuditEvent[] {
    if (!envelopeId) return this.data.auditEvents;
    return this.data.auditEvents.filter(e => e.envelopeId === envelopeId);
  }

  // DocuSign Mapping operations
  public async saveDocusignMapping(docusignEnvId: string, mapping: {
    signflowEnvelopeId: string;
    accountId: string;
    clientUserIdMap: Record<string, string>;
  }): Promise<void> {
    this.data.docusignMappings[docusignEnvId] = mapping;
    await this.flush();
  }

  public getDocusignMapping(docusignEnvId: string) {
    return this.data.docusignMappings[docusignEnvId];
  }

  public getStats() {
    return {
      envelopesCount: Object.keys(this.data.envelopes).length,
      documentsCount: Object.keys(this.data.documents).length,
      auditEventsCount: this.data.auditEvents.length,
      dbPath: this.dbPath
    };
  }
}

export const persistentDb = new JsonFileDatabase();
