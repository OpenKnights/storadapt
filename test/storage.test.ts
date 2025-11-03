import type { StorageAdapter } from '../src/types'
import { beforeEach, describe, expect, it } from 'vitest'
import { Storadapt } from '../src/storage'

describe('Storadapt Storage', () => {
  let storage: Storadapt
  let mockAdapter: StorageAdapter
  let store: Record<string, string>

  beforeEach(() => {
    store = {}
    mockAdapter = {
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
    storage = new Storadapt(mockAdapter)
  })

  describe('Basic Operations', () => {
    it('should store and retrieve a string value', () => {
      storage.set('key1', 'value1')
      const result = storage.get('key1')
      expect(result).toBe('value1')
    })

    it('should store and retrieve a number', () => {
      storage.set('number', 42)
      const result = storage.get('number')
      expect(result).toBe(42)
    })

    it('should store and retrieve an object', () => {
      const obj = { name: 'test', age: 25 }
      storage.set('object', obj)
      const result = storage.get('object')
      expect(result).toEqual(obj)
    })

    it('should store and retrieve an array', () => {
      const arr = [1, 2, 3, 4, 5]
      storage.set('array', arr)
      const result = storage.get('array')
      expect(result).toEqual(arr)
    })

    it('should return null for non-existent key', () => {
      const result = storage.get('non-existent')
      expect(result).toBeNull()
    })

    it('should return default value for non-existent key', () => {
      const result = storage.get('non-existent', { defaultValue: 'default' })
      expect(result).toBe('default')
    })

    it('should remove an item', () => {
      storage.set('key1', 'value1')
      storage.remove('key1')
      const result = storage.get('key1')
      expect(result).toBeNull()
    })

    it('should clear all items', () => {
      storage.set('key1', 'value1')
      storage.set('key2', 'value2')
      storage.clear()

      expect(storage.get('key1')).toBeNull()
      expect(storage.get('key2')).toBeNull()
    })

    it('should check if key exists', () => {
      storage.set('existing', 'value')

      expect(storage.has('existing')).toBe(true)
      expect(storage.has('non-existing')).toBe(false)
    })
  })

  describe('Deep Path Operations - Get', () => {
    it('should get nested object property', () => {
      storage.set('user', { name: 'John', age: 30 })

      const name = storage.get('user.name')
      expect(name).toBe('John')
    })

    it('should get deeply nested property', () => {
      storage.set('user', {
        profile: {
          contact: {
            email: 'test@example.com'
          }
        }
      })

      const email = storage.get('user.profile.contact.email')
      expect(email).toBe('test@example.com')
    })

    it('should get array element by index', () => {
      storage.set('items', ['a', 'b', 'c'])

      const item = storage.get('items.1')
      expect(item).toBe('b')
    })

    it('should get nested array element', () => {
      storage.set('data', {
        users: [
          { name: 'Alice', age: 25 },
          { name: 'Bob', age: 30 }
        ]
      })

      const name = storage.get('data.users.1.name')
      expect(name).toBe('Bob')
    })

    it('should return null for non-existent deep path', () => {
      storage.set('user', { name: 'John' })

      const result = storage.get('user.address.city')
      expect(result).toBeNull()
    })

    it('should return default value for non-existent deep path', () => {
      storage.set('user', { name: 'John' })

      const result = storage.get('user.age', { defaultValue: 0 })
      expect(result).toBe(0)
    })
  })

  describe('Deep Path Operations - Set', () => {
    it('should set nested object property', () => {
      storage.set('user', { name: 'John' })
      storage.set('user.age', 30)

      const user = storage.get('user')
      expect(user).toEqual({ name: 'John', age: 30 })
    })

    it('should set deeply nested property', () => {
      storage.set('config', {})
      storage.set('config.theme.color', 'dark', { createPath: true })
      const color = storage.get('config.theme.color')
      expect(color).toBe('dark')
    })

    it('should set array element by index', () => {
      storage.set('items', ['a', 'b', 'c'])
      storage.set('items.1', 'B')

      const items = storage.get('items')
      expect(items).toEqual(['a', 'B', 'c'])
    })

    it('should set nested array element', () => {
      storage.set('data', {
        users: [{ name: 'Alice', age: 25 }]
      })

      storage.set('data.users.0.age', 26)

      const age = storage.get('data.users.0.age')
      expect(age).toBe(26)
    })

    it('should create new object path when createPath is true', () => {
      storage.set('new.nested.path', 'value', { createPath: true })

      const result = storage.get('new.nested.path')
      expect(result).toBe('value')
    })

    it('should auto-create path when root does not exist', () => {
      storage.set('newObj.prop', 'value')

      const result = storage.get('newObj.prop')
      expect(result).toBe('value')
    })
  })

  describe('Deep Path Operations - Remove', () => {
    it('should remove nested property', () => {
      storage.set('user', { name: 'John', age: 30 })
      storage.remove('user.age')

      const user = storage.get('user')
      expect(user).toEqual({ name: 'John' })
    })

    it('should remove array element', () => {
      storage.set('items', ['a', 'b', 'c'])
      storage.remove('items.1')

      const items = storage.get('items')
      // Note: Deleting an array element will result in `undefined`.
      expect(items[1]).toBeUndefined()
    })

    it('should remove deeply nested property', () => {
      storage.set('config', {
        theme: {
          color: 'dark',
          font: 'Arial'
        }
      })

      storage.remove('config.theme.color')

      const theme = storage.get('config.theme')
      expect(theme).toEqual({ font: 'Arial' })
    })
  })

  describe('Deep Path - Has', () => {
    it('should check nested property existence', () => {
      storage.set('user', { name: 'John', age: 30 })

      expect(storage.has('user.name')).toBe(true)
      expect(storage.has('user.email')).toBe(false)
    })

    it('should check deeply nested path', () => {
      storage.set('data', {
        user: {
          profile: {
            name: 'Alice'
          }
        }
      })

      expect(storage.has('data.user.profile.name')).toBe(true)
      expect(storage.has('data.user.profile.age')).toBe(false)
    })
  })

  describe('Length and Key', () => {
    it('should return correct length', () => {
      storage.set('key1', 'value1')
      storage.set('key2', 'value2')

      expect(storage.length).toBe(2)
    })

    it('should get key by index', () => {
      storage.set('first', 'value1')
      storage.set('second', 'value2')

      const key = storage.key(0)
      expect(['first', 'second']).toContain(key)
    })

    it('should return null for invalid index', () => {
      const key = storage.key(999)
      expect(key).toBeNull()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string as value', () => {
      storage.set('empty', '')
      expect(storage.get('empty')).toBe('')
    })

    it('should handle boolean values', () => {
      storage.set('bool', true)
      expect(storage.get('bool')).toBe(true)
    })

    it('should handle null value', () => {
      storage.set('null', null)
      expect(storage.get('null')).toBeNull()
    })

    it('should handle unicode characters', () => {
      const unicode = '你好世界 🌍'
      storage.set('unicode', unicode)
      expect(storage.get('unicode')).toBe(unicode)
    })

    it('should handle complex nested structures', () => {
      const complex = {
        users: [
          {
            name: 'Alice',
            tags: ['admin', 'user'],
            settings: {
              theme: 'dark',
              notifications: true
            }
          }
        ]
      }

      storage.set('app', complex)
      expect(storage.get('app')).toEqual(complex)
      expect(storage.get('app.users.0.name')).toBe('Alice')
      expect(storage.get('app.users.0.tags.1')).toBe('user')
      expect(storage.get('app.users.0.settings.theme')).toBe('dark')
    })

    it('should overwrite existing values', () => {
      storage.set('key', 'value1')
      storage.set('key', 'value2')
      expect(storage.get('key')).toBe('value2')
    })
  })

  describe('Error Handling', () => {
    it('should handle errors gracefully when adapter fails', () => {
      const faultyAdapter: StorageAdapter = {
        getItem: () => {
          throw new Error('Storage error')
        },
        setItem: () => {
          throw new Error('Storage error')
        },
        removeItem: () => {
          throw new Error('Storage error')
        },
        clear: () => {
          throw new Error('Storage error')
        },
        length: () => {
          throw new Error('Storage error')
        },
        key: () => {
          throw new Error('Storage error')
        }
      }

      const faultyStorage = new Storadapt(faultyAdapter)

      // 应该不抛出错误，而是返回默认值
      expect(faultyStorage.get('test')).toBeNull()
      expect(faultyStorage.length).toBe(0)
    })
  })
})
