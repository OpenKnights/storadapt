import type { TraversePathOptions } from './types'

/**
 * Check if value is a string
 */
export const isString = (value: unknown): value is string => {
  // eslint-disable-next-line unicorn/no-instanceof-builtins
  return typeof value === 'string' || value instanceof String
}

/**
 * Check if value is a plain object (not array, not null)
 */
export const isObject = (value: unknown): value is Record<string, any> => {
  return !!value && value.constructor === Object
}

/**
 * Check if string is a valid array index
 */
export function isArrayIndex(str: string): boolean {
  return /^\d+$/.test(str)
}

/**
 * Check if string is valid JSON
 */
export const isJsonString = (str: string): boolean => {
  if (!isString(str)) return false

  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

/**
 * Parse path string to array
 * @example parsePath('user.infos.0.name') => ['user', 'infos', '0', 'name']
 */
export function parsePath(path: string): string[] {
  return path.split('.').filter(Boolean)
}

/**
 * Traverse path in object/array
 * Core logic for deep path operations
 *
 * @param obj - Target object
 * @param path - Path segments array
 * @param options - Behavior configuration for traversal.
 * @returns Current value at the traversed path
 */
export function traversePath(
  obj: any,
  path: string[],
  options?: TraversePathOptions
): any {
  const {
    stopBeforeLast = false,
    createPath = false,
    shouldThrowError
  } = options || {}

  let current = obj
  const endIndex = stopBeforeLast ? path.length - 1 : path.length

  for (let i = 0; i < endIndex; i++) {
    const segment = path[i]
    const nextSegment = i < path.length - 1 ? path[i + 1] : undefined
    const isCurrentArray = isArrayIndex(segment)
    const isNextArray = nextSegment ? isArrayIndex(nextSegment) : false

    // Handle array index
    if (isCurrentArray) {
      if (!Array.isArray(current)) {
        const error = new Error(`${path.slice(0, i).join('.')} is not an array`)
        if (shouldThrowError && !shouldThrowError(error)) return
        throw error
      }

      const index = Number.parseInt(segment, 10)

      // Negative index check
      if (index < 0) {
        const error = new Error(`Array index ${index} cannot be negative`)
        if (shouldThrowError && !shouldThrowError(error)) return
        throw error
      }

      if (index >= current.length) {
        if (!createPath) {
          const error = new Error(
            `Array index ${index} out of bounds at ${path.slice(0, i + 1).join('.')}`
          )
          if (shouldThrowError && !shouldThrowError(error)) return
          throw error
        }

        // Expand the array to the required length
        while (current.length <= index) {
          current.push(undefined)
        }
      }

      // Auto-create next level if current is null/undefined
      if (current[index] == null) {
        if (!createPath) {
          const error = new Error(
            `Path does not exist: ${path.slice(0, i + 1).join('.')}`
          )
          if (shouldThrowError && !shouldThrowError(error)) return
          throw error
        }
        current[index] = isNextArray ? [] : {}
      }

      current = current[index]
    } else {
      // Handle object property
      if (!isObject(current)) {
        const error = new Error(
          `${path.slice(0, i).join('.')} is not an object`
        )
        if (shouldThrowError && !shouldThrowError(error)) return
        throw error
      }

      if (!(segment in current)) {
        if (!createPath) {
          const error = new Error(
            `Property "${segment}" does not exist at ${path.slice(0, i + 1).join('.')}`
          )
          if (shouldThrowError && !shouldThrowError(error)) return
          throw error
        }
        current[segment] = isNextArray ? [] : {}
      }

      current = current[segment]
    }

    // Check if intermediate value is null/undefined
    if (current == null && i < endIndex - 1) {
      const error = new Error(
        `Path ${path.slice(0, i + 1).join('.')} is null or undefined`
      )
      if (shouldThrowError && !shouldThrowError(error)) return
      throw error
    }
  }

  return current
}
