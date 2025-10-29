// types.ts
export type BrowserStorageType = 'localStorage' | 'sessionStorage'

/**
 * Storage adapter interface, compatible with various storage implementations
 */
export interface StorageAdapter {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
  clear: () => void
  length: () => number
  key: (index: number) => string | null
}

/**
 * Options for get method
 */
export interface GetOptions<T = any> {
  /**
   * Default value to return when key doesn't exist
   */
  defaultValue?: T
}

/**
 * Options for set method
 */
export interface SetOptions {
  /**
   * When path doesn't exist, whether to auto-create intermediate objects
   * Defaults to true
   */
  createPath?: boolean
}

/**
 * Options for setDeep method
 */
export interface SetDeepOptions {
  remove?: boolean
  createPath?: boolean
}

/**
 * Options for getDeep method
 */
export interface GetDeepOptions {
  defaultValue?: any
}

/**
 * Deep path operation type
 */
export type DeepOperation = 'get' | 'set' | 'remove'

/**
 * Result of deep path parsing
 */
export interface DeepPathInfo {
  storageKey: string
  pathSegments: string[]
  rootValue: any
}

/**
 * Options for traversing deep object or array paths
 */
export interface TraversePathOptions {
  /**
   * Whether to stop traversal before the last path segment.
   * @default false
   */
  stopBeforeLast?: boolean

  /**
   * Whether to automatically create missing objects or arrays
   * when traversing deep paths.
   *
   * @default false
   */
  createPath?: boolean

  /**
   * Callback to determine whether to throw error
   * @param error - The error that occurred
   * @returns true to throw error, false to suppress it
   */
  shouldThrowError?: (error: Error) => boolean
}
