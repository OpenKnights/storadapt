/* eslint-disable no-console */
import type { PlayOptions } from './types'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { generateHelp, parseArguments, printFileList } from './util'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const __root = process.cwd()

// ==================== Path Resolution ====================

/**
 * Resolve file path
 */
function resolveFilePath(file: string, rootDir?: string): string {
  const filePath = file.endsWith('.ts') ? file : `${file}.ts`

  if (rootDir) {
    return path.resolve(__root, rootDir, filePath)
  }

  if (file.includes('/') || file.includes('\\') || path.isAbsolute(file)) {
    return path.resolve(__root, filePath)
  }

  // Default to project root directory
  return filePath
}

/**
 * Resolve tsconfig path
 */
function resolveTsconfigPath(
  tsconfigArg?: string,
  defaultPath?: string
): string | undefined {
  // 1. If tsconfig argument is provided via command line
  if (tsconfigArg) {
    const resolvedPath = path.isAbsolute(tsconfigArg)
      ? tsconfigArg
      : path.resolve(__root, tsconfigArg)

    if (fs.existsSync(resolvedPath)) {
      return resolvedPath
    } else {
      console.warn(`⚠️  Specified tsconfig does not exist: ${resolvedPath}`)
    }
  }

  // 2. If default path is provided in config (relative to project root)
  if (defaultPath) {
    const resolvedPath = path.isAbsolute(defaultPath)
      ? defaultPath
      : path.resolve(__root, defaultPath)

    if (fs.existsSync(resolvedPath)) {
      return resolvedPath
    }
  }

  // 3. Try tsconfig.json in project root
  const rootConfig = path.join(__root, 'tsconfig.json')
  if (fs.existsSync(rootConfig)) {
    return rootConfig
  }

  // 4. Not found, return undefined (tsx will use default config)
  return undefined
}

// ==================== TSX Runner ====================

/**
 * Run tsx
 */
function runTsx(
  filePath: string,
  options: { watch?: boolean; tsconfigPath?: string } = {}
) {
  // Build tsx command
  const tsxCommand: string[] = []

  if (options.watch) {
    tsxCommand.push('watch')
  }

  if (options.tsconfigPath && fs.existsSync(options.tsconfigPath)) {
    tsxCommand.push('--tsconfig', options.tsconfigPath)
  }

  tsxCommand.push(filePath)

  // Display execution info
  console.log(`✅ Running: ${path.relative(process.cwd(), filePath)}`)
  if (options.watch) {
    console.log(`👀 Watch mode enabled`)
  }
  console.log('')

  // Cross-platform configuration
  const spawnOptions: any = {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..')
  }

  if (process.platform === 'win32') {
    spawnOptions.shell = true
  }

  // Execute tsx
  const child = spawn('tsx', tsxCommand, spawnOptions)

  child.on('error', (err: any) => {
    console.error('\n❌ Execution failed:', err.message)
    if (err.message.includes('ENOENT')) {
      console.log('\n💡 Please install tsx first: pnpm add -D tsx')
    }
    process.exit(1)
  })

  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.log(`\n⚠️  Process exited with code: ${code}`)
    }
    process.exit(code || 0)
  })

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n👋 Exiting...')
    child.kill('SIGINT')
    process.exit(0)
  })
}

// ==================== Main CLI Entry ====================

/**
 * Play CLI main function
 */
export function play(options?: PlayOptions) {
  const {
    name = 'play',
    version = '1.0.0',
    description = 'A simple TypeScript playground CLI',
    flags,
    rootDir,
    tsconfig
  } = options || {}

  const args = parseArguments(process.argv.slice(2), flags)

  // Handle version flag
  if (args.version) {
    console.log(
      `  ● ${name} cli ─ v${version}${description ? `\n  ${description}` : ''}`
    )
    process.exit(0)
  }

  // Handle help flag
  if (args.help) {
    console.log(generateHelp({ name, version, flags }))
    process.exit(0)
  }

  // Handle list flag
  if (args.list) {
    printFileList('./playground')
    process.exit(0)
  }

  // Resolve file and tsconfig paths
  const file = args.file || 'index'
  const filePath = resolveFilePath(file, rootDir)
  const tsconfigPath = resolveTsconfigPath(args.tsconfig, tsconfig)

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File does not exist: ${filePath}`)

    if (rootDir) {
      printFileList(rootDir)
      console.log('💡 Tip: Use -h to view help')
    }

    process.exit(1)
  }

  // Run tsx
  runTsx(filePath, {
    watch: args.watch || false,
    tsconfigPath
  })
}

// ==================== Configuration & Execution ====================

const playOptions: PlayOptions = {
  name: 'play',
  version: '1.0.0',
  description: 'A simple TypeScript playground CLI',
  flags: {
    version: {
      type: Boolean,
      alias: 'v',
      description: 'Show version number'
    },
    help: {
      type: Boolean,
      alias: 'h',
      description: 'Show help information'
    },
    file: {
      type: String,
      alias: 'f',
      default: 'index',
      description: 'File to run',
      parameter: '<path>'
    },
    list: {
      type: Boolean,
      alias: 'l',
      default: false,
      description: 'List available files'
    },
    watch: {
      type: Boolean,
      alias: 'w',
      default: false,
      description: 'Enable watch mode'
    }
  },
  rootDir: './playground', // Root directory for file lookup
  tsconfig: './tsconfig.json'
}

play(playOptions)

// ==================== Command Examples ====================

/**
 * Basic usage:
 * pnpm play                    → Run playground/index.ts with ./tsconfig.json
 * pnpm play file.ts            → Run playground/file.ts
 * pnpm play -f other           → Run playground/other.ts
 *
 * Watch mode:
 * pnpm play --watch file.ts    → Enable watch mode
 * pnpm play -w -f other        → Enable watch + specify file
 *
 * Custom tsconfig:
 * pnpm play --tsconfig ./config/tsconfig.dev.json file.ts
 * pnpm play -tsc ./tsconfig.dev.json -w file.ts
 *
 * Priority:
 * 1. Command line --tsconfig argument (highest priority)
 * 2. PlayOptions.tsconfig configuration
 * 3. tsconfig.json in current directory
 * 4. Not found, don't pass (tsx uses default config)
 */
