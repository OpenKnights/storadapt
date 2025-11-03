import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Test timeout (milliseconds)
    testTimeout: 10000,

    // Watch mode
    watch: false
  }
})
