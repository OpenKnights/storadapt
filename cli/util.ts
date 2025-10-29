/* eslint-disable no-console */
import type {
  FileInfo,
  Flags,
  FlagSchema,
  ParsedArgs,
  PlayOptions
} from './types'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { parseArgs as nodeParseArgs } from 'node:util'
import { NODE_RESERVED_NAMES } from './constants'

// ==================== Argument Parsing Helpers ====================

/**
 * Convert alias to full flag name
 */
function aliasToFullName(key: string, flags: Flags): string {
  if (!flags) return key

  // Check if there's a corresponding long name
  for (const [name, schema] of Object.entries(flags)) {
    if (schema.alias === key) {
      return name
    }
  }

  return key
}

/**
 * Parse a single flag value based on its schema
 */
function parseFlagValue(schema: FlagSchema, rawValue: any) {
  const { type, default: defaultValue } = schema

  if (rawValue === undefined) {
    return defaultValue
  }

  if (type === Boolean) {
    return rawValue === true || rawValue === 'true'
  }

  if (type === String) return String(rawValue)

  if (type === Number) return Number(rawValue)

  if (typeof type === 'function') {
    return type(rawValue)
  }

  return rawValue
}

/**
 * Build a set of arguments that need special handling
 * Only flags defined in the config with Node reserved names need special handling
 */
function buildSpecialArgs(flags?: Flags): Set<string> {
  const specialArgs = new Set<string>()

  if (!flags) return specialArgs

  Object.entries(flags).forEach(([name, schema]) => {
    if (NODE_RESERVED_NAMES.includes(name as any)) {
      specialArgs.add(`--${name}`)
      if (schema.alias) {
        specialArgs.add(`-${schema.alias}`)
      }
    }
  })

  return specialArgs
}

/**
 * Separate special arguments and regular arguments from argv
 */
function separateArgs(
  argv: string[],
  specialArgs: Set<string>,
  flags: Flags
): {
  special: Record<string, boolean | string>
  remaining: string[]
} {
  const special: Record<string, boolean | string> = {}
  const remaining: string[] = []

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]

    if (specialArgs.has(arg)) {
      const rawKey = arg.replace(/^-+/, '') // Remove -- or -
      const isAlias = !NODE_RESERVED_NAMES.includes(rawKey as any)
      const fullName = isAlias ? aliasToFullName(rawKey, flags) : rawKey

      // Check if next argument is a value (doesn't start with -)
      const nextArg = argv[i + 1]
      if (nextArg && !nextArg.startsWith('-')) {
        special[fullName] = nextArg
        i++ // Skip next argument
      } else {
        special[fullName] = true
      }
    } else {
      remaining.push(arg)
    }
  }

  return { special, remaining }
}

/**
 * Build parseArgs configuration
 * Exclude arguments that have been specially handled
 */
function buildParseArgsOptions(flags?: Flags, specialArgs?: Set<string>) {
  if (!flags) return { options: {}, strict: false }

  const options: Record<string, any> = {}

  Object.entries(flags).forEach(([name, schema]) => {
    const isSpecial =
      specialArgs?.has(`--${name}`) ||
      (schema.alias && specialArgs?.has(`-${schema.alias}`))

    if (isSpecial) {
      return
    }

    const option: any = {
      type: schema.type === Boolean ? 'boolean' : 'string'
    }

    if (schema.alias) {
      option.short = schema.alias
    }

    options[name] = option
  })

  return { options, strict: false }
}

// ==================== Main Parser ====================

/**
 * Parse command line arguments
 * @param rawArgv - Raw argument array (default: process.argv.slice(2))
 * @param flags - Flag definitions
 * @returns Parsed arguments object (only contains long names)
 */
export function parseArguments(
  rawArgv: string[] = process.argv.slice(2),
  flags: Flags = {}
): ParsedArgs {
  const specialArgs = buildSpecialArgs(flags)
  const { special, remaining } = separateArgs(rawArgv, specialArgs, flags)

  let parsed: any = { values: {}, positionals: [] }
  if (remaining.length > 0) {
    try {
      const parseArgsOptions = buildParseArgsOptions(flags, specialArgs)
      parsed = nodeParseArgs({
        args: remaining,
        ...parseArgsOptions,
        allowPositionals: true
      })
    } catch (error) {
      console.error('Error parsing arguments:', error)
    }
  }

  const args: ParsedArgs = {
    ...special,
    ...parsed.values,
    _: parsed.positionals
  }

  if (flags) {
    Object.entries(flags).forEach(([name, schema]) => {
      const rawValue = args[name]

      if (rawValue === undefined && schema.default !== undefined) {
        args[name] = schema.default
        return
      }

      args[name] = parseFlagValue(schema, rawValue)
    })
  }

  return args
}

// ==================== File System Utilities ====================

/**
 * Recursively get all .ts files in a directory
 * @param rootDir - Path relative to project root, e.g. './playground'
 * @returns List of files
 */
export function getAvailableFiles(rootDir: string): FileInfo[] {
  const projectRoot = process.cwd()
  const targetDir = path.resolve(projectRoot, rootDir)

  // Check if directory exists
  if (!fs.existsSync(targetDir)) {
    return []
  }

  const files: FileInfo[] = []

  /**
   * Recursively walk through directory
   */
  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        // Skip common directories that don't need traversal
        if (['node_modules', 'dist', '.git', 'coverage'].includes(entry.name)) {
          continue
        }
        // Recurse into subdirectory
        walk(fullPath)
      } else if (entry.isFile() && entry.name.endsWith('.ts')) {
        // Calculate relative path (relative to targetDir)
        const relativePath = path.relative(targetDir, fullPath)

        files.push({
          name: entry.name.replace('.ts', ''),
          path: fullPath,
          relativePath: relativePath.replace(/\\/g, '/') // Normalize to /
        })
      }
    }
  }

  walk(targetDir)

  // Sort by relative path
  return files.sort((a, b) => a.relativePath.localeCompare(b.relativePath))
}

// ==================== Output Helpers ====================

/**
 * Print file list (for --list command)
 */
export function printFileList(rootDir: string): void {
  const files = getAvailableFiles(rootDir)

  if (files.length === 0) {
    console.log(`❌ No .ts files found in ${rootDir} directory`)
    return
  }

  console.log(`\n📁 Available files in ${rootDir} (${files.length} total):\n`)

  // Group by directory
  const grouped: Record<string, FileInfo[]> = {}

  files.forEach((file) => {
    const dir = path.dirname(file.relativePath)
    const dirKey = dir === '.' ? '📄 Root directory' : `📁 ${dir}`

    if (!grouped[dirKey]) {
      grouped[dirKey] = []
    }
    grouped[dirKey].push(file)
  })

  // Output
  let index = 1
  for (const [dir, fileList] of Object.entries(grouped)) {
    console.log(`${dir}:`)
    fileList.forEach((file) => {
      console.log(`  ${index.toString().padStart(2)}. ${file.name}`)
      index++
    })
    console.log('')
  }
}

/**
 * Generate help information
 */
export function generateHelp(options: PlayOptions): string {
  const { name, version, description, flags } = options

  let help = `● ${name} cli ─ v${version}${description ? `\n  ${description}` : ''}`
  help += '\n\nUsage:\n'
  help += `  ${name} [options] [value]\n\n`

  if (flags && Object.keys(flags).length > 0) {
    help += 'Options:\n'

    Object.entries(flags).forEach(([name, schema]) => {
      const flag = `--${name}`
      const alias = schema.alias ? `, -${schema.alias}` : ''
      const param = schema.parameter ? ` ${schema.parameter}` : ''
      const desc = schema.description || ''
      const def =
        schema.default !== undefined ? ` (default: ${schema.default})` : ''

      help += `  ${(flag + alias + param).padEnd(25)} ${desc}${def}\n`
    })
  }

  help += '\nExamples:\n'
  help += `  ${name} --file test\n`
  help += `  ${name} --watch -f test\n`
  help += `  ${name} --version\n`
  help += `  ${name} --help\n`
  help += `  ${name} --list\n`

  return help
}
