import { DBSchema, openDB } from 'idb';

interface StickerDB extends DBSchema {
  stickers: {
    value: {
      id: string;
      blob: Blob;
    };
    key: string;
    indexes: { 'by-id': string };
  };
}

async function cachePut(sticker: {
  id: string;
  blob: Blob;
}) {
  const db = await openDB<StickerDB>('sticker-db', 1, {
    upgrade(db) {
      const stickerStore = db.createObjectStore('stickers', {
        keyPath: 'id',
      });
      stickerStore.createIndex('by-id', 'id');
    },
  });
  const tx = db.transaction('stickers', 'readwrite');
  await tx.store.add(sticker)
  await tx.done;
}

async function cacheMatch(id: string) {
  const db = await openDB<StickerDB>('sticker-db', 1, {
    upgrade(db) {
      const stickerStore = db.createObjectStore('stickers', {
        keyPath: 'id',
      });
      stickerStore.createIndex('by-id', 'id');\
    },
  });
  return await db.get('stickers', id);
}

export {
  cachePut,
  cacheMatch,
}