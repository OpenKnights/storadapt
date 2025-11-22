import type { BrowserStorageType, StorageAdapter } from './types'

import { createBrowserStorageAdapter } from './adapter'
import { Storadapt } from './storage'

const createStoradapt = (
  adapter: StorageAdapter | (() => StorageAdapter)
): Storadapt => {
  const adapterInstance = typeof adapter === 'function' ? adapter() : adapter
  return new Storadapt(adapterInstance)
}

const createBrowserStoradapt = (type: BrowserStorageType): Storadapt => {
  return new Storadapt(createBrowserStorageAdapter(type))
}

export { createBrowserStoradapt, createStoradapt, Storadapt }
export type { StorageAdapter }
