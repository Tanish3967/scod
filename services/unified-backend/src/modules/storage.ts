import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface StorageObjectMetadata {
  key: string;
  size: number;
  etag: string;
  contentType: string;
  updatedAt: string;
}

export interface StorageProvider {
  putObject(key: string, data: Buffer | Uint8Array | string, contentType?: string): Promise<StorageObjectMetadata>;
  getObject(key: string): Promise<{ data: Buffer; metadata: StorageObjectMetadata } | null>;
  deleteObject(key: string): Promise<boolean>;
  listObjects(prefix?: string): Promise<string[]>;
  hasObject(key: string): Promise<boolean>;
}

export class LocalStorageProvider implements StorageProvider {
  private baseDir: string;

  constructor(customBaseDir?: string) {
    this.baseDir = customBaseDir || path.resolve(process.cwd(), 'services/unified-backend/data/storage');
    if (!fs.existsSync(this.baseDir)) {
      try {
        fs.mkdirSync(this.baseDir, { recursive: true });
      } catch (err) {
        // Fallback for different working directories
        this.baseDir = path.resolve(process.cwd(), 'data/storage');
        fs.mkdirSync(this.baseDir, { recursive: true });
      }
    }
  }

  private getFilePath(key: string): string {
    const safeKey = key.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
    return path.join(this.baseDir, safeKey);
  }

  public async putObject(
    key: string, 
    data: Buffer | Uint8Array | string, 
    contentType: string = 'application/octet-stream'
  ): Promise<StorageObjectMetadata> {
    const buffer = Buffer.isBuffer(data) 
      ? data 
      : typeof data === 'string' 
        ? Buffer.from(data, 'utf-8') 
        : Buffer.from(data);

    const etag = crypto.createHash('sha256').update(buffer).digest('hex');
    const filePath = this.getFilePath(key);
    const metaPath = filePath + '.meta.json';

    await fs.promises.writeFile(filePath, buffer);
    const metadata: StorageObjectMetadata = {
      key,
      size: buffer.length,
      etag,
      contentType,
      updatedAt: new Date().toISOString()
    };
    await fs.promises.writeFile(metaPath, JSON.stringify(metadata, null, 2), 'utf-8');

    return metadata;
  }

  public async getObject(key: string): Promise<{ data: Buffer; metadata: StorageObjectMetadata } | null> {
    const filePath = this.getFilePath(key);
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const data = await fs.promises.readFile(filePath);
    const metaPath = filePath + '.meta.json';
    let metadata: StorageObjectMetadata;

    if (fs.existsSync(metaPath)) {
      try {
        metadata = JSON.parse(await fs.promises.readFile(metaPath, 'utf-8'));
      } catch {
        metadata = {
          key,
          size: data.length,
          etag: crypto.createHash('sha256').update(data).digest('hex'),
          contentType: 'application/octet-stream',
          updatedAt: new Date().toISOString()
        };
      }
    } else {
      metadata = {
        key,
        size: data.length,
        etag: crypto.createHash('sha256').update(data).digest('hex'),
        contentType: 'application/octet-stream',
        updatedAt: new Date().toISOString()
      };
    }

    return { data, metadata };
  }

  public async deleteObject(key: string): Promise<boolean> {
    const filePath = this.getFilePath(key);
    if (!fs.existsSync(filePath)) return false;

    await fs.promises.unlink(filePath);
    const metaPath = filePath + '.meta.json';
    if (fs.existsSync(metaPath)) {
      try {
        await fs.promises.unlink(metaPath);
      } catch {}
    }
    return true;
  }

  public async listObjects(prefix: string = ''): Promise<string[]> {
    if (!fs.existsSync(this.baseDir)) return [];
    const files = await fs.promises.readdir(this.baseDir);
    const objectFiles = files.filter(f => !f.endsWith('.meta.json'));
    if (!prefix) return objectFiles;
    return objectFiles.filter(f => f.startsWith(prefix));
  }

  public async hasObject(key: string): Promise<boolean> {
    const filePath = this.getFilePath(key);
    return fs.existsSync(filePath);
  }

  public getStorageMetrics(): { totalFiles: number; totalBytes: number; baseDir: string } {
    let totalBytes = 0;
    let totalFiles = 0;
    if (fs.existsSync(this.baseDir)) {
      const files = fs.readdirSync(this.baseDir);
      for (const file of files) {
        if (!file.endsWith('.meta.json')) {
          try {
            const stat = fs.statSync(path.join(this.baseDir, file));
            totalBytes += stat.size;
            totalFiles++;
          } catch {}
        }
      }
    }
    return { totalFiles, totalBytes, baseDir: this.baseDir };
  }
}

export const storageEngine = new LocalStorageProvider();
