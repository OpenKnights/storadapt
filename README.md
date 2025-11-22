# Storadapt

> A flexible storage adapter with deep path updates and automatic serialization.

[![npm version](https://img.shields.io/npm/v/storadapt.svg)](https://www.npmjs.com/package/storadapt)
[![npm downloads](https://img.shields.io/npm/dm/storadapt.svg)](https://www.npmjs.com/package/storadapt)
[![bundle size](https://img.shields.io/bundlephobia/minzip/storadapt.svg)](https://bundlephobia.com/package/storadapt)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[English](./README.md) | [中文](./README_zh.md)

## ✨ Features

- 🎯 **Deep Path Access** - Access nested objects using dot notation (e.g., `user.profile.name`)
- 🔄 **Auto Serialization** - Automatic JSON serialization and deserialization
- 🔌 **Adapter Pattern** - Support for multiple storage backends (localStorage, sessionStorage, custom storage)
- 🛡️ **Type Safe** - Full TypeScript support with type inference
- 📦 **Zero Dependencies** - No external dependencies in the core library
- ⚡ **Lightweight** - Minimal bundle size
- 🧪 **Well Tested** - Comprehensive test coverage

## 📦 Installation

```bash
npm install storadapt
# or
pnpm install storadapt
# or
yarn install storadapt
```

## 🚀 Quick Start

### Browser Storage

```typescript
import { createBrowserStoradapt } from 'storadapt'

// Create localStorage instance
const storage = createBrowserStoradapt('localStorage')

// Simple operations
storage.set('username', 'Alice')
storage.get('username') // 'Alice'

// Object operations
storage.set('user', {
  name: 'Alice',
  age: 30,
  email: 'alice@example.com'
})

// Deep path access
storage.get('user.name') // 'Alice'
storage.set('user.age', 31)
```

### Custom Storage Adapter

```typescript
import { createStoradapt } from 'storadapt'

// Create custom adapter
const adapter = {
  getItem: (key) => {
    /* your implementation */
  },
  setItem: (key, value) => {
    /* your implementation */
  },
  removeItem: (key) => {
    /* your implementation */
  },
  clear: () => {
    /* your implementation */
  },
  length: () => {
    /* your implementation */
  },
  key: (index) => {
    /* your implementation */
  }
}

const storage = createStoradapt(adapter)
```

## 📖 API Documentation

### Basic Operations

#### `get<T>(key: string, options?: GetOptions<T>): T | null`

Retrieve value with automatic JSON deserialization.

```typescript
// Simple get
const name = storage.get('username')

// With default value
const theme = storage.get('theme', { defaultValue: 'light' })

// Deep path access
const email = storage.get('user.profile.email')

// Array index access
const firstItem = storage.get('items.0')
```

#### `set(key: string, value: any, options?: SetOptions): void`

Store value with automatic serialization.

```typescript
// Simple set
storage.set('username', 'Alice')

// Object set
storage.set('user', { name: 'Alice', age: 30 })

// Deep path set
storage.set('user.profile.email', 'alice@example.com')

// Auto-create intermediate paths
storage.set('user.settings.theme', 'dark', { createPath: true })

// Array operations
storage.set('items.0', 'first item')
```

#### `remove(key: string): void`

Remove key or deep path property.

```typescript
// Remove entire key
storage.remove('username')

// Remove deep property
storage.remove('user.profile.email')

// Remove array element
storage.remove('items.0')
```

#### `has(key: string): boolean`

Check if key or deep path exists.

```typescript
storage.has('username') // true or false
storage.has('user.profile.email') // true or false
```

#### `clear(): void`

Clear all storage.

```typescript
storage.clear()
```

#### `key(index: number): string | null`

Get key name by index.

```typescript
const firstKey = storage.key(0)
```

#### `length: number`

Get the number of stored items.

```typescript
const count = storage.length
```

### Options

#### GetOptions

```typescript
interface GetOptions<T> {
  defaultValue?: T // Default value when key doesn't exist
}
```

#### SetOptions

```typescript
interface SetOptions {
  createPath?: boolean // Auto-create intermediate objects (default: true)
}
```

## 🎯 Usage Examples

### User Profile Management

```typescript
// Initialize user data
storage.set('user:123', {
  id: 123,
  name: 'Alice',
  email: 'alice@example.com',
  preferences: {
    theme: 'dark',
    language: 'en'
  }
})

// Read user name
const name = storage.get('user:123.name') // 'Alice'

// Update theme preference
storage.set('user:123.preferences.theme', 'light')

// Add new preference
storage.set('user:123.preferences.notifications', true)

// Remove specific property
storage.remove('user:123.preferences.notifications')
```

### Shopping Cart

```typescript
// Initialize cart
storage.set('cart', {
  items: [],
  total: 0
})

// Add items
storage.set('cart.items', [
  { id: 1, name: 'Product A', price: 10, quantity: 2 },
  { id: 2, name: 'Product B', price: 15, quantity: 1 }
])

// Update first item quantity
storage.set('cart.items.0.quantity', 3)

// Get second item name
const itemName = storage.get('cart.items.1.name') // 'Product B'

// Remove second item
storage.remove('cart.items.1')
```

### Configuration Management

```typescript
// Initialize empty config
storage.set('config', {})

// Add nested configuration with auto-path creation
storage.set('config.app.name', 'MyApp', { createPath: true })
storage.set('config.app.version', '1.0.0')
storage.set('config.features.darkMode', true, { createPath: true })

// Read configuration
const appName = storage.get('config.app.name') // 'MyApp'
const darkMode = storage.get('config.features.darkMode') // true
```

### Array Operations

```typescript
// Initialize array
storage.set('todos', [
  { id: 1, text: 'Buy milk', done: false },
  { id: 2, text: 'Walk dog', done: true }
])

// Access by index
const firstTodo = storage.get('todos.0') // { id: 1, text: 'Buy milk', done: false }

// Update property
storage.set('todos.0.done', true)

// Add new item (with path creation)
storage.set('todos.2', { id: 3, text: 'Read book', done: false })

// Get specific property
const secondTodoText = storage.get('todos.1.text') // 'Walk dog'
```

### Complex Nested Structures

```typescript
storage.set('organization', {
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
})

// Access deeply nested data
const deptName = storage.get('organization.company.departments.0.name') // 'Engineering'
const memberName = storage.get(
  'organization.company.departments.0.teams.0.members.1.name'
) // 'Bob'

// Update deeply nested data
storage.set(
  'organization.company.departments.0.teams.0.members.0.role',
  'Senior Lead'
)
```

## 🔧 Advanced Usage

### Custom Memory Adapter

```typescript
import { createStoradapt } from 'storadapt'

function createMemoryAdapter() {
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
    length: () => Object.keys(store).length,
    key: (index: number) => Object.keys(store)[index] || null
  }
}

const storage = createStoradapt(createMemoryAdapter())
```

### Node.js with node-localstorage

```typescript
import { LocalStorage } from 'node-localstorage'
import { createStoradapt } from 'storadapt'

const localStorage = new LocalStorage('./scratch')

const adapter = {
  getItem: (key: string) => localStorage.getItem(key),
  setItem: (key: string, value: string) => localStorage.setItem(key, value),
  removeItem: (key: string) => localStorage.removeItem(key),
  clear: () => localStorage.clear(),
  length: () => localStorage.length,
  key: (index: number) => localStorage.key(index)
}

const storage = createStoradapt(adapter)
```

## 🎨 TypeScript Support

Storadapt is written in TypeScript and provides full type support:

```typescript
interface User {
  id: number
  name: string
  email: string
}

// Type-safe get
const user = storage.get<User>('user')

// Type-safe set
storage.set('user', {
  id: 1,
  name: 'Alice',
  email: 'alice@example.com'
})

// Type inference
const name = storage.get<string>('user.name')
```

## ⚠️ Important Notes

### Deep Path Behavior

1. **Path Auto-creation**: By default, createPath is false. Intermediate objects or arrays will not be created automatically.

```typescript
// This will throw an error or fail silently if user.settings does not exist
storage.set('user.settings.theme', 'dark')

// Enable auto-creation
storage.set('user.settings.theme', 'dark', { createPath: true })
```

2. **Array Index**: Numeric segments are treated as array indices.

```typescript
storage.set('items', [])
storage.set('items.0', 'first') // items[0] = 'first'
storage.set('items.1', 'second') // items[1] = 'second'
```

3. **Type Mismatch**: Operations will fail if the path type doesn't match the data type.

```typescript
storage.set('user', { name: 'Alice' })
storage.get('user.name.age') // Will return null (name is string, not object)
```

### Error Handling

Storadapt handles errors gracefully and logs them to the console:

```typescript
// Non-existent path returns null
const value = storage.get('non.existent.path') // null

// With default value
const value = storage.get('non.existent.path', { defaultValue: 'default' }) // 'default'

// Invalid operations are logged but don't throw
storage.set('user', 'string')
storage.set('user.profile.name', 'Alice') // Error logged, operation skipped
```

## 🎯 Use Cases

Storadapt is ideal for the following scenarios:

- 🌐 **Browser** **Applications** – Wrapper for localStorage / sessionStorage
- 📱 **Mobile** **Applications** – Adapters for AsyncStorage and similar APIs
- 🧪 **Testing** **Environments** – In-memory storage simulation
- 🔧 **Configuration** **Management** – Storing and accessing complex configuration data
- 🛒 **State** **Persistence** – Persisting application state locally
- 📊 **Data** **Caching** – Structured data caching solutions

## 🔄 Comparison with Other Approaches

### Traditional localStorage

```typescript
// ❌ Traditional way
const user = JSON.parse(localStorage.getItem('user') || '{}')
user.profile.email = 'new@example.com'
localStorage.setItem('user', JSON.stringify(user))

// ✅ Using Storadapt
storage.set('user.profile.email', 'new@example.com', { createPath: true })
```

### Advantages

- No need for manual serialization/deserialization
- More intuitive deep path access
- Automatic type conversion
- Better error handling
- TypeScript support

## 📄 License

[MIT](./LICENSE) License © 2025-PRESENT [king3](https://github.com/coderking3)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

Feel free to check the [issues page](https://github.com/OpenKnights/storadapt/issues).
