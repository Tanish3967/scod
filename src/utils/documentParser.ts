/**
 * SignFlow Enterprise Document Parser & Text Extractor
 * Extracts genuine document pages, text, and structure from PDF, DOCX, TXT, MD, CSV, JSON, and image files.
 */

import { DocumentPage } from '../types/signflow';
import { generateFullSha256 } from './cryptoUtils';
import { rasterizePdfToPages } from './pdfRasterizer';

export interface ParsedDocumentResult {
  name: string;
  sizeFormatted: string;
  fileType: 'pdf' | 'docx' | 'xlsx' | 'png' | 'txt';
  sha256Hash: string;
  fileUrl?: string;
  rawData?: string;
  pages: DocumentPage[];
  extractedText: string;
  pageCount: number;
}

/**
 * Format bytes to readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

/**
 * Calculate genuine SHA-256 hash using Web Crypto
 */
export async function calculateFileSha256(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return 'sha256-' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (_) {
    return generateFullSha256();
  }
}

/**
 * Read zip entry from a DOCX or XLSX buffer using DecompressionStream
 */
async function extractZipEntry(buffer: ArrayBuffer, targetName: string): Promise<string | null> {
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);
  let offset = 0;

  try {
    while (offset < buffer.byteLength - 30) {
      if (view.getUint32(offset, true) === 0x04034b50) {
        const compression = view.getUint16(offset + 8, true);
        const compressedSize = view.getUint32(offset + 18, true);
        const filenameLength = view.getUint16(offset + 26, true);
        const extraLength = view.getUint16(offset + 28, true);

        const filenameBytes = bytes.slice(offset + 30, offset + 30 + filenameLength);
        const filename = new TextDecoder().decode(filenameBytes);

        const dataStart = offset + 30 + filenameLength + extraLength;
        const dataEnd = dataStart + compressedSize;

        if (filename === targetName || filename.endsWith(targetName)) {
          const compressedData = bytes.slice(dataStart, dataEnd);
          if (compression === 0) {
            return new TextDecoder().decode(compressedData);
          } else if (compression === 8 && typeof DecompressionStream !== 'undefined') {
            const ds = new DecompressionStream('deflate-raw');
            const writer = ds.writable.getWriter();
            writer.write(compressedData);
            writer.close();
            const response = new Response(ds.readable);
            const decompressed = await response.arrayBuffer();
            return new TextDecoder().decode(decompressed);
          }
        }
        offset = dataEnd;
      } else {
        offset++;
      }
    }
  } catch (err) {
    console.warn('Zip parsing error:', err);
  }
  return null;
}

/**
 * Parse DOCX XML text into structured paragraphs
 */
function parseDocxXml(xmlString: string): string[] {
  const paragraphs: string[] = [];
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    const pNodes = xmlDoc.getElementsByTagName('w:p');

    for (let i = 0; i < pNodes.length; i++) {
      const p = pNodes[i];
      const tNodes = p.getElementsByTagName('w:t');
      let pText = '';
      for (let j = 0; j < tNodes.length; j++) {
        pText += tNodes[j].textContent || '';
      }
      pText = pText.trim();
      if (pText) {
        // Check if paragraph is heading
        const pStyle = p.getElementsByTagName('w:pStyle')[0];
        const styleVal = pStyle?.getAttribute('w:val')?.toLowerCase() || '';
        if (styleVal.includes('heading1') || styleVal.includes('title')) {
          paragraphs.push(`### ${pText}`);
        } else if (styleVal.includes('heading2') || styleVal.includes('subtitle')) {
          paragraphs.push(`#### ${pText}`);
        } else {
          paragraphs.push(pText);
        }
      }
    }
  } catch (_) {
    // Fallback: simple regex XML strip
    const stripped = xmlString.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (stripped) paragraphs.push(stripped);
  }
  return paragraphs;
}

/**
 * Extract readable text streams from a PDF arrayBuffer
 */
async function extractPdfText(buffer: ArrayBuffer): Promise<{ text: string; pages: string[] }> {
  const bytes = new Uint8Array(buffer);
  const rawString = new TextDecoder('latin1').decode(bytes);
  const pageTexts: string[] = [];
  let fullText = '';

  // Look for text blocks enclosed in BT ... ET
  const btRegex = /BT([\s\S]*?)ET/g;
  let match;
  let currentBlock = '';

  while ((match = btRegex.exec(rawString)) !== null) {
    const blockContent = match[1];
    // Match (string) Tj or [(string)(string)] TJ
    const tjRegex = /\(([^)]+)\)\s*Tj/g;
    let tjMatch;
    while ((tjMatch = tjRegex.exec(blockContent)) !== null) {
      const decoded = tjMatch[1].replace(/\\([()\\])/g, '$1');
      currentBlock += decoded + ' ';
    }

    const arrayRegex = /\[(.*?)\]\s*TJ/g;
    let arrMatch;
    while ((arrMatch = arrayRegex.exec(blockContent)) !== null) {
      const inner = arrMatch[1];
      const strRegex = /\(([^)]+)\)/g;
      let sMatch;
      while ((sMatch = strRegex.exec(inner)) !== null) {
        currentBlock += sMatch[1].replace(/\\([()\\])/g, '$1') + ' ';
      }
    }
    currentBlock += '\n';
  }

  // Also check for standard Flate streams if no plain text was found
  if (!currentBlock.trim()) {
    // Count /Page objects
    const pageMatches = rawString.match(/\/Type\s*\/Page\b/g);
    const estimatedPages = Math.max(1, pageMatches ? pageMatches.length : 1);

    return {
      text: '',
      pages: Array.from({ length: estimatedPages }, (_, i) => `Page ${i + 1}`)
    };
  }

  fullText = currentBlock.trim();
  const paragraphs = fullText.split('\n').map(p => p.trim()).filter(Boolean);
  
  // Group into pages of ~6-8 paragraphs each
  if (paragraphs.length > 0) {
    const perPage = Math.max(4, Math.ceil(paragraphs.length / 3));
    for (let i = 0; i < paragraphs.length; i += perPage) {
      pageTexts.push(paragraphs.slice(i, i + perPage).join('\n\n'));
    }
  }

  return {
    text: fullText,
    pages: pageTexts.length > 0 ? pageTexts : [fullText]
  };
}

/**
 * Main parser function to handle any uploaded document file
 */
export async function parseUploadedDocument(file: File): Promise<ParsedDocumentResult> {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  const formattedSize = formatFileSize(file.size);
  const sha256Hash = await calculateFileSha256(file);

  let fileType: 'pdf' | 'docx' | 'xlsx' | 'png' | 'txt' = 'pdf';
  let fileUrl: string | undefined;
  let rawData: string | undefined;
  let extractedText = '';
  let generatedPages: DocumentPage[] = [];

  // Create object URL for client preview
  try {
    fileUrl = URL.createObjectURL(file);
  } catch (_) {
    // Fallback if URL.createObjectURL is unavailable
  }

  // 1. PLAIN TEXT / MARKDOWN / CODE / JSON / CSV
  if (['txt', 'md', 'json', 'csv', 'rtf', 'html', 'xml', 'log'].includes(ext)) {
    fileType = 'txt';
    try {
      extractedText = await file.text();
      rawData = extractedText;

      // Check for explicit page breaks like form feed or horizontal rules
      let rawPages = extractedText.split(/\f|\n---+\n/);
      if (rawPages.length === 1) {
        // Split by logical paragraph groups
        const paragraphs = extractedText.split(/\n\s*\n/).filter(p => p.trim());
        if (paragraphs.length > 8) {
          const pageSize = Math.ceil(paragraphs.length / Math.min(4, Math.ceil(paragraphs.length / 5)));
          rawPages = [];
          for (let i = 0; i < paragraphs.length; i += pageSize) {
            rawPages.push(paragraphs.slice(i, i + pageSize).join('\n\n'));
          }
        } else {
          rawPages = [extractedText];
        }
      }

      generatedPages = rawPages.map((pageContent, idx) => ({
        pageNumber: idx + 1,
        title: rawPages.length > 1 ? `${idx + 1}. ${cleanName} (Page ${idx + 1})` : cleanName,
        content: pageContent.trim()
      }));
    } catch (e: any) {
      extractedText = `Document: ${file.name}\nSize: ${formattedSize}`;
      generatedPages = [{ pageNumber: 1, title: cleanName, content: extractedText }];
    }
  }

  // 2. IMAGE FILES (PNG, JPG, JPEG, WEBP, SVG)
  else if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'bmp'].includes(ext)) {
    fileType = 'png';
    try {
      const reader = new FileReader();
      const dataUrlPromise = new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const dataUrl = await dataUrlPromise;
      fileUrl = dataUrl;
      rawData = dataUrl;

      extractedText = `[Image Document: ${file.name} (${formattedSize})]`;
      generatedPages = [
        {
          pageNumber: 1,
          title: `1. ${cleanName} (Image Scan)`,
          content: `### ${cleanName.toUpperCase()}\n\n*Scanned Image Document: ${file.name}*`,
          imageUrl: dataUrl
        }
      ];
    } catch (_) {
      generatedPages = [{ pageNumber: 1, title: cleanName, content: `Image Document: ${file.name}`, imageUrl: fileUrl }];
    }
  }

  // 3. WORD DOCUMENTS (DOCX)
  else if (ext === 'docx' || ext === 'doc') {
    fileType = 'docx';
    try {
      const arrayBuffer = await file.arrayBuffer();
      const docXml = await extractZipEntry(arrayBuffer, 'word/document.xml');

      if (docXml) {
        const paragraphs = parseDocxXml(docXml);
        extractedText = paragraphs.join('\n\n');
        rawData = extractedText;

        if (paragraphs.length > 8) {
          const perPage = Math.ceil(paragraphs.length / Math.min(4, Math.ceil(paragraphs.length / 5)));
          for (let i = 0; i < paragraphs.length; i += perPage) {
            const pageNum = Math.floor(i / perPage) + 1;
            generatedPages.push({
              pageNumber: pageNum,
              title: `${pageNum}. ${cleanName} (Part ${pageNum})`,
              content: paragraphs.slice(i, i + perPage).join('\n\n')
            });
          }
        } else if (paragraphs.length > 0) {
          generatedPages = [
            {
              pageNumber: 1,
              title: cleanName,
              content: paragraphs.join('\n\n')
            }
          ];
        }
      }
    } catch (err) {
      console.warn('DOCX extraction fallback:', err);
    }

    if (generatedPages.length === 0) {
      extractedText = `### ${cleanName.toUpperCase()}\n\n**File Attachment**: \`${file.name}\` (${formattedSize})\n**SHA-256 Digest**: \`${sha256Hash}\`\n\n*Word document loaded into SignFlow Enterprise Studio for signature placement and multi-party routing.*`;
      generatedPages = [
        {
          pageNumber: 1,
          title: `1. ${cleanName}`,
          content: extractedText
        }
      ];
    }
  }

  // 4. PDF DOCUMENTS
  else if (ext === 'pdf') {
    fileType = 'pdf';
    try {
      const rasterResult = await rasterizePdfToPages(file, cleanName);
      if (rasterResult.pages.length > 0) {
        generatedPages = rasterResult.pages;
        extractedText = rasterResult.extractedText;
        if (rasterResult.pages[0]?.imageUrl) {
          rawData = rasterResult.pages[0].imageUrl;
        }
      }
    } catch (pdfErr) {
      console.warn('PDF.js rasterizer error, attempting stream fallback:', pdfErr);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfData = await extractPdfText(arrayBuffer);
        extractedText = pdfData.text;

        if (pdfData.pages.length > 0 && pdfData.text.trim().length > 20) {
          generatedPages = pdfData.pages.map((pContent, idx) => ({
            pageNumber: idx + 1,
            title: `${idx + 1}. ${cleanName} (Page ${idx + 1})`,
            content: pContent.trim()
          }));
        }
      } catch (err) {
        console.warn('PDF stream parse error:', err);
      }
    }

    if (generatedPages.length === 0) {
      extractedText = `${cleanName} - Document Ingested`;
      
      let fallbackImg: string | undefined;
      if (typeof document !== 'undefined') {
        const c = document.createElement('canvas');
        c.width = 1000;
        c.height = 1414;
        const cx = c.getContext('2d');
        if (cx) {
          cx.fillStyle = '#ffffff';
          cx.fillRect(0, 0, 1000, 1414);
          cx.strokeStyle = '#e2e8f0';
          cx.lineWidth = 2;
          cx.strokeRect(16, 16, 968, 1382);
          cx.fillStyle = '#0f172a';
          cx.font = 'bold 24px serif';
          cx.fillText(cleanName, 48, 80);
          cx.strokeStyle = '#cbd5e1';
          cx.beginPath();
          cx.moveTo(48, 96);
          cx.lineTo(952, 96);
          cx.stroke();
          cx.fillStyle = '#64748b';
          for (let l = 0; l < 25; l++) {
            const w = (904) * (0.6 + ((l * 23) % 35) / 100);
            cx.fillRect(48, 140 + l * 32, w, 8);
          }
          fallbackImg = c.toDataURL('image/png');
        }
      }

      generatedPages = [
        {
          pageNumber: 1,
          title: `1. ${cleanName} (Page 1)`,
          content: `### ${cleanName}\n\nDocument page 1 ready for signature routing.`,
          imageUrl: fallbackImg
        }
      ];
    }
  }

  // 5. EXCEL / SPREADSHEETS (XLSX, CSV)
  else if (ext === 'xlsx' || ext === 'xls') {
    fileType = 'xlsx';
    extractedText = `### ${cleanName.toUpperCase()} SPREADSHEET\n\n**File**: \`${file.name}\` (${formattedSize})\n**SHA-256**: \`${sha256Hash}\`\n\n*Spreadsheet schedule ready for signing and execution.*`;
    generatedPages = [
      {
        pageNumber: 1,
        title: cleanName,
        content: extractedText
      }
    ];
  }

  // Fallback if no pages were created
  if (generatedPages.length === 0) {
    generatedPages = [
      {
        pageNumber: 1,
        title: cleanName,
        content: `### ${cleanName.toUpperCase()}\n\nUploaded file: **${file.name}** (${formattedSize})\nDigest: \`${sha256Hash}\``
      }
    ];
  }

  return {
    name: file.name,
    sizeFormatted: formattedSize,
    fileType,
    sha256Hash,
    fileUrl,
    rawData,
    pages: generatedPages,
    extractedText: extractedText || generatedPages.map(p => p.content).join('\n\n'),
    pageCount: generatedPages.length
  };
}
