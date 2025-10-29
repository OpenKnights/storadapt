// ==================== Flag Types ====================

export type FlagType<ReturnType = any> = (value: any) => ReturnType

export type FlagParameter = `<${string}>` | `[${string}]`

export interface FlagSchema<T = any> {
  type: FlagType<T>
  alias?: string
  default?: T
  description?: string
  parameter?: FlagParameter
}

export interface Flags {
  [flagName: string]: FlagSchema
}

// ==================== CLI Options ====================

export interface PlayOptions {
  name?: string
  version?: string
  description?: string
  flags?: Flags
  rootDir?: string
  tsconfig?: string
}

// ==================== Parser Types ====================

export interface ParsedArgs {
  [key: string]: any
  _: string[] // Positional arguments
}

// ==================== Utility Types ====================

export type Recordable<T> = Record<string, T>

export interface FileInfo {
  name: string // File name (without .ts extension)
  path: string // Full path
  relativePath: string // Relative path from rootDir (for display)
}
