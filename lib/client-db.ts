'use client'

const DB_NAME = 'terminal-pro-db'
const STORE_NAME = 'app_state'
const DB_VERSION = 1

function openDb(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.resolve(null)
  }

  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function localStorageKey(key: string) {
  return `${DB_NAME}:${key}`
}

export async function readClientValue<T>(key: string): Promise<T | undefined> {
  try {
    const db = await openDb()
    if (!db) {
      const raw = window.localStorage.getItem(localStorageKey(key))
      return raw ? (JSON.parse(raw) as T) : undefined
    }

    return await new Promise<T | undefined>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(key)

      request.onsuccess = () => resolve(request.result?.value as T | undefined)
      request.onerror = () => reject(request.error)
    })
  } catch {
    const raw = window.localStorage.getItem(localStorageKey(key))
    return raw ? (JSON.parse(raw) as T) : undefined
  }
}

export async function writeClientValue<T>(key: string, value: T): Promise<void> {
  try {
    const db = await openDb()
    if (!db) {
      window.localStorage.setItem(localStorageKey(key), JSON.stringify(value))
      return
    }

    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.put({ key, value })

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  } catch {
    window.localStorage.setItem(localStorageKey(key), JSON.stringify(value))
  }
}

export async function removeClientValue(key: string): Promise<void> {
  try {
    const db = await openDb()
    if (!db) {
      window.localStorage.removeItem(localStorageKey(key))
      return
    }

    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete(key)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  } catch {
    window.localStorage.removeItem(localStorageKey(key))
  }
}

export async function clearClientDatabase(): Promise<void> {
  try {
    const db = await openDb()
    if (db) {
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite')
        const store = transaction.objectStore(STORE_NAME)
        const request = store.clear()

        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    }
  } catch {
    // Fall through to localStorage clear.
  }

  if (typeof window !== 'undefined') {
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith(`${DB_NAME}:`))
      .forEach((key) => window.localStorage.removeItem(key))
  }
}
