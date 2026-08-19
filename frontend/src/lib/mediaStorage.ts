/**
 * IndexedDB Local Media Storage for High-Capacity Video & Image Files.
 * Allows storing large video files (50MB+) locally in the browser without
 * hitting Vercel Serverless 4.5MB payload limits.
 */

const DB_NAME = 'UMKM_MEDIA_STORE';
const STORE_NAME = 'media_blobs';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

const getDB = (): Promise<IDBDatabase> => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('IndexedDB only available in browser'));
  }

  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  return dbPromise;
};

/**
 * Save a File or Blob to IndexedDB and return its media key URI (`indexeddb://<id>`)
 */
export const saveMediaToIndexedDB = async (
  id: string,
  blobOrDataUrl: Blob | File | string,
  mediaType: 'image' | 'video' = 'video'
): Promise<string> => {
  if (typeof window === 'undefined') return '';

  try {
    let blob: Blob;

    if (typeof blobOrDataUrl === 'string') {
      if (blobOrDataUrl.startsWith('data:')) {
        // Convert Base64 data URL to Blob to save RAM/Disk
        const [header, base64] = blobOrDataUrl.split(',');
        const mimeMatch = header.match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : (mediaType === 'video' ? 'video/mp4' : 'image/jpeg');
        const binary = atob(base64);
        const array = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          array[i] = binary.charCodeAt(i);
        }
        blob = new Blob([array], { type: mime });
      } else {
        return blobOrDataUrl; // It's already a standard HTTP URL
      }
    } else {
      blob = blobOrDataUrl;
    }

    const db = await getDB();
    const mediaKey = id.startsWith('media-') ? id : `media-${id}`;

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put({
        id: mediaKey,
        blob,
        mediaType,
        updatedAt: Date.now(),
      });

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    return `indexeddb://${mediaKey}`;
  } catch (err) {
    console.error('Failed to save media to IndexedDB:', err);
    return typeof blobOrDataUrl === 'string' ? blobOrDataUrl : '';
  }
};

/**
 * Retrieve a Blob from IndexedDB by media key (`indexeddb://<id>` or `<id>`)
 */
export const getMediaFromIndexedDB = async (mediaKey: string): Promise<Blob | null> => {
  if (typeof window === 'undefined') return null;

  try {
    const id = mediaKey.replace(/^indexeddb:\/\//, '');
    const db = await getDB();

    return await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);

      req.onsuccess = () => {
        if (req.result && req.result.blob) {
          resolve(req.result.blob);
        } else {
          resolve(null);
        }
      };

      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to get media from IndexedDB:', err);
    return null;
  }
};

// In-memory cache for generated Object URLs
const objectUrlCache = new Map<string, string>();

/**
 * Resolve any media URL:
 * - If it's `indexeddb://...`, loads Blob and creates an Object URL (`blob:...`)
 * - If it's already `http://`, `https://`, `blob:`, or `data:`, returns it as is
 */
export const resolveMediaUrl = async (url?: string): Promise<string> => {
  if (!url || !url.trim()) return '';

  if (url.startsWith('indexeddb://')) {
    const cached = objectUrlCache.get(url);
    if (cached) return cached;

    const blob = await getMediaFromIndexedDB(url);
    if (blob) {
      const objUrl = URL.createObjectURL(blob);
      objectUrlCache.set(url, objUrl);
      return objUrl;
    }
    return '';
  }

  return url;
};
