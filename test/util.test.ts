import superjson from 'superjson'
import { describe, expect, it } from 'vitest'

import {
  deserialize,
  isArrayIndex,
  isObject,
  isString,
  isSuperJsonFormat,
  parsePath,
  serialize,
  traversePath
} from '../src/util'

describe('Utility Functions', () => {
  describe('isString', () => {
    it('should return true for string literals', () => {
      expect(isString('hello')).toBe(true)
      expect(isString('')).toBe(true)
    })

    it('should return true for String objects', () => {
      // eslint-disable-next-line unicorn/new-for-builtins
      expect(isString(new String('hello'))).toBe(true)
    })

    it('should return false for non-strings', () => {
      expect(isString(123)).toBe(false)
      expect(isString(null)).toBe(false)
      expect(isString(undefined)).toBe(false)
      expect(isString({})).toBe(false)
      expect(isString([])).toBe(false)
    })
  })

  describe('isObject', () => {
    it('should return true for plain objects', () => {
      expect(isObject({})).toBe(true)
      expect(isObject({ key: 'value' })).toBe(true)
    })

    it('should return false for arrays', () => {
      expect(isObject([])).toBe(false)
      expect(isObject([1, 2, 3])).toBe(false)
    })

    it('should return false for null', () => {
      expect(isObject(null)).toBe(false)
    })

    it('should return false for primitives', () => {
      expect(isObject('string')).toBe(false)
      expect(isObject(123)).toBe(false)
      expect(isObject(true)).toBe(false)
      expect(isObject(undefined)).toBe(false)
    })

    it('should return false for instances', () => {
      expect(isObject(new Date())).toBe(false)
      expect(isObject(new Map())).toBe(false)
      expect(isObject(new Set())).toBe(false)
    })
  })

  describe('isArrayIndex', () => {
    it('should return true for valid array indices', () => {
      expect(isArrayIndex('0')).toBe(true)
      expect(isArrayIndex('1')).toBe(true)
      expect(isArrayIndex('42')).toBe(true)
      expect(isArrayIndex('999')).toBe(true)
    })

    it('should return false for non-numeric strings', () => {
      expect(isArrayIndex('abc')).toBe(false)
      expect(isArrayIndex('1a')).toBe(false)
      expect(isArrayIndex('a1')).toBe(false)
    })

    it('should return false for negative numbers', () => {
      expect(isArrayIndex('-1')).toBe(false)
      expect(isArrayIndex('-42')).toBe(false)
    })

    it('should return false for decimal numbers', () => {
      expect(isArrayIndex('1.5')).toBe(false)
      expect(isArrayIndex('0.1')).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(isArrayIndex('')).toBe(false)
    })
  })

  describe('isSuperJsonFormat', () => {
    it('should detect SuperJSON format', () => {
      const superJsonStr = superjson.stringify({ a: 1, b: undefined })
      expect(isSuperJsonFormat(superJsonStr)).toBe(true)
    })

    it('should reject plain JSON', () => {
      expect(isSuperJsonFormat('{"a":1}')).toBe(false)
      expect(isSuperJsonFormat('[1,2,3]')).toBe(false)
    })

    it('should reject plain strings', () => {
      expect(isSuperJsonFormat('hello')).toBe(false)
      expect(isSuperJsonFormat('123')).toBe(false)
    })

    it('should reject invalid JSON', () => {
      expect(isSuperJsonFormat('{invalid}')).toBe(false)
    })
  })

  describe('serialize & deserialize', () => {
    it('should serialize and deserialize a plain object', () => {
      const obj = { name: 'Alice', age: 25 }
      const serialized = serialize(obj)
      expect(typeof serialized).toBe('string')

      const deserialized = deserialize(serialized)
      expect(deserialized).toEqual(obj)
    })

    it('should return string directly when serializing string', () => {
      const str = 'hello world'
      const serialized = serialize(str)
      expect(serialized).toBe(str)
    })

    it('should serialize and deserialize special types via superjson', () => {
      const obj = { date: new Date('2024-01-01T00:00:00Z'), undef: undefined }
      const serialized = serialize(obj)
      // superjson 格式包含 json + meta 字段
      expect(isSuperJsonFormat(serialized)).toBe(true)

      const deserialized = deserialize(serialized)
      expect(deserialized).toEqual(obj)
      expect(deserialized.date).toBeInstanceOf(Date)
      expect(deserialized.date.toISOString()).toBe('2024-01-01T00:00:00.000Z')
    })

    it('should fall back to JSON.parse when not superjson', () => {
      const plainJson = '{"a":1,"b":2}'
      const result = deserialize(plainJson)
      expect(result).toEqual({ a: 1, b: 2 })
    })

    it('should return raw string when JSON.parse fails', () => {
      const invalid = '{invalid json}'
      const result = deserialize(invalid)
      expect(result).toBe(invalid)
    })

    it('should return null when input is null', () => {
      expect(deserialize(null)).toBeNull()
    })

    it('should return non-string input directly', () => {
      const input = { a: 1 } as any
      expect(deserialize(input)).toBe(input)
    })
  })

  describe('parsePath', () => {
    it('should parse simple path', () => {
      expect(parsePath('user.name')).toEqual(['user', 'name'])
    })

    it('should parse nested path', () => {
      expect(parsePath('user.profile.email')).toEqual([
        'user',
        'profile',
        'email'
      ])
    })

    it('should parse array index path', () => {
      expect(parsePath('users.0.name')).toEqual(['users', '0', 'name'])
    })

    it('should filter empty segments', () => {
      expect(parsePath('user..name')).toEqual(['user', 'name'])
      expect(parsePath('.user.name.')).toEqual(['user', 'name'])
    })

    it('should handle single segment', () => {
      expect(parsePath('user')).toEqual(['user'])
    })

    it('should handle empty path', () => {
      expect(parsePath('')).toEqual([])
    })
  })

  describe('traversePath', () => {
    describe('Object traversal', () => {
      it('should traverse simple object path', () => {
        const obj = { user: { name: 'John' } }
        const result = traversePath(obj, ['user', 'name'])
        expect(result).toBe('John')
      })

      it('should traverse nested object path', () => {
        const obj = {
          data: {
            user: {
              profile: {
                email: 'test@example.com'
              }
            }
          }
        }
        const result = traversePath(obj, ['data', 'user', 'profile', 'email'])
        expect(result).toBe('test@example.com')
      })

      it('should throw error for non-existent path', () => {
        const obj = { user: { name: 'John' } }
        expect(() => traversePath(obj, ['user', 'age'])).toThrow()
      })

      it('should return parent when stopBeforeLast is true', () => {
        const obj = { user: { name: 'John' } }
        const result = traversePath(obj, ['user', 'name'], {
          stopBeforeLast: true
        })
        expect(result).toEqual({ name: 'John' })
      })
    })

    describe('Array traversal', () => {
      it('should traverse array by index', () => {
        const obj = { items: ['a', 'b', 'c'] }
        const result = traversePath(obj, ['items', '1'])
        expect(result).toBe('b')
      })

      it('should traverse nested array', () => {
        const obj = {
          users: [{ name: 'Alice' }, { name: 'Bob' }]
        }
        const result = traversePath(obj, ['users', '1', 'name'])
        expect(result).toBe('Bob')
      })

      it('should throw error for out of bounds index', () => {
        const obj = { items: ['a', 'b'] }
        expect(() => traversePath(obj, ['items', '5'])).toThrow(/out of bounds/)
      })

      it('should throw error for negative index', () => {
        const obj = { items: ['a', 'b'] }
        expect(() => traversePath(obj, ['items', '-1'])).toThrow(
          /items is not an object/
        )
      })
    })

    describe('Path creation', () => {
      it('should create object path when createPath is true', () => {
        const obj: any = {}
        traversePath(obj, ['user', 'profile'], {
          createPath: true
        })
        expect(JSON.stringify(obj.user)).toEqual(
          JSON.stringify({ profile: {} })
        )
      })

      it('should create array when next segment is array index', () => {
        const obj: any = {}
        traversePath(obj, ['items', '0'], {
          stopBeforeLast: true,
          createPath: true
        })
        expect(Array.isArray(obj.items)).toBe(true)
      })

      it('should expand array to required length', () => {
        const obj: any = { items: ['a'] }
        traversePath(obj, ['items', '3'], {
          stopBeforeLast: false,
          createPath: true
        })
        expect(obj.items.length).toBe(4)
        expect(obj.items[1]).toBeUndefined()
        expect(obj.items[2]).toBeUndefined()
      })
    })

    describe('Error handling with shouldThrowError', () => {
      it('should suppress errors when shouldThrowError returns false', () => {
        const obj = { user: { name: 'John' } }
        const result = traversePath(obj, ['user', 'age'], {
          shouldThrowError: () => false
        })
        expect(result).toBeUndefined()
      })

      it('should throw error when shouldThrowError returns true', () => {
        const obj = { user: { name: 'John' } }
        expect(() =>
          traversePath(obj, ['user', 'age'], {
            shouldThrowError: () => true
          })
        ).toThrow()
      })

      it('should receive error object in shouldThrowError', () => {
        const obj = { user: { name: 'John' } }
        let errorReceived: Error | null = null

        traversePath(obj, ['user', 'age'], {
          shouldThrowError: (error) => {
            errorReceived = error
            return false
          }
        })

        expect(errorReceived).toBeInstanceOf(Error)
        expect((errorReceived as any)?.message).toContain('does not exist')
      })
    })

    describe('Type validation', () => {
      it('should throw error when path expects array but finds object', () => {
        const obj = { data: { value: 'test' } }
        expect(() => traversePath(obj, ['data', '0'])).toThrow(
          /is not an array/
        )
      })

      it('should throw error when path expects object but finds primitive', () => {
        const obj = { data: 'string' }
        expect(() => traversePath(obj, ['data', 'property'])).toThrow(
          /is not an object/
        )
      })

      it('should throw error for null in path', () => {
        const obj = { data: null as any }
        expect(() => traversePath(obj, ['data', 'property'])).toThrow(
          /null or undefined/
        )
      })
    })

    describe('Complex scenarios', () => {
      it('should handle mixed object and array traversal', () => {
        const obj = {
          users: [
            {
              tags: ['admin', 'user'],
              settings: { theme: 'dark' }
            }
          ]
        }

        expect(traversePath(obj, ['users', '0', 'tags', '1'])).toBe('user')
        expect(traversePath(obj, ['users', '0', 'settings', 'theme'])).toBe(
          'dark'
        )
      })

      it('should handle deeply nested structures', () => {
        const obj = {
          level1: {
            level2: {
              level3: {
                level4: {
                  level5: 'deep value'
                }
              }
            }
          }
        }

        const result = traversePath(obj, [
          'level1',
          'level2',
          'level3',
          'level4',
          'level5'
        ])
        expect(result).toBe('deep value')
      })
    })
  })
})
