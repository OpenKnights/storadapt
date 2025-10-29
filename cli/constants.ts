// Reserved parameter names that Node.js will consume
export const NODE_RESERVED_NAMES = ['watch', 'version'] as const

export type NodeReservedName = (typeof NODE_RESERVED_NAMES)[number]
