import { test, expect } from '@playwright/test'

test('un usuario no autenticado es redirigido al login al entrar a una ruta protegida', async ({ page }) => {
  // Intenta acceder al dashboard ("/") sin sesion iniciada.
  await page.goto('/')

  // ProtectedRoute debe redirigir a /login.
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible()
})
