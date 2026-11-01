async function unzipEntry(buffer, targetName) {
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);
  let offset = 0;

  while (offset < buffer.byteLength - 30) {
    // Check for PK\x03\x04
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
        } else if (compression === 8) {
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
  return null;
}

console.log("Unzip function defined successfully");
