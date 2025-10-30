import type { StorageAdapter } from '../src/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createBrowserStorageAdapter } from '../src/adapter'

describe('Adapter', () => {
  describe('createBrowserStorageAdapter', () => {
    let mockStorage: Storage

    beforeEach(() => {
      // 创建模拟的 Storage 对象
      const store: Record<string, string> = {}
      let getStoreLength = () => Object.keys(store).length
      mockStorage = {
        getItem: vi.fn((key: string) => store[key] || null),
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
        get length() {
          return getStoreLength()
        },
        set length(value) {
          getStoreLength = () => value
        }
      }

      // Mock window.localStorage
      Object.defineProperty(global, 'window', {
        value: {
          localStorage: mockStorage,
          sessionStorage: mockStorage
        },
        writable: true
      })
    })

    it('should create adapter for localStorage', () => {
      const adapter = createBrowserStorageAdapter('localStorage')
      expect(adapter).toBeDefined()
      expect(adapter.getItem).toBeDefined()
      expect(adapter.setItem).toBeDefined()
      expect(adapter.removeItem).toBeDefined()
      expect(adapter.clear).toBeDefined()
    })

    it('should create adapter for sessionStorage', () => {
      const adapter = createBrowserStorageAdapter('sessionStorage')
      expect(adapter).toBeDefined()
    })

    it('should throw error when window is not available', () => {
      // @ts-expect-error - Testing undefined window
      global.window = undefined

      expect(() => createBrowserStorageAdapter('localStorage')).toThrow(
        'localStorage is not available in this environment'
      )
    })

    it('should getItem from storage', () => {
      const adapter = createBrowserStorageAdapter('localStorage')
      mockStorage.setItem('test-key', 'test-value')

      const result = adapter.getItem('test-key')
      expect(result).toBe('test-value')
      expect(mockStorage.getItem).toHaveBeenCalledWith('test-key')
    })

    it('should setItem to storage', () => {
      const adapter = createBrowserStorageAdapter('localStorage')

      adapter.setItem('test-key', 'test-value')

      expect(mockStorage.setItem).toHaveBeenCalledWith('test-key', 'test-value')
    })

    it('should removeItem from storage', () => {
      const adapter = createBrowserStorageAdapter('localStorage')
      mockStorage.setItem('test-key', 'test-value')

      adapter.removeItem('test-key')

      expect(mockStorage.removeItem).toHaveBeenCalledWith('test-key')
    })

    it('should clear all items', () => {
      const adapter = createBrowserStorageAdapter('localStorage')

      adapter.clear()

      expect(mockStorage.clear).toHaveBeenCalled()
    })

    it('should return correct length', () => {
      const adapter = createBrowserStorageAdapter('localStorage')

      const copyMockStorage: any = mockStorage
      copyMockStorage.length = 5

      const length = adapter.length()
      expect(length).toBe(5)
    })

    it('should return key by index', () => {
      const adapter = createBrowserStorageAdapter('localStorage')

      adapter.key(0)

      expect(mockStorage.key).toHaveBeenCalledWith(0)
    })
  })

  describe('Custom Storage Adapter', () => {
    it('should work with custom adapter implementation', () => {
      const store: Record<string, string> = {}

      const customAdapter: StorageAdapter = {
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

      customAdapter.setItem('test', 'value')
      expect(customAdapter.getItem('test')).toBe('value')
      expect(customAdapter.length()).toBe(1)

      customAdapter.removeItem('test')
      expect(customAdapter.getItem('test')).toBeNull()
    })
  })
})
