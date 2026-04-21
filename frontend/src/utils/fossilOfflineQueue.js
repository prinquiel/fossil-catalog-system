const STORAGE_KEY = 'fossil_catalog_offline_queue_v1';

/**
 * @typedef {{ id: string, createdAt: string, payload: Record<string, unknown> }} OfflineQueuedFossil
 */

/**
 * @returns {OfflineQueuedFossil[]}
 */
export function readOfflineFossilQueue() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item === 'object' && item.id && item.payload);
  } catch {
    return [];
  }
}

/**
 * @param {OfflineQueuedFossil[]} items
 */
function writeOfflineFossilQueue(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/**
 * @param {Record<string, unknown>} payload
 */
export function enqueueOfflineFossil(payload) {
  const queue = readOfflineFossilQueue();
  const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const next = [
    ...queue,
    {
      id,
      createdAt: new Date().toISOString(),
      payload,
    },
  ];
  writeOfflineFossilQueue(next);
  return id;
}

/**
 * @param {string} id
 */
export function removeOfflineQueuedFossil(id) {
  const queue = readOfflineFossilQueue();
  writeOfflineFossilQueue(queue.filter((item) => item.id !== id));
}

export function clearOfflineFossilQueue() {
  localStorage.removeItem(STORAGE_KEY);
}
