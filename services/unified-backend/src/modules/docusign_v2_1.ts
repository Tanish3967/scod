import { Request, Response, Router } from 'express';
import crypto from 'crypto';
import { envelopeStore, Envelope, EnvelopeRecipient, DocumentField } from './envelopes.js';
import { storageEngine } from './storage.js';
import { persistentDb, StoredDocument, StoredAuditEvent } from './database.js';
import { generateServerCertificatePdf, createCombinedFlattenedPdf, EnvelopePdfInfo } from './server_pdf.js';

export function createDocusignRouter(): Router {
  const router = Router();

  // Helper to convert internal envelope to EnvelopePdfInfo
  const toPdfInfo = (env: Envelope): EnvelopePdfInfo => ({
    id: env.id,
    title: env.title,
    status: env.status,
    senderName: env.senderName,
    senderEmail: env.senderEmail,
    createdAt: env.createdAt,
    completedAt: env.completedAt,
    recipients: env.recipients.map(r => ({
      id: r.id,
      name: r.name,
      email: r.email,
      role: r.role,
      routingOrder: r.routingOrder,
      status: r.status,
      signedAt: r.signedAt,
      authType: r.authType
    })),
    fields: env.fields,
    sha256Hash: env.lockSealHash
  });

  // ==========================================
  // 1. DocuSign Envelope Creation
  // POST /v2.1/accounts/:accountId/envelopes
  // ==========================================
  router.post('/:accountId/envelopes', async (req: Request, res: Response) => {
    try {
      const { accountId } = req.params;
      const { 
        emailSubject, 
        emailBlurb, 
        status = 'sent', 
        documents = [], 
        recipients = {} 
      } = req.body;

      const envelopeId = 'env-' + crypto.randomUUID();
      const now = new Date().toISOString();

      // Parse Signers & Carbon Copies
      const parsedRecipients: EnvelopeRecipient[] = [];
      const clientUserIdMap: Record<string, string> = {};

      const rawSigners = recipients.signers || [];
      const rawCc = recipients.carbonCopies || [];

      rawSigners.forEach((s: any, idx: number) => {
        const recId = s.recipientId ? String(s.recipientId) : `rec-${idx + 1}`;
        parsedRecipients.push({
          id: recId,
          name: s.name || `Signer ${idx + 1}`,
          email: s.email,
          role: 'signer',
          routingOrder: parseInt(s.routingOrder, 10) || (idx + 1),
          status: idx === 0 && status === 'sent' ? 'ready' : 'waiting',
          authType: 'email'
        });

        if (s.clientUserId) {
          clientUserIdMap[String(s.clientUserId)] = recId;
        }
      });

      rawCc.forEach((c: any, idx: number) => {
        const recId = c.recipientId ? String(c.recipientId) : `cc-${idx + 1}`;
        parsedRecipients.push({
          id: recId,
          name: c.name || `Viewer ${idx + 1}`,
          email: c.email,
          role: 'cc',
          routingOrder: parseInt(c.routingOrder, 10) || 99,
          status: 'waiting',
          authType: 'email'
        });
      });

      // Parse tabs/fields from signers
      const parsedFields: DocumentField[] = [];
      rawSigners.forEach((s: any, signerIdx: number) => {
        const recId = s.recipientId ? String(s.recipientId) : `rec-${signerIdx + 1}`;
        const tabs = s.tabs || {};

        // signHereTabs
        if (Array.isArray(tabs.signHereTabs)) {
          tabs.signHereTabs.forEach((tab: any, tIdx: number) => {
            parsedFields.push({
              id: `fld-sig-${signerIdx}-${tIdx}`,
              type: 'signature',
              label: tab.name || 'Signature',
              page: parseInt(tab.pageNumber, 10) || 1,
              x: parseFloat(tab.xPosition) || 20,
              y: parseFloat(tab.yPosition) || 70,
              width: 25,
              height: 8,
              required: true,
              recipientId: recId
            });
          });
        }

        // textTabs
        if (Array.isArray(tabs.textTabs)) {
          tabs.textTabs.forEach((tab: any, tIdx: number) => {
            parsedFields.push({
              id: `fld-txt-${signerIdx}-${tIdx}`,
              type: 'text',
              label: tab.name || 'Text Field',
              page: parseInt(tab.pageNumber, 10) || 1,
              x: parseFloat(tab.xPosition) || 20,
              y: parseFloat(tab.yPosition) || 50,
              width: 20,
              height: 5,
              required: tab.required === 'true' || tab.required === true,
              value: tab.value || '',
              recipientId: recId
            });
          });
        }

        // dateSignedTabs
        if (Array.isArray(tabs.dateSignedTabs)) {
          tabs.dateSignedTabs.forEach((tab: any, tIdx: number) => {
            parsedFields.push({
              id: `fld-date-${signerIdx}-${tIdx}`,
              type: 'date',
              label: tab.name || 'Date Signed',
              page: parseInt(tab.pageNumber, 10) || 1,
              x: parseFloat(tab.xPosition) || 55,
              y: parseFloat(tab.yPosition) || 70,
              width: 15,
              height: 5,
              required: true,
              recipientId: recId
            });
          });
        }
      });

      // Save documents to storage if provided
      let primaryDocBuffer: Buffer | null = null;
      if (Array.isArray(documents) && documents.length > 0) {
        for (const doc of documents) {
          const docId = String(doc.documentId || '1');
          const docName = doc.name || 'Document.pdf';
          const base64Data = doc.documentBase64;
          if (base64Data) {
            const buf = Buffer.from(base64Data, 'base64');
            const storageKey = `doc_${envelopeId}_${docId}.pdf`;
            await storageEngine.putObject(storageKey, buf, 'application/pdf');

            const storedDoc: StoredDocument = {
              id: docId,
              envelopeId,
              name: docName,
              fileExtension: doc.fileExtension || 'pdf',
              storageKey,
              size: buf.length,
              sha256: crypto.createHash('sha256').update(buf).digest('hex'),
              pageCount: 1,
              uploadedAt: now
            };
            await persistentDb.saveDocument(storedDoc);

            if (!primaryDocBuffer) {
              primaryDocBuffer = buf;
            }
          }
        }
      }

      // Create Envelope in Memory and Persistent DB
      const envelope: Envelope = {
        id: envelopeId,
        title: emailSubject || 'SignFlow Executed Agreement',
        status: status === 'created' ? 'draft' : 'sent',
        senderName: 'API Client',
        senderEmail: `api-client@${accountId}.docusign.net`,
        recipients: parsedRecipients,
        fields: parsedFields,
        createdAt: now,
        updatedAt: now,
        version: 1,
        isLocked: false,
        tags: ['DocuSign-API', 'REST-v2.1', accountId]
      };

      envelopeStore.create(envelope);
      await persistentDb.saveEnvelope(envelope);
      await persistentDb.saveDocusignMapping(envelopeId, {
        signflowEnvelopeId: envelopeId,
        accountId: String(accountId),
        clientUserIdMap
      });

      // Log initial creation audit event
      const auditEvent: StoredAuditEvent = {
        id: 'aud-' + crypto.randomUUID(),
        envelopeId,
        eventType: 'ENVELOPE_CREATED_DOCUSIGN_API',
        actorName: 'DocuSign API Client',
        actorEmail: `api@${accountId}.docusign.net`,
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'DocuSign-REST-v2.1-Adapter',
        timestamp: now,
        payloadHash: crypto.createHash('sha256').update(JSON.stringify(req.body)).digest('hex')
      };
      await persistentDb.addAuditEvent(auditEvent);

      res.status(201).json({
        envelopeId,
        uri: `/v2.1/accounts/${accountId}/envelopes/${envelopeId}`,
        statusDateTime: now,
        status: envelope.status === 'draft' ? 'created' : 'sent'
      });
    } catch (err: any) {
      console.error('[DocuSignAdapter] Create Envelope Error:', err);
      res.status(500).json({
        errorCode: 'INTERNAL_ERROR',
        message: err.message || 'Failed to create envelope'
      });
    }
  });

  // ==========================================
  // 2. Get Single Envelope Metadata
  // GET /v2.1/accounts/:accountId/envelopes/:envelopeId
  // ==========================================
  router.get('/:accountId/envelopes/:envelopeId', async (req: Request, res: Response) => {
    const { accountId, envelopeId } = req.params;
    const envelope = envelopeStore.get(envelopeId) || persistentDb.getEnvelope(envelopeId);

    if (!envelope) {
      return res.status(404).json({
        errorCode: 'ENVELOPE_DOES_NOT_EXIST',
        message: `The envelope ${envelopeId} does not exist.`
      });
    }

    res.json({
      envelopeId: envelope.id,
      status: envelope.status === 'draft' ? 'created' : envelope.status,
      statusDateTime: envelope.updatedAt,
      createdDateTime: envelope.createdAt,
      sentDateTime: envelope.createdAt,
      completedDateTime: envelope.completedAt || null,
      emailSubject: envelope.title,
      recipientsUri: `/v2.1/accounts/${accountId}/envelopes/${envelope.id}/recipients`,
      documentsUri: `/v2.1/accounts/${accountId}/envelopes/${envelope.id}/documents`,
      customFieldsUri: `/v2.1/accounts/${accountId}/envelopes/${envelope.id}/custom_fields`,
      certificateOfCompletionUri: `/v2.1/accounts/${accountId}/envelopes/${envelope.id}/documents/certificate`,
      envelopeUri: `/v2.1/accounts/${accountId}/envelopes/${envelope.id}`
    });
  });

  // ==========================================
  // 3. Get Envelope Recipients
  // GET /v2.1/accounts/:accountId/envelopes/:envelopeId/recipients
  // ==========================================
  router.get('/:accountId/envelopes/:envelopeId/recipients', (req: Request, res: Response) => {
    const { envelopeId } = req.params;
    const envelope = envelopeStore.get(envelopeId) || persistentDb.getEnvelope(envelopeId);

    if (!envelope) {
      return res.status(404).json({
        errorCode: 'ENVELOPE_DOES_NOT_EXIST',
        message: `Envelope ${envelopeId} not found`
      });
    }

    const signers = (envelope.recipients || [])
      .filter((r: EnvelopeRecipient) => r.role === 'signer')
      .map((r: EnvelopeRecipient) => ({
        recipientId: r.id,
        name: r.name,
        email: r.email,
        routingOrder: String(r.routingOrder),
        status: r.status === 'signed' ? 'completed' : r.status === 'ready' ? 'delivered' : 'sent',
        signedDateTime: r.signedAt || null
      }));

    const carbonCopies = (envelope.recipients || [])
      .filter((r: EnvelopeRecipient) => r.role === 'cc')
      .map((r: EnvelopeRecipient) => ({
        recipientId: r.id,
        name: r.name,
        email: r.email,
        routingOrder: String(r.routingOrder),
        status: 'completed'
      }));

    res.json({
      signers,
      carbonCopies,
      recipientCount: String(envelope.recipients ? envelope.recipients.length : 0)
    });
  });

  // ==========================================
  // 4. List Documents in Envelope
  // GET /v2.1/accounts/:accountId/envelopes/:envelopeId/documents
  // ==========================================
  router.get('/:accountId/envelopes/:envelopeId/documents', async (req: Request, res: Response) => {
    const { accountId, envelopeId } = req.params;
    const envelope = envelopeStore.get(envelopeId) || persistentDb.getEnvelope(envelopeId);

    if (!envelope) {
      return res.status(404).json({
        errorCode: 'ENVELOPE_DOES_NOT_EXIST',
        message: `Envelope ${envelopeId} not found`
      });
    }

    const storedDocs = persistentDb.listDocumentsForEnvelope(envelopeId);
    const envelopeDocuments = [];

    if (storedDocs.length > 0) {
      storedDocs.forEach((d, idx) => {
        envelopeDocuments.push({
          documentId: d.id,
          name: d.name,
          type: 'content',
          order: String(idx + 1),
          uri: `/v2.1/accounts/${accountId}/envelopes/${envelopeId}/documents/${d.id}`
        });
      });
    } else {
      envelopeDocuments.push({
        documentId: '1',
        name: `${envelope.title}.pdf`,
        type: 'content',
        order: '1',
        uri: `/v2.1/accounts/${accountId}/envelopes/${envelopeId}/documents/1`
      });
    }

    // Add virtual combined & certificate documents
    envelopeDocuments.push({
      documentId: 'combined',
      name: 'Combined Document',
      type: 'content',
      order: String(envelopeDocuments.length + 1),
      uri: `/v2.1/accounts/${accountId}/envelopes/${envelopeId}/documents/combined`
    });

    envelopeDocuments.push({
      documentId: 'certificate',
      name: 'Summary',
      type: 'summary',
      order: String(envelopeDocuments.length + 2),
      uri: `/v2.1/accounts/${accountId}/envelopes/${envelopeId}/documents/certificate`
    });

    res.json({
      envelopeId,
      envelopeDocuments
    });
  });

  // ==========================================
  // 5. Download Document Stream
  // GET /v2.1/accounts/:accountId/envelopes/:envelopeId/documents/:documentId
  // ==========================================
  router.get('/:accountId/envelopes/:envelopeId/documents/:documentId', async (req: Request, res: Response) => {
    try {
      const { envelopeId, documentId } = req.params;
      const envelope = envelopeStore.get(envelopeId) || persistentDb.getEnvelope(envelopeId);

      if (!envelope) {
        return res.status(404).json({
          errorCode: 'ENVELOPE_DOES_NOT_EXIST',
          message: `Envelope ${envelopeId} not found`
        });
      }

      const pdfInfo = toPdfInfo(envelope);

      // Certificate of Completion
      if (documentId === 'certificate') {
        const certBuffer = await generateServerCertificatePdf(pdfInfo);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="CertificateOfCompletion_${envelopeId}.pdf"`);
        return res.send(certBuffer);
      }

      // Combined Document (Document + Certificate of Completion)
      if (documentId === 'combined') {
        const storedDocs = persistentDb.listDocumentsForEnvelope(envelopeId);
        let baseBuffer: Buffer | null = null;
        if (storedDocs.length > 0) {
          const obj = await storageEngine.getObject(storedDocs[0].storageKey);
          if (obj) baseBuffer = obj.data;
        }

        const combinedBuffer = await createCombinedFlattenedPdf(baseBuffer, pdfInfo);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${envelope.title.replace(/[^a-zA-Z0-9_\-]/g, '_')}_Signed.pdf"`);
        return res.send(combinedBuffer);
      }

      // Individual Document by ID
      const storedDocs = persistentDb.listDocumentsForEnvelope(envelopeId);
      const targetDoc = storedDocs.find(d => d.id === documentId);
      if (targetDoc) {
        const obj = await storageEngine.getObject(targetDoc.storageKey);
        if (obj) {
          res.setHeader('Content-Type', obj.metadata.contentType || 'application/pdf');
          res.setHeader('Content-Disposition', `inline; filename="${targetDoc.name}"`);
          return res.send(obj.data);
        }
      }

      // Fallback: Generate flattened vector document with Certificate
      const fallbackBuffer = await createCombinedFlattenedPdf(null, pdfInfo);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="Document_${documentId}.pdf"`);
      return res.send(fallbackBuffer);
    } catch (err: any) {
      console.error('[DocuSignAdapter] Download Document Error:', err);
      res.status(500).json({
        errorCode: 'DOWNLOAD_FAILED',
        message: err.message || 'Failed to download document'
      });
    }
  });

  // ==========================================
  // 6. Recipient View (Embedded Signing Ceremony)
  // POST /v2.1/accounts/:accountId/envelopes/:envelopeId/views/recipient
  // ==========================================
  router.post('/:accountId/envelopes/:envelopeId/views/recipient', (req: Request, res: Response) => {
    const { envelopeId } = req.params;
    const { 
      recipientId, 
      userName, 
      email, 
      clientUserId, 
      returnUrl = '' 
    } = req.body;

    const envelope = envelopeStore.get(envelopeId) || persistentDb.getEnvelope(envelopeId);
    if (!envelope) {
      return res.status(404).json({
        errorCode: 'ENVELOPE_DOES_NOT_EXIST',
        message: `Envelope ${envelopeId} not found`
      });
    }

    // Match recipient
    let matchedRec = null;
    const docusignMap = persistentDb.getDocusignMapping(envelopeId);

    if (clientUserId && docusignMap && docusignMap.clientUserIdMap[clientUserId]) {
      const targetId = docusignMap.clientUserIdMap[clientUserId];
      matchedRec = (envelope.recipients || []).find((r: EnvelopeRecipient) => r.id === targetId);
    }

    if (!matchedRec && recipientId) {
      matchedRec = (envelope.recipients || []).find((r: EnvelopeRecipient) => r.id === String(recipientId));
    }

    if (!matchedRec && email) {
      matchedRec = (envelope.recipients || []).find((r: EnvelopeRecipient) => r.email.toLowerCase() === String(email).toLowerCase());
    }

    if (!matchedRec && (envelope.recipients || []).length > 0) {
      matchedRec = envelope.recipients[0];
    }

    const host = req.get('host') || 'localhost:5173';
    const protocol = req.protocol || 'http';
    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173';

    const signingUrl = `${frontendBase}/?sign=${envelopeId}&signer=${matchedRec ? matchedRec.id : 'rec-1'}${returnUrl ? `&returnUrl=${encodeURIComponent(returnUrl)}` : ''}`;

    res.json({
      url: signingUrl
    });
  });

  // ==========================================
  // 7. Audit Events
  // GET /v2.1/accounts/:accountId/envelopes/:envelopeId/audit_events
  // ==========================================
  router.get('/:accountId/envelopes/:envelopeId/audit_events', (req: Request, res: Response) => {
    const { envelopeId } = req.params;
    const envelope = envelopeStore.get(envelopeId) || persistentDb.getEnvelope(envelopeId);

    if (!envelope) {
      return res.status(404).json({
        errorCode: 'ENVELOPE_DOES_NOT_EXIST',
        message: `Envelope ${envelopeId} not found`
      });
    }

    const events = persistentDb.listAuditEvents(envelopeId);
    const auditEvents = [];

    // If events exist in DB, format as DocuSign audit events
    if (events.length > 0) {
      events.forEach(e => {
        auditEvents.push({
          eventFields: [
            { name: 'logTime', value: e.timestamp },
            { name: 'Action', value: e.eventType },
            { name: 'UserName', value: e.actorName },
            { name: 'UserEmail', value: e.actorEmail },
            { name: 'IpAddress', value: e.ipAddress },
            { name: 'Hash', value: e.payloadHash }
          ]
        });
      });
    } else {
      auditEvents.push({
        eventFields: [
          { name: 'logTime', value: envelope.createdAt },
          { name: 'Action', value: 'Envelope Created' },
          { name: 'UserName', value: envelope.senderName },
          { name: 'UserEmail', value: envelope.senderEmail }
        ]
      });
    }

    res.json({
      auditEvents
    });
  });

  // ==========================================
  // 8. Void / Update Envelope Status
  // PUT /v2.1/accounts/:accountId/envelopes/:envelopeId/status
  // ==========================================
  router.put('/:accountId/envelopes/:envelopeId/status', async (req: Request, res: Response) => {
    const { envelopeId } = req.params;
    const { status, voidedReason } = req.body;

    const updated = envelopeStore.update(envelopeId, {
      status: status === 'voided' ? 'voided' : status
    });

    if (!updated) {
      return res.status(404).json({
        errorCode: 'ENVELOPE_DOES_NOT_EXIST',
        message: `Envelope ${envelopeId} not found`
      });
    }

    await persistentDb.saveEnvelope(updated);

    res.json({
      envelopeId,
      status: updated.status,
      voidedReason: voidedReason || null
    });
  });

  return router;
}

export function createDocusignOAuthRouter(): Router {
  const router = Router();

  // GET /oauth/userinfo
  router.get('/userinfo', (req: Request, res: Response) => {
    res.json({
      sub: 'usr-enterprise-2026',
      name: 'SignFlow Enterprise Administrator',
      given_name: 'SignFlow',
      family_name: 'Admin',
      email: 'admin@signflow.ai',
      accounts: [
        {
          account_id: 'acc-enterprise-01',
          is_default: true,
          account_name: 'SignFlow Enterprise Master Account',
          base_uri: `http://localhost:${process.env.PORT || 8090}`
        }
      ]
    });
  });

  // POST /oauth/token
  router.post('/token', (_req: Request, res: Response) => {
    res.json({
      access_token: 'signflow-docusign-compatible-bearer-token-2026',
      token_type: 'Bearer',
      expires_in: 28800,
      scope: 'signature extended'
    });
  });

  return router;
}
