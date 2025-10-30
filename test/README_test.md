# Storadapt 测试文档

这个目录包含了 storadapt 库的完整测试套件。

## 测试文件结构

```
test/
├── adapter.test.ts       # 适配器创建和基本操作测试
├── storage.test.ts       # Storadapt 核心功能测试
├── util.test.ts          # 工具函数测试
├── integration.test.ts   # 端到端集成测试
├── index.test.ts         # 模块导出测试
└── README_test.md            # 本文件
```

## 测试覆盖范围

### adapter.test.ts

测试适配器的创建和基本功能：

- ✅ `createBrowserStorageAdapter` - 创建浏览器存储适配器
- ✅ localStorage 和 sessionStorage 支持
- ✅ 环境检测和错误处理
- ✅ 基本 CRUD 操作（getItem, setItem, removeItem, clear）
- ✅ 自定义适配器实现

### storage.test.ts

测试 Storadapt 类的核心功能：

- ✅ 基本操作：get, set, remove, clear, has
- ✅ 多种数据类型支持（string, number, object, array, boolean, null）
- ✅ 深度路径操作：
  - 对象属性访问：`user.profile.email`
  - 数组索引访问：`items.0.name`
  - 混合路径：`users.0.tags.1`
- ✅ 深度路径创建（createPath 选项）
- ✅ 深度路径删除
- ✅ 默认值支持
- ✅ length 和 key 方法
- ✅ 边缘情况处理
- ✅ 错误处理和恢复

### util.test.ts

测试工具函数：

- ✅ `isString` - 字符串类型检测
- ✅ `isObject` - 对象类型检测（排除 null 和数组）
- ✅ `isArrayIndex` - 数组索引验证
- ✅ `isJsonString` - JSON 字符串验证
- ✅ `parsePath` - 路径字符串解析
- ✅ `traversePath` - 对象/数组路径遍历
  - 对象遍历
  - 数组遍历
  - 路径创建（createPath）
  - 错误处理（shouldThrowError）
  - 类型验证
  - 复杂场景（混合对象和数组）

### integration.test.ts

端到端集成测试：

- ✅ `createStoradapt` 函数测试
- ✅ 完整工作流测试：
  - 用户配置管理
  - 购物车操作
  - 设置配置
- ✅ 多实例场景
- ✅ 复杂数据结构
- ✅ 性能测试（大量数据、大对象）
- ✅ 错误恢复
- ✅ 边缘情况集成

### index.test.ts

模块导出测试：

- ✅ 模块导出完整性
- ✅ `createStoradapt` - 支持适配器对象和工厂函数
- ✅ `createBrowserStoradapt` - 浏览器存储创建
- ✅ `Storadapt` 类直接使用
- ✅ 类型导出（StorageAdapter）
- ✅ 不同创建方式的集成

## 运行测试

```bash
# 安装依赖
pnpm install

# 运行所有测试
pnpm test

# 运行特定测试文件
pnpm test adapter.test.ts
pnpm test storage.test.ts
pnpm test util.test.ts
pnpm test integration.test.ts
pnpm test index.test.ts

# 运行测试并查看覆盖率
pnpm test -- --coverage

# 监听模式（开发时使用）
pnpm test -- --watch

# 运行单个测试用例
pnpm test -- -t "should create an adapter"

# UI 模式
pnpm test -- --ui
```

## 测试统计

| 测试文件            | 测试用例数 | 覆盖功能         |
| ------------------- | ---------- | ---------------- |
| adapter.test.ts     | ~15        | 适配器创建和操作 |
| storage.test.ts     | ~50        | 核心存储功能     |
| util.test.ts        | ~45        | 工具函数         |
| integration.test.ts | ~25        | 集成场景         |
| index.test.ts       | ~20        | 模块导出         |
| **总计**            | **~155**   | **完整功能覆盖** |

## 测试模式说明

### 1. 单元测试

- **adapter.test.ts** - 测试单个适配器功能
- **util.test.ts** - 测试独立工具函数

### 2. 功能测试

- **storage.test.ts** - 测试 Storadapt 类的所有功能

### 3. 集成测试

- **integration.test.ts** - 测试完整工作流和多组件交互
- **index.test.ts** - 测试模块导出和不同创建方式的集成

## 关键测试场景

### 深度路径操作

```typescript
// 对象路径
storage.set('user', { name: 'John', age: 30 })
storage.get('user.name') // 'John'

// 数组索引
storage.set('items', ['a', 'b', 'c'])
storage.get('items.1') // 'b'

// 混合路径
storage.set('data', { users: [{ name: 'Alice' }] })
storage.get('data.users.0.name') // 'Alice'
```

### 路径创建

```typescript
storage.set('config.theme.color', 'dark', { createPath: true })
// 自动创建 config -> theme -> color 路径
```

### 默认值

```typescript
storage.get('non-existent', { defaultValue: 'default' })
// 返回 'default'
```

### 自定义适配器

```typescript
const customAdapter: StorageAdapter = {
  getItem: (key) => '...' /* ... */,
  setItem: (key, value) => {} /* ... */
  // ...
}
const storage = createStoradapt(customAdapter)
```

## 注意事项

### Mock 对象

测试使用简单的内存存储作为 mock：

```typescript
const store: Record<string, string> = {}
const adapter: StorageAdapter = {
  getItem: (key) => store[key] || null,
  setItem: (key, value) => {
    store[key] = value
  }
  // ...
}
```

### 浏览器环境模拟

```typescript
Object.defineProperty(global, 'window', {
  value: {
    localStorage: mockStorage,
    sessionStorage: mockStorage
  }
})
```

### 错误处理

测试包含大量错误场景验证，确保库在异常情况下稳定运行。

## 添加新测试

遵循以下原则：

1. **独立性** - 每个测试用例应该独立，使用 `beforeEach` 清理环境
2. **描述性** - 测试名称应清晰描述测试内容
3. **完整性** - 测试正常流程和边缘情况
4. **可维护性** - 避免重复代码，使用辅助函数

示例：

```typescript
describe('New Feature', () => {
  let storage: Storadapt

  beforeEach(() => {
    // 设置测试环境
  })

  it('should handle normal case', () => {
    // 测试正常情况
  })

  it('should handle edge case', () => {
    // 测试边缘情况
  })

  it('should handle error gracefully', () => {
    // 测试错误处理
  })
})
```

## 持续集成

这些测试适合在 CI/CD 流程中运行：

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: pnpm test

- name: Upload coverage
  run: pnpm test -- --coverage
```

## 调试技巧

```bash
# 只运行失败的测试
pnpm test -- --reporter=verbose

# 调试特定测试
pnpm test -- -t "specific test name" --reporter=verbose

# 查看详细错误信息
pnpm test -- --reporter=verbose --no-coverage
```

## 性能基准

集成测试包含性能测试：

- 1000 个键的读写操作
- 大对象（1000 个元素数组）的处理
- 100 次快速连续操作

这些测试确保库在高负载下的性能表现。

## 贡献指南

添加新功能时，请确保：

1. ✅ 为新功能编写测试
2. ✅ 所有现有测试通过
3. ✅ 代码覆盖率不降低
4. ✅ 更新相关文档
