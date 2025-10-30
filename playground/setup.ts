import type { StorageAdapter } from '../src/types'

import superjson from 'superjson'

/**
 * 创建内存存储适配器（用于测试）
 */
export function createMemoryAdapter(): {
  adapter: StorageAdapter
  store: Record<string, string>
} {
  const store: Record<string, string> = {}

  const adapter: StorageAdapter = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key])
    },
    length: () => Object.keys(store).length,
    key: (index: number) => Object.keys(store)[index] || null
  }

  return { adapter, store }
}

/**
 * 创建模拟的浏览器 Storage 对象
 */
export function createMockStorage(): Storage {
  const store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key])
    },
    key: (index: number) => {
      const keys = Object.keys(store)
      return keys[index] || null
    },
    get length() {
      return Object.keys(store).length
    }
  }
}

/**
 * 设置浏览器环境 mock
 */
export function setupBrowserEnv() {
  const localStorage = createMockStorage()
  const sessionStorage = createMockStorage()

  Object.defineProperty(global, 'window', {
    value: {
      localStorage,
      sessionStorage
    },
    writable: true,
    configurable: true
  })

  return { localStorage, sessionStorage }
}

/**
 * 清理浏览器环境 mock
 */
export function cleanupBrowserEnv() {
  // @ts-expect-error - Cleaning up mock
  delete global.window
}

/**
 * 创建测试数据
 */
export const testData = {
  simpleString: 'test value',
  simpleNumber: 42,
  simpleBoolean: true,
  simpleNull: null,
  simpleArray: [1, 2, 3, 4, 5],
  simpleObject: {
    name: 'John Doe',
    age: 30,
    email: 'john@example.com'
  },
  nestedObject: {
    user: {
      profile: {
        personal: {
          name: 'Alice',
          age: 25
        },
        contact: {
          email: 'alice@example.com',
          phone: '123-456-7890'
        }
      },
      settings: {
        theme: 'dark',
        notifications: true
      }
    }
  },
  mixedArray: ['string', 42, true, { key: 'value' }, [1, 2, 3]],
  complexStructure: {
    users: [
      {
        id: 1,
        name: 'Alice',
        tags: ['admin', 'user'],
        settings: {
          theme: 'dark',
          language: 'en'
        }
      },
      {
        id: 2,
        name: 'Bob',
        tags: ['user'],
        settings: {
          theme: 'light',
          language: 'zh'
        }
      }
    ],
    metadata: {
      version: '1.0.0',
      lastUpdate: '2024-01-01'
    }
  }
}

/**
 * 等待一段时间（用于异步测试）
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 生成大量测试数据
 */
export function generateLargeData(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    value: `item-${i}`,
    metadata: {
      timestamp: Date.now(),
      type: 'test',
      index: i
    }
  }))
}

/**
 * 验证两个对象深度相等（包括嵌套对象和数组）
 */
export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true
  if (a == null || b == null) return false
  if (typeof a !== typeof b) return false

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((val, idx) => deepEqual(val, b[idx]))
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)
    if (keysA.length !== keysB.length) return false
    return keysA.every((key) => deepEqual(a[key], b[key]))
  }

  return false
}

/**
 * 创建故障适配器（用于测试错误处理）
 */
export function createFaultyAdapter(
  errorMessage = 'Storage error'
): StorageAdapter {
  return {
    getItem: () => {
      throw new Error(errorMessage)
    },
    setItem: () => {
      throw new Error(errorMessage)
    },
    removeItem: () => {
      throw new Error(errorMessage)
    },
    clear: () => {
      throw new Error(errorMessage)
    },
    length: () => {
      throw new Error(errorMessage)
    },
    key: () => {
      throw new Error(errorMessage)
    }
  }
}

/**
 * 测试路径组合
 */
export const testPaths = {
  simple: 'key',
  nested: 'user.name',
  deepNested: 'user.profile.contact.email',
  arrayIndex: 'items.0',
  arrayNested: 'users.0.name',
  mixedPath: 'data.users.0.tags.1',
  veryDeep: 'a.b.c.d.e.f.g.h.i.j'
}

/**
 * 断言辅助函数
 */
export const assertions = {
  /**
   * 断言值为 JSON 字符串
   */
  isJsonString(value: any): boolean {
    if (typeof value !== 'string') return false
    try {
      superjson.parse(value)
      return true
    } catch {
      return false
    }
  },

  /**
   * 断言存储包含指定键
   */
  storageHasKey(store: Record<string, string>, key: string): boolean {
    return key in store
  },

  /**
   * 断言存储为空
   */
  storageIsEmpty(store: Record<string, string>): boolean {
    return Object.keys(store).length === 0
  }
}
