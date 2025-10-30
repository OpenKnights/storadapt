// storage.ts
import type {
  DeepOperation,
  DeepPathInfo,
  GetDeepOptions,
  GetOptions,
  SetDeepOptions,
  SetOptions,
  StorageAdapter
} from './types'

import superjson from 'superjson'
import {
  isArrayIndex,
  isJsonString,
  isObject,
  isString,
  parsePath,
  traversePath
} from './util'

export class Storadapt {
  private adapter: StorageAdapter

  constructor(adapter: StorageAdapter) {
    this.adapter = adapter
  }

  get length(): number {
    try {
      return this.adapter.length()
    } catch (error) {
      errorLogger(`Storadapt.length error`, error)
      return 0
    }
  }

  /**
   * Get key name by index (same as localStorage.key)
   */
  key<T = any>(index: number): T | null {
    try {
      const rawValue = this.adapter.key(index)

      return rawValue as T
    } catch (error) {
      errorLogger(`Storadapt.key error`, error)
      return null
    }
  }

  /**
   * Get stored value with automatic JSON deserialization
   * Supports deep path: 'user.infos.0.name'
   */
  get<T = any>(key: string, options?: GetOptions<T>): T | null {
    try {
      const dotIndex = key.indexOf('.')

      if (dotIndex === -1) {
        return this._getSimple<T>(key, options)
      }

      // Handle deep path
      const pathInfo = this._parseDeepPath(key, dotIndex, 'get')
      if (!pathInfo) {
        return options?.defaultValue ?? null
      }

      const { rootValue, pathSegments } = pathInfo

      // Use getDeep to retrieve deep value
      return this._getDeep(rootValue, pathSegments, {
        defaultValue: options?.defaultValue
      }) as T
    } catch (error) {
      errorLogger(`Storadapt.get error for key "${key}"`, error)
      return options?.defaultValue ?? null
    }
  }

  /**
   * Set storage value with automatic object serialization
   * Supports deep path: 'user.infos.0.name'
   */
  set(key: string, value: any, options?: SetOptions): void {
    try {
      const dotIndex = key.indexOf('.')

      if (dotIndex === -1) {
        const serialized = this._serialize(value)
        this.adapter.setItem(key, serialized)
        return
      }

      // Handle deep path
      const pathInfo = this._parseDeepPath(key, dotIndex, 'set')
      if (!pathInfo) return

      const { storageKey, rootValue, pathSegments } = pathInfo

      // Use setDeep to set deep value
      this._setDeep(rootValue, pathSegments, value, {
        createPath: options?.createPath
      })

      // Save back to storage
      this._saveToStorage(storageKey, rootValue)
    } catch (error) {
      errorLogger(`Storadapt.set error for key "${key}"`, error)
    }
  }

  /**
   * Remove specified key or deep path
   * - Without dot: removes entire key
   * - With dot: removes specific property/index using setDeep
   */
  remove(key: string): void {
    try {
      const dotIndex = key.indexOf('.')

      if (dotIndex === -1) {
        this.adapter.removeItem(key)
        return
      }

      // Handle deep path
      const pathInfo = this._parseDeepPath(key, dotIndex, 'remove')
      if (!pathInfo) return

      const { storageKey, rootValue, pathSegments } = pathInfo

      // Use setDeep with remove option
      this._setDeep(rootValue, pathSegments, undefined, {
        remove: true,
        createPath: false
      })

      // Save back to storage
      this._saveToStorage(storageKey, rootValue)
    } catch (error) {
      errorLogger(`Storadapt.remove error for key "${key}"`, error)
    }
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    try {
      const dotIndex = key.indexOf('.')

      if (dotIndex === -1) {
        return this.adapter.getItem(key) !== null
      }

      const value = this.get(key)
      return value !== null
    } catch (error) {
      errorLogger(`Storadapt.has error for key "${key}"`, error)
      return false
    }
  }

  /**
   * Clear all storage
   */
  clear(): void {
    try {
      this.adapter.clear()
    } catch (error) {
      errorLogger(`Storadapt.clear error`, error)
    }
  }

  // ==================== Private Methods ====================

  /**
   * Parse deep path and prepare for operation
   * Handles common logic for get/set/remove deep operations
   *
   * @returns DeepPathInfo or null if validation fails
   */
  private _parseDeepPath(
    key: string,
    dotIndex: number,
    operation: DeepOperation
  ): DeepPathInfo | null {
    // 1. Split storage key and deep path
    const storageKey = key.slice(0, dotIndex)
    const deepPath = key.slice(dotIndex + 1)
    const pathSegments = parsePath(deepPath)

    // 2. Get root value from storage
    const rawValue = this.adapter.getItem(storageKey)

    // Handle non-existent key based on operation
    if (rawValue === null) {
      if (operation === 'get') {
        return null // Will return defaultValue in caller
      }
      if (operation === 'remove') {
        console.warn(`Key "${storageKey}" does not exist`)
        return null
      }
      if (operation === 'set') {
        // Create new root based on first segment
        const rootValue = isArrayIndex(pathSegments[0]) ? [] : {}
        return { storageKey, pathSegments, rootValue }
      }
    }

    // 3. Parse JSON
    let rootValue: any
    if (isJsonString(rawValue!)) {
      rootValue = superjson.parse(rawValue!)
    } else {
      rootValue = rawValue
    }

    // 4. Validate first segment type
    if (!this._validateFirstSegment(rootValue, pathSegments[0])) {
      const expectedType = isArrayIndex(pathSegments[0]) ? 'array' : 'object'
      console.warn(
        `Type mismatch: expected ${expectedType} for key "${storageKey}", got ${typeof rootValue}`
      )
      return null
    }

    return { storageKey, pathSegments, rootValue }
  }

  /**
   * Save value back to storage
   */
  private _saveToStorage(key: string, value: any): void {
    const serialized = superjson.stringify(value)
    this.adapter.setItem(key, serialized)
  }

  /**
   * Simple get (without deep path)
   */
  private _getSimple<T = any>(key: string, options?: GetOptions<T>): T | null {
    const rawValue = this.adapter.getItem(key)

    if (rawValue === null) {
      return options?.defaultValue ?? null
    }

    if (isJsonString(rawValue)) {
      return superjson.parse(rawValue) as T
    }

    return rawValue as T
  }

  /**
   * Get deep path value
   */
  private _getDeep(obj: any, path: string[], options?: GetDeepOptions): any {
    const { defaultValue } = options || {}

    const hasDefaultValue = defaultValue !== undefined

    try {
      const result = traversePath(obj, path, {
        shouldThrowError: () => !hasDefaultValue
      })

      const emptyResult = result === undefined || result === null
      if (emptyResult && hasDefaultValue) {
        return defaultValue
      }

      return result
    } catch (error) {
      if (hasDefaultValue) return defaultValue
      throw error
    }
  }

  /**
   * Set deep path value
   */
  private _setDeep(
    obj: any,
    path: string[],
    value?: any,
    options?: SetDeepOptions
  ): void {
    const { remove = false, createPath = false } = options || {}

    // Traverse to parent object
    const parent = traversePath(obj, path, {
      stopBeforeLast: true,
      createPath
    })

    // Handle last level
    const lastSegment = path[path.length - 1]

    // Helper function to set or remove value
    const setOrRemove = (
      target: Record<string | number, any>,
      key: string | number
    ): void => {
      if (remove) {
        delete target[key]
      } else {
        target[key] = value
      }
    }

    if (isArrayIndex(lastSegment)) {
      if (!Array.isArray(parent)) {
        throw new TypeError(`${path.slice(0, -1).join('.')} is not an array`)
      }

      const lastIndex = Number.parseInt(lastSegment, 10)

      if (lastIndex < 0) {
        throw new Error(`Array index ${lastIndex} cannot be negative`)
      }

      if (lastIndex >= parent.length) {
        if (!createPath) {
          throw new Error(`Array index ${lastIndex} out of bounds`)
        }
        while (parent.length <= lastIndex) {
          parent.push(undefined)
        }
      }

      setOrRemove(parent, lastIndex)
    } else {
      if (!isObject(parent)) {
        throw new Error(`${path.slice(0, -1).join('.')} is not an object`)
      }

      setOrRemove(parent, lastSegment)
    }
  }

  /**
   * Validate first segment type matches value type
   */
  private _validateFirstSegment(value: any, firstSegment: string): boolean {
    const expectArray = isArrayIndex(firstSegment)

    if (expectArray) {
      return Array.isArray(value)
    } else {
      return isObject(value)
    }
  }

  /**
   * Serialize value
   */
  private _serialize(value: any): string {
    if (isString(value)) {
      return value
    }

    if (isObject(value) || Array.isArray(value)) {
      return superjson.stringify(value)
    }

    return String(value)
  }
}

function errorLogger(msg: string, error: unknown) {
  console.info('')
  console.error(`${msg}:\n`, error)
  console.info('')
}
