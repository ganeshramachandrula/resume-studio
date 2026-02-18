import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    exclude: ['node_modules', '.next'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**', 'src/app/api/**', 'src/store/**'],
      exclude: ['src/test/**', '**/*.test.*', '**/mock-*'],
      reporter: ['text', 'text-summary', 'lcov'],
    },
    testTimeout: 10000,
    pool: 'forks',
  },
})
