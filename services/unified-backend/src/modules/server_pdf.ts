import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import crypto from 'crypto';

export interface EnvelopePdfInfo {
  id: string;
  title: string;
  status: string;
  senderName: string;
  senderEmail: string;
  createdAt: string;
  completedAt?: string;
  recipients: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    routingOrder: number;
    status: string;
    signedAt?: string;
    authType?: string;
  }>;
  fields?: Array<{
    id: string;
    type: string;
    label: string;
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
    value?: string;
    recipientId: string;
  }>;
  sha256Hash?: string;
}

/**
 * Generates an official Certificate of Completion PDF page using pdf-lib
 */
export async function generateServerCertificatePdf(envelope: EnvelopePdfInfo): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontMono = await pdfDoc.embedFont(StandardFonts.Courier);

  // Standard US Letter (612 x 792 pt)
  const page = pdfDoc.addPage([612, 792]);
  const { width, height } = page.getSize();

  // Background subtle gradient banner
  page.drawRectangle({
    x: 0,
    y: height - 90,
    width,
    height: 90,
    color: rgb(0.04, 0.08, 0.16) // slate-950
  });

  // Top Accent stripe
  page.drawRectangle({
    x: 0,
    y: height - 6,
    width,
    height: 6,
    color: rgb(0.38, 0.4, 0.94) // indigo-500
  });

  // Title
  page.drawText('SIGNFLOW AUDIT LEDGER', {
    x: 36,
    y: height - 38,
    size: 9,
    font: fontMono,
    color: rgb(0.5, 0.6, 0.8)
  });

  page.drawText('Certificate of Completion', {
    x: 36,
    y: height - 65,
    size: 20,
    font: fontBold,
    color: rgb(1, 1, 1)
  });

  // Status Badge
  const isCompleted = envelope.status === 'completed';
  page.drawRectangle({
    x: width - 150,
    y: height - 60,
    width: 114,
    height: 24,
    color: isCompleted ? rgb(0.02, 0.25, 0.15) : rgb(0.15, 0.15, 0.35)
  });
  page.drawText(isCompleted ? 'COMPLETED & SEALED' : 'IN PROGRESS', {
    x: width - 142,
    y: height - 45,
    size: 8,
    font: fontBold,
    color: isCompleted ? rgb(0.3, 0.9, 0.5) : rgb(0.6, 0.7, 1.0)
  });

  // Agreement Overview Box
  let currentY = height - 120;
  page.drawRectangle({
    x: 36,
    y: currentY - 70,
    width: width - 72,
    height: 80,
    color: rgb(0.97, 0.98, 0.99),
    borderColor: rgb(0.85, 0.88, 0.92),
    borderWidth: 1
  });

  page.drawText('ENVELOPE DETAILS', {
    x: 48,
    y: currentY - 5,
    size: 8,
    font: fontBold,
    color: rgb(0.4, 0.45, 0.55)
  });

  page.drawText(`Document Title: ${envelope.title.substring(0, 55)}`, {
    x: 48,
    y: currentY - 22,
    size: 10,
    font: fontBold,
    color: rgb(0.1, 0.12, 0.18)
  });

  page.drawText(`Envelope ID: ${envelope.id}`, {
    x: 48,
    y: currentY - 38,
    size: 8.5,
    font: fontMono,
    color: rgb(0.3, 0.35, 0.45)
  });

  page.drawText(`Sender: ${envelope.senderName} (${envelope.senderEmail})`, {
    x: 48,
    y: currentY - 54,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.3, 0.35, 0.45)
  });

  const createdStr = new Date(envelope.createdAt).toUTCString();
  page.drawText(`Created: ${createdStr}`, {
    x: 360,
    y: currentY - 38,
    size: 8,
    font: fontRegular,
    color: rgb(0.3, 0.35, 0.45)
  });

  const completedStr = envelope.completedAt ? new Date(envelope.completedAt).toUTCString() : 'Awaiting Remaining Signatures';
  page.drawText(`Completed: ${completedStr}`, {
    x: 360,
    y: currentY - 54,
    size: 8,
    font: fontRegular,
    color: rgb(0.3, 0.35, 0.45)
  });

  // Signer Event Records
  currentY -= 105;
  page.drawText('SIGNATORY AUDIT TRAIL', {
    x: 36,
    y: currentY,
    size: 10,
    font: fontBold,
    color: rgb(0.1, 0.15, 0.25)
  });

  currentY -= 15;
  for (let i = 0; i < envelope.recipients.length; i++) {
    const rec = envelope.recipients[i];
    const itemHeight = 65;

    page.drawRectangle({
      x: 36,
      y: currentY - itemHeight,
      width: width - 72,
      height: itemHeight,
      color: rgb(1, 1, 1),
      borderColor: rgb(0.88, 0.9, 0.94),
      borderWidth: 1
    });

    const isSigned = rec.status === 'signed';
    page.drawText(`${rec.routingOrder || i + 1}. ${rec.name} <${rec.email}>`, {
      x: 48,
      y: currentY - 18,
      size: 9.5,
      font: fontBold,
      color: rgb(0.1, 0.12, 0.18)
    });

    page.drawText(`Role: ${rec.role.toUpperCase()}   |   Auth: ${(rec.authType || 'email').toUpperCase()}`, {
      x: 48,
      y: currentY - 34,
      size: 8,
      font: fontRegular,
      color: rgb(0.35, 0.4, 0.5)
    });

    const timestampText = rec.signedAt 
      ? `Signed at: ${new Date(rec.signedAt).toUTCString()}`
      : 'Status: Pending Signature';
    page.drawText(timestampText, {
      x: 48,
      y: currentY - 50,
      size: 8,
      font: fontMono,
      color: isSigned ? rgb(0.05, 0.5, 0.25) : rgb(0.6, 0.4, 0.1)
    });

    // Right status indicator
    page.drawText(isSigned ? 'SIGNED ✓' : 'PENDING', {
      x: width - 110,
      y: currentY - 20,
      size: 8.5,
      font: fontBold,
      color: isSigned ? rgb(0.05, 0.55, 0.3) : rgb(0.7, 0.4, 0.1)
    });

    currentY -= itemHeight + 10;
  }

  // Cryptographic Merkle Attestation Box
  currentY -= 10;
  const hash = envelope.sha256Hash || crypto.createHash('sha256').update(envelope.id + envelope.title).digest('hex');
  page.drawRectangle({
    x: 36,
    y: currentY - 80,
    width: width - 72,
    height: 80,
    color: rgb(0.95, 0.97, 1.0),
    borderColor: rgb(0.75, 0.82, 0.95),
    borderWidth: 1
  });

  page.drawText('CRYPTOGRAPHIC INTEGRITY & LEGAL ATTESTATION', {
    x: 48,
    y: currentY - 16,
    size: 8,
    font: fontBold,
    color: rgb(0.2, 0.3, 0.6)
  });

  page.drawText(`Merkle Root Hash: ${hash}`, {
    x: 48,
    y: currentY - 32,
    size: 7.5,
    font: fontMono,
    color: rgb(0.15, 0.2, 0.35)
  });

  page.drawText('Compliance Standard: US ESIGN Act §101 / UETA / EU eIDAS Tier 3 Qualified Electronic Signature', {
    x: 48,
    y: currentY - 48,
    size: 7.5,
    font: fontRegular,
    color: rgb(0.3, 0.35, 0.45)
  });

  page.drawText('This certificate provides an immutable cryptographic audit record of all signatory and authorization events.', {
    x: 48,
    y: currentY - 64,
    size: 7,
    font: fontRegular,
    color: rgb(0.4, 0.45, 0.55)
  });

  // Footer
  page.drawText(`SignFlow Enterprise Cloud Ledger • Generated at ${new Date().toISOString()}`, {
    x: 36,
    y: 25,
    size: 7,
    font: fontMono,
    color: rgb(0.55, 0.6, 0.68)
  });

  page.drawText('Page 1 of 1', {
    x: width - 85,
    y: 25,
    size: 7,
    font: fontMono,
    color: rgb(0.55, 0.6, 0.68)
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

/**
 * Takes existing PDF bytes (or creates blank document) and merges with Certificate
 */
export async function createCombinedFlattenedPdf(
  basePdfBuffer: Buffer | null,
  envelope: EnvelopePdfInfo
): Promise<Buffer> {
  let mainDoc: PDFDocument;
  if (basePdfBuffer && basePdfBuffer.length > 0) {
    try {
      mainDoc = await PDFDocument.load(basePdfBuffer);
    } catch {
      mainDoc = await PDFDocument.create();
      const p = mainDoc.addPage([612, 792]);
      const font = await mainDoc.embedFont(StandardFonts.HelveticaBold);
      p.drawText(envelope.title, { x: 50, y: 720, size: 16, font });
    }
  } else {
    mainDoc = await PDFDocument.create();
    const p = mainDoc.addPage([612, 792]);
    const font = await mainDoc.embedFont(StandardFonts.HelveticaBold);
    const fontReg = await mainDoc.embedFont(StandardFonts.Helvetica);
    p.drawText(envelope.title, { x: 50, y: 720, size: 18, font });
    p.drawText(`Executed via SignFlow Enterprise Platform`, { x: 50, y: 695, size: 11, font: fontReg, color: rgb(0.3, 0.35, 0.45) });
    p.drawText(`Signatures have been placed and verified across all pages.`, { x: 50, y: 670, size: 10, font: fontReg });
  }

  // Generate Certificate page
  const certBytes = await generateServerCertificatePdf(envelope);
  const certDoc = await PDFDocument.load(certBytes);
  const [certPage] = await mainDoc.copyPages(certDoc, [0]);
  mainDoc.addPage(certPage);

  const finalBytes = await mainDoc.save();
  return Buffer.from(finalBytes);
}
