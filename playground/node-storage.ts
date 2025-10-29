/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable no-console */
import { LocalStorage } from 'node-localstorage'
import { createStoradapt } from '../src'

const nodeLocalStorage = new LocalStorage('../.cache')

const nodeStoradapt = createStoradapt({
  getItem: (key: string) => nodeLocalStorage.getItem(key),
  setItem: (key: string, value: any) => nodeLocalStorage.setItem(key, value),
  removeItem: (key: string) => nodeLocalStorage.removeItem(key),
  clear: nodeLocalStorage.clear,
  key: nodeLocalStorage.key,
  length: () => nodeLocalStorage.length
})

if (!nodeStoradapt.get('testObj')) {
  nodeStoradapt.set('testObj', {
    users: [
      {
        age: 18,
        name: 'Jack',
        sex: 'male'
      },
      {
        age: 18,
        name: 'Tony',
        sex: 'female'
      }
    ]
  })
}

const testSetRaw = () => {
  console.log(`🚀 ~ testSetRaw before:`, nodeStoradapt.get('testObj'))

  nodeStoradapt.set('testObj.users.1.age', 22)

  console.log(`🚀 ~ testSetRaw after:`, nodeStoradapt.get('testObj'))
}

const testSetNotPath = () => {
  console.log(`🚀 ~ testSetNotPath before:`, nodeStoradapt.get('testObj'))

  nodeStoradapt.set('testObj.backets.2.age', 'ling3')

  console.log(`🚀 ~ testSetNotPath after:`, nodeStoradapt.get('testObj'))
}

const testSetCreatePath = () => {
  console.log(`🚀 ~ testSetCreatePath before:`, nodeStoradapt.get('testObj'))

  nodeStoradapt.set('testObj.nameList.1.age', 'ling3', { createPath: true })
  nodeStoradapt.set('testObj.nameList.3.age', 18, { createPath: true })

  console.log(`🚀 ~ testSetCreatePath after:`, nodeStoradapt.get('testObj'))
}

const testGetRaw = () => {
  console.log(
    `🚀 ~ testGetRaw:`,
    nodeStoradapt.get('testObj.users.0.msg', {
      defaultValue: 'My name is Jack'
    })
  )
}

const testGetNotPath = () => {
  console.log(
    `🚀 ~ testGetNotPath:`,
    nodeStoradapt.get('testObj.nameList.2.age', {
      // defaultValue: '哈哈哈哈哈哈'
    })
  )
}

const testStorageLength = () => {
  console.log(`🚀 ~ testStorageLength:`, nodeStoradapt.length)
}

const testKeyRaw = () => {
  console.log(`🚀 ~ testKeyRaw:`, nodeStoradapt.key(2, { defaultValue: '666' }))
}

const testKeyDefaultValue = () => {
  console.log(`🚀 ~ testKeyDefaultValue:`, nodeStoradapt.length)
}

// 设置对象
// testSetRaw()
/* 
  before: {
    users: [
      { age: 18, name: 'Jack', sex: 'male' },
      { age: 18, name: 'Tony', sex: 'female' }
    ]
  }

  after: {
    users: [
      { age: 18, name: 'Jack', sex: 'male' },
      { age: 22, name: 'Tony', sex: 'female' }
    ]
  }
*/

// 设置路径不存在对象
// testSetNotPath()
/* 
  Storadapt.set error for key "testObj.backets.2.age":
    Error: Property "backets" does not exist at backets
*/

// 设置路径不存在创建路径对象
// testSetCreatePath()
/* 
  before: {
    users: [
      { age: 18, name: 'Jack', sex: 'male' },
      { age: 18, name: 'Tony', sex: 'female' }
    ]
  }

  after: {
    users: [
      { age: 18, name: 'Jack', sex: 'male' },
      { age: 18, name: 'Tony', sex: 'female' }
    ],
    nameList: [ null, { age: 'ling3' }, null, { age: 18 } ]
  }
*/

// 正常获取值
// testGetRaw()
/* 
 testGetRaw: { age: 18, name: 'Tony', sex: 'female' }
*/

// 获取路径不存在的对象
// testGetNotPath()
/* 
  Storadapt.get error for key "testObj.nameList.2.age":
    Error: Property "nameList" does not exist at nameList
*/

// 获取所有缓存数量
// testStorageLength()

// 通过下标获取值
testKeyRaw()

// 通过下标获取值-设置默认值
// testKeyDefaultValue()
