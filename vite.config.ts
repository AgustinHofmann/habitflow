import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    // Los tests unitarios cubren logica pura (rachas, porcentajes), por eso alcanza el entorno node.
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
