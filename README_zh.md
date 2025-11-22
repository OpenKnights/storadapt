# Storadapt

> 一个灵活的存储适配器，支持深度路径更新和自动序列化。

[![npm version](https://img.shields.io/npm/v/storadapt.svg)](https://www.npmjs.com/package/storadapt)
[![npm downloads](https://img.shields.io/npm/dm/storadapt.svg)](https://www.npmjs.com/package/storadapt)
[![bundle size](https://img.shields.io/bundlephobia/minzip/storadapt.svg)](https://bundlephobia.com/package/storadapt)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[English](./README.md) | [中文](./README_zh.md)

## ✨ 特性

- 🎯 **深度路径访问** - 使用点号语法访问嵌套对象（如 `user.profile.name`）
- 🔄 **自动序列化** - 自动处理 JSON 序列化和反序列化
- 🔌 **适配器模式** - 支持多种存储后端（localStorage、sessionStorage、自定义存储）
- 🛡️ **类型安全** - 完整的 TypeScript 支持和类型推导
- 📦 **零依赖** - 核心库无外部依赖
- ⚡ **轻量级** - 最小化的打包体积
- 🧪 **完善测试** - 全面的测试覆盖

## 📦 安装

```bash
npm install storadapt
# or
pnpm install storadapt
# or
yarn install storadapt
```

## 🚀 快速开始

### 浏览器存储

```typescript
import { createBrowserStoradapt } from 'storadapt'

// 创建 localStorage 实例
const storage = createBrowserStoradapt('localStorage')

// 简单操作
storage.set('username', 'Alice')
storage.get('username') // 'Alice'

// 对象操作
storage.set('user', {
  name: 'Alice',
  age: 30,
  email: 'alice@example.com'
})

// 深度路径访问
storage.get('user.name') // 'Alice'
storage.set('user.age', 31)
```

### 自定义存储适配器

```typescript
import { createStoradapt } from 'storadapt'

// 创建自定义适配器
const adapter = {
  getItem: (key) => {
    /* 你的实现 */
  },
  setItem: (key, value) => {
    /* 你的实现 */
  },
  removeItem: (key) => {
    /* 你的实现 */
  },
  clear: () => {
    /* 你的实现 */
  },
  length: () => {
    /* 你的实现 */
  },
  key: (index) => {
    /* 你的实现 */
  }
}

const storage = createStoradapt(adapter)
```

## 📖 API 文档

### 基础操作

#### `get<T>(key: string, options?: GetOptions<T>): T | null`

获取存储值，自动进行 JSON 反序列化。

```typescript
// 简单获取
const name = storage.get('username')

// 带默认值
const theme = storage.get('theme', { defaultValue: 'light' })

// 深度路径访问
const email = storage.get('user.profile.email')

// 数组索引访问
const firstItem = storage.get('items.0')
```

#### `set(key: string, value: any, options?: SetOptions): void`

存储值，自动进行序列化。

```typescript
// 简单设置
storage.set('username', 'Alice')

// 对象设置
storage.set('user', { name: 'Alice', age: 30 })

// 深度路径设置
storage.set('user.profile.email', 'alice@example.com')

// 自动创建中间路径
storage.set('user.settings.theme', 'dark', { createPath: true })

// 数组操作
storage.set('items.0', 'first item')
```

#### `remove(key: string): void`

删除键或深度路径属性。

```typescript
// 删除整个键
storage.remove('username')

// 删除深度属性
storage.remove('user.profile.email')

// 删除数组元素
storage.remove('items.0')
```

#### `has(key: string): boolean`

检查键或深度路径是否存在。

```typescript
storage.has('username') // true 或 false
storage.has('user.profile.email') // true 或 false
```

#### `clear(): void`

清空所有存储。

```typescript
storage.clear()
```

#### `key(index: number): string | null`

根据索引获取键名。

```typescript
const firstKey = storage.key(0)
```

#### `length: number`

获取存储项的数量。

```typescript
const count = storage.length
```

### 配置选项

#### GetOptions

```typescript
interface GetOptions<T> {
  defaultValue?: T // 键不存在时的默认值
}
```

#### SetOptions

```typescript
interface SetOptions {
  createPath?: boolean // 自动创建中间对象（默认：true）
}
```

## 🎯 使用示例

### 用户配置管理

```typescript
// 初始化用户数据
storage.set('user:123', {
  id: 123,
  name: 'Alice',
  email: 'alice@example.com',
  preferences: {
    theme: 'dark',
    language: 'zh'
  }
})

// 读取用户名
const name = storage.get('user:123.name') // 'Alice'

// 更新主题偏好
storage.set('user:123.preferences.theme', 'light')

// 添加新的偏好设置
storage.set('user:123.preferences.notifications', true)

// 删除特定属性
storage.remove('user:123.preferences.notifications')
```

### 购物车

```typescript
// 初始化购物车
storage.set('cart', {
  items: [],
  total: 0
})

// 添加商品
storage.set('cart.items', [
  { id: 1, name: '商品 A', price: 10, quantity: 2 },
  { id: 2, name: '商品 B', price: 15, quantity: 1 }
])

// 更新第一个商品的数量
storage.set('cart.items.0.quantity', 3)

// 获取第二个商品的名称
const itemName = storage.get('cart.items.1.name') // '商品 B'

// 删除第二个商品
storage.remove('cart.items.1')
```

### 配置管理

```typescript
// 初始化空配置
storage.set('config', {})

// 添加嵌套配置，自动创建路径
storage.set('config.app.name', 'MyApp', { createPath: true })
storage.set('config.app.version', '1.0.0')
storage.set('config.features.darkMode', true, { createPath: true })

// 读取配置
const appName = storage.get('config.app.name') // 'MyApp'
const darkMode = storage.get('config.features.darkMode') // true
```

### 数组操作

```typescript
// 初始化数组
storage.set('todos', [
  { id: 1, text: '买牛奶', done: false },
  { id: 2, text: '遛狗', done: true }
])

// 通过索引访问
const firstTodo = storage.get('todos.0') // { id: 1, text: '买牛奶', done: false }

// 更新属性
storage.set('todos.0.done', true)

// 添加新项（使用路径创建）
storage.set('todos.2', { id: 3, text: '读书', done: false })

// 获取特定属性
const secondTodoText = storage.get('todos.1.text') // '遛狗'
```

### 复杂嵌套结构

```typescript
storage.set('organization', {
  company: {
    departments: [
      {
        name: '工程部',
        teams: [
          {
            name: '前端团队',
            members: [
              { name: 'Alice', role: '组长' },
              { name: 'Bob', role: '开发者' }
            ]
          }
        ]
      }
    ]
  }
})

// 访问深层嵌套数据
const deptName = storage.get('organization.company.departments.0.name') // '工程部'
const memberName = storage.get(
  'organization.company.departments.0.teams.0.members.1.name'
) // 'Bob'

// 更新深层嵌套数据
storage.set(
  'organization.company.departments.0.teams.0.members.0.role',
  '高级组长'
)
```

## 🔧 高级用法

### 自定义内存适配器

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

### Node.js 环境使用 node-localstorage

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

## 🎨 TypeScript 支持

Storadapt 使用 TypeScript 编写，提供完整的类型支持：

```typescript
interface User {
  id: number
  name: string
  email: string
}

// 类型安全的获取
const user = storage.get<User>('user')

// 类型安全的设置
storage.set('user', {
  id: 1,
  name: 'Alice',
  email: 'alice@example.com'
})

// 类型推导
const name = storage.get<string>('user.name')
```

## ⚠️ 重要说明

### 深度路径行为

1. **路径自动创建**：默认情况下，`createPath` 为 `false`。不会自动创建中间对象或数组。

```typescript
// 如果 `user.settings` 不存在，则会抛出错误或静默失败
storage.set('user.settings.theme', 'dark')

// 启用自动创建
storage.set('user.settings.theme', 'dark', { createPath: true })
```

2. **数组索引**：数字段被视为数组索引。

```typescript
storage.set('items', [])
storage.set('items.0', 'first') // items[0] = 'first'
storage.set('items.1', 'second') // items[1] = 'second'
```

3. **类型不匹配**：如果路径类型与数据类型不匹配，操作将失败。

```typescript
storage.set('user', { name: 'Alice' })
storage.get('user.name.age') // 返回 null（name 是字符串，不是对象）
```

### 错误处理

Storadapt 会优雅地处理错误并记录到控制台：

```typescript
// 不存在的路径返回 null
const value = storage.get('non.existent.path') // null

// 使用默认值
const value = storage.get('non.existent.path', { defaultValue: 'default' }) // 'default'

// 无效操作会被记录但不会抛出异常
storage.set('user', 'string')
storage.set('user.profile.name', 'Alice') // 记录错误，跳过操作
```

## 🎯 适用场景

Storadapt 非常适合以下场景：

- 🌐 **浏览器应用** - localStorage/sessionStorage 的封装
- 📱 **移动应用** - AsyncStorage 等适配
- 🧪 **测试环境** - 内存存储模拟
- 🔧 **配置管理** - 复杂配置的存储和访问
- 🛒 **状态持久化** - 应用状态的本地存储
- 📊 **数据缓存** - 结构化数据的缓存方案

## 🔄 与其他方案对比

### 传统 localStorage

```typescript
// ❌ 传统方式
const user = JSON.parse(localStorage.getItem('user') || '{}')
user.profile.email = 'new@example.com'
localStorage.setItem('user', JSON.stringify(user))

// ✅ 使用 Storadapt
storage.set('user.profile.email', 'new@example.com', { createPath: true })
```

### 优势

- 无需手动序列化/反序列化
- 深度路径访问更直观
- 自动类型转换
- 更好的错误处理
- TypeScript 支持

## 📄 许可证

[MIT](./LICENSE) 许可证 © 2025-至今 [king3](https://github.com/coderking3)

## 🤝 贡献

欢迎贡献、问题和功能请求!

请随时查看 [issues 页面](https://github.com/OpenKnights/coderking3/issues)。
