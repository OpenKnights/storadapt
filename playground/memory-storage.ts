import superjson from 'superjson'

// import { createStoradapt } from '../src'
// import { createMemoryAdapter } from './setup'

// const { store, adapter } = createMemoryAdapter()

// const memoryStoradapt = createStoradapt(adapter)

// memoryStoradapt.set('testArr.3.name', 'king3', { createPath: true })

// console.log(`🚀 ~ store:`, store)

const stringifyStr = superjson.stringify([
  undefined,
  undefined,
  undefined,
  undefined,
  666
])

console.log('test stringify', stringifyStr)
console.log('test parse', superjson.parse(stringifyStr))
// test stringify [null,null,null,null,666]

const testa = JSON.parse(stringifyStr)
console.log(`🚀 ~ testa:`, testa)
