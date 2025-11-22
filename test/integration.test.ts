import type { StorageAdapter } from '../src/types'

import { beforeEach, describe, expect, it } from 'vitest'

import { createStoradapt, Storadapt } from '../src/index'

describe('Integration Tests', () => {
  let store: Record<string, string>
  let adapter: StorageAdapter

  beforeEach(() => {
    store = {}
    adapter = {
      getItem: (key: string) =>
        store[key] !== null && store[key] !== undefined ? store[key] : null,
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

  describe('createStoradapt', () => {
    it('should create Storadapt instance with adapter', () => {
      const storage = createStoradapt(adapter)
      expect(storage).toBeInstanceOf(Storadapt)
    })

    it('should create Storadapt instance with adapter factory', () => {
      const storage = createStoradapt(() => adapter)
      expect(storage).toBeInstanceOf(Storadapt)
    })

    it('should work with created instance', () => {
      const storage = createStoradapt(adapter)
      storage.set('test', 'value')
      expect(storage.get('test')).toBe('value')
    })
  })

  describe('End-to-End Workflows', () => {
    it('should handle complete user profile workflow', () => {
      const storage = new Storadapt(adapter)

      // 1. 创建用户
      storage.set('user:123', {
        id: 123,
        name: 'Alice',
        email: 'alice@example.com',
        preferences: {
          theme: 'dark',
          language: 'en'
        }
      })

      // 2. 读取用户名
      expect(storage.get('user:123.name')).toBe('Alice')

      // 3. 更新主题偏好
      storage.set('user:123.preferences.theme', 'light')
      expect(storage.get('user:123.preferences.theme')).toBe('light')

      // 4. 添加新的偏好设置
      storage.set('user:123.preferences.notifications', true)
      expect(storage.get('user:123.preferences.notifications')).toBe(true)

      // 5. 检查完整对象
      const user = storage.get('user:123')
      expect(user).toEqual({
        id: 123,
        name: 'Alice',
        email: 'alice@example.com',
        preferences: {
          theme: 'light',
          language: 'en',
          notifications: true
        }
      })

      // 6. 删除特定属性
      storage.remove('user:123.preferences.notifications')
      expect(storage.get('user:123.preferences.notifications')).toBeNull()

      // 7. 删除整个用户
      storage.remove('user:123')
      expect(storage.get('user:123')).toBeNull()
    })

    it('should handle shopping cart workflow', () => {
      const storage = new Storadapt(adapter)

      // 初始化购物车
      storage.set('cart', {
        items: [],
        total: 0
      })

      // 添加商品
      storage.set('cart.items', [
        { id: 1, name: 'Product A', price: 10, quantity: 2 },
        { id: 2, name: 'Product B', price: 15, quantity: 1 }
      ])

      // 更新总价
      storage.set('cart.total', 35)

      // 更新第一个商品的数量
      storage.set('cart.items.0.quantity', 3)
      expect(storage.get('cart.items.0.quantity')).toBe(3)

      // 获取第二个商品的名称
      expect(storage.get('cart.items.1.name')).toBe('Product B')

      // 删除第二个商品
      storage.remove('cart.items.1')
      const items = storage.get('cart.items')
      expect(items[1]).toBeUndefined()
    })

    it('should handle settings configuration workflow', () => {
      const storage = new Storadapt(adapter)

      // 初始化空配置
      storage.set('config', {})

      // 添加嵌套配置
      storage.set('config.app.name', 'MyApp', { createPath: true })
      storage.set('config.app.version', '1.0.0')
      storage.set('config.features.darkMode', true, { createPath: true })
      storage.set('config.features.notifications', false)

      // 验证配置
      expect(storage.get('config.app.name')).toBe('MyApp')
      expect(storage.get('config.features.darkMode')).toBe(true)

      // // 更新配置
      // storage.set('config.features.darkMode', false)
      // expect(storage.get('config.features.darkMode')).toBe(false)

      // // 检查完整配置
      // const config = storage.get('config')
      // expect(config).toEqual({
      //   app: {
      //     name: 'MyApp',
      //     version: '1.0.0'
      //   },
      //   features: {
      //     darkMode: false,
      //     notifications: false
      //   }
      // })
    })
  })

  /*  describe('Multiple Instances', () => {
    it('should share data when using same adapter', () => {
      const storage1 = new Storadapt(adapter)
      const storage2 = new Storadapt(adapter)

      storage1.set('shared', 'value-from-storage1')
      const result = storage2.get('shared')

      expect(result).toBe('value-from-storage1')
    })

    it('should isolate data with different adapters', () => {
      const store1: Record<string, string> = {}
      const adapter1: StorageAdapter = {
        getItem: (key) => store1[key] || null,
        setItem: (key, value) => {
          store1[key] = value
        },
        removeItem: (key) => {
          delete store1[key]
        },
        clear: () => {
          Object.keys(store1).forEach((k) => delete store1[k])
        },
        length: () => Object.keys(store1).length,
        key: (index) => Object.keys(store1)[index] || null
      }

      const store2: Record<string, string> = {}
      const adapter2: StorageAdapter = {
        getItem: (key) => store2[key] || null,
        setItem: (key, value) => {
          store2[key] = value
        },
        removeItem: (key) => {
          delete store2[key]
        },
        clear: () => {
          Object.keys(store2).forEach((k) => delete store2[k])
        },
        length: () => Object.keys(store2).length,
        key: (index) => Object.keys(store2)[index] || null
      }

      const storage1 = new Storadapt(adapter1)
      const storage2 = new Storadapt(adapter2)

      storage1.set('test', 'value1')
      storage2.set('test', 'value2')

      expect(storage1.get('test')).toBe('value1')
      expect(storage2.get('test')).toBe('value2')
    })
  }) */

  /*  describe('Complex Data Structures', () => {
    it('should handle deeply nested structures', () => {
      const storage = new Storadapt(adapter)

      const complexData = {
        company: {
          departments: [
            {
              name: 'Engineering',
              teams: [
                {
                  name: 'Frontend',
                  members: [
                    { name: 'Alice', role: 'Lead' },
                    { name: 'Bob', role: 'Developer' }
                  ]
                }
              ]
            }
          ]
        }
      }

      storage.set('organization', complexData)

      // 访问深层数据
      expect(storage.get('organization.company.departments.0.name')).toBe(
        'Engineering'
      )
      expect(
        storage.get('organization.company.departments.0.teams.0.members.1.name')
      ).toBe('Bob')

      // 修改深层数据
      storage.set(
        'organization.company.departments.0.teams.0.members.0.role',
        'Senior Lead'
      )
      expect(
        storage.get('organization.company.departments.0.teams.0.members.0.role')
      ).toBe('Senior Lead')
    })

    it('should handle array of arrays', () => {
      const storage = new Storadapt(adapter)

      storage.set('matrix', [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ])

      expect(storage.get('matrix.1.2')).toBe(6)

      storage.set('matrix.0.0', 10)
      expect(storage.get('matrix.0.0')).toBe(10)
    })

    it('should handle mixed types', () => {
      const storage = new Storadapt(adapter)

      storage.set('mixed', {
        string: 'text',
        number: 42,
        boolean: true,
        null: null,
        array: [1, 2, 3],
        object: { nested: 'value' }
      })

      expect(storage.get('mixed.string')).toBe('text')
      expect(storage.get('mixed.number')).toBe(42)
      expect(storage.get('mixed.boolean')).toBe(true)
      expect(storage.get('mixed.null')).toBeNull()
      expect(storage.get('mixed.array.1')).toBe(2)
      expect(storage.get('mixed.object.nested')).toBe('value')
    })
  }) */

  /*  describe('Performance Tests', () => {
    it('should handle large number of keys', () => {
      const storage = new Storadapt(adapter)
      const count = 1000

      // 写入大量数据
      for (let i = 0; i < count; i++) {
        storage.set(`key:${i}`, `value${i}`)
      }

      // 验证数据
      expect(storage.length).toBe(count)
      expect(storage.get('key:500')).toBe('value500')
      expect(storage.has('key:999')).toBe(true)
    })

    it('should handle large objects', () => {
      const storage = new Storadapt(adapter)

      // 创建大数组
      const largeArray = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        value: `item-${i}`,
        metadata: {
          timestamp: Date.now(),
          type: 'test'
        }
      }))

      storage.set('large-data', largeArray)

      expect(storage.get('large-data').length).toBe(1000)
      expect(storage.get('large-data.500.id')).toBe(500)
      expect(storage.get('large-data.999.value')).toBe('item-999')
    })

    it('should handle rapid sequential operations', () => {
      const storage = new Storadapt(adapter)

      // 快速连续操作
      for (let i = 0; i < 100; i++) {
        storage.set('counter', i)
      }

      expect(storage.get('counter')).toBe(99)

      // 深度路径快速操作
      storage.set('data', { value: 0 })
      for (let i = 0; i < 100; i++) {
        storage.set('data.value', i)
      }

      expect(storage.get('data.value')).toBe(99)
    })
  }) */

  /*  describe('Error Recovery', () => {
    it('should continue working after errors', () => {
      const storage = new Storadapt(adapter)

      storage.set('user', { name: 'John' })

      // 尝试访问不存在的路径
      const result1 = storage.get('user.address.city')
      expect(result1).toBeNull()

      // 存储应该仍然可用
      storage.set('user.age', 30)
      expect(storage.get('user.age')).toBe(30)
    })

    it('should handle partial path failures gracefully', () => {
      const storage = new Storadapt(adapter)

      storage.set('config', { app: 'MyApp' })

      // 尝试设置到基本类型的深度路径（应该失败但不崩溃）
      const result = storage.get('config.app.version')
      expect(result).toBeNull()

      // 验证原始数据未损坏
      expect(storage.get('config.app')).toBe('MyApp')
    })
  }) */

  /*  describe('Edge Cases Integration', () => {
    it('should handle empty paths correctly', () => {
      const storage = new Storadapt(adapter)

      storage.set('key', 'value')
      expect(storage.get('key')).toBe('value')
    })

    it('should handle special characters in keys', () => {
      const storage = new Storadapt(adapter)

      storage.set('user:123:profile', { name: 'Alice' })
      expect(storage.get('user:123:profile')).toEqual({ name: 'Alice' })
    })

    it('should handle rapid add and remove operations', () => {
      const storage = new Storadapt(adapter)

      storage.set('items', ['a', 'b', 'c', 'd', 'e'])

      storage.remove('items.2')
      storage.set('items.2', 'C')
      storage.remove('items.4')

      const items = storage.get('items')
      expect(items[2]).toBe('C')
      expect(items[4]).toBeUndefined()
    })
  }) */
})
