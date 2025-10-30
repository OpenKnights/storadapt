import { describe, expect, it } from 'vitest'
import {
  isArrayIndex,
  isJsonString,
  isObject,
  isString,
  parsePath,
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

  describe('isJsonString', () => {
    it('should return true for valid JSON strings', () => {
      expect(isJsonString('{}')).toBe(true)
      expect(isJsonString('[]')).toBe(true)
      expect(isJsonString('{"key":"value"}')).toBe(true)
      expect(isJsonString('[1,2,3]')).toBe(true)
      expect(isJsonString('null')).toBe(true)
      expect(isJsonString('true')).toBe(true)
      expect(isJsonString('123')).toBe(true)
      expect(isJsonString('"string"')).toBe(true)
    })

    it('should return false for invalid JSON', () => {
      expect(isJsonString('{invalid}')).toBe(false)
      expect(isJsonString('{')).toBe(false)
      expect(isJsonString('plain text')).toBe(false)
      expect(isJsonString('undefined')).toBe(false)
    })

    it('should return false for non-strings', () => {
      expect(isJsonString(123 as any)).toBe(false)
      expect(isJsonString({} as any)).toBe(false)
      expect(isJsonString(null as any)).toBe(false)
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
          /cannot be negative/
        )
      })
    })

    describe('Path creation', () => {
      it('should create object path when createPath is true', () => {
        const obj = {}
        const result = traversePath(obj, ['user', 'profile'], {
          stopBeforeLast: true,
          createPath: true
        })
        expect(result).toEqual({ profile: {} })
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
