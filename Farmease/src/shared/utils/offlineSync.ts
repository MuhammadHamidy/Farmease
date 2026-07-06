import { peternakanClient, kebunClient } from '../api/client'

export interface OfflineQueueItem {
  id: string
  service: 'peternakan' | 'kebun'
  endpoint: string
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  payload: any
  timestamp: number
  description?: string
}

const STORAGE_KEY = 'farmease_offline_queue'

/**
 * Checks if the browser has internet connectivity
 */
export function isOnline(): boolean {
  return navigator.onLine
}

/**
 * Gets all pending offline items from localStorage
 */
export function getOfflineQueue(): OfflineQueueItem[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch (e) {
    console.error('Failed to parse offline queue', e)
    return []
  }
}

/**
 * Saves a payload to the offline queue
 */
export function saveToOfflineQueue(
  service: 'peternakan' | 'kebun',
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  endpoint: string,
  payload: any,
  description?: string
): void {
  const queue = getOfflineQueue()
  
  const newItem: OfflineQueueItem = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    service,
    method,
    endpoint,
    payload,
    timestamp: Date.now(),
    description
  }

  queue.push(newItem)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue))
  console.log(`[OfflineSync] Saved task to queue: ${description || endpoint}`)
}

/**
 * Sends a single queue item to the backend
 */
async function processQueueItem(item: OfflineQueueItem): Promise<void> {
  const client = item.service === 'kebun' ? kebunClient : peternakanClient
  const url = item.endpoint
  const data = item.payload

  switch (item.method) {
    case 'POST':
      await client.post(url, data)
      break
    case 'PUT':
      await client.put(url, data)
      break
    case 'PATCH':
      await client.patch(url, data)
      break
    case 'DELETE':
      await client.delete(url)
      break
    default:
      throw new Error(`Unsupported method: ${item.method}`)
  }
}

// Keep track of syncing state to prevent concurrent sync loops
let isSyncing = false

/**
 * Synchronizes all pending queue items with the server.
 * Iterates sequentially, removing successful requests.
 */
export async function syncOfflineData(): Promise<void> {
  if (isSyncing || !isOnline()) return

  const queue = getOfflineQueue()
  if (queue.length === 0) return

  isSyncing = true
  console.log(`[OfflineSync] Starting sync for ${queue.length} pending items...`)

  // Process item-by-item sequentially to maintain chronological order
  for (const item of [...queue]) {
    try {
      console.log(`[OfflineSync] Syncing item: ${item.description || item.endpoint}`)
      await processQueueItem(item)
      
      // Remove successfully processed item from storage
      const currentQueue = getOfflineQueue()
      const updatedQueue = currentQueue.filter((q) => q.id !== item.id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedQueue))
      
      console.log(`[OfflineSync] Successfully synced item: ${item.id}`)
    } catch (error) {
      console.error(`[OfflineSync] Sync failed for item: ${item.id}. Aborting queue sync.`, error)
      // Stop synchronization to preserve order if a request fails (e.g. backend temporarily down or validation error)
      break
    }
  }

  isSyncing = false
  
  // Trigger custom event for UI updates
  window.dispatchEvent(new CustomEvent('farmease_offline_sync_completed', {
    detail: { remaining: getOfflineQueue().length }
  }))
}

// Automatically bind listener for connection recovery
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[OfflineSync] Browser is online. Triggering synchronization...')
    syncOfflineData()
  })

  // Also try running sync on application load
  window.addEventListener('load', () => {
    if (isOnline()) {
      syncOfflineData()
    }
  })
}
