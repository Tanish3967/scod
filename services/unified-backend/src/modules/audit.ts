import { Request, Response, Router } from 'express';
import crypto from 'crypto';

export interface AuditRecord {
  id: string;
  envelopeId: string;
  action: string;
  actor: string;
  timestamp: string;
  ipAddress: string;
  details: Record<string, any>;
  hashChainPrevious: string;
  hashChainCurrent: string;
}

export class AuditLedgerStore {
  private ledger: Map<string, AuditRecord[]> = new Map();
  private genesisHash = '0000000000000000000000000000000000000000000000000000000000000000';

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    this.record({
      envelopeId: 'env-msa-8921',
      action: 'ENVELOPE_CREATED',
      actor: 'Alex Rivera <alex@acmeglobal.com>',
      ipAddress: '198.51.100.44',
      details: { version: 1, title: 'Master Services Agreement & DPA' }
    });

    this.record({
      envelopeId: 'env-msa-8921',
      action: 'SIGNATURE_APPLIED',
      actor: 'Johnathan Vance <johnathan.vance@apex.io>',
      ipAddress: '203.0.113.19',
      details: { fieldId: 'fld-1', type: 'draw_pad', authType: 'email' }
    });
  }

  public calculateHash(record: Omit<AuditRecord, 'hashChainCurrent'>): string {
    const raw = `${record.id}|${record.envelopeId}|${record.action}|${record.actor}|${record.timestamp}|${record.ipAddress}|${JSON.stringify(record.details)}|${record.hashChainPrevious}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  public record(params: {
    envelopeId: string;
    action?: string;
    eventType?: string;
    actor?: string;
    actorName?: string;
    actorEmail?: string;
    ipAddress?: string;
    userAgent?: string;
    details?: Record<string, any>;
    payloadHash?: string;
  }): AuditRecord {
    const envelopeId = params.envelopeId;
    let list = this.ledger.get(envelopeId);
    if (!list) {
      list = [];
      this.ledger.set(envelopeId, list);
    }

    const prevHash = list.length > 0 ? list[list.length - 1].hashChainCurrent : this.genesisHash;
    const actor = params.actor || `${params.actorName || 'Authorized User'} <${params.actorEmail || 'user@signflow.ai'}>`;
    const action = params.action || params.eventType || 'GENERIC_EVENT';
    const details = params.details || { payloadHash: params.payloadHash, userAgent: params.userAgent };

    const entryWithoutHash: Omit<AuditRecord, 'hashChainCurrent'> = {
      id: 'aud-' + crypto.randomBytes(6).toString('hex'),
      envelopeId,
      action,
      actor,
      timestamp: new Date().toISOString(),
      ipAddress: params.ipAddress || '127.0.0.1',
      details,
      hashChainPrevious: prevHash
    };

    const currentHash = this.calculateHash(entryWithoutHash);
    const fullRecord: AuditRecord = {
      ...entryWithoutHash,
      hashChainCurrent: currentHash
    };

    list.push(fullRecord);
    return fullRecord;
  }

  public getTrail(envelopeId: string): AuditRecord[] {
    return this.ledger.get(envelopeId) || [];
  }

  public verify(envelopeId: string): { valid: boolean; totalEvents: number; rootHash?: string; brokenIndex?: number } {
    const list = this.ledger.get(envelopeId);
    if (!list || list.length === 0) {
      return { valid: true, totalEvents: 0, rootHash: this.genesisHash };
    }

    let prev = this.genesisHash;
    for (let i = 0; i < list.length; i++) {
      const entry = list[i];
      const checkWithout: Omit<AuditRecord, 'hashChainCurrent'> = {
        id: entry.id,
        envelopeId: entry.envelopeId,
        action: entry.action,
        actor: entry.actor,
        timestamp: entry.timestamp,
        ipAddress: entry.ipAddress,
        details: entry.details,
        hashChainPrevious: entry.hashChainPrevious
      };
      const expected = this.calculateHash(checkWithout);
      if (entry.hashChainCurrent !== expected) {
        return { valid: false, totalEvents: list.length, rootHash: list[list.length - 1].hashChainCurrent, brokenIndex: i };
      }
      if (list[i].hashChainPrevious !== prev) {
        return { valid: false, totalEvents: list.length, rootHash: list[list.length - 1].hashChainCurrent, brokenIndex: i };
      }
      prev = list[i].hashChainCurrent;
    }

    return {
      valid: true,
      totalEvents: list.length,
      rootHash: list[list.length - 1].hashChainCurrent
    };
  }
}

export const auditLedgerStore = new AuditLedgerStore();

export function createAuditRouter(): Router {
  const router = Router();

  // Record Audit Event
  router.post('/events', (req: Request, res: Response) => {
    const { envelopeId, action, eventType, actor, actorName, actorEmail, details, ipAddress, userAgent, payloadHash } = req.body;
    if (!envelopeId) {
      return res.status(400).json({ error: 'envelopeId is required' });
    }
    const recorded = auditLedgerStore.record({
      envelopeId,
      action: action || eventType,
      actor,
      actorName,
      actorEmail,
      details,
      ipAddress,
      userAgent,
      payloadHash
    });
    res.status(201).json({
      success: true,
      event: recorded,
      hash: recorded.hashChainCurrent
    });
  });

  // Verify Audit Integrity
  router.get('/:envelopeId/verify', (req: Request, res: Response) => {
    const envelopeId = req.params.envelopeId as string;
    const result = auditLedgerStore.verify(envelopeId);
    res.json({
      success: true,
      verification: result,
      tamperDetected: !result.valid,
      complianceStandard: 'eIDAS Qualified / US ESIGN Non-Repudiation'
    });
  });

  // Get Envelope Audit Trail
  router.get('/:envelopeId', (req: Request, res: Response) => {
    const envelopeId = req.params.envelopeId as string;
    const trail = auditLedgerStore.getTrail(envelopeId);
    res.json({
      success: true,
      count: trail.length,
      auditTrail: trail
    });
  });

  return router;
}
