/* eslint-disable no-console */
import type { StorageAdapter } from '../src'

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync
} from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { createStoradapt } from '../src'

const STORAGE_PATH = '../.cache/custom-storage'

const __filename = fileURLToPath(new URL(import.meta.url))
const __dirname = dirname(__filename)

/**
 * Ensure directory exists, create if not
 */
const ensureDir = (absPath: string): void => {
  if (existsSync(absPath)) return

  mkdirSync(absPath, { recursive: true })
  console.log(`📁 Created directory: ${absPath}`)
}

/**
 * Log error message with consistent format
 */
const logError = (operation: string, error: unknown): void => {
  console.error(
    `\n[${operation} Error]:`,
    error instanceof Error ? error.message : error,
    '\n'
  )
}

/**
 * Create a file-based storage adapter
 * Each key is stored as a separate file
 *
 * @param storagePath - Relative path to storage directory
 * @returns ExtendedStorageAdapter instance
 */
const createCustomStorage = (storagePath: string): StorageAdapter => {
  /**
   * Get absolute file path for a storage key
   */
  const getFilePath = (key: string): string => {
    return resolve(__dirname, storagePath, key)
  }

  /**
   * Get storage directory path
   */
  const getStorageDir = (): string => {
    return resolve(__dirname, storagePath)
  }

  /**
   * Get all keys in storage
   */
  const getAllKeys = (): string[] => {
    try {
      return readdirSync(getStorageDir())
    } catch (error) {
      logError('GetAllKeys', error)
      return []
    }
  }

  // Ensure storage directory exists
  ensureDir(getStorageDir())

  const getItem = (key: string): string | null => {
    const filePath = getFilePath(key)

    if (!existsSync(filePath)) {
      return null
    }

    try {
      const content = readFileSync(filePath, 'utf-8')
      return content.trim() || null
    } catch (error) {
      logError('GetItem', error)
      return null
    }
  }

  const setItem = (key: string, value: string): void => {
    if (typeof value !== 'string') {
      logError('SetItem', 'Value must be a string')
      return
    }

    const filePath = getFilePath(key)

    try {
      writeFileSync(filePath, value, { encoding: 'utf-8', flag: 'w' })
    } catch (error) {
      logError('SetItem', error)
    }
  }

  const removeItem = (key: string): void => {
    const filePath = getFilePath(key)

    if (!existsSync(filePath)) {
      return
    }

    try {
      unlinkSync(filePath)
    } catch (error) {
      logError('RemoveItem', error)
    }
  }

  const clear = (): void => {
    try {
      const files = getAllKeys()

      for (const file of files) {
        const filePath = getFilePath(file)
        unlinkSync(filePath)
      }

      console.log('✅ All storage has been cleared.')
    } catch (error) {
      logError('Clear', error)
    }
  }

  const key = (index: number): string | null => {
    const keys = getAllKeys()

    if (index < 0 || index >= keys.length) {
      return null
    }

    try {
      return keys[index]
    } catch (error) {
      logError('Key', error)
      return null
    }
  }

  const length = (): number => {
    return getAllKeys().length
  }

  return {
    getItem,
    setItem,
    removeItem,
    clear,
    key,
    length
  }
}

// ==================== Usage Example ====================

const customStorage = createCustomStorage(STORAGE_PATH)
const customStoradapt = createStoradapt(customStorage)

// Set values
customStoradapt.set('user.name', 'king3', { createPath: true })
customStoradapt.set(
  'info',
  {
    name: 'king3',
    age: 18,
    sex: 'male'
  },
  { createPath: true }
)
customStoradapt.set('testArr.test.36.fff.9.0', '哈喽马德法克', {
  createPath: true
})

customStoradapt.set('users', [{ name: 'king3', age: 18 }])

// console.log('users', customStorage.getItem('users'))

// customStorage.clear()

// customStoradapt.remove('testArr')

console.log(`🚀 ~ user:`, customStoradapt.get('user'))
console.log(`🚀 ~ info:`, customStoradapt.get('info'))
console.log(`🚀 ~ testArr:`, customStoradapt.get('testArr'))

console.log(`🚀 ~ storadapt.length:`, customStoradapt.length)

console.log(`🚀 ~ key_n:`, customStoradapt.key(1))

// customStoradapt.clear()
