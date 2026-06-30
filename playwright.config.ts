import { defineConfig, devices } from '@playwright/test'

// La app exige variables de Supabase para arrancar. Para el E2E alcanza con valores
// dummy: getSession() lee la sesion local (sin red), asi que el usuario queda sin
// autenticar y ProtectedRoute redirige al login, que es justo lo que probamos.
const SUPABASE_ENV = {
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'https://dummy.supabase.co',
  VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || 'dummy-anon-key',
}

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: SUPABASE_ENV,
  },
})
