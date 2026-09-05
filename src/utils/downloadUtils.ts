/**
 * Production-Grade Browser File Downloader & CSV/JSON Serializer
 * Guarantees correct filename preservation and strict RFC-4180 CSV serialization.
 */

/**
 * Sanitizes filenames to eliminate illegal OS filesystem characters (Windows NTFS / macOS / Linux)
 */
export function sanitizeFilename(filename: string, defaultExt?: string): string {
  if (!filename || typeof filename !== 'string') {
    filename = `export_${Date.now()}`;
  }

  // Remove illegal characters: \ / : * ? " < > | and newlines
  let clean = filename.replace(/[\\/:*?"<>|\r\n\t]+/g, '-').trim();
  // Replace consecutive whitespace with underscores and collapse multiple hyphens
  clean = clean.replace(/\s+/g, '_').replace(/-+/g, '-');
  // Remove leading/trailing periods
  clean = clean.replace(/^\.+|\.+$/g, '');

  if (defaultExt) {
    const ext = defaultExt.startsWith('.') ? defaultExt.toLowerCase() : `.${defaultExt.toLowerCase()}`;
    if (!clean.toLowerCase().endsWith(ext)) {
      clean = `${clean}${ext}`;
    }
  }

  return clean || `export_${Date.now()}${defaultExt ? (defaultExt.startsWith('.') ? defaultExt : `.${defaultExt}`) : ''}`;
}

/**
 * Generates an RFC-4180 compliant CSV string with UTF-8 BOM for Microsoft Excel / Sheets compatibility
 */
export function generateCsvString(csvRows: (string | number)[][]): string {
  const bom = '\uFEFF'; // UTF-8 Byte Order Mark for Excel
  return bom + csvRows
    .map(row => 
      row.map(cell => {
        const str = (cell === null || cell === undefined ? '' : String(cell)).replace(/"/g, '""');
        return `"${str}"`;
      }).join(',')
    )
    .join('\r\n');
}

/**
 * Robust cross-browser file download trigger using standard W3C Blob and URL.createObjectURL
 */
export function downloadFile(filename: string, content: string, mimeType: string = 'text/plain;charset=utf-8') {
  const cleanFilename = sanitizeFilename(filename);

  try {
    const blob = new Blob([content], { type: mimeType });

    // Legacy Edge / IE fallback
    if (typeof (window.navigator as any)?.msSaveOrOpenBlob === 'function') {
      (window.navigator as any).msSaveOrOpenBlob(blob, cleanFilename);
      return;
    }

    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = cleanFilename;
    link.setAttribute('download', cleanFilename);
    link.setAttribute('type', mimeType);
    link.style.display = 'none';
    link.rel = 'noopener';

    document.body.appendChild(link);
    
    // Synthetic MouseEvent click dispatch
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    link.dispatchEvent(clickEvent);

    // Clean up DOM and revoke Blob object URL after download queue registers
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      window.URL.revokeObjectURL(objectUrl);
    }, 2500);
  } catch (err) {
    console.error('Blob download failed, falling back to data URI:', err);
    const encoded = `data:${mimeType},${encodeURIComponent(content)}`;
    const fallbackLink = document.createElement('a');
    fallbackLink.href = encoded;
    fallbackLink.download = cleanFilename;
    fallbackLink.style.display = 'none';
    document.body.appendChild(fallbackLink);
    fallbackLink.click();
    setTimeout(() => {
      if (document.body.contains(fallbackLink)) {
        document.body.removeChild(fallbackLink);
      }
    }, 1000);
  }
}

/**
 * Download structured CSV file with UTF-8 BOM for 100% Excel / Google Sheets compatibility
 */
export function downloadCsvFile(filename: string, csvRows: (string | number)[][]) {
  const csvContent = generateCsvString(csvRows);
  const cleanFilename = sanitizeFilename(filename, '.csv');
  downloadFile(cleanFilename, csvContent, 'text/csv;charset=utf-8');
}

/**
 * Download formatted JSON evidence bundle
 */
export function downloadJsonBundle(filename: string, data: any) {
  const formattedJson = JSON.stringify(data, null, 2);
  const cleanFilename = sanitizeFilename(filename, '.json');
  downloadFile(cleanFilename, formattedJson, 'application/json;charset=utf-8');
}
