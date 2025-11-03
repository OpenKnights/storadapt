import type { StorageAdapter } from '../src/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createBrowserStoradapt,
  createStoradapt,
  Storadapt
} from '../src/index'

describe('Index Exports', () => {
  describe('Module Exports', () => {
    it('should export createStoradapt function', () => {
      expect(typeof createStoradapt).toBe('function')
    })

    it('should export createBrowserStoradapt function', () => {
      expect(typeof createBrowserStoradapt).toBe('function')
    })

    it('should export Storadapt class', () => {
      expect(Storadapt).toBeDefined()
      expect(typeof Storadapt).toBe('function')
    })
  })

  describe('createStoradapt', () => {
    let mockAdapter: StorageAdapter
    let store: Record<string, string>

    beforeEach(() => {
      store = {}
      mockAdapter = {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
          store[key] = value
        },
        removeItem: (key: string) => {
          delete store[key]
        },
        clear: () => {
          Object.keys(store).forEach((k) => delete store[k])
        },
        length: () => Object.keys(store).length,
        key: (index: number) => Object.keys(store)[index] || null
      }
    })

    it('should create Storadapt instance from adapter', () => {
      const storage = createStoradapt(mockAdapter)

      expect(storage).toBeInstanceOf(Storadapt)
    })

    it('should create Storadapt instance from adapter factory function', () => {
      const adapterFactory = vi.fn(() => mockAdapter)
      const storage = createStoradapt(adapterFactory)

      expect(storage).toBeInstanceOf(Storadapt)
      expect(adapterFactory).toHaveBeenCalledOnce()
    })

    it('should work with direct adapter', () => {
      const storage = createStoradapt(mockAdapter)

      storage.set('test', 'value')
      expect(storage.get('test')).toBe('value')
    })

    it('should work with adapter factory', () => {
      const storage = createStoradapt(() => mockAdapter)

      storage.set('test', 'value')
      expect(storage.get('test')).toBe('value')
    })

    it('should call adapter factory only once', () => {
      const adapterFactory = vi.fn(() => mockAdapter)

      createStoradapt(adapterFactory)

      expect(adapterFactory).toHaveBeenCalledTimes(1)
    })

    it('should support custom adapter implementations', () => {
      const customStore = new Map<string, string>()

      const customAdapter: StorageAdapter = {
        getItem: (key) => customStore.get(key) || null,
        setItem: (key, value) => {
          customStore.set(key, value)
        },
        removeItem: (key) => {
          customStore.delete(key)
        },
        clear: () => {
          customStore.clear()
        },
        length: () => customStore.size,
        key: (index) => {
          const keys = Array.from(customStore.keys())
          return keys[index] || null
        }
      }

      const storage = createStoradapt(customAdapter)

      storage.set('key', 'value')
      expect(storage.get('key')).toBe('value')
      expect(customStore.get('key')).toBe('value')
    })
  })

  describe('createBrowserStoradapt', () => {
    let mockStorage: Storage
    let store: Record<string, string>

    beforeEach(() => {
      store = {}
      mockStorage = {
        getItem: vi.fn((key: string) =>
          store[key] !== null && store[key] !== undefined ? store[key] : null
        ),
        setItem: vi.fn((key: string, value: string) => {
          store[key] = value
        }),
        removeItem: vi.fn((key: string) => {
          delete store[key]
        }),
        clear: vi.fn(() => {
          Object.keys(store).forEach((key) => delete store[key])
        }),
        key: vi.fn((index: number) => {
          const keys = Object.keys(store)
          return keys[index] || null
        }),
        length: 0
      }

      // Mock window with localStorage and sessionStorage
      Object.defineProperty(global, 'window', {
        value: {
          localStorage: mockStorage,
          sessionStorage: mockStorage
        },
        writable: true,
        configurable: true
      })
    })

    it('should create Storadapt with localStorage', () => {
      const storage = createBrowserStoradapt('localStorage')

      expect(storage).toBeInstanceOf(Storadapt)
    })

    it('should create Storadapt with sessionStorage', () => {
      const storage = createBrowserStoradapt('sessionStorage')

      expect(storage).toBeInstanceOf(Storadapt)
    })

    it('should work with localStorage', () => {
      const storage = createBrowserStoradapt('localStorage')

      storage.set('test', 'localStorage-value')
      expect(storage.get('test')).toBe('localStorage-value')
      expect(mockStorage.setItem).toHaveBeenCalled()
    })

    it('should work with sessionStorage', () => {
      const storage = createBrowserStoradapt('sessionStorage')

      storage.set('test', 'sessionStorage-value')
      expect(storage.get('test')).toBe('sessionStorage-value')
    })

    it('should throw error when window is undefined', () => {
      // @ts-expect-error - Testing undefined window
      global.window = undefined

      expect(() => createBrowserStoradapt('localStorage')).toThrow(
        'localStorage is not available in this environment'
      )
    })

    it('should throw error when storage type is not available', () => {
      Object.defineProperty(global, 'window', {
        value: {
          localStorage: null,
          sessionStorage: null
        },
        writable: true
      })

      expect(() => createBrowserStoradapt('localStorage')).toThrow()
    })
  })

  describe('Storadapt Direct Usage', () => {
    it('should be usable as a class directly', () => {
      const store: Record<string, string> = {}
      const adapter: StorageAdapter = {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => {
          store[key] = value
        },
        removeItem: (key) => {
          delete store[key]
        },
        clear: () => {
          Object.keys(store).forEach((k) => delete store[k])
        },
        length: () => Object.keys(store).length,
        key: (index) => Object.keys(store)[index] || null
      }

      const storage = new Storadapt(adapter)

      storage.set('direct', 'usage')
      expect(storage.get('direct')).toBe('usage')
    })
  })

  describe('Type Exports', () => {
    it('should export StorageAdapter type', () => {
      const adapter: StorageAdapter = {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
        length: () => 0,
        key: () => null
      }

      expect(adapter).toBeDefined()
    })
  })

  describe('Integration between exports', () => {
    it('should work when switching between creation methods', () => {
      const store: Record<string, string> = {}
      const adapter: StorageAdapter = {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => {
          store[key] = value
        },
        removeItem: (key) => {
          delete store[key]
        },
        clear: () => {
          Object.keys(store).forEach((k) => delete store[k])
        },
        length: () => Object.keys(store).length,
        key: (index) => Object.keys(store)[index] || null
      }

      // 使用 createStoradapt
      const storage1 = createStoradapt(adapter)
      storage1.set('key1', 'value1')

      // 使用 Storadapt 直接创建
      const storage2 = new Storadapt(adapter)

      // 两者应该共享同一个 adapter
      expect(storage2.get('key1')).toBe('value1')

      storage2.set('key2', 'value2')
      expect(storage1.get('key2')).toBe('value2')
    })

    it('should maintain consistency across different instances', () => {
      const store: Record<string, string> = {}
      const adapter: StorageAdapter = {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => {
          store[key] = value
        },
        removeItem: (key) => {
          delete store[key]
        },
        clear: () => {
          Object.keys(store).forEach((k) => delete store[k])
        },
        length: () => Object.keys(store).length,
        key: (index) => Object.keys(store)[index] || null
      }

      const storage1 = createStoradapt(adapter)
      const storage2 = createStoradapt(() => adapter)
      const storage3 = new Storadapt(adapter)

      storage1.set('shared', { value: 'test' })

      expect(storage2.get('shared')).toEqual({ value: 'test' })
      expect(storage3.get('shared')).toEqual({ value: 'test' })

      storage2.set('shared.value', 'updated')

      expect(storage1.get('shared.value')).toBe('updated')
      expect(storage3.get('shared.value')).toBe('updated')
    })
  })
})
